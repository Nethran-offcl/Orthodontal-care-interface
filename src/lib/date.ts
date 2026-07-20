import { addDays, format, setHours, setMinutes, setSeconds, subDays } from 'date-fns'

export const today = new Date()

export function iso(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export function daysFromToday(offset: number) {
  return iso(offset >= 0 ? addDays(today, offset) : subDays(today, Math.abs(offset)))
}

export function dateTimeAt(offsetDays: number, hour: number, minute: number) {
  const base = offsetDays >= 0 ? addDays(today, offsetDays) : subDays(today, Math.abs(offsetDays))
  return setSeconds(setMinutes(setHours(base, hour), minute), 0).toISOString()
}

export const TODAY_ISO = iso(today)
