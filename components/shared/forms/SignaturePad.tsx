"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  Ref,
} from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react"
import type { TargetAndTransition, Transition } from "motion/react"
import {
  Check,
  Download,
  Eraser,
  Play,
  Redo2,
  Square,
  Undo2,
  X,
} from "lucide-react"
import { cn } from "cn"
import { motionTokens } from "@/lib/animation/motion/motion-tokens"

/** A sampled point: position in pad units, pen pressure between 0 and 1 (or -1 when the device has none), and ms since the stroke began. */
export interface InkPoint {
  x: number
  y: number
  p: number
  t: number
}
export type InkColor = "black" | "blue" | "violet"
export type InkWidth = "fine" | "medium" | "bold"
export interface InkStroke {
  id: string
  points: InkPoint[]
  color: InkColor
  width: InkWidth
  /** When the stroke began, in ms. Replay keeps the real rhythm between strokes. */
  at: number
}

export interface OutlineOptions {
  /** Diameter of the stroke at half pressure, in pad units. */
  size: number
  /** How much pressure changes the width, from 0 to 1. */
  thinning?: number
  /** How far each point trails the pointer, from 0 to 1. Higher is smoother but lags more. */
  streamline?: number
  /** Derive pressure from speed when the device reports none: fast is thin, slow is full. */
  simulatePressure?: boolean
  /** Length over which the start and the end taper, in pad units. */
  taperStart?: number
  taperEnd?: number
  /** False while the stroke is still being drawn, so the end does not taper yet. */
  last?: boolean
}

/** Pad coordinates. Strokes are stored in this space and scale with the pad. */
export const PAD_WIDTH = 600,
  PAD_HEIGHT = 260

const INK: Record<InkColor, { label: string; export: string }> = {
  black: { label: "Black ink", export: "#17171a" },
  blue: { label: "Blue ink", export: "#1d3fae" },
  violet: { label: "Violet ink", export: "#5b35c8" },
}
const WIDTHS: Record<InkWidth, { label: string; size: number }> = {
  fine: { label: "Fine", size: 3.4 },
  medium: { label: "Medium", size: 5.6 },
  bold: { label: "Bold", size: 8.4 },
}
const COLORS = Object.keys(INK) as InkColor[]
const SIZES = Object.keys(WIDTHS) as InkWidth[]

type Vec = [number, number]
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]]
const mul = (a: Vec, n: number): Vec => [a[0] * n, a[1] * n]
const lerp = (a: Vec, b: Vec, t: number): Vec => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
]
const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1])
const norm = (a: Vec): Vec => {
  const l = Math.hypot(a[0], a[1])
  return l ? [a[0] / l, a[1] / l] : [0, 0]
}
const perp = (a: Vec): Vec => [a[1], -a[0]]
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1]
const rotAround = (p: Vec, c: Vec, r: number): Vec => {
  const s = Math.sin(r),
    co = Math.cos(r),
    px = p[0] - c[0],
    py = p[1] - c[1]
  return [px * co - py * s + c[0], px * s + py * co + c[1]]
}
const easeOut = (t: number) => t * (2 - t)

/**
 * Turns sampled points into the outline of a variable width stroke, in the spirit of perfect-freehand. Points are streamlined
 * toward the pointer, width follows pen pressure or, for a mouse or finger, speed, the ends taper, sharp turns get round joins,
 * and both ends get round caps. Returns the outline polygon; pass it to `outlineToPath` for SVG.
 */
export function getStrokeOutline(
  input: InkPoint[],
  options: OutlineOptions
): Vec[] {
  const {
    size,
    thinning = 0.62,
    streamline = 0.42,
    simulatePressure = true,
    taperStart = 0,
    taperEnd = 0,
    last = true,
  } = options
  const [head] = input
  if (!head) return []
  const usePen = !simulatePressure && input.some((point) => point.p > 0)

  // Streamline: each point eases toward the raw input, which removes jitter without a smoothing pass.
  const pts: { at: Vec; pressure: number; length: number; vector: Vec }[] = []
  let prev: Vec = [head.x, head.y],
    length = 0
  const start = {
    at: prev,
    pressure: usePen ? head.p : 0.5,
    length: 0,
    vector: [1, 0] as Vec,
  }
  pts.push(start)
  for (let i = 1; i < input.length; i++) {
    const sample = input[i]!
    const raw: Vec = [sample.x, sample.y]
    const at =
      i === input.length - 1 && last ? raw : lerp(prev, raw, 1 - streamline)
    const d = dist(at, prev)
    if (d < 0.4) continue
    length += d
    pts.push({
      at,
      pressure: usePen ? sample.p : 0.5,
      length,
      vector: norm(sub(prev, at)),
    })
    prev = at
  }
  const second = pts[1]
  if (second) start.vector = second.vector
  const total = length

  // A dot: a round mark sized by the first pressure.
  if (pts.length === 1) {
    const r = Math.max(
      0.6,
      size * (0.5 - thinning * (0.5 - start.pressure)) * 0.9
    )
    return Array.from({ length: 18 }, (_, i) =>
      add(
        start.at,
        mul(
          [Math.cos((i / 18) * Math.PI * 2), Math.sin((i / 18) * Math.PI * 2)],
          r
        )
      )
    )
  }

  const left: Vec[] = [],
    right: Vec[] = []
  let pressure = start.pressure,
    prevVector = start.vector
  const radii: number[] = []
  for (let i = 0; i < pts.length; i++) {
    const point = pts[i]!
    if (!usePen) {
      // Speed thins the line: a long step between samples reads as a fast stroke.
      const step = i === 0 ? 0 : dist(point.at, pts[i - 1]!.at)
      const speed = Math.min(1, step / size)
      const target = Math.min(1, 1 - speed)
      pressure = Math.min(1, pressure + (target - pressure) * speed * 0.3)
    } else {
      pressure = point.pressure
    }
    let radius = Math.max(0.25, size * (0.5 - thinning * (0.5 - pressure)))
    const ts = taperStart ? easeOut(Math.min(1, point.length / taperStart)) : 1
    const te =
      taperEnd && last
        ? easeOut(Math.min(1, (total - point.length) / taperEnd))
        : 1
    radius = Math.max(0.12 * size, radius * Math.min(ts, te))
    radii.push(radius)

    const next = pts[i + 1]?.vector ?? point.vector
    const offset = mul(perp(lerp(next, point.vector, 0.5)), radius)
    // A sharp turn: sweep round the corner so the outline does not pinch.
    if (i > 0 && i < pts.length - 1 && dot(point.vector, next) < -0.2) {
      const corner = mul(perp(prevVector), radius)
      for (let t = 0; t <= 1; t += 1 / 12) {
        left.push(rotAround(sub(point.at, corner), point.at, Math.PI * t))
        right.push(rotAround(add(point.at, corner), point.at, -Math.PI * t))
      }
    } else {
      left.push(sub(point.at, offset))
      right.push(add(point.at, offset))
    }
    prevVector = point.vector
  }

  // Round caps: half circles swept around the first and last points, on the side facing away from the stroke.
  const cap = (center: Vec, from: Vec, to: Vec, away: Vec) => {
    const out: Vec[] = []
    const r = dist(center, from),
      start = Math.atan2(from[1] - center[1], from[0] - center[0])
    const mid = start + Math.PI / 2
    const sign = dot([Math.cos(mid), Math.sin(mid)], away) >= 0 ? 1 : -1
    for (let k = 1; k < 12; k++) {
      const a = start + (sign * Math.PI * k) / 12
      out.push([center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r])
    }
    out.push(to)
    return out
  }
  const end = pts[pts.length - 1]!
  const endCap = cap(
    end.at,
    left[left.length - 1]!,
    right[right.length - 1]!,
    mul(end.vector, -1)
  )
  const startCap = cap(start.at, right[0]!, left[0]!, start.vector)
  return [...left, ...endCap, ...right.reverse(), ...startCap]
}

const round = (value: number) => Math.round(value * 100) / 100
/** Draws an outline as one smooth closed path, with quadratic curves through the midpoints of its edges. */
export function outlineToPath(points: Vec[]) {
  if (points.length < 3) return ""
  let d = `M${round(points[0]![0])} ${round(points[0]![1])} Q`
  for (let i = 0; i < points.length; i++) {
    const [x0, y0] = points[i]!,
      [x1, y1] = points[(i + 1) % points.length]!
    d += `${round(x0)} ${round(y0)} ${round((x0 + x1) / 2)} ${round((y0 + y1) / 2)} `
  }
  return `${d}Z`
}

function strokeOptions(
  stroke: Pick<InkStroke, "width" | "points">,
  last: boolean
): OutlineOptions {
  const size = WIDTHS[stroke.width].size
  const pen = stroke.points.some((point) => point.p > 0)
  return {
    size,
    simulatePressure: !pen,
    taperStart: size * 1.5,
    taperEnd: pen ? 0 : size * 5,
    last,
  }
}
/** The SVG path of a stroke, or of its first `upTo` ms while it is replayed. */
export function strokePath(
  stroke: Pick<InkStroke, "width" | "points">,
  upTo = Infinity
) {
  const all = stroke.points
  const done = upTo >= all[all.length - 1]!.t
  const points = done ? all : all.filter((point) => point.t <= upTo)
  return outlineToPath(getStrokeOutline(points, strokeOptions(stroke, done)))
}

/** Tight bounds of the ink, padded, for export. */
function inkBounds(strokes: InkStroke[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (const stroke of strokes)
    for (const point of stroke.points) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }
  const pad = 16
  return {
    x: Math.floor(minX - pad),
    y: Math.floor(minY - pad),
    width: Math.ceil(maxX - minX + pad * 2),
    height: Math.ceil(maxY - minY + pad * 2),
  }
}

/** A standalone SVG of the signature, cropped to the ink, with print ink colors. */
export function signatureToSvg(strokes: InkStroke[]) {
  if (!strokes.length) return ""
  const box = inkBounds(strokes)
  const paths = strokes
    .map(
      (stroke) =>
        `<path d="${strokePath(stroke)}" fill="${INK[stroke.color].export}"/>`
    )
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.width} ${box.height}" width="${box.width}" height="${box.height}">${paths}</svg>`
}

/** A transparent PNG of the signature, cropped to the ink, at `scale` times pad resolution. */
export function signatureToPng(strokes: InkStroke[], scale = 3): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!strokes.length) return reject(new Error("Nothing to export"))
    const box = inkBounds(strokes)
    const canvas = document.createElement("canvas")
    canvas.width = box.width * scale
    canvas.height = box.height * scale
    const ctx = canvas.getContext("2d")
    if (!ctx) return reject(new Error("Canvas is unavailable"))
    ctx.scale(scale, scale)
    ctx.translate(-box.x, -box.y)
    for (const stroke of strokes) {
      ctx.fillStyle = INK[stroke.color].export
      ctx.fill(new Path2D(strokePath(stroke)))
    }
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      "image/png"
    )
  })
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * A signature field with real ink. Width follows pen pressure, or speed for a mouse or finger, and the ends taper like a nib
 * lifting off. It keeps undo and redo, clears with a wipe across the pad, replays the signature in its original rhythm,
 * and exports a cropped PNG or SVG. A "Sign here" hint rests on the baseline until the first stroke.
 * Keyboard: Mod+Z undoes, Shift+Mod+Z or Mod+Y redoes, and Delete clears.
 */
export interface SignaturePadProps {
  /** Printed under the baseline, such as the signer's name. */
  signer?: string
  /** Resting hint on the baseline before the first stroke. */
  hint?: string
  defaultColor?: InkColor
  defaultWidth?: InkWidth
  /** Receives the strokes after every change. */
  onChange?: (strokes: InkStroke[]) => void
  /** File name for exports, without extension. */
  fileName?: string
  /** Accessible name of the drawing surface. */
  label?: string
  className?: string
}

/** `fresh` is the stroke just drawn: it is already on screen from the live path, so it appears without a fade. */
interface History {
  past: InkStroke[][]
  present: InkStroke[]
  future: InkStroke[][]
  fresh: string | null
}
type Saved = null | "png" | "svg" | "failed"
type ReplayState = { at: number; offsets: number[] }
type LiveStroke = { id: number; stroke: InkStroke; stamp: number }

const { spring, duration, ease, blur } = motionTokens
const subscribe = () => () => {}
function useReducedFlag() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  return !!useReducedMotion() && hydrated
}

async function saveSignatureFile(
  kind: "png" | "svg",
  strokes: InkStroke[],
  fileName: string,
  empty: boolean,
  savedTimer: { current: number },
  setSaved: (saved: Saved) => void,
  setStatus: (status: string) => void
) {
  if (empty) return
  window.clearTimeout(savedTimer.current)
  try {
    const blob =
      kind === "svg"
        ? new Blob([signatureToSvg(strokes)], { type: "image/svg+xml" })
        : await signatureToPng(strokes)
    download(blob, `${fileName}.${kind}`)
    setSaved(kind)
    setStatus(`Saved ${fileName}.${kind}`)
  } catch {
    setSaved("failed")
    setStatus("Export failed. Try again.")
  }
  savedTimer.current = window.setTimeout(() => setSaved(null), 1800)
}

function toggleSignatureReplay(
  replaying: boolean,
  empty: boolean,
  live: { current: LiveStroke | null },
  strokes: InkStroke[],
  replayFrame: { current: number },
  settleWipe: () => void,
  stopReplay: () => void,
  setReplay: (replay: ReplayState | null) => void,
  setStatus: (status: string) => void
) {
  if (replaying) {
    stopReplay()
    setStatus("Replay stopped")
    return
  }
  if (empty || live.current) return
  settleWipe()
  const { offsets, speed, total } = getReplayTimeline(strokes)
  const begin = performance.now()
  const tick = (now: number) => {
    const at = (now - begin) * speed
    if (at >= total) {
      setReplay(null)
      setStatus("Replay finished")
      return
    }
    setReplay({ at, offsets })
    replayFrame.current = requestAnimationFrame(tick)
  }
  setReplay({ at: 0, offsets })
  setStatus("Replaying signature")
  replayFrame.current = requestAnimationFrame(tick)
}

function restoreSignatureHistory(
  action: "undo" | "redo",
  history: History,
  live: { current: LiveStroke | null },
  settleWipe: () => void,
  stopReplay: () => void,
  setHistory: (update: (current: History) => History) => void,
  setStatus: (status: string) => void
) {
  if ((action === "undo" ? !history.past.length : !history.future.length) || live.current)
    return
  settleWipe()
  stopReplay()
  setHistory((current) =>
    action === "undo"
      ? current.past.length
        ? {
            past: current.past.slice(0, -1),
            present: current.past[current.past.length - 1]!,
            future: [current.present, ...current.future],
            fresh: null,
          }
        : current
      : current.future.length
        ? {
            past: [...current.past, current.present],
            present: current.future[0]!,
            future: current.future.slice(1),
            fresh: null,
          }
        : current
  )
  setStatus(action === "undo" ? "Undone" : "Redone")
}

function finishSignatureStroke(
  event: ReactPointerEvent<HTMLDivElement>,
  live: { current: LiveStroke | null },
  strokes: InkStroke[],
  livePath: { current: SVGPathElement | null },
  commit: (strokes: InkStroke[], fresh?: string | null) => void,
  setDrawing: (drawing: boolean) => void,
  setStatus: (status: string) => void
) {
  const current = live.current
  if (!current || current.id !== event.pointerId) return
  live.current = null
  commit([...strokes, current.stroke], current.stroke.id)
  livePath.current?.setAttribute("d", "")
  setDrawing(false)
  setStatus(`Stroke added. ${strokes.length + 1} in the signature.`)
}

function appendPointerSamples(
  event: ReactPointerEvent<HTMLDivElement>,
  current: LiveStroke,
  toPad: (point: { clientX: number; clientY: number }) => { x: number; y: number },
  paintLive: () => void
) {
  const samples =
    typeof event.nativeEvent.getCoalescedEvents === "function"
      ? event.nativeEvent.getCoalescedEvents()
      : []
  const list = samples.length ? samples : [event.nativeEvent]
  for (const sample of list) {
    const { x, y } = toPad(sample)
    const pen = sample.pointerType === "pen" && sample.pressure > 0
    current.stroke.points.push({
      x,
      y,
      p: pen ? sample.pressure : -1,
      t: Math.max(
        current.stroke.points[current.stroke.points.length - 1]!.t,
        sample.timeStamp - current.stamp
      ),
    })
  }
  paintLive()
}

function startSignatureStroke(
  event: ReactPointerEvent<HTMLDivElement>,
  options: {
    live: { current: LiveStroke | null }
    counter: { current: number }
    pad: { current: HTMLDivElement | null }
    uid: string
    color: InkColor
    width: InkWidth
    replaying: boolean
    toPad: (point: { clientX: number; clientY: number }) => { x: number; y: number }
    settleWipe: () => void
    stopReplay: () => void
    setDrawing: (drawing: boolean) => void
    paintLive: () => void
  }
) {
  const {
    live,
    counter,
    pad,
    uid,
    color,
    width,
    replaying,
    toPad,
    settleWipe,
    stopReplay,
    setDrawing,
    paintLive,
  } = options
  if (live.current || (event.pointerType === "mouse" && event.button !== 0))
    return
  event.preventDefault()
  settleWipe()
  if (replaying) stopReplay()
  pad.current?.focus({ preventScroll: true })
  event.currentTarget.setPointerCapture(event.pointerId)
  const { x, y } = toPad(event)
  const now = event.nativeEvent.timeStamp
  counter.current += 1
  const pen = event.pointerType === "pen" && event.pressure > 0
  live.current = {
    id: event.pointerId,
    stamp: event.nativeEvent.timeStamp,
    stroke: {
      id: `${uid}-${counter.current}`,
      color,
      width,
      at: now,
      points: [{ x, y, p: pen ? event.pressure : -1, t: 0 }],
    },
  }
  setDrawing(true)
  paintLive()
}

function handleSignatureKey(
  event: ReactKeyboardEvent<HTMLDivElement>,
  replaying: boolean,
  actions: {
    undo: () => void
    redo: () => void
    clear: () => void
    stopReplay: () => void
  }
) {
  const mod = event.metaKey || event.ctrlKey
  const key = event.key.toLowerCase()
  if (mod && key === "z") {
    event.preventDefault()
    if (event.shiftKey) actions.redo()
    else actions.undo()
  } else if (mod && key === "y") {
    event.preventDefault()
    actions.redo()
  } else if (
    !mod &&
    (event.key === "Delete" || event.key === "Backspace") &&
    event.currentTarget === event.target
  ) {
    event.preventDefault()
    actions.clear()
  } else if (event.key === "Escape" && replaying) {
    actions.stopReplay()
  }
}

function getReplayTimeline(strokes: InkStroke[]) {
  const offsets: number[] = []
  let cursor = 0
  strokes.forEach((stroke, index) => {
    if (index > 0) {
      const previous = strokes[index - 1]!
      const gap =
        stroke.at -
        (previous.at + previous.points[previous.points.length - 1]!.t)
      cursor += Math.min(260, Math.max(90, gap))
    }
    offsets.push(cursor)
    cursor += stroke.points[stroke.points.length - 1]!.t
  })
  return { offsets, speed: Math.max(1, cursor / 3200), total: cursor + 120 }
}

function getSignaturePresentation(
  empty: boolean,
  drawing: boolean,
  wiping: boolean,
  reduced: boolean
) {
  return {
    showHint: empty && !drawing && !wiping,
    hintHidden: reduced
      ? { opacity: 0 }
      : { opacity: 0, y: 6, scale: 0.97, filter: `blur(${blur.soft}px)` },
    transition: reduced ? { duration: duration.instant } : spring.snappy,
  }
}

function getVisibleStrokes(
  strokes: InkStroke[],
  replay: ReplayState | null,
  color: InkColor
) {
  let nib: InkPoint | null = null
  let nibColor = color
  const visible = strokes.map((stroke, index) => {
    if (replay === null) return { stroke, d: null }
    const local = replay.at - (replay.offsets[index] ?? 0)
    const lastT = stroke.points[stroke.points.length - 1]!.t
    if (local < 0) return { stroke, d: "" }
    if (local >= lastT) return { stroke, d: null }
    nib =
      stroke.points.findLast((point) => point.t <= local) ?? stroke.points[0]!
    nibColor = stroke.color
    return { stroke, d: strokePath(stroke, local) }
  })
  return { visible, nib: nib as InkPoint | null, nibColor }
}

interface VisibleStroke {
  stroke: InkStroke
  d: string | null
}

interface SignatureSurfaceProps {
  padRef: Ref<HTMLDivElement>
  inkRef: Ref<HTMLDivElement>
  liveRef: Ref<SVGPathElement>
  label: string
  count: number
  empty: boolean
  drawing: boolean
  wiping: boolean
  signer?: string
  hint: string
  hintHidden: TargetAndTransition
  showHint: boolean
  reduced: boolean
  uid: string
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void
  visible: VisibleStroke[]
  fresh: string | null
  color: InkColor
  width: InkWidth
  nib: InkPoint | null
  nibColor: InkColor
}

function SignatureSurface({
  padRef,
  inkRef,
  liveRef,
  label,
  count,
  empty,
  drawing,
  wiping,
  signer,
  hint,
  hintHidden,
  showHint,
  reduced,
  uid,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  visible,
  fresh,
  color,
  width,
  nib,
  nibColor,
}: SignatureSurfaceProps) {
  return (
    <div
      ref={padRef}
      className="relative isolate aspect-[600/260] cursor-crosshair touch-none overflow-hidden rounded-[var(--radius-panel)] border border-[color:var(--border)] bg-[var(--surface)] select-none [-webkit-user-select:none] [transition:border-color_var(--duration-fast)_var(--ease-standard)] data-[drawing]:border-[color:var(--border-strong)]"
      tabIndex={0}
      role="img"
      aria-roledescription="signature pad"
      aria-label={`${label}. ${empty ? "Empty." : `${count} ${count === 1 ? "stroke" : "strokes"}.`} Draw with a pointer, pen, or finger.`}
      aria-describedby={`${uid}-keys`}
      data-drawing={drawing ? "" : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <X
          className="absolute top-[72%] left-[7%] [translate:0_calc(-100%-6px)] text-[color:var(--text-muted)]"
          size={14}
          strokeWidth={1.75}
        />
        <span className="absolute top-[72%] right-[7%] left-[7%] [border-top:1.5px_dashed_var(--border-strong)]" />
        {signer && (
          <span className="absolute top-[calc(72%+8px)] left-[7%] text-[length:var(--text-xs)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
            {signer}
          </span>
        )}
        <AnimatePresence initial={false}>
          {showHint && (
            <motion.span
              key="hint"
              className="absolute top-[72%] left-1/2 [translate:-50%_calc(-100%-8px)] text-[length:var(--text-lg)] leading-[var(--leading-body)] whitespace-nowrap text-[color:var(--text-muted)]"
              initial={hintHidden}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{
                ...hintHidden,
                transition: {
                  duration: duration.fast,
                  ease: [...ease.standard],
                },
              }}
              transition={
                reduced
                  ? { duration: duration.instant }
                  : { duration: duration.standard, ease: [...ease.enter] }
              }
            >
              {hint}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div
        ref={inkRef}
        className="pointer-events-none absolute inset-0 [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible"
      >
        <svg
          viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <AnimatePresence initial={false}>
            {visible.map(({ stroke, d }) => (
              <motion.path
                key={stroke.id}
                className="fill-[var(--ink-black)] data-[color=blue]:fill-[var(--ink-blue)] data-[color=violet]:fill-[var(--ink-violet)]"
                data-color={stroke.color}
                d={d ?? strokePath(stroke)}
                initial={fresh === stroke.id ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: wiping ? 0 : duration.standard,
                    ease: [...ease.standard],
                  },
                }}
                transition={{
                  duration: duration.standard,
                  ease: [...ease.standard],
                }}
              />
            ))}
          </AnimatePresence>
          <path
            ref={liveRef}
            className="fill-[var(--ink-black)] data-[color=blue]:fill-[var(--ink-blue)] data-[color=violet]:fill-[var(--ink-violet)]"
            data-color={color}
          />
          {nib && (
            <circle
              className="fill-[var(--ink-black)] opacity-[.35] data-[color=blue]:fill-[var(--ink-blue)] data-[color=violet]:fill-[var(--ink-violet)]"
              data-color={nibColor}
              cx={nib.x}
              cy={nib.y}
              r={WIDTHS[width].size * 0.9}
            />
          )}
        </svg>
      </div>
      {wiping && (
        <motion.span
          className="pointer-events-none absolute inset-0 before:absolute before:top-[8%] before:bottom-[8%] before:left-[-1px] before:w-[2px] before:rounded-[2px] before:bg-[var(--foreground)] before:opacity-50 before:content-[''] after:absolute after:inset-y-0 after:left-[-28px] after:w-[28px] after:bg-[linear-gradient(to_right,transparent,color-mix(in_oklab,var(--foreground)_5%,transparent))] after:content-['']"
          aria-hidden="true"
          initial={{ x: "0%", opacity: 0 }}
          animate={{ x: "100%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 0.56,
            ease: [...ease.inOut],
            opacity: { duration: 0.56, times: [0, 0.12, 0.85, 1] },
          }}
        />
      )}
    </div>
  )
}

interface SignatureControlsProps {
  uid: string
  color: InkColor
  width: InkWidth
  reduced: boolean
  transition: Transition
  history: History
  wiping: boolean
  replaying: boolean
  empty: boolean
  saved: Saved
  status: string
  onColorChange: (color: InkColor) => void
  onWidthChange: (width: InkWidth) => void
  onUndo: () => void
  onRedo: () => void
  onReplay: () => void
  onClear: () => void
  onSave: (kind: "png" | "svg") => void
}

function SignatureControls({
  uid,
  color,
  width,
  reduced,
  transition,
  history,
  wiping,
  replaying,
  empty,
  saved,
  status,
  onColorChange,
  onWidthChange,
  onUndo,
  onRedo,
  onReplay,
  onClear,
  onSave,
}: SignatureControlsProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <div className="flex items-center gap-[2px]">
          <Choice
            label="Ink color"
            options={COLORS}
            value={color}
            onChange={onColorChange}
            layoutId={`${uid}-color`}
            reduced={reduced}
            render={(option) => (
              <span
                className="relative size-[16px] rounded-[50%] bg-[var(--ink-black)] data-[color=blue]:bg-[var(--ink-blue)] data-[color=violet]:bg-[var(--ink-violet)]"
                data-color={option}
              />
            )}
            name={(option) => INK[option].label}
          />
          <span
            className="mx-[6px] h-[20px] w-px bg-[var(--border)]"
            aria-hidden="true"
          />
          <Choice
            label="Stroke width"
            options={SIZES}
            value={width}
            onChange={onWidthChange}
            layoutId={`${uid}-width`}
            reduced={reduced}
            render={(option) => (
              <span
                className="relative rounded-[50%] bg-[var(--foreground)]"
                style={{
                  width: WIDTHS[option].size + 2,
                  height: WIDTHS[option].size + 2,
                }}
              />
            )}
            name={(option) => WIDTHS[option].label}
          />
        </div>
        <div className="flex items-center gap-[2px]">
          <IconButton
            label="Undo"
            onClick={onUndo}
            disabled={!history.past.length || wiping}
          >
            <Undo2 size={18} strokeWidth={1.75} aria-hidden="true" />
          </IconButton>
          <IconButton
            label="Redo"
            onClick={onRedo}
            disabled={!history.future.length || wiping}
          >
            <Redo2 size={18} strokeWidth={1.75} aria-hidden="true" />
          </IconButton>
          <IconButton
            label={replaying ? "Stop replay" : "Replay signature"}
            onClick={onReplay}
            disabled={empty || wiping}
            pressed={replaying}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={replaying ? "stop" : "play"}
                className="grid place-items-center"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={transition}
              >
                {replaying ? (
                  <Square size={15} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <Play size={17} strokeWidth={1.75} aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
          </IconButton>
          <IconButton
            label="Clear signature"
            onClick={onClear}
            disabled={empty || wiping}
          >
            <Eraser size={18} strokeWidth={1.75} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      <div className="flex items-center justify-end gap-[6px]">
        <span className="mr-[4px] text-[length:var(--text-xs)] text-[color:var(--text-muted)]">
          Save as
        </span>
        {(["png", "svg"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            className="grid h-[var(--control-height-sm)] min-w-[76px] cursor-pointer rounded-[var(--radius-control)] border border-[color:var(--border)] bg-[var(--surface)] px-[12px] py-0 text-[length:var(--text-sm)] text-[color:var(--foreground)] [-webkit-tap-highlight-color:transparent] [transition:background-color_var(--duration-fast)_var(--ease-standard),transform_var(--duration-instant)_var(--ease-standard)] hover:not-disabled:bg-[var(--surface-muted)] hover:not-disabled:text-[color:var(--foreground)] active:not-disabled:[transform:scale(.97)] disabled:cursor-default disabled:text-[color:var(--text-muted)]"
            onClick={() => onSave(kind)}
            disabled={empty}
            aria-label={`Download ${kind.toUpperCase()}`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={
                  saved === kind
                    ? "done"
                    : saved === "failed"
                      ? "failed"
                      : "idle"
                }
                className="inline-flex items-center justify-center gap-[6px] [grid-area:1/1]"
                initial={{
                  opacity: 0,
                  y: reduced ? 0 : 4,
                  filter: reduced ? "blur(0px)" : `blur(${blur.subtle}px)`,
                }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  y: reduced ? 0 : -4,
                  transition: { duration: duration.instant },
                }}
                transition={
                  reduced
                    ? { duration: duration.instant }
                    : { duration: duration.fast, ease: [...ease.enter] }
                }
              >
                {saved === kind ? (
                  <>
                    <Check size={15} strokeWidth={1.75} aria-hidden="true" />
                    Saved
                  </>
                ) : (
                  <>
                    <Download size={15} strokeWidth={1.75} aria-hidden="true" />
                    {kind.toUpperCase()}
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        ))}
      </div>
      <p
        id={`${uid}-keys`}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]"
      >
        Press Control or Command Z to undo, add Shift to redo, and Delete to
        clear.
      </p>
      <p
        className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </>
  )
}

export function SignaturePad({
  signer,
  hint = "Sign here",
  defaultColor = "black",
  defaultWidth = "medium",
  onChange,
  fileName = "signature",
  label = "Signature pad",
  className,
}: SignaturePadProps) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "")
  const reduced = useReducedFlag()
  const [history, setHistory] = useState<History>({
    past: [],
    present: [],
    future: [],
    fresh: null,
  })
  const [color, setColor] = useState<InkColor>(defaultColor)
  const [width, setWidth] = useState<InkWidth>(defaultWidth)
  const [drawing, setDrawing] = useState(false)
  const [wiping, setWiping] = useState(false)
  const [replay, setReplay] = useState<ReplayState | null>(null)
  const [saved, setSaved] = useState<Saved>(null)
  const [status, setStatus] = useState("")

  const padRef = useRef<HTMLDivElement>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<SVGPathElement>(null)
  const live = useRef<LiveStroke | null>(null)
  const replayFrame = useRef(0)
  const savedTimer = useRef(0)
  const wipeAnimation = useRef<{
    stop: () => void
    complete: () => void
  } | null>(null)
  const counter = useRef(0)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const strokes = history.present
  const empty = strokes.length === 0
  const replaying = replay !== null

  useEffect(() => {
    onChangeRef.current?.(strokes)
  }, [strokes])
  useEffect(
    () => () => {
      cancelAnimationFrame(replayFrame.current)
      window.clearTimeout(savedTimer.current)
    },
    []
  )

  const commit = useCallback(
    (next: InkStroke[], fresh: string | null = null) => {
      setHistory((current) => ({
        past: [...current.past, current.present].slice(-60),
        present: next,
        future: [],
        fresh,
      }))
    },
    []
  )

  const stopReplay = useCallback(() => {
    cancelAnimationFrame(replayFrame.current)
    setReplay(null)
  }, [])
  /** A wipe in flight completes at once, so whatever comes next starts from a clear pad. */
  const settleWipe = useCallback(() => {
    wipeAnimation.current?.complete()
  }, [])

  function toPad(event: { clientX: number; clientY: number }) {
    const box = padRef.current!.getBoundingClientRect()
    return {
      x: ((event.clientX - box.left) / box.width) * PAD_WIDTH,
      y: ((event.clientY - box.top) / box.height) * PAD_HEIGHT,
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    startSignatureStroke(event, {
      live,
      counter,
      pad: padRef,
      uid,
      color,
      width,
      replaying,
      toPad,
      settleWipe,
      stopReplay,
      setDrawing,
      paintLive,
    })
  }
  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = live.current
    if (current?.id === event.pointerId)
      appendPointerSamples(event, current, toPad, paintLive)
  }
  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    finishSignatureStroke(
      event,
      live,
      strokes,
      liveRef,
      commit,
      setDrawing,
      setStatus
    )
  }
  function paintLive() {
    const current = live.current
    if (!current || !liveRef.current) return
    liveRef.current.setAttribute(
      "d",
      outlineToPath(
        getStrokeOutline(
          current.stroke.points,
          strokeOptions(current.stroke, false)
        )
      )
    )
  }

  function undo() {
    restoreSignatureHistory(
      "undo",
      history,
      live,
      settleWipe,
      stopReplay,
      setHistory,
      setStatus
    )
  }
  function redo() {
    restoreSignatureHistory(
      "redo",
      history,
      live,
      settleWipe,
      stopReplay,
      setHistory,
      setStatus
    )
  }

  function clear() {
    if (empty || wiping || live.current) return
    stopReplay()
    const node = inkRef.current
    const finish = () => {
      wipeAnimation.current = null
      commit([])
      setWiping(false)
      setStatus("Signature cleared. Undo brings it back.")
      // Lift the clip only once the wiped strokes have left, so they never flash back for a frame.
      if (node)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            node.style.clipPath = ""
          })
        )
    }
    if (!node || reduced) {
      finish()
      return
    }
    setWiping(true)
    // The ink is cut away behind a squeegee edge that sweeps across the pad; the edge itself is drawn by the sweep element.
    const controls = animate(
      node,
      { clipPath: ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 100%)"] },
      { duration: 0.56, ease: [...ease.inOut] }
    )
    wipeAnimation.current = {
      stop: () => controls.stop(),
      complete: () => {
        controls.complete()
      },
    }
    controls.then(finish)
  }

  function toggleReplay() {
    toggleSignatureReplay(
      replaying,
      empty,
      live,
      strokes,
      replayFrame,
      settleWipe,
      stopReplay,
      setReplay,
      setStatus
    )
  }
  function save(kind: "png" | "svg") {
    return saveSignatureFile(
      kind,
      strokes,
      fileName,
      empty,
      savedTimer,
      setSaved,
      setStatus
    )
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    handleSignatureKey(event, replaying, { undo, redo, clear, stopReplay })
  }

  const { visible, nib, nibColor } = getVisibleStrokes(strokes, replay, color)
  const { showHint, hintHidden, transition: t } = getSignaturePresentation(
    empty,
    drawing,
    wiping,
    reduced
  ) as {
    showHint: boolean
    hintHidden: TargetAndTransition
    transition: Transition
  }

  return (
    <div
      className={cn(
        "grid w-full min-w-0 gap-[10px] font-[family-name:var(--font-body)] tracking-[var(--tracking-body)] [--ink-black:var(--foreground)] [--ink-blue:oklch(46%_.17_262)] [--ink-violet:oklch(49%_.2_292)] dark:[--ink-blue:oklch(76%_.12_258)] dark:[--ink-violet:oklch(77%_.13_295)]",
        className
      )}
      data-ink={color}
    >
      <SignatureSurface
        padRef={padRef}
        inkRef={inkRef}
        liveRef={liveRef}
        label={label}
        count={strokes.length}
        empty={empty}
        drawing={drawing}
        wiping={wiping}
        signer={signer}
        hint={hint}
        hintHidden={hintHidden}
        showHint={showHint}
        reduced={reduced}
        uid={uid}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        visible={visible}
        fresh={history.fresh}
        color={color}
        width={width}
        nib={nib}
        nibColor={nibColor}
      />

      <SignatureControls
        uid={uid}
        color={color}
        width={width}
        reduced={reduced}
        transition={t}
        history={history}
        wiping={wiping}
        replaying={replaying}
        empty={empty}
        saved={saved}
        status={status}
        onColorChange={(next) => {
          setColor(next)
          setStatus(`${INK[next].label} selected`)
        }}
        onWidthChange={(next) => {
          setWidth(next)
          setStatus(`${WIDTHS[next].label} nib selected`)
        }}
        onUndo={undo}
        onRedo={redo}
        onReplay={toggleReplay}
        onClear={clear}
        onSave={save}
      />
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  pressed,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  pressed?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="grid size-[36px] cursor-pointer place-items-center rounded-[var(--radius-pill)] border-0 bg-transparent p-0 text-[color:var(--text-secondary)] [-webkit-tap-highlight-color:transparent] [transition:background-color_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),transform_var(--duration-instant)_var(--ease-standard)] hover:not-disabled:bg-[var(--surface-muted)] hover:not-disabled:text-[color:var(--foreground)] active:not-disabled:[transform:scale(.94)] disabled:cursor-default disabled:text-[color:var(--text-muted)] disabled:opacity-[.45] aria-pressed:bg-[var(--surface-muted)] aria-pressed:text-[color:var(--foreground)]"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
    >
      {children}
    </button>
  )
}

/** A compact radio group with a highlight that glides to the chosen option. Arrow keys move the choice. */
function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
  name,
  layoutId,
  reduced,
}: {
  label: string
  options: T[]
  value: T
  onChange: (value: T) => void
  render: (option: T) => ReactNode
  name: (option: T) => string
  layoutId: string
  reduced: boolean
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0
    if (!step) return
    event.preventDefault()
    const index =
      (options.indexOf(value) + step + options.length) % options.length
    onChange(options[index]!)
    refs.current[index]?.focus()
  }
  return (
    <div
      className="flex items-center gap-[2px]"
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {options.map((option, index) => (
        <button
          key={option}
          ref={(node) => {
            refs.current[index] = node
          }}
          type="button"
          role="radio"
          aria-checked={option === value}
          aria-label={name(option)}
          title={name(option)}
          tabIndex={option === value ? 0 : -1}
          className="relative grid size-[36px] cursor-pointer place-items-center rounded-[var(--radius-pill)] border-0 bg-transparent p-0 text-[color:var(--foreground)] [-webkit-tap-highlight-color:transparent] hover:bg-[var(--surface-muted)] hover:text-[color:var(--foreground)]"
          onClick={() => onChange(option)}
        >
          {option === value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-[inherit] bg-[var(--surface-muted)] shadow-[inset_0_0_0_1px_var(--border)]"
              transition={reduced ? { duration: 0 } : spring.morph}
            />
          )}
          {render(option)}
        </button>
      ))}
    </div>
  )
}

export default SignaturePad
