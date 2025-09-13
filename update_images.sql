-- 모든 제품 이미지를 플레이스홀더로 업데이트
UPDATE product_images 
SET image_url = '/static/images/products/placeholder.svg'
WHERE 1=1;