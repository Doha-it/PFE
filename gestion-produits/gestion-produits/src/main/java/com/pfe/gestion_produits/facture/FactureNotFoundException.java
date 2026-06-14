package com.pfe.gestion_produits.facture;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class FactureNotFoundException
        extends RuntimeException {

    public FactureNotFoundException(Long id) {
        super("Facture non trouvée avec l'id : " + id);
    }

    public FactureNotFoundException(String message) {
        super(message);
    }
}