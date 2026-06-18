package com.pfe.gestion_produits.produit;

import com.pfe.gestion_produits.categorie.Categorie;
import com.pfe.gestion_produits.categorie.CategorieRepository;
import com.pfe.gestion_produits.fournisseur.Fournisseur;
import com.pfe.gestion_produits.fournisseur.FournisseurRepository;
import com.pfe.gestion_produits.produit.dto.ProduitRequest;
import com.pfe.gestion_produits.produit.dto.ProduitResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/produits")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProduitController {

    private final ProduitService produitService;
    private final FournisseurRepository fournisseurRepository;
    private final CategorieRepository categorieRepository;

    @PostMapping
    public ResponseEntity<ProduitResponse> ajouter(
            @Valid @RequestBody ProduitRequest request) {

        Produit produit = new Produit();
        produit.setNom(request.getNom());
        produit.setCodeBarres(request.getCodeBarres());
        produit.setPrix(request.getPrix());
        produit.setQuantite(request.getQuantite());

        // Fournisseur
        if (request.getFournisseurId() != null) {
            fournisseurRepository
                    .findById(request.getFournisseurId())
                    .ifPresent(produit::setFournisseur);
        }

        // Catégorie — géré ici dans Controller !
        if (request.getCategorieId() != null) {
            categorieRepository
                    .findById(request.getCategorieId())
                    .ifPresent(produit::setCategorie);
        }

        return ResponseEntity.ok(
                convertirEnResponse(
                        produitService.ajouter(produit)
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<ProduitResponse>> getTous() {
        return ResponseEntity.ok(
                produitService.getTous()
                        .stream()
                        .map(this::convertirEnResponse)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/scan/{codeBarres}")
    public ResponseEntity<ProduitResponse> scanner(
            @PathVariable String codeBarres) {
        return ResponseEntity.ok(
                convertirEnResponse(
                        produitService.getParCodeBarres(codeBarres)
                )
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ProduitResponse> getParId(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                convertirEnResponse(
                        produitService.getParId(id)
                )
        );
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<ProduitResponse>> rechercher(
            @RequestParam String nom) {
        return ResponseEntity.ok(
                produitService.rechercherParNom(nom)
                        .stream()
                        .map(this::convertirEnResponse)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/stock-faible")
    public ResponseEntity<List<ProduitResponse>> stockFaible(
            @RequestParam(defaultValue = "20") int seuil) {
        return ResponseEntity.ok(
                produitService.getStockFaible(seuil)
                        .stream()
                        .map(this::convertirEnResponse)
                        .collect(Collectors.toList())
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProduitResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody ProduitRequest request) {

        Produit nouvelleDonnees = new Produit();
        nouvelleDonnees.setNom(request.getNom());
        nouvelleDonnees.setCodeBarres(
                request.getCodeBarres()
        );
        nouvelleDonnees.setPrix(request.getPrix());
        nouvelleDonnees.setQuantite(request.getQuantite());

        if (request.getFournisseurId() != null) {
            fournisseurRepository
                    .findById(request.getFournisseurId())
                    .ifPresent(nouvelleDonnees::setFournisseur);
        }

        // Catégorie
        if (request.getCategorieId() != null) {
            categorieRepository
                    .findById(request.getCategorieId())
                    .ifPresent(nouvelleDonnees::setCategorie);
        }

        return ResponseEntity.ok(
                convertirEnResponse(
                        produitService.modifier(id, nouvelleDonnees)
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> supprimer(
            @PathVariable Long id) {
        produitService.supprimer(id);
        return ResponseEntity.ok(
                "Produit supprimé avec succès !"
        );
    }


    private ProduitResponse convertirEnResponse(
            Produit produit) {
        ProduitResponse response = new ProduitResponse();
        response.setId(produit.getId());
        response.setNom(produit.getNom());
        response.setCodeBarres(produit.getCodeBarres());
        response.setPrix(produit.getPrix());
        response.setQuantite(produit.getQuantite());

        if (produit.getFournisseur() != null) {
            response.setNomFournisseur(
                    produit.getFournisseur().getNom()
            );
            response.setFournisseurId(
                    produit.getFournisseur().getId());

        }



        // Catégorie
        if (produit.getCategorie() != null) {
            response.setCategorieId(
                    produit.getCategorie().getId()
            );
            response.setNomCategorie(
                    produit.getCategorie().getNom()
            );
            response.setIconeCategorie(
                    produit.getCategorie().getIcone()
            );
        }

        return response;
    }
}