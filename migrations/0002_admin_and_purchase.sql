-- 관리자 및 π-coin 구매 시스템 스키마

-- 사용자 테이블에 관리자 권한 컬럼 추가
ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- π-coin 구매 이력 테이블
CREATE TABLE IF NOT EXISTS pi_coin_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- 구매한 π-coin 양
  krw_amount INTEGER NOT NULL, -- 결제한 원화 금액
  payment_method TEXT DEFAULT 'card', -- 결제 방법
  payment_status TEXT CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  transaction_id TEXT, -- 외부 결제 시스템 거래 ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 관리자 문의 채팅 테이블
CREATE TABLE IF NOT EXISTS admin_chat_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  admin_id INTEGER,
  status TEXT CHECK(status IN ('active', 'closed', 'pending')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 관리자 채팅 메시지 테이블 (3일 후 자동 삭제)
CREATE TABLE IF NOT EXISTS admin_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT CHECK(message_type IN ('text', 'image', 'system')) DEFAULT 'text',
  is_admin_message INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL DEFAULT (datetime('now', '+3 days')),
  FOREIGN KEY (room_id) REFERENCES admin_chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- 거래 완료 상품 자동 삭제를 위한 컬럼 추가
ALTER TABLE products ADD COLUMN completed_at DATETIME;
ALTER TABLE products ADD COLUMN auto_delete_at DATETIME;

-- 관리자 액션 로그 테이블
CREATE TABLE IF NOT EXISTS admin_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'hide_product', 'delete_product', 'ban_user', etc.
  target_type TEXT NOT NULL, -- 'product', 'user', 'chat'
  target_id INTEGER NOT NULL,
  reason TEXT,
  details TEXT, -- JSON 형태의 추가 정보
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 신고 시스템 테이블
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER NOT NULL,
  target_type TEXT CHECK(target_type IN ('product', 'user', 'chat')) NOT NULL,
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
  admin_id INTEGER,
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 알림 시스템 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'chat', 'purchase', 'admin', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT, -- JSON 형태의 추가 데이터
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_pi_coin_purchases_user_id ON pi_coin_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_pi_coin_purchases_status ON pi_coin_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_admin_chat_rooms_user_id ON admin_chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_chat_messages_room_id ON admin_chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_admin_chat_messages_expires_at ON admin_chat_messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_products_completed_at ON products(completed_at);
CREATE INDEX IF NOT EXISTS idx_products_auto_delete_at ON products(auto_delete_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);