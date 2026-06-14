package com.pfe.gestion_produits.facture;
import com.pfe.gestion_produits.vente.Vente;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "factures")
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @OneToOne = 1 vente génère exactement 1 facture
    // C'est différent de @ManyToOne !
    // Correspond à ton diagramme : Vente 1 -------- 1 Facture
    @OneToOne
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;

    private LocalDateTime date;

    @Column(nullable = false)
    private BigDecimal total;
}