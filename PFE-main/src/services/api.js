const BASE_URL = '/api';

const getToken = () => localStorage.getItem('token');

// ─── Fonction centrale ───
const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    const response = await fetch(                                
        `${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                'Authorization': `Bearer ${token}`
            }),
            ...options.headers,
        },
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Session expirée !');
    }

    return response;
};

// ══════════════════════════════════════
// AUTH
// ══════════════════════════════════════
export const login = async (email, motDePasse) => {
    const r = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, motDePasse }),
    });
    return r.json();
};

// ══════════════════════════════════════
// PRODUITS
// ══════════════════════════════════════
export const getTousProduits = async () => {
    const r = await apiCall('/produits');
    return r.json();
};

export const ajouterProduit = async (produit) => {
    const r = await apiCall('/produits', {
        method: 'POST',
        body: JSON.stringify(produit),
    });
    return r.json();
};

export const modifierProduit = async (id, produit) => {
    const r = await apiCall(`/produits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(produit),
    });
    return r.json();
};

export const supprimerProduit = async (id) => {
    await apiCall(`/produits/${id}`, {
        method: 'DELETE',
    });
};

export const scannerProduit = async (codeBarres) => {
    const r = await apiCall(
        `/produits/scan/${codeBarres}`
    );
    return r.json();
};

export const getStockFaible = async (seuil = 20) => {
    const r = await apiCall(
        `/produits/stock-faible?seuil=${seuil}`
    );
    return r.json();
};

// ══════════════════════════════════════
// FOURNISSEURS
// ══════════════════════════════════════
export const getTousFournisseurs = async () => {
    const r = await apiCall('/fournisseurs');
    return r.json();
};

export const ajouterFournisseur = async (f) => {
    const r = await apiCall('/fournisseurs', {
        method: 'POST',
        body: JSON.stringify(f),
    });
    return r.json();
};

export const modifierFournisseur = async (id, f) => {
    const r = await apiCall(`/fournisseurs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(f),
    });
    return r.json();
};

export const supprimerFournisseur = async (id) => {
    await apiCall(`/fournisseurs/${id}`, {
        method: 'DELETE',
    });
};

// ══════════════════════════════════════
// UTILISATEURS
// ══════════════════════════════════════
export const getTousUtilisateurs = async () => {
    const r = await apiCall('/utilisateurs');
    return r.json();
};

export const ajouterUtilisateur = async (u) => {
    const r = await apiCall('/utilisateurs', {
        method: 'POST',
        body: JSON.stringify(u),
    });
    return r.json();
};

export const supprimerUtilisateur = async (id) => {
    await apiCall(`/utilisateurs/${id}`, {
        method: 'DELETE',
    });
};

// ══════════════════════════════════════
// VENTES
// ══════════════════════════════════════
export const creerVente = async (utilisateurId) => {
    const r = await apiCall('/ventes', {
        method: 'POST',
        body: JSON.stringify({ utilisateurId }),
    });
    return r.json();
};

export const ajouterArticle = async (
        venteId, codeBarres, quantite) => {
    const r = await apiCall(
        `/ventes/${venteId}/articles`, {
        method: 'POST',
        body: JSON.stringify({ codeBarres, quantite }),
    });
    return r.json();
};

// Modifie la quantité d'un article à une valeur exacte.
// quantite = 0 → supprime l'article de la vente.
// Vérifie le stock disponible pour toute augmentation.
export const modifierQuantiteArticle = async (
        venteId, codeBarres, quantite) => {
    const r = await apiCall(
        `/ventes/${venteId}/articles/${codeBarres}`, {
        method: 'PUT',
        body: JSON.stringify({ quantite }),
    });
    if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || 'Erreur modification quantité');
    }
    return r.json();
};

export const validerVente = async (venteId) => {
    const r = await apiCall(
        `/ventes/${venteId}/valider`, {
        method: 'PUT',
    });
    return r.json();
};

export const annulerVente = async (venteId) => {
    const r = await apiCall(
        `/ventes/${venteId}/annuler`, {
        method: 'PUT',
    });
    return r.json();
};

export const getToutesVentes = async () => {
    const r = await apiCall('/ventes');
    return r.json();
};

export const getArticlesVente = async (venteId) => {
    const r = await apiCall(
        `/ventes/${venteId}/articles`
    );
    return r.json();
};

// ══════════════════════════════════════
// FACTURES
// ══════════════════════════════════════
export const genererFacture = async (venteId) => {
    const r = await apiCall(
        `/factures/generer/${venteId}`, {
        method: 'POST',
    });
    return r.json();
};

export const getFactureParVente = async (venteId) => {
    const r = await apiCall(
        `/factures/vente/${venteId}`
    );
    return r.json();
};

export const getToutesFactures = async () => {
    const r = await apiCall('/factures');
    return r.json();
};

// ══════════════════════════════════════
// HISTORIQUE
// ══════════════════════════════════════
export const getHistorique = async () => {
    const r = await apiCall('/historique');
    return r.json();
};
// ══════════════════════════════════════
// categorie
// ══════════════════════════════════════
// CATEGORIES
export const getCategories = async () => {
    const r = await apiCall('/categories');
    return r.json();
};

/*modification caissier */
export const modifierUtilisateur = async (id, u) => {
    const r = await apiCall(`/utilisateurs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(u),
    });
    return r.json();
};