package com.pfe.gestion_produits.produit;

import com.pfe.gestion_produits.categorie.CategorieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProduitService {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;

    public List<Produit> getTous() {
        return produitRepository.findAll();
    }

    public Produit getParId(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() ->
                        new ProduitNotFoundException(id)
                );
    }

    public Produit getParCodeBarres(String codeBarres) {
        return produitRepository
                .findByCodeBarres(codeBarres)
                .orElseThrow(() ->
                        new ProduitNotFoundException(codeBarres)
                );
    }

    public Produit ajouter(Produit produit) {
        if (produitRepository.existsByCodeBarres(
                produit.getCodeBarres())) {
            throw new RuntimeException(
                    "Ce code-barres existe déjà !"
            );
        }
        // La catégorie est déjà dans produit
        // car gérée dans le Controller !
        return produitRepository.save(produit);
    }

    public Produit modifier(Long id,
                            Produit nouvelleDonnees) {
        Produit produit = getParId(id);
        produit.setNom(nouvelleDonnees.getNom());
        produit.setPrix(nouvelleDonnees.getPrix());
        produit.setQuantite(
                nouvelleDonnees.getQuantite()
        );
        produit.setCodeBarres(
                nouvelleDonnees.getCodeBarres()
        );
        produit.setFournisseur(
                nouvelleDonnees.getFournisseur()
        );
        // La catégorie est gérée dans le Controller !
        produit.setCategorie(
                nouvelleDonnees.getCategorie()
        );
        return produitRepository.save(produit);
    }

    public void supprimer(Long id) {
        getParId(id);
        produitRepository.deleteById(id);
    }

    public void mettreAJourStock(Long id,
                                 int quantiteVendue) {
        Produit produit = getParId(id);
        if (produit.getQuantite() < quantiteVendue) {
            throw new RuntimeException(
                    "Stock insuffisant ! Disponible : "
                            + produit.getQuantite()
            );
        }
        produit.setQuantite(
                produit.getQuantite() - quantiteVendue
        );
        produitRepository.save(produit);
    }

    public List<Produit> rechercherParNom(String nom) {
        return produitRepository
                .findByNomContaining(nom);
    }

    public List<Produit> getStockFaible(int seuil) {
        return produitRepository
                .findByQuantiteLessThanEqual(seuil);
    }
}