package com.pfe.gestion_produits.historique;
import com.pfe.gestion_produits.vente.Vente;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoriqueService {

    private final HistoriqueRepository historiqueRepository;

    // ─── Enregistrer dans l'historique ───
    // Correspond à enregistrerHistorique()
    // du diagramme de classes
    // Appelée automatiquement après
    // chaque vente validée
    public HistoriqueVente enregistrer(Vente vente) {

        HistoriqueVente historique = new HistoriqueVente();
        historique.setVente(vente);
        historique.setDateVente(LocalDateTime.now());
        // On copie le total de la vente
        historique.setTotal(vente.getTotal());

        return historiqueRepository.save(historique);
    }

    // ─── Consulter tout l'historique ───
    // Correspond à consulterHistorique()
    // du diagramme de classes
    public List<HistoriqueVente> getTout() {
        return historiqueRepository.findAll();
    }

    // ─── Récupérer par id ───
    public HistoriqueVente getParId(Long id) {
        return historiqueRepository.findById(id)
                .orElseThrow(() ->
                        new HistoriqueNotFoundException(id)
                );
    }

    // ─── Historique d'une vente précise ───
    public List<HistoriqueVente> getParVente(
            Long venteId) {
        List<HistoriqueVente> liste =
                historiqueRepository.findByVenteId(venteId);

        if (liste.isEmpty()) {
            throw new HistoriqueNotFoundException(
                    "Aucun historique pour la vente : "
                            + venteId
            );
        }
        return liste;
    }

    // ─── Filtrer par période ───
    // Correspond à filtrerParDate()
    // du diagramme de classes
    public List<HistoriqueVente> filtrerParDate(
            LocalDateTime debut,
            LocalDateTime fin) {

        List<HistoriqueVente> liste =
                historiqueRepository
                        .findByDateVenteBetween(debut, fin);

        if (liste.isEmpty()) {
            throw new HistoriqueNotFoundException(
                    "Aucun historique entre "
                            + debut + " et " + fin
            );
        }
        return liste;
    }

}