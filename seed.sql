-- 파이코인 마켓 테스트 데이터

-- 기본 카테고리 추가
INSERT OR IGNORE INTO categories (name, icon, sort_order) VALUES 
  ('전자기기', '📱', 1),
  ('가구/인테리어', '🪑', 2),
  ('의류/패션잡화', '👕', 3),
  ('도서/음반', '📚', 4),
  ('스포츠/레저', '⚽', 5),
  ('게임/취미', '🎮', 6),
  ('생활용품', '🧴', 7),
  ('기타', '📦', 8);

-- 테스트 사용자 추가
INSERT OR IGNORE INTO users (email, username, password_hash, full_name, phone, pi_coin_balance) VALUES 
  ('alice@picoin.market', 'alice_pi', 'hashed_password_1', '김알리스', '010-1234-5678', 100.5),
  ('bob@picoin.market', 'bob_trader', 'hashed_password_2', '박밥스', '010-2345-6789', 50.0),
  ('charlie@picoin.market', 'charlie_seller', 'hashed_password_3', '최찰리', '010-3456-7890', 75.25),
  ('diana@picoin.market', 'diana_buyer', 'hashed_password_4', '이다이아나', '010-4567-8901', 200.0);

-- 테스트 상품 추가
INSERT OR IGNORE INTO products (seller_id, category_id, title, description, price, pi_coin_price, condition_type, location) VALUES 
  (1, 1, '아이폰 14 Pro 128GB', '사용감 거의 없는 아이폰 14 프로입니다. 케이스와 함께 판매해요!', 1200000, 120.0, 'like_new', '서울 강남구'),
  (2, 2, '북유럽 스타일 책상', '원목 소재의 깔끔한 책상입니다. 이사로 인해 판매합니다.', 150000, 15.0, 'good', '서울 마포구'),
  (3, 3, '나이키 에어맥스 270 (새제품)', '미착용 새제품 나이키 운동화입니다. 사이즈 270mm', 120000, 12.0, 'new', '부산 해운대구'),
  (1, 4, '해리포터 전집 (영문판)', '해리포터 원서 전권 세트입니다. 컬렉션용으로 좋아요!', 80000, 8.0, 'good', '서울 강남구'),
  (4, 5, '캠핑 텐트 (4인용)', '가족 캠핑용 대형 텐트입니다. 방수 처리 완료!', 200000, 20.0, 'like_new', '경기 성남시');

-- 테스트 상품 이미지 추가 (실제로는 업로드된 이미지 URL)
INSERT OR IGNORE INTO product_images (product_id, image_url, image_order) VALUES 
  (1, '/static/images/products/iphone14pro_1.jpg', 1),
  (1, '/static/images/products/iphone14pro_2.jpg', 2),
  (2, '/static/images/products/desk_1.jpg', 1),
  (2, '/static/images/products/desk_2.jpg', 2),
  (3, '/static/images/products/nike_1.jpg', 1),
  (4, '/static/images/products/harrypotter_1.jpg', 1),
  (5, '/static/images/products/tent_1.jpg', 1),
  (5, '/static/images/products/tent_2.jpg', 2),
  (5, '/static/images/products/tent_3.jpg', 3);

-- 테스트 채팅방 생성
INSERT OR IGNORE INTO chat_rooms (product_id, buyer_id, seller_id) VALUES 
  (1, 2, 1),  -- Bob이 Alice의 아이폰에 관심
  (2, 3, 2),  -- Charlie가 Bob의 책상에 관심
  (3, 4, 3);  -- Diana가 Charlie의 운동화에 관심

-- 테스트 채팅 메시지 (3일 후 자동 삭제)
INSERT OR IGNORE INTO chat_messages (room_id, sender_id, message, message_type) VALUES 
  (1, 2, '안녕하세요! 아이폰 상태가 어떤가요?', 'text'),
  (1, 1, '안녕하세요! 거의 새것과 같습니다. 케이스도 함께 드려요.', 'text'),
  (1, 2, '직거래 가능한가요?', 'text'),
  (2, 3, '책상 크기가 어떻게 되나요?', 'text'),
  (2, 2, '가로 120cm, 세로 60cm입니다!', 'text'),
  (3, 4, '운동화 실물 보고 구매 가능할까요?', 'text'),
  (3, 3, '네, 언제든 연락주세요!', 'text');

-- 테스트 좋아요
INSERT OR IGNORE INTO user_likes (user_id, product_id) VALUES 
  (2, 1),  -- Bob이 Alice의 아이폰 좋아요
  (3, 1),  -- Charlie도 아이폰 좋아요
  (4, 2),  -- Diana가 책상 좋아요
  (1, 3),  -- Alice가 운동화 좋아요
  (2, 5);  -- Bob이 텐트 좋아요

-- 일일 게시물 카운트 초기화 (오늘 날짜)
INSERT OR IGNORE INTO daily_post_count (user_id, post_date, post_count) VALUES 
  (1, date('now'), 2),  -- Alice가 오늘 2개 게시물 작성
  (2, date('now'), 1),  -- Bob이 오늘 1개 게시물 작성
  (3, date('now'), 1),  -- Charlie가 오늘 1개 게시물 작성
  (4, date('now'), 1);  -- Diana가 오늘 1개 게시물 작성