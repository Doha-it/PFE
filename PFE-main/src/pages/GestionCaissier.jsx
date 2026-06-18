import { useState, useEffect } from "react";
import {
  getTousUtilisateurs, ajouterUtilisateur,
  supprimerUtilisateur, modifierUtilisateur,
  getToutesVentes
} from "../services/api";
import "./GestionCaissier.css";

const TEL_REGEX = /^[0-9]{10}$/;

export default function GestionCaissier() {
  const [users, setUsers] = useState([]);
  const [ventesParCaissier, setVentesParCaissier] = useState({});
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", motDePasse: "", telephone: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const [utilisateurs, ventes] = await Promise.all([
        getTousUtilisateurs(),
        getToutesVentes()
      ]);
      setUsers(utilisateurs);

      const compteur = {};
      ventes
        .filter(v => v.statut === "validee")
        .forEach(v => {
          compteur[v.utilisateurId] = (compteur[v.utilisateurId] || 0) + 1;
        });
      setVentesParCaissier(compteur);

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };
  const valider = () => {
    const errs = {};

    if (!form.telephone.trim())
      errs.telephone = "Le numéro de téléphone est obligatoire";
    else if (!TEL_REGEX.test(form.telephone))
      errs.telephone = "Le numéro doit contenir exactement 10 chiffres";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!valider()) return;

    try {
      if (editId) {
        const payload = {};
        if (form.nom) payload.nom = form.nom;
        if (form.email) payload.email = form.email;
        if (form.motDePasse) payload.motDePasse = form.motDePasse;
        if (form.telephone) payload.telephone = form.telephone;
        await modifierUtilisateur(editId, payload);
        flash("✅ Caissier modifié !");
      } else {
        await ajouterUtilisateur({ ...form, role: "caissier" });
        flash("✅ Caissier créé !");
      }
      setShowForm(false);
      setEditId(null);
      setForm({ nom: "", email: "", motDePasse: "", telephone: "" });
      charger();
    } catch {
      flash("❌ Erreur !", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce caissier ?")) return;
    await supprimerUtilisateur(id);
    charger();
  };

  const handleEdit = (u) => {
    setEditId(u.id);
    setForm({ nom: u.nom, email: u.email, motDePasse: "", telephone: u.telephone || "" });
    setShowForm(true);
  };

  const caissiers = users.filter(u => u.role === "caissier");

  return (
    <div className="caissier-container">
      {/* Header */}
      <div className="caissier-header">
        <div>
          <h2 className="caissier-title">👨‍💻 Gestion des Caissiers</h2>
          <p className="caissier-subtitle">{caissiers.length} caissier(s)</p>
        </div>
        <button className="caissier-add-btn" onClick={() => {
          setShowForm(!showForm);
          setEditId(null);
          setForm({ nom: "", email: "", motDePasse: "", telephone: "" });
        }}>
          {showForm ? "✕ Fermer" : "+ Ajouter"}
        </button>
      </div>

      {/* Message */}
      {msg.text && (
        <div className={`caissier-msg caissier-msg-${msg.type}`}>
          {msg.text}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="caissier-form-container">
          <h3 className="caissier-form-title">
            {editId ? "✏️ Modifier le caissier" : "➕ Nouveau caissier"}
          </h3>
          <form onSubmit={handleSubmit} className="caissier-form">
            <div>
              <label className="caissier-label">Nom complet *</label>
              <input className="caissier-input"
                placeholder="Nom complet"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div>
              <label className="caissier-label">Email *</label>
              <input className="caissier-input" type="email"
                placeholder="email@librairie.ma"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="caissier-label">Téléphone *</label>
             <input
                className={`caissier-input ${errors.telephone ? "caissier-input-error" : ""}`}
                type="tel"
                placeholder="Numéro de téléphone"
                value={form.telephone}
                maxLength={10}
                onChange={e =>
                  setForm({
                    ...form,
                    telephone: e.target.value.replace(/\D/g, "").slice(0, 10)
                  })
                }
                required/>
                    {errors.telephone && (
                        <p className="caissier-error-text">
                          {errors.telephone}
                        </p>
                      )}
            </div>
            <div style={{ position: "relative" }}>
              <label className="caissier-label">Mot de passe *</label>
              <input
                className="caissier-input"
                type={showPassword ? "text" : "password"}
                placeholder={editId ? "Laisser vide pour ne pas changer" : "••••••••"}
                value={form.motDePasse}
                onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                required={!editId}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "10px", top: "38px", cursor: "pointer", userSelect: "none" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            <div className="caissier-form-actions">
              <button type="submit" className="caissier-submit-btn">
                {editId ? "✏️ Modifier" : "✅ Créer le compte"}
              </button>
              <button type="button" className="caissier-cancel-btn" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <p className="caissier-loading">⏳ Chargement...</p>
      ) : (
        <div className="caissier-table-container">
          <table className="caissier-table">
            <thead>
              <tr>
                {["Utilisateur", "Téléphone", "Email", "Ventes", "Action"].map(h => (
                  <th key={h} className="caissier-table-header" style={h === "Action" ? { textAlign: "center" } : {}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {caissiers.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? "caissier-table-row-even" : "caissier-table-row-odd"}>
                  <td className="caissier-table-cell">
                    <div className="caissier-user-info">
                      <div className="caissier-avatar" style={{ background: "#2E7D32" }}>
                        {u.nom?.charAt(0).toUpperCase()}
                      </div>
                      <span className="caissier-user-name">{u.nom}</span>
                    </div>
                  </td>
                  <td className="caissier-table-cell caissier-user-email">
                    {u.telephone || <span style={{ color: "#bdbdbd" }}>—</span>}
                  </td>
                  <td className="caissier-table-cell caissier-user-email">{u.email}</td>
                  <td className="caissier-table-cell" >
                    <span style={{
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      borderRadius: "20px",
                      padding: "4px 14px",
                      fontWeight: 700,
                      fontSize: 13
                    }}>
                      {ventesParCaissier[u.id] || 0} vente(s)
                    </span>
                  </td>
                  <td className="caissier-table-cell" style={{ textAlign: "center" }} >
                    <button className="caissier-edit-btn" onClick={() => handleEdit(u)}>
                      ✏️ Modifier
                    </button>
                    <button className="caissier-delete-btn" onClick={() => handleDelete(u.id)}>
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}