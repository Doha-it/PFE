package com.pfe.gestion_produits.utilisateur;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public Utilisateur creer(Utilisateur utilisateur) {
        if (utilisateurRepository
                .existsByEmail(utilisateur.getEmail())) {
            throw new RuntimeException(
                    "Cet email est déjà utilisé !"
            );
        }
        utilisateur.setMotDePasse(
                passwordEncoder.encode(
                        utilisateur.getMotDePasse()
                )
        );
        utilisateur.setCreatedAt(LocalDateTime.now());
        return utilisateurRepository.save(utilisateur);
    }

    public List<Utilisateur> getTous() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur getParId(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new UtilisateurNotFoundException(id)
                );
    }

    public Utilisateur getParEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UtilisateurNotFoundException(email)
                );
    }

    public Utilisateur modifier(Long id, Utilisateur nouvelleDonnees) {
        Utilisateur utilisateur = getParId(id);

        if (nouvelleDonnees.getNom() != null && !nouvelleDonnees.getNom().isBlank())
            utilisateur.setNom(nouvelleDonnees.getNom());

        if (nouvelleDonnees.getEmail() != null && !nouvelleDonnees.getEmail().isBlank())
            utilisateur.setEmail(nouvelleDonnees.getEmail());

        if (nouvelleDonnees.getMotDePasse() != null && !nouvelleDonnees.getMotDePasse().isBlank())
            utilisateur.setMotDePasse(passwordEncoder.encode(nouvelleDonnees.getMotDePasse()));
        if (nouvelleDonnees.getTelephone() != null && !nouvelleDonnees.getTelephone().isBlank())
            utilisateur.setTelephone(nouvelleDonnees.getTelephone());

        return utilisateurRepository.save(utilisateur);
    }

    public void supprimer(Long id) {
        Utilisateur utilisateur = getParId(id);

        // Vérifier que c'est pas le dernier admin !
        if (utilisateur.getRole() ==
                Utilisateur.Role.admin) {

            // Compter les admins restants
            long nbAdmins = utilisateurRepository
                    .findAll()
                    .stream()
                    .filter(u ->
                            u.getRole() == Utilisateur.Role.admin
                    )
                    .count();

            // Si c'est le dernier admin → refuser !
            if (nbAdmins <= 1) {
                throw new RuntimeException(
                        "Impossible de supprimer le dernier " +
                                "administrateur du système !"
                );
            }
        }

        utilisateurRepository.deleteById(id);
    }
}