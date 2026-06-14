package com.pfe.gestion_produits.produit.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProduitRequest {

    // Nom du produit
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 200,
            message = "Le nom doit avoir entre 2 et 200 caractères")
    private String nom;

    // Code-barres unique
    // C'est l'élément central de tout le projet !
    @NotBlank(message = "Le code-barres est obligatoire")
    private String codeBarres;

    // Prix du produit
    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private BigDecimal prix;

    // Quantité en stock
    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 0,
            message = "La quantité ne peut pas être négative")
    private Integer quantite;

    // Fournisseur optionnel
    // Un produit peut exister sans fournisseur
    private Long fournisseurId;
    // Ajouter dans ProduitRequest :
    private Long categorieId;
}