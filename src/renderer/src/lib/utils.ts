import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export enum StreamStatus {
  NOT_STARTED = 0,
  PREPARING_TO_RECORD = 1,
  MONITORING = 2,
  RECORDING = 3,
  VIDEO_FORMAT_CONVERSION = 4
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function checkUrlValid(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}
