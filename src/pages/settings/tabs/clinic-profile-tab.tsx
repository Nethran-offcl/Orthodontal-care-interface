import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { settingsService } from '@/services'

export function ClinicProfileTab() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hours, setHours] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    let alive = true
    settingsService.getClinicProfile().then((profile) => {
      if (!alive) return
      setName(profile.name)
      setPhone(profile.phone)
      setHours(profile.hours)
      setAddress(profile.address)
    })
    return () => {
      alive = false
    }
  }, [])

  async function handleSave() {
    await settingsService.updateClinicProfile({ name, phone, hours, address })
    toast.success('Clinic profile updated')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Clinic profile
        </CardTitle>
        <CardDescription>
          Used in WhatsApp message personalization and printed prescriptions.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="clinic-name">Clinic name</Label>
          <Input id="clinic-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clinic-phone">Phone</Label>
          <Input id="clinic-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clinic-hours">Working hours</Label>
          <Input id="clinic-hours" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="clinic-address">Address</Label>
          <Textarea id="clinic-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save changes</Button>
      </CardFooter>
    </Card>
  )
}
