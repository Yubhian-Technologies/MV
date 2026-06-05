export type UserRole = "host" | "admin" | "vendor";
export type PlanType = "free" | "premium" | "enterprise";
export type EventStatus = "draft" | "active" | "completed" | "archived";

export interface UserProfile {
  userId: string;
  email: string;
  phone?: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  coupleName?: string;
  language: "en" | "hi" | "ta";
  subscriptionId?: string;
  planType: PlanType;
  planExpiresAt?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  onboardingComplete: boolean;
  totalEvents: number;
  isActive: boolean;
  suspendedAt?: Date;
  suspendReason?: string;
}

export interface WeddingEvent {
  eventId: string;
  hostId: string;
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: Date;
  coverPhotoURL?: string;
  city: string;
  state: string;
  country: string;
  status: EventStatus;
  invitationId?: string;
  totalGuests: number;
  rsvpConfirmed: number;
  rsvpDeclined: number;
  rsvpPending: number;
  rsvpDeadline?: Date;
  isRsvpOpen: boolean;
  shareCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFunction {
  functionId: string;
  name: string;
  customName?: string;
  date: Date;
  startTime: string;
  endTime?: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  latitude?: number;
  longitude?: number;
  mapsURL?: string;
  dressCode?: string;
  notes?: string;
  order: number;
  rsvpConfirmed: number;
  rsvpDeclined: number;
}

export interface Guest {
  guestId: string;
  name: string;
  phone?: string;
  email?: string;
  groups: string[];
  side: "bride" | "groom" | "mutual";
  invitedFunctions: string[];
  seatCount: number;
  rsvpStatus: "pending" | "confirmed" | "declined" | "maybe";
  rsvpUpdatedAt?: Date;
  rsvpToken: string;
  shareStatus: "not_sent" | "sent" | "opened";
  sharedAt?: Date;
  sharedVia?: "whatsapp" | "email" | "link";
  notes?: string;
  addedBy: "manual" | "import" | "self";
  createdAt: Date;
}

export type TemplateCategory = "traditional" | "floral" | "royal" | "modern" | "festive";

export interface InvitationTemplate {
  templateId: string;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  region: string;
  isPremium: boolean;
  // Visual identity — used by TemplatePreviewRenderer
  bg: string;          // CSS gradient or color (inline style)
  textColor: string;   // Tailwind class
  accentColor: string; // hex, used in SVG / inline style
  borderColor: string; // hex
  ornamentStyle: "mandala" | "floral" | "arch" | "minimal" | "geometric" | "stars" | "leaves" | "botanical";
}

export interface Invitation {
  invitationId: string;
  eventId: string;
  hostId: string;
  templateId: string;
  customMessage: string;
  customTagline: string;
  language: "en" | "hi";
  showVenueMap: boolean;
  showDressCode: boolean;
  showRsvpButton: boolean;
  status: "draft" | "published";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RSVPResponse {
  rsvpId: string;
  guestId: string;
  guestName: string;
  guestPhone?: string;
  functionResponses: Record<
    string,
    { status: "attending" | "not_attending" | "maybe"; attendeeCount: number }
  >;
  totalAttendees: number;
  dietaryPreference: "veg" | "non_veg" | "jain" | "other";
  dietaryNotes?: string;
  message?: string;
  submittedAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  deviceType?: "mobile" | "desktop";
}
