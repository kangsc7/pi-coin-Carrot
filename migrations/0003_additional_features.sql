-- 추가 기능들을 위한 데이터베이스 스키마

-- 사용자 프로필 확장
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN location TEXT;
ALTER TABLE users ADD COLUMN rating REAL DEFAULT 5.0;
ALTER TABLE users ADD COLUMN review_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN trade_count INTEGER DEFAULT 0;

-- 위시리스트 테이블 (이미 user_likes로 구현됨, 확장)
-- user_likes 테이블을 위시리스트로 활용

-- 사용자 리뷰/평가 테이블
CREATE TABLE IF NOT EXISTS user_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reviewer_id INTEGER NOT NULL, -- 리뷰 작성자
  reviewee_id INTEGER NOT NULL, -- 리뷰 대상자
  product_id INTEGER, -- 관련 상품 (거래 완료된)
  rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  tags TEXT, -- JSON 배열로 저장 (예: ["친절해요", "빠른응답"])
  transaction_type TEXT CHECK(transaction_type IN ('seller', 'buyer')) NOT NULL, -- 판매자로서/구매자로서
  is_anonymous INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewer_id) REFERENCES users(id),
  FOREIGN KEY (reviewee_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(reviewer_id, reviewee_id, product_id) -- 한 거래당 한번만 리뷰 가능
);

-- 키워드 검색 기록 테이블
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  keyword TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 인기 검색어 집계를 위한 뷰 또는 테이블
CREATE TABLE IF NOT EXISTS popular_keywords (
  keyword TEXT PRIMARY KEY,
  search_count INTEGER DEFAULT 0,
  last_searched DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 상품 조회 기록 (추천 시스템용)
CREATE TABLE IF NOT EXISTS product_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  product_id INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 팔로우 시스템
CREATE TABLE IF NOT EXISTS user_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL, -- 팔로우하는 사람
  following_id INTEGER NOT NULL, -- 팔로우받는 사람
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id),
  UNIQUE(follower_id, following_id)
);

-- 상품 예약 시스템
CREATE TABLE IF NOT EXISTS product_reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  status TEXT CHECK(status IN ('active', 'expired', 'confirmed', 'cancelled')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 거래 안전 정보 테이블
CREATE TABLE IF NOT EXISTS safety_tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'meeting', 'payment', 'communication' 등
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 상품 태그 시스템
CREATE TABLE IF NOT EXISTS product_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 신고 카테고리별 세분화
ALTER TABLE reports ADD COLUMN category TEXT DEFAULT 'other';
ALTER TABLE reports ADD COLUMN priority INTEGER DEFAULT 1; -- 1: 낮음, 2: 보통, 3: 높음, 4: 긴급

-- 거래 후기 (간단한 버전)
CREATE TABLE IF NOT EXISTS transaction_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER,
  product_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  seller_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  is_seller_review INTEGER DEFAULT 0, -- 0: 구매자가 작성, 1: 판매자가 작성
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- 배너/공지사항 시스템
CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  position TEXT DEFAULT 'main', -- 'main', 'sidebar', 'popup'
  is_active INTEGER DEFAULT 1,
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  click_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FAQ 시스템
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_popular INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewee ON user_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword);
CREATE INDEX IF NOT EXISTS idx_popular_keywords_count ON popular_keywords(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_product_views_user ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_product_reservations_product ON product_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reservations_user ON product_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag);
CREATE INDEX IF NOT EXISTS idx_transaction_reviews_product ON transaction_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_transaction_reviews_reviewer ON transaction_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_popular ON faqs(is_popular, view_count DESC);