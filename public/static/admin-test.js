console.log('Admin test script loaded')

// 전역 함수들 (HTML에서 직접 호출되는 함수들)
function savePaymentSettings() {
  console.log('savePaymentSettings called')
}

function testPaymentConnection() {
  console.log('testPaymentConnection called')
}

function resetPaymentSettings() {
  console.log('resetPaymentSettings called')
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded')
})