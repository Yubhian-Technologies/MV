"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ChevronRight, Globe2, Palette, Send, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TemplateFullPreview } from "@/components/templates/TemplatePreviewRenderer";
import { getTemplate, TEMPLATES } from "@/lib/templates";
import { getEvent, getEventFunctions } from "@/lib/firebase/events";
import {
  getEventInvitation,
  createInvitation,
  updateInvitation,
  publishInvitation,
} from "@/lib/firebase/invitations";
import {
  invitationCustomizationSchema,
  type InvitationCustomizationInput,
} from "@/lib/validations/invitation";
import { SharePanel } from "@/components/sharing/SharePanel";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import type { WeddingEvent, EventFunction, Invitation, InvitationTemplate } from "@/types";
import { toast } from "sonner";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full border-2 transition-colors",
          checked ? "border-rose-500 bg-rose-500" : "border-slate-200 bg-slate-200"
        )}
      >
        <span
          className={cn(
            "absolute top-0 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

export default function EventInvitationPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<WeddingEvent | null>(null);
  const [functions, setFunctions] = useState<EventFunction[]>([]);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [template, setTemplate] = useState<InvitationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showVenueMap, setShowVenueMap] = useState(true);
  const [showDressCode, setShowDressCode] = useState(true);
  const [showRsvpButton, setShowRsvpButton] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvitationCustomizationInput>({
    resolver: zodResolver(invitationCustomizationSchema),
    defaultValues: {
      customMessage: "",
      customTagline: "",
      language: "en",
      showVenueMap: true,
      showDressCode: true,
      showRsvpButton: true,
    },
  });

  const customMessage = watch("customMessage");
  const customTagline = watch("customTagline");

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      getEvent(eventId),
      getEventFunctions(eventId),
      getEventInvitation(eventId),
    ])
      .then(([ev, fns, inv]) => {
        if (!ev) { router.replace("/events"); return; }
        setEvent(ev);
        setFunctions(fns);

        if (inv) {
          setInvitation(inv);
          const t = getTemplate(inv.templateId);
          setTemplate(t ?? null);
          reset({
            customMessage: inv.customMessage,
            customTagline: inv.customTagline,
            language: inv.language,
            showVenueMap: inv.showVenueMap,
            showDressCode: inv.showDressCode,
            showRsvpButton: inv.showRsvpButton,
          });
          setShowVenueMap(inv.showVenueMap);
          setShowDressCode(inv.showDressCode);
          setShowRsvpButton(inv.showRsvpButton);
        }
      })
      .catch(() => toast.error("Could not load invitation data."))
      .finally(() => setLoading(false));
  }, [eventId, reset, router]);

  const onSave = async (data: InvitationCustomizationInput) => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        ...data,
        showVenueMap,
        showDressCode,
        showRsvpButton,
      };

      if (invitation) {
        await updateInvitation(invitation.invitationId, payload);
        setInvitation((prev) => prev ? { ...prev, ...payload } : prev);
      } else if (template) {
        const id = await createInvitation(user.uid, eventId, template.templateId);
        setInvitation({
          invitationId: id,
          eventId,
          hostId: user.uid,
          templateId: template.templateId,
          ...payload,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      toast.success("Customizations saved.");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!invitation) return;
    setPublishing(true);
    try {
      await publishInvitation(invitation.invitationId);
      setInvitation((prev) => prev ? { ...prev, status: "published" } : prev);
      toast.success("Invitation published!");
    } catch {
      toast.error("Failed to publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!event) return null;

  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/events" className="hover:text-rose-600">Events</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/events/${eventId}`} className="hover:text-rose-600 truncate max-w-[140px]">
          {event.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium">Invitation</span>
      </nav>

      {/* No template selected yet */}
      {!template && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50">
            <Palette className="h-10 w-10 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">No template selected</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Choose a template from the gallery to create a beautiful digital invitation for {event.title}.
            </p>
          </div>
          <Link
            href="/templates"
            className={cn(buttonVariants({ variant: "default" }), "bg-rose-600 hover:bg-rose-700")}
          >
            Browse Templates
          </Link>
        </div>
      )}

      {/* Template selected — show editor */}
      {template && (
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
          {/* Left — live preview */}
          <div className="flex flex-col items-center gap-3 xl:sticky xl:top-8">
            <div className="flex items-center justify-between w-full max-w-[360px]">
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-slate-400" />
                Live Preview
              </p>
              {invitation?.status === "published" && (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                  Published
                </span>
              )}
              {invitation?.status === "draft" && (
                <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-medium text-slate-500">
                  Draft
                </span>
              )}
            </div>
            <TemplateFullPreview
              template={template}
              event={event}
              functions={functions}
              customMessage={customMessage}
              customTagline={customTagline}
            />
            <p className="text-xs text-slate-400">Updates live as you edit</p>
          </div>

          {/* Right — customization panel */}
          <form
            onSubmit={handleSubmit(onSave)}
            className="flex-1 space-y-5 xl:max-w-md"
            noValidate
          >
            {/* Template selector */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-rose-500" />
                  Template
                </h2>
                <Link
                  href="/templates"
                  className="text-xs text-rose-600 font-medium hover:text-rose-700"
                >
                  Change →
                </Link>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                {/* Mini color swatch */}
                <div
                  className="h-10 w-10 rounded-lg shrink-0"
                  style={{ background: template.bg }}
                />
                <div>
                  <p className="font-medium text-slate-900 text-sm">{template.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{template.category}</p>
                </div>
              </div>

              {/* Quick template swap */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Quick switch</p>
                <div className="flex gap-2 flex-wrap">
                  {TEMPLATES.filter((t) => !t.isPremium).map((t) => (
                    <button
                      key={t.templateId}
                      type="button"
                      title={t.name}
                      onClick={async () => {
                        if (!user) return;
                        setTemplate(t);
                        if (invitation) {
                          await updateInvitation(invitation.invitationId, { templateId: t.templateId });
                        } else {
                          const id = await createInvitation(user.uid, eventId, t.templateId);
                          setInvitation({
                            invitationId: id,
                            eventId,
                            hostId: user.uid,
                            templateId: t.templateId,
                            customMessage: customMessage,
                            customTagline: customTagline,
                            language: "en",
                            showVenueMap,
                            showDressCode,
                            showRsvpButton,
                            status: "draft",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                          });
                        }
                      }}
                      className={cn(
                        "h-8 w-8 rounded-lg border-2 transition-all",
                        template.templateId === t.templateId
                          ? "border-rose-500 scale-110 shadow-sm"
                          : "border-transparent hover:border-slate-300"
                      )}
                      style={{ background: t.bg }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Content customization */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
              <h2 className="font-semibold text-slate-900">Customize Content</h2>

              <div className="space-y-1.5">
                <Label htmlFor="customTagline">
                  Tagline{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </Label>
                <Input
                  id="customTagline"
                  placeholder="e.g., Together we begin a new chapter…"
                  {...register("customTagline")}
                  className={errors.customTagline ? "border-red-400" : ""}
                />
                {errors.customTagline && (
                  <p className="text-xs text-red-500">{errors.customTagline.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customMessage">
                  Personal message{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </Label>
                <Textarea
                  id="customMessage"
                  placeholder="Write a heartfelt message for your guests…"
                  rows={3}
                  {...register("customMessage")}
                  className={errors.customMessage ? "border-red-400" : ""}
                />
                {errors.customMessage && (
                  <p className="text-xs text-red-500">{errors.customMessage.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Language</Label>
                <div className="flex gap-2">
                  {(["en", "hi"] as const).map((lang) => (
                    <label
                      key={lang}
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all",
                        watch("language") === lang
                          ? "border-rose-400 bg-rose-50 text-rose-700"
                          : "border-slate-200 text-slate-600 hover:border-rose-200"
                      )}
                    >
                      <input
                        type="radio"
                        value={lang}
                        className="sr-only"
                        {...register("language")}
                      />
                      <Globe2 className="h-3.5 w-3.5" />
                      {lang === "en" ? "English" : "हिंदी"}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Display options */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
              <h2 className="font-semibold text-slate-900">Display Options</h2>
              <ToggleRow
                label="Show venue map"
                description="Embed a map link for each ceremony venue"
                checked={showVenueMap}
                onChange={setShowVenueMap}
              />
              <ToggleRow
                label="Show dress code"
                description="Display dress code details per function"
                checked={showDressCode}
                onChange={setShowDressCode}
              />
              <ToggleRow
                label="Show RSVP button"
                description="Let guests respond directly from the invitation"
                checked={showRsvpButton}
                onChange={setShowRsvpButton}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="outline"
                className="flex-1 border-slate-200"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Draft"}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-rose-600 hover:bg-rose-700"
                onClick={handlePublish}
                disabled={publishing || !invitation || invitation.status === "published"}
              >
                {publishing ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Publishing…
                  </span>
                ) : invitation?.status === "published" ? (
                  "Published"
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
            </div>

            {invitation?.status === "published" && event?.shareCode && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-emerald-600" />
                  <h2 className="font-semibold text-emerald-800">Share Your Invitation</h2>
                </div>
                <p className="text-xs text-emerald-700">
                  Your invitation is live! Share it with friends and family.
                </p>
                <SharePanel
                  url={`${typeof window !== "undefined" ? window.location.origin : ""}/i/${event.shareCode}`}
                  whatsappMessage={`💍 *${event.title}* are getting married!\n\nView their wedding invitation:\n${typeof window !== "undefined" ? window.location.origin : ""}/i/${event.shareCode}\n\n📅 ${event.weddingDate instanceof Date ? event.weddingDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : ""} · 📍 ${event.city}`}
                />
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
