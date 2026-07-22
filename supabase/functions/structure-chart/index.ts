const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a dental clinical scribe. Given a doctor's spoken consultation transcript, extract structured chart fields.
Respond with ONLY valid JSON, no markdown fences, no explanation, matching exactly this shape:
{"toothArea": string, "diagnosis": string, "procedure": string, "notes": string, "followUpDays": number|null, "suggestedMedicines": [{"name": string, "dosage": string, "frequency": string, "duration": string}]}
If the transcript doesn't mention a follow-up, set followUpDays to null. If no medicines are mentioned, use an empty array.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const groqKey = Deno.env.get('GROQ_API_KEY')
    if (!groqKey) throw new Error('GROQ_API_KEY is not configured')

    const { transcript, appointmentReason, patientName } = await req.json()
    if (!transcript) throw new Error('transcript is required')

    const userPrompt = `Patient: ${patientName ?? 'unknown'}\nAppointment reason: ${appointmentReason ?? 'unknown'}\nTranscript:\n${transcript}`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq chat completion failed (${groqRes.status}): ${errText}`)
    }

    const data = await groqRes.json()
    const structured = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(structured), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
