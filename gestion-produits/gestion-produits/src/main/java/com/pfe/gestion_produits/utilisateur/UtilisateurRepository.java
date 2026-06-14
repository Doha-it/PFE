package com.pfe.gestion_produits.utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UtilisateurRepository
        extends JpaRepository<Utilisateur, Long> {

    // Utilisé lors du LOGIN
    // SELECT * FROM utilisateurs WHERE email = ?
    Optional<Utilisateur> findByEmail(String email);

    // Vérifie si email existe déjà
    // avant de créer un compte
    boolean existsByEmail(String email);
}