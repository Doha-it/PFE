package com.pfe.gestion_produits.produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProduitRepository
        extends JpaRepository<Produit, Long> {

    // LA méthode centrale de tout ton projet !
    // Correspond à scannerCodeBarres() dans ton diagramme
    // SELECT * FROM produits WHERE code_barres = ?
    Optional<Produit> findByCodeBarres(String codeBarres);

    // Pour la barre de recherche de l'admin
    // SELECT * FROM produits WHERE nom LIKE '%valeur%'
    List<Produit> findByNomContaining(String nom);

    // Alerte stock faible
    // SELECT * FROM produits WHERE quantite < ?
    List<Produit> findByQuantiteLessThanEqual(Integer quantite);

    // Vérifie si un code-barres existe déjà avant d'ajouter
    boolean existsByCodeBarres(String codeBarres);
}