package com.pfe.gestion_produits.facture;

import com.pfe.gestion_produits.facture.dto.FactureResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FactureController {

    private final FactureService factureService;

    // ════════════════════════════════════════
    // GÉNÉRER UNE FACTURE
    // POST /api/factures/generer/{venteId}
    // Appelée après validation d'une vente
    // Correspond à générerFacture() du diagramme
    // ════════════════════════════════════════
    @PostMapping("/generer/{venteId}")
    public ResponseEntity<FactureResponse> generer(
            @PathVariable Long venteId) {

        // Le Service vérifie :
        // 1. La vente existe
        // 2. Pas de facture déjà générée
        Facture facture = factureService
                .genererFacture(venteId);

        return ResponseEntity.ok(
                convertirEnResponse(facture)
        );
    }

    // ════════════════════════════════════════
    // RÉCUPÉRER UNE FACTURE PAR ID
    // GET /api/factures/1
    // Correspond à imprimerFacture() du diagramme
    // ════════════════════════════════════════
    @GetMapping("/{id}")
    public ResponseEntity<FactureResponse> getParId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                convertirEnResponse(
                        factureService.getParId(id)
                )
        );
    }

    // ════════════════════════════════════════
    // RÉCUPÉRER LA FACTURE D'UNE VENTE
    // GET /api/factures/vente/1
    // Le caissier cherche la facture
    // associée à une vente précise
    // ════════════════════════════════════════
    @GetMapping("/vente/{venteId}")
    public ResponseEntity<FactureResponse> getParVente(
            @PathVariable Long venteId) {

        return ResponseEntity.ok(
                convertirEnResponse(
                        factureService.getParVenteId(venteId)
                )
        );
    }

    // ════════════════════════════════════════
    // VOIR TOUTES LES FACTURES
    // GET /api/factures
    // L'admin consulte toutes les factures
    // ════════════════════════════════════════
    @GetMapping
    public ResponseEntity<List<FactureResponse>> getTout() {

        List<FactureResponse> factures = factureService
                .getTout()
                .stream()
                .map(this::convertirEnResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(factures);
    }

    // ════════════════════════════════════════
    // MÉTHODE PRIVÉE — Facture → FactureResponse
    // ════════════════════════════════════════
    private FactureResponse convertirEnResponse(
            Facture facture) {

        FactureResponse response = new FactureResponse();
        response.setId(facture.getId());
        response.setDate(facture.getDate());
        response.setTotal(facture.getTotal());

        // Récupérer les infos de la vente associée
        if (facture.getVente() != null) {
            response.setVenteId(
                    facture.getVente().getId()
            );

            // Nom du caissier
            if (facture.getVente()
                    .getUtilisateur() != null) {
                response.setNomCaissier(
                        facture.getVente()
                                .getUtilisateur().getNom()
                );
            }
        }

        return response;
    }
}