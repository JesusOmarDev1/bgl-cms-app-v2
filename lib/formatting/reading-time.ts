import { htmlToText } from "@/lib/formatting/sanitize"
import { readingTime as calculateReadingTime } from "reading-time-estimator"

export type ReadingTimeResult = {
  minutes: number
  seconds: number
  label: string
}

function extractTextFromBlocks(blocks: unknown[]): string {
  const htmlParts: string[] = []

  function walk(v: unknown) {
    if (typeof v === "string" && /<[a-z][\s>]/i.test(v)) {
      htmlParts.push(v)
    } else if (v && typeof v === "object") {
      ;(Array.isArray(v) ? v : Object.values(v)).forEach(walk)
    }
  }

  walk(blocks)
  return htmlParts.join(" ")
}

export function getBlocksPlainText(blocks?: unknown[] | null): string {
  if (!blocks?.length) return ""
  return htmlToText(extractTextFromBlocks(blocks))
}

export function getReadingTime(blocks?: unknown[] | null): ReadingTimeResult {
  const text = getBlocksPlainText(blocks)
  if (!text) return { minutes: 0, seconds: 0, label: "" }

  const result = calculateReadingTime(text, {
    wordsPerMinute: 300,
    language: "es",
  })

  const rawMinutes = result.words / 300

  if (rawMinutes < 1) {
    const seconds = Math.max(1, Math.round(rawMinutes * 60))
    return { minutes: 0, seconds, label: `${seconds} seg de lectura` }
  }

  const minutes = Math.max(1, Math.round(rawMinutes))
  return { minutes, seconds: minutes * 60, label: `${minutes} min de lectura` }
}
