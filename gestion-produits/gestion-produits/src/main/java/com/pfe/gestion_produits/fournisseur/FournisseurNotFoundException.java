package com.pfe.gestion_produits.fournisseur;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class FournisseurNotFoundException
        extends RuntimeException {

    public FournisseurNotFoundException(Long id) {
        super("Fournisseur non trouvé avec l'id : " + id);
    }
}