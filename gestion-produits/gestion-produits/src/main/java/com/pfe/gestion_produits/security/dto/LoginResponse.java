package com.pfe.gestion_produits.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String token;
    private String role;
    private String nom;
    private String email;      // ← ajouter
    private String telephone;  // ← ajouter
}