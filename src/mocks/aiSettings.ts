export interface AiFeatureToggle {
  key: string
  title: string
  description: string
  enabled: boolean
}

export const aiFeatureToggles: AiFeatureToggle[] = [
  {
    key: 'voice-to-chart',
    title: 'Voice-to-chart',
    description: 'Structure consultation recordings into chart entries automatically.',
    enabled: true,
  },
  {
    key: 'ai-charting',
    title: 'AI charting suggestions',
    description: 'Suggest diagnoses and procedures while a doctor is charting.',
    enabled: true,
  },
  {
    key: 'ai-receptionist',
    title: 'AI receptionist',
    description: 'Answer routine WhatsApp questions before handing off to front desk.',
    enabled: false,
  },
  {
    key: 'smart-followups',
    title: 'Smart follow-up suggestions',
    description: 'Recommend reminder timing based on treatment plan progress.',
    enabled: true,
  },
]
