package com.pfe.gestion_produits.vente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VenteRepository
        extends JpaRepository<Vente, Long> {

    // Toutes les ventes d'un caissier précis
    List<Vente> findByUtilisateurId(Long utilisateurId);

    // Filtrer par statut : en_cours, validee, annulee
    List<Vente> findByStatut(Vente.Statut statut);

    // Filtrer entre deux dates
    // Correspond à filtrerParDate() de ton diagramme
    List<Vente> findByDateBetween(
            LocalDateTime debut,
            LocalDateTime fin
    );
}
