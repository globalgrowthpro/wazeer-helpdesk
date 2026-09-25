import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  MapPin,
  MessageSquareText,
  Pencil,
  RotateCcw,
  Send,
  Timer,
  UserRound,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Field, Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  branches,
  getStoredTickets,
  saveStoredTickets,
  technicians,
  ticketCategories,
  ticketEvents,
  tickets,
  type Ticket,
} from "@/lib/helpdesk-data";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tickets/$ticketId")({
  loader: ({ params }) => {
    const all = getStoredTickets();
    const ticket = all.find((item) => item.id === params.ticketId) || tickets.find((item) => item.id === params.ticketId);
    if (!ticket) throw notFound();
    return ticket;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.id} | وزير الحلو` : "البلاغ غير موجود | وزير الحلو" },
      { name: "description", content: loaderData?.title ?? "تفاصيل البلاغ غير متاحة." },
      { property: "og:title", content: loaderData ? `${loaderData.id} | وزير الحلو` : "البلاغ غير موجود" },
      { property: "og:description", content: loaderData?.title ?? "تفاصيل البلاغ غير متاحة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TicketDetail,
});

const priorityStyles: Record<string, string> = {
  "حرجة": "border-transparent bg-[var(--kpi-crimson)]/10 text-[var(--kpi-crimson)] font-bold",
  "عالية": "border-transparent bg-[var(--kpi-flame)]/10 text-[var(--kpi-flame)] font-semibold",
  "متوسطة": "border-transparent bg-[var(--kpi-amber)]/15 text-[#8a5c00]",
  "منخفضة": "border-border text-muted-foreground",
};

const statusStyles: Record<string, string> = {
  "جديد": "border-transparent bg-[var(--kpi-navy)]/10 text-[var(--kpi-navy)] font-bold",
  "مسندة": "border-transparent bg-[var(--kpi-navy)]/10 text-[var(--kpi-navy)] font-bold",
  "قيد التنفيذ": "border-transparent bg-[var(--kpi-amber)]/20 text-[#8a5c00] font-bold",
  "العمل جارٍ": "border-transparent bg-[var(--kpi-amber)]/20 text-[#8a5c00] font-bold",
  "بانتظار قطعة": "border-transparent bg-[var(--kpi-apricot)]/25 text-[#8a5c00] font-bold",
  "بانتظار شراء": "border-transparent bg-[var(--kpi-apricot)]/25 text-[#8a5c00] font-bold",
  "بانتظار مراجعة الإدارة": "border-transparent bg-[var(--kpi-forest)]/15 text-[var(--kpi-forest)] font-bold",
  "مغلق": "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold",
  "أعيد فتحه": "border-transparent bg-[var(--kpi-flame)]/15 text-[var(--kpi-flame)] font-bold",
};

function TicketDetail() {
  const { user } = useSession();
  const router = useRouter();
  const initialTicket = Route.useLoaderData();
  const [currentTicket, setCurrentTicket] = useState<Ticket>(initialTicket);
  const [editOpen, setEditOpen] = useState(false);

  // Quick activity log state with per-ticket persistence
  const [events, setEvents] = useState(() => {
    if (typeof window === "undefined") return ticketEvents;
    const saved = localStorage.getItem(`wazeer-ticket-events-${currentTicket.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        /* ignore */
      }
    }
    return ticketEvents;
  });
  const [newComment, setNewComment] = useState("");

  const [formData, setFormData] = useState({
    title: currentTicket.title,
    category: currentTicket.category,
    branchId: currentTicket.branchId || branches[0]?.id || "",
    technicianId: currentTicket.technicianId || technicians[0]?.id || "",
    priority: currentTicket.priority,
    status: currentTicket.status,
    sla: currentTicket.sla,
    location: currentTicket.location || "الصالة الرئيسية",
    description: currentTicket.description || "",
  });

  const handleOpenEdit = () => {
    setFormData({
      title: currentTicket.title,
      category: currentTicket.category,
      branchId: currentTicket.branchId || branches[0]?.id || "",
      technicianId: currentTicket.technicianId || technicians[0]?.id || "",
      priority: currentTicket.priority,
      status: currentTicket.status,
      sla: currentTicket.sla,
      location: currentTicket.location || "الصالة الرئيسية",
      description: currentTicket.description || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const branchObj = branches.find((b) => b.id === formData.branchId) || branches[0]!;
    const techObj = technicians.find((t) => t.id === formData.technicianId) || technicians[0]!;

    const updated: Ticket = {
      ...currentTicket,
      title: formData.title.trim(),
      category: formData.category,
      branch: branchObj.name,
      branchId: branchObj.id,
      technician: techObj.name,
      technicianId: techObj.id,
      priority: formData.priority,
      status: formData.status,
      sla: formData.sla.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
    };

    setCurrentTicket(updated);
    const all = getStoredTickets();
    const nextList = all.map((t) => (t.id === updated.id ? updated : t));
    saveStoredTickets(nextList);
    setEditOpen(false);

    // Add event log
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setEvents((prev) => [
      { time: timeStr, title: "تعديل بيانات البلاغ", text: "تم تحديث بيانات وتفاصيل البلاغ بنجاح." },
      ...prev,
    ]);
  };

  const updateStatus = (newStatus: string) => {
    const updated = { ...currentTicket, status: newStatus };
    setCurrentTicket(updated);
    const all = getStoredTickets();
    const nextList = all.map((t) => (t.id === updated.id ? updated : t));
    saveStoredTickets(nextList);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setEvents((prev) => [
      { time: timeStr, title: `تحديث الحالة إلى (${newStatus})`, text: `تم تغيير حالة البلاغ رسمياً إلى ${newStatus}.` },
      ...prev,
    ]);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const authorName = user?.name || "المسؤول";
    const nextEvents = [
      { time: timeStr, title: `ملاحظة (${authorName})`, text: newComment.trim() },
      ...events,
    ];
    setEvents(nextEvents);
    if (typeof window !== "undefined") {
      localStorage.setItem(`wazeer-ticket-events-${currentTicket.id}`, JSON.stringify(nextEvents));
    }
    setNewComment("");
  };

  const backUrl = user?.role === "branch" ? "/branch-tickets" : user?.role === "technician" ? "/tech-panel" : "/tickets";
  const backLabel = user?.role === "branch" ? "العودة لبلاغات الفرع" : user?.role === "technician" ? "العودة لمساحة عمل الفني" : "العودة لقائمة البلاغات";

  return (
    <AppShell title={`تفاصيل البلاغ: ${currentTicket.id}`} allowedRoles={["admin", "branch", "technician"]}>
      <div className="space-y-4 sm:space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to={backUrl}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-brand-ink transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* ================= HERO HEADER CARD (MOBILE OPTIMIZED) ================= */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl sm:text-2xl font-bold text-brand-ink tracking-tight">
                  {currentTicket.id}
                </span>
                <Badge variant="outline" className={cn("text-xs font-bold", statusStyles[currentTicket.status] || "")}>
                  {currentTicket.status}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", priorityStyles[currentTicket.priority])}>
                  أولوية {currentTicket.priority}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {currentTicket.category}
                </Badge>
              </div>

              <h1 className="text-base sm:text-xl font-bold text-foreground leading-snug">
                {currentTicket.title}
              </h1>
            </div>

            {/* Quick Actions (2-col on mobile, flex on desktop) */}
            <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-border/70 sm:border-0 sm:pt-0 sm:w-auto sm:flex sm:flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full sm:w-auto text-xs font-bold gap-1.5 px-3 justify-center"
                onClick={handleOpenEdit}
              >
                <Pencil className="h-3.5 w-3.5 shrink-0" />
                <span>تعديل البلاغ</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full sm:w-auto text-xs font-bold gap-1.5 px-3 justify-center"
                onClick={() => updateStatus("أعيد فتحه")}
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span>إعادة فتح</span>
              </Button>
              <Button
                size="sm"
                className="h-9 col-span-2 sm:col-span-1 w-full sm:w-auto text-xs font-bold gap-1.5 px-4 bg-brand-green hover:bg-brand-green/90 text-primary-foreground justify-center"
                onClick={() => updateStatus("مغلق")}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>تم الحل بنجاح</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ================= KEY STATS ROW (2 COLS ON MOBILE, 4 ON DESKTOP) ================= */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
          <Stat
            label="مستوى الأولوية"
            value={currentTicket.priority}
            icon={Clock3}
            tone={currentTicket.priority === "حرجة" ? "crimson" : currentTicket.priority === "عالية" ? "flame" : "amber"}
            note="درجة التأثير على العمل"
          />
          <Stat
            label="الوقت المتبقي SLA"
            value={currentTicket.sla}
            icon={Timer}
            tone="sand"
            note="حسب معايير الخدمة"
          />
          <Stat
            label="الفرع المسجل"
            value={currentTicket.branch}
            icon={Building2}
            tone="navy"
            note={currentTicket.location || "الصالة الرئيسية"}
          />
          <Stat
            label="الفني المسؤول"
            value={currentTicket.technician}
            icon={UserRound}
            tone="forest"
            note="فريق الصيانة الميدانية"
          />
        </section>

        {/* ================= MAIN SPLIT CONTENT ================= */}
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.3fr_1fr]">
          {/* Left Column: Ticket Details & Structured Data Tiles */}
          <Panel title="بيانات البلاغ وتفاصيل العطل" icon={Wrench}>
            <div className="space-y-4 sm:space-y-5 p-4 sm:p-5">
              {/* Description Box */}
              <div className="rounded-lg border border-border/80 bg-surface/50 p-3.5 sm:p-4">
                <p className="text-xs font-bold text-muted-foreground">الوصف المكتوب للمشكلة:</p>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {currentTicket.description || "لا يوجد وصف إضافي مسجل لهذا البلاغ."}
                </p>
              </div>

              {/* 4 Touch-Friendly Structured Info Tiles */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                {/* Tile 1: Branch & Location */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-ink/10 text-brand-ink">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-muted-foreground">الفرع والموقع الداخلي</p>
                    <Link
                      to="/branches/$branchId"
                      params={{ branchId: currentTicket.branchId }}
                      className="mt-0.5 block truncate text-xs sm:text-sm font-bold text-brand-ink hover:underline"
                    >
                      {currentTicket.branch}
                    </Link>
                    <p className="truncate text-[11px] text-muted-foreground mt-0.5">
                      {currentTicket.location || "الصالة الرئيسية"}
                    </p>
                  </div>
                </div>

                {/* Tile 2: Technician */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-muted-foreground">الفني المسند للمهمة</p>
                    <Link
                      to="/technicians/$technicianId"
                      params={{ technicianId: currentTicket.technicianId }}
                      className="mt-0.5 block truncate text-xs sm:text-sm font-bold text-brand-ink hover:underline"
                    >
                      {currentTicket.technician}
                    </Link>
                    <p className="text-[11px] text-muted-foreground mt-0.5">الصيانة الميدانية</p>
                  </div>
                </div>

                {/* Tile 3: Category */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--kpi-amber)]/15 text-[#8a5c00]">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-muted-foreground">التصنيف الفني</p>
                    <p className="mt-0.5 truncate text-xs sm:text-sm font-bold text-foreground">
                      {currentTicket.category}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">أولوية: {currentTicket.priority}</p>
                  </div>
                </div>

                {/* Tile 4: SLA & Timing */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-500/10 text-brand-red">
                    <Timer className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-muted-foreground">الوقت المستهدف SLA</p>
                    <p className="mt-0.5 font-mono text-xs sm:text-sm font-bold text-brand-red">
                      {currentTicket.sla}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">تاريخ التسجيل: {currentTicket.createdISO || "اليوم"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Right Column: Activity Timeline & Comment Logger */}
          <Panel title="سجل النشاط والمتابعة" icon={MessageSquareText}>
            <div className="flex flex-col h-full justify-between p-4 sm:p-5 space-y-4">
              {/* Timeline Items */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {events.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg border border-border/70 bg-surface/40 p-3 text-xs">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-ink/10 font-mono text-[11px] font-bold text-brand-ink">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-foreground">{event.title}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{event.time}</span>
                      </div>
                      <p className="leading-relaxed text-muted-foreground">{event.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-border">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="إضافة ملاحظة أو تحديث للمتابعة..."
                  className="text-xs h-9"
                />
                <Button type="submit" size="sm" disabled={!newComment.trim()} className="gap-1 h-9 px-3 shrink-0">
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">إرسال</span>
                </Button>
              </form>
            </div>
          </Panel>
        </div>

        {/* ================= MODAL: EDIT TICKET (RESPONSIVE) ================= */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-brand-ink" />
                تعديل بيانات البلاغ ({currentTicket.id})
              </DialogTitle>
              <DialogDescription>
                تحديث بيانات البلاغ أو الحالة أو الفني المسند وموقع العطل.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
              <Field label="عنوان البلاغ">
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="التصنيف">
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="الفرع">
                  <Select
                    value={formData.branchId}
                    onValueChange={(v) => setFormData({ ...formData, branchId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="الفني المسند">
                  <Select
                    value={formData.technicianId}
                    onValueChange={(v) => setFormData({ ...formData, technicianId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="الحالة">
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="جديد">جديد</SelectItem>
                      <SelectItem value="مسندة">مسندة</SelectItem>
                      <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                      <SelectItem value="بانتظار شراء">بانتظار شراء</SelectItem>
                      <SelectItem value="بانتظار قطعة">بانتظار قطعة</SelectItem>
                      <SelectItem value="بانتظار مراجعة الإدارة">بانتظار مراجعة الإدارة</SelectItem>
                      <SelectItem value="مغلق">مغلق</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="الأولوية">
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="حرجة">حرجة 🔥</SelectItem>
                      <SelectItem value="عالية">عالية</SelectItem>
                      <SelectItem value="متوسطة">متوسطة</SelectItem>
                      <SelectItem value="منخفضة">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="زمن الاستجابة SLA">
                  <Input
                    value={formData.sla}
                    onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                    dir="ltr"
                    className="font-mono text-left"
                  />
                </Field>
                <Field label="الموقع داخل الفرع">
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="الوصف التفصيلي">
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-20"
                />
              </Field>

              <DialogFooter className="gap-2 sm:justify-start pt-2">
                <Button type="submit" className="bg-brand-ink text-primary-foreground w-full sm:w-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  حفظ التعديلات
                </Button>
                <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setEditOpen(false)}>
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}