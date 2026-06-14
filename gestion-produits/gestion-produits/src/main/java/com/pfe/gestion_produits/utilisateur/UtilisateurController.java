package com.pfe.gestion_produits.utilisateur;
import com.pfe.gestion_produits.utilisateur.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    // ════════════════════════════════════════
    // CRÉER UN UTILISATEUR
    // POST /api/utilisateurs
    // Admin crée un compte caissier
    // ════════════════════════════════════════
    @PostMapping
    public ResponseEntity<UtilisateurResponse> creer(
            @Valid @RequestBody
            UtilisateurRequest request) {

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(request.getEmail());
        // En clair ici → Service va hasher
        utilisateur.setMotDePasse(
                request.getMotDePasse()
        );
        utilisateur.setRole(request.getRole());
        utilisateur.setTelephone(request.getTelephone());

        Utilisateur sauvegarde =
                utilisateurService.creer(utilisateur);

        return ResponseEntity.ok(
                convertirEnResponse(sauvegarde)
        );
    }

    // ════════════════════════════════════════
    // VOIR TOUS LES UTILISATEURS
    // GET /api/utilisateurs
    // ════════════════════════════════════════
    @GetMapping
    public ResponseEntity<List<UtilisateurResponse>>
    getTous() {

        List<UtilisateurResponse> liste =
                utilisateurService.getTous()
                        .stream()
                        .map(this::convertirEnResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(liste);
    }

    // ════════════════════════════════════════
    // VOIR UN UTILISATEUR PAR ID
    // GET /api/utilisateurs/1
    // ════════════════════════════════════════
    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurResponse> getParId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                convertirEnResponse(
                        utilisateurService.getParId(id)
                )
        );
    }

    // ════════════════════════════════════════
    // MODIFIER UN UTILISATEUR
    // PUT /api/utilisateurs/1
    // ════════════════════════════════════════
    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurResponse> modifier(
            @PathVariable Long id,
            @Valid @RequestBody UtilisateurUpdateRequest request) {

        Utilisateur existant = utilisateurService.getParId(id);

        if (request.getNom() != null && !request.getNom().isBlank())
            existant.setNom(request.getNom());

        if (request.getEmail() != null && !request.getEmail().isBlank())
            existant.setEmail(request.getEmail());

        if (request.getMotDePasse() != null && !request.getMotDePasse().isBlank())
            existant.setMotDePasse(request.getMotDePasse());
        if (request.getTelephone() != null && !request.getTelephone().isBlank())
            existant.setTelephone(request.getTelephone());

        return ResponseEntity.ok(
                convertirEnResponse(utilisateurService.modifier(id, existant))
        );
    }

    // ════════════════════════════════════════
    // SUPPRIMER UN UTILISATEUR
    // DELETE /api/utilisateurs/1
    // ════════════════════════════════════════
    @DeleteMapping("/{id}")
    public ResponseEntity<String> supprimer(
            @PathVariable Long id) {

        utilisateurService.supprimer(id);
        return ResponseEntity.ok(
                "Utilisateur supprimé avec succès !"
        );
    }

    // ════════════════════════════════════════
    // MÉTHODE PRIVÉE — entité → DTO
    // ════════════════════════════════════════
    private UtilisateurResponse convertirEnResponse(
            Utilisateur utilisateur) {

        UtilisateurResponse response =
                new UtilisateurResponse();
        response.setId(utilisateur.getId());
        response.setNom(utilisateur.getNom());
        response.setEmail(utilisateur.getEmail());
        response.setRole(utilisateur.getRole());
        response.setCreatedAt(utilisateur.getCreatedAt());
        response.setTelephone(utilisateur.getTelephone());
        // PAS de motDePasse ! ✅
        return response;
    }
}


