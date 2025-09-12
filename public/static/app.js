// 파이코인 마켓 클라이언트 사이드 JavaScript
console.log('app.js 파일 로드됨')
console.info('앱 파일 로딩 확인')

class PicoinMarket {
  constructor() {
    console.log('PicoinMarket 생성자 호출됨')
    this.currentUser = null
    this.categories = []
    this.products = []
    this.chatRooms = new Map()
    this.piCoinPrice = 0.5 // 기본 파이코인 가격 (KRW)
    this.priceUpdateInterval = null
    
    // 필터 관련 상태
    this.currentFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: ''
    }
    
    // 지역 데이터
    this.locationData = {}
    
    try {
      this.init()
      console.log('PicoinMarket 초기화 완료')
    } catch (error) {
      console.error('PicoinMarket 초기화 중 오류:', error)
    }
  }

  init() {
    try {
      console.log('init() 시작')
      this.setupEventListeners()
      console.log('이벤트 리스너 설정 완료')
      
      this.loadCategories()
      console.log('카테고리 로드 시작')
      
      this.loadProducts()
      console.log('상품 로드 시작')
      
      this.checkAuthStatus()
      console.log('인증 상태 확인 완료')
      
      this.loadPiCoinPrice() // 파이코인 시세 로드
      console.log('파이코인 가격 로드 시작')
      
      this.startPriceUpdateTimer() // 실시간 시세 업데이트 시작
      console.log('가격 업데이트 타이머 시작')
      
      console.log('init() 완료')
    } catch (error) {
      console.error('init() 에러:', error)
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    console.log('이벤트 리스너 설정 시작')
    
    // DOM 요소 확인
    const loginBtn = document.getElementById('loginBtn')
    const signupBtn = document.getElementById('signupBtn')
    const sellBtn = document.getElementById('sellBtn')
    
    console.log('버튼 요소 확인:', {
      loginBtn: !!loginBtn,
      signupBtn: !!signupBtn,
      sellBtn: !!sellBtn
    })
    
    // 모달 관련
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        console.log('로그인 버튼 클릭됨')
        this.showModal('loginModal')
      })
    } else {
      console.error('로그인 버튼을 찾을 수 없습니다')
    }
    
    if (signupBtn) {
      signupBtn.addEventListener('click', () => {
        console.log('회원가입 버튼 클릭됨')
        this.showModal('signupModal')
      })
    } else {
      console.error('회원가입 버튼을 찾을 수 없습니다')
    }
    const closeLoginModal = document.getElementById('closeLoginModal')
    const closeSignupModal = document.getElementById('closeSignupModal')
    const switchToSignup = document.getElementById('switchToSignup')
    const switchToLogin = document.getElementById('switchToLogin')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')
    
    if (closeLoginModal) closeLoginModal.addEventListener('click', () => this.hideModal('loginModal'))
    if (closeSignupModal) closeSignupModal.addEventListener('click', () => this.hideModal('signupModal'))
    if (switchToSignup) switchToSignup.addEventListener('click', () => this.switchModal('loginModal', 'signupModal'))
    if (switchToLogin) switchToLogin.addEventListener('click', () => this.switchModal('signupModal', 'loginModal'))

    // 폼 제출
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        console.log('로그인 폼 제출됨')
        this.handleLogin(e)
      })
    }
    
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        console.log('회원가입 폼 제출됨')
        this.handleSignup(e)
      })
    }

    // 버튼 이벤트 (데스크탑)
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        console.log('판매 버튼 클릭됨')
        this.handleSellClick()
      })
    } else {
      console.error('판매 버튼을 찾을 수 없습니다')
    }
    
    const piCoinBtn = document.getElementById('piCoinBtn')
    const adminBtn = document.getElementById('adminBtn')
    
    if (piCoinBtn) {
      piCoinBtn.addEventListener('click', () => {
        console.log('파이코인 버튼 클릭됨')
        this.handlePiCoinClick()
      })
    }
    
    if (adminBtn) {
      adminBtn.addEventListener('click', () => {
        console.log('관리자 버튼 클릭됨')
        this.handleAdminClick()
      })
    }

    // 모바일 메뉴 이벤트
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => this.toggleMobileMenu())
    document.getElementById('mobileSellBtn')?.addEventListener('click', () => this.handleSellClick())
    document.getElementById('mobilePiCoinBtn')?.addEventListener('click', () => this.handlePiCoinClick())
    document.getElementById('mobileAdminBtn')?.addEventListener('click', () => this.handleAdminClick())
    document.getElementById('mobileLoginBtn')?.addEventListener('click', () => this.showModal('loginModal'))
    document.getElementById('mobileSignupBtn')?.addEventListener('click', () => this.showModal('signupModal'))

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
    document.getElementById('filterPanel').addEventListener('click', (e) => {
      if (e.target.id === 'filterPanel') this.hideFilterPanel()
    })

    // 고급 필터링 기능 (검색 필터 팝업 + 사이드바 토글)
    document.getElementById('filterBtn')?.addEventListener('click', () => this.toggleFilters())
    document.getElementById('closeFilter')?.addEventListener('click', () => this.hideAllFilters())
    
    // 지역 필터 팝업의 버튼들
    document.getElementById('applyLocationFilter')?.addEventListener('click', () => this.applyLocationFilter())
    document.getElementById('resetLocationFilter')?.addEventListener('click', () => this.resetLocationFilter())
    
    // 사이드바의 필터 적용/초기화 버튼
    const sidebarApplyBtn = document.querySelector('#filterSidebar #applyFilters')
    if (sidebarApplyBtn) {
      sidebarApplyBtn.addEventListener('click', () => this.applyCafeFilters())
    }
    
    const sidebarResetBtn = document.querySelector('#filterSidebar #resetFilters')
    if (sidebarResetBtn) {
      sidebarResetBtn.addEventListener('click', () => this.resetCafeFilters())
    }
    
    // 상품명 검색 실시간 필터링
    const productNameFilter = document.getElementById('productNameFilter')
    if (productNameFilter) {
      let filterTimeout
      productNameFilter.addEventListener('input', (e) => {
        clearTimeout(filterTimeout)
        filterTimeout = setTimeout(() => {
          this.applyFilters()
        }, 500) // 500ms 디바운스
      })
    }

    // 가격대 프리셋 클릭 이벤트
    document.querySelectorAll('.price-range-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        // 기존 활성화 제거
        document.querySelectorAll('.price-range-preset.active').forEach(el => el.classList.remove('active'))
        // 새로 선택된 것 활성화
        preset.classList.add('active')
        
        const range = preset.dataset.range
        if (range) {
          const [min, max] = range.split('-')
          document.getElementById('minPriceFilter').value = min || ''
          document.getElementById('maxPriceFilter').value = max || ''
        }
      })
    })
    
    // 상품 상태 필터 클릭 이벤트
    document.querySelectorAll('.condition-filter-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('active')
      })
    })
    
    // 가격 입력 시 프리셋 비활성화
    const minPriceFilter = document.getElementById('minPriceFilter')
    const maxPriceFilter = document.getElementById('maxPriceFilter')
    
    if (minPriceFilter) {
      minPriceFilter.addEventListener('input', () => {
        document.querySelectorAll('.price-range-preset.active').forEach(el => el.classList.remove('active'))
        // 카페 스타일 가격 버튼 비활성화
        document.querySelectorAll('.cafe-price-filter.active').forEach(el => el.classList.remove('active'))
        
        // 현재 필터 상태 업데이트 및 적용
        this.currentFilters.minPrice = minPriceFilter.value
        this.applyCafeFilters()
      })
    }
    
    if (maxPriceFilter) {
      maxPriceFilter.addEventListener('input', () => {
        document.querySelectorAll('.price-range-preset.active').forEach(el => el.classList.remove('active'))
        // 카페 스타일 가격 버튼 비활성화
        document.querySelectorAll('.cafe-price-filter.active').forEach(el => el.classList.remove('active'))
        
        // 현재 필터 상태 업데이트 및 적용
        this.currentFilters.maxPrice = maxPriceFilter.value
        this.applyCafeFilters()
      })
    }

    // 카페 스타일 사이드바 필터 버튼 이벤트 리스너
    // 필터 적용 버튼
    document.getElementById('applyFilters')?.addEventListener('click', () => {
      // 입력 필드 값 업데이트
      const minPrice = document.getElementById('minPriceFilter')?.value || ''
      const maxPrice = document.getElementById('maxPriceFilter')?.value || ''
      
      this.currentFilters.minPrice = minPrice
      this.currentFilters.maxPrice = maxPrice
      
      this.applyCafeFilters()
      this.showToast('필터가 적용되었습니다.', 'success')
    })
    
    // 필터 초기화 버튼
    document.getElementById('resetFilters')?.addEventListener('click', () => {
      this.resetCafeFilters()
    })
    
    // 사이드바 필터 이벤트 리스너 설정
    this.setupSidebarEventListeners()
  }

  // 파이코인 시세 로드
  async loadPiCoinPrice() {
    try {
      const response = await axios.get('/api/pi-coin-price')
      if (response.data.success) {
        this.piCoinPrice = response.data.price
        this.updatePiCoinPriceDisplay()
        
        // 캐시 상태 표시 (개발자용)
        if (response.data.cached) {
          console.log('파이코인 시세 (캐시됨):', this.piCoinPrice, 'KRW')
        } else {
          console.log('파이코인 시세 (실시간):', this.piCoinPrice, 'KRW')
        }
        
        if (response.data.error) {
          console.warn('파이코인 시세 경고:', response.data.error)
        }
      }
    } catch (error) {
      console.error('파이코인 시세 로드 실패:', error)
      this.piCoinPrice = 0.5 // 기본값 설정
    }
  }

  // 실시간 가격 업데이트 타이머 시작
  startPriceUpdateTimer() {
    // 5분마다 가격 업데이트
    this.priceUpdateInterval = setInterval(() => {
      this.loadPiCoinPrice()
    }, 5 * 60 * 1000) // 5분 = 300,000ms
  }

  // 가격 업데이트 타이머 중지
  stopPriceUpdateTimer() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval)
      this.priceUpdateInterval = null
    }
  }

  // 파이코인 가격 표시 업데이트
  updatePiCoinPriceDisplay() {
    // 헤더나 다른 곳에 현재 파이코인 가격 표시
    const priceDisplays = document.querySelectorAll('.pi-coin-price-display')
    priceDisplays.forEach(display => {
      display.textContent = `1π = ${this.formatPrice(this.piCoinPrice)}원`
    })
  }

  // KRW 가격을 파이코인으로 변환
  convertKrwToPiCoin(krwAmount) {
    if (this.piCoinPrice <= 0) return 0
    return (krwAmount / this.piCoinPrice).toFixed(3) // 소수점 3자리
  }

  // 파이코인을 KRW로 변환
  convertPiCoinToKrw(piAmount) {
    return Math.round(piAmount * this.piCoinPrice)
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
  async loadProducts(sort = 'latest', category = null, search = null, filters = null) {
    try {
      const params = { sort }
      if (category) params.category = category
      if (search) params.search = search
      if (filters) {
        if (filters.location) params.location = filters.location
        if (filters.priceMin) params.priceMin = filters.priceMin
        if (filters.priceMax) params.priceMax = filters.priceMax
        if (filters.condition) params.condition = filters.condition
      }

      const response = await axios.get('/api/products', { params })
      if (response.data.success) {
        this.products = response.data.products
        this.renderProducts()
        // filters가 null이 아닐 때만 updateActiveFilters 호출
        if (filters) {
          this.updateActiveFilters(filters)
        }
      }
    } catch (error) {
      console.error('상품 로드 실패:', error)
      this.showToast('상품을 불러오는데 실패했습니다.', 'error')
    }
  }

  // 카테고리 렌더링
  renderCategories() {
    const container = document.getElementById('categories')
    container.innerHTML = this.categories.map(category => `
      <div class="category-card" onclick="app.filterByCategory(${category.id})">
        <div class="text-2xl mb-2">${category.icon}</div>
        <div class="text-sm font-medium text-gray-700">${category.name}</div>
      </div>
    `).join('')
  }

  // 상품 목록 렌더링
  renderProducts() {
    const container = document.getElementById('productList')
    
    if (this.products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-gray-400 mb-4">
            <i class="fas fa-box-open text-6xl"></i>
          </div>
          <p class="text-gray-600 text-lg">등록된 상품이 없습니다</p>
          <p class="text-gray-500 text-sm mt-2">첫 번째 상품을 등록해보세요!</p>
        </div>
      `
      return
    }

    container.innerHTML = this.products.map(product => `
      <div class="product-card fade-in-up relative" onclick="app.showProductDetail(${product.id})">
        <div class="product-image-container relative">
          ${product.first_image 
            ? `<img src="${product.first_image}" alt="${product.title}" class="product-image">`
            : `<div class="product-placeholder">
                 <i class="fas fa-image text-gray-400 text-3xl"></i>
               </div>`
          }
          <div class="absolute top-2 right-2">
            <span class="status-badge status-${product.condition_type.replace('_', '-')}">${this.getConditionText(product.condition_type)}</span>
          </div>
          ${product.like_count > 0 
            ? `<div class="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs">
                 <i class="fas fa-heart text-red-500 mr-1"></i>${product.like_count}
               </div>`
            : ''
          }
          ${this.currentUser && (this.currentUser.id === product.seller_id || this.isAdmin())
            ? `<div class="absolute bottom-2 right-2 flex space-x-1">
                 ${this.currentUser.id === product.seller_id 
                   ? `<button onclick="event.stopPropagation(); app.editProduct(${product.id})" 
                             class="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600" title="수정">
                        <i class="fas fa-edit"></i>
                      </button>` 
                   : ''}
                 <button onclick="event.stopPropagation(); app.deleteProduct(${product.id})" 
                         class="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600" 
                         title="${this.isAdmin() && this.currentUser.id !== product.seller_id ? '관리자 삭제' : '삭제'}">
                   <i class="fas fa-trash"></i>
                 </button>
                 ${this.isAdmin() && this.currentUser.id !== product.seller_id 
                   ? `<button onclick="event.stopPropagation(); app.hideProduct(${product.id})" 
                             class="bg-yellow-500 text-white p-1 rounded text-xs hover:bg-yellow-600" title="숨기기">
                        <i class="fas fa-eye-slash"></i>
                      </button>` 
                   : ''}
               </div>`
            : ''
          }
        </div>
        
        <div class="p-3">
          <h3 class="product-title">${product.title}</h3>
          
          <div class="price-display mb-2">
            <span class="krw-price">${this.formatPrice(product.price)}원</span>
            <div class="pi-price">
              <span class="pi-icon">π</span>
              ${this.convertKrwToPiCoin(product.price)}
            </div>
          </div>
          
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>${product.location || '위치 미설정'}</span>
            <span>조회 ${product.view_count}</span>
          </div>
          
          <div class="mt-2 text-xs text-gray-400">
            ${this.timeAgo(product.created_at)}
          </div>
        </div>
      </div>
    `).join('')
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
        this.showToast(`환영합니다, ${this.currentUser.full_name}님!`, 'success')
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
    console.log('회원가입 시작') // 디버깅
    
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    console.log('폼 데이터:', data) // 디버깅

    // 필수 필드 확인
    if (!data.email || !data.username || !data.password || !data.fullName) {
      this.showToast('모든 필수 항목을 입력해주세요.', 'error')
      return
    }

    // 비밀번호 확인
    if (data.password !== data.confirmPassword) {
      this.showToast('비밀번호가 일치하지 않습니다.', 'error')
      return
    }

    try {
      console.log('API 호출 시작') // 디버깅
      const response = await axios.post('/api/auth/signup', data)
      console.log('API 응답:', response.data) // 디버깅
      
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
      console.error('회원가입 에러:', error) // 디버깅
      this.showToast(`회원가입에 실패했습니다: ${error.response?.data?.error || error.message}`, 'error')
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
    const piCoinBtn = document.getElementById('piCoinBtn')
    const adminBtn = document.getElementById('adminBtn')

    if (this.currentUser) {
      loginBtn.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            ${this.currentUser.full_name.charAt(0)}
          </div>
          <div class="text-left">
            <div class="text-sm font-medium">${this.currentUser.full_name}</div>
            <div class="text-xs text-gray-500 flex items-center">
              <span class="pi-icon mr-1">π</span>
              ${this.currentUser.pi_coin_balance}
            </div>
          </div>
        </div>
      `
      signupBtn.textContent = '로그아웃'
      signupBtn.onclick = () => this.logout()
      
      // π-coin 구매 버튼 표시
      if (piCoinBtn) {
        piCoinBtn.classList.remove('hidden')
      }
      
      // 관리자 버튼 (관리자인 경우만)
      if (adminBtn && this.currentUser.email === '5321497@naver.com') {
        adminBtn.classList.remove('hidden')
      }

      // 모바일 버튼들도 업데이트
      this.updateMobileAuthButtons()
    }
  }

  // 로그아웃
  logout() {
    this.currentUser = null
    localStorage.removeItem('picoin_user')
    location.reload()
  }
  
  // 사용자 정보 업데이트 (새로고침용)
  async refreshUserData() {
    if (!this.currentUser) return
    
    try {
      const response = await axios.post('/api/auth/login', {
        email: this.currentUser.email,
        password: '' // 로컬 업데이트용이므로 비밀번호 검증 스킵
      })
      
      if (response.data.success) {
        this.currentUser = response.data.user
        localStorage.setItem('picoin_user', JSON.stringify(this.currentUser))
        this.updateAuthUI()
      }
    } catch (error) {
      console.log('사용자 정보 업데이트 실패 (정상적 로그인 프로세스 사용 권장)')
    }
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
  
  // π-coin 구매 클릭 처리
  handlePiCoinClick() {
    if (!this.currentUser) {
      this.showToast('로그인이 필요한 서비스입니다.', 'info')
      this.showModal('loginModal')
      return
    }
    
    // π-coin 구매 페이지로 이동
    window.location.href = '/static/purchase.html'
  }
  
  // 관리자 클릭 처리
  handleAdminClick() {
    if (!this.currentUser || this.currentUser.email !== '5321497@naver.com') {
      this.showToast('관리자 권한이 없습니다.', 'error')
      return
    }
    
    // 관리자 대시보드로 이동
    window.location.href = '/static/admin.html'
  }

  // 메인 페이지 카테고리 카드 필터링
  filterByCategory(categoryId) {
    console.log('메인 페이지 카테고리 필터링 호출됨:', categoryId)
    
    // 카테고리 ID로 상품 필터링
    this.loadProducts('latest', categoryId)
    
    // 카테고리 선택 상태 업데이트 (이벤트 안전 장치 추가)
    document.querySelectorAll('.category-card').forEach(card => {
      card.classList.remove('active')
    })
    
    // 클릭된 카드 활성화 (event.target 안전 확인)
    if (event && event.target) {
      const categoryCard = event.target.closest('.category-card')
      if (categoryCard) {
        categoryCard.classList.add('active')
      }
    }
    
    // 성공 메시지 표시
    const categoryName = this.getCategoryName(categoryId)
    this.showToast(`${categoryName} 카테고리가 선택되었습니다.`, 'success')
  }

  // 카페 스타일 사이드바 필터링 시스템
  
  // 현재 필터 상태 저장
  currentFilters = {
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: ''
  }

  // 카페 스타일 사이드바 카테고리 필터링 함수
  filterByCategorySidebar(categoryValue) {
    // 카테고리 버튼 활성 상태 업데이트
    document.querySelectorAll('.cafe-filter-item').forEach(btn => {
      btn.classList.remove('active')
    })
    
    // 클릭된 버튼 활성화
    if (event.target) {
      event.target.classList.add('active')
    }
    
    // 현재 필터 상태 업데이트
    this.currentFilters.category = categoryValue
    
    // 필터 적용
    this.applyCafeFilters()
  }

  // 가격 범위 설정 함수
  setPriceRange(minPrice, maxPrice) {
    // 가격 버튼 활성 상태 업데이트
    document.querySelectorAll('.cafe-price-filter').forEach(btn => {
      btn.classList.remove('active')
    })
    
    // 클릭된 버튼 활성화
    if (event.target) {
      event.target.classList.add('active')
    }
    
    // 입력 필드에 값 설정
    const minPriceInput = document.getElementById('minPriceFilter')
    const maxPriceInput = document.getElementById('maxPriceFilter')
    
    if (minPriceInput) minPriceInput.value = minPrice
    if (maxPriceInput) maxPriceInput.value = maxPrice
    
    // 현재 필터 상태 업데이트
    this.currentFilters.minPrice = minPrice
    this.currentFilters.maxPrice = maxPrice
    
    // 필터 적용
    this.applyCafeFilters()
  }

  // 상품 상태 설정 함수
  setCondition(conditionValue) {
    // 상태 버튼 활성 상태 업데이트
    document.querySelectorAll('.cafe-condition-filter').forEach(btn => {
      btn.classList.remove('active')
    })
    
    // 클릭된 버튼 활성화
    if (event.target) {
      event.target.classList.add('active')
    }
    
    // 현재 필터 상태 업데이트
    this.currentFilters.condition = conditionValue
    
    // 필터 적용
    this.applyCafeFilters()
  }

  // 카페 스타일 필터 적용 함수
  async applyCafeFilters() {
    try {
      console.log('applyCafeFilters 호출됨, 현재 필터:', this.currentFilters)
      
      // 필터 파라미터 구성
      const params = {
        sort: document.getElementById('sortSelect')?.value || 'latest'
      }
      
      // 검색어가 있으면 추가
      const searchInput = document.getElementById('searchInput')
      if (searchInput && searchInput.value.trim()) {
        params.search = searchInput.value.trim()
      }
      
      // 카테고리 필터
      if (this.currentFilters.category) {
        params.category = this.currentFilters.category
        console.log('카테고리 필터 추가:', this.currentFilters.category)
      }
      
      // 가격 필터
      if (this.currentFilters.minPrice) {
        params.priceMin = this.currentFilters.minPrice
        console.log('최소가격 필터 추가:', this.currentFilters.minPrice)
      }
      if (this.currentFilters.maxPrice) {
        params.priceMax = this.currentFilters.maxPrice
        console.log('최대가격 필터 추가:', this.currentFilters.maxPrice)
      }
      
      // 상품 상태 필터
      if (this.currentFilters.condition) {
        params.conditions = this.currentFilters.condition
        console.log('상품상태 필터 추가:', this.currentFilters.condition)
      }
      
      console.log('API 호출 파라미터:', params)
      
      // API 호출
      const response = await axios.get('/api/products', { params })
      
      console.log('API 응답:', response.data)
      
      if (response.data.success) {
        this.products = response.data.products
        console.log('필터링된 상품 개수:', this.products.length)
        this.renderProducts()
        this.updateCafeActiveFilters()
      } else {
        console.error('필터링된 상품 로드 실패:', response.data.error)
        this.showToast('상품 로드에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('카페 필터 적용 중 오류:', error)
      this.showToast('필터 적용 중 오류가 발생했습니다.', 'error')
    }
  }

  // 카페 스타일 활성 필터 표시 업데이트
  updateCafeActiveFilters() {
    const activeFiltersContainer = document.getElementById('activeFilters')
    if (!activeFiltersContainer) return
    
    const filtersDiv = activeFiltersContainer.querySelector('div') || 
                      activeFiltersContainer.appendChild(document.createElement('div'))
    filtersDiv.className = 'flex flex-wrap gap-2'
    filtersDiv.innerHTML = ''
    
    let hasActiveFilters = false
    
    // 카테고리 필터 표시
    if (this.currentFilters.category) {
      hasActiveFilters = true
      const categoryName = this.getCategoryName(this.currentFilters.category)
      filtersDiv.appendChild(this.createCafeFilterTag('카테고리', categoryName, () => {
        this.currentFilters.category = ''
        this.resetCategoryButtons()
        this.applyCafeFilters()
      }))
    }
    
    // 가격 필터 표시
    if (this.currentFilters.minPrice || this.currentFilters.maxPrice) {
      hasActiveFilters = true
      let priceText = ''
      if (this.currentFilters.minPrice && this.currentFilters.maxPrice) {
        priceText = `${this.formatPrice(this.currentFilters.minPrice)}원 - ${this.formatPrice(this.currentFilters.maxPrice)}원`
      } else if (this.currentFilters.minPrice) {
        priceText = `${this.formatPrice(this.currentFilters.minPrice)}원 이상`
      } else {
        priceText = `${this.formatPrice(this.currentFilters.maxPrice)}원 이하`
      }
      
      filtersDiv.appendChild(this.createCafeFilterTag('가격', priceText, () => {
        this.currentFilters.minPrice = ''
        this.currentFilters.maxPrice = ''
        document.getElementById('minPriceFilter').value = ''
        document.getElementById('maxPriceFilter').value = ''
        this.resetPriceButtons()
        this.applyCafeFilters()
      }))
    }
    
    // 상품 상태 필터 표시
    if (this.currentFilters.condition) {
      hasActiveFilters = true
      const conditionText = this.getConditionText(this.currentFilters.condition)
      filtersDiv.appendChild(this.createCafeFilterTag('상품상태', conditionText, () => {
        this.currentFilters.condition = ''
        this.resetConditionButtons()
        this.applyCafeFilters()
      }))
    }
    
    // 활성 필터 컨테이너 표시/숨기기
    if (hasActiveFilters) {
      activeFiltersContainer.classList.remove('hidden')
    } else {
      activeFiltersContainer.classList.add('hidden')
    }
  }

  // 카페 스타일 필터 태그 생성
  createCafeFilterTag(label, value, onRemove) {
    const tag = document.createElement('div')
    tag.className = 'inline-flex items-center px-3 py-1 bg-pi-orange text-white text-sm rounded-full shadow-sm'
    tag.innerHTML = `
      <span><strong>${label}:</strong> ${value}</span>
      <button class="ml-2 text-white hover:text-gray-200 font-bold" title="필터 제거">×</button>
    `
    
    tag.querySelector('button').addEventListener('click', onRemove)
    return tag
  }

  // 카테고리 이름 가져오기
  getCategoryName(categoryValue) {
    const categoryMap = {
      '1': '전자기기',
      '2': '가구/인테리어',
      '3': '의류/패션잡화',
      '4': '도서/음반',
      '5': '스포츠/레저',
      '6': '게임/취미',
      '7': '생활용품',
      '8': '기타'
    }
    return categoryMap[categoryValue] || '선택된 카테고리'
  }

  // 버튼 상태 초기화 함수들
  resetCategoryButtons() {
    document.querySelectorAll('.cafe-filter-item').forEach(btn => {
      btn.classList.remove('active')
    })
    // 전체보기 버튼 활성화
    document.querySelector('.cafe-filter-item').classList.add('active')
  }

  resetPriceButtons() {
    document.querySelectorAll('.cafe-price-filter').forEach(btn => {
      btn.classList.remove('active')
    })
    // 전체 버튼 활성화
    document.querySelector('.cafe-price-filter').classList.add('active')
  }

  resetConditionButtons() {
    document.querySelectorAll('.cafe-condition-filter').forEach(btn => {
      btn.classList.remove('active')
    })
    // 전체 버튼 활성화
    document.querySelector('.cafe-condition-filter').classList.add('active')
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

  // 모바일 메뉴 토글
  toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu')
    const mobileMenuBtn = document.getElementById('mobileMenuBtn')
    const icon = mobileMenuBtn.querySelector('i')
    
    if (mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.remove('hidden')
      icon.className = 'fas fa-times text-xl'
      // 로그인 상태에 따라 모바일 버튼 표시/숨김
      this.updateMobileAuthButtons()
    } else {
      mobileMenu.classList.add('hidden')
      icon.className = 'fas fa-bars text-xl'
    }
  }

  // 모바일 인증 버튼 업데이트
  updateMobileAuthButtons() {
    const isLoggedIn = !!this.currentUser
    
    // 모바일 버튼들
    document.getElementById('mobileLoginBtn').style.display = isLoggedIn ? 'none' : 'flex'
    document.getElementById('mobileSignupBtn').style.display = isLoggedIn ? 'none' : 'flex'
    document.getElementById('mobilePiCoinBtn').style.display = isLoggedIn ? 'flex' : 'none'
    
    // 관리자 버튼 (조건부)
    const isAdmin = isLoggedIn && (this.currentUser.email === '5321497@naver.com' || this.currentUser.username?.includes('admin'))
    document.getElementById('mobileAdminBtn').style.display = isAdmin ? 'flex' : 'none'
  }

  // 토스트 알림 표시
  showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    
    const iconMap = {
      success: 'fa-check-circle text-green-500',
      error: 'fa-exclamation-circle text-red-500',
      info: 'fa-info-circle text-blue-500'
    }

    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${iconMap[type]} mr-3"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    document.body.appendChild(toast)

    // 표시 애니메이션
    setTimeout(() => toast.classList.add('show'), 100)

    // 자동 삭제
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }

  // 필터 패널 토글 (지역 필터용)
  toggleFilterPanel() {
    const filterPanel = document.getElementById('filterPanel')
    filterPanel.classList.remove('hidden')
    filterPanel.classList.add('flex')
    
    // 지역 데이터 로드
    this.populateLocationData()
  }

  // 필터 패널 숨기기
  hideFilterPanel() {
    const filterPanel = document.getElementById('filterPanel')
    filterPanel.classList.add('hidden')
    filterPanel.classList.remove('flex')
  }

  // 지역 데이터 로드 및 초기화
  populateLocationData() {
    console.log('populateLocationData 호출됨')
    
    // 시/도 선택 드롭다운 초기화
    this.initializeCitySelect()
    
    // 지역 선택 이벤트 리스너 설정
    this.setupLocationEventListeners()
  }

  // 시/도 선택 드롭다운 초기화
  initializeCitySelect() {
    const citySelect = document.getElementById('filterCity')
    if (!citySelect) {
      console.error('filterCity 요소를 찾을 수 없습니다!')
      return
    }

    console.log('시/도 드롭다운 초기화 중...')
    
    // 기존 옵션 제거 후 기본 옵션 추가
    citySelect.innerHTML = '<option value="">전체 시/도</option>'
    
    // 대한민국 주요 시/도 목록 (코드와 이름 포함)
    const cities = [
      { code: 'seoul', name: '서울특별시' },
      { code: 'busan', name: '부산광역시' },
      { code: 'daegu', name: '대구광역시' },
      { code: 'incheon', name: '인천광역시' },
      { code: 'gwangju', name: '광주광역시' },
      { code: 'daejeon', name: '대전광역시' },
      { code: 'ulsan', name: '울산광역시' },
      { code: 'sejong', name: '세종특별자치시' },
      { code: 'gyeonggi', name: '경기도' },
      { code: 'gangwon', name: '강원도' },
      { code: 'chungbuk', name: '충청북도' },
      { code: 'chungnam', name: '충청남도' },
      { code: 'jeonbuk', name: '전라북도' },
      { code: 'jeonnam', name: '전라남도' },
      { code: 'gyeongbuk', name: '경상북도' },
      { code: 'gyeongnam', name: '경상남도' },
      { code: 'jeju', name: '제주특별자치도' }
    ]
    
    cities.forEach(city => {
      const option = document.createElement('option')
      option.value = city.code  // 코드를 value로 사용
      option.textContent = city.name
      citySelect.appendChild(option)
    })
    
    console.log('시/도 옵션 추가 완료:', cities.length, '개, 총 옵션 수:', citySelect.options.length)
  }

  // 지역 선택 이벤트 리스너 설정
  setupLocationEventListeners() {
    const citySelect = document.getElementById('filterCity')
    const districtSelect = document.getElementById('filterDistrict')
    const dongSelect = document.getElementById('filterDong')
    const locationHidden = document.getElementById('filterLocation')
    const selectedDisplay = document.getElementById('selectedLocationDisplay')
    const selectedText = document.getElementById('selectedLocationText')

    // 시/도 선택 시
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        const selectedCity = e.target.value
        console.log('선택된 시/도:', selectedCity)
        
        if (selectedCity) {
          this.populateDistrictSelect(selectedCity)
          districtSelect.disabled = false
          
          // 최종 지역 업데이트
          this.updateFinalLocation()
        } else {
          districtSelect.disabled = true
          dongSelect.disabled = true
          districtSelect.innerHTML = '<option value="">전체 구/군</option>'
          dongSelect.innerHTML = '<option value="">전체 동/읍/면</option>'
          this.updateFinalLocation()
        }
      })
    }

    // 구/군 선택 시
    if (districtSelect) {
      districtSelect.addEventListener('change', (e) => {
        const selectedDistrict = e.target.value
        console.log('선택된 구/군:', selectedDistrict)
        
        if (selectedDistrict) {
          this.populateDongSelect(selectedDistrict)
          dongSelect.disabled = false
        } else {
          dongSelect.disabled = true
          dongSelect.innerHTML = '<option value="">전체 동/읍/면</option>'
        }
        
        this.updateFinalLocation()
      })
    }

    // 동 선택 시
    if (dongSelect) {
      dongSelect.addEventListener('change', () => {
        this.updateFinalLocation()
      })
    }
  }

  // 구/군 드롭다운 채우기
  populateDistrictSelect(cityCode) {
    const districtSelect = document.getElementById('filterDistrict')
    if (!districtSelect) return

    districtSelect.innerHTML = '<option value="">전체 구/군</option>'
    
    // 간단한 구/군 목록 (주요 도시들만) - 코드 기반으로 변경
    const districtData = {
      'seoul': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
      'busan': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
      'daegu': ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군'],
      'incheon': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
      'gwangju': ['광산구', '남구', '동구', '북구', '서구'],
      'daejeon': ['대덕구', '동구', '서구', '유성구', '중구'],
      'ulsan': ['남구', '동구', '북구', '중구', '울주군'],
      'gyeonggi': ['수원시', '성남시', '안양시', '안산시', '고양시', '과천시', '광명시', '광주시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '시흥시', '안성시', '오산시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시', '여주시', '양평군', '가평군', '연천군']
    }

    const districts = districtData[cityCode] || ['기타 지역']
    
    districts.forEach((district, index) => {
      const option = document.createElement('option')
      option.value = cityCode + '_' + index  // 고유한 값 생성
      option.textContent = district
      districtSelect.appendChild(option)
    })
    
    // 구/군 선택 가능하도록 활성화
    districtSelect.disabled = false
    console.log('구/군 옵션 추가 완료:', districts.length, '개')
  }

  // 동 드롭다운 채우기 (간단한 예시)
  populateDongSelect(district) {
    const dongSelect = document.getElementById('filterDong')
    if (!dongSelect) return

    dongSelect.innerHTML = '<option value="">전체 동/읍/면</option>'
    
    // 간단한 동 목록 (예시)
    const dongs = ['1동', '2동', '3동', '중앙동', '역전동', '시장동', '주공동', '아파트단지']
    
    dongs.forEach(dong => {
      const option = document.createElement('option')
      option.value = dong
      option.textContent = dong
      dongSelect.appendChild(option)
    })
  }

  // 최종 지역 문자열 업데이트
  updateFinalLocation() {
    const city = document.getElementById('filterCity')?.value || ''
    const district = document.getElementById('filterDistrict')?.value || ''
    const dong = document.getElementById('filterDong')?.value || ''
    const locationHidden = document.getElementById('filterLocation')
    const selectedDisplay = document.getElementById('selectedLocationDisplay')
    const selectedText = document.getElementById('selectedLocationText')

    let finalLocation = ''
    if (city) {
      finalLocation = city
      if (district) {
        finalLocation += ' ' + district
        if (dong) {
          finalLocation += ' ' + dong
        }
      }
    }

    if (locationHidden) {
      locationHidden.value = finalLocation
    }

    // 선택된 지역 표시
    if (selectedDisplay && selectedText) {
      if (finalLocation) {
        selectedText.textContent = finalLocation
        selectedDisplay.classList.remove('hidden')
      } else {
        selectedDisplay.classList.add('hidden')
      }
    }

    console.log('최종 선택 지역:', finalLocation)
  }

  // 필터 적용
  applyFilters() {
    const filters = {
      category: document.getElementById('filterCategory').value,
      location: document.getElementById('filterLocation').value,
      priceMin: document.getElementById('filterPriceMin').value,
      priceMax: document.getElementById('filterPriceMax').value,
      condition: document.getElementById('filterCondition').value
    }

    // 빈 값 제거
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key]
    })

    // 검색어 유지
    const searchTerm = document.getElementById('searchInput').value.trim()
    
    // 현재 정렬 옵션 유지
    const currentSort = document.getElementById('sortSelect').value
    
    // 상품 로드
    this.loadProducts(currentSort, filters.category, searchTerm, filters)
    
    // 필터 패널 닫기
    this.hideFilterPanel()
    
    // 성공 메시지
    this.showToast('필터가 적용되었습니다.', 'success')
  }

  // 필터 초기화


  // 활성 필터 업데이트
  updateActiveFilters(filters) {
    const activeFiltersContainer = document.getElementById('activeFilters')
    
    if (!filters || Object.keys(filters).length === 0) {
      activeFiltersContainer.classList.add('hidden')
      return
    }

    activeFiltersContainer.classList.remove('hidden')
    const filtersDiv = activeFiltersContainer.querySelector('div')
    filtersDiv.innerHTML = ''

    // 카테고리 필터
    if (filters.category) {
      const category = this.categories.find(c => c.id == filters.category)
      if (category) {
        this.addFilterTag(filtersDiv, `${category.icon} ${category.name}`, 'category', filters.category)
      }
    }

    // 지역 필터
    if (filters.location) {
      this.addFilterTag(filtersDiv, `📍 ${filters.location}`, 'location', filters.location)
    }

    // 가격 필터
    if (filters.priceMin || filters.priceMax) {
      let priceText = '💰 '
      if (filters.priceMin && filters.priceMax) {
        priceText += `${this.formatPrice(filters.priceMin)}원 - ${this.formatPrice(filters.priceMax)}원`
      } else if (filters.priceMin) {
        priceText += `${this.formatPrice(filters.priceMin)}원 이상`
      } else {
        priceText += `${this.formatPrice(filters.priceMax)}원 이하`
      }
      this.addFilterTag(filtersDiv, priceText, 'price', 'price')
    }

    // 상태 필터
    if (filters.condition) {
      this.addFilterTag(filtersDiv, `⭐ ${this.getConditionText(filters.condition)}`, 'condition', filters.condition)
    }
  }

  // 필터 태그 추가
  addFilterTag(container, text, type, value) {
    const tag = document.createElement('div')
    tag.className = 'inline-flex items-center px-3 py-1 bg-pi-orange text-white text-sm rounded-full'
    tag.innerHTML = `
      <span>${text}</span>
      <button onclick="app.removeFilter('${type}', '${value}')" class="ml-2 text-white hover:text-gray-200">
        <i class="fas fa-times text-xs"></i>
      </button>
    `
    container.appendChild(tag)
  }

  // 개별 필터 제거
  removeFilter(type, value) {
    // 현재 필터 상태 가져오기
    const filters = {}
    
    if (type === 'category') {
      // 카테고리 제거하고 다시 로드
      this.loadProducts('latest')
    } else {
      // 다른 필터들 재구성
      const location = document.getElementById('filterLocation').value
      const priceMin = document.getElementById('filterPriceMin').value
      const priceMax = document.getElementById('filterPriceMax').value
      const condition = document.getElementById('filterCondition').value
      
      if (type === 'location') {
        document.getElementById('filterLocation').value = ''
      } else if (type === 'price') {
        document.getElementById('filterPriceMin').value = ''
        document.getElementById('filterPriceMax').value = ''
      } else if (type === 'condition') {
        document.getElementById('filterCondition').value = ''
      }
      
      // 필터 재적용
      this.applyFilters()
    }
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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
    
    return date.toLocaleDateString('ko-KR')
  }

  // 관리자 권한 확인
  isAdmin() {
    return this.currentUser && (
      this.currentUser.email === '5321497@naver.com' || 
      this.currentUser.is_admin === 1 ||
      this.currentUser.username === 'admin_master'
    )
  }

  // 상품 소유자 확인
  isOwnerOfProduct(productId) {
    if (!this.currentUser) return false
    const product = this.products.find(p => p.id == productId)
    return product && product.seller_id === this.currentUser.id
  }

  // 상품 삭제 (본인 또는 관리자)
  async deleteProduct(productId) {
    if (!this.currentUser) {
      this.showToast('로그인이 필요한 서비스입니다.', 'error')
      return
    }

    // 관리자이면서 본인 상품이 아닌 경우 관리자 삭제 프로세스
    const isAdminDelete = this.isAdmin() && !this.isOwnerOfProduct(productId)
    
    if (isAdminDelete) {
      this.showAdminDeleteModal(productId, 'delete')
      return
    }

    // 본인 상품 삭제
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?\n삭제된 상품과 이미지는 복구할 수 없습니다.')) {
      return
    }

    try {
      const response = await axios.delete(`/api/products/${productId}`, {
        data: { userId: this.currentUser.id }
      })

      if (response.data.success) {
        this.showToast(response.data.message + (response.data.deletedImages > 0 ? ` (이미지 ${response.data.deletedImages}개 포함)` : ''), 'success')
        this.loadProducts()
      } else {
        this.showToast(response.data.error, 'error')
      }
    } catch (error) {
      console.error('상품 삭제 실패:', error)
      this.showToast('상품 삭제에 실패했습니다.', 'error')
    }
  }

  // 관리자 - 상품 숨기기
  async hideProduct(productId) {
    if (!this.isAdmin()) {
      this.showToast('관리자 권한이 필요합니다.', 'error')
      return
    }

    this.showAdminDeleteModal(productId, 'hide')
  }

  // 관리자 삭제/숨기기 모달 표시
  showAdminDeleteModal(productId, action) {
    const product = this.products.find(p => p.id == productId)
    if (!product) {
      this.showToast('상품 정보를 찾을 수 없습니다.', 'error')
      return
    }

    const actionText = action === 'delete' ? '삭제' : '숨기기'
    const actionColor = action === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'

    const modalHtml = `
      <div id="adminActionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <div class="text-center mb-6">
            <div class="w-16 h-16 ${actionColor} rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas ${action === 'delete' ? 'fa-trash' : 'fa-eye-slash'} text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">상품 ${actionText}</h3>
            <p class="text-gray-600 mt-2">관리자 권한으로 상품을 ${actionText}하시겠습니까?</p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="font-medium text-gray-800 mb-2">${product.title}</div>
            <div class="text-sm text-gray-600">
              판매자: ${product.seller_name || '정보 없음'}
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">${actionText} 사유 *</label>
            <textarea id="adminActionReason" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" 
                      rows="3" 
                      placeholder="${actionText} 사유를 입력하세요..."
                      required></textarea>
          </div>

          <div class="flex space-x-3">
            <button onclick="app.closeAdminActionModal()" 
                    class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              취소
            </button>
            <button onclick="app.executeAdminAction(${productId}, '${action}')" 
                    class="flex-1 px-4 py-2 text-white rounded-lg ${actionColor}">
              ${actionText}
            </button>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', modalHtml)
  }

  // 관리자 액션 실행
  async executeAdminAction(productId, action) {
    const reason = document.getElementById('adminActionReason').value.trim()
    
    if (!reason) {
      this.showToast('사유를 입력해주세요.', 'error')
      return
    }

    try {
      const response = await axios.post(`/api/admin/products/${productId}/action`, {
        action: action,
        reason: reason,
        adminId: this.currentUser.id
      })

      if (response.data.success) {
        this.showToast(response.data.message + (response.data.deletedImages > 0 ? ` (이미지 ${response.data.deletedImages}개 포함)` : ''), 'success')
        this.closeAdminActionModal()
        this.loadProducts() // 목록 새로고침
      } else {
        this.showToast(response.data.error, 'error')
      }
    } catch (error) {
      console.error('관리자 액션 실패:', error)
      this.showToast('작업 처리 중 오류가 발생했습니다.', 'error')
    }
  }

  // 관리자 액션 모달 닫기
  closeAdminActionModal() {
    const modal = document.getElementById('adminActionModal')
    if (modal) {
      modal.remove()
    }
  }



  // 상품 소유자 확인
  isOwnerOfProduct(productId) {
    const product = this.products.find(p => p.id === parseInt(productId))
    return product && product.seller_id === this.currentUser.id
  }


  // 관리자 액션 모달 닫기
  closeAdminActionModal() {
    const modal = document.getElementById('adminActionModal')
    if (modal) {
      modal.remove()
    }
  }

  // 상품 수정
  async editProduct(productId) {
    if (!this.currentUser) {
      this.showToast('로그인이 필요한 서비스입니다.', 'error')
      return
    }

    try {
      // 상품 상세 정보 가져오기
      const response = await axios.get(`/api/products/${productId}`)
      
      if (response.data.success) {
        const product = response.data.product
        
        // 상품 소유자 확인
        if (product.seller_id !== this.currentUser.id) {
          this.showToast('본인의 상품만 수정할 수 있습니다.', 'error')
          return
        }

        // 수정 모달 표시
        this.showEditModal(product)
      } else {
        this.showToast('상품 정보를 가져올 수 없습니다.', 'error')
      }
    } catch (error) {
      console.error('상품 정보 조회 실패:', error)
      this.showToast('상품 정보 조회에 실패했습니다.', 'error')
    }
  }

  // 수정 모달 표시
  showEditModal(product) {
    // 수정 모달 HTML 생성 및 표시
    const modalHTML = `
      <div id="editProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-800">상품 정보 수정</h3>
            <button onclick="app.closeEditModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <form id="editProductForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상품명</label>
              <input type="text" id="editTitle" value="${product.title}" required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">가격 (원)</label>
              <input type="number" id="editPrice" value="${product.price}" required min="0"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">파이코인 가격</label>
              <input type="number" id="editPiPrice" value="${product.pi_coin_price}" required min="0" step="0.001"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">위치</label>
              <input type="text" id="editLocation" value="${product.location || ''}"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상품 상태</label>
              <select id="editCondition" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange">
                <option value="new" ${product.condition_type === 'new' ? 'selected' : ''}>새상품</option>
                <option value="like_new" ${product.condition_type === 'like_new' ? 'selected' : ''}>거의새것</option>
                <option value="good" ${product.condition_type === 'good' ? 'selected' : ''}>좋음</option>
                <option value="fair" ${product.condition_type === 'fair' ? 'selected' : ''}>보통</option>
                <option value="poor" ${product.condition_type === 'poor' ? 'selected' : ''}>나쁨</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상품 설명</label>
              <textarea id="editDescription" required rows="4"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange resize-none">${product.description}</textarea>
            </div>

            <div class="flex space-x-3 mt-6">
              <button type="button" onclick="app.closeEditModal()" 
                      class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                취소
              </button>
              <button type="submit" 
                      class="flex-1 px-4 py-2 bg-pi-orange text-white rounded-lg hover:bg-orange-600">
                수정하기
              </button>
            </div>
          </form>
        </div>
      </div>
    `

    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML)

    // 가격 자동 계산 이벤트 리스너 추가
    const priceInput = document.getElementById('editPrice')
    const piPriceInput = document.getElementById('editPiPrice')
    
    priceInput.addEventListener('input', (e) => {
      const krwPrice = parseFloat(e.target.value) || 0
      const piPrice = this.convertKrwToPiCoin(krwPrice)
      piPriceInput.value = piPrice
    })

    piPriceInput.addEventListener('input', (e) => {
      const piAmount = parseFloat(e.target.value) || 0
      const krwPrice = this.convertPiCoinToKrw(piAmount)
      priceInput.value = krwPrice
    })

    // 폼 제출 이벤트 리스너
    document.getElementById('editProductForm').addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleEditSubmit(product.id)
    })
  }

  // 수정 모달 닫기
  closeEditModal() {
    const modal = document.getElementById('editProductModal')
    if (modal) {
      modal.remove()
    }
  }

  // 수정 폼 제출 처리
  async handleEditSubmit(productId) {
    try {
      const title = document.getElementById('editTitle').value.trim()
      const price = parseFloat(document.getElementById('editPrice').value)
      const piPrice = parseFloat(document.getElementById('editPiPrice').value)
      const location = document.getElementById('editLocation').value.trim()
      const condition = document.getElementById('editCondition').value
      const description = document.getElementById('editDescription').value.trim()

      if (!title || !price || !piPrice || !condition || !description) {
        this.showToast('모든 필수 항목을 입력해주세요.', 'error')
        return
      }

      const response = await axios.put(`/api/products/${productId}`, {
        userId: this.currentUser.id,
        title,
        description,
        price,
        piPrice,
        location,
        condition
      })

      if (response.data.success) {
        this.showToast('상품 정보가 수정되었습니다.', 'success')
        this.closeEditModal()
        // 상품 목록 다시 로드
        this.loadProducts()
      } else {
        this.showToast(response.data.error, 'error')
      }
    } catch (error) {
      console.error('상품 수정 실패:', error)
      this.showToast('상품 수정에 실패했습니다.', 'error')
    }
  }

  // 고급 필터링 시스템 함수들
  
  // 컴팩트한 필터 패널 토글
  toggleFilterPanel() {
    const filterPanel = document.getElementById('filterPanel')
    const filterButton = document.getElementById('showFilter')
    const chevron = filterButton?.querySelector('.fa-chevron-down')
    
    console.log('Toggle filter panel called, panel hidden?', filterPanel.classList.contains('hidden'))
    
    if (filterPanel.classList.contains('hidden')) {
      this.showFilterPanel()
      // 필터 버튼 활성화 스타일
      if (filterButton) {
        filterButton.classList.add('active')
      }
      // 화살표 회전
      if (chevron) {
        chevron.style.transform = 'rotate(180deg)'
      }
    } else {
      this.hideFilterPanel()
      // 필터 버튼 비활성화 스타일
      if (filterButton) {
        filterButton.classList.remove('active')
      }
      // 화살표 원위치
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)'
      }
    }
  }

  // 검색 필터 팝업 표시 (지역 필터용)
  showFilterPanel() {
    const filterPanel = document.getElementById('filterPanel')
    
    if (filterPanel) {
      console.log('Showing location filter panel')
      
      // 숨김 해제
      filterPanel.classList.remove('hidden')
      filterPanel.classList.add('flex')
      
      // 지역 데이터 로드
      console.log('필터 패널 표시 후 지역 데이터 로드 시작')
      this.populateLocationData()
      
      // 지역 선택 요소들이 제대로 있는지 확인
      const citySelect = document.getElementById('filterCity')
      const districtSelect = document.getElementById('filterDistrict')
      const dongSelect = document.getElementById('filterDong')
      
      console.log('지역 선택 요소 확인:', {
        citySelect: !!citySelect,
        districtSelect: !!districtSelect, 
        dongSelect: !!dongSelect,
        cityOptions: citySelect ? citySelect.options.length : 0
      })
    }
  }

  // 컴팩트한 필터 패널 숨기기
  hideFilterPanel() {
    const filterPanel = document.getElementById('filterPanel')
    
    console.log('Hiding filter panel')
    
    // 슬라이드 아웃 애니메이션 적용
    filterPanel.classList.remove('filter-slide-in')
    filterPanel.classList.add('filter-slide-out')
    
    // 애니메이션 완료 후 숨김
    setTimeout(() => {
      filterPanel.classList.add('hidden')
      filterPanel.classList.remove('filter-slide-out')
    }, 200)
  }

  // 필터 카테고리 업데이트
  updateFilterCategories() {
    const categoryFilter = document.getElementById('categoryFilter')
    if (categoryFilter && this.categories.length > 0) {
      // 기존 옵션 제거 (첫 번째 "전체 카테고리" 제외)
      while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild)
      }
      
      // 카테고리 옵션 추가
      this.categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent = category.name
        categoryFilter.appendChild(option)
      })
    }
  }

  // 상품 상태 버튼 설정
  setupConditionButtons() {
    document.querySelectorAll('.condition-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        btn.classList.toggle('active')
      })
    })
  }

  // 가격 범위 선택 설정
  setupPriceRangeSelect() {
    const priceRangeSelect = document.getElementById('priceRangeSelect')
    const minPriceFilter = document.getElementById('minPriceFilter')
    const maxPriceFilter = document.getElementById('maxPriceFilter')
    
    if (priceRangeSelect) {
      priceRangeSelect.addEventListener('change', (e) => {
        const value = e.target.value
        if (value) {
          const [min, max] = value.split('-')
          minPriceFilter.value = min || ''
          maxPriceFilter.value = max || ''
        } else {
          minPriceFilter.value = ''
          maxPriceFilter.value = ''
        }
      })
    }

    // 수동 입력 시 선택 초기화
    if (minPriceFilter) {
      minPriceFilter.addEventListener('input', () => {
        priceRangeSelect.value = ''
      })
    }
    
    if (maxPriceFilter) {
      maxPriceFilter.addEventListener('input', () => {
        priceRangeSelect.value = ''
      })
    }
  }

  // 필터 적용
  async applyFilters() {
    try {
      // 필터 값들 수집
      const filters = this.collectFilterValues()
      
      // 활성 필터 표시 업데이트
      this.updateActiveFilters(filters)
      
      // 필터링된 상품 로드
      await this.loadProductsWithFilters(filters)
      
      // 필터 패널 숨기기 (선택사항)
      // this.hideFilterPanel()
      
      this.showToast('필터가 적용되었습니다.', 'success')
    } catch (error) {
      console.error('필터 적용 중 오류:', error)
      this.showToast('필터 적용에 실패했습니다.', 'error')
    }
  }

  // 필터 값들 수집
  collectFilterValues() {
    const filters = {
      productName: document.getElementById('productNameFilter')?.value?.trim() || '',
      category: document.getElementById('categoryFilter')?.value || '',
      location: document.getElementById('locationFilter')?.value || '',
      conditions: [],
      minPrice: parseInt(document.getElementById('minPriceFilter')?.value) || null,
      maxPrice: parseInt(document.getElementById('maxPriceFilter')?.value) || null
    }
    
    // 상품 상태 드롭다운에서 값 수집
    const conditionValue = document.getElementById('conditionFilter')?.value
    if (conditionValue) {
      filters.conditions.push(conditionValue)
    }
    
    return filters
  }

  // 활성 필터 표시 업데이트
  updateActiveFilters(filters) {
    const activeFiltersContainer = document.getElementById('activeFilters')
    if (!activeFiltersContainer || !filters) return
    
    const filtersDiv = activeFiltersContainer.querySelector('div') || 
                      activeFiltersContainer.appendChild(document.createElement('div'))
    filtersDiv.className = 'flex flex-wrap gap-2'
    filtersDiv.innerHTML = ''
    
    let hasActiveFilters = false
    
    // 상품명 필터 (존재하는 경우에만)
    if (filters.productName && document.getElementById('productNameFilter')) {
      hasActiveFilters = true
      filtersDiv.appendChild(this.createFilterTag('상품명', filters.productName, () => {
        document.getElementById('productNameFilter').value = ''
        this.applyFilters()
      }))
    }
    
    // 카테고리 필터
    if (filters.category) {
      hasActiveFilters = true
      const categoryName = this.categories.find(c => c.id == filters.category)?.name || '선택된 카테고리'
      filtersDiv.appendChild(this.createFilterTag('카테고리', categoryName, () => {
        document.getElementById('categoryFilter').value = ''
        this.applyFilters()
      }))
    }
    
    // 지역 필터
    if (filters.location) {
      hasActiveFilters = true
      filtersDiv.appendChild(this.createFilterTag('지역', filters.location, () => {
        document.getElementById('locationFilter').value = ''
        this.applyFilters()
      }))
    }
    
    // 상태 필터
    if (filters.conditions.length > 0) {
      hasActiveFilters = true
      const conditionTexts = filters.conditions.map(c => this.getConditionText(c))
      filtersDiv.appendChild(this.createFilterTag('상품상태', conditionTexts.join(', '), () => {
        document.getElementById('conditionFilter').value = ''
        this.applyFilters()
      }))
    }
    
    // 가격 필터
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      hasActiveFilters = true
      let priceText = ''
      if (filters.minPrice !== null && filters.maxPrice !== null) {
        priceText = `${this.formatPrice(filters.minPrice)}원 - ${this.formatPrice(filters.maxPrice)}원`
      } else if (filters.minPrice !== null) {
        priceText = `${this.formatPrice(filters.minPrice)}원 이상`
      } else {
        priceText = `${this.formatPrice(filters.maxPrice)}원 이하`
      }
      
      filtersDiv.appendChild(this.createFilterTag('가격', priceText, () => {
        document.getElementById('minPriceFilter').value = ''
        document.getElementById('maxPriceFilter').value = ''
        document.getElementById('priceRangeSelect').value = ''
        this.applyFilters()
      }))
    }
    
    // 활성 필터 컨테이너 표시/숨기기
    if (hasActiveFilters) {
      activeFiltersContainer.classList.remove('hidden')
    } else {
      activeFiltersContainer.classList.add('hidden')
    }
  }

  // 필터 태그 생성
  createFilterTag(label, value, onRemove) {
    const tag = document.createElement('div')
    tag.className = 'active-filter-tag'
    tag.innerHTML = `
      <span><strong>${label}:</strong> ${value}</span>
      <span class="active-filter-remove" title="필터 제거">×</span>
    `
    
    tag.querySelector('.active-filter-remove').addEventListener('click', onRemove)
    return tag
  }

  // 필터링된 상품 로드
  async loadProductsWithFilters(filters) {
    try {
      // URL 파라미터 생성
      const params = new URLSearchParams()
      
      if (filters.productName) params.append('search', filters.productName)
      if (filters.category) params.append('category', filters.category)
      if (filters.location) params.append('location', filters.location)
      if (filters.minPrice !== null) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice !== null) params.append('maxPrice', filters.maxPrice)
      if (filters.conditions.length > 0) params.append('conditions', filters.conditions.join(','))
      
      // 현재 정렬 방식 유지
      const sortSelect = document.getElementById('sortSelect')
      if (sortSelect) {
        params.append('sort', sortSelect.value)
      }
      
      const response = await axios.get(`/api/products?${params.toString()}`)
      
      if (response.data.success) {
        this.products = response.data.products
        this.renderProducts()
      } else {
        console.error('필터링된 상품 로드 실패:', response.data.error)
        this.showToast('상품 로드에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('필터링된 상품 로드 중 오류:', error)
      this.showToast('상품 로드 중 오류가 발생했습니다.', 'error')
    }
  }

  // 필터 초기화
  resetFilters() {
    // 모든 필터 입력값 초기화
    document.getElementById('productNameFilter').value = ''
    document.getElementById('categoryFilter').value = ''
    document.getElementById('locationFilter').value = ''
    document.getElementById('conditionFilter').value = ''  // 드롭다운 방식으로 변경
    document.getElementById('minPriceFilter').value = ''
    document.getElementById('maxPriceFilter').value = ''
    document.getElementById('priceRangeSelect').value = ''
    
    // 활성 필터 숨기기
    document.getElementById('activeFilters')?.classList.add('hidden')
    
    // 전체 상품 다시 로드
    this.loadProducts()
    
    this.showToast('필터가 초기화되었습니다.', 'info')
  }

  // 카페 스타일 필터 초기화
  resetCafeFilters() {
    // 현재 필터 상태 초기화
    this.currentFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    }
    
    // 입력 필드 초기화
    const minPriceInput = document.getElementById('minPriceFilter')
    const maxPriceInput = document.getElementById('maxPriceFilter')
    if (minPriceInput) minPriceInput.value = ''
    if (maxPriceInput) maxPriceInput.value = ''
    
    // 모든 버튼 상태 초기화
    this.resetCategoryButtons()
    this.resetPriceButtons()
    this.resetConditionButtons()
    
    // 활성 필터 숨기기
    document.getElementById('activeFilters')?.classList.add('hidden')
    
    // 전체 상품 다시 로드
    this.loadProducts()
    
    this.showToast('필터가 초기화되었습니다.', 'info')
  }

  // 사이드바 이벤트 리스너 설정
  setupSidebarEventListeners() {
    // 카테고리 필터 버튼들
    document.querySelectorAll('.cafe-filter-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const categoryValue = e.target.closest('button').dataset.category || ''
        this.handleCategoryFilter(categoryValue, e.target.closest('button'))
      })
    })
    
    // 가격 필터 버튼들
    document.querySelectorAll('.cafe-price-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.target.closest('button')
        const minPrice = button.dataset.min || ''
        const maxPrice = button.dataset.max || ''
        this.handlePriceFilter(minPrice, maxPrice, button)
      })
    })
    
    // 상품 상태 필터 버튼들
    document.querySelectorAll('.cafe-condition-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const conditionValue = e.target.closest('button').dataset.condition || ''
        this.handleConditionFilter(conditionValue, e.target.closest('button'))
      })
    })
  }

  // 카테고리 필터 처리
  handleCategoryFilter(categoryValue, clickedButton) {
    console.log('카테고리 필터 처리:', categoryValue, clickedButton)
    
    // 카테고리 버튼 활성 상태 업데이트
    document.querySelectorAll('.cafe-filter-item').forEach(btn => {
      btn.classList.remove('active')
    })
    clickedButton.classList.add('active')
    
    // 현재 필터 상태 업데이트
    this.currentFilters.category = categoryValue
    console.log('현재 필터 상태 업데이트됨:', this.currentFilters)
    
    // 필터 적용
    this.applyCafeFilters()
  }

  // 가격 필터 처리
  handlePriceFilter(minPrice, maxPrice, clickedButton) {
    // 가격 버튼 활성 상태 업데이트
    document.querySelectorAll('.cafe-price-filter').forEach(btn => {
      btn.classList.remove('active')
    })
    clickedButton.classList.add('active')
    
    // 입력 필드에 값 설정
    const minPriceInput = document.getElementById('minPriceFilter')
    const maxPriceInput = document.getElementById('maxPriceFilter')
    
    if (minPriceInput) minPriceInput.value = minPrice
    if (maxPriceInput) maxPriceInput.value = maxPrice
    
    // 현재 필터 상태 업데이트
    this.currentFilters.minPrice = minPrice
    this.currentFilters.maxPrice = maxPrice
    
    // 필터 적용
    this.applyCafeFilters()
  }

  // 상품 상태 필터 처리
  handleConditionFilter(conditionValue, clickedButton) {
    // 상태 버튼 활성 상태 업데이트
    document.querySelectorAll('.cafe-condition-filter').forEach(btn => {
      btn.classList.remove('active')
    })
    clickedButton.classList.add('active')
    
    // 현재 필터 상태 업데이트
    this.currentFilters.condition = conditionValue
    
    // 필터 적용
    this.applyCafeFilters()
  }

  // 사이드바 토글 함수 (전역 함수로 사용)
  toggleFilterSidebar() {
    const sidebar = document.getElementById('filterSidebar')
    const isHidden = sidebar.classList.contains('hidden')
    
    if (isHidden) {
      sidebar.classList.remove('hidden')
      // 사이드바가 처음 표시될 때 이벤트 리스너 재설정
      setTimeout(() => this.setupSidebarEventListeners(), 100)
    } else {
      sidebar.classList.add('hidden')
    }
  }

  // 검색 필터 팝업 숨기기
  hideFilterPanel() {
    const filterPanel = document.getElementById('filterPanel')
    if (filterPanel) {
      filterPanel.classList.add('hidden')
      filterPanel.classList.remove('flex')
    }
  }

  // 검색 필터 팝업 적용
  applyPopupFilters() {
    console.log('검색 필터 팝업 적용 시작')
    
    const filters = {
      category: document.getElementById('filterCategory')?.value || '',
      location: document.getElementById('filterLocation')?.value || '',
      priceMin: document.getElementById('filterPriceMin')?.value || '',
      priceMax: document.getElementById('filterPriceMax')?.value || '',
      condition: document.getElementById('filterCondition')?.value || ''
    }

    console.log('검색 필터 팝업 수집된 필터:', filters)

    // 빈 값 제거
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key]
    })

    // 검색어 유지
    const searchTerm = document.getElementById('searchInput')?.value?.trim() || ''
    
    // 현재 정렬 옵션 유지
    const currentSort = document.getElementById('sortSelect')?.value || 'latest'
    
    console.log('검색 필터 팝업 최종 필터:', filters)
    
    // 상품 로드
    this.loadProducts(currentSort, filters.category, searchTerm, filters)
    
    // 필터 패널 닫기
    this.hideFilterPanel()
    
    // 성공 메시지
    this.showToast('필터가 적용되었습니다.', 'success')
  }

  // 필터 토글 기능 (지역 필터 팝업만)
  toggleFilters() {
    const filterPanel = document.getElementById('filterPanel')
    
    const isPanelHidden = filterPanel.classList.contains('hidden')
    
    if (isPanelHidden) {
      // 팝업 숨김 상태 -> 팝업 표시
      this.showFilterPanel()
    } else {
      // 팝업 표시 상태 -> 팝업 숨김
      this.hideFilterPanel()
    }
  }

  // 필터 사이드바 표시
  showFilterSidebar() {
    const sidebar = document.getElementById('filterSidebar')
    if (sidebar) {
      sidebar.classList.remove('hidden')
      // 사이드바가 처음 표시될 때 이벤트 리스너 재설정
      setTimeout(() => this.setupSidebarEventListeners(), 100)
    }
  }

  // 모든 필터 숨기기
  hideAllFilters() {
    this.hideFilterPanel()
    this.hideFilterSidebar()
  }

  // 필터 사이드바 숨기기
  hideFilterSidebar() {
    const sidebar = document.getElementById('filterSidebar')
    if (sidebar) {
      sidebar.classList.add('hidden')
    }
  }

  // 지역 필터 적용
  applyLocationFilter() {
    const locationValue = document.getElementById('filterLocation')?.value || ''
    
    if (!locationValue) {
      this.showToast('지역을 선택해주세요.', 'info')
      return
    }

    console.log('지역 필터 적용:', locationValue)
    
    // 지역으로 상품 필터링
    this.loadProducts('latest', null, null, { location: locationValue })
    
    // 팝업 닫기
    this.hideFilterPanel()
    
    this.showToast(`${locationValue} 지역 필터가 적용되었습니다.`, 'success')
  }

  // 지역 필터 초기화
  resetLocationFilter() {
    // 모든 지역 선택 초기화
    const filterCity = document.getElementById('filterCity')
    const filterDistrict = document.getElementById('filterDistrict')
    const filterDong = document.getElementById('filterDong')
    const filterLocation = document.getElementById('filterLocation')
    const filterCustomLocation = document.getElementById('filterCustomLocation')
    
    if (filterCity) filterCity.value = ''
    if (filterDistrict) {
      filterDistrict.value = ''
      filterDistrict.disabled = true
    }
    if (filterDong) {
      filterDong.value = ''
      filterDong.disabled = true
    }
    if (filterLocation) filterLocation.value = ''
    if (filterCustomLocation) filterCustomLocation.value = ''
    
    // 선택된 지역 표시 숨기기
    const selectedLocationDisplay = document.getElementById('selectedLocationDisplay')
    if (selectedLocationDisplay) {
      selectedLocationDisplay.classList.add('hidden')
    }
    
    // 전체 상품 다시 로드
    this.loadProducts()
    
    this.showToast('지역 필터가 초기화되었습니다.', 'info')
  }

  // 필터 토글 기능 (팝업 + 사이드바)
  toggleFilters() {
    console.log('toggleFilters 호출됨')
    const filterPanel = document.getElementById('filterPanel')
    const filterSidebar = document.getElementById('filterSidebar')
    
    if (filterPanel) {
      console.log('필터 패널 표시')
      filterPanel.classList.remove('hidden')
      filterPanel.classList.add('flex')
      
      // 지역 데이터 초기화
      this.populateLocationData()
    }
    
    if (filterSidebar) {
      console.log('필터 사이드바 토글')
      filterSidebar.classList.toggle('hidden')
    }
  }

  // 모든 필터 숨기기
  hideAllFilters() {
    console.log('hideAllFilters 호출됨')
    const filterPanel = document.getElementById('filterPanel')
    const filterSidebar = document.getElementById('filterSidebar')
    
    if (filterPanel) {
      filterPanel.classList.add('hidden')
      filterPanel.classList.remove('flex')
    }
  }

  // 지역 데이터 채우기
  populateLocationData() {
    console.log('populateLocationData 호출됨')
    
    // 한국의 시/도 데이터
    this.locationData = {
      '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
      '부산광역시': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
      '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
      '인천광역시': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
      '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
      '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
      '울산광역시': ['남구', '동구', '북구', '울주군', '중구'],
      '세종특별자치시': ['세종시'],
      '경기도': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
      '강원도': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
      '충청북도': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '진천군', '청주시', '충주시', '증평군'],
      '충청남도': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
      '전라북도': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
      '전라남도': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
      '경상북도': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
      '경상남도': ['거제시', '거창군', '고성군', '김해시', '남해군', '마산시', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
      '제주특별자치도': ['서귀포시', '제주시']
    }
    
    // 시/도 드롭다운 초기화
    this.initializeCitySelect()
  }

  // 시/도 선택 초기화
  initializeCitySelect() {
    console.log('initializeCitySelect 호출됨')
    
    const citySelect = document.getElementById('filterCity')
    if (!citySelect) {
      console.error('filterCity 요소를 찾을 수 없습니다')
      return
    }
    
    console.log('filterCity 요소 찾음:', citySelect)
    
    // 기존 옵션 제거 (첫 번째 옵션은 유지)
    while (citySelect.children.length > 1) {
      citySelect.removeChild(citySelect.lastChild)
    }
    
    // 시/도 옵션 추가
    Object.keys(this.locationData).forEach(city => {
      const option = document.createElement('option')
      option.value = city
      option.textContent = city
      citySelect.appendChild(option)
      console.log('시/도 옵션 추가됨:', city)
    })
    
    // 시/도 변경 이벤트 리스너 추가 - bind 사용으로 this 컨텍스트 유지
    const boundCityHandler = (e) => {
      console.log('시/도 변경됨:', e.target.value)
      this.updateDistrictOptions(e.target.value)
    }
    citySelect.addEventListener('change', boundCityHandler)
    
    console.log('시/도 드롭다운 초기화 완료')
  }

  // 구/군 옵션 업데이트
  updateDistrictOptions(selectedCity) {
    console.log('updateDistrictOptions 호출됨, 선택된 시/도:', selectedCity)
    
    const districtSelect = document.getElementById('filterDistrict')
    const dongSelect = document.getElementById('filterDong')
    
    if (!districtSelect || !dongSelect) {
      console.error('filterDistrict 또는 filterDong 요소를 찾을 수 없습니다')
      return
    }
    
    // 구/군 드롭다운 초기화
    while (districtSelect.children.length > 1) {
      districtSelect.removeChild(districtSelect.lastChild)
    }
    
    // 동 드롭다운 초기화 및 비활성화
    while (dongSelect.children.length > 1) {
      dongSelect.removeChild(dongSelect.lastChild)
    }
    dongSelect.disabled = true
    
    if (selectedCity && this.locationData[selectedCity]) {
      // 구/군 활성화 및 옵션 추가
      districtSelect.disabled = false
      
      this.locationData[selectedCity].forEach(district => {
        const option = document.createElement('option')
        option.value = district
        option.textContent = district
        districtSelect.appendChild(option)
        console.log('구/군 옵션 추가됨:', district)
      })
      
      // 구/군 변경 이벤트 리스너 - bind 사용으로 this 컨텍스트 유지
      const boundHandler = (e) => {
        console.log('구/군 변경됨:', e.target.value)
        this.updateDongOptions(selectedCity, e.target.value)
      }
      
      // 기존 리스너 제거 후 새로 추가
      districtSelect.onchange = null
      districtSelect.addEventListener('change', boundHandler)
    } else {
      // 시/도가 선택되지 않은 경우 구/군 비활성화
      districtSelect.disabled = true
    }
  }

  // 동/읍/면 옵션 업데이트
  updateDongOptions(selectedCity, selectedDistrict) {
    console.log('updateDongOptions 호출됨, 시/도:', selectedCity, '구/군:', selectedDistrict)
    
    const dongSelect = document.getElementById('filterDong')
    
    if (!dongSelect) {
      console.error('filterDong 요소를 찾을 수 없습니다')
      return
    }
    
    // 동 드롭다운 초기화
    while (dongSelect.children.length > 1) {
      dongSelect.removeChild(dongSelect.lastChild)
    }
    
    if (selectedDistrict) {
      // 동 활성화 (실제 동 데이터는 없으므로 활성화만)
      dongSelect.disabled = false
      console.log('동/읍/면 드롭다운 활성화됨')
    } else {
      // 구/군이 선택되지 않은 경우 동 비활성화
      dongSelect.disabled = true
    }
  }
}

// 앱 초기화 - DOM 로드 완료 후 실행
let app = null

function initializeApp() {
  console.log('앱 초기화 시작')
  app = new PicoinMarket()
  window.app = app
  console.log('앱 초기화 완료')
}

// 전역 함수들
function toggleFilterSidebar() {
  if (window.app) {
    window.app.toggleFilterSidebar()
  }
}

function filterByCategory(categoryValue) {
  if (window.app) {
    window.app.handleCategoryFilter(categoryValue, event.target)
  }
}

function setPriceRange(minPrice, maxPrice) {
  if (window.app) {
    window.app.handlePriceFilter(minPrice, maxPrice, event.target)
  }
}

function setCondition(conditionValue) {
  if (window.app) {
    window.app.handleConditionFilter(conditionValue, event.target)
  }
}

// DOM이 로드되면 앱 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  // 이미 로드된 경우 즉시 실행
  initializeApp()
}