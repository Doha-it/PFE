package com.pfe.gestion_produits.vente;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class VenteNotFoundException
        extends RuntimeException {

    public VenteNotFoundException(Long id) {
        super("Vente non trouvée avec l'id : " + id);
    }
}