"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Copy, Check, MessageCircle, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SharePanelProps {
  url: string;
  whatsappMessage: string;
  compact?: boolean;
}

export function SharePanel({ url, whatsappMessage, compact = false }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          title="Copy RSVP link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#22c35e] transition-colors"
          title="Send via WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* URL bar */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <p className="min-w-0 flex-1 truncate font-mono text-xs text-slate-600">{url}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
          title="Copy link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleCopy}
          variant="outline"
          className="flex-1 border-slate-200 text-slate-700"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={handleWhatsApp}
          className="flex-1 bg-[#25D366] hover:bg-[#22c35e] text-white"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowQr((v) => !v)}
          className="shrink-0 border-slate-200"
          title={showQr ? "Hide QR" : "Show QR code"}
        >
          {showQr ? <X className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
        </Button>
      </div>

      {/* QR code panel */}
      {showQr && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6">
          <QRCode value={url} size={180} />
          <p className="text-xs text-slate-400">Scan to open invitation</p>
        </div>
      )}
    </div>
  );
}
