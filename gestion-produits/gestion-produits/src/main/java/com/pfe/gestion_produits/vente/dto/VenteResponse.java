package com.pfe.gestion_produits.vente.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Ce qu'on retourne au client
@Data
public class VenteResponse {

    private Long id;
    private Long utilisateurId;
    private String nomCaissier;
    private LocalDateTime date;
    private BigDecimal total;
    private String statut;
}