const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const groqKey = Deno.env.get('GROQ_API_KEY')
    if (!groqKey) throw new Error('GROQ_API_KEY is not configured')

    const contentType = req.headers.get('content-type') || 'audio/webm'
    const audioBytes = await req.arrayBuffer()

    const form = new FormData()
    form.append('file', new File([audioBytes], 'recording.webm', { type: contentType }))
    form.append('model', 'whisper-large-v3-turbo')

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}` },
      body: form,
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq transcription failed (${groqRes.status}): ${errText}`)
    }

    const data = await groqRes.json()
    return new Response(JSON.stringify({ transcript: data.text as string }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
