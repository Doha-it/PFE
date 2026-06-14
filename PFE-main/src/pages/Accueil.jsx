import { useState, useEffect } from "react";
import {
  getTousProduits, getToutesVentes,
  getTousUtilisateurs, getStockFaible,
} from "../services/api";
import "./Accueil.css";

const KpiCard = ({ icon, label, value, color, bg, sub }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`kpi-card ${hov ? "kpi-card-hover" : ""}`}
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="kpi-card-content">
        <div>
          <p className="kpi-label">{label}</p>
          <p className="kpi-value">{value}</p>
          <p className="kpi-sub" style={{ color: color }}>
            {sub}
          </p>
        </div>
        <div className="kpi-icon" style={{ background: bg }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const DonutChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0)
    return <p className="no-data">Aucune donnée</p>;

  const radius = 65;
  const cx = 110,
    cy = 110;
  const circ = 2 * Math.PI * radius;
  let cumul = 0;

  const segments = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * circ;
    const offset = cumul * circ;
    cumul += pct;
    return { ...d, dash, offset, pct };
  });

  return (
    <div className="donut-container">
      <div className="donut-svg-wrapper">
        <svg width={270} height={270} viewBox="0 0 220 220">
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={30}
              strokeDasharray={`${s.dash} ${circ}`}
              strokeDashoffset={-s.offset}
              className="donut-segment"
              style={{
                opacity:
                  tooltip && tooltip.label !== s.label ? 0.4 : 1,
              }}
              onMouseEnter={(e) =>
                setTooltip({
                  label: s.label,
                  value: s.value,
                  color: s.color,
                  pct: Math.round(s.pct * 100),
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
          <text x={cx} y={cy - 8} textAnchor="middle" className="donut-total">
            {total}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="donut-label">
            Total
          </text>
        </svg>

        {tooltip && (
          <div
            className="donut-tooltip"
            style={{
              top: tooltip.y - 55,
              left: tooltip.x - 55,
            }}
          >
            <div className="tooltip-header">
              <div
                className="tooltip-color"
                style={{ background: tooltip.color }}
              />
              {tooltip.label}
            </div>
            <div className="tooltip-value" style={{ color: tooltip.color }}>
              {tooltip.value} ({tooltip.pct}%)
            </div>
          </div>
        )}
      </div>

      <div className="legend-container">
        {data.map((d, i) => (
          <div
            key={i}
            className="legend-item"
            style={{
              background: d.color + "12",
              border: `1px solid ${d.color}25`,
            }}
          >
            <div
              className="legend-color"
              style={{ background: d.color }}
            />
            <div className="legend-text">
              <p className="legend-value">{d.value}</p>
              <p className="legend-label">{d.label}</p>
            </div>
            <span className="legend-percent" style={{ color: d.color }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Accueil({ adminName }) {
  const [stats, setStats] = useState({
    produits: 0,
    ventes: 0,
    utilisateurs: 0,
    stockFaible: 0,
  });
  const [ventes, setVentes] = useState([]);
  const [stockAlerte, setStockAlerte] = useState([]);
  const [stockAlerteComplet, setStockAlerteComplet] = useState([]);
  const [allVentes, setAllVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        const [p, v, u, sf] = await Promise.all([
          getTousProduits(),
          getToutesVentes(),
          getTousUtilisateurs(),
          getStockFaible(),
        ]);
        setStats({
          produits: p.length,
          ventes: v.length,
          utilisateurs: u.length,
          stockFaible: sf.length,
        });
        const sorted = [...v].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setVentes(sorted.slice(0, 6));
        setAllVentes(v);
        setStockAlerte(sf.slice(0, 4));
        setStockAlerteComplet(sf);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const h = new Date().getHours();
  const salut =
    h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";

  const sc = (s) =>
    s === "validee"
      ? { bg: "#E8F5E9", color: "#2E7D32" }
      : s === "annulee"
      ? { bg: "#FFEBEE", color: "#C62828" }
      : { bg: "#FFF8E1", color: "#F57F17" };

  // Libellé lisible pour le statut d'une vente
  const statutLabel = (s) =>
    s === "validee"
      ? "Validée"
      : s === "annulee"
      ? "Annulée"
      : s === "en_cours"
      ? "Abandonnée"
      : s;

  const ventesVal = allVentes.filter((v) => v.statut === "validee").length;
  const ventesAnn = allVentes.filter((v) => v.statut === "annulee").length;
  const ventesEC = allVentes.filter((v) => v.statut === "en_cours").length;

  return (
    <div className="accueil-container">
      <div className="header">
        <div>
          <h1 className="greeting">
            {salut}, {adminName} 👋
          </h1>
          <p className="date">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="dashboard-badge">📊 Tableau de bord</div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon="📦"
          label="Produits"
          value={loading ? "..." : stats.produits}
          color="#2196F3"
          bg="#E3F2FD"
          sub="↑ En stock"
        />
        <KpiCard
          icon="🛒"
          label="Ventes"
          value={loading ? "..." : stats.ventes}
          color="#4CAF50"
          bg="#E8F5E9"
          sub="Total effectuées"
        />
        <KpiCard
          icon="👥"
          label="Utilisateurs"
          value={loading ? "..." : stats.utilisateurs}
          color="#FF9800"
          bg="#FFF8E1"
          sub="Comptes actifs"
        />
        <KpiCard
          icon="⚠️"
          label="Stock faible"
          value={loading ? "..." : stats.stockFaible}
          color="#F44336"
          bg="#FFEBEE"
          sub={
            stats.stockFaible === 0
              ? "✅ Tout approvisionné"
              : "⚠️ À réapprovisionner"
          }
        />
      </div>

      <div className="stats-section">
        <h3 className="section-title">📊 Répartition des Ventes</h3>

        {loading ? (
          <p className="loading-text">⏳ Chargement...</p>
        ) : (
          <div className="horizontal-layout">
            <div className="donut-wrapper">
              <DonutChart
                data={[
                  { label: "Validées", value: ventesVal, color: "#4CAF50" },
                  { label: "Abandonnées", value: ventesEC, color: "#2196F3" },
                  { label: "Annulées", value: ventesAnn, color: "#F44336" },
                ]}
              />
            </div>

            <div className="separator" />

            <div className="stock-alert-wrapper">
              <h4 className="stock-alert-title">
                <span className="stock-alert-badge">⚠️ Alertes Stock</span>
              </h4>

              {stockAlerte.length === 0 ? (
                <div className="stock-empty">
                  <p className="stock-empty-emoji">✅</p>
                  <p className="stock-empty-title">Tout approvisionné !</p>
                  <p className="stock-empty-sub">
                    Aucun stock faible détecté
                  </p>
                </div>
              ) : (
                <div className="stock-list">
                  {stockAlerte.map((p, i) => (
                    <div
                      key={i}
                      className={`stock-item ${
                        p.quantite === 0 ? "stock-item-rupture" : "stock-item-alert"
                      }`}
                      style={{
                        borderLeft: `4px solid ${
                          p.quantite === 0 ? "#F44336" : "#FF9800"
                        }`,
                      }}
                    >
                      <div>
                        <p className="stock-item-name">
                          {p.nom.length > 25 ? p.nom.slice(0, 25) + "..." : p.nom}
                        </p>
                        <p className="stock-item-barcode">{p.codeBarres}</p>
                      </div>
                      <span
                        className={`stock-quantity ${
                          p.quantite === 0 ? "stock-quantity-rupture" : "stock-quantity-alert"
                        }`}
                      >
                        {p.quantite === 0 ? "Rupture !" : `${p.quantite} restants`}
                      </span>
                    </div>
                  ))}
                  {stats.stockFaible > 4 && (
                    <button
                      className="stock-more"
                      onClick={() => setShowStockModal(true)}
                    >
                      + {stats.stockFaible - 4} autres produits... 
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MODALE — TOUS LES PRODUITS EN STOCK FAIBLE ═══ */}
      {showStockModal && (
        <div className="stock-modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="stock-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="stock-modal-header">
              <h3 className="stock-modal-title">⚠️ Alertes Stock — Tous les produits</h3>
              <button className="stock-modal-close" onClick={() => setShowStockModal(false)}>✕</button>
            </div>
            <div className="stock-modal-body">
              {stockAlerteComplet.length === 0 ? (
                <div className="stock-empty">
                  <p className="stock-empty-emoji">✅</p>
                  <p className="stock-empty-title">Tout approvisionné !</p>
                  <p className="stock-empty-sub">Aucun stock faible détecté</p>
                </div>
              ) : (
                <div className="stock-list">
                  {stockAlerteComplet.map((p, i) => (
                    <div
                      key={i}
                      className={`stock-item ${
                        p.quantite === 0 ? "stock-item-rupture" : "stock-item-alert"
                      }`}
                      style={{
                        borderLeft: `4px solid ${
                          p.quantite === 0 ? "#F44336" : "#FF9800"
                        }`,
                      }}
                    >
                      <div>
                        <p className="stock-item-name">{p.nom}</p>
                        <p className="stock-item-barcode">{p.codeBarres}</p>
                      </div>
                      <span
                        className={`stock-quantity ${
                          p.quantite === 0 ? "stock-quantity-rupture" : "stock-quantity-alert"
                        }`}
                      >
                        {p.quantite === 0 ? "Rupture de stock !" : `${p.quantite} restants`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="ventes-section">
        <div className="ventes-header">
          <h3 className="ventes-title">🕒 Ventes récentes</h3>
          <span className="ventes-total-badge">{stats.ventes} ventes au total</span>
        </div>

        {loading ? (
          <p className="loading-text">⏳ Chargement...</p>
        ) : ventes.length === 0 ? (
          <p className="no-ventes">Aucune vente pour l'instant</p>
        ) : (
          <table className="ventes-table">
            <thead>
              <tr>
                {["#", "Caissier", "Date", "Total", "Statut"].map((h) => (
                  <th key={h} className="table-header">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventes.map((v, i) => {
                const s = sc(v.statut);
                return (
                  <tr key={v.id} className={i % 2 === 0 ? "table-row-even" : "table-row-odd"}>
                    <td className="table-id">#{v.id}</td>
                    <td className="table-caissier">{v.nomCaissier || "—"}</td>
                    <td className="table-date">
                      {v.date ? new Date(v.date).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="table-total">{v.total} DH</td>
                    <td className="table-statut">
                      <span className="statut-badge" style={s}>
                        {statutLabel(v.statut)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}