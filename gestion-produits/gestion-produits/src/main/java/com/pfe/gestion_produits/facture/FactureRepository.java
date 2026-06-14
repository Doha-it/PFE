package com.pfe.gestion_produits.facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FactureRepository
        extends JpaRepository<Facture, Long> {

    // Trouver la facture associée à une vente
    Optional<Facture> findByVenteId(Long venteId);
}