package com.pfe.gestion_produits.fournisseur;

import com.pfe.gestion_produits.fournisseur.dto.FournisseurRequest;
import com.pfe.gestion_produits.fournisseur.dto.FournisseurResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fournisseurs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FournisseurController {

    private final FournisseurService fournisseurService;

    // ════════════════════════════════════════
    // AJOUTER UN FOURNISSEUR
    // POST /api/fournisseurs
    // ════════════════════════════════════════
    @PostMapping
    public ResponseEntity<FournisseurResponse> ajouter(
            @Valid @RequestBody FournisseurRequest request) {

        Fournisseur fournisseur = new Fournisseur();
        fournisseur.setNom(request.getNom());
        fournisseur.setTelephone(request.getTelephone());
        fournisseur.setEmail(request.getEmail());

        Fournisseur sauvegarde = fournisseurService.ajouter(fournisseur);
        return ResponseEntity.ok(convertirEnResponse(sauvegarde));
    }

    // ════════════════════════════════════════
    // RÉCUPÉRER TOUS LES FOURNISSEURS
    // GET /api/fournisseurs
    // ════════════════════════════════════════
    @GetMapping
    public ResponseEntity<List<FournisseurResponse>> getTous() {
        List<FournisseurResponse> liste = fournisseurService
                .getTous()
                .stream()
                .map(this::convertirEnResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(liste);
    }

    // ════════════════════════════════════════
    // RÉCUPÉRER UN FOURNISSEUR PAR ID
    // GET /api/fournisseurs/1
    // ════════════════════════════════════════
    @GetMapping("/{id}")
    public ResponseEntity<FournisseurResponse> getParId(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                convertirEnResponse(fournisseurService.getParId(id))
        );
    }

    // ════════════════════════════════════════
    // RECHERCHER PAR NOM
    // GET /api/fournisseurs/recherche?nom=coca
    // ════════════════════════════════════════
    @GetMapping("/recherche")
    public ResponseEntity<List<FournisseurResponse>> rechercher(
            @RequestParam String nom) {
        List<FournisseurResponse> liste = fournisseurService
                .rechercherParNom(nom)
                .stream()
                .map(this::convertirEnResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(liste);
    }

    // ════════════════════════════════════════
    // MODIFIER UN FOURNISSEUR
    // PUT /api/fournisseurs/1
    // ════════════════════════════════════════
    @PutMapping("/{id}")
    public ResponseEntity<FournisseurResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody FournisseurRequest request) {

        Fournisseur nouvelleDonnees = new Fournisseur();
        nouvelleDonnees.setNom(request.getNom());
        nouvelleDonnees.setTelephone(request.getTelephone());
        nouvelleDonnees.setEmail(request.getEmail());

        return ResponseEntity.ok(
                convertirEnResponse(
                        fournisseurService.modifier(id, nouvelleDonnees)
                )
        );
    }

    // ════════════════════════════════════════
    // SUPPRIMER UN FOURNISSEUR
    // DELETE /api/fournisseurs/1
    // ════════════════════════════════════════
    @DeleteMapping("/{id}")
    public ResponseEntity<String> supprimer(@PathVariable Long id) {
        fournisseurService.supprimer(id);
        return ResponseEntity.ok("Fournisseur supprimé avec succès !");
    }

    // ════════════════════════════════════════
    // MÉTHODE PRIVÉE — Convertir entité → DTO
    // ════════════════════════════════════════
    private FournisseurResponse convertirEnResponse(Fournisseur fournisseur) {
        FournisseurResponse response = new FournisseurResponse();
        response.setId(fournisseur.getId());
        response.setNom(fournisseur.getNom());
        response.setTelephone(fournisseur.getTelephone());
        response.setEmail(fournisseur.getEmail());
        return response;
    }
}