// 채팅 시스템 JavaScript

class PicoinChat {
  constructor() {
    this.currentUser = null
    this.chatRoom = null
    this.messages = []
    this.pollingInterval = null
    this.lastMessageId = 0
    this.isLoadingMessages = false
    
    this.init()
  }

  init() {
    this.checkAuth()
    this.setupEventListeners()
    this.loadChatRoom()
    this.setupAutoResize()
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

  // URL에서 채팅방 ID 가져오기
  getRoomIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('room') || urlParams.get('roomId')
  }

  // 채팅방 정보 로드
  async loadChatRoom() {
    const roomId = this.getRoomIdFromUrl()
    
    if (!roomId) {
      this.showNoChatRoom()
      return
    }

    try {
      const response = await axios.get(`/api/chat/${roomId}`)
      if (response.data.success) {
        this.chatRoom = response.data.chatRoom
        this.renderProductInfo()
        this.loadMessages()
        this.startPolling()
      } else {
        throw new Error(response.data.error)
      }
    } catch (error) {
      console.error('채팅방 로드 실패:', error)
      this.showNoChatRoom()
    }
  }

  // 상품 정보 렌더링
  renderProductInfo() {
    if (!this.chatRoom) return

    const productInfo = document.getElementById('productInfo')
    productInfo.innerHTML = `
      <div class="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
        ${this.chatRoom.product_image 
          ? `<img src="${this.chatRoom.product_image}" alt="${this.chatRoom.product_title}" class="w-full h-full object-cover">`
          : `<div class="w-full h-full flex items-center justify-center text-gray-400">
               <i class="fas fa-image"></i>
             </div>`
        }
      </div>
      <div>
        <h3 class="font-medium text-gray-800 text-sm">${this.chatRoom.product_title}</h3>
        <div class="flex items-center space-x-2 text-xs">
          <span class="font-bold text-gray-800">${this.formatPrice(this.chatRoom.product_price)}원</span>
          <span class="text-pi-orange font-medium">π ${this.chatRoom.product_pi_price}</span>
        </div>
        <div class="text-xs text-gray-500">
          ${this.currentUser.id === this.chatRoom.buyer_id ? this.chatRoom.seller_name : this.chatRoom.buyer_name}님과의 채팅
        </div>
      </div>
    `
  }

  // 메시지 로드
  async loadMessages() {
    if (this.isLoadingMessages) return
    
    this.isLoadingMessages = true
    this.showLoading(true)

    try {
      const response = await axios.get(`/api/chat/${this.chatRoom.id}/messages`)
      if (response.data.success) {
        this.messages = response.data.messages
        this.renderMessages()
        this.scrollToBottom()
        
        // 마지막 메시지 ID 업데이트
        if (this.messages.length > 0) {
          this.lastMessageId = Math.max(...this.messages.map(m => m.id))
        }
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error)
      this.showToast('메시지를 불러오는데 실패했습니다.', 'error')
    } finally {
      this.isLoadingMessages = false
      this.showLoading(false)
    }
  }

  // 새 메시지 확인 (폴링)
  async checkNewMessages() {
    if (!this.chatRoom || this.isLoadingMessages) return

    try {
      const response = await axios.get(`/api/chat/${this.chatRoom.id}/messages?limit=10`)
      if (response.data.success) {
        const newMessages = response.data.messages.filter(msg => msg.id > this.lastMessageId)
        
        if (newMessages.length > 0) {
          this.messages.push(...newMessages)
          this.renderNewMessages(newMessages)
          this.scrollToBottom()
          this.lastMessageId = Math.max(...this.messages.map(m => m.id))
        }
      }
    } catch (error) {
      // 폴링 에러는 조용히 처리
      console.warn('메시지 폴링 실패:', error)
    }
  }

  // 메시지 렌더링
  renderMessages() {
    const messageList = document.getElementById('messageList')
    messageList.innerHTML = this.messages.map(message => this.createMessageHTML(message)).join('')
  }

  // 새 메시지 렌더링
  renderNewMessages(newMessages) {
    const messageList = document.getElementById('messageList')
    const newMessagesHTML = newMessages.map(message => this.createMessageHTML(message)).join('')
    messageList.insertAdjacentHTML('beforeend', newMessagesHTML)
  }

  // 메시지 HTML 생성
  createMessageHTML(message) {
    const isSent = message.sender_id === this.currentUser.id
    const messageClass = isSent ? 'sent' : 'received'
    const bubbleClass = isSent ? 'sent' : 'received'
    
    return `
      <div class="chat-message ${messageClass}">
        <div class="max-w-xs md:max-w-md">
          ${!isSent ? `<div class="text-xs text-gray-500 mb-1">${message.sender_name}</div>` : ''}
          <div class="chat-bubble ${bubbleClass}">
            ${this.formatMessageText(message.message)}
          </div>
          <div class="chat-time text-right ${!isSent ? 'text-left' : ''}">
            ${this.formatTime(message.created_at)}
          </div>
        </div>
      </div>
    `
  }

  // 메시지 전송
  async sendMessage() {
    const messageInput = document.getElementById('messageInput')
    const message = messageInput.value.trim()

    if (!message || message.length > 500) {
      this.showToast('메시지를 입력하거나 500자 이하로 작성해주세요.', 'error')
      return
    }

    if (!this.chatRoom) {
      this.showToast('채팅방 정보를 불러오는 중입니다.', 'error')
      return
    }

    try {
      const response = await axios.post('/api/chat/message', {
        roomId: this.chatRoom.id,
        senderId: this.currentUser.id,
        message: message,
        messageType: 'text'
      })

      if (response.data.success) {
        messageInput.value = ''
        this.updateMessageCount('')
        this.messages.push(response.data.message)
        this.renderNewMessages([response.data.message])
        this.scrollToBottom()
        this.lastMessageId = response.data.message.id
      } else {
        throw new Error(response.data.error)
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      this.showToast('메시지 전송에 실패했습니다.', 'error')
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    const messageInput = document.getElementById('messageInput')
    const sendButton = document.getElementById('sendButton')

    // 메시지 입력
    messageInput.addEventListener('input', (e) => {
      this.updateMessageCount(e.target.value)
    })

    // 엔터키로 전송
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    // 전송 버튼
    sendButton.addEventListener('click', () => this.sendMessage())

    // 페이지를 떠날 때 폴링 중단
    window.addEventListener('beforeunload', () => {
      this.stopPolling()
    })

    // 포커스 시 새 메시지 확인
    window.addEventListener('focus', () => {
      this.checkNewMessages()
    })
  }

  // 자동 리사이즈 설정
  setupAutoResize() {
    const messageInput = document.getElementById('messageInput')
    
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto'
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px'
    })
  }

  // 폴링 시작
  startPolling() {
    this.stopPolling() // 기존 폴링 중단
    this.pollingInterval = setInterval(() => {
      this.checkNewMessages()
    }, 3000) // 3초마다 확인
  }

  // 폴링 중단
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  // 스크롤을 맨 아래로
  scrollToBottom() {
    const chatContainer = document.getElementById('chatContainer')
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }, 100)
  }

  // 로딩 표시
  showLoading(show) {
    const loading = document.getElementById('loadingMessages')
    loading.classList.toggle('hidden', !show)
  }

  // 채팅방 없음 표시
  showNoChatRoom() {
    document.getElementById('noChatRoom').classList.remove('hidden')
  }

  // 메시지 글자 수 업데이트
  updateMessageCount(text) {
    const count = text.length
    const counter = document.getElementById('messageCount')
    counter.textContent = `${count}/500자`
    counter.classList.toggle('text-red-500', count > 500)
    
    const sendButton = document.getElementById('sendButton')
    sendButton.disabled = count === 0 || count > 500
  }

  // 메시지 텍스트 포맷팅
  formatMessageText(text) {
    return text.replace(/\n/g, '<br>')
  }

  // 시간 포맷팅
  formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      })
    } else if (diffDays === 1) {
      return '어제 ' + date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      })
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      }) + ' ' + date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      })
    }
  }

  // 가격 포맷팅
  formatPrice(price) {
    return new Intl.NumberFormat('ko-KR').format(price)
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
const picoinChat = new PicoinChat()

// 전역 함수로 노출
window.picoinChat = picoinChat