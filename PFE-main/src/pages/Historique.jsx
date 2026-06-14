import { useState, useEffect } from "react";
import { getHistorique } from "../services/api";
import "./Historique.css";

export default function Historique() {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getHistorique()
      .then(setHistorique)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = historique.filter(h =>
    String(h.venteId).includes(search) ||
    (h.nomCaissier || "").toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalGlobal = historique
    .reduce((s, h) => s + parseFloat(h.total || 0), 0);

  return (
    <div className="historique-container">
      {/* Header */}
      <div className="historique-header">
        <div>
          <h2 className="historique-title">📋 Historique des Ventes</h2>
          <p className="historique-subtitle">
            {historique.length} entrées — Total : {totalGlobal.toFixed(2)} DH
          </p>
        </div>
        <div className="historique-total-badge">
          💰 {totalGlobal.toFixed(2)} DH
        </div>
      </div>

      {/* Recherche */}
      <div className="historique-search">
        <input className="historique-search-input"
          placeholder="🔍 Rechercher par vente ou caissier..."
          value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="historique-table-container">
        {loading ? (
          <p className="historique-loading">⏳ Chargement...</p>
        ) : (
          <table className="historique-table">
            <thead>
              <tr>
                {["#", "Vente", "Caissier", "Date/Heure", "Total", "Statut"].map(h => (
                  <th key={h} className="historique-table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="historique-empty">Aucun historique trouvé</td>
                </tr>
              ) : filtered.map((h, i) => (
                <tr key={h.id} className={i % 2 === 0 ? "historique-table-row-even" : "historique-table-row-odd"}>
                  <td className="historique-table-cell historique-index">{i + 1}</td>
                  <td className="historique-table-cell historique-vente-id">#{h.venteId}</td>
                  <td className="historique-table-cell historique-caissier">{h.nomCaissier || "—"}</td>
                  <td className="historique-table-cell historique-date">
                    {h.dateVente ? new Date(h.dateVente).toLocaleString("fr-FR") : "—"}
                  </td>
                  <td className="historique-table-cell historique-total">{h.total} DH</td>
                  <td className="historique-table-cell">
                    <span className="historique-statut-badge">{h.statut || "validee"}</span>
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