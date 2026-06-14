import { useState } from "react";
import "./Parametres.css";

export default function Parametres({ adminName , adminEmail, adminTelephone, onLogout }) {
  const [hoverLogout, setHoverLogout] = useState(false);

  return (
    <div className="parametres-container">
      {/* Header */}
      <div className="parametres-header">
        <h2 className="parametres-title">⚙️ Paramètres</h2>
        <p className="parametres-subtitle">Configuration du système</p>
      </div>

      <div className="parametres-grid">
        {/* Profil */}
        <div className="parametres-card">
          <h3 className="parametres-card-title">👤 Profil Administrateur</h3>


            <div className="parametres-profile">
      <div className="parametres-avatar">
        {adminName?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="parametres-profile-name">{adminName}</p>
        <p className="parametres-profile-role">Administrateur système</p>
      </div>
      </div>
      {adminEmail && (
        <div className="parametres-info-row">
          <span className="parametres-info-label">📧 Email</span>
          <span className="parametres-info-value">{adminEmail}</span>
        </div>
      )}
      {adminTelephone && (
        <div className="parametres-info-row">
          <span className="parametres-info-label">📞 Téléphone</span>
          <span className="parametres-info-value">{adminTelephone}</span>
        </div>
      )}
        </div>

        {/* Système */}
        <div className="parametres-card">
          <h3 className="parametres-card-title">🖥️ Informations Système</h3>
          {[
            ["Application", "LibrairyPro v1.0"],
            ["Backend", "Spring Boot 4.0"],
            ["Base de données", "MySQL 8.0"],
            ["Frontend", "React Vite"],
            ["Authentification", "JWT"],
            ["Scan", "html5-qrcode"],
          ].map(([k, v]) => (
            <div key={k} className="parametres-info-row">
              <span className="parametres-info-label">{k}</span>
              <span className="parametres-info-value">{v}</span>
            </div>
          ))}
        </div>

        {/* À propos */}
        <div className="parametres-about">
          <h3 className="parametres-about-title">📚 À propos de LibrairyPro</h3>
          <p className="parametres-about-text">
            Système de gestion de librairie : gestion du stock, caisse avec scan webcam, 
            facturation PDF, historique des ventes, gestion multi-utilisateurs.
          </p>
          <div className="parametres-about-footer">
            <p>© LibrairyPro</p>
            <p>📅 {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Déconnexion */}
        <div className="parametres-logout-card">
          <h3 className="parametres-logout-title">🚪 Déconnexion</h3>
          <p className="parametres-logout-text">
            Voulez-vous vous déconnecter de l'application ? Votre session sera terminée.
          </p>
          <button 
            className={`parametres-logout-btn ${hoverLogout ? "parametres-logout-btn-hover" : ""}`}
            onClick={onLogout}
            onMouseEnter={() => setHoverLogout(true)}
            onMouseLeave={() => setHoverLogout(false)}
          >
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}