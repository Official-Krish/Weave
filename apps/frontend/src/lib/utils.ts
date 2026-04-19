import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function findDuration(startedAt: Date , endedAt: Date): string {
  return `${Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))} min`
}