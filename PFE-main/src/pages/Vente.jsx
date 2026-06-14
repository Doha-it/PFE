import { useState, useEffect } from "react";
import {
  getToutesVentes, getArticlesVente,
} from "../services/api";
import "./Vente.css";

export default function Vente() {
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState("tous");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getToutesVentes()
      .then(data => setVentes(
        data.sort((a, b) => new Date(b.date) - new Date(a.date))
      ))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const voirDetails = async (v) => {
    setSelected(v);
    try {
      setArticles(await getArticlesVente(v.id));
    } catch { setArticles([]); }
  };

  const sc = (s) =>
    s === "validee"
      ? { bg: "#E8F5E9", color: "#2E7D32" }
      : s === "annulee"
        ? { bg: "#FFEBEE", color: "#C62828" }
        : { bg: "#FFF8E1", color: "#F57F17" };

  const filtered = ventes.filter(v =>
    (filter === "tous" || v.statut === filter) &&
    (String(v.id).includes(search) ||
      (v.nomCaissier || "").toLowerCase().includes(search.toLowerCase()))
  );

  const totalValidees = ventes
    .filter(v => v.statut === "validee")
    .reduce((s, v) => s + parseFloat(v.total || 0), 0);

  return (
    <div className="vente-container">
      {/* Header */}
      <div className="vente-header">
        <h2 className="vente-title">🛒 Gestion des Ventes</h2>
        <p className="vente-subtitle">
          {ventes.length} ventes — Total validées : {totalValidees.toFixed(2)} DH
        </p>
      </div>

      {/* Stats rapides */}
      <div className="vente-stats">
        {[
          { label: "Validées", value: ventes.filter(v => v.statut === "validee").length, color: "#2E7D32", bg: "#E8F5E9", icon: "✅" },
          { label: "En cours", value: ventes.filter(v => v.statut === "en_cours").length, color: "#F57F17", bg: "#FFF8E1", icon: "⏳" },
          { label: "Annulées", value: ventes.filter(v => v.statut === "annulee").length, color: "#C62828", bg: "#FFEBEE", icon: "❌" },
        ].map((s, i) => (
          <div key={i} className="vente-stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div className="vente-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <p className="vente-stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="vente-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres + Recherche */}
      <div className="vente-filters">
        {["tous", "en_cours", "validee", "annulee"].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`vente-filter-btn ${filter === f ? "vente-filter-active" : ""}`}
          >
            {f === "tous" ? "Tous"
              : f === "en_cours" ? "En cours"
              : f === "validee" ? "✅ Validées"
              : "❌ Annulées"}
          </button>
        ))}
        <input className="vente-search-input"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="vente-main">
        {/* Table */}
        <div className="vente-table-wrapper">
          <div className="vente-table-container">
            {loading ? (
              <p className="vente-loading">⏳ Chargement...</p>
            ) : (
              <table className="vente-table">
                <thead>
                  <tr>
                    {["#", "Caissier", "Date", "Total", "Statut", ""].map(h => (
                      <th key={h} className="vente-table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => {
                    const s = sc(v.statut);
                    return (
                      <tr key={v.id}
                        onClick={() => voirDetails(v)}
                        className={`vente-table-row ${selected?.id === v.id ? "vente-table-row-selected" : i % 2 === 0 ? "vente-table-row-even" : "vente-table-row-odd"}`}
                      >
                        <td className="vente-table-id">#{v.id}</td>
                        <td className="vente-table-caissier">{v.nomCaissier || "—"}</td>
                        <td className="vente-table-date">
                          {v.date ? new Date(v.date).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="vente-table-total">{v.total} DH</td>
                        <td className="vente-table-statut">
                          <span className="vente-statut-badge" style={{ background: s.bg, color: s.color }}>
                            {v.statut}
                          </span>
                        </td>
                        <td className="vente-table-details">Détails →</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="vente-empty">Aucune vente trouvée</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Détail */}
        {selected && (
          <div className="vente-detail">
            <div className="vente-detail-header">
              <h3 className="vente-detail-title">Vente #{selected.id}</h3>
              <button className="vente-detail-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            {[
              ["Caissier", selected.nomCaissier || "—"],
              ["Date", selected.date ? new Date(selected.date).toLocaleDateString("fr-FR") : "—"],
              ["Statut", selected.statut],
            ].map(([k, v]) => (
              <div key={k} className="vente-detail-row">
                <span className="vente-detail-label">{k}</span>
                <span className="vente-detail-value">{v}</span>
              </div>
            ))}

            <h4 className="vente-detail-subtitle">Articles</h4>

            {articles.length === 0 ? (
              <p className="vente-detail-empty">Aucun article</p>
            ) : articles.map((a, i) => (
              <div key={i} className={`vente-detail-article ${i % 2 === 0 ? "vente-detail-article-even" : "vente-detail-article-odd"}`}>
                <div>
                  <p className="vente-detail-article-name">{a.nomProduit}</p>
                  <p className="vente-detail-article-qty">×{a.quantite}</p>
                </div>
                <span className="vente-detail-article-price">{a.sousTotal} DH</span>
              </div>
            ))}

            <div className="vente-detail-total">
              <span className="vente-detail-total-label">TOTAL</span>
              <span className="vente-detail-total-value">{selected.total} DH</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}