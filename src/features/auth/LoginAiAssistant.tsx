import { useState } from 'react'
import { Sparkles } from 'lucide-react'

const CANNED_ANSWERS: Record<string, string> = {
  eway: 'In India, an E-Way bill is mandatory for inter-state and intra-state movement of goods when the consignment value exceeds ₹50,000.',
  gst: 'For an 18% GST intra-state transaction, tax is split equally as 9% CGST and 9% SGST. For inter-state supply, 18% IGST is charged.',
  debit:
    'To reconcile a Debit Note against an unpaid supplier bill, navigate to the Bill Adjustment module and select the supplier invoice to offset.',
}

export function LoginAiAssistant() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  function ask(queryText?: string) {
    const text = (queryText ?? query).trim()
    if (!text) return
    setIsTyping(true)
    setResponse(null)

    setTimeout(() => {
      const lower = text.toLowerCase()
      if (lower.includes('e-way') || lower.includes('eway') || lower.includes('limit')) {
        setResponse(CANNED_ANSWERS.eway)
      } else if (lower.includes('split') || lower.includes('18%') || lower.includes('rate') || lower.includes('cgst')) {
        setResponse(CANNED_ANSWERS.gst)
      } else if (lower.includes('debit') || lower.includes('reconcile') || lower.includes('adjust')) {
        setResponse(CANNED_ANSWERS.debit)
      } else {
        setResponse(
          `ST Billing Smart AI: Verified! Your query regarding "${text}" is fully compliant with GST Rule 46. You can create invoices, manage stock, and export GSTR-1 reports with 1-click.`,
        )
      }
      setIsTyping(false)
      setQuery('')
    }, 600)
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/15 bg-slate-900/70 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-cyan-400">✦</span>
          <span className="text-xs font-bold tracking-wide text-white">ST Billing AI Assistant</span>
          <span className="rounded border border-cyan-400/30 bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-cyan-300">
            BETA
          </span>
        </div>
        <span className="text-[10px] text-slate-400">Interactive Preview</span>
      </div>

      <p className="text-xs font-medium text-slate-300">How can I help you today?</p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => ask('What is the E-Way bill threshold limit?')}
          className="rounded-lg border border-white/10 bg-slate-800/70 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/20 hover:text-cyan-200"
        >
          E-Way Bill limit?
        </button>
        <button
          type="button"
          onClick={() => ask('How is 18% GST split in intra-state?')}
          className="rounded-lg border border-white/10 bg-slate-800/70 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/20 hover:text-cyan-200"
        >
          18% GST CGST/SGST split
        </button>
        <button
          type="button"
          onClick={() => ask('How to reconcile a Debit Note against bills?')}
          className="rounded-lg border border-white/10 bg-slate-800/70 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/20 hover:text-cyan-200"
        >
          Reconcile Debit Notes
        </button>
      </div>

      {(response || isTyping) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-3 text-xs text-cyan-200">
          <Sparkles className="mt-0.5 size-4 shrink-0 animate-pulse text-cyan-400" />
          <div className="flex-1">
            {isTyping ? <span className="italic text-slate-400">Analyzing GST compliance rules...</span> : response}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask anything about your business account, GST rates, or invoices..."
          className="glass-input flex-1 rounded-xl px-3.5 py-2 text-xs"
        />
        <button
          type="button"
          onClick={() => ask()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:from-cyan-400 hover:to-blue-500"
        >
          <span>↑ Send</span>
        </button>
      </div>
    </div>
  )
}
