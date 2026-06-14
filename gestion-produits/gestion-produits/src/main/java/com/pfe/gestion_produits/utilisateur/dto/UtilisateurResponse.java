package com.pfe.gestion_produits.utilisateur.dto;

import com.pfe.gestion_produits.utilisateur.Utilisateur;
import lombok.Data;
import java.time.LocalDateTime;

// Ce qu'on retourne au client
// SANS mot de passe !
@Data
public class UtilisateurResponse {

    private Long id;
    private String nom;
    private String telephone;
    private String email;
    private Utilisateur.Role role;
    private LocalDateTime createdAt;

    // PAS de motDePasse ici !
    // Même hashé on ne le retourne jamais
}