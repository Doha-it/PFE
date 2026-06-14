package com.pfe.gestion_produits.historique;

import com.pfe.gestion_produits.historique.dto.HistoriqueResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/historique")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HistoriqueController {

    private final HistoriqueService historiqueService;

    // ════════════════════════════════════════
    // VOIR TOUT L'HISTORIQUE
    // GET /api/historique
    // Correspond à consulterHistorique()
    // du diagramme
    // ════════════════════════════════════════
    @GetMapping
    public ResponseEntity<List<HistoriqueResponse>>
    getTout() {

        List<HistoriqueResponse> liste =
                historiqueService.getTout()
                        .stream()
                        .map(this::convertirEnResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(liste);
    }

    // ════════════════════════════════════════
    // VOIR UN HISTORIQUE PAR ID
    // GET /api/historique/1
    // ════════════════════════════════════════
    @GetMapping("/{id}")
    public ResponseEntity<HistoriqueResponse> getParId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                convertirEnResponse(
                        historiqueService.getParId(id)
                )
        );
    }

    // ════════════════════════════════════════
    // VOIR L'HISTORIQUE D'UNE VENTE
    // GET /api/historique/vente/1
    // ════════════════════════════════════════
    @GetMapping("/vente/{venteId}")
    public ResponseEntity<List<HistoriqueResponse>>
    getParVente(@PathVariable Long venteId) {

        List<HistoriqueResponse> liste =
                historiqueService.getParVente(venteId)
                        .stream()
                        .map(this::convertirEnResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(liste);
    }

    // ════════════════════════════════════════
    // FILTRER PAR PÉRIODE
    // GET /api/historique/filter?debut=...&fin=...
    // Correspond à filtrerParDate() du diagramme
    // Exemple :
    // /api/historique/filter?
    // debut=2024-01-01T00:00:00
    // &fin=2024-01-31T23:59:59
    // ════════════════════════════════════════
    @GetMapping("/filter")
    public ResponseEntity<List<HistoriqueResponse>>
    filtrerParDate(
            // @DateTimeFormat = format de la date
            // dans l'URL
            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime debut,
            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime fin) {

        List<HistoriqueResponse> liste =
                historiqueService.filtrerParDate(debut, fin)
                        .stream()
                        .map(this::convertirEnResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(liste);
    }

    // ════════════════════════════════════════
    // MÉTHODE PRIVÉE — entité → DTO
    // ════════════════════════════════════════
    private HistoriqueResponse convertirEnResponse(
            HistoriqueVente historique) {

        HistoriqueResponse response =
                new HistoriqueResponse();
        response.setId(historique.getId());
        response.setDateVente(historique.getDateVente());
        response.setTotal(historique.getTotal());

        if (historique.getVente() != null) {
            response.setVenteId(
                    historique.getVente().getId()
            );
            // ← Ces lignes sont importantes !
            response.setStatut(
                    historique.getVente().getStatut().name()
            );
            if (historique.getVente()
                    .getUtilisateur() != null) {
                response.setNomCaissier(
                        historique.getVente()
                                .getUtilisateur().getNom()
                );
            }
        }
        return response;
    }
}