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
        <title>파이코인 당근 🥕 - 파이코인으로 거래하는 중고마켓</title>
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
                    <div class="flex items-center space-x-2 cursor-pointer" onclick="window.location.href='/'">
                        <div class="w-10 h-10 bg-gradient-to-br from-pi-orange to-carrot-orange rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                            <span class="text-white font-bold text-xl">🥕</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold text-gray-800 text-lg hover:text-pi-orange transition-colors">파이코인 당근</span>
                            <span class="text-xs text-gray-500">π-coin Carrot</span>
                        </div>
                    </div>

                    <!-- 검색바 -->
                    <div class="flex-1 max-w-lg mx-4 lg:mx-8">
                        <div class="relative">
                            <input type="text" 
                                   id="searchInput"
                                   placeholder="상품을 검색해보세요" 
                                   class="w-full px-4 py-2 pl-10 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <button id="filterBtn" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pi-orange">
                                <i class="fas fa-filter"></i>
                            </button>
                        </div>
                    </div>

                    <!-- 네비게이션 (데스크탑) -->
                    <nav class="hidden lg:flex items-center space-x-2">
                        <button onclick="window.location.href='/static/notice.html'" class="px-3 py-2 text-sm text-gray-600 hover:text-pi-orange transition-colors">
                            <i class="fas fa-bullhorn mr-1"></i> 공지사항
                        </button>
                        <button onclick="window.location.href='/static/board.html'" class="px-3 py-2 text-sm text-gray-600 hover:text-pi-orange transition-colors">
                            <i class="fas fa-comments mr-1"></i> 게시판
                        </button>
                        <button id="loginBtn" class="px-3 py-2 text-sm text-gray-600 hover:text-pi-orange transition-colors">로그인</button>
                        <button id="signupBtn" class="px-3 py-2 text-sm bg-pi-orange text-white rounded-lg hover:bg-orange-600 transition-colors">회원가입</button>
                        <button id="piCoinBtn" class="px-3 py-2 text-sm bg-gradient-to-r from-pi-yellow to-pi-orange text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors hidden">
                            <i class="fas fa-coins mr-1"></i> π-coin
                        </button>
                        <button id="sellBtn" class="px-3 py-2 text-sm bg-carrot-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                            <i class="fas fa-plus mr-1"></i> 판매
                        </button>
                        <button id="adminBtn" class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hidden">
                            <i class="fas fa-cog mr-1"></i> 관리자
                        </button>
                    </nav>

                    <!-- 모바일 메뉴 버튼 -->
                    <button id="mobileMenuBtn" class="lg:hidden p-2 text-gray-600 hover:text-pi-orange">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </header>

        <!-- 모바일 메뉴 드롭다운 -->
        <div id="mobileMenu" class="lg:hidden bg-white border-b border-gray-200 shadow-sm hidden">
            <div class="max-w-6xl mx-auto px-4 py-4">
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="window.location.href='/static/notice.html'" class="flex items-center justify-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <i class="fas fa-bullhorn mr-2"></i>
                        <span>공지사항</span>
                    </button>
                    <button onclick="window.location.href='/static/board.html'" class="flex items-center justify-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <i class="fas fa-comments mr-2"></i>
                        <span>게시판</span>
                    </button>
                    <button id="mobileLoginBtn" class="flex items-center justify-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        <span>로그인</span>
                    </button>
                    <button id="mobileSignupBtn" class="flex items-center justify-center px-4 py-3 bg-pi-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                        <i class="fas fa-user-plus mr-2"></i>
                        <span>회원가입</span>
                    </button>
                    <button id="mobilePiCoinBtn" class="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-pi-yellow to-pi-orange text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors hidden">
                        <i class="fas fa-coins mr-2"></i>
                        <span>π-coin 구매</span>
                    </button>
                    <button id="mobileSellBtn" class="flex items-center justify-center px-4 py-3 bg-carrot-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                        <i class="fas fa-plus mr-2"></i>
                        <span>판매하기</span>
                    </button>
                    <button id="mobileAdminBtn" class="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hidden">
                        <i class="fas fa-cog mr-2"></i>
                        <span>관리자</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 메인 컨텐츠 -->
        <main class="max-w-6xl mx-auto px-4 py-8">
            <!-- 히어로 섹션 -->
            <div class="bg-gradient-to-r from-pi-orange to-pi-yellow rounded-2xl p-4 md:p-8 text-white mb-8">
                <div class="flex items-center justify-between">
                    <div class="flex-1 pr-4">
                        <h1 class="text-lg sm:text-2xl md:text-3xl font-bold mb-2 leading-tight">
                            <span class="block sm:inline">파이코인으로 거래하는</span>
                            <span class="block sm:inline"> 새로운 방식</span>
                        </h1>
                        <p class="text-sm sm:text-lg md:text-xl opacity-90 mb-4">안전하고 편리한 파이코인 당근에서 특별한 거래를 경험하세요</p>
                        <div class="hidden md:flex items-center space-x-4 text-sm">
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
                    <div class="text-4xl sm:text-6xl md:text-8xl opacity-20 flex-shrink-0">
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

            <!-- 카페 스타일 사이드바 필터 -->
            <div class="flex gap-6">
                <!-- 왼쪽 필터 사이드바 (기본적으로 숨김) -->
                <div id="filterSidebar" class="w-64 flex-shrink-0 hidden">
                    <div class="cafe-filter-sidebar bg-white rounded-2xl p-6 sticky top-24">
                        <h2 class="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-pi-orange">
                            <i class="fas fa-filter mr-2 text-pi-orange"></i>
                            전체 카테고리
                        </h2>
                        
                        <!-- 카테고리 필터 -->
                        <div class="mb-8">
                            <div class="space-y-2">
                                <button class="cafe-filter-item active w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="">
                                    <i class="fas fa-th-large mr-3 w-4"></i>
                                    <span>전체보기</span>
                                </button>
                                <button class="cafe-filter-item w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="1">
                                    <i class="fas fa-mobile-alt mr-3 w-4"></i>
                                    <span>전자기기</span>
                                </button>
                                <button class="cafe-filter-item w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="2">
                                    <i class="fas fa-couch mr-3 w-4"></i>
                                    <span>가구/인테리어</span>
                                </button>
                                <button class="cafe-filter-item w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="3">
                                    <i class="fas fa-tshirt mr-3 w-4"></i>
                                    <span>의류/패션잡화</span>
                                </button>
                                <button class="cafe-filter-item w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="4">
                                    <i class="fas fa-book mr-3 w-4"></i>
                                    <span>도서/음반</span>
                                </button>
                                <button class="cafe-filter-item w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="5">
                                    <i class="fas fa-futbol mr-3 w-4"></i>
                                    <span>스포츠/레저</span>
                                </button>
                                <button class="cafe-filter-item w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="6">
                                    <i class="fas fa-gamepad mr-3 w-4"></i>
                                    <span>게임/취미</span>
                                </button>
                                <button class="cafe-filter-item w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="7">
                                    <i class="fas fa-home mr-3 w-4"></i>
                                    <span>생활용품</span>
                                </button>
                                <button class="cafe-filter-item w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors" data-category="8">
                                    <i class="fas fa-box mr-3 w-4"></i>
                                    <span>기타</span>
                                </button>
                            </div>
                        </div>

                        <!-- 가격 필터 -->
                        <div class="mb-8">
                            <h3 class="font-semibold text-gray-700 mb-4">가격대</h3>
                            <div class="space-y-2 mb-4">
                                <button class="cafe-price-filter active w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-min="" data-max="">전체</button>
                                <button class="cafe-price-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-min="0" data-max="10000">1만원 이하</button>
                                <button class="cafe-price-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-min="10000" data-max="50000">1만원~5만원</button>
                                <button class="cafe-price-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-min="50000" data-max="100000">5만원~10만원</button>
                                <button class="cafe-price-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-min="100000" data-max="500000">10만원~50만원</button>
                                <button class="cafe-price-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-min="500000" data-max="">50만원 이상</button>
                            </div>
                            
                            <!-- 직접 입력 -->
                            <div class="space-y-3">
                                <input type="number" id="minPriceFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="최저가격">
                                <input type="number" id="maxPriceFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="최고가격">
                            </div>
                        </div>

                        <!-- 상품 상태 -->
                        <div class="mb-8">
                            <h3 class="font-semibold text-gray-700 mb-4">상품 상태</h3>
                            <div class="space-y-2">
                                <button class="cafe-condition-filter active w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-condition="">전체</button>
                                <button class="cafe-condition-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-condition="new">
                                    <span class="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>새상품
                                </button>
                                <button class="cafe-condition-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-condition="like_new">
                                    <span class="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2"></span>거의새것
                                </button>
                                <button class="cafe-condition-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-condition="good">
                                    <span class="w-2 h-2 bg-yellow-500 rounded-full inline-block mr-2"></span>좋음
                                </button>
                                <button class="cafe-condition-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-condition="fair">
                                    <span class="w-2 h-2 bg-orange-500 rounded-full inline-block mr-2"></span>보통
                                </button>
                                <button class="cafe-condition-filter w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors" data-condition="poor">
                                    <span class="w-2 h-2 bg-red-500 rounded-full inline-block mr-2"></span>나쁨
                                </button>
                            </div>
                        </div>

                        <!-- 필터 적용/초기화 버튼 -->
                        <div class="space-y-2">
                            <button id="applyFilters" class="w-full py-3 bg-pi-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                                <i class="fas fa-search mr-2"></i>필터 적용
                            </button>
                            <button id="resetFilters" class="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <i class="fas fa-undo mr-2"></i>초기화
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 오른쪽 상품 목록 영역 -->
                <div class="flex-1">

                    <!-- 상품 목록 헤더 -->
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">최신 상품</h2>
                        <select id="sortSelect" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                            <option value="latest">최신순</option>
                            <option value="price_low">낮은 가격순</option>
                            <option value="price_high">높은 가격순</option>
                            <option value="popular">인기순</option>
                        </select>
                    </div>
                    
                    <!-- 활성 필터 표시 -->
                    <div id="activeFilters" class="mb-4 hidden">
                        <div class="flex flex-wrap gap-2">
                            <!-- 활성 필터들이 동적으로 추가됩니다 -->
                        </div>
                    </div>
                    
                    <div id="productList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <!-- 상품 목록이 동적으로 로드됩니다 -->
                    </div>
                </div>
            </div>
        </main>



        <!-- 로그인 모달 -->
        <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-pi-orange to-carrot-orange rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-white font-bold text-2xl">🥕</span>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">로그인</h3>
                    <p class="text-gray-600 mt-2">파이코인 당근에 오신 것을 환영합니다</p>
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
                        <span class="text-white font-bold text-2xl">🥕</span>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">회원가입</h3>
                    <p class="text-gray-600 mt-2">파이코인 당근에서 거래를 시작하세요</p>
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

        <!-- 상품 수정 모달 -->
        <div id="editProductModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-pi-orange to-carrot-orange rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-edit text-white text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">상품 정보 수정</h3>
                    <p class="text-gray-600 mt-2">상품 정보를 수정하세요</p>
                </div>
                
                <form id="editProductForm" class="space-y-4">
                    <input type="hidden" id="editProductId" name="productId">
                    
                    <!-- 제목 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                        <input type="text" id="editTitle" name="title" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange" 
                               placeholder="상품 제목을 입력하세요">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- 가격 -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">가격(원) *</label>
                            <input type="number" id="editPrice" name="price" required min="100" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange"
                                   placeholder="100">
                        </div>

                        <!-- 상품 상태 -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">상품 상태 *</label>
                            <select id="editCondition" name="condition" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                                <option value="">상태 선택</option>
                                <option value="new">새상품</option>
                                <option value="like_new">거의새것</option>
                                <option value="good">좋음</option>
                                <option value="fair">보통</option>
                                <option value="poor">나쁨</option>
                            </select>
                        </div>
                    </div>

                    <!-- 위치 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">거래 희망 지역</label>
                        
                        <!-- 지역 선택 단계별 드롭다운 -->
                        <div class="space-y-3">
                            <!-- 시/도 선택 -->
                            <div>
                                <select id="editCity" name="city" required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                                    <option value="">시/도를 선택하세요</option>
                                </select>
                            </div>

                            <!-- 구/군 선택 -->
                            <div>
                                <select id="editDistrict" name="district" required disabled
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange disabled:bg-gray-100">
                                    <option value="">구/군을 선택하세요</option>
                                </select>
                            </div>

                            <!-- 동 선택 -->
                            <div>
                                <select id="editDong" name="dong" disabled
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange disabled:bg-gray-100">
                                    <option value="">동을 선택하세요 (선택사항)</option>
                                </select>
                            </div>

                            <!-- 기타 지역 입력 -->
                            <div id="editCustomLocationDiv" class="hidden">
                                <input type="text" id="editCustomLocation" name="customLocation" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange"
                                       placeholder="정확한 동 이름을 입력하세요">
                            </div>

                            <!-- 최종 지역 표시 (숨김 필드) -->
                            <input type="hidden" id="editLocation" name="location">
                        </div>
                    </div>

                    <!-- 설명 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
                        <textarea id="editDescription" name="description" rows="4" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange resize-none"
                                  placeholder="상품에 대한 자세한 설명을 입력하세요"></textarea>
                    </div>

                    <!-- 현재 이미지 표시 -->
                    <div id="currentImages" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-1">현재 이미지</label>
                        <div id="currentImageList" class="grid grid-cols-3 gap-2">
                            <!-- 현재 이미지들이 여기에 표시됩니다 -->
                        </div>
                    </div>

                    <!-- 버튼들 -->
                    <div class="flex space-x-3 pt-4">
                        <button type="button" id="cancelEditProduct" 
                                class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            취소
                        </button>
                        <button type="submit" 
                                class="flex-1 px-4 py-2 bg-pi-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                            수정 완료
                        </button>
                    </div>
                </form>
                
                <button id="closeEditProductModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
        </div>

        <!-- 검색 필터 패널 -->
        <div id="filterPanel" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-map-marker-alt text-pi-orange mr-2"></i>
                        지역 필터
                    </h3>
                    <button id="closeFilter" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <!-- 지역 필터 전용 팝업 -->
                <div class="space-y-6">
                    <!-- 지역 필터 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-3">
                            <i class="fas fa-map-marker-alt mr-2 text-pi-orange"></i>
                            지역 선택
                        </label>
                        
                        <!-- 지역 선택 단계별 드롭다운 -->
                        <div class="space-y-4">
                            <!-- 시/도 선택 -->
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">시/도</label>
                                <select id="filterCity" name="filterCity"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                                    <option value="">전체 시/도</option>
                                </select>
                            </div>

                            <!-- 구/군 선택 -->
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">구/군</label>
                                <select id="filterDistrict" name="filterDistrict" disabled
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange disabled:bg-gray-100">
                                    <option value="">전체 구/군</option>
                                </select>
                            </div>

                            <!-- 동 선택 -->
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-1">동/읍/면</label>
                                <select id="filterDong" name="filterDong" disabled
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange disabled:bg-gray-100">
                                    <option value="">전체 동/읍/면</option>
                                </select>
                            </div>

                            <!-- 기타 지역 입력 -->
                            <div id="filterCustomLocationDiv" class="hidden">
                                <label class="block text-xs font-medium text-gray-600 mb-1">직접 입력</label>
                                <input type="text" id="filterCustomLocation" name="filterCustomLocation" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange"
                                       placeholder="정확한 동 이름을 입력하세요">
                            </div>

                            <!-- 최종 지역 표시 (숨김 필드) -->
                            <input type="hidden" id="filterLocation" name="filterLocation">
                            
                            <!-- 선택된 지역 표시 -->
                            <div id="selectedLocationDisplay" class="hidden">
                                <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div class="flex items-center text-sm">
                                        <i class="fas fa-map-marker-alt text-pi-orange mr-2"></i>
                                        <span id="selectedLocationText" class="text-gray-700"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 지역 필터 버튼들 -->
                <div class="flex space-x-3 mt-8">
                    <button id="resetLocationFilter" class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <i class="fas fa-undo mr-2"></i>
                        지역 초기화
                    </button>
                    <button id="applyLocationFilter" class="flex-1 px-4 py-2 bg-pi-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                        <i class="fas fa-map-marker-alt mr-2"></i>
                        지역 적용
                    </button>
                </div>
            </div>
        </div>

        <!-- 공지사항 안내 배너 (첫 방문시만 표시) -->
        <div class="fixed bottom-4 left-4 bg-gradient-to-r from-pi-orange to-pi-yellow text-white p-4 rounded-lg shadow-lg max-w-sm hidden" id="noticeAlert">
            <div class="flex items-start">
                <i class="fas fa-bullhorn mr-3 mt-1"></i>
                <div>
                    <p class="font-medium">중요 안내사항</p>
                    <p class="text-sm mt-1 opacity-90">채팅 및 게시물 자동 삭제 정책이 있습니다.</p>
                    <button onclick="window.location.href='/static/notice.html'" class="mt-2 text-sm bg-white text-pi-orange px-2 py-1 rounded hover:bg-gray-100">
                        공지사항 보기
                    </button>
                </div>
                <button onclick="this.parentElement.parentElement.classList.add('hidden'); localStorage.setItem('notice_shown', 'true')" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        
        <!-- 임시 버튼 기능 복구 -->
        <script>
        // DOM 로드 완료 후 실행
        document.addEventListener('DOMContentLoaded', function() {
            console.log('임시 버튼 스크립트 로드됨');
            
            // 게시판 자동 청소 실행 (비동기)
            setTimeout(() => {
                cleanupOldPosts();
            }, 2000); // 페이지 로드 2초 후 실행

            // 지역 데이터 초기화 및 로드
            setTimeout(() => {
                initLocationData();
                loadCities();
                setupLocationListeners();
                setupFilterButtons();
            }, 1000); // 페이지 로드 1초 후 실행
            
            // 로그인 버튼 이벤트 추가
            function addButtonEvents() {
                const loginBtn = document.getElementById('loginBtn');
                const signupBtn = document.getElementById('signupBtn');
                const sellBtn = document.getElementById('sellBtn');
                const adminBtn = document.getElementById('adminBtn');
                
                if (loginBtn) {
                    loginBtn.addEventListener('click', function() {
                        const modal = document.getElementById('loginModal');
                        if (modal) {
                            modal.classList.remove('hidden');
                            modal.classList.add('flex');
                        }
                    });
                }
                
                if (signupBtn) {
                    signupBtn.addEventListener('click', function() {
                        const modal = document.getElementById('signupModal');
                        if (modal) {
                            modal.classList.remove('hidden');
                            modal.classList.add('flex');
                        }
                    });
                }
                
                if (sellBtn) {
                    sellBtn.addEventListener('click', function() {
                        const userData = localStorage.getItem('picoin_user');
                        if (!userData) {
                            alert('로그인이 필요한 서비스입니다.');
                            const modal = document.getElementById('loginModal');
                            if (modal) {
                                modal.classList.remove('hidden');
                                modal.classList.add('flex');
                            }
                        } else {
                            window.location.href = '/static/sell.html';
                        }
                    });
                }
                
                if (adminBtn) {
                    adminBtn.addEventListener('click', function() {
                        const userData = localStorage.getItem('picoin_user');
                        if (!userData) {
                            alert('로그인이 필요한 서비스입니다.');
                            return;
                        }
                        
                        const user = JSON.parse(userData);
                        if (user.email !== '5321497@naver.com') {
                            alert('관리자 권한이 없습니다.');
                            return;
                        }
                        
                        window.location.href = '/static/admin.html';
                    });
                }
                
                // 모달 닫기 버튼들
                const closeLoginModal = document.getElementById('closeLoginModal');
                const closeSignupModal = document.getElementById('closeSignupModal');
                
                if (closeLoginModal) {
                    closeLoginModal.addEventListener('click', function() {
                        const modal = document.getElementById('loginModal');
                        if (modal) {
                            modal.classList.add('hidden');
                            modal.classList.remove('flex');
                        }
                    });
                }
                
                if (closeSignupModal) {
                    closeSignupModal.addEventListener('click', function() {
                        const modal = document.getElementById('signupModal');
                        if (modal) {
                            modal.classList.add('hidden');
                            modal.classList.remove('flex');
                        }
                    });
                }
                
                // 로그인 폼 제출
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData);
                        
                        try {
                            const response = await axios.post('/api/auth/login', data);
                            if (response.data.success) {
                                localStorage.setItem('picoin_user', JSON.stringify(response.data.user));
                                alert('로그인 성공! 관리자 버튼이 나타날 것입니다.');
                                const modal = document.getElementById('loginModal');
                                if (modal) {
                                    modal.classList.add('hidden');
                                    modal.classList.remove('flex');
                                }
                                // 관리자 버튼 표시
                                if (response.data.user.email === '5321497@naver.com') {
                                    const adminBtn = document.getElementById('adminBtn');
                                    if (adminBtn) adminBtn.classList.remove('hidden');
                                }
                                location.reload(); // 페이지 새로고침
                            } else {
                                alert(response.data.error);
                            }
                        } catch (error) {
                            alert('로그인에 실패했습니다: ' + (error.response?.data?.error || error.message));
                        }
                    });
                }
                
                console.log('버튼 이벤트 추가 완료');
            }
            
            // 상품 목록 로드
            async function loadProducts(filters = {}) {
                try {
                    let url = '/api/products?';
                    const params = new URLSearchParams();
                    
                    // 필터 파라미터 추가
                    if (filters.search) params.append('search', filters.search);
                    if (filters.category) params.append('category', filters.category);
                    if (filters.location) params.append('location', filters.location);
                    if (filters.priceMin) params.append('priceMin', filters.priceMin);
                    if (filters.priceMax) params.append('priceMax', filters.priceMax);
                    if (filters.condition) params.append('condition', filters.condition);
                    if (filters.sort) params.append('sort', filters.sort);
                    
                    url += params.toString();
                    
                    const response = await axios.get(url);
                    if (response.data.success) {
                        renderProducts(response.data.products);
                    }
                } catch (error) {
                    console.error('상품 로드 실패:', error);
                }
            }

            // 필터 적용
            function applyFilters() {
                const filters = {};
                
                // 검색어
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim()) {
                    filters.search = searchInput.value.trim();
                }
                
                // 카테고리
                const categorySelect = document.getElementById('filterCategory');
                if (categorySelect && categorySelect.value) {
                    filters.category = categorySelect.value;
                }
                
                // 지역
                const locationInput = document.getElementById('filterLocation');
                if (locationInput && locationInput.value.trim()) {
                    filters.location = locationInput.value.trim();
                }
                
                // 가격 범위
                const priceMin = document.getElementById('filterPriceMin');
                const priceMax = document.getElementById('filterPriceMax');
                if (priceMin && priceMin.value) {
                    filters.priceMin = priceMin.value;
                }
                if (priceMax && priceMax.value) {
                    filters.priceMax = priceMax.value;
                }
                
                // 상품 상태
                const conditionSelect = document.getElementById('filterCondition');
                if (conditionSelect && conditionSelect.value) {
                    filters.condition = conditionSelect.value;
                }
                
                loadProducts(filters);
                
                // 필터 패널 닫기
                const filterPanel = document.getElementById('filterPanel');
                if (filterPanel) {
                    filterPanel.classList.add('hidden');
                    filterPanel.classList.remove('flex');
                }
            }

            // 필터 초기화
            function resetFilters() {
                // 필터 폼 초기화
                document.getElementById('filterCategory').value = '';
                document.getElementById('filterCity').value = '';
                document.getElementById('filterDistrict').value = '';
                document.getElementById('filterDistrict').disabled = true;
                document.getElementById('filterDong').value = '';
                document.getElementById('filterDong').disabled = true;
                document.getElementById('filterLocation').value = '';
                document.getElementById('filterPriceMin').value = '';
                document.getElementById('filterPriceMax').value = '';
                
                // 기타 지역 입력 숨기기
                const customDiv = document.getElementById('filterCustomLocationDiv');
                if (customDiv) {
                    customDiv.classList.add('hidden');
                }
                
                // 검색어도 초기화
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = '';
                }
                
                // 필터 적용
                loadProducts();
            }

            // 필터 버튼 이벤트 설정
            function setupFilterButtons() {
                const applyButton = document.getElementById('applyFilters');
                const resetButton = document.getElementById('resetFilters');
                const filterBtn = document.getElementById('filterBtn');
                const closeFilterBtn = document.getElementById('closeFilter');

                if (applyButton) {
                    applyButton.addEventListener('click', applyFilters);
                }

                if (resetButton) {
                    resetButton.addEventListener('click', resetFilters);
                }

                if (filterBtn) {
                    filterBtn.addEventListener('click', function() {
                        console.log('HTML 필터 버튼 클릭됨 - PicoinMarket 인스턴스 호출');
                        // app.js의 PicoinMarket 인스턴스의 toggleFilters 메소드 호출
                        if (window.app && window.app.toggleFilters) {
                            window.app.toggleFilters();
                        } else {
                            console.error('PicoinMarket 인스턴스를 찾을 수 없습니다');
                        }
                    });
                }

                if (closeFilterBtn) {
                    closeFilterBtn.addEventListener('click', function() {
                        const filterPanel = document.getElementById('filterPanel');
                        if (filterPanel) {
                            filterPanel.classList.add('hidden');
                            filterPanel.classList.remove('flex');
                        }
                    });
                }

                // 검색 엔터키 이벤트
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            applyFilters();
                        }
                    });
                }
            }
            
            // 상품 목록 렌더링
            function renderProducts(products) {
                const container = document.getElementById('productList');
                if (!container) return;
                
                if (products.length === 0) {
                    container.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-600">등록된 상품이 없습니다</p></div>';
                    return;
                }
                
                const userData = localStorage.getItem('picoin_user');
                const currentUser = userData ? JSON.parse(userData) : null;
                const isAdmin = currentUser && currentUser.email === '5321497@naver.com';
                
                container.innerHTML = products.map(product => {
                    const isOwner = currentUser && product.seller_id === currentUser.id;
                    const canEdit = isOwner || isAdmin;
                    
                    return '<div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow relative">' +
                        '<div class="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center cursor-pointer" onclick="window.location.href=\\'/static/product.html?id=' + product.id + '\\'">' +
                            (product.first_image 
                                ? '<img src="' + product.first_image + '" alt="' + product.title + '" class="w-full h-full object-cover rounded-t-lg">'
                                : '<i class="fas fa-image text-gray-400 text-3xl"></i>'
                            ) +
                            (canEdit ? 
                                '<div class="absolute top-2 right-2 flex space-x-1">' +
                                    '<button onclick="event.stopPropagation(); openEditProductModal(' + product.id + ')" ' +
                                            'class="bg-blue-500 text-white p-1.5 rounded-full text-xs hover:bg-blue-600 shadow-lg" title="수정">' +
                                        '<i class="fas fa-edit"></i>' +
                                    '</button>' +
                                '</div>' : '') +
                        '</div>' +
                        '<div class="p-3 cursor-pointer" onclick="window.location.href=\\'/static/product.html?id=' + product.id + '\\'">' +
                            '<h3 class="font-medium text-sm mb-1 truncate">' + product.title + '</h3>' +
                            '<div class="text-sm font-bold text-orange-600 mb-1">' + product.price.toLocaleString() + '원</div>' +
                            '<div class="flex justify-between text-xs text-gray-500">' +
                                '<span>' + (product.location || '위치 미설정') + '</span>' +
                                '<span>조회 ' + product.view_count + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                }).join('');
            }
            
            // 카테고리 로드
            async function loadCategories() {
                try {
                    const response = await axios.get('/api/categories');
                    if (response.data.success) {
                        renderCategories(response.data.categories);
                    }
                } catch (error) {
                    console.error('카테고리 로드 실패:', error);
                }
            }
            
            // 카테고리 렌더링
            function renderCategories(categories) {
                const container = document.getElementById('categories');
                if (!container) return;
                
                container.innerHTML = categories.map(category => 
                    '<div class="category-card text-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">' +
                        '<div class="text-2xl mb-2">' + category.icon + '</div>' +
                        '<p class="text-xs font-medium text-gray-700">' + category.name + '</p>' +
                    '</div>'
                ).join('');
            }
            
            // 인증 상태 확인
            function checkAuthStatus() {
                const userData = localStorage.getItem('picoin_user');
                if (userData) {
                    const user = JSON.parse(userData);
                    // 관리자 버튼 표시
                    if (user.email === '5321497@naver.com') {
                        const adminBtn = document.getElementById('adminBtn');
                        if (adminBtn) adminBtn.classList.remove('hidden');
                    }
                }
            }

            // 게시판 자동 청소 (관리자 또는 주기적 실행)
            async function cleanupOldPosts() {
                try {
                    // 마지막 청소 시간 확인 (하루에 한 번만 실행)
                    const lastCleanup = localStorage.getItem('last_board_cleanup');
                    const now = new Date().getTime();
                    const oneDayMs = 24 * 60 * 60 * 1000; // 24시간

                    if (lastCleanup && (now - parseInt(lastCleanup)) < oneDayMs) {
                        return; // 24시간 이내에 이미 실행했으면 건너뛰기
                    }

                    const response = await axios.post('/api/posts/cleanup');
                    if (response.data.success) {
                        console.log('게시판 청소 완료:', response.data.message);
                        localStorage.setItem('last_board_cleanup', now.toString());
                    }
                } catch (error) {
                    console.error('게시판 청소 실패:', error);
                }
            }

            // ========================= 지역 관리 =========================
            
            // 지역 데이터 초기화
            async function initLocationData() {
                try {
                    const response = await axios.post('/api/locations/init');
                    if (response.data.success) {
                        console.log('지역 데이터 초기화:', response.data.message);
                    }
                } catch (error) {
                    console.error('지역 데이터 초기화 실패:', error);
                }
            }

            // 시/도 목록 로드
            async function loadCities() {
                try {
                    const response = await axios.get('/api/locations/cities');
                    if (response.data.success) {
                        const citySelects = document.querySelectorAll('#editCity, #newCity');
                        citySelects.forEach(select => {
                            select.innerHTML = '<option value="">시/도를 선택하세요</option>';
                            response.data.cities.forEach(city => {
                                select.innerHTML += '<option value="' + city.code + '">' + city.name + '</option>';
                            });
                        });
                    }
                } catch (error) {
                    console.error('시/도 로드 실패:', error);
                }
            }

            // 구/군 목록 로드
            async function loadDistricts(cityCode, targetSelectId) {
                try {
                    const response = await axios.get('/api/locations/districts/' + cityCode);
                    const districtSelect = document.getElementById(targetSelectId);
                    
                    if (districtSelect) {
                        districtSelect.innerHTML = '<option value="">구/군을 선택하세요</option>';
                        
                        if (response.data.success && response.data.districts.length > 0) {
                            response.data.districts.forEach(district => {
                                districtSelect.innerHTML += '<option value="' + district.code + '">' + district.name + '</option>';
                            });
                            districtSelect.disabled = false;
                        } else {
                            districtSelect.disabled = true;
                        }
                        
                        // 동 선택 초기화
                        const dongSelectId = targetSelectId.replace('District', 'Dong');
                        const dongSelect = document.getElementById(dongSelectId);
                        if (dongSelect) {
                            dongSelect.innerHTML = '<option value="">동을 선택하세요 (선택사항)</option>';
                            dongSelect.disabled = true;
                        }
                        
                        updateLocationString(targetSelectId.replace('District', ''));
                    }
                } catch (error) {
                    console.error('구/군 로드 실패:', error);
                }
            }

            // 동 목록 로드
            async function loadDongs(districtCode, targetSelectId) {
                try {
                    const response = await axios.get('/api/locations/dongs/' + districtCode);
                    const dongSelect = document.getElementById(targetSelectId);
                    
                    if (dongSelect) {
                        dongSelect.innerHTML = '<option value="">동을 선택하세요 (선택사항)</option>';
                        
                        if (response.data.success && response.data.dongs.length > 0) {
                            response.data.dongs.forEach(dong => {
                                dongSelect.innerHTML += '<option value="' + dong.code + '">' + dong.name + '</option>';
                            });
                            // 기타 옵션 추가
                            dongSelect.innerHTML += '<option value="etc">기타 (직접 입력)</option>';
                            dongSelect.disabled = false;
                        } else {
                            dongSelect.disabled = true;
                        }
                        
                        updateLocationString(targetSelectId.replace('Dong', ''));
                    }
                } catch (error) {
                    console.error('동 로드 실패:', error);
                }
            }

            // 최종 지역 문자열 업데이트
            function updateLocationString(prefix) {
                const citySelect = document.getElementById(prefix + 'City');
                const districtSelect = document.getElementById(prefix + 'District');
                const dongSelect = document.getElementById(prefix + 'Dong');
                const customLocationDiv = document.getElementById(prefix + 'CustomLocationDiv');
                const customLocationInput = document.getElementById(prefix + 'CustomLocation');
                const locationHidden = document.getElementById(prefix + 'Location');
                
                if (!citySelect || !districtSelect || !locationHidden) return;

                let locationParts = [];
                
                // 시/도
                if (citySelect.value) {
                    const cityName = citySelect.options[citySelect.selectedIndex].text;
                    locationParts.push(cityName);
                }
                
                // 구/군
                if (districtSelect.value && !districtSelect.disabled) {
                    const districtName = districtSelect.options[districtSelect.selectedIndex].text;
                    locationParts.push(districtName);
                }
                
                // 동
                if (dongSelect && dongSelect.value && !dongSelect.disabled) {
                    if (dongSelect.value === 'etc') {
                        // 기타 선택 시 입력 필드 표시
                        if (customLocationDiv) {
                            customLocationDiv.classList.remove('hidden');
                        }
                        if (customLocationInput && customLocationInput.value) {
                            locationParts.push(customLocationInput.value);
                        }
                    } else {
                        // 정상적인 동 선택
                        if (customLocationDiv) {
                            customLocationDiv.classList.add('hidden');
                        }
                        const dongName = dongSelect.options[dongSelect.selectedIndex].text;
                        locationParts.push(dongName);
                    }
                }
                
                locationHidden.value = locationParts.join(' ');
            }

            // 지역 선택 이벤트 리스너 설정
            function setupLocationListeners() {
                // 수정 모달 이벤트
                const editCity = document.getElementById('editCity');
                const editDistrict = document.getElementById('editDistrict');
                const editDong = document.getElementById('editDong');
                const editCustomLocation = document.getElementById('editCustomLocation');

                if (editCity) {
                    editCity.addEventListener('change', function() {
                        if (this.value) {
                            loadDistricts(this.value, 'editDistrict');
                        } else {
                            document.getElementById('editDistrict').disabled = true;
                            document.getElementById('editDong').disabled = true;
                            updateLocationString('edit');
                        }
                    });
                }

                if (editDistrict) {
                    editDistrict.addEventListener('change', function() {
                        if (this.value) {
                            loadDongs(this.value, 'editDong');
                        } else {
                            document.getElementById('editDong').disabled = true;
                            updateLocationString('edit');
                        }
                    });
                }

                if (editDong) {
                    editDong.addEventListener('change', function() {
                        updateLocationString('edit');
                    });
                }

                if (editCustomLocation) {
                    editCustomLocation.addEventListener('input', function() {
                        updateLocationString('edit');
                    });
                }

                // 필터 모달 이벤트
                const filterCity = document.getElementById('filterCity');
                const filterDistrict = document.getElementById('filterDistrict');
                const filterDong = document.getElementById('filterDong');
                const filterCustomLocation = document.getElementById('filterCustomLocation');

                if (filterCity) {
                    filterCity.addEventListener('change', function() {
                        if (this.value) {
                            loadDistricts(this.value, 'filterDistrict');
                        } else {
                            document.getElementById('filterDistrict').disabled = true;
                            document.getElementById('filterDong').disabled = true;
                            updateLocationString('filter');
                        }
                    });
                }

                if (filterDistrict) {
                    filterDistrict.addEventListener('change', function() {
                        if (this.value) {
                            loadDongs(this.value, 'filterDong');
                        } else {
                            document.getElementById('filterDong').disabled = true;
                            updateLocationString('filter');
                        }
                    });
                }

                if (filterDong) {
                    filterDong.addEventListener('change', function() {
                        updateLocationString('filter');
                    });
                }

                if (filterCustomLocation) {
                    filterCustomLocation.addEventListener('input', function() {
                        updateLocationString('filter');
                    });
                }
            }

            // 상품 수정 관련 함수들
            let currentEditingProductId = null;

            // 상품 수정 모달 열기
            window.openEditProductModal = async function(productId) {
                try {
                    const userData = localStorage.getItem('picoin_user');
                    if (!userData) {
                        alert('로그인이 필요한 서비스입니다.');
                        return;
                    }

                    const user = JSON.parse(userData);
                    currentEditingProductId = productId;

                    // 상품 정보 가져오기
                    const response = await axios.get('/api/products/' + productId);
                    if (response.data.success) {
                        const product = response.data.product;
                        
                        // 권한 확인 (작성자 또는 관리자)
                        const isOwner = product.seller_id === user.id;
                        const isAdmin = user.email === '5321497@naver.com';
                        
                        if (!isOwner && !isAdmin) {
                            alert('상품 수정 권한이 없습니다.');
                            return;
                        }

                        // 폼에 데이터 설정
                        document.getElementById('editProductId').value = productId;
                        document.getElementById('editTitle').value = product.title;
                        document.getElementById('editPrice').value = product.price;
                        document.getElementById('editCondition').value = product.condition_type;
                        document.getElementById('editLocation').value = product.location || '';
                        document.getElementById('editDescription').value = product.description || '';

                        // 현재 이미지 표시
                        if (product.images && product.images.length > 0) {
                            const currentImages = document.getElementById('currentImages');
                            const imageList = document.getElementById('currentImageList');
                            currentImages.classList.remove('hidden');
                            
                            imageList.innerHTML = product.images.map((img, index) => 
                                '<div class="relative">' +
                                    '<img src="' + img.image_url + '" alt="상품 이미지 ' + (index + 1) + '" class="w-full h-20 object-cover rounded">' +
                                    '<div class="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">' + (index + 1) + '</div>' +
                                '</div>'
                            ).join('');
                        }

                        // 모달 표시
                        const modal = document.getElementById('editProductModal');
                        modal.classList.remove('hidden');
                        modal.classList.add('flex');
                    }
                } catch (error) {
                    console.error('상품 정보 로드 실패:', error);
                    alert('상품 정보를 불러올 수 없습니다.');
                }
            };

            // 상품 수정 모달 닫기
            function closeEditProductModal() {
                const modal = document.getElementById('editProductModal');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                currentEditingProductId = null;
                
                // 폼 초기화
                document.getElementById('editProductForm').reset();
                const currentImages = document.getElementById('currentImages');
                currentImages.classList.add('hidden');
            }

            // 상품 수정 제출
            async function handleEditProductSubmit(e) {
                e.preventDefault();
                
                const userData = localStorage.getItem('picoin_user');
                if (!userData) {
                    alert('로그인이 필요합니다.');
                    return;
                }

                const user = JSON.parse(userData);
                const formData = new FormData(e.target);
                
                const data = {
                    userId: user.id,
                    title: formData.get('title'),
                    description: formData.get('description'),
                    price: parseInt(formData.get('price')),
                    piPrice: Math.round(parseInt(formData.get('price')) / 1000),
                    location: formData.get('location'),
                    condition: formData.get('condition')
                };

                try {
                    const response = await axios.put('/api/products/' + currentEditingProductId, data);
                    if (response.data.success) {
                        alert('상품 정보가 성공적으로 수정되었습니다.');
                        closeEditProductModal();
                        // 상품 목록 새로고침
                        loadProducts();
                    } else {
                        alert(response.data.error);
                    }
                } catch (error) {
                    console.error('상품 수정 실패:', error);
                    alert('상품 수정에 실패했습니다: ' + (error.response?.data?.error || error.message));
                }
            }

            // 이벤트 리스너 추가
            function addEditProductEvents() {
                const editForm = document.getElementById('editProductForm');
                const cancelBtn = document.getElementById('cancelEditProduct');
                const closeBtn = document.getElementById('closeEditProductModal');
                
                if (editForm) {
                    editForm.addEventListener('submit', handleEditProductSubmit);
                }
                
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', closeEditProductModal);
                }
                
                if (closeBtn) {
                    closeBtn.addEventListener('click', closeEditProductModal);
                }

                // 모달 외부 클릭 시 닫기
                const modal = document.getElementById('editProductModal');
                if (modal) {
                    modal.addEventListener('click', function(e) {
                        if (e.target.id === 'editProductModal') {
                            closeEditProductModal();
                        }
                    });
                }
            }
            
            // 초기화
            addButtonEvents();
            addEditProductEvents();
            loadProducts();
            loadCategories();
            checkAuthStatus();
        });
        </script>
    </body>
    </html>
  `)
})

// 전역 변수로 캐시 저장 - 10만명 동시 접속 대응
let piCoinPriceCache = {
  price: 0.5, // 기본값
  lastUpdated: 0,
  cacheExpiry: 1 * 60 * 1000 // 1분 캐시 - API 부하 경감 및 빠른 업데이트
}

// API 라우트들
// 파이코인 실시간 시세 조회 (CoinGecko API)
app.get('/api/pi-coin-price', async (c) => {
  try {
    const now = Date.now()
    
    // 캐시 확인 (1분 이내면 캐시된 가격 반환)
    if (piCoinPriceCache.lastUpdated && (now - piCoinPriceCache.lastUpdated < piCoinPriceCache.cacheExpiry)) {
      return c.json({ 
        success: true, 
        price: piCoinPriceCache.price,
        cached: true,
        lastUpdated: piCoinPriceCache.lastUpdated
      })
    }

    // CoinGecko API 호출
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=krw', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // 타임아웃 설정
        signal: AbortSignal.timeout(10000) // 10초 타임아웃
      })

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data && data['pi-network'] && data['pi-network'].krw) {
        // 성공적으로 데이터를 가져온 경우 캐시 업데이트
        piCoinPriceCache.price = data['pi-network'].krw
        piCoinPriceCache.lastUpdated = now
        
        return c.json({ 
          success: true, 
          price: piCoinPriceCache.price,
          cached: false,
          lastUpdated: piCoinPriceCache.lastUpdated
        })
      } else {
        throw new Error('Invalid CoinGecko API response format')
      }
    } catch (apiError) {
      console.error('CoinGecko API 호출 실패:', apiError)
      
      // API 호출 실패 시 캐시된 값 반환 (있는 경우)
      if (piCoinPriceCache.price > 0) {
        return c.json({ 
          success: true, 
          price: piCoinPriceCache.price,
          cached: true,
          fallback: true,
          lastUpdated: piCoinPriceCache.lastUpdated,
          error: 'API 호출 실패, 캐시된 가격 사용 중'
        })
      }
      
      // 캐시도 없는 경우 기본값 반환
      return c.json({ 
        success: true, 
        price: 0.5, // 기본 가격 (KRW)
        cached: false,
        fallback: true,
        error: 'API 호출 실패, 기본 가격 사용 중'
      })
    }
  } catch (error) {
    console.error('파이코인 시세 조회 오류:', error)
    return c.json({ 
      success: false, 
      error: error.message,
      price: 0.5 // 에러 시 기본값
    }, 500)
  }
})

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
    const location = c.req.query('location')
    const priceMin = c.req.query('priceMin')
    const priceMax = c.req.query('priceMax')
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

    if (location) {
      query += ` AND p.location LIKE ?`
      params.push(`%${location}%`)
    }

    if (priceMin) {
      query += ` AND p.price >= ?`
      params.push(parseInt(priceMin))
    }

    if (priceMax) {
      query += ` AND p.price <= ?`
      params.push(parseInt(priceMax))
    }

    // 상품 상태 필터링 (여러 개 선택 가능)
    const conditions = c.req.query('conditions')
    if (conditions) {
      const conditionArray = conditions.split(',').map(c => c.trim()).filter(c => c)
      if (conditionArray.length > 0) {
        const conditionPlaceholders = conditionArray.map(() => '?').join(',')
        query += ` AND p.condition_type IN (${conditionPlaceholders})`
        params.push(...conditionArray)
      }
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

    // 이미지 처리 - Base64로 인코딩하여 데이터베이스에 저장
    const imageUrls = []
    let imageOrder = 1
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        try {
          // 파일을 ArrayBuffer로 읽기
          const arrayBuffer = await value.arrayBuffer()
          // Base64로 인코딩
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
          // Data URL 형식으로 저장
          const imageUrl = `data:${value.type};base64,${base64}`
          imageUrls.push(imageUrl)
          
          // 상품 이미지 테이블에 저장
          await c.env.DB.prepare(`
            INSERT INTO product_images (product_id, image_url, image_order)
            VALUES (?, ?, ?)
          `).bind(productId, imageUrl, imageOrder).run()
          
          imageOrder++
        } catch (error) {
          console.error('이미지 처리 실패:', error)
          // 이미지 처리 실패 시에도 상품 등록은 계속 진행
        }
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
// 상품 삭제 (본인만 가능) - 이미지 포함 삭제
app.delete('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id')
    const { userId } = await c.req.json()

    // 상품 및 이미지 정보 조회
    const product = await c.env.DB.prepare(`
      SELECT p.seller_id, p.title, GROUP_CONCAT(pi.image_url) as images
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `).bind(productId).first()

    if (!product) {
      return c.json({ success: false, error: '상품을 찾을 수 없습니다.' }, 404)
    }

    if (product.seller_id !== parseInt(userId)) {
      return c.json({ success: false, error: '삭제 권한이 없습니다.' }, 403)
    }

    // 트랜잭션 시작 - 상품과 이미지 동시 삭제
    try {
      // 상품 이미지 삭제
      await c.env.DB.prepare(`
        DELETE FROM product_images WHERE product_id = ?
      `).bind(productId).run()

      // 상품 완전 삭제 (또는 상태 변경)
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

      // 관련 채팅방 정리
      await c.env.DB.prepare(`
        UPDATE chat_rooms SET status = 'closed' WHERE product_id = ?
      `).bind(productId).run()

      return c.json({ 
        success: true, 
        message: '상품이 삭제되었습니다. 오늘 새로운 상품을 등록할 수 있습니다.',
        deletedImages: product.images ? product.images.split(',').length : 0
      })
    } catch (dbError) {
      return c.json({ success: false, error: '삭제 처리 중 오류가 발생했습니다.' }, 500)
    }
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

// π-coin 구매 패키지 조회 (동적 가격 생성)
app.get('/api/pi-coin/packages', async (c) => {
  try {
    // 실시간 파이코인 가격 조회
    let piCoinPrice = 2.5 // 기본값 (CoinGecko API 실패 시)
    
    try {
      const now = Date.now()
      
      // 캐시 확인 (1분 이내면 캐시된 가격 사용)
      if (piCoinPriceCache.lastUpdated && (now - piCoinPriceCache.lastUpdated < piCoinPriceCache.cacheExpiry)) {
        piCoinPrice = piCoinPriceCache.price
      } else {
        // CoinGecko API 호출
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=krw', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data['pi-network'] && data['pi-network'].krw) {
            piCoinPrice = data['pi-network'].krw
            // 캐시 업데이트
            piCoinPriceCache.price = piCoinPrice
            piCoinPriceCache.lastUpdated = now
          }
        }
      }
    } catch (error) {
      console.error('CoinGecko API 오류:', error)
      // 기본값 사용
    }
    
    // 10% 마진 추가
    const marginPrice = piCoinPrice * 1.1
    
    // 새로운 패키지 구조 (10, 100, 1,000, 10,000 π-coin)
    const packages = [
      {
        id: 1,
        name: '스타터 패키지',
        amount: 10,
        price: Math.round(marginPrice * 10),
        bonus_amount: Math.round(10 * 0.001), // 0.1% 보너스
        is_popular: 0,
        sort_order: 1,
        description: '파이코인 거래를 시작해보세요'
      },
      {
        id: 2,
        name: '베이직 패키지',
        amount: 100,
        price: Math.round(marginPrice * 100),
        bonus_amount: Math.round(100 * 0.001), // 0.1% 보너스
        is_popular: 1,
        sort_order: 2,
        description: '가장 인기있는 패키지'
      },
      {
        id: 3,
        name: '프리미엄 패키지',
        amount: 1000,
        price: Math.round(marginPrice * 1000),
        bonus_amount: Math.round(1000 * 0.001), // 0.1% 보너스 (1 π-coin)
        is_popular: 0,
        sort_order: 3,
        description: '대량 거래를 원하시나요?'
      },
      {
        id: 4,
        name: '메가 패키지',
        amount: 10000,
        price: Math.round(marginPrice * 10000),
        bonus_amount: Math.round(10000 * 0.001), // 0.1% 보너스 (10 π-coin)
        is_popular: 1,
        sort_order: 4,
        description: '대규모 투자용 패키지'
      }
    ]
    
    return c.json({ 
      success: true, 
      packages: packages,
      piCoinPrice: piCoinPrice,
      marginPrice: marginPrice,
      lastUpdated: piCoinPriceCache.lastUpdated
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// π-coin 구매 요청
app.post('/api/pi-coin/purchase', async (c) => {
  try {
    const { userId, packageId, paymentMethod = 'card' } = await c.req.json()

    // 패키지 정보 조회
    const package_ = await c.env.DB.prepare(`
      SELECT * FROM pi_coin_packages WHERE id = ? AND is_active = 1
    `).bind(packageId).first()

    if (!package_) {
      return c.json({ success: false, error: '유효하지 않은 패키지입니다.' }, 400)
    }

    // PG사 설정 확인
    const { results: settingsResults } = await c.env.DB.prepare(`
      SELECT setting_key, setting_value FROM payment_settings WHERE is_active = 1
    `).all()
    
    const settings = {}
    settingsResults.forEach(item => {
      settings[item.setting_key] = item.setting_value
    })
    
    const pgEnabled = settings.pg_enabled === 'true'
    const testMode = settings.pg_test_mode === 'true'

    // PG사 연동이 활성화된 경우
    if (pgEnabled && !testMode) {
      // 실제 결제 처리 (PG사 API 호출)
      // 여기서는 데모용으로 항상 성공으로 처리
      // 실제 구현시에는 토스페이먼츠/카카오페이 API 호출 필요
      
      // 결제 승인 대기 상태로 구매 이력 생성
      const purchaseResult = await c.env.DB.prepare(`
        INSERT INTO pi_coin_purchases (user_id, amount, krw_amount, payment_method, payment_status)
        VALUES (?, ?, ?, ?, 'pending')
      `).bind(userId, package_.amount + package_.bonus_amount, package_.price, paymentMethod).run()
      
      return c.json({ 
        success: false, 
        error: '실제 PG사 결제는 준비중입니다. 테스트 모드를 활성화해주세요.',
        requiresPayment: true,
        purchaseId: purchaseResult.meta.last_row_id
      })
    } else {
      // 데모 모드 또는 PG사 비활성화: 즉시 π-coin 지급
      const purchaseResult = await c.env.DB.prepare(`
        INSERT INTO pi_coin_purchases (user_id, amount, krw_amount, payment_method, payment_status)
        VALUES (?, ?, ?, ?, 'completed')
      `).bind(userId, package_.amount + package_.bonus_amount, package_.price, paymentMethod).run()

      if (purchaseResult.success) {
        // 사용자 π-coin 잔액 업데이트
        const updateResult = await c.env.DB.prepare(`
          UPDATE users 
          SET pi_coin_balance = pi_coin_balance + ? 
          WHERE id = ?
        `).bind(package_.amount + package_.bonus_amount, userId).run()

        // 업데이트된 잔액 조회
        const updatedUser = await c.env.DB.prepare(`
          SELECT pi_coin_balance FROM users WHERE id = ?
        `).bind(userId).first()

        // 구매 완료 시점 업데이트
        await c.env.DB.prepare(`
          UPDATE pi_coin_purchases 
          SET completed_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(purchaseResult.meta.last_row_id).run()

        // 알림 생성
        await c.env.DB.prepare(`
          INSERT INTO notifications (user_id, type, title, message, data)
          VALUES (?, 'purchase', 'π-coin 충전 완료', ?, ?)
        `).bind(
          userId, 
          `${package_.amount + package_.bonus_amount} π-coin이 성공적으로 충전되었습니다.`,
          JSON.stringify({ amount: package_.amount + package_.bonus_amount, bonus: package_.bonus_amount, method: paymentMethod })
        ).run()

        return c.json({ 
          success: true, 
          message: `${package_.amount + package_.bonus_amount} π-coin이 충전되었습니다!`,
          totalCoins: package_.amount + package_.bonus_amount,
          bonus: package_.bonus_amount,
          newBalance: updatedUser?.pi_coin_balance || 0
        })
      } else {
        throw new Error('구매 처리에 실패했습니다.')
      }
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 사용자 π-coin 구매 이력 조회
app.get('/api/user/:userId/purchases', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, pkg.name as package_name
      FROM pi_coin_purchases p
      LEFT JOIN pi_coin_packages pkg ON p.amount = pkg.amount
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC
      LIMIT 50
    `).bind(userId).all()
    
    return c.json({ success: true, purchases: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 문의 채팅방 생성/조회
app.post('/api/admin/chat/room', async (c) => {
  try {
    const { userId } = await c.req.json()

    // 기존 활성 채팅방 확인
    let chatRoom = await c.env.DB.prepare(`
      SELECT * FROM admin_chat_rooms 
      WHERE user_id = ? AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1
    `).bind(userId).first()

    if (!chatRoom) {
      // 새 채팅방 생성
      const result = await c.env.DB.prepare(`
        INSERT INTO admin_chat_rooms (user_id, status)
        VALUES (?, 'active')
      `).bind(userId).run()

      if (result.success) {
        chatRoom = await c.env.DB.prepare(`
          SELECT * FROM admin_chat_rooms WHERE id = ?
        `).bind(result.meta.last_row_id).first()
      }
    }

    return c.json({ success: true, chatRoom })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 문의 메시지 전송
app.post('/api/admin/chat/message', async (c) => {
  try {
    const { roomId, senderId, message, isAdmin = false } = await c.req.json()

    // 채팅방 상태 확인
    const chatRoom = await c.env.DB.prepare(`
      SELECT * FROM admin_chat_rooms WHERE id = ? AND status = 'active'
    `).bind(roomId).first()

    if (!chatRoom) {
      return c.json({ success: false, error: '활성 상태의 채팅방을 찾을 수 없습니다.' }, 404)
    }

    // 메시지 저장 (3일 후 만료)
    const result = await c.env.DB.prepare(`
      INSERT INTO admin_chat_messages (room_id, sender_id, message, is_admin_message, expires_at)
      VALUES (?, ?, ?, ?, datetime('now', '+3 days'))
    `).bind(roomId, senderId, message, isAdmin ? 1 : 0).run()

    if (result.success) {
      // 채팅방 업데이트 시간 갱신
      await c.env.DB.prepare(`
        UPDATE admin_chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(roomId).run()

      // 상대방에게 알림 (관리자가 보낸 경우 사용자에게, 사용자가 보낸 경우 관리자에게)
      if (isAdmin) {
        await c.env.DB.prepare(`
          INSERT INTO notifications (user_id, type, title, message)
          VALUES (?, 'admin', '관리자 답변', '문의하신 내용에 대한 답변이 도착했습니다.')
        `).bind(chatRoom.user_id).run()
      }

      const savedMessage = await c.env.DB.prepare(`
        SELECT acm.*, u.full_name as sender_name
        FROM admin_chat_messages acm
        LEFT JOIN users u ON acm.sender_id = u.id
        WHERE acm.id = ?
      `).bind(result.meta.last_row_id).first()

      return c.json({ success: true, message: savedMessage })
    } else {
      throw new Error('메시지 저장에 실패했습니다.')
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 문의 메시지 목록 조회
app.get('/api/admin/chat/:roomId/messages', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    
    // 만료된 메시지 정리
    await c.env.DB.prepare(`
      DELETE FROM admin_chat_messages WHERE expires_at < datetime('now')
    `).run()

    const { results: messages } = await c.env.DB.prepare(`
      SELECT acm.*, u.full_name as sender_name, u.username as sender_username
      FROM admin_chat_messages acm
      LEFT JOIN users u ON acm.sender_id = u.id
      WHERE acm.room_id = ? AND acm.expires_at > datetime('now')
      ORDER BY acm.created_at ASC
    `).bind(roomId).all()

    return c.json({ success: true, messages })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 대시보드 - 통계 조회
app.get('/api/admin/dashboard/stats', async (c) => {
  try {
    // 사용자 수
    const userCount = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM users WHERE is_admin = 0`).first()
    
    // 상품 수
    const productCount = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM products WHERE status = 'active'`).first()
    
    // 오늘 가입자 수
    const todayUsers = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE date(created_at) = date('now') AND is_admin = 0
    `).first()
    
    // 오늘 등록 상품 수
    const todayProducts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM products 
      WHERE date(created_at) = date('now')
    `).first()
    
    // π-coin 총 판매액
    const totalSales = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(krw_amount), 0) as total 
      FROM pi_coin_purchases 
      WHERE payment_status = 'completed'
    `).first()
    
    // 미해결 신고 수
    const pendingReports = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM reports WHERE status = 'pending'
    `).first()

    return c.json({ 
      success: true, 
      stats: {
        totalUsers: userCount.count,
        totalProducts: productCount.count,
        todayUsers: todayUsers.count,
        todayProducts: todayProducts.count,
        totalSales: totalSales.total,
        pendingReports: pendingReports.count
      }
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 - 상품 검색 및 관리
app.get('/api/admin/products/search', async (c) => {
  try {
    const { query, date, email, username, phone } = c.req.query()
    
    let sql = `
      SELECT 
        p.*,
        u.email, u.username, u.full_name, u.phone,
        c.name as category_name,
        (SELECT COUNT(*) FROM reports WHERE target_type = 'product' AND target_id = p.id AND status = 'pending') as report_count
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    
    const params = []
    
    if (query) {
      sql += ` AND (p.title LIKE ? OR p.description LIKE ?)`
      params.push(`%${query}%`, `%${query}%`)
    }
    
    if (date) {
      sql += ` AND date(p.created_at) = ?`
      params.push(date)
    }
    
    if (email) {
      sql += ` AND u.email LIKE ?`
      params.push(`%${email}%`)
    }
    
    if (username) {
      sql += ` AND u.username LIKE ?`
      params.push(`%${username}%`)
    }
    
    if (phone) {
      sql += ` AND u.phone LIKE ?`
      params.push(`%${phone}%`)
    }
    
    sql += ` ORDER BY p.created_at DESC LIMIT 100`
    
    const { results } = await c.env.DB.prepare(sql).bind(...params).all()
    
    return c.json({ success: true, products: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 - 상품 숨기기/삭제 (이미지 포함)
app.post('/api/admin/products/:id/action', async (c) => {
  try {
    const productId = c.req.param('id')
    const { action, reason, adminId } = await c.req.json()

    // 관리자 권한 확인
    const admin = await c.env.DB.prepare(`
      SELECT is_admin FROM users WHERE id = ? AND is_admin = 1
    `).bind(adminId).first()

    if (!admin) {
      return c.json({ success: false, error: '관리자 권한이 없습니다.' }, 403)
    }

    // 상품 및 이미지 정보 조회
    const product = await c.env.DB.prepare(`
      SELECT p.*, GROUP_CONCAT(pi.image_url) as images, u.full_name as seller_name
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ?
      GROUP BY p.id
    `).bind(productId).first()

    if (!product) {
      return c.json({ success: false, error: '상품을 찾을 수 없습니다.' }, 404)
    }

    if (action === 'hide') {
      // 숨기기: 상태만 변경
      await c.env.DB.prepare(`
        UPDATE products SET status = 'hidden' WHERE id = ?
      `).bind(productId).run()
      
      // 채팅방 비활성화
      await c.env.DB.prepare(`
        UPDATE chat_rooms SET status = 'closed' WHERE product_id = ?
      `).bind(productId).run()
      
    } else if (action === 'delete') {
      // 완전 삭제: 이미지와 함께 삭제
      await c.env.DB.prepare(`
        DELETE FROM product_images WHERE product_id = ?
      `).bind(productId).run()
      
      await c.env.DB.prepare(`
        UPDATE products SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(productId).run()
      
      // 관련 채팅방 정리
      await c.env.DB.prepare(`
        UPDATE chat_rooms SET status = 'closed' WHERE product_id = ?
      `).bind(productId).run()
      
      // 일일 게시물 카운트 감소
      const today = new Date().toISOString().split('T')[0]
      await c.env.DB.prepare(`
        UPDATE daily_post_count 
        SET post_count = MAX(0, post_count - 1)
        WHERE user_id = ? AND post_date = ?
      `).bind(product.seller_id, today).run()
    }

    // 관리자 액션 로그
    await c.env.DB.prepare(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason, details)
      VALUES (?, ?, 'product', ?, ?, ?)
    `).bind(
      adminId, 
      action === 'hide' ? 'hide_product' : 'delete_product', 
      productId, 
      reason,
      JSON.stringify({
        product_title: product.title,
        seller_name: product.seller_name,
        images_count: product.images ? product.images.split(',').length : 0
      })
    ).run()

    return c.json({ 
      success: true, 
      message: `상품이 ${action === 'hide' ? '숨김 처리' : '삭제'}되었습니다.`,
      action: action,
      productTitle: product.title,
      deletedImages: action === 'delete' && product.images ? product.images.split(',').length : 0
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 거래 완료 처리
app.post('/api/products/:id/complete', async (c) => {
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
      return c.json({ success: false, error: '권한이 없습니다.' }, 403)
    }

    // 거래 완료 처리 (1달 후 자동 삭제)
    await c.env.DB.prepare(`
      UPDATE products 
      SET status = 'sold', 
          completed_at = CURRENT_TIMESTAMP,
          auto_delete_at = datetime('now', '+1 month')
      WHERE id = ?
    `).bind(productId).run()

    return c.json({ 
      success: true, 
      message: '거래가 완료되었습니다. 상품은 1달 후 자동으로 삭제됩니다.' 
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 만료된 데이터 정리 (크론 작업용) - 이미지 포함 삭제
app.post('/api/cleanup/expired', async (c) => {
  try {
    // 3일 지난 채팅 메시지 삭제
    const chatCleanup = await c.env.DB.prepare(`
      DELETE FROM chat_messages WHERE expires_at < datetime('now')
    `).run()

    // 3일 지난 관리자 채팅 메시지 삭제
    const adminChatCleanup = await c.env.DB.prepare(`
      DELETE FROM admin_chat_messages WHERE expires_at < datetime('now')
    `).run()

    // 1달 지난 거래 완료 상품 삭제 (이미지 포함)
    // 먼저 삭제될 상품들의 이미지 정보 조회
    const { results: expiredProducts } = await c.env.DB.prepare(`
      SELECT p.id, p.title, COUNT(pi.id) as image_count
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id  
      WHERE p.auto_delete_at < datetime('now') AND p.status = 'sold'
      GROUP BY p.id
    `).all()

    let totalDeletedImages = 0
    
    // 각 상품의 이미지 먼저 삭제
    for (const product of expiredProducts) {
      await c.env.DB.prepare(`
        DELETE FROM product_images WHERE product_id = ?
      `).bind(product.id).run()
      
      totalDeletedImages += product.image_count
    }

    // 상품 삭제
    const productCleanup = await c.env.DB.prepare(`
      UPDATE products 
      SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP
      WHERE auto_delete_at < datetime('now') AND status = 'sold'
    `).run()

    return c.json({ 
      success: true, 
      message: '만료된 데이터 정리 완료',
      cleaned: {
        chatMessages: chatCleanup.meta?.changes || 0,
        adminChatMessages: adminChatCleanup.meta?.changes || 0,
        expiredProducts: productCleanup.meta?.changes || 0,
        deletedImages: totalDeletedImages
      }
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 - 수동 이미지 정리 및 30일 지난 상품 정리
app.post('/api/admin/cleanup-old-products', async (c) => {
  try {
    const { adminId } = await c.req.json()
    
    // 관리자 권한 확인
    const admin = await c.env.DB.prepare(`
      SELECT is_admin FROM users WHERE id = ? AND is_admin = 1
    `).bind(adminId).first()

    if (!admin) {
      return c.json({ success: false, error: '관리자 권한이 없습니다.' }, 403)
    }

    // 30일 지난 상품들과 이미지 정보 조회
    const { results: oldProducts } = await c.env.DB.prepare(`
      SELECT p.id, p.title, p.seller_id, COUNT(pi.id) as image_count, u.full_name as seller_name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.created_at < datetime('now', '-30 days') AND p.status IN ('active', 'reserved')
      GROUP BY p.id
    `).all()

    let totalDeletedImages = 0
    
    // 각 상품의 이미지 먼저 삭제
    for (const product of oldProducts) {
      await c.env.DB.prepare(`
        DELETE FROM product_images WHERE product_id = ?
      `).bind(product.id).run()
      
      totalDeletedImages += product.image_count
    }

    // 상품들 삭제 처리
    const productCleanup = await c.env.DB.prepare(`
      UPDATE products 
      SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP
      WHERE created_at < datetime('now', '-30 days') AND status IN ('active', 'reserved')
    `).run()

    // 관련 채팅방 정리
    await c.env.DB.prepare(`
      UPDATE chat_rooms SET status = 'closed' 
      WHERE product_id IN (SELECT id FROM products WHERE status = 'deleted')
    `).run()

    // 관리자 액션 로그
    await c.env.DB.prepare(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason, details)
      VALUES (?, 'bulk_cleanup', 'products', 0, '30일 지난 상품 일괄 정리', ?)
    `).bind(
      adminId,
      JSON.stringify({
        cleaned_products: productCleanup.meta?.changes || 0,
        deleted_images: totalDeletedImages,
        products: oldProducts.map(p => ({ id: p.id, title: p.title, seller: p.seller_name }))
      })
    ).run()

    return c.json({ 
      success: true, 
      message: `${productCleanup.meta?.changes || 0}개의 오래된 상품과 ${totalDeletedImages}개의 이미지가 정리되었습니다.`,
      cleaned: {
        products: productCleanup.meta?.changes || 0,
        images: totalDeletedImages
      },
      productList: oldProducts
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 - 자동 cleanup 실행 (30일 경과 상품)
app.get('/api/admin/auto-cleanup', async (c) => {
  try {
    // 30일 지난 상품 수 조회
    const { results } = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM((SELECT COUNT(*) FROM product_images WHERE product_id = p.id)), 0) as total_images
      FROM products p
      WHERE p.created_at < datetime('now', '-30 days') AND p.status IN ('active', 'reserved')
    `).all()

    const stats = results[0] || { total_count: 0, total_images: 0 }

    return c.json({ 
      success: true, 
      pendingCleanup: {
        products: stats.total_count,
        images: stats.total_images
      },
      message: `정리 대상: ${stats.total_count}개 상품, ${stats.total_images}개 이미지`
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// PG사 설정 조회 (결제 시 확인용)
app.get('/api/admin/payment-config', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT setting_key, setting_value 
      FROM payment_settings 
      WHERE is_active = 1
    `).all()
    
    const config = {}
    results.forEach(item => {
      config[item.setting_key] = item.setting_value
    })
    
    // 보안상 시크릿 키는 마스킹
    if (config.toss_secret_key) {
      config.toss_secret_key = '*'.repeat(config.toss_secret_key.length)
    }
    if (config.kakao_secret_key) {
      config.kakao_secret_key = '*'.repeat(config.kakao_secret_key.length)
    }
    
    return c.json({ 
      success: true, 
      pgEnabled: config.pg_enabled === 'true',
      testMode: config.pg_test_mode === 'true',
      availableMethods: (config.payment_methods || '').split(','),
      config: config
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// PG사 설정 업데이트 (관리자 전용)
app.put('/api/admin/payment-settings', async (c) => {
  try {
    const { adminId, settings } = await c.req.json()
    
    // 관리자 권한 확인
    const admin = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ? AND (username LIKE '%admin%' OR email LIKE '%admin%')
    `).bind(adminId).first()
    
    if (!admin) {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }
    
    // 설정 업데이트
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return c.env.DB.prepare(`
        UPDATE payment_settings 
        SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = ?
      `).bind(String(value), key).run()
    })
    
    await Promise.all(updatePromises)
    
    // 변경 로그 기록
    await c.env.DB.prepare(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES (?, 'update', 'payment_settings', 0, ?)
    `).bind(adminId, JSON.stringify(settings)).run()
    
    return c.json({ success: true, message: 'PG사 설정이 업데이트되었습니다.' })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// PG사 설정 페이지 조회 (관리자 전용)
app.get('/api/admin/payment-settings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM payment_settings 
      WHERE is_active = 1 
      ORDER BY setting_key ASC
    `).all()
    
    return c.json({ success: true, settings: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 삭제 (소유자만)
app.delete('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id')
    const { userId } = await c.req.json()

    // 상품 소유자 확인
    const { results } = await c.env.DB.prepare(`
      SELECT seller_id FROM products WHERE id = ? AND status = 'active'
    `).bind(productId).all()

    if (results.length === 0) {
      return c.json({ success: false, error: '상품을 찾을 수 없습니다.' }, 404)
    }

    const product = results[0]
    if (product.seller_id !== userId) {
      return c.json({ success: false, error: '본인의 상품만 삭제할 수 있습니다.' }, 403)
    }

    // 상품 상태를 삭제로 변경 (soft delete)
    const result = await c.env.DB.prepare(`
      UPDATE products 
      SET status = 'deleted', deleted_at = datetime('now') 
      WHERE id = ?
    `).bind(productId).run()

    if (result.success) {
      return c.json({ success: true, message: '상품이 삭제되었습니다.' })
    } else {
      return c.json({ success: false, error: '상품 삭제에 실패했습니다.' }, 500)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 수정 (소유자만)
app.put('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id')
    const { userId, title, description, price, piPrice, location, condition } = await c.req.json()

    // 사용자 정보 및 상품 소유자 확인
    const userResult = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(userId).first()

    if (!userResult) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 401)
    }

    const { results } = await c.env.DB.prepare(`
      SELECT seller_id FROM products WHERE id = ? AND status = 'active'
    `).bind(productId).all()

    if (results.length === 0) {
      return c.json({ success: false, error: '상품을 찾을 수 없습니다.' }, 404)
    }

    const product = results[0]
    const isAdmin = userResult.email === '5321497@naver.com'
    
    // 상품 소유자이거나 관리자인지 확인
    if (product.seller_id !== userId && !isAdmin) {
      return c.json({ success: false, error: '상품 수정 권한이 없습니다. (작성자 또는 관리자만 가능)' }, 403)
    }

    // 상품 정보 업데이트
    const result = await c.env.DB.prepare(`
      UPDATE products 
      SET title = ?, description = ?, price = ?, pi_coin_price = ?, 
          location = ?, condition_type = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(title, description, price, piPrice, location, condition, productId).run()

    if (result.success) {
      return c.json({ success: true, message: '상품 정보가 수정되었습니다.' })
    } else {
      return c.json({ success: false, error: '상품 수정에 실패했습니다.' }, 500)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 상품 상세 조회 (소유자 정보 포함)
app.get('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id')

    const { results } = await c.env.DB.prepare(`
      SELECT 
        p.*,
        u.username as seller_username,
        u.full_name as seller_name,
        c.name as category_name,
        c.icon as category_icon
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = 'active'
    `).bind(productId).all()

    if (results.length === 0) {
      return c.json({ success: false, error: '상품을 찾을 수 없습니다.' }, 404)
    }

    // 이미지 조회
    const { results: images } = await c.env.DB.prepare(`
      SELECT image_url, image_order FROM product_images 
      WHERE product_id = ? ORDER BY image_order ASC
    `).bind(productId).all()

    const product = results[0]
    product.images = images

    // 조회수 증가
    await c.env.DB.prepare(`
      UPDATE products SET view_count = view_count + 1 WHERE id = ?
    `).bind(productId).run()

    return c.json({ success: true, product })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 전용 API들
// 관리자 상품 검색
app.get('/api/admin/products/search', async (c) => {
  try {
    const query = c.req.query('query') || ''
    const date = c.req.query('date') || ''
    const email = c.req.query('email') || ''
    const username = c.req.query('username') || ''

    let sql = `
      SELECT 
        p.*,
        u.username,
        u.full_name,
        u.email,
        c.name as category_name,
        c.icon as category_icon,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY image_order ASC LIMIT 1) as first_image,
        0 as report_count
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `

    const params = []

    if (query) {
      sql += ` AND (p.title LIKE ? OR p.description LIKE ?)`
      params.push(`%${query}%`, `%${query}%`)
    }

    if (email) {
      sql += ` AND u.email LIKE ?`
      params.push(`%${email}%`)
    }

    if (username) {
      sql += ` AND u.username LIKE ?`
      params.push(`%${username}%`)
    }

    if (date) {
      sql += ` AND DATE(p.created_at) = ?`
      params.push(date)
    }

    sql += ` ORDER BY p.created_at DESC LIMIT 100`

    const { results } = await c.env.DB.prepare(sql).bind(...params).all()
    
    return c.json({ success: true, products: results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 상품 액션 (숨기기/삭제)
app.post('/api/admin/products/:id/action', async (c) => {
  try {
    const productId = c.req.param('id')
    const { action, reason, adminId } = await c.req.json()

    // 관리자 권한 확인
    const admin = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(adminId).first()

    if (!admin || admin.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 없습니다.' }, 403)
    }

    let result
    if (action === 'hide') {
      // 상품 숨기기 (status를 hidden으로 변경)
      result = await c.env.DB.prepare(`
        UPDATE products 
        SET status = 'hidden', updated_at = datetime('now')
        WHERE id = ?
      `).bind(productId).run()
    } else if (action === 'delete') {
      // 상품 삭제 (status를 deleted로 변경)
      result = await c.env.DB.prepare(`
        UPDATE products 
        SET status = 'deleted', deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).bind(productId).run()
    }

    if (result.success) {
      // 관리자 액션 로그 기록 (admin_actions 테이블이 있다면)
      try {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO admin_actions 
          (admin_id, target_type, target_id, action_type, reason, created_at)
          VALUES (?, 'product', ?, ?, ?, datetime('now'))
        `).bind(adminId, productId, action, reason).run()
      } catch (logError) {
        console.log('관리자 액션 로그 기록 실패:', logError.message)
      }

      const actionText = action === 'hide' ? '숨겨졌습니다' : '삭제되었습니다'
      return c.json({ 
        success: true, 
        message: `상품이 ${actionText}.` 
      })
    } else {
      return c.json({ success: false, error: '작업 처리에 실패했습니다.' }, 500)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 관리자 대시보드 통계
app.get('/api/admin/dashboard/stats', async (c) => {
  try {
    // 전체 사용자 수
    const { total_users } = await c.env.DB.prepare(`
      SELECT COUNT(*) as total_users FROM users
    `).first()

    // 전체 상품 수 (활성 상태만)
    const { total_products } = await c.env.DB.prepare(`
      SELECT COUNT(*) as total_products FROM products WHERE status = 'active'
    `).first()

    // 총 매출 (π-coin 기준)
    const { total_sales } = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_sales FROM pi_coin_purchases WHERE status = 'completed'
    `).first()

    // 보류 중인 신고 수
    const pending_reports = 0 // 신고 시스템이 구현되면 실제 쿼리로 변경

    const stats = {
      totalUsers: total_users || 0,
      totalProducts: total_products || 0,
      totalSales: (total_sales || 0) * 1000, // π-coin을 원화로 환산
      pendingReports: pending_reports,
      userGrowth: 12.5,
      productGrowth: 8.3,
      salesGrowth: 25.7,
      reportGrowth: -15.2
    }

    return c.json({ success: true, stats })
  } catch (error) {
    console.error('대시보드 통계 조회 실패:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 1개월 경과 상품 자동 삭제 (이미지 포함)
app.post('/api/admin/cleanup-old-products', async (c) => {
  try {
    const { adminId } = await c.req.json()

    // 관리자 권한 확인
    const admin = await c.env.DB.prepare(`
      SELECT is_admin FROM users WHERE id = ? AND is_admin = 1
    `).bind(adminId).first()

    if (!admin) {
      return c.json({ success: false, error: '관리자 권한이 없습니다.' }, 403)
    }

    // 1개월 경과한 상품 조회 (이미지 정보 포함)
    const { results: oldProducts } = await c.env.DB.prepare(`
      SELECT 
        p.id,
        p.title,
        p.seller_id,
        GROUP_CONCAT(pi.image_url) as images,
        COUNT(pi.id) as image_count
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.created_at <= datetime('now', '-30 days') 
      AND p.status != 'deleted'
      GROUP BY p.id
    `).all()

    if (oldProducts.length === 0) {
      return c.json({ 
        success: true, 
        message: '삭제할 1개월 경과 상품이 없습니다.',
        deletedCount: 0
      })
    }

    let deletedCount = 0
    let deletedImageCount = 0

    // 각 상품별로 이미지와 함께 삭제
    for (const product of oldProducts) {
      try {
        // 상품 이미지 삭제
        await c.env.DB.prepare(`
          DELETE FROM product_images WHERE product_id = ?
        `).bind(product.id).run()

        // 상품 삭제
        await c.env.DB.prepare(`
          UPDATE products 
          SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(product.id).run()

        // 관련 채팅방 정리
        await c.env.DB.prepare(`
          UPDATE chat_rooms SET status = 'closed' WHERE product_id = ?
        `).bind(product.id).run()

        deletedCount++
        deletedImageCount += product.image_count || 0

        // 관리자 액션 로그
        await c.env.DB.prepare(`
          INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason, details)
          VALUES (?, 'auto_delete_product', 'product', ?, '1개월 경과 자동 삭제', ?)
        `).bind(
          adminId,
          product.id,
          JSON.stringify({
            product_title: product.title,
            images_deleted: product.image_count || 0,
            auto_cleanup: true
          })
        ).run()

      } catch (productError) {
        console.error(`상품 ${product.id} 삭제 실패:`, productError)
      }
    }

    return c.json({ 
      success: true, 
      message: `1개월 경과 상품 ${deletedCount}개와 관련 이미지 ${deletedImageCount}개를 삭제했습니다.`,
      deletedCount: deletedCount,
      deletedImageCount: deletedImageCount
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 자동 정리 스케줄러 (주기적 실행용)
app.get('/api/admin/auto-cleanup', async (c) => {
  try {
    // 1개월 경과한 상품들 자동 정리
    const { results: oldProducts } = await c.env.DB.prepare(`
      SELECT 
        p.id,
        p.title,
        COUNT(pi.id) as image_count
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.created_at <= datetime('now', '-30 days') 
      AND p.status IN ('active', 'sold', 'reserved')
      GROUP BY p.id
      LIMIT 50
    `).all()

    if (oldProducts.length === 0) {
      return c.json({ 
        success: true, 
        message: '자동 정리할 상품이 없습니다.',
        cleanedCount: 0
      })
    }

    let cleanedCount = 0
    let cleanedImageCount = 0

    for (const product of oldProducts) {
      // 이미지 삭제
      await c.env.DB.prepare(`
        DELETE FROM product_images WHERE product_id = ?
      `).bind(product.id).run()

      // 상품 상태 변경
      await c.env.DB.prepare(`
        UPDATE products 
        SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, auto_delete_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(product.id).run()

      // 채팅방 정리
      await c.env.DB.prepare(`
        UPDATE chat_rooms SET status = 'closed' WHERE product_id = ?
      `).bind(product.id).run()

      cleanedCount++
      cleanedImageCount += product.image_count || 0
    }

    return c.json({ 
      success: true, 
      message: `자동 정리 완료: 상품 ${cleanedCount}개, 이미지 ${cleanedImageCount}개`,
      cleanedCount: cleanedCount,
      cleanedImageCount: cleanedImageCount
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 목록 조회
app.get('/api/notices', async (c) => {
  try {
    // 테이블이 없으면 생성
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        author_id INTEGER NOT NULL,
        is_pinned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    const { results } = await c.env.DB.prepare(`
      SELECT n.*, u.username as author_name, u.full_name as author_full_name
      FROM notices n
      LEFT JOIN users u ON n.author_id = u.id
      ORDER BY n.is_pinned DESC, n.created_at DESC
    `).all()

    return c.json({ success: true, notices: results || [] })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 상세 조회
app.get('/api/notices/:id', async (c) => {
  try {
    const noticeId = c.req.param('id')
    
    const notice = await c.env.DB.prepare(`
      SELECT n.*, u.username as author_name, u.full_name as author_full_name
      FROM notices n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `).bind(noticeId).first()

    if (!notice) {
      return c.json({ success: false, error: '공지사항을 찾을 수 없습니다.' }, 404)
    }

    return c.json({ success: true, notice })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 생성 (관리자만)
app.post('/api/notices', async (c) => {
  try {
    const { userId, title, content, imageUrl, isPinned } = await c.req.json()

    // 관리자 권한 확인
    const user = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user || user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }

    // 테이블이 없으면 생성
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        author_id INTEGER NOT NULL,
        is_pinned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    const result = await c.env.DB.prepare(`
      INSERT INTO notices (title, content, image_url, author_id, is_pinned)
      VALUES (?, ?, ?, ?, ?)
    `).bind(title, content, imageUrl || null, userId, isPinned ? 1 : 0).run()

    return c.json({ 
      success: true, 
      message: '공지사항이 등록되었습니다.',
      noticeId: result.meta.last_row_id 
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 수정 (관리자만)
app.put('/api/notices/:id', async (c) => {
  try {
    const noticeId = c.req.param('id')
    const { userId, title, content, imageUrl, isPinned } = await c.req.json()

    // 관리자 권한 확인
    const user = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user || user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }

    const result = await c.env.DB.prepare(`
      UPDATE notices 
      SET title = ?, content = ?, image_url = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, content, imageUrl || null, isPinned ? 1 : 0, noticeId).run()

    if (result.success) {
      return c.json({ success: true, message: '공지사항이 수정되었습니다.' })
    } else {
      return c.json({ success: false, error: '공지사항 수정에 실패했습니다.' }, 500)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 삭제 (관리자만)
app.delete('/api/notices/:id', async (c) => {
  try {
    const noticeId = c.req.param('id')
    
    // 헤더에서 사용자 ID 가져오기 (프론트엔드에서 전달)
    const userId = c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({ success: false, error: '인증이 필요합니다.' }, 401)
    }

    // 관리자 권한 확인
    const user = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user || user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }

    const result = await c.env.DB.prepare(`
      DELETE FROM notices WHERE id = ?
    `).bind(noticeId).run()

    if (result.success) {
      return c.json({ success: true, message: '공지사항이 삭제되었습니다.' })
    } else {
      return c.json({ success: false, error: '공지사항 삭제에 실패했습니다.' }, 500)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ========================= 게시판 API =========================

// 게시판 목록 조회
app.get('/api/posts', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const category = c.req.query('category')
    const search = c.req.query('search')
    const offset = (page - 1) * limit

    // 게시판 테이블이 없으면 생성
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS board_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        author_id INTEGER NOT NULL,
        author_name TEXT NOT NULL,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        is_hot INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `).run()

    // 검색 조건 구성
    let whereClause = 'WHERE 1=1'
    const params = []

    if (category && category !== 'all') {
      if (category === 'hot') {
        whereClause += ' AND (is_hot = 1 OR like_count >= 10 OR comment_count >= 5)'
      } else {
        whereClause += ' AND category = ?'
        params.push(category)
      }
    }

    if (search) {
      whereClause += ' AND (title LIKE ? OR content LIKE ? OR author_name LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    // 총 게시글 수 조회
    const countQuery = `SELECT COUNT(*) as total FROM board_posts ${whereClause}`
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first()
    const total = countResult?.total || 0

    // 게시글 목록 조회
    const query = `
      SELECT p.*, u.full_name as author_full_name
      FROM board_posts p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.is_hot DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `
    params.push(limit, offset)

    const { results } = await c.env.DB.prepare(query).bind(...params).all()

    // 오늘 작성된 게시글 수 조회
    const todayQuery = `
      SELECT COUNT(*) as today_count 
      FROM board_posts 
      WHERE date(created_at) = date('now')
    `
    const todayResult = await c.env.DB.prepare(todayQuery).first()
    const todayCount = todayResult?.today_count || 0

    return c.json({
      success: true,
      posts: results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total,
        today: todayCount
      }
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 게시글 상세 조회
app.get('/api/posts/:id', async (c) => {
  try {
    const postId = c.req.param('id')

    // 조회수 증가
    await c.env.DB.prepare(`
      UPDATE board_posts SET view_count = view_count + 1 WHERE id = ?
    `).bind(postId).run()

    // 게시글 조회
    const post = await c.env.DB.prepare(`
      SELECT p.*, u.full_name as author_full_name, u.email as author_email
      FROM board_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).bind(postId).first()

    if (!post) {
      return c.json({ success: false, error: '게시글을 찾을 수 없습니다.' }, 404)
    }

    // 댓글 조회 (향후 구현)
    // const comments = await getComments(postId)

    return c.json({
      success: true,
      post: {
        ...post,
        // comments: comments || []
      }
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 게시글 작성
app.post('/api/posts', async (c) => {
  try {
    const { userId, title, content, category, imageUrl } = await c.req.json()

    if (!userId || !title || !content || !category) {
      return c.json({ success: false, error: '필수 필드가 누락되었습니다.' }, 400)
    }

    // 사용자 정보 조회
    const user = await c.env.DB.prepare(`
      SELECT id, username, full_name FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 404)
    }

    // 게시판 테이블이 없으면 생성
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS board_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        author_id INTEGER NOT NULL,
        author_name TEXT NOT NULL,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        is_hot INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `).run()

    // 게시글 생성
    const result = await c.env.DB.prepare(`
      INSERT INTO board_posts (title, content, category, image_url, author_id, author_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(title, content, category, imageUrl || null, userId, user.username).run()

    return c.json({
      success: true,
      message: '게시글이 작성되었습니다.',
      postId: result.meta.last_row_id
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 게시글 수정
app.put('/api/posts/:id', async (c) => {
  try {
    const postId = c.req.param('id')
    const { userId, title, content, category, imageUrl } = await c.req.json()

    if (!userId || !title || !content || !category) {
      return c.json({ success: false, error: '필수 필드가 누락되었습니다.' }, 400)
    }

    // 게시글 조회 및 권한 확인
    const post = await c.env.DB.prepare(`
      SELECT author_id FROM board_posts WHERE id = ?
    `).bind(postId).first()

    if (!post) {
      return c.json({ success: false, error: '게시글을 찾을 수 없습니다.' }, 404)
    }

    // 사용자 정보 조회 (관리자 권한 확인)
    const user = await c.env.DB.prepare(`
      SELECT id, email FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 404)
    }

    // 권한 확인 (작성자 또는 관리자)
    const isOwner = post.author_id === parseInt(userId)
    const isAdmin = user.email === '5321497@naver.com'

    if (!isOwner && !isAdmin) {
      return c.json({ success: false, error: '게시글을 수정할 권한이 없습니다.' }, 403)
    }

    // 게시글 수정
    const result = await c.env.DB.prepare(`
      UPDATE board_posts 
      SET title = ?, content = ?, category = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, content, category, imageUrl || null, postId).run()

    if (result.success) {
      return c.json({ success: true, message: '게시글이 수정되었습니다.' })
    } else {
      return c.json({ success: false, error: '게시글 수정에 실패했습니다.' }, 500)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 게시글 삭제
app.delete('/api/posts/:id', async (c) => {
  try {
    const postId = c.req.param('id')
    
    // 헤더에서 사용자 ID 가져오기
    const userId = c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({ success: false, error: '인증이 필요합니다.' }, 401)
    }

    // 게시글 조회 및 권한 확인
    const post = await c.env.DB.prepare(`
      SELECT author_id FROM board_posts WHERE id = ?
    `).bind(postId).first()

    if (!post) {
      return c.json({ success: false, error: '게시글을 찾을 수 없습니다.' }, 404)
    }

    // 사용자 정보 조회 (관리자 권한 확인)
    const user = await c.env.DB.prepare(`
      SELECT id, email FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 404)
    }

    // 권한 확인 (작성자 또는 관리자)
    const isOwner = post.author_id === parseInt(userId)
    const isAdmin = user.email === '5321497@naver.com'

    if (!isOwner && !isAdmin) {
      return c.json({ success: false, error: '게시글을 삭제할 권한이 없습니다.' }, 403)
    }

    // 게시글 삭제
    const result = await c.env.DB.prepare(`
      DELETE FROM board_posts WHERE id = ?
    `).bind(postId).run()

    if (result.success) {
      return c.json({ success: true, message: '게시글이 삭제되었습니다.' })
    } else {
      return c.json({ success: false, error: '게시글 삭제에 실패했습니다.' }, 500)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 게시글 좋아요/좋아요 취소
app.post('/api/posts/:id/like', async (c) => {
  try {
    const postId = c.req.param('id')
    const { userId } = await c.req.json()

    if (!userId) {
      return c.json({ success: false, error: '로그인이 필요합니다.' }, 401)
    }

    // 좋아요 테이블이 없으면 생성
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES board_posts (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `).run()

    // 기존 좋아요 확인
    const existingLike = await c.env.DB.prepare(`
      SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?
    `).bind(postId, userId).first()

    if (existingLike) {
      // 좋아요 취소
      await c.env.DB.prepare(`
        DELETE FROM post_likes WHERE post_id = ? AND user_id = ?
      `).bind(postId, userId).run()

      await c.env.DB.prepare(`
        UPDATE board_posts SET like_count = like_count - 1 WHERE id = ?
      `).bind(postId).run()

      return c.json({ success: true, message: '좋아요를 취소했습니다.', liked: false })
    } else {
      // 좋아요 추가
      await c.env.DB.prepare(`
        INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)
      `).bind(postId, userId).run()

      await c.env.DB.prepare(`
        UPDATE board_posts SET like_count = like_count + 1 WHERE id = ?
      `).bind(postId).run()

      // 인기글 상태 확인 (좋아요 10개 이상 시 인기글)
      await c.env.DB.prepare(`
        UPDATE board_posts SET is_hot = 1 WHERE id = ? AND like_count >= 10
      `).bind(postId).run()

      return c.json({ success: true, message: '좋아요를 추가했습니다.', liked: true })
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 30일 경과 게시글 자동 삭제 (내부 호출용)
app.post('/api/posts/cleanup', async (c) => {
  try {
    // 30일 경과한 게시글 조회 및 삭제
    const deletedPosts = await c.env.DB.prepare(`
      DELETE FROM board_posts 
      WHERE created_at <= datetime('now', '-30 days')
    `).run()

    // 연관된 좋아요도 삭제 (이미 삭제된 게시글의 좋아요)
    await c.env.DB.prepare(`
      DELETE FROM post_likes 
      WHERE post_id NOT IN (SELECT id FROM board_posts)
    `).run()

    return c.json({
      success: true,
      message: `${deletedPosts.changes || 0}개의 30일 경과 게시글이 삭제되었습니다.`,
      deletedCount: deletedPosts.changes || 0
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 게시판 통계 및 청소 (관리자용)
app.get('/api/admin/board-stats', async (c) => {
  try {
    // 관리자 권한 확인
    const userId = c.req.header('X-User-Id')
    
    if (!userId) {
      return c.json({ success: false, error: '인증이 필요합니다.' }, 401)
    }

    const user = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user || user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }

    // 게시판 통계 조회
    const totalPosts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM board_posts
    `).first()

    const oldPosts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM board_posts 
      WHERE created_at <= datetime('now', '-30 days')
    `).first()

    const todayPosts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM board_posts 
      WHERE date(created_at) = date('now')
    `).first()

    const weekPosts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM board_posts 
      WHERE created_at >= datetime('now', '-7 days')
    `).first()

    return c.json({
      success: true,
      stats: {
        total: totalPosts?.count || 0,
        old: oldPosts?.count || 0,
        today: todayPosts?.count || 0,
        week: weekPosts?.count || 0
      }
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ========================= 지역 관리 API =========================

// 지역 데이터 초기화
app.post('/api/locations/init', async (c) => {
  try {
    // 지역 테이블 생성
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- 'city', 'district', 'dong'
        parent_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // 기존 데이터 확인
    const existingData = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM locations
    `).first()

    if (existingData?.count > 0) {
      return c.json({ success: true, message: '지역 데이터가 이미 초기화되어 있습니다.' })
    }

    // 시/도 데이터
    const cities = [
      { code: 'seoul', name: '서울특별시', type: 'city' },
      { code: 'incheon', name: '인천광역시', type: 'city' },
      { code: 'busan', name: '부산광역시', type: 'city' },
      { code: 'daegu', name: '대구광역시', type: 'city' },
      { code: 'gwangju', name: '광주광역시', type: 'city' },
      { code: 'daejeon', name: '대전광역시', type: 'city' },
      { code: 'ulsan', name: '울산광역시', type: 'city' },
      { code: 'gyeonggi', name: '경기도', type: 'city' },
      { code: 'gangwon', name: '강원도', type: 'city' },
      { code: 'chungbuk', name: '충청북도', type: 'city' },
      { code: 'chungnam', name: '충청남도', type: 'city' },
      { code: 'jeonbuk', name: '전라북도', type: 'city' },
      { code: 'jeonnam', name: '전라남도', type: 'city' },
      { code: 'gyeongbuk', name: '경상북도', type: 'city' },
      { code: 'gyeongnam', name: '경상남도', type: 'city' },
      { code: 'jeju', name: '제주특별자치도', type: 'city' }
    ]

    // 구/군 데이터 (서울, 인천 위주)
    const districts = [
      // 서울 구
      { code: 'seoul-gangnam', name: '강남구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-gangdong', name: '강동구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-gangbuk', name: '강북구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-gangseo', name: '강서구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-gwanak', name: '관악구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-gwangjin', name: '광진구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-guro', name: '구로구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-geumcheon', name: '금천구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-nowon', name: '노원구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-dobong', name: '도봉구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-dongdaemun', name: '동대문구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-dongjak', name: '동작구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-mapo', name: '마포구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-seodaemun', name: '서대문구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-seocho', name: '서초구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-seongdong', name: '성동구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-seongbuk', name: '성북구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-songpa', name: '송파구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-yangcheon', name: '양천구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-yeongdeungpo', name: '영등포구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-yongsan', name: '용산구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-eunpyeong', name: '은평구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-jongno', name: '종로구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-jung', name: '중구', type: 'district', parent_code: 'seoul' },
      { code: 'seoul-jungnang', name: '중랑구', type: 'district', parent_code: 'seoul' },

      // 인천 구/군
      { code: 'incheon-jung', name: '중구', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-dong', name: '동구', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-michuhol', name: '미추홀구', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-yeonsu', name: '연수구', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-namdong', name: '남동구', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-bupyeong', name: '부평구', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-gyeyang', name: '계양구', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-seo', name: '서구', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-ganghwa', name: '강화군', type: 'district', parent_code: 'incheon' },
      { code: 'incheon-ongjin', name: '옹진군', type: 'district', parent_code: 'incheon' }
    ]

    // 동 데이터 (예시 - 인천 중구와 서울 강남구)
    const dongs = [
      // 인천 중구 동
      { code: 'incheon-jung-dongindong', name: '동인동', type: 'dong', parent_code: 'incheon-jung' },
      { code: 'incheon-jung-sinpo', name: '신포동', type: 'dong', parent_code: 'incheon-jung' },
      { code: 'incheon-jung-answon', name: '답동', type: 'dong', parent_code: 'incheon-jung' },
      { code: 'incheon-jung-hagik', name: '학익동', type: 'dong', parent_code: 'incheon-jung' },
      { code: 'incheon-jung-songhyeon', name: '송현동', type: 'dong', parent_code: 'incheon-jung' },
      { code: 'incheon-jung-yulhyeon', name: '율현동', type: 'dong', parent_code: 'incheon-jung' },
      { code: 'incheon-jung-unseo', name: '운서동', type: 'dong', parent_code: 'incheon-jung' },
      { code: 'incheon-jung-eurwang', name: '을왕동', type: 'dong', parent_code: 'incheon-jung' },

      // 서울 강남구 동
      { code: 'seoul-gangnam-apgujeong', name: '압구정동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-cheongdam', name: '청담동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-samseong', name: '삼성동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-nonhyeon', name: '논현동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-sinsa', name: '신사동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-daechi', name: '대치동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-yeoksam', name: '역삼동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-dogok', name: '도곡동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-gaepo', name: '개포동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-ilwon', name: '일원동', type: 'dong', parent_code: 'seoul-gangnam' },
      { code: 'seoul-gangnam-suseo', name: '수서동', type: 'dong', parent_code: 'seoul-gangnam' }
    ]

    // 데이터 삽입
    for (const city of cities) {
      await c.env.DB.prepare(`
        INSERT INTO locations (code, name, type, parent_code) 
        VALUES (?, ?, ?, ?)
      `).bind(city.code, city.name, city.type, null).run()
    }

    for (const district of districts) {
      await c.env.DB.prepare(`
        INSERT INTO locations (code, name, type, parent_code) 
        VALUES (?, ?, ?, ?)
      `).bind(district.code, district.name, district.type, district.parent_code).run()
    }

    for (const dong of dongs) {
      await c.env.DB.prepare(`
        INSERT INTO locations (code, name, type, parent_code) 
        VALUES (?, ?, ?, ?)
      `).bind(dong.code, dong.name, dong.type, dong.parent_code).run()
    }

    return c.json({ success: true, message: '지역 데이터가 초기화되었습니다.' })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 시/도 목록 조회
app.get('/api/locations/cities', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT code, name FROM locations WHERE type = 'city' ORDER BY name
    `).all()

    return c.json({ success: true, cities: results || [] })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 구/군 목록 조회
app.get('/api/locations/districts/:cityCode', async (c) => {
  try {
    const cityCode = c.req.param('cityCode')
    const { results } = await c.env.DB.prepare(`
      SELECT code, name FROM locations 
      WHERE type = 'district' AND parent_code = ? 
      ORDER BY name
    `).bind(cityCode).all()

    return c.json({ success: true, districts: results || [] })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 동 목록 조회
app.get('/api/locations/dongs/:districtCode', async (c) => {
  try {
    const districtCode = c.req.param('districtCode')
    const { results } = await c.env.DB.prepare(`
      SELECT code, name FROM locations 
      WHERE type = 'dong' AND parent_code = ? 
      ORDER BY name
    `).bind(districtCode).all()

    return c.json({ success: true, dongs: results || [] })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 결제 설정 저장 (관리자만)
app.post('/api/payment-settings', async (c) => {
  try {
    const { userId, tossClientKey, tossSecretKey, kakaoClientKey, kakaoSecretKey } = await c.req.json()
    
    // 관리자 권한 확인
    const user = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user || user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }
    
    // 결제 설정 테이블이 없으면 생성
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        toss_client_key TEXT,
        toss_secret_key TEXT,
        kakao_client_key TEXT,
        kakao_secret_key TEXT,
        is_configured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    
    // 기존 설정이 있는지 확인
    const existing = await c.env.DB.prepare(`
      SELECT id FROM payment_settings LIMIT 1
    `).first()
    
    if (existing) {
      // 업데이트
      await c.env.DB.prepare(`
        UPDATE payment_settings 
        SET toss_client_key = ?, toss_secret_key = ?, kakao_client_key = ?, kakao_secret_key = ?,
            is_configured = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(tossClientKey, tossSecretKey, kakaoClientKey, kakaoSecretKey, existing.id).run()
    } else {
      // 새로 생성
      await c.env.DB.prepare(`
        INSERT INTO payment_settings (toss_client_key, toss_secret_key, kakao_client_key, kakao_secret_key, is_configured)
        VALUES (?, ?, ?, ?, 1)
      `).bind(tossClientKey, tossSecretKey, kakaoClientKey, kakaoSecretKey).run()
    }
    
    return c.json({ success: true, message: '결제 설정이 저장되었습니다.' })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 결제 연동 상태 확인
app.get('/api/payment-status', async (c) => {
  try {
    const settings = await c.env.DB.prepare(`
      SELECT is_configured FROM payment_settings LIMIT 1
    `).first()
    
    return c.json({ 
      success: true, 
      isConfigured: settings ? settings.is_configured === 1 : false 
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 결제 설정 조회 (관리자만, 보안을 위해 키는 마스킹)
app.get('/api/payment-settings', async (c) => {
  try {
    const userId = c.req.query('userId')
    
    if (!userId) {
      return c.json({ success: false, error: '사용자 ID가 필요합니다.' }, 400)
    }
    
    // 관리자 권한 확인
    const user = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user || user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }
    
    const settings = await c.env.DB.prepare(`
      SELECT toss_client_key, kakao_client_key, is_configured FROM payment_settings LIMIT 1
    `).first()
    
    if (settings) {
      return c.json({
        success: true,
        settings: {
          tossClientKey: settings.toss_client_key ? settings.toss_client_key.substring(0, 8) + '...' : '',
          kakaoClientKey: settings.kakao_client_key ? settings.kakao_client_key.substring(0, 8) + '...' : '',
          isConfigured: settings.is_configured === 1
        }
      })
    } else {
      return c.json({
        success: true,
        settings: {
          tossClientKey: '',
          kakaoClientKey: '',
          isConfigured: false
        }
      })
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 연결 테스트 (실제로는 키 유효성 검증)
app.post('/api/payment-test', async (c) => {
  try {
    const { userId, provider } = await c.req.json()
    
    // 관리자 권한 확인
    const user = await c.env.DB.prepare(`
      SELECT email FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user || user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }
    
    const settings = await c.env.DB.prepare(`
      SELECT * FROM payment_settings LIMIT 1
    `).first()
    
    if (!settings) {
      return c.json({ success: false, error: '결제 설정이 없습니다.' }, 400)
    }
    
    // 실제 환경에서는 여기서 해당 결제 서비스 API를 호출하여 키 유효성 검증
    // 현재는 키가 존재하면 성공으로 처리
    let isValid = false
    
    if (provider === 'toss') {
      isValid = settings.toss_client_key && settings.toss_secret_key
    } else if (provider === 'kakao') {
      isValid = settings.kakao_client_key && settings.kakao_secret_key
    }
    
    if (isValid) {
      return c.json({ success: true, message: '연결 테스트가 성공했습니다.' })
    } else {
      return c.json({ success: false, error: '키가 유효하지 않거나 설정되지 않았습니다.' }, 400)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ================================
// 공지사항 관리 API
// ================================

// 공지사항 테이블 생성 (없으면)
async function createNoticesTable(DB: D1Database) {
  try {
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        author_name TEXT,
        author_full_name TEXT,
        category TEXT DEFAULT 'update',
        image_url TEXT,
        is_pinned INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    
    console.log('공지사항 테이블 생성 완료')
  } catch (error) {
    console.error('공지사항 테이블 생성 실패:', error)
  }
}

// 공지사항 목록 조회
app.get('/api/notices', async (c) => {
  try {
    // 테이블 생성 (없으면)
    await createNoticesTable(c.env.DB)
    
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const { results: notices } = await c.env.DB.prepare(`
      SELECT * FROM notices 
      WHERE status = 'active' 
      ORDER BY is_pinned DESC, created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()
    
    return c.json({ success: true, notices: notices })
  } catch (error) {
    console.error('공지사항 조회 실패:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 상세 조회
app.get('/api/notices/:id', async (c) => {
  try {
    const noticeId = c.req.param('id')
    
    // 조회수 증가
    await c.env.DB.prepare(`
      UPDATE notices SET view_count = view_count + 1 WHERE id = ?
    `).bind(noticeId).run()
    
    const notice = await c.env.DB.prepare(`
      SELECT * FROM notices WHERE id = ? AND status = 'active'
    `).bind(noticeId).first()
    
    if (!notice) {
      return c.json({ success: false, error: '공지사항을 찾을 수 없습니다.' }, 404)
    }
    
    return c.json({ success: true, notice: notice })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 작성 (관리자만)
app.post('/api/notices', async (c) => {
  try {
    // 테이블 생성 (없으면)
    await createNoticesTable(c.env.DB)
    
    const { userId, title, content, imageUrl, isPinned } = await c.req.json()
    
    // 사용자 정보 확인
    const user = await c.env.DB.prepare(`
      SELECT id, username, full_name, email FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 404)
    }
    
    // 관리자 권한 확인
    if (user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }
    
    // 공지사항 생성
    const result = await c.env.DB.prepare(`
      INSERT INTO notices (title, content, author_id, author_name, author_full_name, image_url, is_pinned)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title, 
      content, 
      user.id, 
      user.username, 
      user.full_name, 
      imageUrl || null, 
      isPinned ? 1 : 0
    ).run()
    
    if (result.success) {
      return c.json({ 
        success: true, 
        message: '공지사항이 작성되었습니다.',
        noticeId: result.meta.last_row_id 
      })
    } else {
      throw new Error('공지사항 작성에 실패했습니다.')
    }
  } catch (error) {
    console.error('공지사항 작성 실패:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 수정 (관리자만)
app.put('/api/notices/:id', async (c) => {
  try {
    const noticeId = c.req.param('id')
    const { userId, title, content, imageUrl, isPinned } = await c.req.json()
    
    // 사용자 정보 확인
    const user = await c.env.DB.prepare(`
      SELECT id, username, full_name, email FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 404)
    }
    
    // 관리자 권한 확인
    if (user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }
    
    // 기존 공지사항 확인
    const existingNotice = await c.env.DB.prepare(`
      SELECT * FROM notices WHERE id = ? AND status = 'active'
    `).bind(noticeId).first()
    
    if (!existingNotice) {
      return c.json({ success: false, error: '공지사항을 찾을 수 없습니다.' }, 404)
    }
    
    // 공지사항 수정
    const result = await c.env.DB.prepare(`
      UPDATE notices 
      SET title = ?, content = ?, image_url = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title, 
      content, 
      imageUrl || null, 
      isPinned ? 1 : 0, 
      noticeId
    ).run()
    
    if (result.success) {
      return c.json({ 
        success: true, 
        message: '공지사항이 수정되었습니다.' 
      })
    } else {
      throw new Error('공지사항 수정에 실패했습니다.')
    }
  } catch (error) {
    console.error('공지사항 수정 실패:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 공지사항 삭제 (관리자만)
app.delete('/api/notices/:id', async (c) => {
  try {
    const noticeId = c.req.param('id')
    const userId = c.req.header('X-User-Id')
    
    // 사용자 정보 확인
    const user = await c.env.DB.prepare(`
      SELECT id, username, full_name, email FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, 404)
    }
    
    // 관리자 권한 확인
    if (user.email !== '5321497@naver.com') {
      return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
    }
    
    // 기존 공지사항 확인
    const existingNotice = await c.env.DB.prepare(`
      SELECT * FROM notices WHERE id = ? AND status = 'active'
    `).bind(noticeId).first()
    
    if (!existingNotice) {
      return c.json({ success: false, error: '공지사항을 찾을 수 없습니다.' }, 404)
    }
    
    // 공지사항 삭제 (소프트 삭제)
    const result = await c.env.DB.prepare(`
      UPDATE notices 
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(noticeId).run()
    
    if (result.success) {
      return c.json({ 
        success: true, 
        message: '공지사항이 삭제되었습니다.' 
      })
    } else {
      throw new Error('공지사항 삭제에 실패했습니다.')
    }
  } catch (error) {
    console.error('공지사항 삭제 실패:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
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