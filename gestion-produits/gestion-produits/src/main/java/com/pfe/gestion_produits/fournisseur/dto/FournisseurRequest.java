package com.pfe.gestion_produits.fournisseur.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FournisseurRequest {

    @NotBlank(message = "Le nom du fournisseur est obligatoire")
    @Size(min = 2, max = 100,
            message = "Le nom doit avoir entre 2 et 100 caractères")
    private String nom;

    // Téléphone : optionnel, mais si fourni → format valide
    // Accepte : 0612345678 / +212612345678 / +33 6 12 34 56 78
    @Pattern(
            regexp = "^(\\+?[0-9][\\s\\-]?){6,19}[0-9]$",
            message = "Numéro de téléphone invalide"
    )
    @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères")
    private String telephone;

    // Email : optionnel, mais si fourni → format valide (exemple@domaine.ext)
    @Email(message = "L'adresse email doit être valide (ex: contact@example.com)")
    @Size(max = 150, message = "L'email ne doit pas dépasser 150 caractères")
    private String email;
}