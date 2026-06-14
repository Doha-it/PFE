package com.pfe.gestion_produits.vente.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ArticleQuantiteRequest {

    @NotNull
    @Min(0)
    private Integer quantite;
}