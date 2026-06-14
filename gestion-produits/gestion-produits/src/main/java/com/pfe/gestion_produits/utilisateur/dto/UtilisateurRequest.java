package com.pfe.gestion_produits.utilisateur.dto;

import com.pfe.gestion_produits.utilisateur.Utilisateur;
import jakarta.validation.constraints.*;
import lombok.Data;

// Ce que l'admin envoie pour créer/modifier
// un compte utilisateur
@Data
public class UtilisateurRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100,
            message = "Entre 2 et 100 caractères")
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 4,
            message = "Minimum 4 caractères")
    private String motDePasse;

    // @NotNull car enum pas String
    @NotNull(message = "Le rôle est obligatoire")
    private Utilisateur.Role role;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[0-9+\\s\\-]{6,20}$", message = "Numéro invalide")
    private String telephone;
}