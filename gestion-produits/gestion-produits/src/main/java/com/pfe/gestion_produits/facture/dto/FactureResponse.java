package com.pfe.gestion_produits.facture.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Ce qu'on retourne au client
// La facture avec tous ses détails
@Data
public class FactureResponse {

    private Long id;

    // Numéro de la vente associée
    private Long venteId;

    // Nom du caissier qui a fait la vente
    private String nomCaissier;

    private LocalDateTime date;
    private BigDecimal total;
}