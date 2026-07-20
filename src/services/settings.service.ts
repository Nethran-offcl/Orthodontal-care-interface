import { clinicProfile as seedClinicProfile, whatsappConfig as seedWhatsappConfig } from '@/mocks'
import type { ClinicProfile } from '@/mocks/clinicProfile'
import type { WhatsAppConfig } from '@/mocks/whatsappConfig'

let clinicProfile: ClinicProfile = { ...seedClinicProfile }
let whatsappConfig: WhatsAppConfig = { ...seedWhatsappConfig, automation: { ...seedWhatsappConfig.automation } }

export const settingsService = {
  async getClinicProfile(): Promise<ClinicProfile> {
    return { ...clinicProfile }
  },
  async updateClinicProfile(patch: Partial<ClinicProfile>): Promise<ClinicProfile> {
    clinicProfile = { ...clinicProfile, ...patch }
    return { ...clinicProfile }
  },
  async getWhatsAppConfig(): Promise<WhatsAppConfig> {
    return { ...whatsappConfig, automation: { ...whatsappConfig.automation } }
  },
  async updateWhatsAppAutomation(patch: Partial<WhatsAppConfig['automation']>): Promise<WhatsAppConfig> {
    whatsappConfig = { ...whatsappConfig, automation: { ...whatsappConfig.automation, ...patch } }
    return { ...whatsappConfig, automation: { ...whatsappConfig.automation } }
  },
}
