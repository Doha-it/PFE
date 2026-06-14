package com.pfe.gestion_produits.categorie;

import org.springframework.data.jpa.repository
        .JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategorieRepository
        extends JpaRepository<Categorie, Long> {
}
