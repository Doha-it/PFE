package com.pfe.gestion_produits.facture;
import com.pfe.gestion_produits.vente.Vente;
import com.pfe.gestion_produits.vente.VenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FactureService {

    private final FactureRepository factureRepository;
    private final VenteService venteService;

    public Facture genererFacture(Long venteId) {
        if (factureRepository
                .findByVenteId(venteId).isPresent()) {
            throw new RuntimeException(
                    "Une facture existe déjà !"
            );
        }
        Vente vente = venteService.getParId(venteId);

        Facture facture = new Facture();
        facture.setVente(vente);
        facture.setDate(LocalDateTime.now());
        facture.setTotal(vente.getTotal());
        return factureRepository.save(facture);
    }

    public Facture getParId(Long id) {
        return factureRepository.findById(id)
                .orElseThrow(() ->
                        new FactureNotFoundException(id)
                );
    }

    public Facture getParVenteId(Long venteId) {
        return factureRepository
                .findByVenteId(venteId)
                .orElseThrow(() ->
                        new FactureNotFoundException(
                                "Aucune facture pour la vente : "
                                        + venteId
                        )
                );
    }

    public List<Facture> getTout() {
        return factureRepository.findAll();
    }
}