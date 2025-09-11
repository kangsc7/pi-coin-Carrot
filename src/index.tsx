import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 정적 파일 서빙
app.use('/static/*', serveStatic({ root: './public' }))

// 메인 페이지
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>파이코인 마켓 🥕 - 파이코인으로 거래하는 중고마켓</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'pi-orange': '#FF6600',
                            'pi-yellow': '#FFD700',
                            'carrot-orange': '#FF7E36'
                        }
                    }
                }
            }
        </script>
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- 헤더 -->
        <header class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex items-center justify-between h-16">
                    <!-- 로고 -->
                    <div class="flex items-center space-x-2">
                        <div class="w-10 h-10 bg-gradient-to-br from-pi-orange to-carrot-orange rounded-xl flex items-center justify-center">
                            <span class="text-white font-bold text-xl">π</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold text-gray-800 text-lg">파이코인 마켓</span>
                            <span class="text-xs text-gray-500">π-coin Market</span>
                        </div>
                    </div>

                    <!-- 검색바 -->
                    <div class="flex-1 max-w-lg mx-8">
                        <div class="relative">
                            <input type="text" 
                                   id="searchInput"
                                   placeholder="상품을 검색해보세요" 
                                   class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>

                    <!-- 네비게이션 -->
                    <nav class="flex items-center space-x-4">
                        <button id="loginBtn" class="px-4 py-2 text-gray-600 hover:text-pi-orange transition-colors">로그인</button>
                        <button id="signupBtn" class="px-4 py-2 bg-pi-orange text-white rounded-lg hover:bg-orange-600 transition-colors">회원가입</button>
                        <button id="sellBtn" class="px-4 py-2 bg-carrot-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                            <i class="fas fa-plus mr-1"></i> 판매하기
                        </button>
                    </nav>
                </div>
            </div>
        </header>

        <!-- 메인 컨텐츠 -->
        <main class="max-w-6xl mx-auto px-4 py-8">
            <!-- 히어로 섹션 -->
            <div class="bg-gradient-to-r from-pi-orange to-pi-yellow rounded-2xl p-8 text-white mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">파이코인으로 거래하는 새로운 방식</h1>
                        <p class="text-xl opacity-90 mb-4">안전하고 편리한 파이코인 중고마켓에서 특별한 거래를 경험하세요</p>
                        <div class="flex items-center space-x-4 text-sm">
                            <div class="flex items-center">
                                <i class="fas fa-shield-alt mr-2"></i>
                                <span>안전한 π-coin 거래</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-comments mr-2"></i>
                                <span>실시간 1:1 채팅</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-clock mr-2"></i>
                                <span>3일 후 채팅 자동 삭제</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-8xl opacity-20">
                        🥕
                    </div>
                </div>
            </div>

            <!-- 카테고리 섹션 -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">카테고리</h2>
                <div id="categories" class="grid grid-cols-4 md:grid-cols-8 gap-4">
                    <!-- 카테고리 목록이 동적으로 로드됩니다 -->
                </div>
            </div>

            <!-- 상품 목록 -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">최신 상품</h2>
                    <select id="sortSelect" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                        <option value="latest">최신순</option>
                        <option value="price_low">낮은 가격순</option>
                        <option value="price_high">높은 가격순</option>
                        <option value="popular">인기순</option>
                    </select>
                </div>
                <div id="productList" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <!-- 상품 목록이 동적으로 로드됩니다 -->
                </div>
            </div>
        </main>

        <!-- 로그인 모달 -->
        <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-pi-orange to-carrot-orange rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-white font-bold text-2xl">π</span>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">로그인</h3>
                    <p class="text-gray-600 mt-2">파이코인 마켓에 오신 것을 환영합니다</p>
                </div>
                
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                        <input type="email" name="email" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <input type="password" name="password" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                    </div>
                    <button type="submit" 
                            class="w-full bg-pi-orange text-white py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        로그인
                    </button>
                </form>
                
                <div class="mt-4 text-center">
                    <p class="text-gray-600">계정이 없으신가요? 
                        <button id="switchToSignup" class="text-pi-orange hover:underline">회원가입</button>
                    </p>
                </div>
                
                <button id="closeLoginModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
        </div>

        <!-- 회원가입 모달 -->
        <div id="signupModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-pi-orange to-carrot-orange rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-white font-bold text-2xl">π</span>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">회원가입</h3>
                    <p class="text-gray-600 mt-2">파이코인 마켓에서 거래를 시작하세요</p>
                </div>
                
                <form id="signupForm" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">이름</label>
                            <input type="text" name="fullName" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">사용자명</label>
                            <input type="text" name="username" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                        <input type="email" name="email" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                        <input type="tel" name="phone" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange"
                               placeholder="010-0000-0000">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <input type="password" name="password" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                        <input type="password" name="confirmPassword" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                    </div>
                    <button type="submit" 
                            class="w-full bg-pi-orange text-white py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        회원가입
                    </button>
                </form>
                
                <div class="mt-4 text-center">
                    <p class="text-gray-600">이미 계정이 있으신가요? 
                        <button id="switchToLogin" class="text-pi-orange hover:underline">로그인</button>
                    </p>
                </div>
                
                <button id="closeSignupModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
        </div>

        <!-- 채팅 알림 -->
        <div class="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg max-w-sm hidden" id="chatNotice">
            <div class="flex items-start">
                <i class="fas fa-exclamation-triangle mr-3 mt-1"></i>
                <div>
                    <p class="font-medium">채팅 기록 안내</p>
                    <p class="text-sm mt-1">채팅 기록은 3일 후 자동으로 삭제됩니다. 중요한 내용은 따로 메모해 주세요.</p>
                </div>
                <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="ml-2 text-yellow-600 hover:text-yellow-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// API 라우트들
// 카테고리 목록 조회
app.get('/api/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM categories ORDER BY sort_order ASC
    `).all()
    
    return c.json({ success: true, categories: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 목록 조회
app.get('/api/products', async (c) => {
  try {
    const sort = c.req.query('sort') || 'latest'
    const category = c.req.query('category')
    const search = c.req.query('search')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')

    let query = `
      SELECT 
        p.*,
        u.username as seller_username,
        u.full_name as seller_name,
        c.name as category_name,
        c.icon as category_icon,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY image_order ASC LIMIT 1) as first_image
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
    `

    const params = []

    if (category) {
      query += ` AND p.category_id = ?`
      params.push(category)
    }

    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    // 정렬
    switch (sort) {
      case 'price_low':
        query += ` ORDER BY p.price ASC`
        break
      case 'price_high':
        query += ` ORDER BY p.price DESC`
        break
      case 'popular':
        query += ` ORDER BY p.view_count DESC, p.like_count DESC`
        break
      default:
        query += ` ORDER BY p.created_at DESC`
    }

    query += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({ success: true, products: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 사용자 등록
app.post('/api/auth/signup', async (c) => {
  try {
    const { email, username, password, fullName, phone } = await c.req.json()

    // 간단한 비밀번호 해싱 (실제로는 bcrypt 등을 사용해야 함)
    const passwordHash = btoa(password) // Base64 인코딩 (데모용)

    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, username, password_hash, full_name, phone, pi_coin_balance)
      VALUES (?, ?, ?, ?, ?, 50.0)
    `).bind(email, username, passwordHash, fullName, phone).run()

    if (result.success) {
      return c.json({ 
        success: true, 
        message: '회원가입이 완료되었습니다. 가입 축하 선물로 50 π-coin을 드렸습니다!',
        userId: result.meta.last_row_id
      })
    } else {
      return c.json({ success: false, error: '회원가입에 실패했습니다.' }, 400)
    }
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, error: '이미 사용중인 이메일 또는 사용자명입니다.' }, 400)
    }
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 사용자 로그인
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const passwordHash = btoa(password) // Base64 인코딩 (데모용)
    
    const user = await c.env.DB.prepare(`
      SELECT id, email, username, full_name, phone, pi_coin_balance, created_at
      FROM users 
      WHERE email = ? AND password_hash = ?
    `).bind(email, passwordHash).first()

    if (user) {
      // 마지막 로그인 시간 업데이트
      await c.env.DB.prepare(`
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(user.id).run()

      return c.json({ 
        success: true, 
        message: '로그인 성공',
        user: user
      })
    } else {
      return c.json({ success: false, error: '이메일 또는 비밀번호가 잘못되었습니다.' }, 401)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 오늘 게시물 수 확인
app.get('/api/user/:userId/today-posts', async (c) => {
  try {
    const userId = c.req.param('userId')
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식

    const result = await c.env.DB.prepare(`
      SELECT COALESCE(post_count, 0) as count
      FROM daily_post_count 
      WHERE user_id = ? AND post_date = ?
    `).bind(userId, today).first()

    return c.json({ 
      success: true, 
      count: result?.count || 0,
      date: today 
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 등록
app.post('/api/products', async (c) => {
  try {
    const formData = await c.req.formData()
    
    const userId = formData.get('userId')
    const title = formData.get('title')
    const categoryId = formData.get('categoryId')
    const condition = formData.get('condition')
    const price = parseFloat(formData.get('price'))
    const piPrice = parseFloat(formData.get('piPrice'))
    const location = formData.get('location') || ''
    const description = formData.get('description')

    // 오늘 게시물 수 확인
    const today = new Date().toISOString().split('T')[0]
    const dailyCount = await c.env.DB.prepare(`
      SELECT COALESCE(post_count, 0) as count
      FROM daily_post_count 
      WHERE user_id = ? AND post_date = ?
    `).bind(userId, today).first()

    if (dailyCount && dailyCount.count >= 3) {
      return c.json({ 
        success: false, 
        error: '하루 최대 3개까지만 상품을 등록할 수 있습니다.' 
      }, 400)
    }

    // 상품 등록
    const productResult = await c.env.DB.prepare(`
      INSERT INTO products (seller_id, category_id, title, description, price, pi_coin_price, condition_type, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, categoryId, title, description, price, piPrice, condition, location).run()

    if (!productResult.success) {
      throw new Error('상품 등록에 실패했습니다.')
    }

    const productId = productResult.meta.last_row_id

    // 이미지 처리 (실제로는 Cloudflare R2나 외부 이미지 서비스 사용 권장)
    // 여기서는 데모용으로 가상의 이미지 URL 생성
    const imageUrls = []
    let imageOrder = 1
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        // 실제로는 이미지를 저장소에 업로드하고 URL을 받아야 함
        const imageUrl = `/static/images/products/${productId}_${imageOrder}.jpg`
        imageUrls.push(imageUrl)
        
        // 상품 이미지 테이블에 저장
        await c.env.DB.prepare(`
          INSERT INTO product_images (product_id, image_url, image_order)
          VALUES (?, ?, ?)
        `).bind(productId, imageUrl, imageOrder).run()
        
        imageOrder++
      }
    }

    // 일일 게시물 카운트 업데이트
    await c.env.DB.prepare(`
      INSERT INTO daily_post_count (user_id, post_date, post_count)
      VALUES (?, ?, 1)
      ON CONFLICT(user_id, post_date) DO UPDATE SET
      post_count = post_count + 1
    `).bind(userId, today).run()

    return c.json({ 
      success: true, 
      message: '상품이 성공적으로 등록되었습니다!',
      productId: productId,
      imageUrls: imageUrls
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 상세 조회
app.get('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id')

    // 조회수 증가
    await c.env.DB.prepare(`
      UPDATE products SET view_count = view_count + 1 WHERE id = ?
    `).bind(productId).run()

    // 상품 정보 조회
    const product = await c.env.DB.prepare(`
      SELECT 
        p.*,
        u.username as seller_username,
        u.full_name as seller_name,
        u.profile_image as seller_image,
        c.name as category_name,
        c.icon as category_icon
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = 'active'
    `).bind(productId).first()

    if (!product) {
      return c.json({ success: false, error: '상품을 찾을 수 없습니다.' }, 404)
    }

    // 상품 이미지 조회
    const { results: images } = await c.env.DB.prepare(`
      SELECT image_url, image_order 
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY image_order ASC
    `).bind(productId).all()

    return c.json({ 
      success: true, 
      product: {
        ...product,
        images: images
      }
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 삭제 (판매자만)
app.delete('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id')
    const { userId } = await c.req.json()

    // 상품 소유자 확인
    const product = await c.env.DB.prepare(`
      SELECT seller_id FROM products WHERE id = ?
    `).bind(productId).first()

    if (!product) {
      return c.json({ success: false, error: '상품을 찾을 수 없습니다.' }, 404)
    }

    if (product.seller_id !== parseInt(userId)) {
      return c.json({ success: false, error: '삭제 권한이 없습니다.' }, 403)
    }

    // 상품 상태를 deleted로 변경하고 삭제 시간 기록
    await c.env.DB.prepare(`
      UPDATE products 
      SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(productId).run()

    // 일일 게시물 카운트 감소
    const today = new Date().toISOString().split('T')[0]
    await c.env.DB.prepare(`
      UPDATE daily_post_count 
      SET post_count = MAX(0, post_count - 1)
      WHERE user_id = ? AND post_date = ?
    `).bind(product.seller_id, today).run()

    return c.json({ 
      success: true, 
      message: '상품이 삭제되었습니다. 오늘 새로운 상품을 등록할 수 있습니다.' 
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 좋아요/취소
app.post('/api/products/:id/like', async (c) => {
  try {
    const productId = c.req.param('id')
    const { userId } = await c.req.json()

    // 기존 좋아요 확인
    const existingLike = await c.env.DB.prepare(`
      SELECT id FROM user_likes WHERE user_id = ? AND product_id = ?
    `).bind(userId, productId).first()

    if (existingLike) {
      // 좋아요 취소
      await c.env.DB.prepare(`
        DELETE FROM user_likes WHERE user_id = ? AND product_id = ?
      `).bind(userId, productId).run()

      await c.env.DB.prepare(`
        UPDATE products SET like_count = like_count - 1 WHERE id = ?
      `).bind(productId).run()

      return c.json({ success: true, liked: false, message: '좋아요를 취소했습니다.' })
    } else {
      // 좋아요 추가
      await c.env.DB.prepare(`
        INSERT INTO user_likes (user_id, product_id) VALUES (?, ?)
      `).bind(userId, productId).run()

      await c.env.DB.prepare(`
        UPDATE products SET like_count = like_count + 1 WHERE id = ?
      `).bind(productId).run()

      return c.json({ success: true, liked: true, message: '좋아요를 추가했습니다.' })
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 채팅방 생성 또는 조회
app.post('/api/chat/room', async (c) => {
  try {
    const { productId, buyerId, sellerId } = await c.req.json()

    // 기존 채팅방 확인
    let chatRoom = await c.env.DB.prepare(`
      SELECT * FROM chat_rooms 
      WHERE product_id = ? AND buyer_id = ? AND seller_id = ?
    `).bind(productId, buyerId, sellerId).first()

    if (!chatRoom) {
      // 새 채팅방 생성
      const result = await c.env.DB.prepare(`
        INSERT INTO chat_rooms (product_id, buyer_id, seller_id)
        VALUES (?, ?, ?)
      `).bind(productId, buyerId, sellerId).run()

      if (result.success) {
        chatRoom = await c.env.DB.prepare(`
          SELECT * FROM chat_rooms WHERE id = ?
        `).bind(result.meta.last_row_id).first()
      }
    } else {
      // 채팅방 활성화
      await c.env.DB.prepare(`
        UPDATE chat_rooms SET status = 'active', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(chatRoom.id).run()
    }

    // 상품 정보와 함께 반환
    const product = await c.env.DB.prepare(`
      SELECT id, title, price, pi_coin_price, status,
             (SELECT image_url FROM product_images WHERE product_id = ? LIMIT 1) as image_url
      FROM products WHERE id = ?
    `).bind(productId, productId).first()

    return c.json({ 
      success: true, 
      chatRoom: chatRoom,
      product: product
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 채팅 메시지 전송
app.post('/api/chat/message', async (c) => {
  try {
    const { roomId, senderId, message, messageType = 'text' } = await c.req.json()

    // 채팅방 상태 확인
    const chatRoom = await c.env.DB.prepare(`
      SELECT status FROM chat_rooms WHERE id = ?
    `).bind(roomId).first()

    if (!chatRoom || chatRoom.status !== 'active') {
      return c.json({ success: false, error: '채팅방을 찾을 수 없거나 비활성 상태입니다.' }, 404)
    }

    // 메시지 저장 (3일 후 만료)
    const result = await c.env.DB.prepare(`
      INSERT INTO chat_messages (room_id, sender_id, message, message_type, expires_at)
      VALUES (?, ?, ?, ?, datetime('now', '+3 days'))
    `).bind(roomId, senderId, message, messageType).run()

    if (result.success) {
      // 채팅방 업데이트 시간 갱신
      await c.env.DB.prepare(`
        UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(roomId).run()

      // 전송된 메시지 정보 반환
      const savedMessage = await c.env.DB.prepare(`
        SELECT cm.*, u.full_name as sender_name
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        WHERE cm.id = ?
      `).bind(result.meta.last_row_id).first()

      return c.json({ success: true, message: savedMessage })
    } else {
      throw new Error('메시지 저장에 실패했습니다.')
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 채팅 메시지 목록 조회
app.get('/api/chat/:roomId/messages', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    // 만료된 메시지 정리
    await c.env.DB.prepare(`
      DELETE FROM chat_messages WHERE expires_at < datetime('now')
    `).run()

    // 메시지 목록 조회
    const { results: messages } = await c.env.DB.prepare(`
      SELECT cm.*, u.full_name as sender_name, u.username as sender_username
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.room_id = ? AND cm.expires_at > datetime('now')
      ORDER BY cm.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(roomId, limit, offset).all()

    return c.json({ success: true, messages: messages.reverse() })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 사용자의 채팅방 목록 조회
app.get('/api/user/:userId/chatrooms', async (c) => {
  try {
    const userId = c.req.param('userId')

    // 만료된 메시지 정리
    await c.env.DB.prepare(`
      DELETE FROM chat_messages WHERE expires_at < datetime('now')
    `).run()

    const { results: chatRooms } = await c.env.DB.prepare(`
      SELECT 
        cr.*,
        p.title as product_title,
        p.price as product_price,
        p.pi_coin_price as product_pi_price,
        p.status as product_status,
        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as product_image,
        buyer.full_name as buyer_name,
        seller.full_name as seller_name,
        (SELECT message FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id AND expires_at > datetime('now')) as message_count
      FROM chat_rooms cr
      LEFT JOIN products p ON cr.product_id = p.id
      LEFT JOIN users buyer ON cr.buyer_id = buyer.id
      LEFT JOIN users seller ON cr.seller_id = seller.id
      WHERE (cr.buyer_id = ? OR cr.seller_id = ?) AND cr.status = 'active'
      ORDER BY cr.updated_at DESC
    `).bind(userId, userId).all()

    return c.json({ success: true, chatRooms: chatRooms })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 채팅방 정보 조회
app.get('/api/chat/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')

    const chatRoom = await c.env.DB.prepare(`
      SELECT 
        cr.*,
        p.title as product_title,
        p.price as product_price,
        p.pi_coin_price as product_pi_price,
        p.status as product_status,
        p.seller_id as product_seller_id,
        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as product_image,
        buyer.full_name as buyer_name,
        buyer.username as buyer_username,
        seller.full_name as seller_name,
        seller.username as seller_username
      FROM chat_rooms cr
      LEFT JOIN products p ON cr.product_id = p.id
      LEFT JOIN users buyer ON cr.buyer_id = buyer.id
      LEFT JOIN users seller ON cr.seller_id = seller.id
      WHERE cr.id = ? AND cr.status = 'active'
    `).bind(roomId).first()

    if (!chatRoom) {
      return c.json({ success: false, error: '채팅방을 찾을 수 없습니다.' }, 404)
    }

    return c.json({ success: true, chatRoom: chatRoom })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 만료된 채팅 메시지 정리 (크론 작업용 API)
app.post('/api/chat/cleanup', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      DELETE FROM chat_messages WHERE expires_at < datetime('now')
    `).run()

    return c.json({ 
      success: true, 
      message: `${result.meta.changes || 0}개의 만료된 메시지가 삭제되었습니다.`,
      deletedCount: result.meta.changes || 0
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 판매하기 페이지
app.get('/sell', (c) => {
  // 정적 파일로 제공되므로 /static/sell.html로 리다이렉트
  return c.redirect('/static/sell.html')
})

// 헬스 체크
app.get('/api/health', async (c) => {
  try {
    // 데이터베이스 연결 테스트
    await c.env.DB.prepare('SELECT 1').first()
    return c.json({ success: true, message: 'Database connected', timestamp: new Date().toISOString() })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app