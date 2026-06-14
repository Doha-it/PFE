package com.pfe.gestion_produits.vente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DetailVenteRepository
        extends JpaRepository<DetailVente, Long> {

    // Tous les articles d'une vente
    // SELECT * FROM detail_ventes WHERE vente_id = ?
    List<DetailVente> findByVenteId(Long venteId);
    Optional<DetailVente> findByVenteIdAndProduitId(
            Long venteId, Long produitId
    );
}