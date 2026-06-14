package com.pfe.gestion_produits.fournisseur;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FournisseurService {

    private final FournisseurRepository fournisseurRepository;

    public List<Fournisseur> getTous() {
        return fournisseurRepository.findAll();
    }

    public Fournisseur getParId(Long id) {
        return fournisseurRepository.findById(id)
                .orElseThrow(() -> new FournisseurNotFoundException(id));
    }

    public Fournisseur ajouter(Fournisseur fournisseur) {
        return fournisseurRepository.save(fournisseur);
    }

    public Fournisseur modifier(Long id, Fournisseur nouvelleDonnees) {
        Fournisseur fournisseur = getParId(id);
        fournisseur.setNom(nouvelleDonnees.getNom());
        fournisseur.setTelephone(nouvelleDonnees.getTelephone());
        fournisseur.setEmail(nouvelleDonnees.getEmail());
        return fournisseurRepository.save(fournisseur);
    }

    public void supprimer(Long id) {
        getParId(id);
        fournisseurRepository.deleteById(id);
    }

    public List<Fournisseur> rechercherParNom(String nom) {
        return fournisseurRepository.findByNomContaining(nom);
    }
}