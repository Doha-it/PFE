package com.pfe.gestion_produits.vente;
import com.pfe.gestion_produits.produit.Produit;
import com.pfe.gestion_produits.produit.ProduitService;
import com.pfe.gestion_produits.historique.HistoriqueService ;
import com.pfe.gestion_produits.utilisateur.Utilisateur;
import com.pfe.gestion_produits.utilisateur.UtilisateurNotFoundException;
import com.pfe.gestion_produits.utilisateur.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VenteService {

    private final VenteRepository venteRepository;
    private final DetailVenteRepository detailVenteRepository;
    private final ProduitService produitService;
    private final UtilisateurRepository utilisateurRepository;
    private final HistoriqueService historiqueService;

    public Vente creerVente(Long utilisateurId) {
        Utilisateur caissier = utilisateurRepository
                .findById(utilisateurId)
                .orElseThrow(() ->
                        new UtilisateurNotFoundException(
                                utilisateurId
                        )
                );
        Vente vente = new Vente();
        vente.setUtilisateur(caissier);
        vente.setDate(LocalDateTime.now());
        vente.setTotal(BigDecimal.ZERO);
        vente.setStatut(Vente.Statut.en_cours);
        return venteRepository.save(vente);
    }

    public DetailVente ajouterArticle(Long venteId,
                                      String codeBarres, int quantite) {

        Vente vente = getParId(venteId);

        if (vente.getStatut() != Vente.Statut.en_cours) {
            throw new RuntimeException(
                    "Cette vente est déjà " + vente.getStatut()
            );
        }

        Produit produit = produitService
                .getParCodeBarres(codeBarres);

        if (produit.getQuantite() < quantite) {
            throw new RuntimeException(
                    "Stock insuffisant ! Disponible : "
                            + produit.getQuantite()
            );
        }

        // ← VÉRIFIER SI LE PRODUIT EXISTE DÉJÀ !
        // Si oui → incrémenter la quantité
        DetailVente detail = detailVenteRepository
                .findByVenteIdAndProduitId(
                        venteId, produit.getId()
                )
                .orElse(null);

        if (detail != null) {
            // Produit déjà dans la vente → incrémenter
            detail.setQuantite(
                    detail.getQuantite() + quantite
            );
            detailVenteRepository.save(detail);
        } else {
            // Nouveau produit → créer la ligne
            detail = new DetailVente();
            detail.setVente(vente);
            detail.setProduit(produit);
            detail.setQuantite(quantite);
            detail.setPrix(produit.getPrix());
            detailVenteRepository.save(detail);
        }

        // Recalculer le total de la vente
        BigDecimal sousTotal = produit.getPrix()
                .multiply(BigDecimal.valueOf(quantite));
        vente.setTotal(vente.getTotal().add(sousTotal));
        venteRepository.save(vente);

        return detail;
    }

    // ════════════════════════════════════════
    // MODIFIER LA QUANTITÉ D'UN ARTICLE
    // Fixe la quantité à une valeur exacte.
    // Si nouvelleQuantite == 0 → supprime la ligne.
    // Vérifie que le stock disponible suffit pour
    // toute augmentation (diff > 0).
    // Recalcule le total de la vente.
    // ════════════════════════════════════════
    public DetailVente modifierQuantiteArticle(Long venteId,
                                               String codeBarres, int nouvelleQuantite) {

        Vente vente = getParId(venteId);

        if (vente.getStatut() != Vente.Statut.en_cours) {
            throw new RuntimeException(
                    "Cette vente est déjà " + vente.getStatut()
            );
        }

        if (nouvelleQuantite < 0) {
            throw new RuntimeException(
                    "La quantité ne peut pas être négative !"
            );
        }

        Produit produit = produitService
                .getParCodeBarres(codeBarres);

        DetailVente detail = detailVenteRepository
                .findByVenteIdAndProduitId(
                        venteId, produit.getId()
                )
                .orElseThrow(() -> new RuntimeException(
                        "Article introuvable dans cette vente !"
                ));

        int ancienneQuantite = detail.getQuantite();
        int diff = nouvelleQuantite - ancienneQuantite;

        // Si on augmente la quantité, vérifier le stock disponible
        if (diff > 0 && produit.getQuantite() < diff) {
            throw new RuntimeException(
                    "Stock insuffisant ! Disponible : "
                            + produit.getQuantite()
            );
        }

        // Ajuster le total de la vente (diff peut être négatif)
        BigDecimal deltaTotal = detail.getPrix()
                .multiply(BigDecimal.valueOf(diff));
        vente.setTotal(vente.getTotal().add(deltaTotal));

        if (nouvelleQuantite == 0) {
            detailVenteRepository.delete(detail);
            venteRepository.save(vente);
            return detail;
        }

        detail.setQuantite(nouvelleQuantite);
        detailVenteRepository.save(detail);
        venteRepository.save(vente);

        return detail;
    }

    public Vente validerVente(Long venteId) {
        Vente vente = getParId(venteId);

        if (vente.getStatut() != Vente.Statut.en_cours) {
            throw new RuntimeException(
                    "Vente déjà traitée !"
            );
        }

        List<DetailVente> details =
                detailVenteRepository
                        .findByVenteId(venteId);

        for (DetailVente detail : details) {
            produitService.mettreAJourStock(
                    detail.getProduit().getId(),
                    detail.getQuantite()
            );
        }

        vente.setStatut(Vente.Statut.validee);
        Vente venteValidee = venteRepository.save(vente);

        // Enregistrer dans l'historique
        historiqueService.enregistrer(venteValidee);

        return venteValidee;
    }

    public Vente annulerVente(Long venteId) {
        Vente vente = getParId(venteId);

        if (vente.getStatut() != Vente.Statut.en_cours) {
            throw new RuntimeException(
                    "Vente déjà traitée !"
            );
        }

        vente.setStatut(Vente.Statut.annulee);
        return venteRepository.save(vente);
    }

    public Vente getParId(Long id) {
        return venteRepository.findById(id)
                .orElseThrow(() ->
                        new VenteNotFoundException(id)
                );
    }

    public List<Vente> getToutesLesVentes() {
        return venteRepository.findAll();
    }

    public List<Vente> getVentesParCaissier(
            Long utilisateurId) {
        return venteRepository
                .findByUtilisateurId(utilisateurId);
    }

}