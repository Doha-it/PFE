package com.pfe.gestion_produits.utilisateur.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UtilisateurUpdateRequest {

    @Size(min = 2, max = 100, message = "Entre 2 et 100 caractères")
    private String nom;        // optionnel

    @Email(message = "Format email invalide")
    private String email;      // optionnel

    @Size(min = 4, message = "Minimum 4 caractères")
    private String motDePasse; // optionnel

    @Pattern(regexp = "^[0-9+\\s\\-]{6,20}$", message = "Numéro de téléphone invalide")
    private String telephone; // optionnel

}
