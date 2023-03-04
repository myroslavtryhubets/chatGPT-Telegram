const token = 'TELEGRAM_BOT_TOKEN'
const openaiApiKey = 'OPENAI_API_KEY'
const allowedChatIds = [111111, 222222]


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const method = request.method

  if (method === 'POST') {
    const body = await request.json()
    const chatId = body.message.chat.id
    const text = body.message.text
    console.log(text)
    if (!allowedChatIds.includes(chatId)) {
      return new Response('Unauthorized', { status: 401 })
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    }

    const bodyJson = {
      'model': "gpt-3.5-turbo",
      "messages": [
        {
          "role": "user",
          "content": text
        }
      ]
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyJson)
    })

    const openaiResponseBody = await openaiResponse.json()
    const openaiText = openaiResponseBody.choices[0].message.content.trim()
    console.log(openaiText)
    await sendTelegramMessage(chatId, openaiText)

    return new Response('OK')
  }

  return new Response('Not Found', { status: 404 })
}

async function sendTelegramMessage(chatId, text) {
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`

  const body = {
    chat_id: chatId,
    text: text
  }

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}
