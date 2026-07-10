import { useState } from 'react'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ClinicProfileTab() {
  const [name, setName] = useState('Sunrise Dental')
  const [phone, setPhone] = useState('+91 80 4012 3456')
  const [hours, setHours] = useState('Mon–Sat, 9:00 AM – 7:00 PM')
  const [address, setAddress] = useState('142 Brigade Road, Bengaluru, Karnataka 560025')

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
        <Button onClick={() => toast.success('Clinic profile updated')}>Save changes</Button>
      </CardFooter>
    </Card>
  )
}
