import { useEffect, useRef, useState } from 'react'
import { Check, CheckCheck, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { cn, formatDate, formatTime } from '@/lib/utils'
import type { Conversation } from '@/data/types'

export function ChatThread({
  conversation,
  onSend,
  placeholder = 'Type a WhatsApp message…',
  inputDisabled = false,
  draft: controlledDraft,
  onDraftChange,
}: {
  conversation: Conversation | undefined
  onSend: (text: string) => void
  placeholder?: string
  inputDisabled?: boolean
  draft?: string
  onDraftChange?: (value: string) => void
}) {
  const [internalDraft, setInternalDraft] = useState('')
  const draft = controlledDraft ?? internalDraft
  const setDraft = onDraftChange ?? setInternalDraft
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [conversation?.messages.length])

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  let lastDate = ''

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-1 py-2">
        {!conversation || conversation.messages.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="h-5 w-5" />}
            title="No messages yet"
            description="Send the first WhatsApp message to start the conversation."
            className="border-none py-10"
          />
        ) : (
          conversation.messages.map((m) => {
            const dateLabel = formatDate(m.time, { day: 'numeric', month: 'short' })
            const showDateDivider = dateLabel !== lastDate
            lastDate = dateLabel
            return (
              <div key={m.id}>
                {showDateDivider && (
                  <div className="my-3 flex items-center justify-center">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground">
                      {dateLabel}
                    </span>
                  </div>
                )}
                <div className={cn('flex', m.sender === 'clinic' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-xs',
                      m.sender === 'clinic'
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-secondary text-secondary-foreground',
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-snug">{m.text}</p>
                    <div
                      className={cn(
                        'mt-1 flex items-center justify-end gap-1 text-[10px]',
                        m.sender === 'clinic' ? 'text-primary-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {formatTime(m.time)}
                      {m.sender === 'clinic' &&
                        (m.status === 'read' ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : m.status === 'delivered' ? (
                          <CheckCheck className="h-3 w-3 opacity-60" />
                        ) : (
                          <Check className="h-3 w-3 opacity-60" />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder={placeholder}
          disabled={inputDisabled}
        />
        <Button size="icon" onClick={handleSend} disabled={inputDisabled || !draft.trim()} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
