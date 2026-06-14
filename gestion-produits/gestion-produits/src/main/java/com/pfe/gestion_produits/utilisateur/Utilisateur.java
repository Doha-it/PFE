package com.pfe.gestion_produits.utilisateur;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

// @Data = génère getters, setters, toString
@Data
// @Entity = cette classe = une table MySQL
@Entity
// @Table = nom exact de la table
@Table(name = "utilisateurs")
public class Utilisateur {

    // Clé primaire AUTO_INCREMENT
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // NOT NULL en BDD
    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String telephone;


    // NOT NULL + UNIQUE en BDD
    @Column(nullable = false, unique = true)
    private String email;

    // Stocke le mot de passe hashé BCrypt
    // JAMAIS en clair !
    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    // Stocke "admin" ou "caissier" en texte
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Date de création du compte
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Liste fixe des rôles autorisés
    public enum Role {
        admin,
        caissier
    }
}