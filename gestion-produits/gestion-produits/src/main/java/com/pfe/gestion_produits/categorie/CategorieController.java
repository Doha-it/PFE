package com.pfe.gestion_produits.categorie;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieRepository
            categorieRepository;

    @GetMapping
    public ResponseEntity<List<Categorie>> getTous() {
        return ResponseEntity.ok(
                categorieRepository.findAll()
        );
    }
}
