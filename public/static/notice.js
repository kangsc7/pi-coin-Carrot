// 공지사항 페이지 JavaScript

class NoticeManager {
  constructor() {
    this.currentFilter = 'all'
    this.notices = []
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.checkAdminAuth()
    this.loadNotices()
  }

  // 관리자 권한 확인
  checkAdminAuth() {
    const userData = localStorage.getItem('picoin_user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user.email === '5321497@naver.com') {
        // 관리자인 경우 작성 버튼 표시
        const adminBtn = document.getElementById('adminWriteBtn')
        if (adminBtn) {
          adminBtn.classList.remove('hidden')
        }
        this.currentUser = user
      }
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 필터 탭 클릭 이벤트
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('onclick').match(/filterNotices\('(.+?)'\)/)[1]
        this.setActiveFilter(filter)
      })
    })
  }

  // 활성 필터 설정
  setActiveFilter(filter) {
    this.currentFilter = filter

    // 탭 스타일 업데이트
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.remove('bg-pi-orange', 'text-white')
      tab.classList.add('bg-gray-200', 'text-gray-700')
    })

    event.target.classList.remove('bg-gray-200', 'text-gray-700')
    event.target.classList.add('bg-pi-orange', 'text-white')

    // 공지사항 필터링
    this.filterNotices()
  }

  // 공지사항 필터링
  filterNotices() {
    const notices = document.querySelectorAll('[data-type]')
    
    notices.forEach(notice => {
      const noticeType = notice.getAttribute('data-type')
      
      if (this.currentFilter === 'all' || noticeType === this.currentFilter) {
        notice.style.display = 'block'
        notice.classList.remove('opacity-50')
      } else {
        notice.style.display = 'none'
      }
    })

    // 필터 결과 확인
    const visibleNotices = document.querySelectorAll(`[data-type]:not([style*="display: none"])`)
    if (visibleNotices.length === 0) {
      this.showNoResults()
    } else {
      this.hideNoResults()
    }
  }

  // 검색 결과 없음 표시
  showNoResults() {
    if (document.getElementById('noResults')) return

    const noResults = document.createElement('div')
    noResults.id = 'noResults'
    noResults.className = 'text-center py-16'
    noResults.innerHTML = `
      <div class="text-gray-400 mb-4">
        <i class="fas fa-search text-6xl"></i>
      </div>
      <h3 class="text-xl font-medium text-gray-600 mb-2">해당 카테고리에 공지사항이 없습니다</h3>
      <p class="text-gray-500">다른 카테고리를 선택해보세요</p>
    `

    document.getElementById('noticeList').appendChild(noResults)
  }

  // 검색 결과 없음 숨김
  hideNoResults() {
    const noResults = document.getElementById('noResults')
    if (noResults) {
      noResults.remove()
    }
  }

  // 공지사항 로드 함수는 프로토타입으로 이동했습니다

  // 공지사항 검색 (향후 구현)
  searchNotices(keyword) {
    const notices = document.querySelectorAll('.notice-card')
    
    notices.forEach(notice => {
      const title = notice.querySelector('h2').textContent.toLowerCase()
      const content = notice.querySelector('p').textContent.toLowerCase()
      
      if (title.includes(keyword.toLowerCase()) || content.includes(keyword.toLowerCase())) {
        notice.style.display = 'block'
      } else {
        notice.style.display = 'none'
      }
    })
  }
}

// 전역 함수들

// 필터 적용
function filterNotices(type) {
  window.noticeManager.setActiveFilter(type)
}

// 공지사항 내용 토글
function toggleNoticeContent(noticeId) {
  const content = document.getElementById(noticeId)
  const icon = document.getElementById(`icon-${noticeId}`)
  
  if (content.classList.contains('hidden')) {
    // 열기
    content.classList.remove('hidden')
    icon.classList.add('rotate-180')
    
    // 부드러운 애니메이션을 위한 스크롤
    setTimeout(() => {
      content.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      })
    }, 100)
  } else {
    // 닫기
    content.classList.add('hidden')
    icon.classList.remove('rotate-180')
  }
}

// 더 많은 공지사항 로드
function loadMoreNotices() {
  // 로딩 상태 표시
  event.target.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로딩 중...'
  event.target.disabled = true

  // 시뮬레이션: 2초 후 완료
  setTimeout(() => {
    event.target.innerHTML = '<i class="fas fa-chevron-down mr-2"></i>더 많은 공지사항 보기'
    event.target.disabled = false
    
    // 토스트 메시지 표시
    showToast('모든 공지사항을 불러왔습니다.', 'info')
  }, 2000)
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
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

// 스무스 스크롤 유틸리티
function smoothScrollTo(element) {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

// 공지사항 공유 (향후 구현)
function shareNotice(noticeId, title) {
  if (navigator.share) {
    navigator.share({
      title: `파이코인 마켓 - ${title}`,
      text: '파이코인 마켓의 중요한 공지사항을 확인하세요!',
      url: window.location.href
    }).then(() => {
      showToast('공지사항이 공유되었습니다.', 'success')
    }).catch(err => {
      console.log('Error sharing:', err)
    })
  } else {
    // 클립보드에 URL 복사
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('링크가 클립보드에 복사되었습니다.', 'success')
    }).catch(() => {
      showToast('링크 복사에 실패했습니다.', 'error')
    })
  }
}

// 공지사항 북마크 (향후 구현)
function bookmarkNotice(noticeId) {
  const bookmarked = localStorage.getItem(`bookmark_${noticeId}`)
  
  if (bookmarked) {
    localStorage.removeItem(`bookmark_${noticeId}`)
    showToast('북마크가 제거되었습니다.', 'info')
  } else {
    localStorage.setItem(`bookmark_${noticeId}`, 'true')
    showToast('북마크에 추가되었습니다.', 'success')
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.noticeManager = new NoticeManager()
  
  // 페이지 로드 완료 후 애니메이션 효과
  setTimeout(() => {
    document.querySelectorAll('.notice-card').forEach((card, index) => {
      setTimeout(() => {
        card.style.transform = 'translateY(0)'
        card.style.opacity = '1'
      }, index * 100)
    })
  }, 500)
})

// 공지사항 작성 모달 열기
function openNoticeWriteModal() {
  const modal = document.getElementById('noticeWriteModal')
  if (modal) {
    modal.classList.remove('hidden')
    modal.classList.add('flex')
    
    // 폼 초기화 - 수정 모드가 아닌 경우에만
    const form = document.getElementById('noticeWriteForm')
    if (form && form.dataset.editMode !== 'true') {
      form.reset()
      delete form.dataset.editMode
      delete form.dataset.noticeId
      
      // 모달 제목 설정
      const modalTitle = document.querySelector('#noticeWriteModal h3')
      if (modalTitle) modalTitle.textContent = '공지사항 작성'
    }
    
    // 미리보기 숨기기
    const previewArea = document.getElementById('previewArea')
    if (previewArea) previewArea.classList.add('hidden')
  }
}



// 공지사항 미리보기
function previewNotice() {
  const form = document.getElementById('noticeWriteForm')
  const formData = new FormData(form)
  
  const title = formData.get('title')
  const content = formData.get('content')
  const category = formData.get('category')
  const imageUrl = formData.get('imageUrl')
  const isPinned = formData.get('isPinned')
  
  if (!title || !content) {
    alert('제목과 내용을 입력해주세요.')
    return
  }
  
  // 카테고리별 스타일 클래스
  const categoryStyles = {
    important: 'notice-important',
    update: 'notice-update',
    event: 'notice-event',
    maintenance: 'notice-maintenance'
  }
  
  // 카테고리별 아이콘
  const categoryIcons = {
    important: 'fas fa-exclamation-triangle text-red-600',
    update: 'fas fa-sync text-blue-600',
    event: 'fas fa-gift text-green-600',
    maintenance: 'fas fa-tools text-yellow-600'
  }
  
  // 카테고리별 배지 색상
  const categoryBadges = {
    important: 'bg-red-100 text-red-800',
    update: 'bg-blue-100 text-blue-800',
    event: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  }
  
  // 카테고리별 텍스트
  const categoryTexts = {
    important: '중요',
    update: '업데이트',
    event: '이벤트',
    maintenance: '점검'
  }
  
  const previewHTML = `
    <div class="${categoryStyles[category]} p-1 rounded-2xl">
      <div class="bg-white rounded-xl p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-opacity-20 rounded-lg flex items-center justify-center ${category === 'important' ? 'bg-red-100' : category === 'update' ? 'bg-blue-100' : category === 'event' ? 'bg-green-100' : 'bg-yellow-100'}">
              <i class="${categoryIcons[category]}"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                ${isPinned ? '<span class="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">고정</span>' : ''}
                <span class="${categoryBadges[category]} text-xs px-3 py-1 rounded-full font-bold">${categoryTexts[category]}</span>
                <span class="text-gray-500 text-sm">${new Date().toLocaleDateString('ko-KR')}</span>
              </div>
              <h2 class="text-xl font-bold text-gray-800 mt-2">${title}</h2>
            </div>
          </div>
        </div>
        
        ${imageUrl ? `<div class="mb-4"><img src="${imageUrl}" alt="공지사항 이미지" class="w-full h-64 object-cover rounded-xl" onerror="this.style.display='none'"></div>` : ''}
        
        <div class="text-gray-600 leading-relaxed">${content.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
  `
  
  document.getElementById('previewContent').innerHTML = previewHTML
  document.getElementById('previewArea').classList.remove('hidden')
}

// NoticeManager 클래스에 공지사항 로드 및 작성 기능 추가
NoticeManager.prototype.loadNotices = async function() {
  try {
    const response = await axios.get('/api/notices')
    if (response.data.success) {
      this.notices = response.data.notices
      this.renderNotices()
    }
  } catch (error) {
    console.error('공지사항 로드 실패:', error)
  }
}

NoticeManager.prototype.renderNotices = function() {
  const container = document.getElementById('noticeList')
  if (!this.notices || this.notices.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-bullhorn text-gray-300 text-6xl mb-4"></i>
        <p class="text-gray-500 text-lg">등록된 공지사항이 없습니다.</p>
      </div>
    `
    return
  }
  
  // 동적 공지사항만 표시 (기존 HTML 무시)
  const dynamicNoticesHTML = this.notices.map(notice => this.createNoticeHTML(notice)).join('')
  
  container.innerHTML = dynamicNoticesHTML
}

NoticeManager.prototype.createNoticeHTML = function(notice) {
  const categoryStyles = {
    important: 'notice-important',
    update: 'notice-update',
    event: 'notice-event',
    maintenance: 'notice-maintenance'
  }
  
  const categoryIcons = {
    important: 'fas fa-exclamation-triangle text-red-600',
    update: 'fas fa-sync text-blue-600',
    event: 'fas fa-gift text-green-600',
    maintenance: 'fas fa-tools text-yellow-600'
  }
  
  const categoryBadges = {
    important: 'bg-red-100 text-red-800',
    update: 'bg-blue-100 text-blue-800',
    event: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  }
  
  const categoryTexts = {
    important: '중요',
    update: '업데이트',
    event: '이벤트',
    maintenance: '점검'
  }
  
  // 카테고리 추정 (제목이나 내용 기반)
  let category = 'update' // 기본값
  if (notice.title.includes('중요') || notice.is_pinned) category = 'important'
  else if (notice.title.includes('이벤트')) category = 'event'
  else if (notice.title.includes('점검') || notice.title.includes('유지보수')) category = 'maintenance'
  
  const createdDate = new Date(notice.created_at).toLocaleDateString('ko-KR')
  
  // 관리자 권한 확인
  const userData = localStorage.getItem('picoin_user')
  const isAdmin = userData && JSON.parse(userData).email === '5321497@naver.com'
  
  return `
    <article class="notice-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-300" data-type="${category}" onclick="toggleNoticeContent('notice-${notice.id}')">
      <div class="${categoryStyles[category]} p-1">
        <div class="bg-white rounded-xl p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-opacity-20 rounded-lg flex items-center justify-center ${category === 'important' ? 'bg-red-100' : category === 'update' ? 'bg-blue-100' : category === 'event' ? 'bg-green-100' : 'bg-yellow-100'}">
                <i class="${categoryIcons[category]}"></i>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  ${notice.is_pinned ? '<span class="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">고정</span>' : ''}
                  <span class="${categoryBadges[category]} text-xs px-3 py-1 rounded-full font-bold">${categoryTexts[category]}</span>
                  <span class="text-gray-500 text-sm">${createdDate}</span>
                </div>
                <h2 class="text-xl font-bold text-gray-800 mt-2">${notice.title}</h2>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              ${isAdmin ? `
                <button onclick="event.stopPropagation(); editNotice(${notice.id})" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="수정">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="event.stopPropagation(); deleteNotice(${notice.id})" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors" title="삭제">
                  <i class="fas fa-trash"></i>
                </button>
              ` : ''}
              <div class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-chevron-down transform transition-transform" id="icon-notice-${notice.id}"></i>
              </div>
            </div>
          </div>
          
          ${notice.image_url ? `<div class="mb-4"><img src="${notice.image_url}" alt="공지사항 이미지" class="w-full h-64 object-cover rounded-xl" onerror="this.style.display='none'"></div>` : ''}
          
          <div id="notice-${notice.id}" class="hidden">
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="text-gray-600 leading-relaxed whitespace-pre-line">${notice.content}</div>
              <div class="border-t pt-4 mt-6">
                <p class="text-sm text-gray-500">
                  작성자: ${notice.author_full_name || notice.author_name} | 
                  등록일: ${createdDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `
}

// 공지사항 작성/수정 폼 제출
document.getElementById('noticeWriteForm')?.addEventListener('submit', async function(e) {
  e.preventDefault()
  
  const userData = localStorage.getItem('picoin_user')
  if (!userData) {
    alert('로그인이 필요합니다.')
    return
  }
  
  const user = JSON.parse(userData)
  if (user.email !== '5321497@naver.com') {
    alert('관리자 권한이 필요합니다.')
    return
  }
  
  const formData = new FormData(e.target)
  const data = {
    userId: user.id,
    title: formData.get('title'),
    content: formData.get('content'),
    imageUrl: formData.get('imageUrl'),
    isPinned: formData.get('isPinned') === 'on'
  }
  
  try {
    const isEditMode = e.target.dataset.editMode === 'true'
    const noticeId = e.target.dataset.noticeId
    
    let response
    if (isEditMode) {
      // 수정 모드
      response = await axios.put(`/api/notices/${noticeId}`, data)
      if (response.data.success) {
        showToast('공지사항이 수정되었습니다.', 'success')
      } else {
        alert('수정 실패: ' + response.data.error)
        return
      }
    } else {
      // 생성 모드
      response = await axios.post('/api/notices', data)
      if (response.data.success) {
        showToast('공지사항이 등록되었습니다.', 'success')
      } else {
        alert('등록 실패: ' + response.data.error)
        return
      }
    }
    
    closeNoticeWriteModal()
    
    // 공지사항 목록 새로고침
    if (window.noticeManager) {
      await window.noticeManager.loadNotices()
    }
    
  } catch (error) {
    console.error('공지사항 처리 실패:', error)
    alert('처리 중 오류가 발생했습니다.')
  }
})

// 공지사항 수정 함수
async function editNotice(noticeId) {
  console.log('공지사항 수정 함수 호출됨, noticeId:', noticeId)
  
  try {
    // 기존 공지사항 데이터 가져오기
    console.log('공지사항 데이터 요청 중...')
    const response = await axios.get(`/api/notices/${noticeId}`)
    
    if (!response.data.success) {
      console.error('API 응답 실패:', response.data)
      alert('공지사항을 불러올 수 없습니다.')
      return
    }
    
    const notice = response.data.notice
    console.log('불러온 공지사항 데이터:', notice)
    
    // 수정 폼에 기존 데이터 채우기 - ID 기반으로 찾기
    const titleInput = document.getElementById('noticeTitle')
    const contentTextarea = document.getElementById('noticeContent')
    const categorySelect = document.getElementById('noticeCategory')
    const imageUrlInput = document.getElementById('noticeImageUrl')
    const isPinnedCheckbox = document.getElementById('noticeIsPinned')
    
    console.log('Form 요소들:', {
      titleInput: !!titleInput,
      contentTextarea: !!contentTextarea,
      categorySelect: !!categorySelect,
      imageUrlInput: !!imageUrlInput,
      isPinnedCheckbox: !!isPinnedCheckbox
    })
    
    if (titleInput) {
      titleInput.value = notice.title || ''
      console.log('제목 설정됨:', notice.title)
    }
    if (contentTextarea) {
      contentTextarea.value = notice.content || ''
      console.log('내용 설정됨')
    }
    if (categorySelect) {
      categorySelect.value = notice.category || 'update'
      console.log('카테고리 설정됨:', notice.category)
    }
    if (imageUrlInput) {
      imageUrlInput.value = notice.image_url || ''
      console.log('이미지 URL 설정됨:', notice.image_url)
    }
    if (isPinnedCheckbox) {
      isPinnedCheckbox.checked = notice.is_pinned || false
      console.log('고정 여부 설정됨:', notice.is_pinned)
    }
    
    // 모달 제목 변경
    const modalTitle = document.querySelector('#noticeWriteModal h3')
    if (modalTitle) {
      modalTitle.textContent = '공지사항 수정'
      console.log('모달 제목 변경됨')
    }
    
    // 폼에 수정 모드 설정
    const form = document.getElementById('noticeWriteForm')
    if (form) {
      form.dataset.editMode = 'true'
      form.dataset.noticeId = noticeId
      console.log('수정 모드 설정됨, noticeId:', noticeId)
    }
    
    // 모달 열기
    console.log('모달 열기 시작')
    openNoticeWriteModal()
    
  } catch (error) {
    console.error('공지사항 로드 실패:', error)
    alert('공지사항을 불러오는 중 오류가 발생했습니다.')
  }
}

// 공지사항 삭제 함수
async function deleteNotice(noticeId) {
  if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
    return
  }
  
  try {
    const userData = localStorage.getItem('picoin_user')
    if (!userData) {
      alert('로그인이 필요합니다.')
      return
    }
    
    const user = JSON.parse(userData)
    if (user.email !== '5321497@naver.com') {
      alert('관리자 권한이 필요합니다.')
      return
    }
    
    const response = await axios.delete(`/api/notices/${noticeId}`, {
      headers: {
        'X-User-Id': user.id
      }
    })
    if (response.data.success) {
      showToast('공지사항이 삭제되었습니다.', 'success')
      
      // 공지사항 목록 새로고침
      if (window.noticeManager) {
        await window.noticeManager.loadNotices()
      }
    } else {
      alert('삭제 실패: ' + response.data.error)
    }
  } catch (error) {
    console.error('공지사항 삭제 실패:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 수정된 공지사항 작성 모달 닫기 함수
function closeNoticeWriteModal() {
  const modal = document.getElementById('noticeWriteModal')
  if (modal) {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    
    // 수정 모드 해제 및 폼 초기화
    const form = document.getElementById('noticeWriteForm')
    if (form) {
      delete form.dataset.editMode
      delete form.dataset.noticeId
      form.reset()
    }
    
    // 모달 제목 원복
    const modalTitle = document.querySelector('#noticeWriteModal h3')
    if (modalTitle) modalTitle.textContent = '공지사항 작성'
    
    // 미리보기 숨기기
    const previewArea = document.getElementById('previewArea')
    if (previewArea) previewArea.classList.add('hidden')
  }
}

// 초기 스타일 설정 (애니메이션용)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.notice-card').forEach(card => {
    card.style.transform = 'translateY(20px)'
    card.style.opacity = '0'
    card.style.transition = 'all 0.5s ease-out'
  })
})