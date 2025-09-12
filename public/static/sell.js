// 상품 등록 페이지 JavaScript

class ProductSell {
  constructor() {
    this.currentUser = null
    this.categories = []
    this.uploadedImages = []
    this.maxImages = 3
    this.todayPostCount = 0
    this.piCoinPrice = 0.5 // 기본 파이코인 가격 (KRW)
    this.isEditMode = false
    this.editProductId = null
    this.editProductData = null
    
    this.init()
  }

  init() {
    this.checkAuth()
    this.checkEditMode() // 수정 모드 확인
    this.loadPiCoinPrice() // 파이코인 시세 로드
    this.loadCategories()
    this.checkTodayPostCount()
    this.setupEventListeners()
    this.setupImageUpload()
  }

  // 인증 확인
  checkAuth() {
    const userData = localStorage.getItem('picoin_user')
    if (!userData) {
      alert('로그인이 필요한 서비스입니다.')
      window.location.href = '/'
      return
    }
    this.currentUser = JSON.parse(userData)
  }

  // 수정 모드 확인
  async checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search)
    const editId = urlParams.get('edit')
    
    if (editId) {
      this.isEditMode = true
      this.editProductId = editId
      
      try {
        // 상품 정보 로드
        const response = await axios.get(`/api/products/${editId}`)
        if (response.data.success) {
          this.editProductData = response.data.product
          
          // 권한 확인
          const isOwner = this.editProductData.seller_id === this.currentUser.id
          const isAdmin = this.currentUser.email === '5321497@naver.com'
          
          if (!isOwner && !isAdmin) {
            alert('상품 수정 권한이 없습니다.')
            window.location.href = '/'
            return
          }
          
          // UI 업데이트
          this.updateUIForEditMode()
        } else {
          throw new Error(response.data.error)
        }
      } catch (error) {
        console.error('상품 정보 로드 실패:', error)
        alert('상품 정보를 불러올 수 없습니다.')
        window.location.href = '/'
      }
    }
  }

  // 수정 모드용 UI 업데이트
  updateUIForEditMode() {
    if (!this.isEditMode || !this.editProductData) return
    
    // 페이지 제목 변경
    document.title = '상품 수정 - 파이코인 당근 🥕'
    
    // 헤더 제목 변경
    const headerTitle = document.querySelector('.header-title')
    if (headerTitle) {
      headerTitle.textContent = '상품 수정'
    }
    
    // 제출 버튼 텍스트 변경
    const submitBtn = document.getElementById('submitBtn')
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-edit mr-2"></i>수정 완료'
    }
    
    // 폼에 기존 데이터 설정
    setTimeout(() => {
      this.fillFormWithExistingData()
    }, 500) // 카테고리 로드 후 실행
  }

  // 폼에 기존 데이터 채우기
  fillFormWithExistingData() {
    if (!this.editProductData) return
    
    const product = this.editProductData
    
    // 기본 정보 설정
    document.getElementById('productTitle').value = product.title
    document.getElementById('productDescription').value = product.description || ''
    document.getElementById('productPrice').value = product.price
    document.getElementById('productLocation').value = product.location || ''
    
    // 카테고리 설정
    const categorySelect = document.getElementById('productCategory')
    if (categorySelect && product.category_id) {
      categorySelect.value = product.category_id
    }
    
    // 상품 상태 설정
    const conditionSelect = document.getElementById('productCondition')
    if (conditionSelect && product.condition_type) {
      conditionSelect.value = product.condition_type
    }
    
    // 가격 정보 업데이트
    this.updatePriceInfo()
    
    // 기존 이미지 표시 (참고용)
    if (product.images && product.images.length > 0) {
      this.showExistingImages(product.images)
    }
  }

  // 기존 이미지 표시 (참고용)
  showExistingImages(images) {
    const previewContainer = document.getElementById('imagePreview')
    if (!previewContainer) return
    
    const existingImagesHtml = `
      <div class="mb-4 p-3 bg-blue-50 rounded-lg">
        <h4 class="text-sm font-medium text-blue-800 mb-2">현재 등록된 이미지</h4>
        <div class="grid grid-cols-3 gap-2">
          ${images.map((img, index) => `
            <div class="relative">
              <img src="${img.image_url}" alt="기존 이미지 ${index + 1}" 
                   class="w-full h-20 object-cover rounded border-2 border-blue-200">
              <div class="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded">
                ${index + 1}
              </div>
            </div>
          `).join('')}
        </div>
        <p class="text-xs text-blue-600 mt-2">
          새로운 이미지를 업로드하면 기존 이미지를 대체합니다.
        </p>
      </div>
    `
    
    previewContainer.insertAdjacentHTML('afterbegin', existingImagesHtml)
  }

  // 파이코인 시세 로드
  async loadPiCoinPrice() {
    try {
      const response = await axios.get('/api/pi-coin-price')
      if (response.data.success) {
        this.piCoinPrice = response.data.price
        this.updatePriceInfo()
        
        // 콘솔에 시세 정보 표시
        console.log('파이코인 시세:', this.piCoinPrice, 'KRW')
        if (response.data.cached) {
          console.log('(캐시된 데이터)')
        }
      }
    } catch (error) {
      console.error('파이코인 시세 로드 실패:', error)
      this.piCoinPrice = 0.5 // 기본값 설정
    }
  }

  // 가격 정보 업데이트
  updatePriceInfo() {
    // 파이코인 가격 정보 표시 (라벨에 추가)
    const piPriceLabel = document.querySelector('label[for="piPrice"], input[name="piPrice"]').closest('div').querySelector('label')
    if (piPriceLabel) {
      piPriceLabel.innerHTML = `파이코인 가격 * <span class="text-xs text-gray-500">(1π = ${this.formatPrice(this.piCoinPrice)}원)</span>`
    }
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

  // 가격 포맷팅
  formatPrice(price) {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  // 카테고리 로드
  async loadCategories() {
    try {
      const response = await axios.get('/api/categories')
      if (response.data.success) {
        this.categories = response.data.categories
        this.renderCategoryOptions()
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error)
    }
  }

  // 오늘 게시물 수 확인
  async checkTodayPostCount() {
    try {
      const response = await axios.get(`/api/user/${this.currentUser.id}/today-posts`)
      if (response.data.success) {
        this.todayPostCount = response.data.count
        document.getElementById('todayPostCount').textContent = this.todayPostCount
        
        // 3개 초과 시 등록 비활성화
        if (this.todayPostCount >= 3) {
          this.disableForm()
        }
      }
    } catch (error) {
      console.error('게시물 수 확인 실패:', error)
    }
  }

  // 폼 비활성화
  disableForm() {
    const form = document.getElementById('sellForm')
    const inputs = form.querySelectorAll('input, select, textarea, button')
    inputs.forEach(input => input.disabled = true)
    
    document.getElementById('saveBtn').textContent = '오늘 등록 한도 초과'
    document.getElementById('saveBtn').classList.add('cursor-not-allowed')
    
    this.showToast('오늘은 더 이상 상품을 등록할 수 없습니다. (3개 한도)', 'error')
  }

  // 카테고리 옵션 렌더링
  renderCategoryOptions() {
    const select = document.querySelector('select[name="categoryId"]')
    select.innerHTML = '<option value="">카테고리를 선택하세요</option>' + 
      this.categories.map(cat => 
        `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
      ).join('')
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 상태 선택
    document.querySelectorAll('input[name="condition"]').forEach(input => {
      input.addEventListener('change', (e) => {
        document.querySelectorAll('.condition-option').forEach(option => {
          option.classList.remove('border-pi-orange', 'bg-pi-orange', 'text-white')
          option.classList.add('border-gray-200', 'text-gray-700')
        })
        
        const selectedOption = e.target.parentElement.querySelector('.condition-option')
        selectedOption.classList.remove('border-gray-200', 'text-gray-700')
        selectedOption.classList.add('border-pi-orange', 'bg-pi-orange', 'text-white')
        
        this.validateForm()
      })
    })

    // 설명 글자 수
    const descTextarea = document.querySelector('textarea[name="description"]')
    descTextarea.addEventListener('input', (e) => {
      document.getElementById('descLength').textContent = e.target.value.length
      this.validateForm()
    })

    // 모든 필수 입력 필드
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]')
    requiredFields.forEach(field => {
      field.addEventListener('input', () => this.validateForm())
    })

    // 폼 제출
    document.getElementById('sellForm').addEventListener('submit', (e) => this.handleSubmit(e))
    document.getElementById('saveBtn').addEventListener('click', (e) => {
      e.preventDefault()
      this.handleSubmit(e)
    })

    // 가격 자동 계산 (실시간 파이코인 시세 적용)
    const priceInput = document.querySelector('input[name="price"]')
    const piPriceInput = document.querySelector('input[name="piPrice"]')
    
    // 원화 -> 파이코인 자동 계산
    priceInput.addEventListener('input', (e) => {
      const krwPrice = parseFloat(e.target.value) || 0
      const piPrice = this.convertKrwToPiCoin(krwPrice)
      piPriceInput.value = piPrice
      this.validateForm()
    })

    // 파이코인 -> 원화 자동 계산
    piPriceInput.addEventListener('input', (e) => {
      const piAmount = parseFloat(e.target.value) || 0
      const krwPrice = this.convertPiCoinToKrw(piAmount)
      priceInput.value = krwPrice
      this.validateForm()
    })
  }

  // 이미지 업로드 설정
  setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea')
    const imageInput = document.getElementById('imageInput')

    // 클릭 업로드
    uploadArea.addEventListener('click', () => imageInput.click())

    // 파일 선택
    imageInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files))

    // 드래그 앤 드롭
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('dragover')
    })

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover')
    })

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('dragover')
      this.handleFileSelect(e.dataTransfer.files)
    })
  }

  // 파일 선택 처리
  async handleFileSelect(files) {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        this.showToast('이미지 파일만 업로드 가능합니다.', 'error')
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        this.showToast('파일 크기는 10MB 이하여야 합니다.', 'error')
        return false
      }
      return true
    })

    if (this.uploadedImages.length + validFiles.length > this.maxImages) {
      this.showToast(`최대 ${this.maxImages}장까지만 업로드 가능합니다.`, 'error')
      return
    }

    // 이미지 압축 및 업로드
    for (const file of validFiles) {
      await this.compressAndUploadImage(file)
    }
  }

  // 이미지 압축 및 업로드
  async compressAndUploadImage(file) {
    try {
      // 진행률 표시
      const progressContainer = document.getElementById('uploadProgress')
      const progressBar = document.getElementById('progressBar')
      progressContainer.classList.remove('hidden')

      // Canvas를 이용한 이미지 압축
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      return new Promise((resolve) => {
        img.onload = () => {
          // 리사이즈 (최대 800x800)
          const maxSize = 800
          let { width, height } = img
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height)

          // JPG로 압축 (80% 품질)
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], `compressed_${file.name.replace(/\.[^/.]+$/, '')}.jpg`, {
              type: 'image/jpeg'
            })

            // 미리보기 추가
            this.addImagePreview(compressedFile, URL.createObjectURL(blob))
            
            progressBar.style.width = '100%'
            setTimeout(() => progressContainer.classList.add('hidden'), 1000)
            
            resolve()
          }, 'image/jpeg', 0.8)
        }

        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.error('이미지 압축 실패:', error)
      this.showToast('이미지 처리에 실패했습니다.', 'error')
    }
  }

  // 이미지 미리보기 추가
  addImagePreview(file, imageUrl) {
    const preview = document.createElement('div')
    preview.className = 'image-preview'
    preview.innerHTML = `
      <img src="${imageUrl}" alt="미리보기">
      <button type="button" class="remove-btn" onclick="productSell.removeImage(${this.uploadedImages.length})">
        <i class="fas fa-times"></i>
      </button>
    `

    document.getElementById('imagePreview').appendChild(preview)
    this.uploadedImages.push({ file, preview, url: imageUrl })
    this.validateForm()
  }

  // 이미지 제거
  removeImage(index) {
    const imageData = this.uploadedImages[index]
    if (imageData) {
      imageData.preview.remove()
      URL.revokeObjectURL(imageData.url)
      this.uploadedImages.splice(index, 1)
      
      // 인덱스 재정렬
      this.uploadedImages.forEach((img, i) => {
        const removeBtn = img.preview.querySelector('.remove-btn')
        removeBtn.setAttribute('onclick', `productSell.removeImage(${i})`)
      })
      
      this.validateForm()
    }
  }

  // 폼 유효성 검사
  validateForm() {
    const form = document.getElementById('sellForm')
    const formData = new FormData(form)
    
    const title = formData.get('title')?.trim()
    const categoryId = formData.get('categoryId')
    const condition = formData.get('condition')
    const price = formData.get('price')
    const piPrice = formData.get('piPrice')
    const description = formData.get('description')?.trim()

    const isValid = title && categoryId && condition && 
                   price && parseFloat(price) > 0 &&
                   piPrice && parseFloat(piPrice) > 0 &&
                   description && this.uploadedImages.length > 0

    const saveBtn = document.getElementById('saveBtn')
    const mobileSaveBtn = document.querySelector('.block.md\\:hidden button')
    
    saveBtn.disabled = !isValid
    if (mobileSaveBtn) mobileSaveBtn.disabled = !isValid
  }

  // 폼 제출 처리
  async handleSubmit(e) {
    e.preventDefault()

    // 수정 모드가 아닌 경우만 일일 게시물 제한 확인
    if (!this.isEditMode && this.todayPostCount >= 3) {
      this.showToast('오늘은 더 이상 상품을 등록할 수 없습니다.', 'error')
      return
    }

    // 수정 모드가 아닌 경우만 이미지 필수 확인
    if (!this.isEditMode && this.uploadedImages.length === 0) {
      this.showToast('최소 1장의 사진을 업로드해야 합니다.', 'error')
      return
    }

    // 로딩 표시
    document.getElementById('loadingOverlay').classList.remove('hidden')
    document.getElementById('loadingOverlay').classList.add('flex')

    try {
      if (this.isEditMode) {
        // 수정 모드
        await this.updateProduct()
      } else {
        // 등록 모드
        await this.createProduct()
      }
    } catch (error) {
      const action = this.isEditMode ? '수정' : '등록'
      console.error(`상품 ${action} 실패:`, error)
      this.showToast(error.response?.data?.error || `상품 ${action}에 실패했습니다.`, 'error')
    } finally {
      document.getElementById('loadingOverlay').classList.add('hidden')
      document.getElementById('loadingOverlay').classList.remove('flex')
    }
  }

  // 새 상품 등록
  async createProduct() {
    const form = document.getElementById('sellForm')
    const formData = new FormData(form)
    
    // 이미지 파일들 추가
    this.uploadedImages.forEach((imageData, index) => {
      formData.append(`image_${index}`, imageData.file)
    })

    formData.append('userId', this.currentUser.id)

    const response = await axios.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data.success) {
      this.showToast('상품이 성공적으로 등록되었습니다!', 'success')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } else {
      throw new Error(response.data.error)
    }
  }

  // 상품 수정
  async updateProduct() {
    const form = document.getElementById('sellForm')
    const formData = new FormData(form)
    
    // JSON 데이터로 수정 (이미지는 기존 이미지 유지, 새 업로드 시에만 변경)
    const updateData = {
      userId: this.currentUser.id,
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseInt(formData.get('price')),
      piPrice: Math.round(parseInt(formData.get('price')) / 1000),
      location: formData.get('location'),
      condition: formData.get('condition')
    }

    const response = await axios.put(`/api/products/${this.editProductId}`, updateData)

    if (response.data.success) {
      this.showToast('상품 정보가 성공적으로 수정되었습니다!', 'success')
      setTimeout(() => {
        // 상품 상세 페이지로 이동
        window.location.href = `/static/product.html?id=${this.editProductId}`
      }, 2000)
    } else {
      throw new Error(response.data.error)
    }
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
    }, 5000)
  }
}

// 페이지 로드 시 초기화
const productSell = new ProductSell()

// 전역 함수로 노출
window.productSell = productSell