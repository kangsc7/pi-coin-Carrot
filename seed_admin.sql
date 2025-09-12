-- 관리자 계정 및 추가 시드 데이터

-- 관리자 계정 생성
INSERT OR IGNORE INTO users (email, username, password_hash, full_name, phone, pi_coin_balance, is_admin) VALUES 
  ('5321497@naver.com', 'admin_master', 'YWxmbzE0OTdAQA==', '파이코인 관리자', '010-0000-0000', 999999.0, 1);

-- π-coin 구매 패키지 정보를 위한 설정 테이블
CREATE TABLE IF NOT EXISTS pi_coin_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL, -- π-coin 수량
  price INTEGER NOT NULL, -- 원화 가격
  bonus_amount INTEGER DEFAULT 0, -- 보너스 π-coin
  is_popular INTEGER DEFAULT 0, -- 인기 패키지 여부
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- π-coin 구매 패키지 기본 데이터
INSERT OR IGNORE INTO pi_coin_packages (name, amount, price, bonus_amount, is_popular, sort_order) VALUES 
  ('스타터 패키지', 1000, 1000, 0, 0, 1),
  ('베이직 패키지', 10000, 10000, 500, 1, 2),
  ('프리미엄 패키지', 100000, 100000, 10000, 0, 3),
  ('메가 패키지', 1000000, 1000000, 150000, 1, 4);

-- 테스트 구매 이력
INSERT OR IGNORE INTO pi_coin_purchases (user_id, amount, krw_amount, payment_status, completed_at) VALUES 
  (1, 10000, 10000, 'completed', datetime('now', '-2 days')),
  (2, 1000, 1000, 'completed', datetime('now', '-1 day')),
  (3, 100000, 100000, 'completed', datetime('now', '-3 hours'));

-- 관리자 문의 채팅방 예시
INSERT OR IGNORE INTO admin_chat_rooms (user_id, admin_id, status) VALUES 
  (2, 5, 'active'), -- Bob이 관리자에게 문의
  (3, 5, 'closed'); -- Charlie가 관리자에게 문의했지만 해결됨

-- 관리자 채팅 메시지 예시
INSERT OR IGNORE INTO admin_chat_messages (room_id, sender_id, message, is_admin_message) VALUES 
  (1, 2, '안녕하세요. π-coin 구매 관련 문의가 있습니다.', 0),
  (1, 5, '안녕하세요! 무엇을 도와드릴까요?', 1),
  (1, 2, '결제를 했는데 π-coin이 충전되지 않았어요.', 0),
  (1, 5, '확인해보고 즉시 처리해드리겠습니다.', 1);

-- 신고 예시 데이터
INSERT OR IGNORE INTO reports (reporter_id, target_type, target_id, reason, description, status) VALUES 
  (3, 'product', 1, '허위 매물', '실제 상품과 다른 사진을 사용했습니다.', 'pending'),
  (4, 'user', 2, '비매너 행동', '채팅에서 욕설을 사용했습니다.', 'reviewed');

-- 알림 예시
INSERT OR IGNORE INTO notifications (user_id, type, title, message, data) VALUES 
  (1, 'purchase', 'π-coin 충전 완료', '10,000 π-coin이 성공적으로 충전되었습니다.', '{"amount": 10000, "method": "card"}'),
  (2, 'chat', '새로운 채팅 메시지', '아이폰 14 Pro 상품에 대한 문의가 있습니다.', '{"product_id": 1, "room_id": 1}'),
  (3, 'admin', '관리자 답변', '문의하신 내용에 대한 답변이 도착했습니다.', '{"room_id": 1}');

-- 관리자 액션 로그 예시
INSERT OR IGNORE INTO admin_actions (admin_id, action_type, target_type, target_id, reason) VALUES 
  (5, 'hide_product', 'product', 1, '허위 매물 신고 접수'),
  (5, 'resolve_report', 'report', 1, '신고 내용 확인 후 조치 완료');