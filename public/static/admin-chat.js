// 관리자 문의 채팅 시스템

class AdminChat {
  constructor() {
    this.currentUser = null
    this.chatRoom = null
    this.messages = []
    this.isOpen = false
    this.messagePollingInterval = null
    
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.checkAuthStatus()
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    const contactBtn = document.getElementById('adminContactBtn')
    const closeBtn = document.getElementById('closeAdminChat')
    const sendBtn = document.getElementById('sendAdminMessage')
    const input = document.getElementById('adminChatInput')

    if (contactBtn) {
      contactBtn.addEventListener('click', () => this.toggleChatWidget())
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeChatWidget())
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage())
    }

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          this.sendMessage()
        }
      })
    }
  }

  // 인증 상태 확인
  checkAuthStatus() {
    const userData = localStorage.getItem('picoin_user')
    if (userData) {
      this.currentUser = JSON.parse(userData)
    }
  }

  // 채팅 위젯 토글
  async toggleChatWidget() {
    if (!this.currentUser) {
      app.showToast('로그인이 필요한 서비스입니다.', 'info')
      app.showModal('loginModal')
      return
    }

    if (this.isOpen) {
      this.closeChatWidget()
    } else {
      await this.openChatWidget()
    }
  }

  // 채팅 위젯 열기
  async openChatWidget() {
    this.isOpen = true
    const widget = document.getElementById('adminChatWidget')
    widget.classList.remove('hidden')

    // 채팅방 생성/조회
    await this.createOrGetChatRoom()
    
    // 메시지 로드
    if (this.chatRoom) {
      await this.loadMessages()
      this.startMessagePolling()
    }
  }

  // 채팅 위젯 닫기
  closeChatWidget() {
    this.isOpen = false
    const widget = document.getElementById('adminChatWidget')
    widget.classList.add('hidden')
    
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval)
      this.messagePollingInterval = null
    }
  }

  // 채팅방 생성/조회
  async createOrGetChatRoom() {
    try {
      const response = await axios.post('/api/admin/chat/room', {
        userId: this.currentUser.id
      })

      if (response.data.success) {
        this.chatRoom = response.data.chatRoom
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error)
      app.showToast('채팅방 생성에 실패했습니다.', 'error')
    }
  }

  // 메시지 로드
  async loadMessages() {
    if (!this.chatRoom) return

    try {
      const response = await axios.get(`/api/admin/chat/${this.chatRoom.id}/messages`)
      
      if (response.data.success) {
        this.messages = response.data.messages
        this.renderMessages()
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error)
    }
  }

  // 메시지 렌더링
  renderMessages() {
    const chatBody = document.getElementById('adminChatBody')
    
    if (this.messages.length === 0) {
      chatBody.innerHTML = `
        <div class="text-center text-sm text-gray-500 py-4">
          <i class="fas fa-comments text-3xl mb-3 text-gray-300"></i>
          <p>관리자와의 채팅을 시작합니다.</p>
          <p class="text-xs mt-1 text-yellow-600">⚠️ 채팅 기록은 3일 후 자동 삭제됩니다.</p>
        </div>
      `
      return
    }

    chatBody.innerHTML = this.messages.map(message => {
      const isMyMessage = message.sender_id === this.currentUser.id
      const isAdminMessage = message.is_admin_message === 1
      
      return `
        <div class="chat-message ${isMyMessage ? 'sent' : 'received'} mb-3">
          <div class="flex ${isMyMessage ? 'justify-end' : 'justify-start'}">
            <div class="max-w-xs">
              ${!isMyMessage ? `
                <div class="text-xs text-gray-500 mb-1 flex items-center">
                  ${isAdminMessage ? 
                    '<i class="fas fa-shield-alt text-blue-500 mr-1"></i>관리자' : 
                    message.sender_name || '사용자'
                  }
                </div>
              ` : ''}
              
              <div class="chat-bubble ${isMyMessage ? 'sent' : 'received'} ${isAdminMessage ? 'admin-message' : ''}">
                ${this.formatMessage(message.message)}
              </div>
              
              <div class="chat-time text-xs text-gray-400 mt-1 ${isMyMessage ? 'text-right' : 'text-left'}">
                ${this.formatTime(message.created_at)}
              </div>
            </div>
          </div>
        </div>
      `
    }).join('')

    // 스크롤 하단으로 이동
    chatBody.scrollTop = chatBody.scrollHeight
  }

  // 메시지 전송
  async sendMessage() {
    const input = document.getElementById('adminChatInput')
    const message = input.value.trim()
    
    if (!message || !this.chatRoom) return

    try {
      const response = await axios.post('/api/admin/chat/message', {
        roomId: this.chatRoom.id,
        senderId: this.currentUser.id,
        message: message,
        isAdmin: false
      })

      if (response.data.success) {
        input.value = ''
        
        // 메시지 목록에 추가
        this.messages.push(response.data.message)
        this.renderMessages()
        
        // 자동 응답 시뮬레이션 (실제로는 관리자가 직접 응답)
        this.simulateAutoResponse()
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      app.showToast('메시지 전송에 실패했습니다.', 'error')
    }
  }

  // 자동 응답 시뮬레이션 (개발/테스트용)
  simulateAutoResponse() {
    // 관리자 부재시 자동 응답
    setTimeout(async () => {
      const autoResponses = [
        '안녕하세요! 문의해주셔서 감사합니다. 곧 담당자가 답변드리겠습니다.',
        '문의사항을 확인했습니다. 빠른 시일 내에 처리해드리겠습니다.',
        '추가 문의사항이 있으시면 언제든 말씀해주세요.',
        'π-coin 관련 문의는 평균 10분 내에 답변드립니다.'
      ]
      
      const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)]
      
      try {
        const response = await axios.post('/api/admin/chat/message', {
          roomId: this.chatRoom.id,
          senderId: 5, // 관리자 ID (시드 데이터에서 생성된 관리자)
          message: randomResponse,
          isAdmin: true
        })

        if (response.data.success) {
          this.messages.push(response.data.message)
          this.renderMessages()
        }
      } catch (error) {
        console.log('자동 응답 실패 (정상적 상황일 수 있음):', error)
      }
    }, 2000 + Math.random() * 3000) // 2-5초 후 응답
  }

  // 메시지 폴링 시작 (실시간 업데이트)
  startMessagePolling() {
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval)
    }

    this.messagePollingInterval = setInterval(async () => {
      if (this.isOpen && this.chatRoom) {
        const previousCount = this.messages.length
        await this.loadMessages()
        
        // 새 메시지가 있으면 알림음 (선택사항)
        if (this.messages.length > previousCount) {
          this.playNotificationSound()
        }
      }
    }, 3000) // 3초마다 폴링
  }

  // 알림음 재생 (선택사항)
  playNotificationSound() {
    try {
      // Web Audio API를 사용한 간단한 알림음
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // 알림음 실패는 무시
      console.log('알림음 재생 실패:', error)
    }
  }

  // 유틸리티 함수들
  formatMessage(message) {
    // 간단한 텍스트 포맷팅 (링크, 줄바꿈 등)
    return message
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>')
  }

  formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }
}

// 관리자 메시지 스타일 추가
const adminChatStyle = document.createElement('style')
adminChatStyle.textContent = `
  .admin-message {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
    color: white !important;
    border: none !important;
    position: relative;
  }
  
  .admin-message::before {
    content: '🛡️';
    position: absolute;
    top: -2px;
    right: -2px;
    font-size: 12px;
  }
  
  .chat-message.sent .chat-bubble.sent {
    background: linear-gradient(135deg, #ff6600, #ff7e36);
    border: none;
  }
  
  .notification-bounce {
    animation: bounce 0.5s ease-in-out;
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0,-15px,0);
    }
    70% {
      transform: translate3d(0,-7px,0);
    }
    90% {
      transform: translate3d(0,-2px,0);
    }
  }
`
document.head.appendChild(adminChatStyle)

// 페이지 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.adminChat = new AdminChat()
})

// 앱 초기화 후에도 접근 가능하도록
if (typeof window.app !== 'undefined') {
  window.app.adminChat = window.adminChat
}