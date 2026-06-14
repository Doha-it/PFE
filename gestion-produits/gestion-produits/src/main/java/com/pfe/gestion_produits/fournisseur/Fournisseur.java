package com.pfe.gestion_produits.fournisseur;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "fournisseurs")
public class Fournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    // Numéro de téléphone (optionnel)
    private String telephone;

    // Adresse email (optionnel)
    private String email;
}