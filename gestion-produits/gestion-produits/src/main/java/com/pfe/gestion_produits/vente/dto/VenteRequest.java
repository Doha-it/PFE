package com.pfe.gestion_produits.vente.dto;
import jakarta.validation.constraints.*;
import lombok.Data;

// Pour créer une nouvelle vente
// On a juste besoin de l'id du caissier
@Data
public class VenteRequest {

    @NotNull(message = "L'id du caissier est obligatoire")
    private Long utilisateurId;
}