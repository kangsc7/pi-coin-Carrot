// 게시판 JavaScript

class BoardManager {
  constructor() {
    this.currentPage = 1
    this.currentCategory = 'all'
    this.currentSearch = ''
    this.posts = []
    this.currentUser = null
    this.init()
  }

  init() {
    this.checkAuth()
    this.setupEventListeners()
    this.loadPosts()
    this.loadStats()
  }

  // 사용자 인증 확인
  checkAuth() {
    const userData = localStorage.getItem('picoin_user')
    if (userData) {
      this.currentUser = JSON.parse(userData)
      // 로그인된 경우 글쓰기 버튼 활성화
      const writeBtn = document.getElementById('writeBtn')
      if (writeBtn) {
        writeBtn.classList.remove('hidden')
      }
    } else {
      // 로그인하지 않은 경우 글쓰기 버튼 비활성화
      const writeBtn = document.getElementById('writeBtn')
      if (writeBtn) {
        writeBtn.onclick = () => {
          alert('로그인이 필요한 서비스입니다.')
          window.location.href = '/'
        }
      }
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 검색 엔터키 이벤트
    const searchInput = document.getElementById('searchInput')
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchPosts()
        }
      })
    }

    // 글쓰기 폼 제출 이벤트
    const writeForm = document.getElementById('writeForm')
    if (writeForm) {
      writeForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.submitPost(e)
      })
    }

    // 카테고리 필터 버튼 활성화 표시
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        // 모든 탭에서 active 클래스 제거
        document.querySelectorAll('.filter-tab').forEach(t => {
          t.classList.remove('active', 'bg-pi-orange', 'text-white')
          t.classList.add('bg-gray-200', 'text-gray-700')
        })
        
        // 클릭된 탭에 active 클래스 추가
        e.target.classList.add('active', 'bg-pi-orange', 'text-white')
        e.target.classList.remove('bg-gray-200', 'text-gray-700')
      })
    })
  }

  // 통계 로드
  async loadStats() {
    try {
      const response = await axios.get('/api/posts?limit=1')
      if (response.data.success) {
        const stats = response.data.stats
        document.getElementById('totalPosts').textContent = stats.total || 0
        document.getElementById('todayPosts').textContent = stats.today || 0
      }
    } catch (error) {
      console.error('통계 로드 실패:', error)
    }
  }

  // 게시글 목록 로드
  async loadPosts(page = 1, category = 'all', search = '', append = false) {
    try {
      this.currentPage = page
      this.currentCategory = category
      this.currentSearch = search

      let url = `/api/posts?page=${page}&limit=50`
      if (category && category !== 'all') {
        url += `&category=${category}`
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      const response = await axios.get(url)
      if (response.data.success) {
        if (append) {
          // 기존 게시글에 추가
          this.posts = this.posts.concat(response.data.posts)
        } else {
          // 새로 로드
          this.posts = response.data.posts
        }
        this.renderPosts()
        this.renderPagination(response.data.pagination)
        
        // 통계 업데이트
        const stats = response.data.stats
        document.getElementById('totalPosts').textContent = stats.total || 0
        document.getElementById('todayPosts').textContent = stats.today || 0
      } else {
        this.showError('게시글을 불러올 수 없습니다.')
      }
    } catch (error) {
      console.error('게시글 로드 실패:', error)
      this.showError('게시글을 불러오는 중 오류가 발생했습니다.')
    }
  }

  // 게시글 목록 렌더링
  renderPosts() {
    const container = document.getElementById('postsList')
    if (!this.posts || this.posts.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16">
          <div class="text-gray-400 mb-4">
            <i class="fas fa-comments text-6xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-600 mb-2">게시글이 없습니다</h3>
          <p class="text-gray-500">첫 번째 글을 작성해보세요!</p>
          ${this.currentUser ? `
            <button onclick="openWriteModal()" class="mt-4 px-6 py-3 bg-pi-orange text-white rounded-xl hover:bg-orange-600 transition-colors">
              <i class="fas fa-pen mr-2"></i>첫 글 작성하기
            </button>
          ` : ''}
        </div>
      `
      return
    }

    const postsHTML = this.posts.map(post => this.createPostHTML(post)).join('')
    container.innerHTML = postsHTML
  }

  // 게시글 카드 HTML 생성
  createPostHTML(post) {
    const categoryInfo = this.getCategoryInfo(post.category)
    const isHot = post.is_hot || post.like_count >= 10 || post.comment_count >= 5
    const createdDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // 사용자 권한 확인
    const canEdit = this.currentUser && (
      this.currentUser.id === post.author_id || 
      this.currentUser.email === '5321497@naver.com'
    )

    return `
      <article class="board-card bg-white rounded-2xl p-6 cursor-pointer" onclick="openPostModal(${post.id})">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- 게시글 헤더 -->
            <div class="flex items-center space-x-2 mb-3">
              ${isHot ? '<span class="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-bold animate-pulse"><i class="fas fa-fire mr-1"></i>HOT</span>' : ''}
              <span class="${categoryInfo.bgColor} ${categoryInfo.textColor} text-xs px-3 py-1 rounded-full font-bold">
                <i class="${categoryInfo.icon} mr-1"></i>${categoryInfo.name}
              </span>
              <span class="text-gray-500 text-sm">${createdDate}</span>
            </div>

            <!-- 게시글 제목 -->
            <h2 class="text-xl font-bold text-gray-800 mb-2 hover:text-pi-orange transition-colors line-clamp-2">
              ${post.title}
            </h2>

            <!-- 게시글 내용 미리보기 -->
            <p class="text-gray-600 mb-4 line-clamp-3">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>

            <!-- 게시글 이미지 -->
            ${post.image_url ? `
              <div class="mb-4">
                <img src="${post.image_url}" alt="게시글 이미지" class="w-full h-48 object-cover rounded-xl" onerror="this.style.display='none'">
              </div>
            ` : ''}

            <!-- 게시글 통계 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span class="flex items-center">
                  <i class="fas fa-user mr-1"></i>
                  ${post.author_full_name || post.author_name}
                </span>
                <span class="flex items-center">
                  <i class="fas fa-eye mr-1"></i>
                  ${post.view_count || 0}
                </span>
                <span class="flex items-center">
                  <i class="fas fa-heart mr-1"></i>
                  ${post.like_count || 0}
                </span>
                <span class="flex items-center">
                  <i class="fas fa-comment mr-1"></i>
                  ${post.comment_count || 0}
                </span>
              </div>

              ${canEdit ? `
                <div class="flex items-center space-x-2">
                  <button onclick="event.stopPropagation(); editPost(${post.id})" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="수정">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="event.stopPropagation(); deletePost(${post.id})" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors" title="삭제">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </article>
    `
  }

  // 카테고리 정보 반환
  getCategoryInfo(category) {
    const categoryMap = {
      general: {
        name: '자유',
        icon: 'fas fa-comment',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      },
      question: {
        name: '질문',
        icon: 'fas fa-question-circle',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      },
      trade: {
        name: '거래',
        icon: 'fas fa-handshake',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800'
      },
      info: {
        name: '정보',
        icon: 'fas fa-info-circle',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      }
    }
    return categoryMap[category] || categoryMap.general
  }

  // 페이지네이션 및 Load More 버튼 렌더링
  renderPagination(pagination) {
    // 기존 페이지네이션 숨김 (Load More 방식 사용)
    const container = document.getElementById('pagination')
    container.innerHTML = ''
    
    // Load More 버튼 표시/숨김 제어
    const loadMoreBtn = document.getElementById('loadMoreBtn')
    if (loadMoreBtn && pagination) {
      const { page, totalPages } = pagination
      if (page < totalPages) {
        // 더 로드할 페이지가 있으면 버튼 표시
        loadMoreBtn.style.display = 'block'
        loadMoreBtn.innerHTML = `
          <i class="fas fa-chevron-down mr-2"></i>
          더 많은 게시글 보기 (${(totalPages - page) * 50}개 남음)
        `
      } else {
        // 더 이상 로드할 게시글이 없으면 버튼 숨김
        loadMoreBtn.style.display = 'none'
      }
    }
  }

  // 게시글 작성
  async submitPost(event) {
    try {
      if (!this.currentUser) {
        alert('로그인이 필요합니다.')
        return
      }

      const formData = new FormData(event.target)
      const data = {
        userId: this.currentUser.id,
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        imageUrl: formData.get('imageUrl')
      }

      // 수정 모드 확인
      const isEditMode = event.target.dataset.editMode === 'true'
      const postId = event.target.dataset.postId

      let response
      if (isEditMode) {
        response = await axios.put(`/api/posts/${postId}`, data)
      } else {
        response = await axios.post('/api/posts', data)
      }

      if (response.data.success) {
        this.showToast(isEditMode ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.', 'success')
        closeWriteModal()
        this.loadPosts(1, this.currentCategory, this.currentSearch)
        this.loadStats()
      } else {
        alert('오류: ' + response.data.error)
      }
    } catch (error) {
      console.error('게시글 처리 실패:', error)
      alert('게시글 처리 중 오류가 발생했습니다.')
    }
  }

  // 에러 메시지 표시
  showError(message) {
    const container = document.getElementById('postsList')
    container.innerHTML = `
      <div class="text-center py-16">
        <div class="text-red-400 mb-4">
          <i class="fas fa-exclamation-triangle text-6xl"></i>
        </div>
        <h3 class="text-xl font-medium text-gray-600 mb-2">오류가 발생했습니다</h3>
        <p class="text-gray-500">${message}</p>
        <button onclick="location.reload()" class="mt-4 px-6 py-3 bg-pi-orange text-white rounded-xl hover:bg-orange-600 transition-colors">
          <i class="fas fa-refresh mr-2"></i>새로고침
        </button>
      </div>
    `
  }

  // 토스트 메시지
  showToast(message, type = 'info') {
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

    toast.className = `fixed top-20 right-4 z-50 ${bgMap[type]} border rounded-xl p-4 shadow-lg transform transition-all duration-300 ease-in-out translate-x-full opacity-0`
    
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${iconMap[type]} mr-3"></i>
        <span class="text-gray-800 font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0')
    }, 10)

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

// 카테고리 필터링
function filterByCategory(category) {
  window.boardManager.loadPosts(1, category, window.boardManager.currentSearch)
}

// 검색
function searchPosts() {
  const searchInput = document.getElementById('searchInput')
  const search = searchInput ? searchInput.value.trim() : ''
  window.boardManager.loadPosts(1, window.boardManager.currentCategory, search)
}

// 더 많은 게시글 로드 (50개씩 추가)
function loadMorePosts() {
  const nextPage = window.boardManager.currentPage + 1
  // 기존 게시글에 추가로 로드
  window.boardManager.loadPosts(nextPage, window.boardManager.currentCategory, window.boardManager.currentSearch, true)
}

// 글쓰기 모달 열기
function openWriteModal() {
  if (!window.boardManager.currentUser) {
    alert('로그인이 필요합니다.')
    window.location.href = '/'
    return
  }

  const modal = document.getElementById('writeModal')
  if (modal) {
    modal.classList.remove('hidden')
    modal.classList.add('flex')
    
    // 폼 초기화 - 수정 모드가 아닌 경우에만
    const form = document.getElementById('writeForm')
    if (form && form.dataset.editMode !== 'true') {
      form.reset()
      delete form.dataset.editMode
      delete form.dataset.postId
      
      // 제목 변경
      const modalTitle = document.querySelector('#writeModal h3')
      if (modalTitle) modalTitle.textContent = '글쓰기'
    }
    
    // 미리보기 숨기기
    const previewArea = document.getElementById('previewArea')
    if (previewArea) previewArea.classList.add('hidden')
  }
}

// 글쓰기 모달 닫기
function closeWriteModal() {
  const modal = document.getElementById('writeModal')
  if (modal) {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    
    // 폼 초기화
    const form = document.getElementById('writeForm')
    if (form) {
      form.reset()
      delete form.dataset.editMode
      delete form.dataset.postId
    }
    
    // 모달 제목 원복
    const modalTitle = document.querySelector('#writeModal h3')
    if (modalTitle) modalTitle.textContent = '글쓰기'
    
    // 미리보기 숨기기
    const previewArea = document.getElementById('previewArea')
    if (previewArea) previewArea.classList.add('hidden')
  }
}

// 게시글 미리보기
function previewPost() {
  const form = document.getElementById('writeForm')
  const formData = new FormData(form)
  
  const title = formData.get('title')
  const content = formData.get('content')
  const category = formData.get('category')
  const imageUrl = formData.get('imageUrl')
  
  if (!title || !content || !category) {
    alert('제목, 내용, 카테고리를 모두 입력해주세요.')
    return
  }
  
  const categoryInfo = window.boardManager.getCategoryInfo(category)
  const previewHTML = `
    <div class="board-card bg-white rounded-2xl p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-3">
            <span class="${categoryInfo.bgColor} ${categoryInfo.textColor} text-xs px-3 py-1 rounded-full font-bold">
              <i class="${categoryInfo.icon} mr-1"></i>${categoryInfo.name}
            </span>
            <span class="text-gray-500 text-sm">방금 전</span>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">${title}</h2>
          <div class="text-gray-600 mb-4 whitespace-pre-line">${content}</div>
          ${imageUrl ? `<div class="mb-4"><img src="${imageUrl}" alt="게시글 이미지" class="w-full h-48 object-cover rounded-xl" onerror="this.style.display='none'"></div>` : ''}
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span class="flex items-center"><i class="fas fa-user mr-1"></i>${window.boardManager.currentUser.full_name || window.boardManager.currentUser.username}</span>
            <span class="flex items-center"><i class="fas fa-eye mr-1"></i>0</span>
            <span class="flex items-center"><i class="fas fa-heart mr-1"></i>0</span>
            <span class="flex items-center"><i class="fas fa-comment mr-1"></i>0</span>
          </div>
        </div>
      </div>
    </div>
  `
  
  document.getElementById('previewContent').innerHTML = previewHTML
  document.getElementById('previewArea').classList.remove('hidden')
}

// 게시글 수정
async function editPost(postId) {
  console.log('게시글 수정 함수 호출됨, postId:', postId)
  
  try {
    console.log('게시글 데이터 요청 중...')
    const response = await axios.get(`/api/posts/${postId}`)
    
    if (!response.data.success) {
      console.error('API 응답 실패:', response.data)
      alert('게시글을 불러올 수 없습니다.')
      return
    }
    
    const post = response.data.post
    console.log('불러온 게시글 데이터:', post)
    
    // 수정 폼에 기존 데이터 채우기 - null 체크 포함
    const categorySelect = document.getElementById('postCategory')
    const titleInput = document.getElementById('postTitle')
    const contentTextarea = document.getElementById('postContent')
    const imageUrlInput = document.getElementById('postImageUrl')
    
    console.log('Form 요소들:', {
      categorySelect: !!categorySelect,
      titleInput: !!titleInput,
      contentTextarea: !!contentTextarea,
      imageUrlInput: !!imageUrlInput
    })
    
    if (categorySelect) {
      categorySelect.value = post.category || ''
      console.log('카테고리 설정됨:', post.category)
    }
    if (titleInput) {
      titleInput.value = post.title || ''
      console.log('제목 설정됨:', post.title)
    }
    if (contentTextarea) {
      contentTextarea.value = post.content || ''
      console.log('내용 설정됨')
    }
    if (imageUrlInput) {
      imageUrlInput.value = post.image_url || ''
      console.log('이미지 URL 설정됨:', post.image_url)
    }
    
    // 모달 제목 변경
    const modalTitle = document.querySelector('#writeModal h3')
    if (modalTitle) {
      modalTitle.textContent = '게시글 수정'
      console.log('모달 제목 변경됨')
    }
    
    // 폼에 수정 모드 설정
    const form = document.getElementById('writeForm')
    if (form) {
      form.dataset.editMode = 'true'
      form.dataset.postId = postId
      console.log('수정 모드 설정됨, postId:', postId)
    }
    
    // 모달 열기
    console.log('모달 열기 시작')
    openWriteModal()
    
  } catch (error) {
    console.error('게시글 로드 실패:', error)
    alert('게시글을 불러오는 중 오류가 발생했습니다.')
  }
}

// 게시글 삭제
async function deletePost(postId) {
  if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    return
  }
  
  try {
    const response = await axios.delete(`/api/posts/${postId}`, {
      headers: {
        'X-User-Id': window.boardManager.currentUser.id
      }
    })
    
    if (response.data.success) {
      window.boardManager.showToast('게시글이 삭제되었습니다.', 'success')
      window.boardManager.loadPosts(window.boardManager.currentPage, window.boardManager.currentCategory, window.boardManager.currentSearch)
      window.boardManager.loadStats()
    } else {
      alert('삭제 실패: ' + response.data.error)
    }
  } catch (error) {
    console.error('게시글 삭제 실패:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 게시글 상세 모달 열기
async function openPostModal(postId) {
  try {
    const response = await axios.get(`/api/posts/${postId}`)
    if (!response.data.success) {
      alert('게시글을 불러올 수 없습니다.')
      return
    }
    
    const post = response.data.post
    const categoryInfo = window.boardManager.getCategoryInfo(post.category)
    const isHot = post.is_hot || post.like_count >= 10 || post.comment_count >= 5
    const createdDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // 사용자 권한 확인
    const canEdit = window.boardManager.currentUser && (
      window.boardManager.currentUser.id === post.author_id || 
      window.boardManager.currentUser.email === '5321497@naver.com'
    )

    const modalHTML = `
      <div class="p-8">
        <!-- 헤더 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            ${isHot ? '<span class="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-full font-bold animate-pulse"><i class="fas fa-fire mr-2"></i>HOT</span>' : ''}
            <span class="${categoryInfo.bgColor} ${categoryInfo.textColor} text-sm px-4 py-2 rounded-full font-bold">
              <i class="${categoryInfo.icon} mr-2"></i>${categoryInfo.name}
            </span>
          </div>
          <button onclick="closePostModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 제목 -->
        <h1 class="text-3xl font-bold text-gray-800 mb-4">${post.title}</h1>

        <!-- 메타 정보 -->
        <div class="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
          <div class="flex items-center space-x-4 text-gray-600">
            <span class="flex items-center">
              <i class="fas fa-user mr-2"></i>
              ${post.author_full_name || post.author_name}
            </span>
            <span class="flex items-center">
              <i class="fas fa-clock mr-2"></i>
              ${createdDate}
            </span>
          </div>
          <div class="flex items-center space-x-4 text-gray-600">
            <span class="flex items-center">
              <i class="fas fa-eye mr-1"></i>
              ${post.view_count || 0}
            </span>
            <span class="flex items-center">
              <i class="fas fa-heart mr-1"></i>
              ${post.like_count || 0}
            </span>
            <span class="flex items-center">
              <i class="fas fa-comment mr-1"></i>
              ${post.comment_count || 0}
            </span>
          </div>
        </div>

        <!-- 이미지 -->
        ${post.image_url ? `
          <div class="mb-6">
            <img src="${post.image_url}" alt="게시글 이미지" class="w-full max-h-96 object-cover rounded-xl" onerror="this.style.display='none'">
          </div>
        ` : ''}

        <!-- 내용 -->
        <div class="prose max-w-none mb-8">
          <div class="text-gray-700 leading-relaxed whitespace-pre-line text-lg">${post.content}</div>
        </div>

        <!-- 액션 버튼 -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            ${window.boardManager.currentUser ? `
              <button onclick="likePost(${post.id})" class="flex items-center px-4 py-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-xl transition-colors">
                <i class="fas fa-heart mr-2"></i>
                좋아요 (${post.like_count || 0})
              </button>
            ` : ''}
            <button onclick="sharePost(${post.id}, '${post.title}')" class="flex items-center px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 rounded-xl transition-colors">
              <i class="fas fa-share mr-2"></i>
              공유
            </button>
          </div>
          
          ${canEdit ? `
            <div class="flex items-center space-x-2">
              <button onclick="editPost(${post.id}); closePostModal()" class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <i class="fas fa-edit mr-2"></i>수정
              </button>
              <button onclick="deletePost(${post.id}); closePostModal()" class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                <i class="fas fa-trash mr-2"></i>삭제
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `
    
    document.getElementById('postModalContent').innerHTML = modalHTML
    document.getElementById('postModal').classList.remove('hidden')
    document.getElementById('postModal').classList.add('flex')
    
  } catch (error) {
    console.error('게시글 로드 실패:', error)
    alert('게시글을 불러오는 중 오류가 발생했습니다.')
  }
}

// 게시글 상세 모달 닫기
function closePostModal() {
  const modal = document.getElementById('postModal')
  if (modal) {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
  }
}

// 게시글 좋아요
async function likePost(postId) {
  if (!window.boardManager.currentUser) {
    alert('로그인이 필요합니다.')
    return
  }
  
  try {
    const response = await axios.post(`/api/posts/${postId}/like`, {
      userId: window.boardManager.currentUser.id
    })
    
    if (response.data.success) {
      window.boardManager.showToast(response.data.message, 'success')
      // 모달이 열려있다면 새로고침
      const modal = document.getElementById('postModal')
      if (!modal.classList.contains('hidden')) {
        openPostModal(postId)
      }
      // 목록 새로고침
      window.boardManager.loadPosts(window.boardManager.currentPage, window.boardManager.currentCategory, window.boardManager.currentSearch)
    }
  } catch (error) {
    console.error('좋아요 실패:', error)
    alert('좋아요 처리 중 오류가 발생했습니다.')
  }
}

// 게시글 공유
function sharePost(postId, title) {
  const url = window.location.href + `?post=${postId}`
  
  if (navigator.share) {
    navigator.share({
      title: `파이코인 당근 - ${title}`,
      text: '파이코인 당근 게시판의 흥미로운 글을 확인해보세요!',
      url: url
    }).then(() => {
      window.boardManager.showToast('게시글이 공유되었습니다.', 'success')
    }).catch(err => {
      console.log('Error sharing:', err)
    })
  } else {
    navigator.clipboard.writeText(url).then(() => {
      window.boardManager.showToast('링크가 클립보드에 복사되었습니다.', 'success')
    }).catch(() => {
      window.boardManager.showToast('링크 복사에 실패했습니다.', 'error')
    })
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.boardManager = new BoardManager()
  
  // 페이지 로드 완료 후 애니메이션 효과
  setTimeout(() => {
    document.querySelectorAll('.board-card').forEach((card, index) => {
      setTimeout(() => {
        card.style.transform = 'translateY(0)'
        card.style.opacity = '1'
      }, index * 100)
    })
  }, 500)
})