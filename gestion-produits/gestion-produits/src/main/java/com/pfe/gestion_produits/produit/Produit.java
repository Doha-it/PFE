package com.pfe.gestion_produits.produit;
import com.pfe.gestion_produits.fournisseur.Fournisseur;
import com.pfe.gestion_produits.categorie.Categorie;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "produits")
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne = Plusieurs produits peuvent avoir le même fournisseur
    @ManyToOne
    // @JoinColumn = la colonne qui fait le lien (clé étrangère)
    // fournisseur_id dans la table produits
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @Column(nullable = false)
    private String nom;

    // Le code-barres est unique : pas 2 produits avec le même code
    @Column(name = "code_barres", nullable = false, unique = true)
    private String codeBarres;

    // BigDecimal = type recommandé pour l'argent
    // Plus précis que double ou float (pas d'erreurs d'arrondi)
    @Column(nullable = false)
    private BigDecimal prix;

    // Le stock démarre à 0 par défaut
    @Column(nullable = false)
    private Integer quantite = 0;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

}