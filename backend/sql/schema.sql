-- Schema for apple_clone. Safe to re-run: drops and recreates all tables.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS nav_flyout_links;
DROP TABLE IF EXISTS nav_items;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS carousel_items;
DROP TABLE IF EXISTS footnotes;
DROP TABLE IF EXISTS footer_links;
DROP TABLE IF EXISTS footer_groups;
DROP TABLE IF EXISTS legal_links;
DROP TABLE IF EXISTS iphones;

SET FOREIGN_KEY_CHECKS = 1;

-- Global navigation (top bar)
CREATE TABLE nav_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  label       VARCHAR(64)  NOT NULL,
  url         VARCHAR(512) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Flyout (mega menu) links shown when hovering a nav item
CREATE TABLE nav_flyout_links (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nav_item_id  INT          NOT NULL,
  group_title  VARCHAR(64)  NOT NULL,   -- e.g. "Explore iPhone", "Shop iPhone"
  label        VARCHAR(128) NOT NULL,
  url          VARCHAR(512) NOT NULL,
  is_primary   TINYINT(1)   NOT NULL DEFAULT 0,  -- big bold links in the first group
  sort_order   INT          NOT NULL DEFAULT 0,
  CONSTRAINT fk_flyout_nav FOREIGN KEY (nav_item_id) REFERENCES nav_items(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Homepage blocks: full-width heroes and half-width promo tiles
CREATE TABLE sections (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  slug                VARCHAR(64)  NOT NULL UNIQUE,
  type                ENUM('hero','promo') NOT NULL,
  theme               ENUM('light','dark','gradient') NOT NULL DEFAULT 'light',
  logo_url            VARCHAR(512) NULL,      -- product wordmark image (optional)
  headline            VARCHAR(128) NOT NULL,
  subheadline         VARCHAR(255) NULL,
  footnote_ref        VARCHAR(8)   NULL,      -- e.g. "1" -> superscript linking to footnote
  image_url           VARCHAR(512) NULL,
  image_alt           VARCHAR(512) NULL,
  image_position      ENUM('overlay','below') NOT NULL DEFAULT 'overlay', -- below = image starts under the copy
  primary_cta_label   VARCHAR(64)  NULL,
  primary_cta_url     VARCHAR(512) NULL,
  secondary_cta_label VARCHAR(64)  NULL,
  secondary_cta_url   VARCHAR(512) NULL,
  sort_order          INT          NOT NULL DEFAULT 0,
  is_active           TINYINT(1)   NOT NULL DEFAULT 1,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- "Endless entertainment." carousel
--   group_name = 'tv'    -> big Apple TV slides
--   group_name = 'shelf' -> small Music / Fitness / Arcade tiles
CREATE TABLE carousel_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  group_name  ENUM('tv','shelf') NOT NULL,
  service     VARCHAR(32)  NULL,   -- tv, music, fitness, arcade
  genre       VARCHAR(64)  NULL,
  title       VARCHAR(255) NOT NULL,
  tagline     VARCHAR(512) NULL,
  image_url   VARCHAR(512) NOT NULL,
  logo_url    VARCHAR(512) NULL,
  cta_label   VARCHAR(64)  NOT NULL DEFAULT 'Stream now',
  link_url    VARCHAR(512) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE footnotes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  number      VARCHAR(8)   NULL,   -- NULL = unnumbered note
  content     TEXT         NOT NULL,
  link_label  VARCHAR(128) NULL,
  link_url    VARCHAR(512) NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Footer directory: groups are placed into visual columns (column_index 1..5)
CREATE TABLE footer_groups (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(64) NOT NULL,
  column_index  INT         NOT NULL,
  sort_order    INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE footer_links (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  group_id    INT          NOT NULL,
  label       VARCHAR(128) NOT NULL,
  url         VARCHAR(512) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  CONSTRAINT fk_footer_group FOREIGN KEY (group_id) REFERENCES footer_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE legal_links (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  label       VARCHAR(64)  NOT NULL,
  url         VARCHAR(512) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- iPhone catalogue managed from /admin/iphones (CRUD: /api/iphones)
CREATE TABLE iphones (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  slug             VARCHAR(64)   NOT NULL UNIQUE,
  name             VARCHAR(128)  NOT NULL,
  tagline          VARCHAR(255)  NULL,
  chip             VARCHAR(64)   NULL,
  display_inches   DECIMAL(3,1)  NULL,
  storage_options  JSON          NOT NULL,            -- ["256GB","512GB","1TB"]
  colors           JSON          NOT NULL,            -- [{"name":"Burgundy","hex":"#6d2c35"}]
  price_from       DECIMAL(10,2) NOT NULL,            -- USD
  stock            INT           NOT NULL DEFAULT 0,
  status           ENUM('available','preorder','coming_soon','discontinued') NOT NULL DEFAULT 'available',
  release_date     DATE          NULL,
  image_url        VARCHAR(512)  NULL,
  product_url      VARCHAR(512)  NULL,
  sort_order       INT           NOT NULL DEFAULT 0,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
