import { Card, CardContent } from '@/components/ui/card'
import { ChatThread } from '@/components/shared/chat-thread'
import { useClinicStore } from '@/state/store'
import type { Conversation } from '@/data/types'

export function CommunicationLogTab({
  patientId,
  conversation,
}: {
  patientId: string
  conversation: Conversation | undefined
}) {
  const { sendMessage } = useClinicStore()

  return (
    <Card className="h-[560px]">
      <CardContent className="flex h-full flex-col p-4">
        <ChatThread conversation={conversation} onSend={(text) => sendMessage(patientId, text)} />
      </CardContent>
    </Card>
  )
}
