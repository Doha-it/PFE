import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  getTousProduits, ajouterProduit,
  modifierProduit, supprimerProduit,
  getTousFournisseurs, getCategories,
} from "../services/api";
import "./Stock.css";

export default function Stock() {
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterFournisseur, setFilterFournisseur] = useState("");
  const [sortNom, setSortNom] = useState("");
  const [sortPrix, setSortPrix] = useState("");
  const [sortStock, setSortStock] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [form, setForm] = useState({
    nom: "", codeBarres: "", prix: "",
    quantite: "", fournisseurId: "",
    categorieId: "",
  });
  const scannerRef = useRef(null);

  useEffect(() => {
    charger();
    return () => stopScan();
  }, []);

  const charger = async () => {
    try {
      const [p, f, c] = await Promise.all([
        getTousProduits(),
        getTousFournisseurs(),
        getCategories(),
      ]);
      setProduits(p);
      setFournisseurs(f);
      setCategories(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const startScan = async () => {
    setScanning(true);
    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode("qr-box");
        scannerRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 200, height: 100 } },
          (text) => {
            setForm(f => ({ ...f, codeBarres: text }));
            stopScan();
            const existant = produitExistant(text);
            if (existant) {
              flash(`⚠️ Code déjà utilisé par "${existant.nom}" !`, "error");
            } else {
              flash("✅ Code scanné : " + text);
            }
          },
          () => {}
        );
      } catch {
        flash("❌ Webcam inaccessible !", "error");
        setScanning(false);
      }
    }, 300);
  };

  const stopScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
        .then(() => { scannerRef.current = null; })
        .catch(() => {});
    }
    setScanning(false);
  };

  const resetForm = () => {
    setForm({
      nom: "", codeBarres: "", prix: "",
      quantite: "", fournisseurId: "", categorieId: "",
    });
    setEditId(null);
    stopScan();
  };

  const produitExistant = (code) => {
    if (!code) return null;
    return produits.find(
      p => p.codeBarres?.toLowerCase().trim() === code.toLowerCase().trim()
        && p.id !== editId
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const existant = produitExistant(form.codeBarres);
    if (existant) {
      flash(`⚠️ Ce code-barres existe déjà : "${existant.nom}" !`, "error");
      return;
    }

    try {
      const payload = {
        nom: form.nom,
        codeBarres: form.codeBarres,
        prix: parseFloat(form.prix),
        quantite: parseInt(form.quantite),
        fournisseurId: form.fournisseurId || null,
        categorieId: form.categorieId || null,
      };
      if (editId) {
        await modifierProduit(editId, payload);
        flash("✅ Produit modifié !");
      } else {
        await ajouterProduit(payload);
        flash("✅ Produit ajouté !");
      }
      setShowForm(false); resetForm(); charger();
    } catch { flash("❌ Erreur !", "error"); }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({
      nom: p.nom,
      codeBarres: p.codeBarres,
      prix: String(p.prix),
      quantite: String(p.quantite),
      fournisseurId: String(p.fournisseurId || ""),
      categorieId: String(p.categorieId || ""),
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supprimerProduit(id); charger();
  };

  const removeAccents = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u0308\u030b\u0323\u0309\u0301\u0300\u0302]/g, "");
  };

  const filtered = produits.filter(p => {
    const searchTerm = search.toLowerCase();
    const normalizedSearch = removeAccents(searchTerm);

    const nomMatch = removeAccents(p.nom?.toLowerCase() || "").includes(normalizedSearch);
    const codeMatch = p.codeBarres?.toLowerCase().includes(searchTerm);
    const fournisseurMatch = removeAccents(p.nomFournisseur?.toLowerCase() || "").includes(normalizedSearch);

    const searchMatch = search === "" || nomMatch || codeMatch || fournisseurMatch;
    const catMatch = filterCat === "" || String(p.categorieId) === filterCat;
    const fournisseurFilterMatch = filterFournisseur === "" || p.nomFournisseur === filterFournisseur;

    return searchMatch && catMatch && fournisseurFilterMatch;
  });




    const sortProduits = (produitsList) => {
      const sorted = [...produitsList];

      sorted.sort((a, b) => {

        // Tri par nom
        if (sortNom === "asc") {
          const cmp = (a.nom || "").localeCompare(b.nom || "");
          if (cmp !== 0) return cmp;
        }

        if (sortNom === "desc") {
          const cmp = (b.nom || "").localeCompare(a.nom || "");
          if (cmp !== 0) return cmp;
        }

        // Tri par prix
        if (sortPrix === "asc") {
          return (a.prix || 0) - (b.prix || 0);
        }

        if (sortPrix === "desc") {
          return (b.prix || 0) - (a.prix || 0);
        }

        //Tri par stock 
          if (sortStock === "asc") {
            return (a.quantite || 0) - (b.quantite || 0);
          }
          if (sortStock === "desc") {
            return (b.quantite || 0) - (a.quantite || 0);
          }

        return 0;
      });

      return sorted;
    };




  const filteredAndSorted = sortProduits(filtered);
  const produitDuplique = produitExistant(form.codeBarres);

  return (
    <div className="stock-container">
      {/* Header */}
      <div className="stock-header">
        <div>
          <h2 className="stock-title">📦 Stock & Produits</h2>
          <p className="stock-subtitle">{produits.length} produits enregistrés</p>
        </div>
        <button className="stock-add-btn" onClick={() => {
          resetForm(); setShowForm(!showForm);
        }}>
          {showForm ? "✕ Fermer" : "+ Ajouter produit"}
        </button>
      </div>

      {/* Stats par catégorie */}
      <div className="stock-categories">
        <div
          onClick={() => setFilterCat("")}
          className={`stock-category-btn ${filterCat === "" ? "stock-category-active" : ""}`}
        >
          Tous ({produits.length})
        </div>
        {categories.map(c => {
          const count = produits.filter(p => p.categorieId === c.id).length;
          return (
            <div key={c.id}
              onClick={() => setFilterCat(String(c.id))}
              className={`stock-category-btn ${filterCat === String(c.id) ? "stock-category-active" : ""}`}
            >
              {c.icone} {c.nom} ({count})
            </div>
          );
        })}
      </div>

      {/* Filtre par fournisseur */}
      <div className="stock-fournisseurs">
        <div
          onClick={() => setFilterFournisseur("")}
          className={`stock-fournisseur-btn ${filterFournisseur === "" ? "stock-fournisseur-active" : ""}`}
        >
          Tous fournisseurs
        </div>
        {fournisseurs.map(f => {
          const count = produits.filter(p => p.nomFournisseur === f.nom).length;
          return count > 0 ? (
            <div key={f.id}
              onClick={() => setFilterFournisseur(f.nom)}
              className={`stock-fournisseur-btn ${filterFournisseur === f.nom ? "stock-fournisseur-active" : ""}`}
            >
              {f.nom} ({count})
            </div>
          ) : null;
        })}
      </div>

      {/* Message */}
      {msg.text && (
        <div className={`stock-msg stock-msg-${msg.type}`}>
          {msg.text}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="stock-form-container">
          <h3 className="stock-form-title">
            {editId ? "✏️ Modifier produit" : "➕ Nouveau produit"}
          </h3>
          <form onSubmit={handleSubmit} className="stock-form">
            <div>
              <label className="stock-label">Nom du produit *</label>
              <input className="stock-input"
                placeholder="Ex: Mathématiques 3ème"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })} required />
            </div>

            <div>
              <label className="stock-label">Code-barres *</label>
              <div className="stock-code-group">
                <input className="stock-input stock-code-input"
                  placeholder="Scannez ou saisissez"
                  value={form.codeBarres}
                  onChange={e => setForm({ ...form, codeBarres: e.target.value })} required />
                <button type="button" className={`stock-scan-btn ${scanning ? "stock-scan-btn-active" : ""}`}
                  onClick={scanning ? stopScan : startScan}>
                  {scanning ? "⏹️" : "📷"}
                </button>
              </div>
              {produitDuplique && (
                <p className="stock-duplicate-warning">
                  ⚠️ Ce code-barres correspond déjà à <strong>{produitDuplique.nom}</strong>
                </p>
              )}
            </div>

            {scanning && (
              <div className="stock-scanner">
                <div id="qr-box" className="stock-scanner-box" />
                <p className="stock-scanner-text">📷 Pointez vers le code-barres</p>
              </div>
            )}

            <div>
              <label className="stock-label">Prix (DH) *</label>
              <input className="stock-input" type="number"
                step="0.01" placeholder="0.00"
                value={form.prix}
                onChange={e => setForm({ ...form, prix: e.target.value })} required />
            </div>

            <div>
              <label className="stock-label">Quantité *</label>
              <input className="stock-input" type="number"
                placeholder="0" value={form.quantite}
                onChange={e => setForm({ ...form, quantite: e.target.value })} required />
            </div>

            <div>
              <label className="stock-label">Catégorie</label>
              <select className="stock-select"
                value={form.categorieId}
                onChange={e => setForm({ ...form, categorieId: e.target.value })}>
                <option value="">-- Choisir catégorie --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="stock-label">Fournisseur</label>
              <select className="stock-select"
                value={form.fournisseurId}
                onChange={e => setForm({ ...form, fournisseurId: e.target.value })}>
                <option value="">-- Aucun --</option>
                {fournisseurs.map(f => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>

            <div className="stock-form-actions">
              <button type="submit" className="stock-submit-btn">
                ✅ {editId ? "Modifier" : "Ajouter"}
              </button>
              <button type="button" className="stock-cancel-btn"
                onClick={() => { setShowForm(false); resetForm(); }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recherche et Tri */}
      <div className="stock-search-section">
        <input
          className="stock-search-input"
          placeholder="🔍 Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="stock-sort-inline">
          <span className="stock-sort-title">📝 Nom :</span>

          <button
            type="button"
            onClick={() => setSortNom(sortNom === "asc" ? "" : "asc")}
            className={`stock-sort-btn ${
              sortNom === "asc" ? "stock-sort-active" : ""
            }`}
          >
            A→Z
          </button>

          <button
            type="button"
            onClick={() => setSortNom(sortNom === "desc" ? "" : "desc")}
            className={`stock-sort-btn ${
              sortNom === "desc" ? "stock-sort-active" : ""
            }`}
          >
            Z→A
          </button>
        </div>

        <div className="stock-sort-inline">
          <span className="stock-sort-title">💰 Prix :</span>

          <button
            type="button"
            onClick={() => setSortPrix(sortPrix === "asc" ? "" : "asc")}
            className={`stock-sort-btn ${
              sortPrix === "asc" ? "stock-sort-active" : ""
            }`}
          >
            ↑
          </button>

          <button
            type="button"
            onClick={() => setSortPrix(sortPrix === "desc" ? "" : "desc")}
            className={`stock-sort-btn ${
              sortPrix === "desc" ? "stock-sort-active" : ""
            }`}
          >
            ↓
          </button>
        </div>

        <div className="stock-sort-inline">
          <span className="stock-sort-title">📦 Stock :</span>
          <button
            type="button"
            onClick={() => setSortStock(sortStock === "asc" ? "" : "asc")}
            className={`stock-sort-btn ${sortStock === "asc" ? "stock-sort-active" : ""}`}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => setSortStock(sortStock === "desc" ? "" : "desc")}
            className={`stock-sort-btn ${sortStock === "desc" ? "stock-sort-active" : ""}`}
          >
            ↓
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="stock-table-container">
        {loading ? (
          <p className="stock-loading">⏳ Chargement...</p>
        ) : (
          <table className="stock-table">
            <thead>
              <tr>
                {["Nom", "Code-barres", "Catégorie", "Prix", "Quantité", "Fournisseur", "Actions"].map(h => (
                  <th key={h} className="stock-table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="stock-empty">Aucun produit trouvé</td>
                </tr>
              ) : filteredAndSorted.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? "stock-table-row-even" : "stock-table-row-odd"}>
                  <td className="stock-table-cell stock-product-name"><strong>{p.nom}</strong></td>
                  <td className="stock-table-cell stock-product-barcode">{p.codeBarres}</td>
                  <td className="stock-table-cell">
                    {p.iconeCategorie && (
                      <span className="stock-category-badge">
                        {p.iconeCategorie} {p.nomCategorie}
                      </span>
                    )}
                    {!p.nomCategorie && <span className="stock-no-category">—</span>}
                  </td>
                  <td className="stock-table-cell stock-product-price">{p.prix} DH</td>
                  <td className="stock-table-cell">
                    <span className={`stock-quantity-badge stock-quantity-${p.quantite === 0 ? "zero" : p.quantite <=20 ? "low" : "ok"}`}>
                      {p.quantite}
                    </span>
                  </td>
                  <td className="stock-table-cell stock-supplier">{p.nomFournisseur || "—"}</td>
                  <td className="stock-table-cell">
                    <div className="stock-actions">
                      <button className="stock-edit-btn" onClick={() => handleEdit(p)}>✏️</button>
                      <button className="stock-delete-btn" onClick={() => handleDelete(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}