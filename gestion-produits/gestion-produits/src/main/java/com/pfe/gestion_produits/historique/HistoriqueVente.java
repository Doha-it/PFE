package com.pfe.gestion_produits.historique;

import com.pfe.gestion_produits.vente.Vente;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "historique_ventes")
public class HistoriqueVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Chaque entrée historique est liée à une vente
    // Plusieurs historiques peuvent pointer
    // vers la même vente
    @ManyToOne
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;

    // Date et heure de l'enregistrement
    @Column(name = "date_vente")
    private LocalDateTime dateVente;

    // Total copié depuis la vente
    // Pour garder une trace même si la vente change
    @Column(nullable = false)
    private BigDecimal total;
}