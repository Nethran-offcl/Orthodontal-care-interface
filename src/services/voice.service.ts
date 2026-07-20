import type { Appointment, Patient } from '@/types'

export interface StructuredChart {
  toothArea: string
  diagnosis: string
  procedure: string
  notes: string
  followUpDays: number | null
  suggestedMedicines: { name: string; dosage: string; frequency: string; duration: string }[]
}

interface Template {
  match: RegExp
  toothArea: string
  diagnosis: string
  procedure: string
  notesTemplate: (firstName: string) => string
  transcriptTemplate: (firstName: string) => string
  followUpDays: number | null
  medicines: { name: string; dosage: string; frequency: string; duration: string }[]
}

const templates: Template[] = [
  {
    match: /root canal/i,
    toothArea: '36 (Lower Left Molar)',
    diagnosis: 'Post-pulpectomy, canals negotiated',
    procedure: 'Canal cleaning & shaping, intracanal dressing placed',
    notesTemplate: () =>
      'Canals cleaned and shaped to working length, irrigated thoroughly. Calcium hydroxide dressing placed with a temporary restoration. No tenderness on percussion.',
    transcriptTemplate: (firstName) =>
      `Continuing the root canal for ${firstName}. Cleaned and shaped the canals, irrigated well with sodium hypochlorite. Placed a calcium hydroxide dressing and a temporary filling on top. No tenderness when I tapped on it, patient tolerated the procedure well. Plan is obturation and crown prep at the next visit.`,
    followUpDays: 3,
    medicines: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Thrice daily', duration: '5 days' },
      { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'As needed for pain', duration: '3 days' },
    ],
  },
  {
    match: /implant/i,
    toothArea: '16 (Upper Right First Molar)',
    diagnosis: 'Post-extraction healed ridge, implant site prepared',
    procedure: 'Implant fixture placement',
    notesTemplate: () =>
      'Flap raised, osteotomy sequence completed, implant placed with good primary stability. Cover screw placed, flap sutured. Osseointegration period expected before next stage.',
    transcriptTemplate: (firstName) =>
      `Implant placement for ${firstName} today. Raised the flap, did the osteotomy step by step, placed the implant and got good primary stability, around 35 Newton centimeters torque. Put the cover screw on, sutured the flap closed. Gave the usual post-op instructions and an antibiotic course.`,
    followUpDays: 90,
    medicines: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Twice daily', duration: '6 days' },
      { name: 'Aceclofenac 100mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '4 days' },
      { name: 'Chlorhexidine mouthwash 0.2%', dosage: '10ml rinse', frequency: 'Twice daily', duration: '10 days' },
    ],
  },
  {
    match: /clean|whitening|polish/i,
    toothArea: 'Full mouth',
    diagnosis: 'Mild plaque and stain accumulation, gums healthy',
    procedure: 'Scaling and polishing',
    notesTemplate: () =>
      'Full mouth scaling and polishing completed. Mild gingival inflammation noted around lower anteriors, oral hygiene instructions reinforced.',
    transcriptTemplate: (firstName) =>
      `Routine cleaning for ${firstName} today. Did scaling and polishing, mild plaque buildup, nothing concerning. Gums look healthy overall, just reminded them about flossing technique. See them again in six months.`,
    followUpDays: 180,
    medicines: [],
  },
  {
    match: /crown/i,
    toothArea: '24 (Upper Left Premolar)',
    diagnosis: 'Prepared tooth ready for permanent crown',
    procedure: 'Crown fitting and cementation',
    notesTemplate: () =>
      'Permanent crown tried in, occlusion and contacts checked and adjusted, cemented with glass ionomer cement. Bite feels comfortable to the patient.',
    transcriptTemplate: (firstName) =>
      `Crown fitting for ${firstName}. Tried in the permanent crown, checked the margins and the bite, adjusted slightly on the high spots, then cemented it. Patient says the bite feels comfortable now.`,
    followUpDays: null,
    medicines: [],
  },
  {
    match: /wisdom|extraction/i,
    toothArea: '38 (Lower Left Third Molar)',
    diagnosis: 'Healing extraction socket',
    procedure: 'Post-operative review',
    notesTemplate: () =>
      'Extraction socket healing well, sutures intact with mild expected inflammation. No signs of dry socket or infection.',
    transcriptTemplate: (firstName) =>
      `Follow-up for ${firstName} after the wisdom tooth extraction. Socket is healing nicely, sutures still in place, no signs of infection or dry socket. Told them to continue warm saline rinses.`,
    followUpDays: 6,
    medicines: [],
  },
  {
    match: /ortho|braces|adjustment/i,
    toothArea: 'Full arch (Braces)',
    diagnosis: 'Ongoing orthodontic correction, on schedule',
    procedure: 'Archwire adjustment, elastic replacement',
    notesTemplate: () =>
      'Archwire tension adjusted, elastics replaced. Good progress on alignment, no broken brackets noted.',
    transcriptTemplate: (firstName) =>
      `Monthly ortho adjustment for ${firstName}. Replaced the elastics, adjusted the archwire tension a bit. Good progress on the alignment, no broken brackets. Next adjustment in four weeks.`,
    followUpDays: 30,
    medicines: [],
  },
]

const fallbackTemplate: Template = {
  match: /.*/,
  toothArea: 'General examination',
  diagnosis: 'No acute findings on examination',
  procedure: 'Clinical examination and consultation',
  notesTemplate: () => 'Examined the patient, discussed findings and next steps. No immediate treatment required.',
  transcriptTemplate: (firstName) =>
    `Saw ${firstName} today for a general check. Examined the mouth, nothing urgent to flag right now. Discussed the findings with them and what to watch for.`,
  followUpDays: null,
  medicines: [],
}

export const voiceService = {
  /**
   * Simulates recording + speech-to-text latency. A real implementation would
   * await the actual transcription API call here instead of a fixed delay.
   */
  async simulateTranscription(): Promise<void> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 1500))
  },

  /** Structures a (simulated) transcript into chart fields for the consultation workspace. */
  async generateStructuredChart(
    appointment: Appointment,
    patient: Patient,
  ): Promise<{ transcript: string; structured: StructuredChart }> {
    const template = templates.find((t) => t.match.test(appointment.reason)) ?? fallbackTemplate
    const firstName = patient.name.split(' ')[0]

    return {
      transcript: template.transcriptTemplate(firstName),
      structured: {
        toothArea: template.toothArea,
        diagnosis: template.diagnosis,
        procedure: template.procedure,
        notes: template.notesTemplate(firstName),
        followUpDays: template.followUpDays,
        suggestedMedicines: template.medicines,
      },
    }
  },
}
