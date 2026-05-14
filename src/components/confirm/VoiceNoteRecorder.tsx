"use client"

import { useState, useRef, useCallback } from "react"

interface Props {
  buyerName: string
  orderAmount: number
  onSend: (blob: Blob) => void
  onClose: () => void
}

export default function VoiceNoteRecorder({ buyerName, orderAmount, onSend, onClose }: Props) {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorder.current = recorder
      chunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start()
      setRecording(true)
      const startTime = Date.now()
      timer.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000))
      }, 200)
    } catch {
      setRecording(false)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop()
      setRecording(false)
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  const handleSend = useCallback(() => {
    if (!chunks.current.length) return
    setSending(true)
    const blob = new Blob(chunks.current, { type: "audio/webm" })
    setTimeout(() => {
      onSend(blob)
      setSending(false)
      setSent(true)
    }, 800)
  }, [onSend])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
        <p className="text-lg mb-1">🎤</p>
        <p className="text-xs font-medium text-emerald-400">Voice note sent to {buyerName}</p>
        <p className="text-[10px] text-white/40 mt-0.5">{orderAmount.toFixed(0)} TND order</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎤</span>
          <div>
            <p className="text-xs font-medium text-white">Voice confirmation</p>
            <p className="text-[9px] text-white/40">{buyerName} · {orderAmount.toFixed(0)} TND</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white text-sm px-1">✕</button>
      </div>

      {!audioUrl && (
        <div className="flex items-center justify-center gap-4 py-4">
          {!recording ? (
            <button
              onClick={startRecording}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all active:scale-90"
            >
              <span className="text-white text-lg">🎤</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center animate-pulse active:scale-90"
            >
              <div className="w-5 h-5 rounded-sm bg-white" />
            </button>
          )}
          {recording && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono text-white/70">{formatTime(duration)}</span>
            </div>
          )}
          {!recording && (
            <p className="text-xs text-white/40">Tap to record a voice confirmation</p>
          )}
        </div>
      )}

      {audioUrl && (
        <div className="space-y-3">
          <div className="rounded-lg bg-white/5 p-3">
            <audio src={audioUrl} controls className="w-full h-8" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setAudioUrl(null); chunks.current = []; setDuration(0); }}
              className="rounded-lg border border-white/15 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors"
            >
              Re-record
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-all"
            >
              {sending ? "Sending..." : "Send as voice"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
