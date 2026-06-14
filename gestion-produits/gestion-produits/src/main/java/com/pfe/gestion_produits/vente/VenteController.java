package com.pfe.gestion_produits.vente;
import com.pfe.gestion_produits.vente.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ventes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VenteController {

    private final VenteService venteService;
    private final DetailVenteRepository detailVenteRepository;

    // ════════════════════════════════════════
    // CRÉER UNE NOUVELLE VENTE
    // POST /api/ventes
    // Le caissier commence une nouvelle vente
    // Correspond à créerVente() du diagramme
    // ════════════════════════════════════════
    @PostMapping
    public ResponseEntity<VenteResponse> creerVente(
            @Valid @RequestBody VenteRequest request) {

        Vente vente = venteService
                .creerVente(request.getUtilisateurId());

        return ResponseEntity.ok(
                convertirEnResponse(vente)
        );
    }

    // ════════════════════════════════════════
    // AJOUTER UN ARTICLE À LA VENTE
    // POST /api/ventes/1/articles
    // Le caissier scanne un produit
    // Correspond à ajouterArticle() du diagramme
    // ════════════════════════════════════════
    @PostMapping("/{venteId}/articles")
    public ResponseEntity<DetailVenteResponse> ajouterArticle(
            // L'id de la vente dans l'URL
            @PathVariable Long venteId,
            @Valid @RequestBody ArticleRequest request) {

        DetailVente detail = venteService.ajouterArticle(
                venteId,
                request.getCodeBarres(),
                request.getQuantite()
        );

        return ResponseEntity.ok(
                convertirDetailEnResponse(detail)
        );
    }

    // ════════════════════════════════════════
    // MODIFIER LA QUANTITÉ D'UN ARTICLE
    // PUT /api/ventes/1/articles/{codeBarres}
    // Le caissier ajuste +/- ou supprime (quantite=0)
    // un article depuis le panier
    // ════════════════════════════════════════
    @PutMapping("/{venteId}/articles/{codeBarres}")
    public ResponseEntity<DetailVenteResponse> modifierQuantiteArticle(
            @PathVariable Long venteId,
            @PathVariable String codeBarres,
            @Valid @RequestBody ArticleQuantiteRequest request) {

        DetailVente detail = venteService.modifierQuantiteArticle(
                venteId,
                codeBarres,
                request.getQuantite()
        );

        return ResponseEntity.ok(
                convertirDetailEnResponse(detail)
        );
    }

    // ════════════════════════════════════════
    // VOIR LES ARTICLES D'UNE VENTE
    // GET /api/ventes/1/articles
    // Le caissier voit ce qui est dans sa vente
    // ════════════════════════════════════════
    @GetMapping("/{venteId}/articles")
    public ResponseEntity<List<DetailVenteResponse>>
    getArticles(@PathVariable Long venteId) {

        List<DetailVenteResponse> articles =
                detailVenteRepository
                        .findByVenteId(venteId)
                        .stream()
                        .map(this::convertirDetailEnResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(articles);
    }

    // ════════════════════════════════════════
    // VALIDER LA VENTE
    // PUT /api/ventes/1/valider
    // Le caissier confirme la vente
    // → Stock mis à jour automatiquement
    // → Statut devient "validee"
    // Correspond à validerVente() du diagramme
    // ════════════════════════════════════════
    @PutMapping("/{venteId}/valider")
    public ResponseEntity<VenteResponse> validerVente(
            @PathVariable Long venteId) {

        Vente vente = venteService.validerVente(venteId);

        return ResponseEntity.ok(
                convertirEnResponse(vente)
        );
    }

    // ════════════════════════════════════════
    // ANNULER LA VENTE
    // PUT /api/ventes/1/annuler
    // Le caissier annule la vente
    // → Stock NON touché
    // → Statut devient "annulee"
    // Correspond à annulerVente() du diagramme
    // ════════════════════════════════════════
    @PutMapping("/{venteId}/annuler")
    public ResponseEntity<VenteResponse> annulerVente(
            @PathVariable Long venteId) {

        Vente vente = venteService.annulerVente(venteId);

        return ResponseEntity.ok(
                convertirEnResponse(vente)
        );
    }

    // ════════════════════════════════════════
    // VOIR TOUTES LES VENTES
    // GET /api/ventes
    // L'admin consulte toutes les ventes
    // ════════════════════════════════════════
    @GetMapping
    public ResponseEntity<List<VenteResponse>> getToutesVentes() {

        List<VenteResponse> ventes = venteService
                .getToutesLesVentes()
                .stream()
                .map(this::convertirEnResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ventes);
    }

    // ════════════════════════════════════════
    // VOIR UNE VENTE PAR ID
    // GET /api/ventes/1
    // ════════════════════════════════════════
    @GetMapping("/{id}")
    public ResponseEntity<VenteResponse> getParId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                convertirEnResponse(
                        venteService.getParId(id)
                )
        );
    }

    // ════════════════════════════════════════
    // VOIR LES VENTES D'UN CAISSIER
    // GET /api/ventes/caissier/1
    // ════════════════════════════════════════
    @GetMapping("/caissier/{utilisateurId}")
    public ResponseEntity<List<VenteResponse>>
    getVentesCaissier(
            @PathVariable Long utilisateurId) {

        List<VenteResponse> ventes = venteService
                .getVentesParCaissier(utilisateurId)
                .stream()
                .map(this::convertirEnResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ventes);
    }

    // ════════════════════════════════════════
    // MÉTHODE PRIVÉE — Vente → VenteResponse
    // ════════════════════════════════════════
    private VenteResponse convertirEnResponse(Vente vente) {

        VenteResponse response = new VenteResponse();
        response.setId(vente.getId());
        response.setDate(vente.getDate());
        response.setTotal(vente.getTotal());
        response.setStatut(vente.getStatut().name());

        // Nom du caissier qui a fait la vente
        if (vente.getUtilisateur() != null) {
            response.setNomCaissier(vente.getUtilisateur().getNom());
            response.setUtilisateurId(vente.getUtilisateur().getId());
        }

        return response;
    }

    // ════════════════════════════════════════
    // MÉTHODE PRIVÉE — DetailVente → DTO
    // ════════════════════════════════════════
    private DetailVenteResponse convertirDetailEnResponse(
            DetailVente detail) {

        DetailVenteResponse response =
                new DetailVenteResponse();
        response.setId(detail.getId());
        response.setQuantite(detail.getQuantite());
        response.setPrix(detail.getPrix());

        // Nom et code-barres du produit
        if (detail.getProduit() != null) {
            response.setNomProduit(
                    detail.getProduit().getNom()
            );
            response.setCodeBarres(
                    detail.getProduit().getCodeBarres()
            );
        }

        // Sous-total = prix × quantité
        response.setSousTotal(
                detail.getPrix().multiply(
                        java.math.BigDecimal.valueOf(
                                detail.getQuantite()
                        )
                )
        );

        return response;
    }
}