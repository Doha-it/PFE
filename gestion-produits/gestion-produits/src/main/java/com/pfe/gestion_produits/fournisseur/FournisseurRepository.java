package com.pfe.gestion_produits.fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FournisseurRepository
        extends JpaRepository<Fournisseur, Long> {

    // Containing = LIKE en SQL
    // SELECT * FROM fournisseurs WHERE nom LIKE '%valeur%'
    // Utile pour une barre de recherche
    List<Fournisseur> findByNomContaining(String nom);
}