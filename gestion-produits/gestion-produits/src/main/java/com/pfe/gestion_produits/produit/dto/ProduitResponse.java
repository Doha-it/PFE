package com.pfe.gestion_produits.produit.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProduitResponse {

    private Long id;
    private String nom;
    private String codeBarres;
    private BigDecimal prix;
    private Integer quantite;


    private String nomFournisseur;
    private Long fournisseurId;

    private Long categorieId;
    private String nomCategorie;
    private String iconeCategorie;
}