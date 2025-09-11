// 파이코인 마켓 클라이언트 사이드 JavaScript

class PicoinMarket {
  constructor() {
    this.currentUser = null
    this.categories = []
    this.products = []
    this.chatRooms = new Map()
    
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadCategories()
    this.loadProducts()
    this.checkAuthStatus()
    this.showChatNotice()
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 모달 관련
    document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'))
    document.getElementById('signupBtn').addEventListener('click', () => this.showModal('signupModal'))
    document.getElementById('closeLoginModal').addEventListener('click', () => this.hideModal('loginModal'))
    document.getElementById('closeSignupModal').addEventListener('click', () => this.hideModal('signupModal'))
    document.getElementById('switchToSignup').addEventListener('click', () => this.switchModal('loginModal', 'signupModal'))
    document.getElementById('switchToLogin').addEventListener('click', () => this.switchModal('signupModal', 'loginModal'))

    // 폼 제출
    document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e))
    document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e))

    // 판매하기 버튼
    document.getElementById('sellBtn').addEventListener('click', () => this.handleSellClick())

    // 정렬 변경
    document.getElementById('sortSelect').addEventListener('change', (e) => this.loadProducts(e.target.value))

    // 검색 기능
    const searchInput = document.getElementById('searchInput')
    let searchTimeout
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.trim()
        this.loadProducts('latest', null, searchTerm)
      }, 500) // 500ms 디바운스
    })

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = e.target.value.trim()
        this.loadProducts('latest', null, searchTerm)
      }
    })

    // 모달 외부 클릭 시 닫기
    document.getElementById('loginModal').addEventListener('click', (e) => {
      if (e.target.id === 'loginModal') this.hideModal('loginModal')
    })
    document.getElementById('signupModal').addEventListener('click', (e) => {
      if (e.target.id === 'signupModal') this.hideModal('signupModal')
    })
  }

  // 카테고리 로드
  async loadCategories() {
    try {
      const response = await axios.get('/api/categories')
      if (response.data.success) {
        this.categories = response.data.categories
        this.renderCategories()
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error)
    }
  }

  // 상품 목록 로드
  async loadProducts(sort = 'latest', category = null, search = null) {
    try {
      const params = { sort }
      if (category) params.category = category
      if (search) params.search = search

      const response = await axios.get('/api/products', { params })
      if (response.data.success) {
        this.products = response.data.products
        this.renderProducts()
      }
    } catch (error) {
      console.error('상품 로드 실패:', error)
      this.showToast('상품을 불러오는데 실패했습니다.', 'error')
    }
  }

  // 카테고리 렌더링
  renderCategories() {
    const container = document.getElementById('categories')
    container.innerHTML = this.categories.map(category => \`
      <div class="category-card" onclick="app.filterByCategory(\${category.id})">
        <div class="text-2xl mb-2">\${category.icon}</div>
        <div class="text-sm font-medium text-gray-700">\${category.name}</div>
      </div>
    \`).join('')
  }

  // 상품 목록 렌더링
  renderProducts() {
    const container = document.getElementById('productList')
    
    if (this.products.length === 0) {
      container.innerHTML = \`
        <div class="col-span-full text-center py-12">
          <div class="text-gray-400 mb-4">
            <i class="fas fa-box-open text-6xl"></i>
          </div>
          <p class="text-gray-600 text-lg">등록된 상품이 없습니다</p>
          <p class="text-gray-500 text-sm mt-2">첫 번째 상품을 등록해보세요!</p>
        </div>
      \`
      return
    }

    container.innerHTML = this.products.map(product => \`
      <div class="product-card fade-in-up" onclick="app.showProductDetail(\${product.id})">
        <div class="product-image-container">
          \${product.first_image 
            ? \`<img src="\${product.first_image}" alt="\${product.title}" class="product-image">\`
            : \`<div class="product-placeholder">
                 <i class="fas fa-image text-gray-400 text-3xl"></i>
               </div>\`
          }
          <div class="absolute top-2 right-2">
            <span class="status-badge status-\${product.condition_type.replace('_', '-')}">\${this.getConditionText(product.condition_type)}</span>
          </div>
          \${product.like_count > 0 
            ? \`<div class="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs">
                 <i class="fas fa-heart text-red-500 mr-1"></i>\${product.like_count}
               </div>\`
            : ''
          }
        </div>
        
        <div class="p-3">
          <h3 class="font-medium text-gray-800 text-sm mb-2 line-clamp-2">\${product.title}</h3>
          
          <div class="price-display mb-2">
            <span class="krw-price">\${this.formatPrice(product.price)}원</span>
            <div class="pi-price">
              <span class="pi-icon">π</span>
              \${product.pi_coin_price}
            </div>
          </div>
          
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>\${product.location || '위치 미설정'}</span>
            <span>조회 \${product.view_count}</span>
          </div>
          
          <div class="mt-2 text-xs text-gray-400">
            \${this.timeAgo(product.created_at)}
          </div>
        </div>
      </div>
    \`).join('')
  }

  // 로그인 처리
  async handleLogin(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    try {
      const response = await axios.post('/api/auth/login', data)
      if (response.data.success) {
        this.currentUser = response.data.user
        localStorage.setItem('picoin_user', JSON.stringify(this.currentUser))
        this.updateAuthUI()
        this.hideModal('loginModal')
        this.showToast(\`환영합니다, \${this.currentUser.full_name}님!\`, 'success')
      } else {
        this.showToast(response.data.error, 'error')
      }
    } catch (error) {
      this.showToast('로그인에 실패했습니다.', 'error')
    }
  }

  // 회원가입 처리
  async handleSignup(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    // 비밀번호 확인
    if (data.password !== data.confirmPassword) {
      this.showToast('비밀번호가 일치하지 않습니다.', 'error')
      return
    }

    try {
      const response = await axios.post('/api/auth/signup', data)
      if (response.data.success) {
        this.showToast(response.data.message, 'success')
        this.hideModal('signupModal')
        this.showModal('loginModal')
        // 로그인 폼에 이메일 미리 입력
        document.querySelector('#loginForm input[name="email"]').value = data.email
      } else {
        this.showToast(response.data.error, 'error')
      }
    } catch (error) {
      this.showToast('회원가입에 실패했습니다.', 'error')
    }
  }

  // 인증 상태 확인
  checkAuthStatus() {
    const userData = localStorage.getItem('picoin_user')
    if (userData) {
      this.currentUser = JSON.parse(userData)
      this.updateAuthUI()
    }
  }

  // 인증 UI 업데이트
  updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn')
    const signupBtn = document.getElementById('signupBtn')

    if (this.currentUser) {
      loginBtn.innerHTML = \`
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            \${this.currentUser.full_name.charAt(0)}
          </div>
          <div class="text-left">
            <div class="text-sm font-medium">\${this.currentUser.full_name}</div>
            <div class="text-xs text-gray-500 flex items-center">
              <span class="pi-icon mr-1">π</span>
              \${this.currentUser.pi_coin_balance}
            </div>
          </div>
        </div>
      \`
      signupBtn.textContent = '로그아웃'
      signupBtn.onclick = () => this.logout()
    }
  }

  // 로그아웃
  logout() {
    this.currentUser = null
    localStorage.removeItem('picoin_user')
    location.reload()
  }

  // 판매하기 클릭 처리
  handleSellClick() {
    if (!this.currentUser) {
      this.showToast('로그인이 필요한 서비스입니다.', 'info')
      this.showModal('loginModal')
      return
    }
    
    // 판매 페이지로 이동
    window.location.href = '/static/sell.html'
  }

  // 카테고리별 필터링
  filterByCategory(categoryId) {
    this.loadProducts('latest', categoryId)
    
    // 카테고리 선택 상태 업데이트
    document.querySelectorAll('.category-card').forEach(card => {
      card.classList.remove('active')
    })
    event.target.closest('.category-card').classList.add('active')
  }

  // 상품 상세 보기
  showProductDetail(productId) {
    window.location.href = `/static/product.html?id=${productId}`
  }

  // 모달 표시
  showModal(modalId) {
    const modal = document.getElementById(modalId)
    modal.classList.remove('hidden')
    modal.classList.add('flex')
    modal.querySelector('.bg-white').classList.add('modal-enter')
  }

  // 모달 숨기기
  hideModal(modalId) {
    const modal = document.getElementById(modalId)
    modal.classList.add('hidden')
    modal.classList.remove('flex')
  }

  // 모달 전환
  switchModal(fromModalId, toModalId) {
    this.hideModal(fromModalId)
    setTimeout(() => this.showModal(toModalId), 100)
  }

  // 채팅 알림 표시
  showChatNotice() {
    // 페이지 로드 후 5초 뒤에 채팅 알림 표시
    setTimeout(() => {
      const notice = document.getElementById('chatNotice')
      notice.classList.remove('hidden')
      
      // 10초 후 자동 숨김
      setTimeout(() => {
        notice.classList.add('hidden')
      }, 10000)
    }, 5000)
  }

  // 토스트 알림 표시
  showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = \`toast \${type}\`
    
    const iconMap = {
      success: 'fa-check-circle text-green-500',
      error: 'fa-exclamation-circle text-red-500',
      info: 'fa-info-circle text-blue-500'
    }

    toast.innerHTML = \`
      <div class="flex items-center">
        <i class="fas \${iconMap[type]} mr-3"></i>
        <span>\${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    \`

    document.body.appendChild(toast)

    // 표시 애니메이션
    setTimeout(() => toast.classList.add('show'), 100)

    // 자동 삭제
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }

  // 유틸리티 함수들
  formatPrice(price) {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  getConditionText(condition) {
    const conditionMap = {
      'new': '새상품',
      'like_new': '거의새것',
      'good': '좋음',
      'fair': '보통',
      'poor': '나쁨'
    }
    return conditionMap[condition] || condition
  }

  timeAgo(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return \`\${Math.floor(diffInSeconds / 60)}분 전\`
    if (diffInSeconds < 86400) return \`\${Math.floor(diffInSeconds / 3600)}시간 전\`
    if (diffInSeconds < 2592000) return \`\${Math.floor(diffInSeconds / 86400)}일 전\`
    
    return date.toLocaleDateString('ko-KR')
  }
}

// 앱 초기화
const app = new PicoinMarket()

// 전역 함수로 노출 (HTML에서 직접 호출용)
window.app = app