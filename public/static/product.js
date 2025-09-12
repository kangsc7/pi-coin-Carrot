// 상품 상세 페이지 JavaScript

class ProductDetail {
  constructor() {
    this.currentUser = null
    this.product = null
    this.productId = null
    this.isLiked = false
    this.currentImageIndex = 0
    
    this.init()
  }

  init() {
    this.checkAuth()
    this.getProductIdFromUrl()
    this.setupEventListeners()
    this.loadProduct()
  }

  // 인증 확인
  checkAuth() {
    const userData = localStorage.getItem('picoin_user')
    if (userData) {
      this.currentUser = JSON.parse(userData)
    }
  }

  // URL에서 상품 ID 가져오기
  getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)
    this.productId = urlParams.get('id')
    
    if (!this.productId) {
      this.showNoProduct()
    }
  }

  // 상품 정보 로드
  async loadProduct() {
    if (!this.productId) return

    try {
      const response = await axios.get(`/api/products/${this.productId}`)
      if (response.data.success) {
        this.product = response.data.product
        this.renderProduct()
        this.checkIfLiked()
      } else {
        throw new Error(response.data.error)
      }
    } catch (error) {
      console.error('상품 로드 실패:', error)
      this.showNoProduct()
    }
  }

  // 좋아요 상태 확인
  async checkIfLiked() {
    if (!this.currentUser || !this.product) return

    try {
      // 간단히 좋아요 수만 표시 (실제로는 사용자별 좋아요 상태 확인 API 필요)
      // 여기서는 임시로 localStorage 확인
      const likedProducts = JSON.parse(localStorage.getItem('liked_products') || '[]')
      this.isLiked = likedProducts.includes(this.productId)
      this.updateLikeButtons()
    } catch (error) {
      console.error('좋아요 상태 확인 실패:', error)
    }
  }

  // 상품 정보 렌더링
  renderProduct() {
    // 로딩 상태 숨기기
    document.getElementById('loadingState').classList.add('hidden')
    document.getElementById('productDetail').classList.remove('hidden')
    document.getElementById('actionBar').classList.remove('hidden')

    // 이미지 갤러리 렌더링
    this.renderImageGallery()

    // 카테고리 및 상태
    document.getElementById('categoryBadge').textContent = 
      `${this.product.category_icon} ${this.product.category_name}`
    
    const conditionBadge = document.getElementById('conditionBadge')
    conditionBadge.textContent = this.getConditionText(this.product.condition_type)
    conditionBadge.className = `px-3 py-1 text-sm rounded-full status-${this.product.condition_type.replace('_', '-')}`

    // 기본 정보
    document.getElementById('productTitle').textContent = this.product.title
    document.getElementById('krwPrice').textContent = this.formatPrice(this.product.price) + '원'
    document.getElementById('piPrice').innerHTML = `
      <span class="pi-icon">π</span>
      <span class="font-bold text-pi-orange">${this.product.pi_coin_price}</span>
    `

    // 조회수, 좋아요, 시간
    document.getElementById('viewCount').textContent = `조회 ${this.product.view_count}`
    document.getElementById('likeCount').innerHTML = `
      <i class="fas fa-heart text-red-500 mr-1"></i>
      ${this.product.like_count || 0}
    `
    document.getElementById('timeAgo').textContent = this.timeAgo(this.product.created_at)

    // 위치
    if (this.product.location) {
      document.getElementById('locationInfo').innerHTML = `
        <i class="fas fa-map-marker-alt mr-2"></i>
        <span>${this.product.location}</span>
      `
    }

    // 설명
    document.getElementById('productDescription').textContent = this.product.description

    // 판매자 정보
    this.renderSellerInfo()

    // 권한에 따른 버튼 표시/숨김
    if (this.currentUser) {
      const isOwner = this.currentUser.id === this.product.seller_id
      const isAdmin = this.currentUser.email === '5321497@naver.com'
      
      // 자신의 상품인 경우 채팅 버튼 숨기기
      if (isOwner) {
        document.getElementById('chatBtn').style.display = 'none'
      }
      
      // 소유자이거나 관리자인 경우 수정 버튼 표시
      if (isOwner || isAdmin) {
        const editBtn = document.getElementById('editBtn')
        editBtn.classList.remove('hidden')
      }
    }
  }

  // 이미지 갤러리 렌더링
  renderImageGallery() {
    const imageGallery = document.getElementById('imageGallery')
    
    if (this.product.images && this.product.images.length > 0) {
      const mainImage = this.product.images[0]
      imageGallery.innerHTML = `
        <div class="aspect-square bg-gray-200">
          <img src="${mainImage.image_url}" 
               alt="${this.product.title}" 
               class="w-full h-full object-cover"
               onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center\\'>
                 <i class=\\'fas fa-image text-gray-400 text-6xl\\'></i>
               </div>'">
        </div>
      `

      // 여러 이미지가 있는 경우 썸네일 표시
      if (this.product.images.length > 1) {
        this.renderThumbnails()
      }
    } else {
      imageGallery.innerHTML = `
        <div class="aspect-square bg-gray-200 flex items-center justify-center">
          <i class="fas fa-image text-gray-400 text-6xl"></i>
        </div>
      `
    }
  }

  // 썸네일 렌더링
  renderThumbnails() {
    const thumbnails = document.getElementById('thumbnails')
    thumbnails.classList.remove('hidden')
    
    const thumbnailsContainer = thumbnails.querySelector('div')
    thumbnailsContainer.innerHTML = this.product.images.map((image, index) => `
      <button class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-pi-orange' : 'border-gray-200'}"
              onclick="productDetail.changeImage(${index})">
        <img src="${image.image_url}" 
             alt="썸네일 ${index + 1}" 
             class="w-full h-full object-cover"
             onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23f3f4f6\\'/></svg>'">
      </button>
    `).join('')
  }

  // 이미지 변경
  changeImage(index) {
    if (!this.product.images || index >= this.product.images.length) return
    
    this.currentImageIndex = index
    const mainImageContainer = document.querySelector('#imageGallery > div')
    const selectedImage = this.product.images[index]
    
    mainImageContainer.innerHTML = `
      <img src="${selectedImage.image_url}" 
           alt="${this.product.title}" 
           class="w-full h-full object-cover"
           onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center\\'>
             <i class=\\'fas fa-image text-gray-400 text-6xl\\'></i>
           </div>'">
    `

    // 썸네일 선택 상태 업데이트
    document.querySelectorAll('#thumbnails button').forEach((btn, i) => {
      btn.classList.toggle('border-pi-orange', i === index)
      btn.classList.toggle('border-gray-200', i !== index)
    })
  }

  // 판매자 정보 렌더링
  renderSellerInfo() {
    const sellerInfo = document.getElementById('sellerInfo')
    const sellerInitial = this.product.seller_name.charAt(0)
    
    sellerInfo.innerHTML = `
      <div class="w-12 h-12 bg-gradient-to-br from-pi-orange to-pi-yellow rounded-full flex items-center justify-center text-white font-bold text-lg">
        ${sellerInitial}
      </div>
      <div class="flex-1">
        <div class="font-medium text-gray-800">${this.product.seller_name}</div>
        <div class="text-sm text-gray-500">@${this.product.seller_username}</div>
      </div>
    `
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 좋아요 버튼들
    document.getElementById('likeBtn').addEventListener('click', () => this.toggleLike())
    document.getElementById('bottomLikeBtn').addEventListener('click', () => this.toggleLike())

    // 채팅 버튼
    document.getElementById('chatBtn').addEventListener('click', () => this.startChat())

    // 공유 버튼
    document.getElementById('shareBtn').addEventListener('click', () => this.shareProduct())

    // 수정 버튼
    const editBtn = document.getElementById('editBtn')
    if (editBtn) {
      editBtn.addEventListener('click', () => this.editProduct())
    }
  }

  // 좋아요 토글
  async toggleLike() {
    if (!this.currentUser) {
      this.showToast('로그인이 필요한 서비스입니다.', 'info')
      return
    }

    try {
      const response = await axios.post(`/api/products/${this.productId}/like`, {
        userId: this.currentUser.id
      })

      if (response.data.success) {
        this.isLiked = response.data.liked
        this.updateLikeButtons()
        
        // 좋아요 수 업데이트
        if (response.data.liked) {
          this.product.like_count = (this.product.like_count || 0) + 1
        } else {
          this.product.like_count = Math.max(0, (this.product.like_count || 0) - 1)
        }
        
        document.getElementById('likeCount').innerHTML = `
          <i class="fas fa-heart text-red-500 mr-1"></i>
          ${this.product.like_count}
        `

        // localStorage에도 저장
        const likedProducts = JSON.parse(localStorage.getItem('liked_products') || '[]')
        if (this.isLiked) {
          likedProducts.push(this.productId)
        } else {
          const index = likedProducts.indexOf(this.productId)
          if (index > -1) likedProducts.splice(index, 1)
        }
        localStorage.setItem('liked_products', JSON.stringify(likedProducts))

        this.showToast(response.data.message, 'success')
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error)
      this.showToast('좋아요 처리에 실패했습니다.', 'error')
    }
  }

  // 좋아요 버튼 상태 업데이트
  updateLikeButtons() {
    const likeBtn = document.getElementById('likeBtn')
    const bottomLikeBtn = document.getElementById('bottomLikeBtn')
    
    const iconClass = this.isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart'
    
    likeBtn.innerHTML = `<i class="${iconClass} text-xl"></i>`
    bottomLikeBtn.innerHTML = `<i class="${iconClass} text-xl"></i>`

    if (this.isLiked) {
      likeBtn.classList.add('heart-bounce')
      bottomLikeBtn.classList.add('heart-bounce')
      setTimeout(() => {
        likeBtn.classList.remove('heart-bounce')
        bottomLikeBtn.classList.remove('heart-bounce')
      }, 600)
    }
  }

  // 채팅 시작
  async startChat() {
    if (!this.currentUser) {
      this.showToast('로그인이 필요한 서비스입니다.', 'info')
      return
    }

    if (this.currentUser.id === this.product.seller_id) {
      this.showToast('자신의 상품입니다.', 'info')
      return
    }

    // 로딩 표시
    document.getElementById('loadingOverlay').classList.remove('hidden')
    document.getElementById('loadingOverlay').classList.add('flex')

    try {
      const response = await axios.post('/api/chat/room', {
        productId: this.product.id,
        buyerId: this.currentUser.id,
        sellerId: this.product.seller_id
      })

      if (response.data.success) {
        const chatRoom = response.data.chatRoom
        window.location.href = `/static/chat.html?room=${chatRoom.id}`
      } else {
        throw new Error(response.data.error)
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error)
      this.showToast('채팅방 생성에 실패했습니다.', 'error')
    } finally {
      document.getElementById('loadingOverlay').classList.add('hidden')
      document.getElementById('loadingOverlay').classList.remove('flex')
    }
  }

  // 상품 공유
  shareProduct() {
    const url = window.location.href
    const text = `${this.product.title} - 파이코인 마켓`

    if (navigator.share) {
      navigator.share({
        title: text,
        url: url
      }).catch(console.error)
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('상품 링크가 클립보드에 복사되었습니다.', 'success')
      }).catch(() => {
        this.showToast('링크 복사에 실패했습니다.', 'error')
      })
    }
  }

  // 상품 수정
  async editProduct() {
    if (!this.currentUser) {
      this.showToast('로그인이 필요한 서비스입니다.', 'info')
      return
    }

    const isOwner = this.currentUser.id === this.product.seller_id
    const isAdmin = this.currentUser.email === '5321497@naver.com'
    
    if (!isOwner && !isAdmin) {
      this.showToast('상품 수정 권한이 없습니다.', 'error')
      return
    }

    // 수정 페이지로 이동 (쿼리 파라미터에 수정할 상품 ID 포함)
    window.location.href = `/static/sell.html?edit=${this.productId}`
  }

  // 상품 없음 표시
  showNoProduct() {
    document.getElementById('loadingState').classList.add('hidden')
    document.getElementById('noProduct').classList.remove('hidden')
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

  // 토스트 알림
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

    setTimeout(() => toast.classList.add('show'), 100)
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }
}

// 페이지 로드 시 초기화
const productDetail = new ProductDetail()

// 전역 함수로 노출
window.productDetail = productDetail