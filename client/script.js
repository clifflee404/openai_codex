import botAvatar  from './assets/bot.svg'
import userAvatar from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

// todo 服务端获取 bot 回复内容
const SERVER_URL = "http://localhost:5001/"

let loadInterval

// bot 思考中 loading 效果
function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    // 更新 loading 指示器内容
    element.textContent += '.'

    if(element.textContent === '....'){
      element.textContent = ''
    }
  }, 300)
}

// 文字逐个显示效果
function typeText(element, text){
  let index = 0

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId(){
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

// 用户问题和 bot 回复条纹分格消息
function chatStripe(isAi, value, uniqueId){
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
          <img
            src="${isAi ? botAvatar : userAvatar}"
            alt="${isAi ? 'bot' : 'user'}"
          />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)
  console.log('---formData:', data)

  // 用户的问题
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // 清空 textarea
  form.reset()

  // bot 的回复内容
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // 聚焦页面滚动到底部
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // 获取 bot 回复内容的 div
  const messageDiv = document.getElementById(uniqueId)

  // 显示 loading 效果
  loader(messageDiv)

  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  // 清空 loading 效果
  clearInterval(loadInterval)
  messageDiv.innerHTML = " "

  if(response.ok){
    const data = await response.json()
    // trims any trailing spaces/'\n' 
    const parseData = data.bot.trim() 

    typeText(messageDiv, parseData)
  }else {
    const err = await response.text()

    messageDiv.innerHTML = 'Something went wrong'
    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13){
    // 按 Enter 键
    handleSubmit(e)
  }
})


