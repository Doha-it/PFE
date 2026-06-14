import "./Layout.css";

const NAV = [
  { label: "Accueil",        icon: "🏠" },
  { label: "Stock/Produit",  icon: "📦" },
  { label: "Fournisseur",    icon: "🏭" },
  { label: "Caissier",       icon: "👥" },
  { label: "Vente",          icon: "🛒" },
  { label: "Historique",     icon: "📋" },
  { label: "Paramètre",      icon: "⚙️" },
];

export default function Layout({
  activeNav, onNav, adminName, onLogout, children
}) {
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
              key={item.label}
              className={`ly-item ${
                activeNav === item.label
                  ? "ly-item--active" : ""
              }`}
              onClick={() => onNav(item.label)}>
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