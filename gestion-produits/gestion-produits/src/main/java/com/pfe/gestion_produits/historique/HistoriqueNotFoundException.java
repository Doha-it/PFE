package com.pfe.gestion_produits.historique;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class HistoriqueNotFoundException
        extends RuntimeException {

    public HistoriqueNotFoundException(Long id) {
        super("Historique non trouvé avec l'id : " + id);
    }

    public HistoriqueNotFoundException(String message) {
        super(message);
    }
}