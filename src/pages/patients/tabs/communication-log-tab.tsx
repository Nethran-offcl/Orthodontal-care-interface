import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConversationStatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { ChatThread } from '@/components/shared/chat-thread'
import { useClinicStore } from '@/state/store'
import type { Conversation } from '@/types'

const channelLabel: Record<Conversation['channel'], string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  email: 'Email',
}

export function CommunicationLogTab({
  patientId,
  conversation,
}: {
  patientId: string
  conversation: Conversation | undefined
}) {
  const { sendMessage } = useClinicStore()

  return (
    <Card className="h-[600px]">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm">Communication history</CardTitle>
          {conversation && (
            <>
              <Badge variant="secondary">{channelLabel[conversation.channel]}</Badge>
              <ConversationStatusBadge status={conversation.status} />
            </>
          )}
        </div>
        <Link to="/messaging" className="flex items-center gap-1 text-xs text-primary hover:underline">
          Open in Communication Center
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex h-[calc(100%-56px)] flex-col p-4 pt-0">
        <ChatThread conversation={conversation} onSend={(text) => sendMessage(patientId, text)} />
      </CardContent>
    </Card>
  )
}
