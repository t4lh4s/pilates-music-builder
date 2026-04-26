'use client'
import { useState } from 'react'

export default function FeedbackModal({ open, onClose, page }: {
  open: boolean
  onClose: () => void
  page: string
}) {
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'question' | 'bug' | 'suggestion' | 'general'>('general')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  async function submit() {
    if (message.trim().length < 3) {
      setError('Please write at least a few words')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type, page }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to send')
      }
      setSubmitted(true)
      setTimeout(() => {
        setMessage('')
        setType('general')
        setSubmitted(false)
        onClose()
      }, 1800)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sage-900">Share feedback</h3>
            <p className="text-xs text-sage-400 mt-0.5">Question, bug, or suggestion — we read everything</p>
          </div>
          <button onClick={onClose} className="text-sage-300 hover:text-sage-600 transition-colors">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l10 10M12 2L2 12"/>
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a7a5a" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="font-semibold text-sage-800">Thanks!</p>
            <p className="text-sm text-sage-500 mt-1">Your feedback was sent.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sage-500 uppercase tracking-wider mb-2">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { id: 'general', label: 'General' },
                  { id: 'question', label: 'Question' },
                  { id: 'bug', label: 'Bug' },
                  { id: 'suggestion', label: 'Suggestion' },
                ] as const).map(t => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      type === t.id
                        ? 'bg-sage-500 text-white'
                        : 'bg-cream-100 text-sage-600 hover:bg-cream-200'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sage-500 uppercase tracking-wider mb-2">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={5}
                className="w-full text-sm px-3 py-2.5 border border-cream-300 rounded-xl focus:outline-none focus:border-sage-400 bg-white text-sage-900 placeholder-sage-300 resize-none"
                maxLength={2000}/>
              <p className="text-xs text-sage-300 mt-1 text-right">{message.length}/2000</p>
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button onClick={onClose}
                className="text-sm font-medium text-sage-500 hover:text-sage-700 px-3 py-2 rounded-lg hover:bg-cream-50 transition-all">
                Cancel
              </button>
              <button onClick={submit} disabled={submitting || message.trim().length < 3}
                className="text-sm font-semibold text-white bg-sage-500 hover:bg-sage-600 disabled:bg-sage-200 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors">
                {submitting ? 'Sending...' : 'Send feedback'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
