package com.pfe.gestion_produits.historique.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Ce qu'on retourne au client
@Data
public class HistoriqueResponse {

    private Long id;

    // Id de la vente associée
    private Long venteId;

    // Nom du caissier qui a fait la vente
    private String nomCaissier;

    // Date et heure de la vente
    private LocalDateTime dateVente;

    // Total de la vente
    private BigDecimal total;

    // Statut de la vente
    private String statut;
}