export default async function handler(req, res) {

  res.status(200).json({ error: 'Not implemented' })
  return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { input } = req.body
  if (!input) {
    return res.status(400).json({ error: 'Missing input' })
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  const messages = [
    {
      role: "system",
      content:
        "你是一个助手，从用户的输入中提取联系人姓名（中文）和要发送的消息，只返回 JSON，如：{\"name\": \"张三\", \"message\": \"我大概七点到\"}",
    },
    {
      role: "user",
      content: input,
    },
  ]

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
      }),
    })

    const data = await response.json()
    const resultText = data.choices?.[0]?.message?.content

    let json
    try {
      json = JSON.parse(resultText)
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON from OpenAI', raw: resultText })
    }

    res.status(200).json(json)
  } catch (err) {
    res.status(500).json({ error: 'API call failed', details: err.message })
  }
}
