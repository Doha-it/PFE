package com.pfe.gestion_produits.vente.dto;
import lombok.Data;
import java.math.BigDecimal;

// Détail d'une ligne de vente
// Retourné quand on ajoute un article
@Data
public class DetailVenteResponse {

    private Long id;
    private String nomProduit;
    private String codeBarres;
    private Integer quantite;
    private BigDecimal prix;
    private BigDecimal sousTotal;
    private Long utilisateurId;
}