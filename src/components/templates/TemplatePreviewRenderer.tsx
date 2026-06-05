import type { InvitationTemplate, WeddingEvent, EventFunction } from "@/types";

// Sample data used when no real event is provided
const SAMPLE_EVENT = {
  brideName: "Priya",
  groomName: "Arjun",
  weddingDate: new Date("2026-12-14"),
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
};

const SAMPLE_FUNCTIONS: Partial<EventFunction>[] = [
  { name: "Mehndi", venueName: "Lotus Gardens", venueCity: "Mumbai", date: new Date("2026-12-12"), startTime: "16:00" },
  { name: "Sangeet", venueName: "The Grand Ballroom", venueCity: "Mumbai", date: new Date("2026-12-13"), startTime: "19:00" },
  { name: "Wedding", venueName: "Sun Temple Lawn", venueCity: "Mumbai", date: new Date("2026-12-14"), startTime: "10:00" },
];

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ─── Ornament SVGs ──────────────────────────────────────────────────────────

function FloralOrnament({ color }: { color: string }) {
  return (
    <svg width="120" height="32" viewBox="0 0 120 32" fill="none">
      <circle cx="60" cy="16" r="5" fill={color} opacity="0.9" />
      <circle cx="44" cy="16" r="3.5" fill={color} opacity="0.7" />
      <circle cx="76" cy="16" r="3.5" fill={color} opacity="0.7" />
      <circle cx="30" cy="16" r="2.5" fill={color} opacity="0.5" />
      <circle cx="90" cy="16" r="2.5" fill={color} opacity="0.5" />
      <path d="M0 16 Q15 8 30 16 Q15 24 0 16Z" fill={color} opacity="0.25" />
      <path d="M120 16 Q105 8 90 16 Q105 24 120 16Z" fill={color} opacity="0.25" />
      <line x1="0" y1="16" x2="22" y2="16" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="98" y1="16" x2="120" y2="16" stroke={color} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function MandalaOrnament({ color }: { color: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="40" cy="40" r="28" stroke={color} strokeWidth="1" opacity="0.5" />
      <circle cx="40" cy="40" r="20" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <circle cx="40" cy="40" r="10" fill={color} opacity="0.15" />
      <circle cx="40" cy="40" r="5" fill={color} opacity="0.8" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 40 + 28 * Math.cos(rad);
        const y = 40 + 28 * Math.sin(rad);
        return <circle key={angle} cx={x} cy={y} r="3" fill={color} opacity="0.7" />;
      })}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 40 + 20 * Math.cos(rad);
        const y1 = 40 + 20 * Math.sin(rad);
        const x2 = 40 + 36 * Math.cos(rad);
        const y2 = 40 + 36 * Math.sin(rad);
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.8" opacity="0.35" />;
      })}
    </svg>
  );
}

function ArchOrnament({ color }: { color: string }) {
  return (
    <svg width="160" height="60" viewBox="0 0 160 60" fill="none">
      <path d="M20 60 Q20 20 80 10 Q140 20 140 60" stroke={color} strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M35 60 Q35 28 80 18 Q125 28 125 60" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      {[20, 50, 80, 110, 140].map((x) => (
        <circle key={x} cx={x} cy="58" r="2.5" fill={color} opacity="0.6" />
      ))}
      <circle cx="80" cy="10" r="5" fill={color} opacity="0.8" />
    </svg>
  );
}

function MinimalOrnament({ color }: { color: string }) {
  return (
    <svg width="140" height="16" viewBox="0 0 140 16" fill="none">
      <line x1="0" y1="8" x2="55" y2="8" stroke={color} strokeWidth="1" />
      <rect x="63" y="4" width="8" height="8" fill={color} transform="rotate(45 67 8)" opacity="0.8" />
      <line x1="79" y1="8" x2="140" y2="8" stroke={color} strokeWidth="1" />
    </svg>
  );
}

function GeometricOrnament({ color }: { color: string }) {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
      <polygon points="60,2 72,18 60,34 48,18" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
      <polygon points="60,8 68,18 60,28 52,18" fill={color} opacity="0.2" />
      <circle cx="60" cy="18" r="4" fill={color} opacity="0.9" />
      <line x1="0" y1="18" x2="44" y2="18" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="76" y1="18" x2="120" y2="18" stroke={color} strokeWidth="1" opacity="0.5" />
      {[8, 16, 104, 112].map((x) => (
        <circle key={x} cx={x} cy="18" r="2" fill={color} opacity="0.5" />
      ))}
    </svg>
  );
}

function StarsOrnament({ color }: { color: string }) {
  const stars = [
    [10, 10], [30, 22], [50, 8], [70, 18], [90, 6], [110, 20], [130, 12],
    [20, 34], [60, 30], [100, 36],
  ];
  return (
    <svg width="140" height="40" viewBox="0 0 140 40" fill="none">
      {stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.2} fill={color} opacity={i % 2 === 0 ? 0.9 : 0.5} />
      ))}
    </svg>
  );
}

function LeavesOrnament({ color }: { color: string }) {
  return (
    <svg width="140" height="36" viewBox="0 0 140 36" fill="none">
      <path d="M0 30 Q20 10 40 18 Q20 28 0 30Z" fill={color} opacity="0.4" />
      <path d="M140 30 Q120 10 100 18 Q120 28 140 30Z" fill={color} opacity="0.4" />
      <path d="M50 26 Q60 8 70 18 Q60 28 50 26Z" fill={color} opacity="0.6" />
      <path d="M90 26 Q80 8 70 18 Q80 28 90 26Z" fill={color} opacity="0.6" />
      <circle cx="70" cy="18" r="4" fill={color} opacity="0.8" />
      <line x1="40" y1="24" x2="100" y2="24" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function BotanicalOrnament({ color }: { color: string }) {
  return (
    <svg width="140" height="44" viewBox="0 0 140 44" fill="none">
      <path d="M70 40 Q50 30 30 22 Q50 18 70 28Z" fill={color} opacity="0.3" />
      <path d="M70 40 Q90 30 110 22 Q90 18 70 28Z" fill={color} opacity="0.3" />
      <path d="M70 28 Q60 10 70 4 Q80 10 70 28Z" fill={color} opacity="0.5" />
      <circle cx="70" cy="4" r="3" fill={color} opacity="0.7" />
      <circle cx="30" cy="22" r="4" fill={color} opacity="0.4" />
      <circle cx="110" cy="22" r="4" fill={color} opacity="0.4" />
      <line x1="0" y1="40" x2="55" y2="40" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="85" y1="40" x2="140" y2="40" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function Ornament({ style, color }: { style: InvitationTemplate["ornamentStyle"]; color: string }) {
  switch (style) {
    case "floral": return <FloralOrnament color={color} />;
    case "mandala": return <MandalaOrnament color={color} />;
    case "arch": return <ArchOrnament color={color} />;
    case "minimal": return <MinimalOrnament color={color} />;
    case "geometric": return <GeometricOrnament color={color} />;
    case "stars": return <StarsOrnament color={color} />;
    case "leaves": return <LeavesOrnament color={color} />;
    case "botanical": return <BotanicalOrnament color={color} />;
    default: return <FloralOrnament color={color} />;
  }
}

// ─── The actual invitation content ──────────────────────────────────────────

interface RendererProps {
  template: InvitationTemplate;
  event?: Partial<WeddingEvent> | null;
  functions?: Partial<EventFunction>[];
  customMessage?: string;
  customTagline?: string;
  language?: "en" | "hi";
}

function InvitationContent({ template, event, functions, customMessage, customTagline }: RendererProps) {
  const ev = event ?? SAMPLE_EVENT;
  const fns = functions ?? SAMPLE_FUNCTIONS;
  const bride = ev.brideName ?? SAMPLE_EVENT.brideName;
  const groom = ev.groomName ?? SAMPLE_EVENT.groomName;
  const date = ev.weddingDate
    ? ev.weddingDate instanceof Date
      ? ev.weddingDate
      : new Date(ev.weddingDate)
    : SAMPLE_EVENT.weddingDate;
  const location = [ev.city, ev.state, ev.country].filter(Boolean).join(", ") || `${SAMPLE_EVENT.city}, ${SAMPLE_EVENT.state}`;

  const accent = template.accentColor;
  const border = template.borderColor;
  const isBright = !["sacred-mandala", "mughal-arch", "rajwada-palace", "midnight-glamour"].includes(template.templateId);

  const headerText = isBright ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const bodyText = isBright ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.75)";
  const mutedText = isBright ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";

  return (
    <div
      className="relative w-full h-full flex flex-col items-center overflow-hidden"
      style={{ background: template.bg, fontFamily: "'Georgia', serif" }}
    >
      {/* Decorative border */}
      <div
        className="absolute inset-[8px] rounded pointer-events-none"
        style={{ border: `1px solid ${border}`, opacity: 0.5 }}
      />
      <div
        className="absolute inset-[12px] rounded pointer-events-none"
        style={{ border: `0.5px solid ${border}`, opacity: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full px-8 py-6">

        {/* Top: header + ornament */}
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-[11px] uppercase tracking-[0.3em] font-light" style={{ color: headerText }}>
            Together with their families
          </p>
          <div className="mt-1">
            <Ornament style={template.ornamentStyle} color={accent} />
          </div>
        </div>

        {/* Middle: couple names + date */}
        <div className="flex flex-col items-center gap-3 w-full text-center">
          {/* Bride */}
          <div>
            <p className="text-[28px] font-bold leading-tight" style={{ color: accent }}>
              {bride}
            </p>
          </div>
          {/* Ampersand */}
          <p className="text-[20px] italic font-light" style={{ color: accent, opacity: 0.7 }}>
            &amp;
          </p>
          {/* Groom */}
          <div>
            <p className="text-[28px] font-bold leading-tight" style={{ color: accent }}>
              {groom}
            </p>
          </div>

          {/* Divider */}
          <div className="my-1 w-16 h-px" style={{ background: border, opacity: 0.5 }} />

          {/* Tagline / invite message */}
          {customTagline ? (
            <p className="text-[10px] italic" style={{ color: bodyText }}>{customTagline}</p>
          ) : (
            <p className="text-[10px] italic" style={{ color: bodyText }}>
              Request the honour of your presence
            </p>
          )}

          {/* Date */}
          <div
            className="px-4 py-1.5 rounded-full text-[10px] font-medium"
            style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
          >
            {formatDate(date)}
          </div>

          {/* Location */}
          <p className="text-[10px]" style={{ color: bodyText }}>{location}</p>
        </div>

        {/* Bottom: functions */}
        <div className="w-full">
          {/* Functions list */}
          {fns.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-center text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: mutedText }}>
                Celebrations
              </p>
              {fns.slice(0, 3).map((fn, i) => {
                const fnDate = fn.date
                  ? fn.date instanceof Date ? fn.date : new Date(fn.date)
                  : null;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded px-3 py-1.5"
                    style={{ background: `${accent}18` }}
                  >
                    <span className="text-[9px] font-semibold" style={{ color: accent }}>
                      {fn.name === "Custom" && fn.customName ? fn.customName : fn.name}
                    </span>
                    <span className="text-[9px]" style={{ color: mutedText }}>
                      {fnDate ? `${fnDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}{fn.startTime ? ` · ${formatTime(fn.startTime)}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom message */}
          {customMessage && (
            <p className="mt-3 text-center text-[9px] italic leading-relaxed" style={{ color: bodyText }}>
              "{customMessage}"
            </p>
          )}

          {/* Footer */}
          <p className="mt-3 text-center text-[8px] tracking-widest uppercase" style={{ color: mutedText }}>
            MarriageVerse Invitations
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Public exports ──────────────────────────────────────────────────────────

/**
 * Small thumbnail — used in TemplateCard gallery cards.
 * Rendered at 280×360 natural size, displayed inside whatever container wraps it.
 */
export function TemplateThumbnail({ template }: { template: InvitationTemplate }) {
  return (
    <div className="relative w-full" style={{ paddingBottom: "128.57%" /* 360/280 */ }}>
      <div className="absolute inset-0">
        <InvitationContent template={template} />
      </div>
    </div>
  );
}

/**
 * Full-size preview — used in the template detail page and invitation management page.
 */
export function TemplateFullPreview({
  template,
  event,
  functions,
  customMessage,
  customTagline,
  language,
}: RendererProps) {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded-2xl shadow-2xl"
      style={{ width: "360px", height: "520px" }}
    >
      <InvitationContent
        template={template}
        event={event}
        functions={functions}
        customMessage={customMessage}
        customTagline={customTagline}
        language={language}
      />
    </div>
  );
}
