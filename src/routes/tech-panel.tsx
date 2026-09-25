import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Boxes,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Clock3,
  ExternalLink,
  Filter,
  Flame,
  LayoutGrid,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquare,
  MessageSquareText,
  Navigation,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Table as TableIcon,
  Timer,
  Truck,
  UserCheck,
  UserCog,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { TechNavTabs } from "@/components/helpdesk/tech-nav-tabs";
import { Field, Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import { branches, technicians, tickets, type Ticket } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tech-panel")({
  head: () => ({
    meta: [
      { title: "لوحة الفني | وزير الحلو" },
      { name: "description", content: "لوحة الفني: البلاغات المرتبطة، الملف الشخصي وإدارة الأداء، والمحادثة الداخلية الميدانية." },
      { property: "og:title", content: "لوحة الفني | وزير الحلو" },
      { property: "og:description", content: "لوحة الفني: البلاغات المرتبطة، الملف الشخصي وإدارة الأداء، والمحادثة الداخلية الميدانية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell title="لوحة الفني" role="technician">
      <TechPanelContent />
    </AppShell>
  ),
});

const steps = ["مسندة", "مقبولة", "العمل جارٍ", "بانتظار قطعة", "بانتظار مراجعة الإدارة", "مغلق"];

const priorityStyles: Record<string, string> = {
  "حرجة": "border-transparent bg-[var(--kpi-crimson)]/10 text-[var(--kpi-crimson)] font-bold",
  "عالية": "border-transparent bg-[var(--kpi-flame)]/10 text-[var(--kpi-flame)] font-semibold",
  "متوسطة": "border-transparent bg-[var(--kpi-amber)]/15 text-[#8a5c00]",
  "منخفضة": "border-border text-muted-foreground",
};

const statusStyles: Record<string, string> = {
  "مسندة": "border-transparent bg-[var(--kpi-navy)]/10 text-[var(--kpi-navy)] font-bold",
  "مقبولة": "border-transparent bg-[var(--kpi-sage)]/25 text-[#1f4e38] font-bold",
  "قيد التنفيذ": "border-transparent bg-[var(--kpi-amber)]/20 text-[#8a5c00] font-bold",
  "العمل جارٍ": "border-transparent bg-[var(--kpi-amber)]/20 text-[#8a5c00] font-bold",
  "بانتظار قطعة": "border-transparent bg-[var(--kpi-apricot)]/25 text-[#8a5c00] font-bold",
  "بانتظار شراء": "border-transparent bg-[var(--kpi-apricot)]/25 text-[#8a5c00] font-bold",
  "بانتظار مراجعة الإدارة": "border-transparent bg-[var(--kpi-forest)]/15 text-[var(--kpi-forest)] font-bold",
  "مغلق": "border-border text-muted-foreground bg-muted/40",
};

export function TechPanelContent() {
  const navigate = useNavigate();
  const { user } = useSession();
  const techBase = technicians.find((t) => t.id === user?.technicianId) ?? technicians[0]!;

  // Technician availability status
  const [techStatus, setTechStatus] = useState<string>(() => {
    return localStorage.getItem("wazeer-tech-status") || techBase.status || "في مهمة";
  });
  const updateTechStatus = (s: string) => {
    setTechStatus(s);
    localStorage.setItem("wazeer-tech-status", s);
  };

  // Tickets state
  const myInitialTickets = useMemo(() => {
    const direct = tickets.filter((t) => t.technicianId === techBase.id);
    return direct.length > 0 ? direct : tickets;
  }, [techBase.id]);

  const [allTickets, setAllTickets] = useState<Ticket[]>(myInitialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(myInitialTickets[0]?.id || "");
  const [stages, setStages] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    myInitialTickets.forEach((t) => {
      map[t.id] = t.status === "قيد التنفيذ" ? "العمل جارٍ" : t.status;
    });
    return map;
  });

  // Ticket Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"workspace" | "table">("table");

  // Timer for active work
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(2540); // seed e.g. 00:42:20
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (total: number) => {
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Activity Logs per ticket
  const [ticketLogs, setTicketLogs] = useState<Record<string, Array<{ time: string; text: string; author: string }>>>({
    "HD-2026-000452": [
      { time: "09:30", text: "تم إسناد البلاغ للفني أحمد سامي.", author: "النظام" },
      { time: "09:45", text: "تم قبول المهمة والتوجه إلى فرع التجمع الخامس.", author: "أحمد سامي" },
      { time: "10:15", text: "تم الوصول إلى الموقع وفحص مفتاح الشبكة PoE والكاميرا 08.", author: "أحمد سامي" },
    ],
  });

  const [noteInput, setNoteInput] = useState("");
  const [spentTimeInput, setSpentTimeInput] = useState("01:15");

  // Parts Request Modal
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [partName, setPartName] = useState("");
  const [partModel, setPartModel] = useState("");
  const [partQty, setPartQty] = useState("1");
  const [partUrgency, setPartUrgency] = useState("عاجل");
  const [partNotes, setPartNotes] = useState("");

  // Map / Directions Modal
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);

  // Selected Ticket details
  const activeTicket = allTickets.find((t) => t.id === selectedTicketId) || allTickets[0] || myInitialTickets[0];
  const activeStage = (activeTicket ? stages[activeTicket.id] : "") || "مسندة";
  const defaultBranch = {
    id: "branch-04",
    name: "فرع التجمع",
    manager: "كريم محمود",
    open: 3,
    closed: 48,
    satisfaction: "4.9",
    phone: "02 2618 4401",
    address: "التجمع الخامس، القاهرة الجديدة",
  };
  const activeBranch = branches.find((b) => b.id === activeTicket?.branchId) ?? defaultBranch;
  const stepIdx = steps.indexOf(activeStage);

  // Handle stage transitions
  const advanceStage = (nextStage: string, logEntry: string) => {
    if (!activeTicket) return;
    setStages((prev) => ({ ...prev, [activeTicket.id]: nextStage }));
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setTicketLogs((prev) => ({
      ...prev,
      [activeTicket.id]: [{ time: timeStr, text: logEntry, author: techBase.name }, ...(prev[activeTicket.id] || [])],
    }));

    if (nextStage === "العمل جارٍ") {
      setIsTimerRunning(true);
    } else if (nextStage === "بانتظار قطعة" || nextStage === "بانتظار مراجعة الإدارة" || nextStage === "مغلق") {
      setIsTimerRunning(false);
    }
  };

  // Add work log
  const handleAddLog = () => {
    if (!noteInput.trim() || !activeTicket) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const entry = `${noteInput.trim()} (مدة العمل المسجلة: ${spentTimeInput})`;
    setTicketLogs((prev) => ({
      ...prev,
      [activeTicket.id]: [{ time: timeStr, text: entry, author: techBase.name }, ...(prev[activeTicket.id] || [])],
    }));
    setNoteInput("");
  };

  // Submit spare part request
  const handleSparePartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim() || !activeTicket) return;

    advanceStage("بانتظار قطعة", `طلب قطعة غيار: ${partName} (${partModel || "بدون كود"}) - الكمية: ${partQty} - الأولوية: ${partUrgency}`);

    // Push to internal chat storage automatically for purchasing visibility
    try {
      const KEY = "wazeer-internal-chat";
      const raw = localStorage.getItem(KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const now = new Date();
      const newMsg = {
        id: String(Date.now()),
        channel: "purchasing",
        author: techBase.name,
        role: "فني ميداني",
        text: `📦 طلب قطعة غيار عاجل للبلاغ ${activeTicket.id} (${activeTicket.branch}): مطلوب ${partName} (الكمية: ${partQty}) - ${partNotes || "يرجى التوريد بأسرع وقت"}`,
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      };
      localStorage.setItem(KEY, JSON.stringify([...existing, newMsg]));
    } catch {
      /* ignore */
    }

    setPartModalOpen(false);
    setPartName("");
    setPartModel("");
    setPartQty("1");
    setPartNotes("");
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return allTickets.filter((t) => {
      const currentStage = stages[t.id] ?? t.status;
      const matchSearch =
        searchQuery === "" ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && (currentStage === "مسندة" || currentStage === "مقبولة" || currentStage === "العمل جارٍ" || currentStage === "قيد التنفيذ")) ||
        (statusFilter === "parts" && (currentStage === "بانتظار قطعة" || currentStage === "بانتظار شراء")) ||
        (statusFilter === "review" && currentStage === "بانتظار مراجعة الإدارة") ||
        (statusFilter === "closed" && currentStage === "مغلق");

      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [allTickets, stages, searchQuery, statusFilter, priorityFilter]);

  // Counts for KPIs
  const activeCount = allTickets.filter((t) => {
    const s = stages[t.id] ?? t.status;
    return s !== "مغلق" && s !== "بانتظار مراجعة الإدارة";
  }).length;
  const inProgressCount = allTickets.filter((t) => (stages[t.id] ?? t.status) === "العمل جارٍ" || (stages[t.id] ?? t.status) === "قيد التنفيذ").length;
  const pendingPartsCount = allTickets.filter((t) => {
    const s = stages[t.id] ?? t.status;
    return s === "بانتظار قطعة" || s === "بانتظار شراء";
  }).length;

  return (
    <div className="space-y-6">
      {/* ================= TOP HERO & STATUS BAR ================= */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-brand-ink text-lg sm:text-xl font-bold text-primary-foreground shadow-sm">
              {techBase.name[0]}
            </div>
            <span
              className={cn(
                "absolute -bottom-1 -left-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-card",
                techStatus === "متاح للعمل" && "bg-brand-green",
                techStatus === "في مهمة" && "bg-[var(--kpi-amber)]",
                techStatus === "في استراحة" && "bg-[var(--kpi-apricot)]",
                techStatus === "غير متاح" && "bg-muted-foreground",
              )}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold sm:text-2xl">{techBase.name}</h1>
              <Badge variant="outline" className="font-mono text-[11px] sm:text-xs">
                {techBase.employeeId || "TECH-2026-08"}
              </Badge>
              <Badge
                className={cn(
                  "cursor-pointer text-[11px] sm:text-xs transition-transform hover:scale-105",
                  techStatus === "متاح للعمل" && "bg-brand-green text-primary-foreground",
                  techStatus === "في مهمة" && "bg-[var(--kpi-amber)] text-brand-ink font-bold",
                  techStatus === "في استراحة" && "bg-[var(--kpi-apricot)] text-brand-ink font-bold",
                  techStatus === "غير متاح" && "bg-muted text-muted-foreground",
                )}
              >
                ● {techStatus}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {techBase.skill} · النطاق: <span className="font-semibold text-foreground">{techBase.zone}</span>
            </p>
          </div>
        </div>

        {/* Quick status selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={techStatus} onValueChange={updateTechStatus}>
            <SelectTrigger className="h-9 flex-1 sm:w-36 text-xs font-semibold">
              <SelectValue placeholder="حالة الفني" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="متاح للعمل">🟢 متاح للعمل</SelectItem>
              <SelectItem value="في مهمة">🟡 في مهمة ميدانية</SelectItem>
              <SelectItem value="في استراحة">☕ في استراحة</SelectItem>
              <SelectItem value="غير متاح">⚪ غير متاح</SelectItem>
            </SelectContent>
          </Select>

          {activeBranch && (
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs" onClick={() => setDirectionsModalOpen(true)}>
              <Navigation className="h-3.5 w-3.5" />
              الاتجاهات
            </Button>
          )}

          {activeBranch?.phone && (
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs" asChild>
              <a href={`tel:${activeBranch.phone}`} dir="ltr">
                <Phone className="h-3.5 w-3.5" />
                {activeBranch.phone}
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* ================= NAVIGATION TABS (RESPONSIVE) ================= */}
      <TechNavTabs active="panel" />

      {/* ================= RELATED TICKETS & WORKSPACE ================= */}
      <div className="space-y-6">
        {/* Key Stats Row (2 cols on mobile, 4 on desktop) */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
          <Stat label="المهام النشطة" value={String(activeCount)} tone="navy" icon={Wrench} note="مسندة وجارية" />
          <Stat label="قيد العمل حالياً" value={String(inProgressCount)} tone="amber" icon={Timer} note="ساعة العمل جارية" />
          <Stat label="بانتظار قطع غيار" value={String(pendingPartsCount)} tone="apricot" icon={Boxes} note="أُرسلت للمشتريات" />
          <Stat label="المكتملة هذا الشهر" value={String(techBase.completed)} tone="forest" icon={CheckCircle2} note="نسبة التزام 96.4%" />
        </section>

        {/* View Mode Toggle Segmented Control */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface border border-border w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode("workspace")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all",
                viewMode === "workspace"
                  ? "bg-card text-brand-ink shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span>مساحة العمل</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all",
                viewMode === "table"
                  ? "bg-card text-brand-ink shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="h-4 w-4 shrink-0" />
              <span>قائمة البلاغات</span>
            </button>
          </div>

          {viewMode === "workspace" && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span>البلاغ النشط بمساحة العمل:</span>
              <span className="font-display font-bold text-brand-ink">{activeTicket?.id}</span>
            </div>
          )}
        </div>

        {/* Filters Bar: Only shown when viewing tickets list */}
        {viewMode === "table" && (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-xs md:flex-row md:items-center md:justify-between">
            <div className="relative w-full flex-1 sm:max-w-xs">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في البلاغات أو الفرع..."
                className="h-9 pr-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full sm:w-36 text-xs">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">النشطة والجارية</SelectItem>
                  <SelectItem value="parts">بانتظار قطع</SelectItem>
                  <SelectItem value="review">بانتظار المراجعة</SelectItem>
                  <SelectItem value="closed">المغلقة والمكتملة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-full sm:w-32 text-xs">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">كل الأولويات</SelectItem>
                  <SelectItem value="حرجة">حرجة 🔥</SelectItem>
                  <SelectItem value="عالية">عالية</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

          {/* WORKSPACE VIEW: Split List + Active Workbench */}
          {viewMode === "workspace" ? (
            <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
              {/* Left Column: Related Tickets List (Hidden on mobile view, shown on desktop xl) */}
              <Panel
                title={`البلاغات المسندة (${filteredTickets.length})`}
                icon={Briefcase}
                className="hidden xl:block h-fit xl:sticky xl:top-24"
              >
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    لا توجد بلاغات تطابق معايير البحث.
                  </div>
                ) : (
                  <div className="divide-y divide-border max-h-[700px] overflow-y-auto">
                    {filteredTickets.map((t) => {
                      const st = stages[t.id] ?? t.status;
                      const isSelected = t.id === activeTicket?.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedTicketId(t.id);
                          }}
                          className={cn(
                            "block w-full p-4 text-right transition-colors hover:bg-surface text-foreground",
                            isSelected && "bg-surface border-r-4 border-r-brand-gold",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-xs font-bold text-brand-ink">{t.id}</span>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5", priorityStyles[t.priority])}>
                                {t.priority}
                              </Badge>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5", statusStyles[st] || "")}>
                                {st}
                              </Badge>
                            </div>
                          </div>
                          <p className="mt-1.5 font-bold text-sm leading-snug line-clamp-2">{t.title}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-brand-ink" />
                              {t.branch}
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-brand-red">
                              <Clock className="h-3 w-3" />
                              {t.sla}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Panel>

              {/* Right Column: Active Ticket Interactive Workbench */}
              {activeTicket ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Current Active Ticket Header Card */}
                  <Panel
                    title={`تفاصيل البلاغ: ${activeTicket.id}`}
                    icon={Wrench}
                    action={
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className={cn("text-xs font-bold", priorityStyles[activeTicket.priority])}>
                          أولوية {activeTicket.priority}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs font-bold", statusStyles[activeStage])}>
                          {activeStage}
                        </Badge>
                      </div>
                    }
                  >
                    <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">{activeTicket.title}</h2>
                          <Link
                            to="/tickets/$ticketId"
                            params={{ ticketId: activeTicket.id }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-ink hover:underline shrink-0"
                          >
                            عرض السجل الكامل
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          التصنيف: <span className="font-semibold text-foreground">{activeTicket.category}</span> · وقت
                          الإنشاء: {activeTicket.createdISO || "اليوم"}
                        </p>
                      </div>

                      {/* Branch Info Strip */}
                      <div className="grid gap-3 rounded-lg border border-border bg-surface/70 p-3.5 sm:p-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-[11px] font-bold text-muted-foreground">الفرع والموقع</p>
                          <p className="mt-0.5 text-sm font-bold flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-brand-ink shrink-0" />
                            {activeTicket.branch}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activeBranch.address}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-muted-foreground">موقع العطل داخل الفرع</p>
                          <p className="mt-0.5 text-sm font-bold">{activeTicket.location || "الصالة الرئيسية"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">مدير الفرع: {activeBranch.manager}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-muted-foreground">التواصل المباشر</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <a
                              href={`tel:${activeTicket.branchPhone || activeBranch.phone}`}
                              dir="ltr"
                              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-mono font-bold text-brand-ink hover:bg-surface shadow-xs transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {activeTicket.branchPhone || activeBranch.phone}
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-xs font-bold shrink-0"
                              onClick={() => setDirectionsModalOpen(true)}
                            >
                              خريطة
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Problem Description */}
                      <div className="rounded-lg border border-border/80 bg-card p-3.5 sm:p-4">
                        <p className="text-xs font-bold text-muted-foreground">وصف المشكلة المبلّغ عنها:</p>
                        <p className="mt-1.5 text-sm leading-relaxed">{activeTicket.description}</p>
                      </div>

                      {/* 6-Step Pipeline Indicator - fully responsive without min-w scrollbar bug */}
                      <div className="rounded-lg border border-border bg-surface/50 p-3 sm:p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">مراحل إنجاز المهمة:</span>
                          <span className="font-mono text-muted-foreground">
                            المرحلة {Math.min(stepIdx + 1, steps.length)} من {steps.length}
                          </span>
                        </div>

                        {/* Progress Bars (100% width, 6 columns) */}
                        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                          {steps.map((s, i) => (
                            <div key={s} className="space-y-1">
                              <div
                                className={cn(
                                  "h-2 w-full rounded-full transition-all",
                                  i <= stepIdx ? "bg-brand-green" : "bg-muted",
                                )}
                              />
                              {/* Desktop label */}
                              <span
                                className={cn(
                                  "hidden sm:block truncate text-center text-[10px]",
                                  i === stepIdx ? "font-bold text-brand-ink" : "text-muted-foreground",
                                )}
                              >
                                {s}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Mobile-only current step label chip */}
                        <div className="flex items-center justify-between text-xs pt-0.5 sm:hidden">
                          <span className="text-muted-foreground text-[11px]">المرحلة الحالية:</span>
                          <span className="font-bold text-brand-ink bg-card px-2 py-0.5 rounded border border-border text-[11px]">
                            {steps[Math.min(stepIdx, steps.length - 1)]}
                          </span>
                        </div>
                      </div>

                      {/* Stopwatch & Action Controls */}
                      <div className="flex flex-col gap-4 rounded-xl border border-border bg-gradient-to-r from-card to-surface p-3.5 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground">عداد العمل الفعلي الميداني</p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-brand-ink">
                              {formatTimer(timerSeconds)}
                            </span>
                            <span
                              className={cn(
                                "flex h-3 w-3 rounded-full",
                                isTimerRunning ? "bg-brand-green animate-ping" : "bg-muted-foreground",
                              )}
                            />
                          </div>
                        </div>

                        {/* Interactive Buttons: 2-col on mobile, flex on desktop */}
                        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:items-center sm:w-auto">
                          <Button
                            disabled={activeStage !== "مسندة"}
                            onClick={() => advanceStage("مقبولة", "تم قبول المهمة وجارٍ الانتقال للموقع")}
                            className="h-10 bg-brand-green hover:bg-brand-green/90 text-primary-foreground text-xs font-bold justify-center"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            قبول المهمة
                          </Button>

                          {!isTimerRunning ? (
                            <Button
                              variant="secondary"
                              disabled={stepIdx < 1 || activeStage === "العمل جارٍ"}
                              onClick={() => advanceStage("العمل جارٍ", "بدء العمل وتشغيل عداد الصيانة")}
                              className="h-10 text-xs font-bold justify-center"
                            >
                              <Play className="h-4 w-4 text-brand-green shrink-0" />
                              بدء العمل
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsTimerRunning(false);
                                advanceStage("مقبولة", "إيقاف مؤقت للعمل وحفظ الوقت المستغرق");
                              }}
                              className="h-10 text-xs font-bold justify-center"
                            >
                              <Pause className="h-4 w-4 text-brand-red shrink-0" />
                              إيقاف مؤقت
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => setPartModalOpen(true)}
                            className="h-10 text-xs font-bold text-[#8a5c00] border-[var(--kpi-amber)]/40 hover:bg-[var(--kpi-amber)]/10 justify-center"
                          >
                            <Boxes className="h-4 w-4 shrink-0" />
                            طلب قطعة غيار
                          </Button>

                          <Button
                            disabled={stepIdx < 2 || activeStage === "بانتظار مراجعة الإدارة" || activeStage === "مغلق"}
                            onClick={() =>
                              advanceStage("بانتظار مراجعة الإدارة", "تم إنهاء العمل الفني واختبار المنظومة، وإرسال البلاغ للمراجعة")
                            }
                            className="h-10 col-span-2 sm:col-span-1 bg-brand-ink hover:bg-brand-ink/90 text-primary-foreground text-xs font-bold justify-center"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            إنجاز وإرسال للمراجعة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Panel>

                  {/* Work Notes Logger & Chronological Activity Feed */}
                  <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    {/* Add Work Note */}
                    <Panel title="تسجيل ملاحظات وتحديثات الفحص" icon={MessageSquareText}>
                      <div className="space-y-4 p-5">
                        <Field label="ملاحظات المعاينة والإصلاح">
                          <Textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="اكتب ما تم فحصه، القراءات، الكابلات التي تم اختبارها، أو القطع المستبدلة..."
                            className="min-h-24 leading-relaxed"
                          />
                        </Field>

                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 items-end">
                          <div className="space-y-1.5 min-w-0">
                            <label className="text-xs sm:text-sm font-bold text-foreground truncate block">
                              المدة (س:د)
                            </label>
                            <Input
                              value={spentTimeInput}
                              onChange={(e) => setSpentTimeInput(e.target.value)}
                              placeholder="01:30"
                              dir="ltr"
                              className="h-10 text-left font-mono text-xs sm:text-sm"
                            />
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <label className="text-xs sm:text-sm font-bold text-foreground truncate block">
                              مستوى الإنجاز
                            </label>
                            <Select defaultValue="90%">
                              <SelectTrigger className="h-10 text-xs sm:text-sm [&>span]:truncate">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="25%">25% - فحص مبدئي</SelectItem>
                                <SelectItem value="50%">50% - جارٍ الإصلاح</SelectItem>
                                <SelectItem value="75%">75% - تم التركيب</SelectItem>
                                <SelectItem value="90%">90% - مرحلة الاختبار</SelectItem>
                                <SelectItem value="100%">100% - مكتمل بنجاح</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button
                          disabled={!noteInput.trim()}
                          onClick={handleAddLog}
                          className="w-full sm:w-auto"
                        >
                          <Send className="h-4 w-4" />
                          حفظ التحديث في سجل البلاغ
                        </Button>
                      </div>
                    </Panel>

                    {/* Timeline Activity Feed for this Ticket */}
                    <Panel title="سجل نشاط البلاغ" icon={Clock3}>
                      <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
                        {(ticketLogs[activeTicket.id] || []).length === 0 ? (
                          <p className="text-center text-xs text-muted-foreground py-6">
                            لا توجد تحديثات مسجلة بعد لهذا البلاغ.
                          </p>
                        ) : (
                          (ticketLogs[activeTicket.id] ?? []).map((item, idx) => (
                            <div key={idx} className="rounded-lg border border-border/80 bg-surface/40 p-3 text-xs">
                              <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px] mb-1">
                                <span className="font-bold text-brand-ink">{item.author}</span>
                                <span>{item.time}</span>
                              </div>
                              <p className="text-foreground leading-relaxed">{item.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </Panel>
                  </div>
                </div>
              ) : (
                <div className="grid place-items-center rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  <div>
                    <LifeBuoy className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-base font-bold">يرجى اختيار بلاغ من القائمة الجانبية</p>
                    <p className="mt-1 text-xs">لبدء العمل، تسجيل التحديثات، أو طلب قطع غيار</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TABLE/CARDS VIEW: All Related Tickets */
            <Panel title={`جميع البلاغات المرتبطة (${filteredTickets.length})`} icon={TableIcon}>
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  لا توجد بلاغات تطابق معايير البحث.
                </div>
              ) : (
                <>
                  {/* Mobile Cards View (Visible on screens < md) */}
                  <div className="divide-y divide-border md:hidden">
                    {filteredTickets.map((t) => {
                      const st = stages[t.id] ?? t.status;
                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest("button") || target.closest("a")) return;
                            navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                          }}
                          className="cursor-pointer p-4 space-y-3 bg-card hover:bg-surface/50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              to="/tickets/$ticketId"
                              params={{ ticketId: t.id }}
                              className="font-display text-xs font-bold text-brand-ink hover:underline"
                            >
                              {t.id}
                            </Link>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", priorityStyles[t.priority])}>
                                {t.priority}
                              </Badge>
                              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", statusStyles[st] || "")}>
                                {st}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <Link
                              to="/tickets/$ticketId"
                              params={{ ticketId: t.id }}
                              className="text-sm font-bold text-foreground leading-snug hover:underline block"
                            >
                              {t.title}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">{t.category}</p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface/40 p-2.5 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin className="h-3.5 w-3.5 text-brand-ink shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold text-foreground">{t.branch}</span>
                                <span className="text-[11px] text-muted-foreground mr-1.5">· {t.location || "الموقع الرئيسي"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 font-mono font-bold text-brand-red shrink-0">
                              <Timer className="h-3.5 w-3.5" />
                              <span>{t.sla}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              className="flex-1 h-9 text-xs font-bold gap-1.5"
                              onClick={() => {
                                setSelectedTicketId(t.id);
                                setViewMode("workspace");
                              }}
                            >
                              <Wrench className="h-3.5 w-3.5" />
                              فتح مساحة العمل
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="h-9 px-3 text-xs"
                            >
                              <Link to="/tickets/$ticketId" params={{ ticketId: t.id }}>
                                التفاصيل
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View (Visible on md and up) */}
                  <div className="hidden md:block w-full overflow-x-auto">
                    <Table className="min-w-[680px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>رقم البلاغ</TableHead>
                          <TableHead>العنوان والتصنيف</TableHead>
                          <TableHead>الفرع</TableHead>
                          <TableHead>الأولوية</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>الـ SLA</TableHead>
                          <TableHead className="w-36 text-center">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map((t) => {
                          const st = stages[t.id] ?? t.status;
                          return (
                            <TableRow
                              key={t.id}
                              onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest("button") || target.closest("a")) return;
                                navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                              }}
                              className="cursor-pointer hover:bg-surface/50 transition-colors"
                            >
                              <TableCell className="font-display font-bold text-xs text-brand-ink">
                                <Link to="/tickets/$ticketId" params={{ ticketId: t.id }} className="hover:underline">
                                  {t.id}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <p className="font-bold text-sm">{t.title}</p>
                                <span className="text-xs text-muted-foreground">{t.category}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-semibold">{t.branch}</span>
                                <p className="text-xs text-muted-foreground">{t.location || "الموقع الرئيسي"}</p>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={priorityStyles[t.priority]}>
                                  {t.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={statusStyles[st] || ""}>
                                  {st}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-xs font-bold text-brand-red flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {t.sla}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs font-semibold"
                                  onClick={() => {
                                    setSelectedTicketId(t.id);
                                    setViewMode("workspace");
                                  }}
                                >
                                  فتح المهمة
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </Panel>
          )}
        </div>

      {/* ================= MODAL: SPARE PART REQUEST ================= */}
      <Dialog open={partModalOpen} onOpenChange={setPartModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-brand-ink" />
              طلب قطعة غيار للمشتريات
            </DialogTitle>
            <DialogDescription>
              سيتم إرسال الطلب مباشرة لقسم المشتريات وتحديث حالة البلاغ {activeTicket?.id} إلى "بانتظار قطعة".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSparePartSubmit} className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="اسم القطعة المطلوبة">
                <Input
                  required
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="مثال: محول طاقة PoE Switch 48V"
                />
              </Field>
              <Field label="الموديل أو كود القطعة (اختياري)">
                <Input
                  value={partModel}
                  onChange={(e) => setPartModel(e.target.value)}
                  placeholder="DH-PFS3006-4ET-60"
                  dir="ltr"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="الكمية المطلوبة">
                <Input
                  type="number"
                  min="1"
                  value={partQty}
                  onChange={(e) => setPartQty(e.target.value)}
                />
              </Field>
              <Field label="مستوى الأولوية">
                <Select value={partUrgency} onValueChange={setPartUrgency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="عاجل">عاجل جداً (خلال ساعتين)</SelectItem>
                    <SelectItem value="خلال اليوم">خلال وردية اليوم</SelectItem>
                    <SelectItem value="عادي">توريد عادي (غداً)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="ملاحظات ومواصفات إضافية">
              <Textarea
                value={partNotes}
                onChange={(e) => setPartNotes(e.target.value)}
                placeholder="وضح سبب الحاجة ومكان التركيب في الفرع..."
                className="min-h-16"
              />
            </Field>

            <DialogFooter className="gap-2 sm:justify-start pt-2">
              <Button type="submit" className="bg-brand-ink hover:bg-brand-ink/90">
                <Send className="h-4 w-4" />
                إرسال الطلب للمشتريات
              </Button>
              <Button type="button" variant="ghost" onClick={() => setPartModalOpen(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: DIRECTIONS & MAP ================= */}
      <Dialog open={directionsModalOpen} onOpenChange={setDirectionsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-ink" />
              الاتجاهات وموقع الفرع
            </DialogTitle>
            <DialogDescription>
              بيانات الوصول إلى {activeBranch.name} للصيانة الميدانية.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-surface p-4 text-sm space-y-2">
              <p className="font-bold text-base">{activeBranch.name}</p>
              <p className="text-muted-foreground">{activeBranch.address}</p>
              <div className="pt-2 border-t border-border flex justify-between text-xs">
                <span>مدير الفرع: <strong>{activeBranch.manager}</strong></span>
                <span dir="ltr"><strong>{activeBranch.phone}</strong></span>
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              <Navigation className="mx-auto h-8 w-8 text-brand-gold mb-2" />
              المسافة التقديرية من موقعك الحالي: <strong className="text-foreground">4.2 كم (حوالي 12 دقيقة)</strong>
            </div>

            <Button
              className="w-full"
              asChild
            >
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(activeBranch.address)}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                فتح في خرائط Google Maps
              </a>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button variant="ghost" onClick={() => setDirectionsModalOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
