package com.pfe.gestion_produits.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors
                        .configurationSource(corsConfigurationSource())
                )
                .csrf(csrf -> csrf.disable())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**")
                        .permitAll()


                        //Pour le premier admin
                        .requestMatchers(HttpMethod.POST,
                                "/api/utilisateurs").permitAll()
                        //


                        /*.requestMatchers(HttpMethod.POST,
                                "/api/produits/**").hasRole("admin")*/

                        .requestMatchers(HttpMethod.PUT,
                                "/api/produits/**").hasRole("admin")
                        .requestMatchers(HttpMethod.DELETE,
                                "/api/produits/**").hasRole("admin")
                        .requestMatchers(HttpMethod.GET,
                                "/api/produits/**").authenticated()
                        .requestMatchers(HttpMethod.POST,
                                "/api/fournisseurs/**").hasRole("admin")
                        .requestMatchers(HttpMethod.PUT,
                                "/api/fournisseurs/**").hasRole("admin")
                        .requestMatchers(HttpMethod.DELETE,
                                "/api/fournisseurs/**").hasRole("admin")
                        .requestMatchers(HttpMethod.GET,
                                "/api/fournisseurs/**").authenticated()
                        .requestMatchers(
                                "/api/utilisateurs/**").hasRole("admin")
                        .requestMatchers(
                                "/api/ventes/**").authenticated()
                        .requestMatchers(
                                "/api/factures/**").authenticated()
                        .requestMatchers(
                                "/api/historique/**").authenticated()
                        // Routes catégories publiques pour admin et caissier
                        .requestMatchers(
                                HttpMethod.GET, "/api/categories/**"
                        ).authenticated()
                        .anyRequest().authenticated()

                )

                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
        // ... reste du code ...
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(Arrays.asList(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:5173"
            ));
            config.setAllowedMethods(Arrays.asList(
                    "GET", "POST", "PUT",
                    "DELETE", "OPTIONS", "PATCH"
            ));
            config.setAllowedHeaders(List.of("*"));
            config.setAllowCredentials(true);

            UrlBasedCorsConfigurationSource source =
                    new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", config);
            return source;
        }
}