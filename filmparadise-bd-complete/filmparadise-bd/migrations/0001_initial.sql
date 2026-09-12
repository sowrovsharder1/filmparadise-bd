PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'movie' CHECK (type IN ('movie','series')),
  description TEXT NOT NULL DEFAULT '',
  poster_url TEXT NOT NULL DEFAULT '',
  year INTEGER,
  language TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT '',
  quality TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  imdb_rating TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  cast TEXT NOT NULL DEFAULT '',
  director TEXT NOT NULL DEFAULT '',
  release_date TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0,1)),
  is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0,1)),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft')),
  download_url_1 TEXT NOT NULL DEFAULT '',
  download_url_2 TEXT NOT NULL DEFAULT '',
  download_url_3 TEXT NOT NULL DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movie_categories (
  movie_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (movie_id, category_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies(slug);
CREATE INDEX IF NOT EXISTS idx_movies_status_created ON movies(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_type_status ON movies(type, status);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_language ON movies(language);
CREATE INDEX IF NOT EXISTS idx_movies_pinned_featured ON movies(is_pinned DESC, is_featured DESC);
CREATE INDEX IF NOT EXISTS idx_movie_categories_category ON movie_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_movie_categories_movie ON movie_categories(movie_id);
