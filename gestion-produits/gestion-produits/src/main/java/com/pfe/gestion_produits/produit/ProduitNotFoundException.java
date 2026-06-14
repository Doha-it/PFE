package com.pfe.gestion_produits.produit;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ProduitNotFoundException
        extends RuntimeException {

    public ProduitNotFoundException(Long id) {
        super("Produit non trouvé avec l'id : " + id);
    }

    public ProduitNotFoundException(String codeBarres) {
        super("Aucun produit avec ce code-barres : "
                + codeBarres);
    }
}