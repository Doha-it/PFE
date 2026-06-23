-- ============================================================
--  Système de gestion de produits — Code-barres
--  PFE — Faculté des Sciences Ben M'Sick
--  Base de données : MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_produits
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE gestion_produits;


-- ============================================================
-- TABLE : utilisateurs
-- Source : classe Utilisateur (+ sous-classes Administrateur / Caissier)
-- ============================================================
CREATE TABLE utilisateurs (
  id           INT            AUTO_INCREMENT PRIMARY KEY,
  nom          VARCHAR(100)   NOT NULL,
  telephone    VARCHAR(20)    NULL,
  email        VARCHAR(150)   NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255)   NOT NULL,
  role         ENUM('admin', 'caissier') NOT NULL DEFAULT 'caissier',
  created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP -- Enregistre la date de création du compte.
);

-- ============================================================
-- TABLE : fournisseurs
-- Source : classe Fournisseur
-- ============================================================
CREATE TABLE fournisseurs (
  id        INT          AUTO_INCREMENT PRIMARY KEY,
  nom       VARCHAR(100) NOT NULL,
  telephone VARCHAR(20)  NULL,
  email     VARCHAR(150) NULL
);


-- ============================================================
-- TABLE : categories
-- ============================================================
CREATE TABLE categories (
  id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  icone       VARCHAR(10)
);

-- ============================================================
-- TABLE : produits
-- Source : classe Produit
-- Méthodes couvertes : ajouterProduit, modifierProduit,
--   supprimerProduit, mettreAJourStock, rechercherParCodeBarres
-- ============================================================
CREATE TABLE produits (
  id             INT             AUTO_INCREMENT PRIMARY KEY,
  fournisseur_id INT,
  categorie_id   BIGINT,
  nom            VARCHAR(200)    NOT NULL,
  code_barres    VARCHAR(100)    NOT NULL UNIQUE,  -- scannerCodeBarres()
  prix           DECIMAL(10, 2)  NOT NULL,
  quantite       INT             NOT NULL DEFAULT 0,
  CONSTRAINT fk_produit_fournisseur
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_produit_categorie
    FOREIGN KEY (categorie_id)   REFERENCES categories(id)
    ON DELETE SET NULL
);

-- ============================================================
-- TABLE : ventes
-- Source : classe Vente
-- Méthodes couvertes : créerVente, calculerTotal,
--   validerVente, annulerVente
-- ============================================================
CREATE TABLE ventes (
  id             INT             AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT             NOT NULL,         -- caissier qui effectue la vente
  date           DATETIME        DEFAULT CURRENT_TIMESTAMP,
  total          DECIMAL(10, 2)  NOT NULL DEFAULT 0,
  statut         ENUM('Abandonnées', 'validee', 'annulee') NOT NULL DEFAULT 'Abandonnées',
  CONSTRAINT fk_vente_utilisateur
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);


-- ============================================================
-- TABLE : detail_ventes  (table intermédiaire)
-- Source : classe DetailVente
-- Méthodes couvertes : ajouterArticle, calculerSousTotal
-- =============================================================
CREATE TABLE detail_ventes (
  id         INT            AUTO_INCREMENT PRIMARY KEY,
  vente_id   INT            NOT NULL,
  produit_id INT            NOT NULL,
  quantite   INT            NOT NULL DEFAULT 1,
  prix       DECIMAL(10, 2) NOT NULL,              -- prix au moment de la vente
  CONSTRAINT fk_detail_vente
    FOREIGN KEY (vente_id)   REFERENCES ventes(id)   ON DELETE CASCADE,
  CONSTRAINT fk_detail_produit
    FOREIGN KEY (produit_id) REFERENCES produits(id)
);

-- ============================================================
-- TABLE : factures
-- Source : classe Facture
-- Méthodes couvertes : générerFacture, modifierFacture,
--   imprimerFacture
-- ============================================================
CREATE TABLE factures (
  id       INT            AUTO_INCREMENT PRIMARY KEY,
  vente_id INT            NOT NULL UNIQUE,          -- 1 vente = 1 facture
  date     DATETIME       DEFAULT CURRENT_TIMESTAMP,
  total    DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_facture_vente
    FOREIGN KEY (vente_id) REFERENCES ventes(id)
);

-- ============================================================
-- TABLE : historique_ventes
-- Source : classe HistoriqueVente
-- Méthodes couvertes : enregistrerHistorique, consulterHistorique,
--   filtrerParDate
-- ============================================================
CREATE TABLE historique_ventes (
  id         INT            AUTO_INCREMENT PRIMARY KEY,
  vente_id   INT            NOT NULL,
  date_vente DATETIME       DEFAULT CURRENT_TIMESTAMP,
  total      DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_historique_vente
    FOREIGN KEY (vente_id) REFERENCES ventes(id)
);


-- ============================================================
-- INSERTIONS
-- ============================================================

-- ------------------------------------------------------------
-- Catégories
-- ------------------------------------------------------------
INSERT INTO categories (nom, description, icone) VALUES
('Livres Scolaires',      'Manuels et livres pour tous niveaux', '📚'),
('Fournitures Scolaires', 'Cahiers, stylos, règles...',          '✏️'),
('Informatique',          'Livres et fournitures informatique',   '💻'),
('Littérature',           'Romans et livres de lecture',         '📖'),
('Sciences',              'Livres scientifiques',                '🔬'),
('Langues',               'Dictionnaires et livres de langues',   '🌍'),
('Arts',                  'Matériel artistique',                 '🎨'),
('Papeterie',             'Articles de bureau',                  '📎');

-- ------------------------------------------------------------
-- Fournisseurs
-- ------------------------------------------------------------
INSERT INTO fournisseurs (nom, telephone, email) VALUES
('Hachette Maroc',                 '0612345678', 'contact@hachette.ma'),
('Hamelin Maroc',                  '0623456789', 'hamelin@papeterie.ma'),
('Papeterie Scolaire Maroc',       '0634567890', 'contact@papeterie.ma'),
('BIC & Fournitures Maroc',        '0645678901', 'contact@bicmaroc.ma'),
('Maison des Arts et Culture',     '0656789012', 'contact@arts-culture.ma'),
('Éditions Scientifiques Modernes','0667890123', 'contact@sciences.ma');

-- ------------------------------------------------------------
-- Produits — Livres Scolaires (categorie_id = 1)
-- ------------------------------------------------------------
INSERT INTO produits (categorie_id, fournisseur_id, nom, code_barres, prix, quantite) VALUES
-- Mathématiques
(1, 1, 'Mathématiques 1ère Bac',     '9782091722856', 85.00, 50),
(1, 1, 'Mathématiques 2ème Bac',     '9782091722857', 88.00, 45),
(1, 1, 'Mathématiques 3ème',         '9782091722858', 75.00, 60),
(1, 1, 'Mathématiques Tronc Commun', '9782091722859', 70.00, 55),
-- Physique Chimie
(1, 1, 'Physique-Chimie 1ère Bac',   '9782091845123', 82.00, 40),
(1, 1, 'Physique-Chimie 2ème Bac',   '9782091845124', 85.00, 35),
(1, 1, 'Physique Tronc Commun',      '9782091845125', 72.00, 50),
-- SVT
(1, 1, 'SVT 1ère Bac',               '9782091956321', 78.00, 45),
(1, 1, 'SVT 2ème Bac',               '9782091956322', 80.00, 40),
-- Histoire Géographie
(1, 2, 'Histoire-Géo 1ère Bac',      '9782091234567', 75.00, 50),
(1, 2, 'Histoire-Géo Tronc Commun',  '9782091234568', 68.00, 55),
-- Français
(1, 2, 'Français 1ère Bac',          '9782091345678', 72.00, 60),
(1, 2, 'Français 2ème Bac',          '9782091345679', 75.00, 45),
-- Anglais
(1, 2, 'Anglais 1ère Bac',           '9782091456789', 70.00, 55),
(1, 2, 'Anglais Tronc Commun',       '9782091456790', 65.00, 60),
-- Philosophie
(1, 1, 'Philosophie Terminale',      '9782091567890', 68.00, 40),
-- Arabe
(1, 2, 'Langue Arabe 1ère Bac',      '9782091678901', 65.00, 50);

-- ------------------------------------------------------------
-- Produits — Fournitures Scolaires (categorie_id = 2)
-- ------------------------------------------------------------
INSERT INTO produits (categorie_id, fournisseur_id, nom, code_barres, prix, quantite) VALUES
-- Cahiers
(2, 3, 'Cahier 200 pages grands carreaux',        '6111245789012', 12.00, 200),
(2, 3, 'Cahier 100 pages petits carreaux',        '6111245789013',  8.00, 250),
(2, 3, 'Cahier 96 pages grands carreaux',         '6111245789014',  7.00, 200),
(2, 3, 'Cahier de brouillon',                     '6111245789015',  5.00, 300),
(2, 3, 'Cahier de dessin A4',                     '6111245789016', 10.00, 150),
-- Classeurs et pochettes
(2, 3, 'Classeur A4 4 anneaux',                   '6111245789017', 25.00, 100),
(2, 3, 'Pochette plastique A4',                   '6111245789018',  2.00, 500),
(2, 3, 'Intercalaires 12 touches',                '6111245789019',  8.00, 200),
-- Stylos et crayons
(2, 4, 'Stylo Bic cristal bleu',                  '3086123456789',  3.00, 500),
(2, 4, 'Stylo Bic cristal rouge',                 '3086123456790',  3.00, 400),
(2, 4, 'Stylo Bic cristal noir',                  '3086123456791',  3.00, 400),
(2, 4, 'Pack 10 stylos Bic bleu',                 '3086123456792', 25.00, 100),
(2, 3, 'Crayon HB Staedtler',                     '4007817326831',  3.50, 400),
(2, 3, 'Pack 12 crayons de couleur',              '4007817326832', 18.00, 150),
-- Instruments
(2, 3, 'Règle 30cm transparente',                 '6111245789020',  5.00, 300),
(2, 3, 'Rapporteur 180°',                         '6111245789021',  4.00, 200),
(2, 3, 'Équerre 45°',                             '6111245789022',  4.00, 200),
(2, 3, 'Compas scolaire',                         '6111245789023', 12.00, 150),
(2, 3, 'Kit géométrie (règle+équerre+rapporteur)', '6111245789024', 15.00, 100),
-- Effacement et correction
(2, 4, 'Gomme blanche Staedtler',                 '4007817326833',  2.50, 400),
(2, 4, 'Taille-crayon double trous',              '4007817326834',  3.00, 300),
(2, 4, 'Liquide correcteur Tipp-Ex',              '3023272145621',  8.00, 200),
-- Surligneurs et marqueurs
(2, 4, 'Surligneur jaune Stabilo',                '4006381324618',  6.00, 200),
(2, 4, 'Pack 4 surligneurs couleurs',             '4006381324619', 20.00, 100),
(2, 4, 'Marqueur permanent noir',                 '3086123456793',  7.00, 150),
-- Calculatrices
(2, 3, 'Calculatrice scientifique Casio FX-82',   '4971850175780', 120.00, 50),
(2, 3, 'Calculatrice simple',                     '6111245789025',  25.00, 100),
-- Sacs et accessoires
(2, 3, 'Sac à dos scolaire',                      '6111245789026', 150.00, 30),
(2, 3, 'Trousse rectangulaire',                   '6111245789027',  20.00, 100),
(2, 3, 'Agenda scolaire 2024-2025',               '6111245789028',  25.00, 80);

-- ------------------------------------------------------------
-- Produits — Informatique (categorie_id = 3)
-- ------------------------------------------------------------
INSERT INTO produits (categorie_id, fournisseur_id, nom, code_barres, prix, quantite) VALUES
(3, 1, 'Algorithmique et Programmation', '9782091789012', 95.00, 30),
(3, 1, 'Introduction à Python',          '9782091789013', 90.00, 25),
(3, 3, 'Clé USB 16GB',                   '6111245789029', 45.00, 50),
(3, 3, 'Souris optique USB',             '6111245789030', 60.00, 30);

-- ------------------------------------------------------------
-- Produits — Littérature (categorie_id = 4)
-- ------------------------------------------------------------
INSERT INTO produits (categorie_id, fournisseur_id, nom, code_barres, prix, quantite) VALUES
(4, 2, 'Le Petit Prince - Saint-Exupéry', '9782070612758', 55.00, 40),
(4, 2, 'L Étranger - Albert Camus',       '9782070360024', 60.00, 35),
(4, 2, 'Le Père Goriot - Balzac',         '9782253004226', 55.00, 30),
(4,2,"A la prmière personne",             '978274753755',100.00,32);
-- ------------------------------------------------------------
-- Produits — Sciences (categorie_id = 5)
-- ------------------------------------------------------------
INSERT INTO produits (categorie_id, fournisseur_id, nom, code_barres, prix, quantite) VALUES
(5, 6, 'Atlas du Corps Humain',               '9782100800201', 110.00, 20),
(5, 6, 'Le Monde des Dinosaures',             '9782100800202',  95.00, 15),
(5, 6, 'Les Secrets de l Espace',             '9782100800203', 120.00, 12),
(5, 6, 'Guide des Expériences Scientifiques', '9782100800204', 130.00, 10),
(5, 6, 'La Vie des Animaux',                  '9782100800205',  90.00, 25),
(5, 6, 'Encyclopédie des Sciences',           '9782100800206', 180.00,  8);

-- ------------------------------------------------------------
-- Produits — Langues (categorie_id = 6)
-- ------------------------------------------------------------
INSERT INTO produits (categorie_id, fournisseur_id, nom, code_barres, prix, quantite) VALUES
(6, 2, 'Dictionnaire Français-Arabe',   '9789954000011', 85.00, 40),
(6, 2, 'Dictionnaire Anglais-Français', '9780194317399', 90.00, 35),
(6, 2, 'Larousse Poche 2024',           '9782035973610', 75.00, 45);

-- ------------------------------------------------------------
-- Produits — Arts (categorie_id = 7)
-- ------------------------------------------------------------
INSERT INTO produits (categorie_id, fournisseur_id, nom, code_barres, prix, quantite) VALUES
(7, 5, 'Histoire de l Art',          '9782100800021', 220.00, 10),
(7, 5, 'Les Grands Peintres',        '9782100800022', 250.00,  8),
(7, 5, 'Art Moderne',                '9782100800023', 210.00, 12),
(7, 5, 'Design Graphique',           '9782100800024', 190.00, 15),
(7, 5, 'Photographie Numérique',     '9782100800025', 170.00, 20),
(7, 5, 'Architecture Contemporaine', '9782100800026', 240.00, 10);

-- ------------------------------------------------------------
-- Produits — Papeterie (categorie_id = 8)
-- ------------------------------------------------------------
INSERT INTO produits (categorie_id, fournisseur_id, nom, code_barres, prix, quantite) VALUES
(8, 3, 'Ramette papier A4 500 feuilles', '6111245789031', 45.00,  80),
(8, 3, 'Agrafeuse de bureau',            '6111245789032', 35.00,  30),
(8, 3, 'Boîte 1000 agrafes',             '6111245789033', 10.00, 100),
(8, 3, 'Scotch transparent 10m',         '6111245789034',  5.00, 200),
(8, 3, 'Post-it 100 feuilles jaunes',    '6111245789035', 15.00, 100);

