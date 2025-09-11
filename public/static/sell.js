// 상품 등록 페이지 JavaScript

class ProductSell {
  constructor() {
    this.currentUser = null
    this.categories = []
    this.uploadedImages = []
    this.maxImages = 3
    this.todayPostCount = 0
    
    this.init()
  }

  init() {
    this.checkAuth()
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

    // 가격 자동 계산 (원화 -> 파이코인)
    const priceInput = document.querySelector('input[name="price"]')
    const piPriceInput = document.querySelector('input[name="piPrice"]')
    
    priceInput.addEventListener('input', (e) => {
      const krwPrice = parseFloat(e.target.value) || 0
      const piPrice = (krwPrice / 10000).toFixed(1) // 1만원 = 1 파이코인 기준
      piPriceInput.value = piPrice
      this.validateForm()
    })

    piPriceInput.addEventListener('input', () => this.validateForm())
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

    if (this.todayPostCount >= 3) {
      this.showToast('오늘은 더 이상 상품을 등록할 수 없습니다.', 'error')
      return
    }

    if (this.uploadedImages.length === 0) {
      this.showToast('최소 1장의 사진을 업로드해야 합니다.', 'error')
      return
    }

    // 로딩 표시
    document.getElementById('loadingOverlay').classList.remove('hidden')
    document.getElementById('loadingOverlay').classList.add('flex')

    try {
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
    } catch (error) {
      console.error('상품 등록 실패:', error)
      this.showToast(error.response?.data?.error || '상품 등록에 실패했습니다.', 'error')
    } finally {
      document.getElementById('loadingOverlay').classList.add('hidden')
      document.getElementById('loadingOverlay').classList.remove('flex')
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