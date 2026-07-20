import { useState } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { aiService } from '@/services'
import { useAppState } from '@/state/app-state'

interface QaTurn {
  id: string
  question: string
  answer: string
}

const suggestions = [
  'What are the clinic hours?',
  'What is the reschedule policy?',
  'How does broadcast approval work?',
]

export function KnowledgeAssistantDialog() {
  const { aiAssistantOpen, setAiAssistantOpen } = useAppState()
  const [question, setQuestion] = useState('')
  const [turns, setTurns] = useState<QaTurn[]>([])

  async function ask(q: string) {
    const text = q.trim()
    if (!text) return
    const answer = await aiService.answerKnowledgeQuestion(text)
    setTurns((t) => [...t, { id: `${Date.now()}`, question: text, answer }])
    setQuestion('')
  }

  return (
    <Dialog open={aiAssistantOpen} onOpenChange={setAiAssistantOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Knowledge Assistant
          </DialogTitle>
          <DialogDescription>Ask about clinic policy, workflows, or how a feature works.</DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-3 overflow-y-auto scrollbar-thin">
          {turns.length === 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/60"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            turns.map((t) => (
              <div key={t.id} className="space-y-1.5">
                <p className="text-sm font-medium">{t.question}</p>
                <p className="flex items-start gap-1.5 rounded-lg bg-secondary/50 p-3 text-sm leading-relaxed text-foreground">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {t.answer}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask(question)}
            placeholder="Ask a question…"
          />
          <Button size="icon" onClick={() => ask(question)} disabled={!question.trim()} aria-label="Ask">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
