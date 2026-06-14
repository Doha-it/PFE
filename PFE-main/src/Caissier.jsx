import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { generateFacturePDF } from './utils/generatePDF';
import {
  creerVente, ajouterArticle, modifierQuantiteArticle,
  validerVente, annulerVente, genererFacture,
  getTousProduits,
} from "./services/api";
import "./Caissier.css";

export default function CaissierApp({ nom, userId, onLogout }) {
  const [page, setPage] = useState("scan");
  const [scanning, setScanning] = useState(false);
  const [venteId, setVenteId] = useState(null);
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Produits
  const [produits, setProduits] = useState([]);
  const [produitsLoading, setProduitsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("nom");
  const [sortDir, setSortDir] = useState("asc");

  const [codeManuel, setCodeManuel] = useState("");


  const lastScannedRef = useRef("");      // ← ajoute
  const lastTimeRef = useRef(0);          // ← ajoute
  const scannerRef = useRef(null);

  useEffect(() => {
    getTousProduits()
      .then(data => {
        console.log("Premier produit :", data[0]);
        setProduits(data);
      })
      .catch(console.error)
      .finally(() => setProduitsLoading(false));
  }, []);

  const flash = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  // Normalise : retire accents + minuscules
  const normalize = (str) =>
    str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";

  const produitsFiltres = produits
    .filter(p =>
      normalize(p.nom).includes(normalize(search)) ||
      normalize(p.codeBarres).includes(normalize(search)) ||
      normalize(p.nomCategorie || "").includes(normalize(search))
    )
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "prix" || sortField === "quantite") {
        va = parseFloat(va); vb = parseFloat(vb);
      } else {
        va = normalize(String(va)); vb = normalize(String(vb));
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  // Décrémente le stock affiché localement pour un produit donné
  const decrementerStockLocal = (codeBarres, qte = 1) => {
    setProduits(prev => prev.map(p =>
      p.codeBarres === codeBarres
        ? { ...p, quantite: Math.max(0, p.quantite - qte) }
        : p
    ));
  };

  // Réincrémente le stock affiché localement pour un produit donné
  const incrementerStockLocal = (codeBarres, qte = 1) => {
    setProduits(prev => prev.map(p =>
      p.codeBarres === codeBarres
        ? { ...p, quantite: p.quantite + qte }
        : p
    ));
  };

  // Stock disponible affiché (local) pour un code-barres donné
  const getStockDisponible = (codeBarres) =>
    produits.find(p => p.codeBarres === codeBarres)?.quantite ?? 0;

  // Resynchronise le stock depuis le backend (ex: après annulation)
  const resyncProduits = () => {
    getTousProduits()
      .then(setProduits)
      .catch(console.error);
  };

  // Ajouter un produit via la table (sans scan)
  const handleAjouterProduit = async (produit) => {
    setLoading(true);
    try {
      let currentVenteId = venteId;
      if (!currentVenteId) {
        const v = await creerVente(userId);
        currentVenteId = v.id;
        setVenteId(v.id);
      }
      const detail = await ajouterArticle(currentVenteId, produit.codeBarres, 1);
      setArticles(prev => {
        const ex = prev.find(a => a.codeBarres === produit.codeBarres);
        if (ex) {
          return prev.map(a =>
            a.codeBarres === produit.codeBarres
              ? { ...a, quantite: a.quantite + 1, sousTotal: (parseFloat(a.prix) * (a.quantite + 1)).toFixed(2) }
              : a
          );
        }
        return [...prev, detail];
      });
      setTotal(t => parseFloat((t + parseFloat(detail.prix)).toFixed(2)));
      decrementerStockLocal(produit.codeBarres, 1);
      flash("✅ " + detail.nomProduit + " ajouté !");
    } catch {
      flash("❌ Produit introuvable !");
    } finally {
      setLoading(false);
    }
  };

  // Démarrer scan
  const startScan = async () => {
    setLoading(true);
    let currentVenteId = venteId;
    if (!currentVenteId) {
      try {
        const v = await creerVente(userId);
        currentVenteId = v.id;
        setVenteId(v.id);
      } catch {
        flash("❌ Erreur création vente !");
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setScanning(true);
    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode("caissier-qr");
        scannerRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 300, height: 150 } },

        async (code) => {
          const now = Date.now();
          if (code === lastScannedRef.current && now - lastTimeRef.current < 2000) return;
          lastScannedRef.current = code;
          lastTimeRef.current = now;
          await handleCodeScan(code, currentVenteId);
        },


          () => {}
        );
      } catch {
        flash("❌ Webcam inaccessible !");
        setScanning(false);
      }
    }, 300);
  };

  const stopScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => { scannerRef.current = null; }).catch(() => {});
    }
    setScanning(false);
  };

  const handleCodeScan = async (code, currentVenteId) => {
    setLoading(true);
    try {
      const detail = await ajouterArticle(currentVenteId, code, 1);
      setArticles(prev => {
        const ex = prev.find(a => a.codeBarres === code);
        if (ex) {
          return prev.map(a =>
            a.codeBarres === code
              ? { ...a, quantite: a.quantite + 1, sousTotal: (parseFloat(a.prix) * (a.quantite + 1)).toFixed(2) }
              : a
          );
        }
        return [...prev, detail];
      });
      setTotal(t => parseFloat((t + parseFloat(detail.prix)).toFixed(2)));
      decrementerStockLocal(code, 1);
      flash("✅ " + detail.nomProduit + " ajouté !");
    } catch {
      flash("❌ Produit introuvable !");
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async () => {
    if (!venteId || articles.length === 0) { flash("❌ Aucun article !"); return; }
    if (!confirm(`Valider la vente de ${total.toFixed(2)} DH ?`)) return;
    setLoading(true);
    try {
      await validerVente(venteId);
      const f = await genererFacture(venteId);
      setFacture({ ...f, articles, total });
      setPage("facture");
    } catch {
      flash("❌ Erreur validation !");
    } finally { setLoading(false); }
  };

  const handleAnnuler = async () => {
    if (!confirm("Annuler cette vente ?")) return;
    if (venteId) { try { await annulerVente(venteId); } catch (e) { console.error(e); } }
    resetVente();
    // Resynchronise le stock affiché (le backend peut avoir réincrémenté le stock)
    resyncProduits();
  };

  const resetVente = () => {
    setVenteId(null); setArticles([]); setTotal(0);
    setFacture(null); setPage("scan"); stopScan();
  };

  return (
    <div className="ca-root">
      {/* Header */}
      <header className="ca-header">
        <div className="ca-header-left">
          <span className="ca-logo">📚</span>
          <div>
            <span className="ca-app">LibrairyPro</span>
            <span className="ca-role">Caissier</span>
          </div>
        </div>
        <div className="ca-header-center">
          <span className="ca-user">👨‍💻 {nom}</span>
        </div>
        <button className="ca-logout" onClick={onLogout}>🚪</button>
      </header>

      {/* Tabs */}
      <div className="ca-tabs">
        {[
          { key: "scan", label: "📷 Scanner" },
          { key: "panier", label: `🛒 Panier (${articles.length})` },
          { key: "facture", label: "🧾 Facture" },
        ].map(t => (
          <button key={t.key}
            className={`ca-tab ${page === t.key ? "ca-tab--active" : ""}`}
            onClick={() => setPage(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {msg && <div className="ca-msg">{msg}</div>}

      <div className="ca-body">

        {/* ═══ PAGE SCAN ═══ */}
          {page === "scan" && (
  <div className="ca-scan-split">

    {/* ── GAUCHE : catalogue ── */}
    <div className="ca-scan-right">
      <div className="ca-catalogue-header">
        <h3 className="ca-catalogue-title">📦 Catalogue produits</h3>
        <div className="ca-catalogue-filters">
          <div className="ca-search-wrap">
            <span className="ca-search-icon">🔍</span>
            <input
              className="ca-search-input"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="ca-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="ca-sort-wrap">
            <select className="ca-sort-select" value={sortField}
              onChange={e => { setSortField(e.target.value); setSortDir("asc"); }}>
              <option value="nom">Nom</option>
              <option value="prix">Prix</option>
            </select>
            <button className="ca-sort-dir-btn"
              onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
              {sortDir === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      <div className="ca-catalogue-table-wrap">
        {produitsLoading ? (
          <div className="ca-catalogue-loading">⏳ Chargement des produits...</div>
        ) : produitsFiltres.length === 0 ? (
          <div className="ca-catalogue-empty">Aucun produit trouvé</div>
        ) : (
          <table className="ca-catalogue-table">
            <thead>
              <tr>
                <th className="ca-catalogue-th" onClick={() => toggleSort("nom")} style={{ cursor: "pointer" }}>Nom{sortIcon("nom")}</th>
                <th className="ca-catalogue-th">Code-barres</th>
                <th className="ca-catalogue-th">Catégorie</th>
                <th className="ca-catalogue-th" onClick={() => toggleSort("prix")} style={{ cursor: "pointer" }}>Prix{sortIcon("prix")}</th>
                <th className="ca-catalogue-th" onClick={() => toggleSort("quantite")} style={{ cursor: "pointer" }}>Stock{sortIcon("quantite")}</th>
                <th className="ca-catalogue-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {produitsFiltres.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? "ca-catalogue-row-even" : "ca-catalogue-row-odd"}>
                  <td className="ca-catalogue-td ca-catalogue-nom">{p.nom}</td>
                  <td className="ca-catalogue-td ca-catalogue-code">{p.codeBarres}</td>
                  <td className="ca-catalogue-td">
                    <span className="ca-catalogue-cat">{p.iconeCategorie} {p.nomCategorie  || "—"}</span>
                  </td>
                  <td className="ca-catalogue-td ca-catalogue-prix">{parseFloat(p.prix).toFixed(2)} DH</td>
                  <td className="ca-catalogue-td">
                    <span className={`ca-catalogue-stock ${p.quantite <= 5 ? "ca-stock-low" : p.quantite <= 15 ? "ca-stock-mid" : "ca-stock-ok"}`}>
                      {p.quantite}
                    </span>
                  </td>
                  <td className="ca-catalogue-td">
                    <button className="ca-catalogue-add-btn"
                      onClick={() => handleAjouterProduit(p)}
                      disabled={loading || p.quantite === 0}>
                      {p.quantite === 0 ? "Rupture" : "+ Ajouter"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="ca-catalogue-footer">
        {produitsFiltres.length} produit(s) affiché(s)
      </div>
    </div>

    {/* ── DROITE : caméra ── */}
    <div className="ca-scan-left">
      <div className="ca-scan-info">
        <h2>Scanner un produit</h2>
        <p>Vente #{venteId || "..."} — {articles.length} article(s) — {total.toFixed(2)} DH</p>
      </div>

      <div className="ca-camera-wrap">
        <div style={{ display: page === "scan" ? "block" : "none" }}>
          <div id="caissier-qr" className="ca-camera" />
        </div>
        {!scanning && (
          <div className="ca-camera-overlay">
            <span>📷</span>
            <p>Caméra inactive</p>
          </div>
        )}
      </div>

      <div className="ca-scan-btns">
        {!scanning ? (
          <button className="ca-btn-scan" onClick={startScan} disabled={loading}>
            {loading ? "⏳ Chargement..." : "📷 Démarrer le scan"}
          </button>
        ) : (
          <button className="ca-btn-stop" onClick={stopScan}>⏹️ Arrêter le scan</button>
        )}

          <div className="ca-code-manuel-wrap">
      <input
        className="ca-code-manuel-input"
        placeholder="Saisir un code-barres..."
        value={codeManuel}
        onChange={e => setCodeManuel(e.target.value)}
        onKeyDown={async e => {
          if (e.key === "Enter" && codeManuel.trim()) {
            let currentVenteId = venteId;
            if (!currentVenteId) {
              const v = await creerVente(userId);
              currentVenteId = v.id;
              setVenteId(v.id);
            }
            await handleCodeScan(codeManuel.trim(), currentVenteId);
            setCodeManuel("");
          }
        }}
      />
      <button
        className="ca-code-manuel-btn"
        disabled={!codeManuel.trim() || loading}
        onClick={async () => {
          let currentVenteId = venteId;
          if (!currentVenteId) {
            const v = await creerVente(userId);
            currentVenteId = v.id;
            setVenteId(v.id);
          }
          await handleCodeScan(codeManuel.trim(), currentVenteId);
          setCodeManuel("");
        }}
      >
              ➕ Ajouter
            </button>
          </div>

              {articles.length > 0 && (
                <button className="ca-btn-panier" onClick={() => setPage("panier")}>
                  🛒 Voir le panier →
                </button>
              )}
            </div>

          </div>

        </div>
      )}

        {/* ═══ PAGE PANIER ═══ */}
        {page === "panier" && (
          <div className="ca-panier-page">
            <h2 className="ca-panier-title">🛒 Récapitulatif — Vente #{venteId}</h2>
            {articles.length === 0 ? (
              <div className="ca-empty">
                <span>🛒</span>
                <p>Panier vide</p>
                <button className="ca-btn-scan" onClick={() => setPage("scan")}>Commencer à scanner</button>
              </div>
            ) : (
              <>
                <div className="ca-articles">

                {articles.map((a, i) => (
                <div key={i} className="ca-article-card">
                  <div className="ca-article-info">
                    <p className="ca-article-nom">{a.nomProduit}</p>
                    <p className="ca-article-code">{a.codeBarres}</p>
                  </div>
                  <div className="ca-article-right">
                    <div className="ca-qte-control">
                      <button className="ca-qte-btn" onClick={async () => {
                        if (a.quantite <= 1) return;
                        const nouvelleQte = a.quantite - 1;
                        // Mise à jour optimiste de l'UI
                        setArticles(prev => {
                          const updated = prev.map(art =>
                            art.codeBarres === a.codeBarres
                              ? { ...art, quantite: nouvelleQte,
                                  sousTotal: (parseFloat(art.prix) * nouvelleQte).toFixed(2) }
                              : art
                          );
                          setTotal(parseFloat(updated.reduce((s, art) => s + parseFloat(art.sousTotal), 0).toFixed(2)));
                          return updated;
                        });
                        incrementerStockLocal(a.codeBarres, 1);
                        try {
                          await modifierQuantiteArticle(venteId, a.codeBarres, nouvelleQte);
                        } catch {
                          flash("❌ Erreur mise à jour quantité !");
                        }
                      }}>−</button>
                      <span className="ca-qte-value">{a.quantite}</span>
                      <button className="ca-qte-btn"
                        disabled={getStockDisponible(a.codeBarres) <= 0}
                        onClick={async () => {
                        if (getStockDisponible(a.codeBarres) <= 0) {
                          flash("❌ Stock insuffisant !");
                          return;
                        }
                        const nouvelleQte = a.quantite + 1;
                        // Mise à jour optimiste de l'UI
                        setArticles(prev => {
                          const updated = prev.map(art =>
                            art.codeBarres === a.codeBarres
                              ? { ...art, quantite: nouvelleQte,
                                  sousTotal: (parseFloat(art.prix) * nouvelleQte).toFixed(2) }
                              : art
                          );
                          setTotal(parseFloat(updated.reduce((s, art) => s + parseFloat(art.sousTotal), 0).toFixed(2)));
                          return updated;
                        });
                        decrementerStockLocal(a.codeBarres, 1);
                        try {
                          await modifierQuantiteArticle(venteId, a.codeBarres, nouvelleQte);
                        } catch {
                          flash("❌ Erreur mise à jour quantité !");
                        }
                      }}>+</button>
                    </div>
                    <span className="ca-article-prix">{a.sousTotal} DH</span>
                    <button className="ca-qte-delete" onClick={async () => {
                      const updated = articles.filter(art => art.codeBarres !== a.codeBarres);
                      setArticles(updated);
                      setTotal(parseFloat(updated.reduce((s, art) => s + parseFloat(art.sousTotal), 0).toFixed(2)));
                      incrementerStockLocal(a.codeBarres, a.quantite);
                      try {
                        await modifierQuantiteArticle(venteId, a.codeBarres, 0);
                      } catch {
                        flash("❌ Erreur suppression article !");
                      }
                    }}>🗑️</button>
                  </div>
                </div>
              ))}
                </div>
                <div className="ca-total-bar">
                  <div className="ca-total-row"><span>Articles :</span><span>{articles.length}</span></div>
                  <div className="ca-total-row ca-total-big"><span>TOTAL :</span><span>{total.toFixed(2)} DH</span></div>
                </div>
                <div className="ca-panier-btns">
                  <button className="ca-btn-more" onClick={() => setPage("scan")}>📷 Scanner plus</button>
                  <button className="ca-btn-annuler" onClick={handleAnnuler}>❌ Annuler</button>
                  <button className="ca-btn-valider" onClick={handleValider} disabled={loading}>
                    {loading ? "⏳..." : "✅ Valider la vente"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ PAGE FACTURE ═══ */}
        {page === "facture" && (
          <div className="ca-facture-page">
            {!facture ? (
              <div className="ca-empty"><span>🧾</span><p>Aucune facture générée</p></div>
            ) : (
              <div className="ca-facture-card">
                <div className="ca-facture-header">
                  <span className="ca-facture-icon">🧾</span>
                  <h2>FACTURE #{facture.id}</h2>
                  <p>{new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="ca-facture-articles">
                  {facture.articles?.map((a, i) => (
                    <div key={i} className="ca-facture-ligne">
                      <div>
                        <p>{a.nomProduit}</p>
                        <small>{a.quantite} × {a.prix} DH</small>
                      </div>
                      <span>{a.sousTotal} DH</span>
                    </div>
                  ))}
                </div>
                <div className="ca-facture-total">
                  <span>TOTAL TTC</span>
                  <span>{facture.total?.toFixed(2)} DH</span>
                </div>
                <div className="ca-facture-ok">✅ Vente validée avec succès !</div>
                <button className="ca-btn-pdf" onClick={() => generateFacturePDF(facture, articles, total, nom)}>
                  🖨️ Imprimer la facture PDF
                </button>
                <button className="ca-btn-nouvelle" onClick={resetVente}>📷 Nouvelle vente</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}