// 관리자 대시보드 JavaScript

class AdminDashboard {
  constructor() {
    this.currentUser = null
    this.currentTab = 'dashboard'
    this.dashboardStats = {}
    this.products = []
    this.charts = {} // Chart.js 인스턴스 저장
    
    this.init()
  }

  init() {
    this.checkAdminAuth()
    this.setupEventListeners()
    this.loadDashboardStats()
    this.setupAnimations()
    this.autoRefresh()
  }

  // 관리자 인증 확인
  checkAdminAuth() {
    const userData = localStorage.getItem('picoin_user')
    if (!userData) {
      alert('로그인이 필요합니다.')
      window.location.href = '/'
      return
    }

    this.currentUser = JSON.parse(userData)
    
    // 관리자 권한 확인 (이메일 기반)
    if (this.currentUser.email !== '5321497@naver.com') {
      alert('관리자 권한이 없습니다.')
      window.location.href = '/'
      return
    }

    this.updateAdminInfo()
  }

  // 관리자 정보 업데이트
  updateAdminInfo() {
    const adminName = document.getElementById('adminName')
    const adminEmail = document.getElementById('adminEmail')
    
    if (adminName) adminName.textContent = this.currentUser.full_name
    if (adminEmail) adminEmail.textContent = this.currentUser.email
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    console.log('관리자 대시보드 이벤트 리스너 설정 중...')
    
    // 사이드바 메뉴 전환 (.nav-tab 클래스 사용)
    const navTabs = document.querySelectorAll('.nav-tab')
    console.log('네비게이션 탭 개수:', navTabs.length)
    
    navTabs.forEach((item, index) => {
      console.log(`탭 ${index}:`, item.dataset.tab)
      item.addEventListener('click', (e) => {
        e.preventDefault()
        console.log('탭 클릭됨:', item.dataset.tab)
        const tabName = item.dataset.tab
        if (tabName) {
          this.switchTab(tabName)
        }
      })
    })

    // 새로고침 버튼
    const refreshBtn = document.getElementById('refreshBtn')
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('새로고침 버튼 클릭됨')
        this.refreshCurrentTab()
      })
    }

    // 액션 모달 (존재하는 경우)
    const cancelAction = document.getElementById('cancelAction')
    const confirmAction = document.getElementById('confirmAction')
    
    if (cancelAction) cancelAction.addEventListener('click', () => this.hideActionModal())
    if (confirmAction) confirmAction.addEventListener('click', () => this.executeAction())

    // 상품 검색 필드 이벤트 (엔터키로 검색)
    const searchFields = ['productQuery', 'productEmail', 'productUsername']
    searchFields.forEach(fieldId => {
      const field = document.getElementById(fieldId)
      if (field) {
        field.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.searchProducts()
          }
        })
      }
    })

    // 날짜 필드 변경 시 자동 검색
    const dateField = document.getElementById('productDate')
    if (dateField) {
      dateField.addEventListener('change', () => {
        this.searchProducts()
      })
    }
  }

  // 탭 전환 (개선된 버전)
  switchTab(tabName) {
    console.log('탭 전환:', tabName)
    
    // 기존 탭이 있으면 우선 완전히 숨김
    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.add('hidden')
      section.classList.remove('animate-fade-in')
      section.style.display = 'none'
      section.style.opacity = '0'
    })
    
    // 사이드바 메뉴 활성화 상태 변경
    document.querySelectorAll('.nav-tab').forEach(item => {
      item.classList.remove('active', 'menu-active')
    })
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`)
    if (activeTab) {
      activeTab.classList.add('active', 'menu-active')
    }

    // 타겟 섹션 표시 (안정적인 방법)
    const targetSection = document.getElementById(`${tabName}-tab`)
    if (targetSection) {
      // 충분한 지연을 두어 브라우저가 처리할 시간 제공
      setTimeout(() => {
        // 대상 섹션 표시
        targetSection.style.display = 'block'
        targetSection.classList.remove('hidden')
        
        // 다시 한번 지연 후 애니메이션 시작
        setTimeout(() => {
          targetSection.classList.add('animate-fade-in')
          targetSection.style.opacity = '1'
        }, 50)
      }, 100)
      
      // 페이지 타이틀 업데이트
      this.updatePageTitle(tabName)
      this.currentTab = tabName
      
      // 탭별 데이터 로드 (충분한 지연 후)
      setTimeout(() => {
        switch (tabName) {
          case 'dashboard':
            this.loadDashboardStats()
            this.initializeCharts()
            break
          case 'products':
            this.searchProducts()
            break
          case 'purchases':
            this.loadPurchaseHistory()
            break
          case 'payment':
            this.loadPaymentSettings()
            break
          case 'users':
            this.loadUsers()
            break
          case 'reports':
            this.loadReports()
            break
          case 'chats':
            this.loadChats()
            break
          default:
            console.warn(`알 수 없는 탭: ${tabName}`)
        }
      }, 200)
    } else {
      console.warn(`탭 컨텐츠를 찾을 수 없습니다: ${tabName}-tab`)
    }
  }

  // 대시보드 통계 로드
  async loadDashboardStats() {
    try {
      const response = await axios.get('/api/admin/dashboard/stats')
      if (response.data.success) {
        const stats = response.data.stats
        
        // 통계 카드 업데이트 (애니메이션 효과와 함께)
        this.updateStatCard('totalUsers', stats.totalUsers || 1250)
        this.updateStatCard('totalProducts', stats.totalProducts || 89)
        this.updateStatCard('totalSales', stats.totalSales || 15750000, '₩')
        this.updateStatCard('pendingReports', stats.pendingReports || 5)
        
        // 성장률 업데이트
        this.updateGrowthRate('userGrowth', stats.userGrowth || 12.5)
        this.updateGrowthRate('productGrowth', stats.productGrowth || 8.3)
        this.updateGrowthRate('salesGrowth', stats.salesGrowth || 25.7)
        this.updateGrowthRate('reportGrowth', stats.reportGrowth || -15.2)
        
        this.dashboardStats = stats
      }
    } catch (error) {
      console.error('통계 로드 실패:', error)
      // 개발 중이므로 가상 데이터 사용
      this.updateStatCard('totalUsers', 1250)
      this.updateStatCard('totalProducts', 89)
      this.updateStatCard('totalSales', 15750000, '₩')
      this.updateStatCard('pendingReports', 5)
      
      this.updateGrowthRate('userGrowth', 12.5)
      this.updateGrowthRate('productGrowth', 8.3)
      this.updateGrowthRate('salesGrowth', 25.7)
      this.updateGrowthRate('reportGrowth', -15.2)
      
      console.log('가상 데이터로 대시보드 표시 중...')
    }
  }

  // 상품 검색
  async searchProducts() {
    try {
      // 로딩 표시
      const loadingElement = document.getElementById('productsLoading')
      const tableElement = document.getElementById('productsTable')
      
      if (loadingElement) {
        loadingElement.classList.remove('hidden')
      }
      
      if (tableElement) {
        tableElement.innerHTML = ''
      }

      const params = {
        query: document.getElementById('productQuery')?.value || '',
        date: document.getElementById('productDate')?.value || '',
        email: document.getElementById('productEmail')?.value || '',
        username: document.getElementById('productUsername')?.value || ''
      }

      const response = await axios.get('/api/admin/products/search', { params })
      if (response.data.success) {
        this.products = response.data.products
        this.renderProductsTable()
      } else {
        this.showToast('상품 검색에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('상품 검색 실패:', error)
      this.showToast('상품 검색에 실패했습니다.', 'error')
      
      // 에러 시에도 빈 테이블 표시
      this.products = []
      this.renderProductsTable()
    } finally {
      // 로딩 숨김
      const loadingElement = document.getElementById('productsLoading')
      if (loadingElement) {
        loadingElement.classList.add('hidden')
      }
    }
  }

  // 상품 테이블 렌더링
  renderProductsTable() {
    const tbody = document.getElementById('productsTable')
    const countElement = document.getElementById('productCount')
    
    if (countElement) countElement.textContent = this.products.length

    if (this.products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-gray-500">
            검색 결과가 없습니다.
          </td>
        </tr>
      `
      return
    }

    tbody.innerHTML = this.products.map(product => `
      <tr>
        <td class="font-mono text-sm">#${product.id}</td>
        <td>
          <div class="max-w-xs truncate" title="${product.title}">
            ${product.title}
          </div>
        </td>
        <td>
          <div>
            <div class="font-medium">${product.full_name}</div>
            <div class="text-xs text-gray-500">${product.email}</div>
          </div>
        </td>
        <td>
          <div class="text-sm">
            <div>₩${this.formatNumber(product.price)}</div>
            <div class="text-xs text-pi-orange">π${product.pi_coin_price}</div>
          </div>
        </td>
        <td class="text-sm text-gray-600">
          ${this.formatDate(product.created_at)}
        </td>
        <td>
          <span class="status-badge status-${product.status}">
            ${this.getStatusText(product.status)}
          </span>
        </td>
        <td class="text-center">
          ${product.report_count > 0 ? 
            `<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              ${product.report_count}건
            </span>` : 
            '<span class="text-gray-400">없음</span>'
          }
        </td>
        <td>
          <div class="flex space-x-1">
            <button onclick="window.open('/static/product.html?id=${product.id}')" class="action-btn view" title="상품 보기">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="adminDashboard.showProductAction(${product.id}, 'hide')" class="action-btn hide" title="숨기기">
              <i class="fas fa-eye-slash"></i>
            </button>
            <button onclick="adminDashboard.showProductAction(${product.id}, 'delete')" class="action-btn delete" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('')
  }

  // 상품 액션 모달 표시
  showProductAction(productId, action) {
    const product = this.products.find(p => p.id === productId)
    if (!product) return

    const modal = document.getElementById('actionModal')
    const title = document.getElementById('actionTitle')
    const content = document.getElementById('actionContent')
    const confirmBtn = document.getElementById('confirmAction')

    const actionTexts = {
      hide: { title: '상품 숨기기', action: '숨기기', color: 'bg-yellow-500 hover:bg-yellow-600' },
      delete: { title: '상품 삭제', action: '삭제', color: 'bg-red-500 hover:bg-red-600' }
    }

    title.textContent = actionTexts[action].title
    confirmBtn.className = `flex-1 px-4 py-2 text-white rounded-lg ${actionTexts[action].color}`

    content.innerHTML = `
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="font-medium text-gray-800 mb-2">${product.title}</div>
        <div class="text-sm text-gray-600">
          판매자: ${product.full_name} (${product.email})
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">사유</label>
        <textarea id="actionReason" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pi-orange" 
                  rows="3" placeholder="${actionTexts[action].action} 사유를 입력하세요"></textarea>
      </div>
    `

    modal.classList.remove('hidden')
    modal.classList.add('flex')

    // 액션 정보 저장
    modal.dataset.productId = productId
    modal.dataset.action = action
  }

  // 액션 실행
  async executeAction() {
    const modal = document.getElementById('actionModal')
    const productId = modal.dataset.productId
    const action = modal.dataset.action
    const reason = document.getElementById('actionReason').value.trim()

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
        this.showToast(response.data.message, 'success')
        this.hideActionModal()
        this.searchProducts() // 목록 새로고침
      } else {
        this.showToast(response.data.error, 'error')
      }
    } catch (error) {
      console.error('액션 실행 실패:', error)
      this.showToast('작업 처리 중 오류가 발생했습니다.', 'error')
    }
  }

  // 액션 모달 숨기기
  hideActionModal() {
    const modal = document.getElementById('actionModal')
    modal.classList.add('hidden')
    modal.classList.remove('flex')
  }

  // 상품 필터 초기화
  resetProductFilters() {
    document.getElementById('productQuery').value = ''
    document.getElementById('productDate').value = ''
    document.getElementById('productEmail').value = ''
    document.getElementById('productUsername').value = ''
    this.searchProducts()
  }

  // π-coin 구매 내역 로드
  async loadPurchaseHistory() {
    try {
      // 전체 구매 내역을 가져오는 API가 필요함 (구현 예정)
      const purchasesList = document.getElementById('purchasesList')
      if (purchasesList) {
        purchasesList.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-coins text-4xl mb-4"></i>
            <p>π-coin 구매 내역 기능을 준비중입니다.</p>
          </div>
        `
      }
    } catch (error) {
      console.error('구매 내역 로드 실패:', error)
    }
  }

  // 통계 카드 업데이트 (애니메이션 효과)
  updateStatCard(elementId, value, prefix = '') {
    const element = document.getElementById(elementId)
    if (!element) return
    
    const formattedValue = prefix + this.formatNumber(value)
    
    // 카운터 애니메이션
    const currentValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0
    const increment = Math.ceil((value - currentValue) / 30)
    
    let current = currentValue
    const timer = setInterval(() => {
      current += increment
      if ((increment > 0 && current >= value) || (increment < 0 && current <= value)) {
        current = value
        clearInterval(timer)
      }
      element.textContent = prefix + this.formatNumber(current)
    }, 50)
  }

  // 성장률 업데이트
  updateGrowthRate(elementId, rate) {
    const element = document.getElementById(elementId)
    if (!element) return
    
    const isPositive = rate >= 0
    const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down'
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600'
    
    element.innerHTML = `
      <i class="fas ${icon} ${colorClass}"></i>
      <span class="${colorClass}">${Math.abs(rate).toFixed(1)}%</span>
    `
  }

  // 차트 초기화
  initializeCharts() {
    // 매출 추이 차트
    this.initSalesChart()
    // 사용자 활동 차트
    this.initUserActivityChart()
  }

  // 매출 추이 차트
  initSalesChart() {
    const ctx = document.getElementById('salesChart')
    if (!ctx) return

    if (this.charts.sales) {
      this.charts.sales.destroy()
    }

    this.charts.sales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월'],
        datasets: [{
          label: '매출액 (만원)',
          data: [120, 190, 300, 500, 200, 300, 450],
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
  }

  // 사용자 활동 차트
  initUserActivityChart() {
    const ctx = document.getElementById('userActivityChart')
    if (!ctx) return

    if (this.charts.userActivity) {
      this.charts.userActivity.destroy()
    }

    this.charts.userActivity = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['활성 사용자', '신규 사용자', '휴면 사용자'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)', 
            'rgb(156, 163, 175)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    })
  }

  // 애니메이션 설정
  setupAnimations() {
    // 카드 호버 효과
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)'
      })
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)'
      })
    })

    // 페이지 로드 시 fade-in 애니메이션
    setTimeout(() => {
      document.querySelectorAll('.animate-fade-in').forEach((el, index) => {
        setTimeout(() => {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, index * 100)
      })
    }, 100)
  }

  // 사용자 관리 기능들
  async loadUsers() {
    try {
      console.log('사용자 목록 로드 중...')
    } catch (error) {
      console.error('사용자 로드 실패:', error)
    }
  }

  // 신고 관리 기능들
  async loadReports() {
    try {
      console.log('신고 목록 로드 중...')
    } catch (error) {
      console.error('신고 로드 실패:', error)
    }
  }

  // PG사 설정 로드
  async loadPaymentSettings() {
    try {
      const response = await axios.get('/api/admin/payment-settings')
      if (response.data.success) {
        const settings = response.data.settings
        
        // 설정값들을 폼에 반영
        settings.forEach(setting => {
          switch(setting.setting_key) {
            case 'pg_enabled':
              const pgSwitch = document.getElementById('pgEnabledSwitch')
              if (pgSwitch) {
                pgSwitch.checked = setting.setting_value === 'true'
                this.updatePgStatus(setting.setting_value === 'true')
              }
              break
            case 'pg_test_mode':
              const testSwitch = document.getElementById('testModeSwitch')
              if (testSwitch) testSwitch.checked = setting.setting_value === 'true'
              break
            case 'toss_client_key':
              const tossKey = document.getElementById('tossClientKey')
              if (tossKey) tossKey.value = setting.setting_value
              break
            case 'kakao_cid':
              const kakaoCid = document.getElementById('kakaoCid')
              if (kakaoCid) kakaoCid.value = setting.setting_value
              break
          }
        })
      }
    } catch (error) {
      console.error('PG사 설정 로드 실패:', error)
      this.showToast('설정을 불러오는데 실패했습니다.', 'error')
    }
  }

  // PG사 상태 업데이트
  updatePgStatus(enabled) {
    const statusElement = document.getElementById('pgStatus')
    if (statusElement) {
      if (enabled) {
        statusElement.className = 'px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'
        statusElement.textContent = '활성화'
      } else {
        statusElement.className = 'px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'
        statusElement.textContent = '비활성화'
      }
    }
  }

  // 페이지 타이틀 업데이트
  updatePageTitle(tabName) {
    const titleElement = document.getElementById('pageTitle')
    const subtitleElement = document.getElementById('pageSubtitle')
    
    const titles = {
      dashboard: { title: '대시보드', subtitle: '시스템 현황을 한눈에 확인하세요' },
      products: { title: '상품 관리', subtitle: '등록된 상품을 관리하고 모니터링하세요' },
      users: { title: '사용자 관리', subtitle: '사용자 정보를 확인하고 관리하세요' },
      purchases: { title: 'π-coin 판매', subtitle: 'π-coin 구매 내역을 확인하세요' },
      chats: { title: '고객 문의', subtitle: '사용자 문의사항을 확인하고 답변하세요' },
      payment: { title: '결제 설정', subtitle: 'PG사 연동 및 결제 옵션을 설정하세요' },
      reports: { title: '리포트', subtitle: '상세한 통계 및 분석 리포트를 확인하세요' }
    }
    
    if (titleElement && subtitleElement && titles[tabName]) {
      titleElement.textContent = titles[tabName].title
      subtitleElement.textContent = titles[tabName].subtitle
    }
  }

  // 현재 탭 새로고침
  refreshCurrentTab() {
    console.log(`Refreshing ${this.currentTab} tab...`)
    
    // 새로고침 버튼 애니메이션
    const refreshBtn = document.getElementById('refreshBtn')
    if (refreshBtn) {
      const icon = refreshBtn.querySelector('i')
      icon.classList.add('animate-spin')
      setTimeout(() => {
        icon.classList.remove('animate-spin')
      }, 1000)
    }

    // 현재 탭에 따라 적절한 데이터 새로고침
    switch (this.currentTab) {
      case 'dashboard':
        this.loadDashboardStats()
        this.initializeCharts()
        break
      case 'products':
        this.searchProducts()
        break
      case 'purchases':
        this.loadPurchaseHistory()
        break
      case 'payment':
        this.loadPaymentSettings()
        break
      case 'users':
        this.loadUsers()
        break
      case 'reports':
        this.loadReports()
        break
      case 'chats':
        this.loadChats()
        break
    }
    
    this.showToast('페이지가 새로고침되었습니다.', 'success')
  }

  // 채팅 관리 기능
  async loadChats() {
    try {
      console.log('채팅 목록 로드 중...')
    } catch (error) {
      console.error('채팅 로드 실패:', error)
    }
  }

  // 자동 새로고침 (30초마다 통계 업데이트)
  autoRefresh() {
    setInterval(() => {
      if (this.currentTab === 'dashboard') {
        this.loadDashboardStats()
      }
    }, 30000) // 30초
  }

  // PG사 설정 저장
  async savePaymentSettings() {
    try {
      // 폼에서 값 수집
      const tossClientKey = document.getElementById('tossClientKey')?.value.trim() || ''
      const tossSecretKey = document.getElementById('tossSecretKey')?.value.trim() || ''
      const kakaoClientKey = document.getElementById('kakaoCid')?.value.trim() || ''
      const kakaoSecretKey = document.getElementById('kakaoSecretKey')?.value.trim() || ''

      // 검증
      if (!tossClientKey && !kakaoClientKey) {
        this.showToast('최소 하나의 결제 수단 설정이 필요합니다.', 'error')
        return
      }

      const response = await axios.post('/api/payment-settings', {
        userId: this.currentUser.id,
        tossClientKey: tossClientKey,
        tossSecretKey: tossSecretKey,
        kakaoClientKey: kakaoClientKey,
        kakaoSecretKey: kakaoSecretKey
      })

      if (response.data.success) {
        this.showToast('결제 설정이 성공적으로 저장되었습니다.', 'success')
        
        // 상태 업데이트
        this.updatePgStatus(true)
        
        // 비밀번호 필드 초기화 (보안)
        const tossSecretKeyField = document.getElementById('tossSecretKey')
        const kakaoSecretKeyField = document.getElementById('kakaoSecretKey')
        if (tossSecretKeyField) tossSecretKeyField.value = '••••••••'
        if (kakaoSecretKeyField) kakaoSecretKeyField.value = '••••••••'
      } else {
        this.showToast(response.data.error, 'error')
      }
    } catch (error) {
      console.error('결제 설정 저장 실패:', error)
      this.showToast('설정 저장 중 오류가 발생했습니다.', 'error')
    }
  }

  // PG사 연결 테스트
  async testPaymentConnection() {
    try {
      this.showToast('결제 연동 상태를 테스트하고 있습니다...', 'info')
      
      const tossKey = document.getElementById('tossClientKey')?.value.trim() || ''
      const kakaoKey = document.getElementById('kakaoCid')?.value.trim() || ''
      
      let testResults = []
      
      // 토스페이먼츠 테스트
      if (tossKey) {
        try {
          const response = await axios.post('/api/payment-test', {
            userId: this.currentUser.id,
            provider: 'toss'
          })
          
          if (response.data.success) {
            testResults.push('✅ 토스페이먼츠: 연결 성공')
          } else {
            testResults.push('❌ 토스페이먼츠: ' + response.data.error)
          }
        } catch (error) {
          testResults.push('❌ 토스페이먼츠: 연결 실패')
        }
      }
      
      // 카카오페이 테스트
      if (kakaoKey) {
        try {
          const response = await axios.post('/api/payment-test', {
            userId: this.currentUser.id,
            provider: 'kakao'
          })
          
          if (response.data.success) {
            testResults.push('✅ 카카오페이: 연결 성공')
          } else {
            testResults.push('❌ 카카오페이: ' + response.data.error)
          }
        } catch (error) {
          testResults.push('❌ 카카오페이: 연결 실패')
        }
      }
      
      if (testResults.length === 0) {
        this.showToast('설정된 결제 수단이 없습니다.', 'error')
        return
      }
      
      // 결과 표시
      setTimeout(() => {
        const allSuccess = testResults.every(result => result.startsWith('✅'))
        const message = `연결 테스트 완료:\n${testResults.join('\n')}`
        
        if (allSuccess) {
          this.showToast(message + '\n\n🎉 모든 결제 연동이 완료되었습니다!', 'success')
          // PG 상태를 활성화로 업데이트
          this.updatePgStatus(true)
        } else {
          this.showToast(message, 'warning')
        }
      }, 1500)
      
    } catch (error) {
      console.error('결제 연결 테스트 실패:', error)
      this.showToast('연결 테스트 중 오류가 발생했습니다.', 'error')
    }
  }

  // PG사 설정 초기화
  resetPaymentSettings() {
    if (confirm('모든 PG사 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const pgEnabledSwitch = document.getElementById('pgEnabledSwitch')
      const testModeSwitch = document.getElementById('testModeSwitch')
      const tossClientKey = document.getElementById('tossClientKey')
      const tossSecretKey = document.getElementById('tossSecretKey')
      const kakaoCid = document.getElementById('kakaoCid')
      const kakaoSecretKey = document.getElementById('kakaoSecretKey')

      if (pgEnabledSwitch) pgEnabledSwitch.checked = false
      if (testModeSwitch) testModeSwitch.checked = true
      if (tossClientKey) tossClientKey.value = ''
      if (tossSecretKey) tossSecretKey.value = ''
      if (kakaoCid) kakaoCid.value = ''
      if (kakaoSecretKey) kakaoSecretKey.value = ''
      
      this.updatePgStatus(false)
      this.showToast('PG사 설정이 초기화되었습니다.', 'info')
    }
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

  // 유틸리티 함수들
  formatNumber(num) {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  getStatusText(status) {
    const statusMap = {
      'active': '판매중',
      'sold': '판매완료', 
      'reserved': '예약중',
      'hidden': '숨김',
      'deleted': '삭제됨'
    }
    return statusMap[status] || status
  }
}

// CSS 스타일 추가 (현대적 대시보드 스타일)
const style = document.createElement('style')
style.textContent = `
  /* 사이드바 메뉴 스타일 */
  .menu-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(4px);
  }
  
  .menu-item.menu-active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .menu-item.menu-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: white;
    border-radius: 0 2px 2px 0;
  }
  
  /* 상태 배지 스타일 */
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .status-active {
    background-color: #dcfce7;
    color: #166534;
  }
  
  .status-sold {
    background-color: #e0e7ff;
    color: #3730a3;
  }
  
  .status-reserved {
    background-color: #fef3c7;
    color: #92400e;
  }
  
  .status-hidden {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  .status-deleted {
    background-color: #fee2e2;
    color: #991b1b;
  }
  
  /* 카드 호버 효과 */
  .stat-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  /* 페이드인 애니메이션 */
  .animate-fade-in {
    animation: fadeInUp 0.4s ease-out forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .tab-content {
    display: block;
    opacity: 1;
    transition: all 0.3s ease-in-out;
    transform: translateY(0);
  }
  
  .tab-content.hidden {
    display: none !important;
    opacity: 0;
    transform: translateY(10px);
  }
  
  /* 탭 전환 애니메이션 개선 */
  .tab-content.animate-fade-in {
    animation: smoothFadeIn 0.4s ease-out forwards;
  }
  
  @keyframes smoothFadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    50% {
      opacity: 0.5;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 토스트 스타일 */
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #3b82f6;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
    max-width: 400px;
  }
  
  .toast.show {
    transform: translateX(0);
    opacity: 1;
  }
  
  .toast.success {
    border-left-color: #10b981;
  }
  
  .toast.error {
    border-left-color: #ef4444;
  }
  
  /* 차트 컨테이너 */
  .chart-container {
    position: relative;
    height: 300px;
  }

  /* 액션 버튼 스타일 */
  .action-btn {
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
    border: 1px solid transparent;
  }
  
  .action-btn.view {
    color: #059669;
    background-color: #f0fdfa;
  }
  
  .action-btn.view:hover {
    background-color: #059669;
    color: white;
  }
  
  .action-btn.hide {
    color: #d97706;
    background-color: #fffbeb;
  }
  
  .action-btn.hide:hover {
    background-color: #d97706;
    color: white;
  }
  
  .action-btn.delete {
    color: #dc2626;
    background-color: #fef2f2;
  }
  
  .action-btn.delete:hover {
    background-color: #dc2626;
    color: white;
  }
`
document.head.appendChild(style)

// 전역 함수들 (HTML에서 직접 호출되는 함수들)
function savePaymentSettings() {
  if (window.adminDashboard) {
    window.adminDashboard.savePaymentSettings()
  }
}

function testPaymentConnection() {
  if (window.adminDashboard) {
    window.adminDashboard.testPaymentConnection()
  }
}

function resetPaymentSettings() {
  if (window.adminDashboard) {
    window.adminDashboard.resetPaymentSettings()
  }
}

// 앱 초기화
let adminDashboard

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 로드 완료, 관리자 대시보드 초기화 중...')
  
  // AdminDashboard 인스턴스 생성
  adminDashboard = new AdminDashboard()
  window.adminDashboard = adminDashboard
  
  // 페이지 로드 시 기본 대시보드 탭 활성화
  setTimeout(() => {
    console.log('대시보드 탭으로 전환 중...')
    if (adminDashboard) {
      adminDashboard.switchTab('dashboard')
    } else {
      console.error('adminDashboard 객체를 찾을 수 없습니다.')
    }
  }, 200)
})

// 페이지가 완전히 로드된 후에도 한 번 더 확인
window.addEventListener('load', () => {
  console.log('페이지 완전 로드, 관리자 대시보드 재확인...')
  if (window.adminDashboard) {
    // 이벤트 리스너 재설정 (안전장치)
    adminDashboard.setupEventListeners()
  }
})