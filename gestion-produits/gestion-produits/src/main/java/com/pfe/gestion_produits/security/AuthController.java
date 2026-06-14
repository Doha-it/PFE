package com.pfe.gestion_produits.security;

import com.pfe.gestion_produits.security.dto.LoginRequest;
import com.pfe.gestion_produits.security.dto.LoginResponse;
import com.pfe.gestion_produits.utilisateur.Utilisateur;
import com.pfe.gestion_produits.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // ─── LOGIN ───
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getMotDePasse()
                    )
            );

            Utilisateur utilisateur =
                    utilisateurRepository
                            .findByEmail(request.getEmail())
                            .orElseThrow();

            String token = jwtService.genererToken(
                    utilisateur.getEmail(),
                    utilisateur.getRole().name()
            );

            return ResponseEntity.ok(
                    new LoginResponse(
                            utilisateur.getId(),
                            token,
                            utilisateur.getRole().name(),
                            utilisateur.getNom(),
                            utilisateur.getEmail(),     // ← ajouter
                            utilisateur.getTelephone()  // ← ajouter
                    )
            );

        } catch (AuthenticationException e) {
            return ResponseEntity
                    .status(401)
                    .body("Email ou mot de passe incorrect !");
        }
    }

    // ─── INITIALISATION PREMIER ADMIN ───
    @PostMapping("/init")
    public ResponseEntity<?> initialiser(
            @RequestBody LoginRequest request) {

        if (utilisateurRepository.count() > 0) {
            return ResponseEntity
                    .status(403)
                    .body("Initialisation déjà effectuée !");
        }

        Utilisateur admin = new Utilisateur();
        admin.setNom("Admin Librairie");
        admin.setEmail(request.getEmail());
        admin.setMotDePasse(
                passwordEncoder.encode(request.getMotDePasse())
        );
        admin.setRole(Utilisateur.Role.admin);
        admin.setCreatedAt(LocalDateTime.now());

        utilisateurRepository.save(admin);

        return ResponseEntity.ok(
                "Admin créé avec succès !"
        );
    }
}