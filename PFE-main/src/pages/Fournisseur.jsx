import { useState, useEffect } from "react";
import {
  getTousFournisseurs, ajouterFournisseur,
  modifierFournisseur, supprimerFournisseur,
} from "../services/api";
import "./Fournisseur.css";

// Validation email côté client : example@gmail.example
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation téléphone : 0612345678 / +212612345678
const TEL_REGEX = /^(\+?[0-9][\s\-]?){6,19}[0-9]$/;

export default function Fournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState({ nom: "", telephone: "", email: "" });
  const [errors, setErrors]             = useState({});
  const [msg, setMsg]                   = useState({ text: "", type: "" });
  const [hovered, setHovered]           = useState(null);

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      setFournisseurs(await getTousFournisseurs());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  // ── Validation côté client ────────────────────────────────
  const valider = () => {
    const errs = {};

    if (!form.nom.trim() || form.nom.trim().length < 2)
      errs.nom = "Le nom est obligatoire (min 2 caractères)";

    if (form.telephone && !TEL_REGEX.test(form.telephone))
      errs.telephone = "Numéro invalide (ex: 0612345678 ou +212612345678)";

    if (form.email && !EMAIL_REGEX.test(form.email))
      errs.email = "Email invalide (ex: contact@exemple.com)";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;

    // On envoie telephone et email séparément au backend
    const payload = {
      nom:       form.nom.trim(),
      telephone: form.telephone.trim() || null,
      email:     form.email.trim()     || null,
    };

    try {
      if (editId) {
        await modifierFournisseur(editId, payload);
        flash("✅ Fournisseur modifié !");
      } else {
        await ajouterFournisseur(payload);
        flash("✅ Fournisseur ajouté !");
      }
      setShowForm(false); setEditId(null);
      setForm({ nom: "", telephone: "", email: "" });
      setErrors({});
      charger();
    } catch {
      flash("❌ Erreur lors de l'enregistrement !", "error");
    }
  };

  const handleEdit = (f) => {
    setEditId(f.id);
    setForm({
      nom:       f.nom       || "",
      telephone: f.telephone || "",
      email:     f.email     || "",
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    await supprimerFournisseur(id); charger();
  };

  const COLORS = [
    "#2196F3","#4CAF50","#FF9800",
    "#9C27B0","#F44336","#009688",
  ];

  return (
    <div className="fournisseur-container">

      {/* Header */}
      <div className="fournisseur-header">
        <div>
          <h2 className="fournisseur-title">🏭 Fournisseurs</h2>
          <p className="fournisseur-count">
            {fournisseurs.length} fournisseurs enregistrés
          </p>
        </div>
        <button className="fournisseur-add-btn" onClick={() => {
          setShowForm(!showForm); setEditId(null);
          setForm({ nom: "", telephone: "", email: "" }); setErrors({});
        }}>
          {showForm ? "✕ Fermer" : "+ Ajouter"}
        </button>
      </div>

      {/* Message flash */}
      {msg.text && (
        <div className={`fournisseur-msg fournisseur-msg-${msg.type}`}>
          {msg.text}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="fournisseur-form-container">
          <h3 className="fournisseur-form-title">
            {editId ? "✏️ Modifier le fournisseur" : "➕ Nouveau fournisseur"}
          </h3>
          <form onSubmit={handleSubmit} className="fournisseur-form">

            {/* Nom */}
            <div>
              <label className="fournisseur-label">Nom *</label>
              <input
                className={`fournisseur-input ${errors.nom ? "fournisseur-input-error" : ""}`}
                placeholder="Ex: Hachette Maroc"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
              />
              {errors.nom && <p className="fournisseur-error-text">{errors.nom}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className="fournisseur-label">📞 Téléphone</label>
              <input
                className={`fournisseur-input ${errors.telephone ? "fournisseur-input-error" : ""}`}
                placeholder="Ex: 0612345678 ou +212612345678"
                value={form.telephone}
                onChange={e => setForm({ ...form, telephone: e.target.value })}
                type="tel"
              />
              {errors.telephone && <p className="fournisseur-error-text">{errors.telephone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="fournisseur-label">✉️ Email</label>
              <input
                className={`fournisseur-input ${errors.email ? "fournisseur-input-error" : ""}`}
                placeholder="Ex: contact@exemple.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                type="email"
              />
              {errors.email && <p className="fournisseur-error-text">{errors.email}</p>}
            </div>

            <div className="fournisseur-form-actions">
              <button type="submit" className="fournisseur-submit-btn">
                ✅ {editId ? "Modifier" : "Ajouter"}
              </button>
              <button type="button" className="fournisseur-cancel-btn" onClick={() => {
                setShowForm(false); setEditId(null); setErrors({});
              }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grille des cartes */}
      {loading ? (
        <p className="fournisseur-loading">⏳ Chargement...</p>
      ) : fournisseurs.length === 0 ? (
        <div className="fournisseur-empty">
          <p className="fournisseur-empty-emoji">🏭</p>
          <p className="fournisseur-empty-text">Aucun fournisseur enregistré</p>
        </div>
      ) : (
        <div className="fournisseur-grid">
          {fournisseurs.map((f, i) => (
            <div key={f.id}
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              className={`fournisseur-card ${hovered === f.id ? "fournisseur-card-hover" : ""}`}
              style={{ borderTop: `4px solid ${COLORS[i % COLORS.length]}` }}>

              <div className="fournisseur-card-header">
                <div className="fournisseur-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                  {f.nom?.charAt(0).toUpperCase()}
                </div>
                <div className="fournisseur-card-info">
                  <p className="fournisseur-card-name">{f.nom}</p>

                  {/* Téléphone */}
                  {f.telephone ? (
                    <p className="fournisseur-card-contact">
                      📞 {f.telephone}
                    </p>
                  ) : (
                    <p className="fournisseur-card-contact fournisseur-card-contact-empty">
                      📞 —
                    </p>
                  )}

                  {/* Email */}
                  {f.email ? (
                    <p className="fournisseur-card-contact">
                      ✉️ {f.email}
                    </p>
                  ) : (
                    <p className="fournisseur-card-contact fournisseur-card-contact-empty">
                      ✉️ —
                    </p>
                  )}
                </div>
              </div>

              <div className="fournisseur-card-actions">
                <button className="fournisseur-edit-btn" onClick={() => handleEdit(f)}>
                  ✏️ Modifier
                </button>
                <button className="fournisseur-delete-btn" onClick={() => handleDelete(f.id)}>
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}