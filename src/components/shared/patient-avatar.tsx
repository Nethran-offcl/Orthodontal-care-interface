import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, initials } from '@/lib/utils'

const HUES = [170, 32, 205, 262, 340, 95, 15, 230]

function hueForId(id: string) {
  let sum = 0
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
  return HUES[sum % HUES.length]
}

export function PatientAvatar({
  id,
  name,
  className,
  size = 'default',
}: {
  id: string
  name: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
}) {
  const hue = hueForId(id)
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-[10px]' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-9 w-9 text-xs'
  return (
    <Avatar className={cn(sizeClass, className)}>
      <AvatarFallback
        style={{
          backgroundColor: `hsl(${hue} 45% 92%)`,
          color: `hsl(${hue} 45% 30%)`,
        }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
