// π-coin 구매 페이지 JavaScript

class PiCoinPurchase {
  constructor() {
    this.currentUser = null
    this.packages = []
    this.selectedPackage = null
    this.selectedPaymentMethod = 'card'
    
    this.init()
  }

  init() {
    this.checkAuth()
    this.loadPackages()
    this.setupEventListeners()
  }

  // 인증 확인
  checkAuth() {
    const userData = localStorage.getItem('picoin_user')
    if (!userData) {
      this.showToast('로그인이 필요한 서비스입니다.', 'error')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
      return
    }
    
    this.currentUser = JSON.parse(userData)
    this.updateCurrentBalance()
  }

  // 현재 잔액 업데이트
  updateCurrentBalance() {
    const balanceElement = document.getElementById('currentBalance')
    balanceElement.textContent = `${this.formatNumber(this.currentUser.pi_coin_balance)} π-coin`
  }

  // 패키지 로드
  async loadPackages() {
    try {
      const response = await axios.get('/api/pi-coin/packages')
      if (response.data.success) {
        this.packages = response.data.packages
        this.piCoinPrice = response.data.piCoinPrice || 2.5
        this.marginPrice = response.data.marginPrice || 2.75
        this.lastUpdated = response.data.lastUpdated
        
        this.renderPackages()
        this.updatePriceInfo()
      }
    } catch (error) {
      console.error('패키지 로드 실패:', error)
      this.showToast('패키지 정보를 불러오는데 실패했습니다.', 'error')
    }
  }

  // 가격 정보 업데이트
  updatePriceInfo() {
    const priceInfoContainer = document.querySelector('.price-info-container')
    if (!priceInfoContainer) {
      // 가격 정보 컨테이너 추가
      const packageTitle = document.querySelector('h3')
      if (packageTitle) {
        const div = document.createElement('div')
        div.className = 'price-info-container bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'
        div.innerHTML = `
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center text-blue-700">
              <i class="fas fa-info-circle mr-2"></i>
              <span>실시간 π-coin 가격</span>
            </div>
            <div class="text-right">
              <div class="font-bold text-blue-800">1 π-coin = ${this.formatPrice(this.marginPrice)}원</div>
              <div class="text-xs text-blue-600">시장가 + 10% 마진</div>
            </div>
          </div>
          ${this.lastUpdated ? `
            <div class="mt-2 text-xs text-blue-600">
              마지막 업데이트: ${new Date(this.lastUpdated).toLocaleTimeString('ko-KR')}
            </div>
          ` : ''}
        `
        packageTitle.parentNode.insertBefore(div, packageTitle.nextSibling)
      }
    }
  }

  // 패키지 렌더링
  renderPackages() {
    const container = document.getElementById('packageList')
    container.innerHTML = ''

    this.packages.forEach(package_ => {
      const packageCard = this.createPackageCard(package_)
      container.appendChild(packageCard)
    })
  }

  // 패키지 카드 생성
  createPackageCard(package_) {
    const div = document.createElement('div')
    const isPopular = package_.is_popular === 1
    
    const coinValue = package_.amount
    const totalCoins = coinValue + (package_.bonus_amount || 0)
    const savings = package_.bonus_amount ? 0.1 : 0 // 0.1% 고정 보너스
    
    div.className = `package-card relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
      isPopular ? 'border-pi-orange shadow-lg' : 'border-gray-200 hover:border-pi-orange'
    }`
    
    div.innerHTML = `
      ${isPopular ? `
        <div class="popular-badge absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold shadow-lg">
          <i class="fas fa-star mr-1"></i>
          인기 패키지
        </div>
      ` : ''}
      
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-800 mb-1">${package_.name}</h3>
          <div class="flex items-center text-pi-orange font-bold text-lg">
            <span class="coin-icon w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">π</span>
            ${this.formatNumber(coinValue)} π-coin
          </div>
          <div class="mt-1 text-sm text-gray-600">${package_.description || ''}</div>
          ${package_.bonus_amount ? `
            <div class="mt-2 flex items-center">
              <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                <i class="fas fa-gift mr-1"></i>
                보너스 +${this.formatNumber(package_.bonus_amount)} π-coin
              </span>
            </div>
          ` : ''}
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-gray-800">
            ${this.formatPrice(package_.price)}원
          </div>
          <div class="text-sm text-gray-500">
            1 π-coin = ${this.formatPrice(this.marginPrice || 2.75)}원
          </div>
          <div class="text-xs text-blue-600">
            시장가 대비 +10%
          </div>
        </div>
      </div>

      <div class="space-y-2 mb-4">
        ${package_.bonus_amount ? `
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">기본 π-coin</span>
            <span class="font-medium">${this.formatNumber(coinValue)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-green-600">보너스 π-coin</span>
            <span class="text-green-600 font-medium">+${this.formatNumber(package_.bonus_amount)}</span>
          </div>
          <hr class="border-gray-200">
          <div class="flex justify-between font-bold">
            <span class="text-gray-800">총 π-coin</span>
            <span class="text-pi-orange">${this.formatNumber(totalCoins)}</span>
          </div>
        ` : `
          <div class="flex justify-between font-bold">
            <span class="text-gray-800">총 π-coin</span>
            <span class="text-pi-orange">${this.formatNumber(totalCoins)}</span>
          </div>
        `}
      </div>

      ${package_.bonus_amount > 0 ? `
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div class="flex items-center text-orange-800">
            <i class="fas fa-gift text-orange-500 mr-2"></i>
            <span class="text-sm font-medium">0.1% 보너스 π-coin 증정!</span>
          </div>
        </div>
      ` : ''}

      <button onclick="selectPackage(${package_.id})" class="purchase-button w-full py-3 rounded-xl font-bold text-white text-center">
        <i class="fas fa-shopping-cart mr-2"></i>
        구매하기
      </button>
    `
    
    return div
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 결제 방법 선택
    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.selectedPaymentMethod = e.target.value
        this.updatePaymentMethodUI()
      })
    })

    // 초기 결제 방법 UI 업데이트
    this.updatePaymentMethodUI()
  }

  // 결제 방법 UI 업데이트
  updatePaymentMethodUI() {
    document.querySelectorAll('.payment-method-card').forEach((card, index) => {
      const input = card.querySelector('input[type="radio"]')
      const indicator = card.querySelector('.method-indicator')
      
      if (input.checked) {
        card.classList.add('border-pi-orange', 'bg-orange-50')
        card.classList.remove('border-gray-200')
        indicator.classList.add('opacity-100')
      } else {
        card.classList.remove('border-pi-orange', 'bg-orange-50')
        card.classList.add('border-gray-200')
        indicator.classList.remove('opacity-100')
      }
    })
  }

  // 패키지 선택
  selectPackage(packageId) {
    this.selectedPackage = this.packages.find(p => p.id === packageId)
    if (!this.selectedPackage) return

    // 하단 시트 정보 업데이트
    document.getElementById('selectedPackageName').textContent = this.selectedPackage.name
    
    const totalCoins = this.selectedPackage.amount + (this.selectedPackage.bonus_amount || 0)
    document.getElementById('selectedPackageDetails').textContent = 
      `${this.formatNumber(totalCoins)} π-coin ${this.selectedPackage.bonus_amount ? `(보너스 +${this.formatNumber(this.selectedPackage.bonus_amount)})` : ''}`
    
    document.getElementById('selectedPackagePrice').textContent = this.formatPrice(this.selectedPackage.price)

    // 하단 시트 표시
    this.showPurchaseSheet()
  }

  // 구매 시트 표시
  showPurchaseSheet() {
    const sheet = document.getElementById('purchaseBottomSheet')
    sheet.classList.remove('hidden')
    setTimeout(() => {
      sheet.classList.remove('translate-y-full')
    }, 10)
  }

  // 구매 시트 숨김
  hidePurchaseSheet() {
    const sheet = document.getElementById('purchaseBottomSheet')
    sheet.classList.add('translate-y-full')
    setTimeout(() => {
      sheet.classList.add('hidden')
    }, 300)
  }

  // 구매 처리
  async processPurchase() {
    if (!this.selectedPackage) return

    try {
      // PG사 연동 여부 확인
      const paymentConfig = await this.checkPaymentConfig()
      
      if (paymentConfig.success && paymentConfig.isConfigured) {
        // 실제 PG사 결제 처리
        await this.processRealPayment()
      } else {
        // 테스트 모드: 고품질 팝업창 표시
        this.showTestModePopup()
      }
      
    } catch (error) {
      console.error('결제 처리 실패:', error)
      this.showToast('결제 처리 중 오류가 발생했습니다.', 'error')
    }
  }

  // 결제 설정 확인
  async checkPaymentConfig() {
    try {
      const response = await axios.get('/api/payment-status')
      return response.data
    } catch (error) {
      // 설정이 없으면 데모 모드로 처리
      return { success: true, isConfigured: false }
    }
  }

  // 실제 PG사 결제 처리
  async processRealPayment() {
    // 토스페이먼츠 또는 카카오페이 연동
    this.showToast('실제 결제 시스템으로 연결합니다...', 'info')
    
    // PG사별 결제 처리 로직
    switch(this.selectedPaymentMethod) {
      case 'toss':
        await this.processTossPayment()
        break
      case 'kakao':
        await this.processKakaoPayment()
        break
      case 'card':
        await this.processCardPayment()
        break
      default:
        throw new Error('지원하지 않는 결제 방법입니다.')
    }
  }

  // 고품질 테스트 모드 팝업창
  showTestModePopup() {
    // 기존 팝업이 있으면 제거
    const existingPopup = document.getElementById('testModePopup')
    if (existingPopup) {
      existingPopup.remove()
    }

    // 팝업 HTML 생성
    const popupHTML = `
      <div id="testModePopup" class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
        <div class="bg-white rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl animate-slideUp">
          <!-- 헤더 아이콘 -->
          <div class="text-center mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <i class="fas fa-flask text-white text-2xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">테스트 중입니다!</h2>
            <p class="text-gray-600 text-sm leading-relaxed">현재 결제 시스템이 테스트 모드로 운영되고 있습니다</p>
          </div>

          <!-- 내용 -->
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-200">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <i class="fas fa-info-circle text-amber-600 text-lg mt-0.5"></i>
              </div>
              <div>
                <h3 class="text-amber-800 font-semibold text-sm mb-2">안내사항</h3>
                <ul class="text-amber-700 text-sm space-y-1">
                  <li class="flex items-center">
                    <i class="fas fa-check text-amber-600 text-xs mr-2"></i>
                    실제 결제가 진행되지 않습니다
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-check text-amber-600 text-xs mr-2"></i>
                    관리자가 결제 설정 완료 후 정상 운영
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-check text-amber-600 text-xs mr-2"></i>
                    테스트용 π-coin은 지급되지 않습니다
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 버튼 영역 -->
          <div class="flex space-x-3">
            <button onclick="window.closeTestPopup()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200">
              확인
            </button>
            <button onclick="window.goToMainPage()" class="flex-1 bg-gradient-to-r from-pi-orange to-carrot-orange hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg">
              메인으로
            </button>
          </div>
        </div>
      </div>
    `

    // CSS 애니메이션 추가
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { 
          transform: translateY(30px); 
          opacity: 0; 
        }
        to { 
          transform: translateY(0); 
          opacity: 1; 
        }
      }
      @keyframes bounce-gentle {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
      .animate-slideUp {
        animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .animate-bounce-gentle {
        animation: bounce-gentle 2s infinite;
      }
    `
    document.head.appendChild(style)

    // 팝업을 DOM에 추가
    document.body.insertAdjacentHTML('beforeend', popupHTML)

    // 닫기 함수들을 전역으로 등록
    window.closeTestPopup = () => {
      const popup = document.getElementById('testModePopup')
      if (popup) {
        popup.style.animation = 'fadeIn 0.3s ease-out reverse'
        setTimeout(() => {
          popup.remove()
        }, 300)
      }
    }

    window.goToMainPage = () => {
      window.location.href = '/'
    }

    // ESC 키로 닫기
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        window.closeTestPopup()
        document.removeEventListener('keydown', handleEsc)
      }
    }
    document.addEventListener('keydown', handleEsc)

    // 배경 클릭으로 닫기
    const popup = document.getElementById('testModePopup')
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        window.closeTestPopup()
      }
    })
  }

  // 데모 결제 처리 (바로 지급)
  async processDemoPayment() {
    const response = await axios.post('/api/pi-coin/purchase', {
      userId: this.currentUser.id,
      packageId: this.selectedPackage.id,
      paymentMethod: this.selectedPaymentMethod
    })

    if (response.data.success) {
      // 잔액 업데이트
      this.currentUser.pi_coin_balance = response.data.newBalance
      localStorage.setItem('picoin_user', JSON.stringify(this.currentUser))
      this.updateCurrentBalance()

      this.showToast(`축하합니다! ${this.formatNumber(response.data.totalCoins)} π-coin이 충전되었습니다!`, 'success')
      
      this.hidePurchaseSheet()
      
      // 3초 후 메인 페이지로 이동
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    } else {
      this.showToast(response.data.error, 'error')
    }
  }

  // 토스페이 결제
  async processTossPayment() {
    // 토스페이먼츠 SDK 연동 코드
    this.showToast('토스페이로 결제를 진행합니다.', 'info')
    // 실제 구현 시 토스페이먼츠 위젯 호출
  }

  // 카카오페이 결제
  async processKakaoPayment() {
    // 카카오페이 SDK 연동 코드
    this.showToast('카카오페이로 결제를 진행합니다.', 'info')
    // 실제 구현 시 카카오페이 API 호출
  }

  // 신용카드 결제
  async processCardPayment() {
    // 일반 신용카드 결제 처리
    this.showToast('신용카드 결제를 진행합니다.', 'info')
    // 실제 구현 시 PG사 카드결제 API 호출
  }

  // 숫자 포맷팅
  formatNumber(num) {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  // 가격 포맷팅
  formatPrice(price) {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  // 토스트 메시지 표시
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer')
    const toast = document.createElement('div')
    
    const iconMap = {
      success: 'fa-check-circle text-green-500',
      error: 'fa-exclamation-circle text-red-500',
      info: 'fa-info-circle text-blue-500'
    }

    const bgMap = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      info: 'bg-blue-50 border-blue-200'
    }

    toast.className = `${bgMap[type]} border rounded-xl p-4 shadow-lg transform transition-all duration-300 ease-in-out translate-x-full opacity-0`
    
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${iconMap[type]} mr-3"></i>
        <span class="text-gray-800 font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    container.appendChild(toast)

    // 애니메이션
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0')
    }, 10)

    // 자동 제거
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0')
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove()
        }
      }, 300)
    }, 5000)
  }
}

// 전역 함수들
function selectPackage(packageId) {
  window.purchaseApp.selectPackage(packageId)
}

function closePurchaseSheet() {
  window.purchaseApp.hidePurchaseSheet()
}

function processPurchase() {
  window.purchaseApp.processPurchase()
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  window.purchaseApp = new PiCoinPurchase()
})