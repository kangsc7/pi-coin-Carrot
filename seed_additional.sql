-- 추가 기능들을 위한 시드 데이터

-- 안전 거래 팁
INSERT OR IGNORE INTO safety_tips (title, content, category, sort_order) VALUES 
  ('직거래 안전 장소', '직거래시에는 CCTV가 설치된 공공장소나 파출소, 지하철역 등 안전한 장소에서 거래하세요.', 'meeting', 1),
  ('사기 예방법', '선입금을 요구하거나 개인정보를 과도하게 묻는 경우 주의하세요. π-coin으로만 결제를 진행하세요.', 'payment', 2),
  ('상품 확인 방법', '실물과 사진이 다를 수 있으니 직접 확인 후 거래를 진행하세요.', 'meeting', 3),
  ('채팅 매너', '상대방을 존중하는 대화를 나누세요. 불쾌한 언어 사용은 신고 대상입니다.', 'communication', 4);

-- FAQ 데이터
INSERT OR IGNORE INTO faqs (category, question, answer, is_popular, sort_order) VALUES 
  ('거래', 'π-coin은 어떻게 구매하나요?', '로그인 후 상단의 "π-coin 구매" 버튼을 클릭하여 원하는 패키지를 선택하고 결제하시면 됩니다. 구매한 π-coin은 즉시 계정에 충전됩니다.', 1, 1),
  ('거래', '거래는 어떻게 진행하나요?', '1) 원하는 상품의 "채팅하기" 클릭 2) 판매자와 거래 협상 3) 만남 장소 및 시간 약속 4) 직접 만나서 상품 확인 후 π-coin 결제 5) 거래 완료', 1, 2),
  ('계정', '비밀번호를 잊어버렸어요', '현재 비밀번호 재설정 기능을 준비중입니다. 관리자 문의를 통해 도움을 받으실 수 있습니다.', 0, 3),
  ('거래', '판매 취소는 어떻게 하나요?', '내가 등록한 상품 페이지에서 "거래완료" 또는 "삭제" 버튼을 클릭하면 됩니다. 삭제시 하루 게시물 제한 카운트가 복구됩니다.', 1, 4),
  ('신고', '부적절한 게시물을 발견했어요', '해당 상품 페이지에서 "신고하기" 버튼을 클릭하거나 관리자 문의를 통해 신고해주세요.', 0, 5),
  ('π-coin', 'π-coin 환불이 가능한가요?', 'π-coin은 가상화폐 특성상 환불이 제한됩니다. 구매 전 신중히 검토해주세요.', 0, 6);

-- 배너 데이터
INSERT OR IGNORE INTO banners (title, content, link_url, position, start_date, end_date) VALUES 
  ('🎉 신규 회원 가입시 π-coin 50개 지급!', '지금 가입하고 무료 π-coin을 받아보세요', '/static/purchase.html', 'main', datetime('now'), datetime('now', '+30 days')),
  ('💰 π-coin 충전하면 추가 보너스!', '10,000개 이상 구매시 보너스 π-coin 제공', '/static/purchase.html', 'sidebar', datetime('now'), datetime('now', '+14 days'));

-- 인기 검색어 초기 데이터
INSERT OR IGNORE INTO popular_keywords (keyword, search_count) VALUES 
  ('아이폰', 45),
  ('맥북', 32), 
  ('에어�팟', 28),
  ('닌텐도', 24),
  ('책상', 18),
  ('의자', 15),
  ('노트북', 38),
  ('카메라', 22),
  ('운동화', 19),
  ('가방', 16);

-- 테스트 리뷰 데이터
INSERT OR IGNORE INTO user_reviews (reviewer_id, reviewee_id, product_id, rating, comment, tags, transaction_type) VALUES 
  (2, 1, 1, 5, '친절하고 상품 상태도 설명과 같았어요!', '["친절해요", "설명대로예요"]', 'seller'),
  (3, 2, 2, 4, '좋은 상품이었습니다. 추천해요!', '["좋은상품", "추천해요"]', 'seller'),
  (1, 3, 3, 5, '빠른 응답과 정확한 약속시간 감사합니다.', '["빠른응답", "시간정확"]', 'seller');

-- 상품 태그 데이터
INSERT OR IGNORE INTO product_tags (product_id, tag) VALUES 
  (1, '애플'), (1, '스마트폰'), (1, '고급'),
  (2, '가구'), (2, '원목'), (2, '북유럽'),
  (3, '나이키'), (3, '운동화'), (3, '새제품'),
  (4, '책'), (4, '영어'), (4, '해리포터'),
  (5, '캠핑'), (5, '텐트'), (5, '가족용');

-- 팔로우 관계 예시
INSERT OR IGNORE INTO user_follows (follower_id, following_id) VALUES 
  (2, 1), -- Bob이 Alice를 팔로우
  (3, 1), -- Charlie가 Alice를 팔로우
  (4, 2), -- Diana가 Bob을 팔로우
  (1, 3); -- Alice가 Charlie를 팔로우

-- 검색 기록 예시
INSERT OR IGNORE INTO search_history (user_id, keyword, result_count) VALUES 
  (1, '아이폰', 3),
  (1, '맥북', 1),
  (2, '책상', 2),
  (2, '의자', 5),
  (3, '운동화', 8),
  (4, '가방', 4);

-- 상품 조회 기록
INSERT OR IGNORE INTO product_views (user_id, product_id, ip_address) VALUES 
  (2, 1, '192.168.1.1'),
  (3, 1, '192.168.1.2'), 
  (4, 1, '192.168.1.3'),
  (1, 2, '192.168.1.4'),
  (4, 2, '192.168.1.5'),
  (1, 3, '192.168.1.6');

-- 거래 후기 예시
INSERT OR IGNORE INTO transaction_reviews (product_id, reviewer_id, seller_id, buyer_id, rating, review_text, is_seller_review) VALUES 
  (1, 2, 1, 2, 5, '상품 상태 좋고 친절하세요!', 0), -- 구매자 Bob이 판매자 Alice에게
  (1, 1, 1, 2, 5, '좋은 구매자분이었습니다. 감사합니다!', 1), -- 판매자 Alice가 구매자 Bob에게
  (2, 3, 2, 3, 4, '설명대로 좋은 제품이었어요', 0);

-- 사용자 프로필 정보 업데이트
UPDATE users SET 
  bio = '안전하고 신뢰할 수 있는 거래를 지향합니다 😊',
  location = '서울 강남구',
  rating = 4.8,
  review_count = 2,
  trade_count = 3
WHERE id = 1;

UPDATE users SET 
  bio = '좋은 물건, 합리적인 가격으로!',
  location = '서울 마포구', 
  rating = 4.5,
  review_count = 1,
  trade_count = 2
WHERE id = 2;

UPDATE users SET 
  bio = '깔끔한 거래 선호합니다',
  location = '부산 해운대구',
  rating = 5.0,
  review_count = 1,
  trade_count = 1  
WHERE id = 3;

-- 관리자 계정 정보 업데이트
UPDATE users SET 
  bio = '파이코인 마켓 관리자입니다. 문의사항은 언제든 연락주세요!',
  location = '전국',
  is_admin = 1
WHERE email = '5321497@naver.com';