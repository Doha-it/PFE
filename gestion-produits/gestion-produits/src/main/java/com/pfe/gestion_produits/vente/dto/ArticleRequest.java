package com.pfe.gestion_produits.vente.dto;
import jakarta.validation.constraints.*;
import lombok.Data;

// Pour ajouter un article à la vente
// Le caissier scanne le code-barres
// et précise la quantité
@Data
public class ArticleRequest {

    // Le code-barres scanné par le caissier
    @NotBlank(message = "Le code-barres est obligatoire")
    private String codeBarres;

    // La quantité vendue
    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité minimum est 1")
    private Integer quantite;
}