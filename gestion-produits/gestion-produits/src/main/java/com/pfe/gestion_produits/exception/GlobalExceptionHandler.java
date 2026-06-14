package com.pfe.gestion_produits.exception;
import com.pfe.gestion_produits.facture.FactureNotFoundException;
import com.pfe.gestion_produits.fournisseur.FournisseurNotFoundException;
import com.pfe.gestion_produits.produit.ProduitNotFoundException;
import com.pfe.gestion_produits.utilisateur.UtilisateurNotFoundException;
import com.pfe.gestion_produits.vente.VenteNotFoundException;
import com.pfe.gestion_produits.historique.HistoriqueNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

// Surveille TOUS les controllers automatiquement
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ════════════════════════════════════════
    // PRODUIT NON TROUVÉ → HTTP 404
    // ════════════════════════════════════════
    @ExceptionHandler(ProduitNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    gererProduit(ProduitNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", ex.getMessage()));
    }

    // ════════════════════════════════════════
    // FOURNISSEUR NON TROUVÉ → HTTP 404
    // ════════════════════════════════════════
    @ExceptionHandler(FournisseurNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    gererFournisseur(
            FournisseurNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", ex.getMessage()));
    }

    // ════════════════════════════════════════
    // UTILISATEUR NON TROUVÉ → HTTP 404
    // ════════════════════════════════════════
    @ExceptionHandler(UtilisateurNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    gererUtilisateur(
            UtilisateurNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", ex.getMessage()));
    }

    // ════════════════════════════════════════
    // VENTE NON TROUVÉE → HTTP 404
    // ════════════════════════════════════════
    @ExceptionHandler(VenteNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    gererVente(VenteNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", ex.getMessage()));
    }

    // ════════════════════════════════════════
    // FACTURE NON TROUVÉE → HTTP 404
    // ════════════════════════════════════════
    @ExceptionHandler(FactureNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    gererFacture(FactureNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", ex.getMessage()));
    }

    // ════════════════════════════════════════
    // ERREURS VALIDATION @Valid → HTTP 400
    // Exemple : nom vide, prix négatif...
    // ════════════════════════════════════════
    @ExceptionHandler(
            MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>>
    gererValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> erreurs = new HashMap<>();

        ex.getBindingResult()
                .getAllErrors()
                .forEach(error -> {
                    String champ = ((FieldError) error)
                            .getField();
                    String message =
                            error.getDefaultMessage();
                    erreurs.put(champ, message);
                });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(erreurs);
    }

    // ════════════════════════════════════════
    // AUTRES ERREURS MÉTIER → HTTP 400
    // Exemple :
    // "Stock insuffisant"
    // "Email déjà utilisé"
    // "Vente déjà traitée"
    // "Ce code-barres existe déjà"
    // ════════════════════════════════════════
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>>
    gererAutres(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erreur", ex.getMessage()));
    }
    // Méthode à ajouter dans la classe
    @ExceptionHandler(HistoriqueNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    gererHistorique(HistoriqueNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("erreur", ex.getMessage()));
    }

}