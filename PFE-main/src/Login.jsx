import { useState } from "react";
import { login as loginApi } from "./services/api";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErreur("");
  
  try {
    const data = await loginApi(email, motDePasse);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('nom', data.nom);
      localStorage.setItem('id', String(data.id));
      localStorage.setItem('email', data.email);           
      localStorage.setItem('telephone', data.telephone || ""); 
      onLogin(data.nom, data.role, data.id, data.email, data.telephone); 
    } else {
      setErreur("Email ou mot de passe incorrect !");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
    
    if (error.message?.includes("401") || error.response?.status === 401) {
      setErreur("Email ou mot de passe incorrect !");
    } else if (error.message?.includes("Network") || error.message?.includes("fetch")) {
      setErreur("Impossible de contacter le serveur !");
    } else {
      setErreur("Une erreur est survenue !");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="lp-root">
      <div className="lp-left">
        <div className="lp-brand">
          <div className="lp-logo">📚</div>
          <h1 className="lp-app-name">LibrairyPro</h1>
          <p className="lp-tagline">
            Système de gestion intelligent
          </p>
        </div>
        <div className="lp-features">
          {[
            { icon: "🔍", text: "Scan codes-barres webcam" },
            { icon: "📊", text: "Statistiques temps réel" },
            
            { icon: "📦", text: "Gestion stock auto" },
          ].map((f, i) => (
            <div key={i} className="lp-feature">
              <span className="lp-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-right">
        <div className="lp-card">
          <div className="lp-card-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="lp-form">
            <div className="lp-field">
              <label>Email</label>
              <div className="lp-input-wrap">
                <span className="lp-icon">✉️</span>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="lp-field">
              <label>Mot de passe</label>
              <div className="lp-input-wrap">
                <span className="lp-icon">🔐</span>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={motDePasse}
                  onChange={e => setMotDePasse(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {erreur && (
              <div className="lp-error">{erreur}</div>
            )}

            <button
              type="submit"
              className="lp-btn"
              disabled={loading}>
              {loading
                ? "⏳ Connexion..."
                : "Se connecter →"
              }
            </button>
          </form>

          <div className="lp-roles">
            <div className="lp-role lp-role--admin">
              <span>👨‍💼</span>
              <div>
                <strong>Administrateur</strong>
                <p>Gestion complète</p>
              </div>
            </div>
            <div className="lp-role lp-role--caissier">
              <span>👨‍💻</span>
              <div>
                <strong>Caissier</strong>
                <p>Ventes & Scan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}