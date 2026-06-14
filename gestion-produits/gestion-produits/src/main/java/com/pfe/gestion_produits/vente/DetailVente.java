package com.pfe.gestion_produits.vente;
import com.pfe.gestion_produits.produit.Produit;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "detail_ventes")
public class DetailVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Plusieurs lignes appartiennent à une seule vente
    @ManyToOne
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;

    // Chaque ligne concerne un produit
    @ManyToOne
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Column(nullable = false)
    private Integer quantite = 1;

    // IMPORTANT : on stocke le prix ICI et pas seulement dans Produit
    // Raison : si le prix du produit change demain,
    // l'historique des ventes passées reste correct !
    @Column(nullable = false)
    private BigDecimal prix;
}