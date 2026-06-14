package com.pfe.gestion_produits.utilisateur;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// @ResponseStatus = code HTTP retourné automatiquement
// 404 = ressource non trouvée
@ResponseStatus(HttpStatus.NOT_FOUND)
public class UtilisateurNotFoundException
        extends RuntimeException {

    public UtilisateurNotFoundException(Long id) {
        super("Utilisateur non trouvé avec l'id : " + id);
    }

    public UtilisateurNotFoundException(String email) {
        super("Aucun utilisateur avec l'email : " + email);
    }
}