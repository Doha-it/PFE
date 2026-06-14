package com.pfe.gestion_produits.historique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HistoriqueRepository
        extends JpaRepository<HistoriqueVente, Long> {

    // Historique d'une vente précise
    // SELECT * FROM historique_ventes
    // WHERE vente_id = ?
    List<HistoriqueVente> findByVenteId(Long venteId);

    // Filtrer par période
    // Correspond à filtrerParDate() du diagramme
    // SELECT * FROM historique_ventes
    // WHERE date_vente BETWEEN ? AND ?
    List<HistoriqueVente> findByDateVenteBetween(
            LocalDateTime debut,
            LocalDateTime fin
    );
}
