import "./Layout.css";
import { useNavigate, useLocation } from "react-router-dom";

const NAV = [
  { id: "accueil",     label: "Accueil",        icon: "🏠", path: "/admin/accueil" },
  { id: "stock",       label: "Stock/Produit",   icon: "📦", path: "/admin/stock" },
  { id: "fournisseurs", label: "Fournisseur",   icon: "🏭", path: "/admin/fournisseurs" },
  { id: "caissiers",   label: "Caissier",       icon: "👥", path: "/admin/caissiers" },
  { id: "ventes",      label: "Vente",          icon: "🛒", path: "/admin/ventes" },
  { id: "historique",  label: "Historique",     icon: "📋", path: "/admin/historique" },
  { id: "parametres",  label: "Paramètre",      icon: "⚙️", path: "/admin/parametres" },
];

export default function Layout({ adminName, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Déterminer la page active à partir de l'URL
  const getActiveNav = () => {
    const currentPath = location.pathname;
    const item = NAV.find(item => item.path === currentPath);
    return item ? item.id : "accueil";
  };

  const activeNav = getActiveNav();

  // ✅ Navigation vers une page
  const handleNav = (navId) => {
    const item = NAV.find(item => item.id === navId);
    if (item) {
      navigate(item.path);
    }
  };

  return (
    <div className="ly-root">
      <aside className="ly-sidebar">
        <div className="ly-brand">
          <span className="ly-logo">📚</span>
          <span className="ly-name">LibrairyPro</span>
        </div>
        <nav className="ly-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`ly-item ${
                activeNav === item.id
                  ? "ly-item--active" : ""
              }`}
              onClick={() => handleNav(item.id)}>
              <span className="ly-item-icon">
                {item.icon}
              </span>
              <span className="ly-item-label">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        <div className="ly-footer">
          <div className="ly-user">
            <div className="ly-avatar">
              {adminName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="ly-uname">
                {adminName}
              </span>
              <span className="ly-urole">
                Administrateur
              </span>
            </div>
          </div>
          <button className="ly-logout"
            onClick={onLogout}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>
      <main className="ly-main">
        <div className="ly-content">
          {children}
        </div>
      </main>
    </div>
  );
}