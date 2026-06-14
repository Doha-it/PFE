package com.pfe.gestion_produits.vente;
import com.pfe.gestion_produits.utilisateur.Utilisateur;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ventes")
public class Vente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Le caissier qui a effectué la vente
    // Relation : 1 utilisateur peut faire 0..* ventes
    // C'est ton diagramme : Utilisateur 1 -------- 0..* Vente
    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    // Date et heure de la vente
    private LocalDateTime date;

    // Total de la vente, commence à 0
    // On l'incrémente à chaque article ajouté
    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    // Le statut suit le cycle de vie d'une vente :
    // en_cours → validee (ou annulee)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut = Statut.en_cours;

    public enum Statut {
        en_cours,  // La vente est en train d'être faite
        validee,   // La vente est confirmée, stock mis à jour
        annulee    // La vente est annulée
    }
}
