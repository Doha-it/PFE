package com.pfe.gestion_produits.fournisseur.dto;

import lombok.Data;

@Data
public class FournisseurResponse {

    private Long id;
    private String nom;
    private String telephone;
    private String email;
}