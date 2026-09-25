import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChefHat,
  Clock,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  Hash,
  Mail,
  MapPin,
  MessageSquare,
  MessageSquareText,
  Phone,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  User,
  UserCheck,
  Users,
  Wifi,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import {
  Branch,
  branches,
  getStoredBranches,
  getStoredTickets,
  Ticket,
} from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";
import {
  categoryConfig as staffCategoryConfig,
  defaultStaff,
  StaffMember,
} from "./branch-staff";
import {
  categories as taskCategories,
  categoryBadgeStyles as taskCategoryStyles,
  defaultTasks,
  priorityStyle as taskPriorityStyle,
  Task,
  TaskNote,
} from "./branch-tasks";

export const Route = createFileRoute("/branches/$branchId")({
  loader: ({ params }) => {
    const list = typeof window !== "undefined" ? getStoredBranches() : branches;
    const branch =
      list.find((item) => item.id === params.branchId) ||
      branches.find((item) => item.id === params.branchId);
    if (!branch) throw notFound();
    return branch;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.name} - التفاصيل والبلاغات والمهام وطاقم العمل | وزير الحلو`
          : "الفرع غير موجود",
      },
      {
        name: "description",
        content:
          "لوحة تفاصيل الفرع في الإدارة: عرض البلاغات المرتبطة، المهام التشغيلية، وطاقم العمل وبطاقات الهوية.",
      },
      {
        property: "og:title",
        content: loaderData
          ? `${loaderData.name} | وزير الحلو`
          : "الفرع غير موجود",
      },
      {
        property: "og:description",
        content:
          "لوحة تفاصيل الفرع في الإدارة: عرض البلاغات المرتبطة، المهام التشغيلية، وطاقم العمل وبطاقات الهوية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BranchDetail,
});

function BranchDetail() {
  const branch = Route.useLoaderData();
  const { user } = useSession();

  // Active Tab: "overview" | "tickets" | "tasks" | "staff" | "info"
  const [activeTab, setActiveTab] = useState<
    "overview" | "tickets" | "tasks" | "staff" | "info"
  >("overview");

  // 1. TICKETS STATE
  const [ticketsList, setTicketsList] = useState<Ticket[]>(() => {
    if (typeof window !== "undefined") {
      const all = getStoredTickets();
      return all.filter(
        (t) =>
          t.branchId === branch.id ||
          t.branch?.trim() === branch.name?.trim()
      );
    }
    return [];
  });

  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all");
  const [ticketSearch, setTicketSearch] = useState<string>("");

  useEffect(() => {
    const handleUpdate = () => {
      const all = getStoredTickets();
      setTicketsList(
        all.filter(
          (t) =>
            t.branchId === branch.id ||
            t.branch?.trim() === branch.name?.trim()
        )
      );
    };
    window.addEventListener("wazeer-tickets-updated", handleUpdate);
    return () => window.removeEventListener("wazeer-tickets-updated", handleUpdate);
  }, [branch.id, branch.name]);

  const filteredTickets = useMemo(() => {
    return ticketsList.filter((t) => {
      const matchStatus =
        ticketStatusFilter === "all" || t.status === ticketStatusFilter;
      const matchSearch =
        ticketSearch.trim() === "" ||
        t.title.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.technician.toLowerCase().includes(ticketSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [ticketsList, ticketStatusFilter, ticketSearch]);

  const openTicketsCount = ticketsList.filter((t) => t.status !== "مغلق").length;
  const closedTicketsCount = ticketsList.filter((t) => t.status === "مغلق").length;

  // 2. TASKS STATE
  const [tasksList, setTasksList] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`wazeer-branch-tasks-v3-${branch.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          /* ignore */
        }
      }
    }
    return defaultTasks;
  });

  const [taskFilter, setTaskFilter] = useState<"all" | "open" | "done" | "late">("all");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>("all");
  const [taskSearch, setTaskSearch] = useState<string>("");

  const saveTasks = (next: Task[]) => {
    setTasksList(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(`wazeer-branch-tasks-v3-${branch.id}`, JSON.stringify(next));
    }
  };

  const toggleTaskDone = (taskId: string) => {
    const next = tasksList.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
    saveTasks(next);
  };

  // Task Details Modal & Notes
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  const handleAddNote = () => {
    if (!selectedTask || !newNoteText.trim()) return;
    const authorName = user?.name || "إدارة النظام";
    const authorRole = "الإدارة المركزية";
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

    const newNote: TaskNote = {
      id: `note-${Date.now()}`,
      author: authorName,
      authorRole,
      time: timeStr,
      date: "اليوم",
      text: newNoteText.trim(),
    };

    const updatedTask: Task = {
      ...selectedTask,
      notes: [...(selectedTask.notes || []), newNote],
    };

    const nextTasks = tasksList.map((t) => (t.id === selectedTask.id ? updatedTask : t));
    saveTasks(nextTasks);
    setSelectedTask(updatedTask);
    setNewNoteText("");
  };

  const todayISO = new Date().toISOString().slice(0, 10);
  const isLateTask = (t: Task) => !t.done && t.dueISO < todayISO;

  const filteredTasks = useMemo(() => {
    return tasksList.filter((t) => {
      if (taskFilter === "open" && t.done) return false;
      if (taskFilter === "done" && !t.done) return false;
      if (taskFilter === "late" && !isLateTask(t)) return false;
      if (taskCategoryFilter !== "all" && t.category !== taskCategoryFilter) return false;
      if (
        taskSearch &&
        !t.title.toLowerCase().includes(taskSearch.toLowerCase()) &&
        !t.owner.toLowerCase().includes(taskSearch.toLowerCase()) &&
        !(t.ticketRef && t.ticketRef.toLowerCase().includes(taskSearch.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });
  }, [tasksList, taskFilter, taskCategoryFilter, taskSearch, todayISO]);

  const openTasksCount = tasksList.filter((t) => !t.done).length;
  const completedTasksCount = tasksList.filter((t) => t.done).length;

  // 3. STAFF STATE
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`wazeer-branch-staff-v4-${branch.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const defaultMap = new Map(defaultStaff.map((s) => [s.id, s]));
            const merged = parsed.map((item) => {
              const def = defaultMap.get(item.id);
              return def
                ? {
                    ...def,
                    ...item,
                    image: def.image || item.image,
                    employeeCode: def.employeeCode || item.employeeCode,
                  }
                : item;
            });
            for (const def of defaultStaff) {
              if (!merged.some((m) => m.id === def.id)) {
                merged.push(def);
              }
            }
            return merged;
          }
        } catch {
          /* ignore */
        }
      }
    }
    return defaultStaff;
  });

  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchCat = staffFilter === "all" || s.category === staffFilter;
      const matchSearch =
        staffSearch.trim() === "" ||
        s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.role.toLowerCase().includes(staffSearch.toLowerCase()) ||
        (s.employeeCode && s.employeeCode.toLowerCase().includes(staffSearch.toLowerCase())) ||
        s.phone.includes(staffSearch);
      return matchCat && matchSearch;
    });
  }, [staffList, staffFilter, staffSearch]);

  const onDutyStaffCount = staffList.filter((s) => s.status === "على رأس العمل").length;

  return (
    <AppShell title={`تفاصيل ${branch.name}`} role="admin">
      <div className="space-y-6">
        {/* Header Breadcrumb & Branch Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card via-card to-brand-ink/5 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Link
                  to="/branches"
                  className="flex items-center gap-1 transition-colors hover:text-brand-ink hover:underline"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  دليل الفروع
                </Link>
                <span>/</span>
                <span className="text-foreground">{branch.name}</span>
                <Badge variant="outline" className="border-brand-ink/30 bg-brand-ink/5 font-mono text-[11px] text-brand-ink">
                  {branch.id}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {branch.name}
                </h1>
                <Badge
                  className={cn(
                    "text-xs font-bold shadow-sm",
                    branch.status === "نشط" || !branch.status
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
                  )}
                  variant="outline"
                >
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {branch.status || "نشط ويعمل"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {branch.region || "القاهرة الكبرى"}
                </Badge>
              </div>

              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4 text-brand-ink" />
                  مدير الفرع: <strong className="text-foreground">{branch.manager}</strong>
                </span>
                <span className="flex items-center gap-1" dir="ltr">
                  <Phone className="h-3.5 w-3.5 text-brand-ink" />
                  {branch.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand-ink" />
                  {branch.address}
                </span>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" className="bg-brand-ink hover:bg-brand-ink/90 text-white shadow">
                <Link to="/tickets">
                  <Plus className="h-4 w-4 ml-1.5" />
                  إنشاء بلاغ للفرع
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/branch-tasks">
                  <CheckSquare className="h-4 w-4 ml-1.5" />
                  إدارة المهام
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/branch-staff">
                  <Users className="h-4 w-4 ml-1.5" />
                  طاقم العمل
                </Link>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
                activeTab === "overview"
                  ? "bg-brand-ink text-white shadow-sm"
                  : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Building2 className="h-4 w-4" />
              نظرة عامة
            </button>

            <button
              onClick={() => setActiveTab("tickets")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
                activeTab === "tickets"
                  ? "bg-brand-ink text-white shadow-sm"
                  : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Wrench className="h-4 w-4" />
              البلاغات المرتبطة
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-mono",
                  activeTab === "tickets"
                    ? "bg-white/20 text-white"
                    : "bg-brand-ink/10 text-brand-ink"
                )}
              >
                {ticketsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
                activeTab === "tasks"
                  ? "bg-brand-ink text-white shadow-sm"
                  : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <CheckSquare className="h-4 w-4" />
              المهام التشغيلية
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-mono",
                  activeTab === "tasks"
                    ? "bg-white/20 text-white"
                    : "bg-brand-ink/10 text-brand-ink"
                )}
              >
                {tasksList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("staff")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
                activeTab === "staff"
                  ? "bg-brand-ink text-white shadow-sm"
                  : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              طاقم عمل الفرع
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-mono",
                  activeTab === "staff"
                    ? "bg-white/20 text-white"
                    : "bg-brand-ink/10 text-brand-ink"
                )}
              >
                {staffList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("info")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
                activeTab === "info"
                  ? "bg-brand-ink text-white shadow-sm"
                  : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Phone className="h-4 w-4" />
              التواصل والموقع
            </button>
          </div>
        </div>

        {/* Global KPI Stats Strip */}
        <section className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">بلاغات مفتوحة</span>
              <Clock3 className="h-4 w-4 text-brand-red" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-red">{openTicketsCount}</span>
              <span className="text-xs text-muted-foreground">من أصل {ticketsList.length}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">مهام قيد الإنجاز</span>
              <CheckSquare className="h-4 w-4 text-brand-ink" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-ink">{openTasksCount}</span>
              <span className="text-xs text-muted-foreground">مهمة نشطة</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">طاقم العمل</span>
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{onDutyStaffCount}</span>
              <span className="text-xs text-emerald-600 font-bold">على رأس العمل</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">مستوى الرضا</span>
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{branch.satisfaction}</span>
              <span className="text-xs text-muted-foreground">من 5.0</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">الأجهزة المسجلة</span>
              <Building2 className="h-4 w-4 text-stone-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{branch.devicesCount || 24}</span>
              <span className="text-xs text-muted-foreground">كاميرات ونقاط بيع</span>
            </div>
          </div>
        </section>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Split Grid: Tickets & Tasks Summary */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Tickets Quick View */}
              <Panel
                title="أحدث بلاغات الفرع"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-brand-ink"
                    onClick={() => setActiveTab("tickets")}
                  >
                    عرض الكل ({ticketsList.length})
                    <ArrowRight className="h-3 w-3 mr-1" />
                  </Button>
                }
              >
                <div className="divide-y divide-border">
                  {ticketsList.length > 0 ? (
                    ticketsList.slice(0, 4).map((ticket) => (
                      <Link
                        key={ticket.id}
                        to="/tickets/$ticketId"
                        params={{ ticketId: ticket.id }}
                        className="group flex flex-col gap-2 p-4 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-ink">
                              {ticket.id}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] font-bold",
                                ticket.priority === "حرجة"
                                  ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40"
                                  : ticket.priority === "عالية"
                                  ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40"
                                  : "border-stone-300 text-muted-foreground"
                              )}
                            >
                              {ticket.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {ticket.category}
                            </span>
                          </div>
                          <p className="mt-1 truncate font-bold text-sm text-foreground group-hover:text-brand-ink transition-colors">
                            {ticket.title}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>الفني: {ticket.technician}</span>
                            <span>•</span>
                            <span>الموقع: {ticket.location || "الصالة الرئيسية"}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <Badge
                            className={cn(
                              "text-xs font-semibold",
                              ticket.status === "مغلق"
                                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                                : ticket.status === "حرج"
                                ? "bg-red-500/10 text-red-700 border-red-300"
                                : "bg-blue-500/10 text-blue-700 border-blue-300"
                            )}
                            variant="outline"
                          >
                            {ticket.status}
                          </Badge>
                          <span className="font-mono text-xs text-brand-red flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {ticket.sla}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      لا توجد بلاغات مسجلة لهذا الفرع حالياً.
                    </div>
                  )}
                </div>
              </Panel>

              {/* Tasks Quick View */}
              <Panel
                title="أحدث المهام التشغيلية"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-brand-ink"
                    onClick={() => setActiveTab("tasks")}
                  >
                    عرض الكل ({tasksList.length})
                    <ArrowRight className="h-3 w-3 mr-1" />
                  </Button>
                }
              >
                <div className="divide-y divide-border">
                  {tasksList.length > 0 ? (
                    tasksList.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "group flex items-start justify-between gap-3 p-4 transition-colors hover:bg-surface",
                          task.done && "bg-muted/20 opacity-75"
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Checkbox
                            checked={task.done}
                            onCheckedChange={() => toggleTaskDone(task.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] font-bold", taskCategoryStyles[task.category])}
                              >
                                {task.category}
                              </Badge>
                              {task.ticketRef && (
                                <Link
                                  to="/tickets/$ticketId"
                                  params={{ ticketId: task.ticketRef }}
                                  className="flex items-center gap-1 font-mono text-[10px] text-brand-ink hover:underline"
                                >
                                  {task.ticketRef}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="mt-1 text-right text-sm font-bold text-foreground hover:text-brand-ink transition-colors block text-left"
                            >
                              <span className={cn(task.done && "line-through text-muted-foreground")}>
                                {task.title}
                              </span>
                            </button>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              المسؤول: {task.owner} • الاستحقاق: {task.dueISO}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {task.notes && task.notes.length > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                              <MessageSquare className="h-3 w-3" />
                              {task.notes.length}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-brand-ink"
                            onClick={() => setSelectedTask(task)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      لا توجد مهام تشغيلية مسجلة حالياً.
                    </div>
                  )}
                </div>
              </Panel>
            </div>

            {/* Staff Highlight Row */}
            <Panel
              title="طاقم العمل المميز بالفرع"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-brand-ink"
                  onClick={() => setActiveTab("staff")}
                >
                  استعراض بطاقات الهوية ({staffList.length})
                  <ArrowRight className="h-3 w-3 mr-1" />
                </Button>
              }
            >
              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {staffList.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedStaffMember(member)}
                    className="cursor-pointer group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-brand-ink/40 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-inner">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-white bg-brand-ink">
                            {member.name.slice(0, 2)}
                          </div>
                        )}
                        <span
                          className={cn(
                            "absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-card",
                            member.status === "على رأس العمل"
                              ? "bg-emerald-500"
                              : member.status === "في استراحة"
                              ? "bg-amber-500"
                              : "bg-stone-400"
                          )}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            {member.employeeCode || "WZ-EMP"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {member.status}
                          </span>
                        </div>
                        <h4 className="truncate text-sm font-bold text-foreground group-hover:text-brand-ink">
                          {member.name}
                        </h4>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.role}
                        </p>
                        <p className="mt-1 text-[11px] text-stone-500" dir="ltr">
                          {member.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 2: TICKETS (البلاغات المرتبطة) */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في بلاغات الفرع (العنوان، الكود، الفني، الفئة)..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="pr-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={ticketStatusFilter}
                  onValueChange={(val) => setTicketStatusFilter(val)}
                >
                  <SelectTrigger className="w-[140px] text-xs">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                    <SelectItem value="مسندة">مسندة</SelectItem>
                    <SelectItem value="حرج">حرج</SelectItem>
                    <SelectItem value="بانتظار شراء">بانتظار شراء</SelectItem>
                    <SelectItem value="بانتظار قطعة">بانتظار قطعة</SelectItem>
                    <SelectItem value="مغلق">مغلق</SelectItem>
                  </SelectContent>
                </Select>

                <Button asChild size="sm" className="bg-brand-ink hover:bg-brand-ink/90 text-white">
                  <Link to="/tickets">
                    <Plus className="h-4 w-4 ml-1" />
                    بلاغ جديد
                  </Link>
                </Button>
              </div>
            </div>

            {/* Tickets Table / List */}
            <Panel title={`قائمة بلاغات الفرع (${filteredTickets.length})`}>
              <div className="divide-y divide-border">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="group flex flex-col gap-3 p-5 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-brand-ink">
                            {ticket.id}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-bold",
                              ticket.priority === "حرجة"
                                ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40"
                                : ticket.priority === "عالية"
                                ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40"
                                : "border-stone-300 text-muted-foreground"
                            )}
                          >
                            {ticket.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {ticket.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {ticket.createdISO || "2026-09-25"}
                          </span>
                        </div>

                        <Link
                          to="/tickets/$ticketId"
                          params={{ ticketId: ticket.id }}
                          className="block text-base font-bold text-foreground group-hover:text-brand-ink transition-colors"
                        >
                          {ticket.title}
                        </Link>

                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {ticket.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-brand-ink" />
                            الفني الميداني: <strong className="text-foreground">{ticket.technician}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-brand-ink" />
                            {ticket.location || "الصالة الرئيسية"}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-brand-red flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {ticket.sla}
                          </span>
                          <Badge
                            className={cn(
                              "text-xs font-semibold",
                              ticket.status === "مغلق"
                                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                                : ticket.status === "حرج"
                                ? "bg-red-500/10 text-red-700 border-red-300"
                                : "bg-blue-500/10 text-blue-700 border-blue-300"
                            )}
                            variant="outline"
                          >
                            {ticket.status}
                          </Badge>
                        </div>

                        <Button asChild size="sm" variant="outline" className="text-xs">
                          <Link to="/tickets/$ticketId" params={{ ticketId: ticket.id }}>
                            عرض التفاصيل
                            <ArrowRight className="h-3.5 w-3.5 mr-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Wrench className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      لا توجد بلاغات تطابق البحث
                    </p>
                    <p className="text-xs text-muted-foreground">
                      جرب تغيير خيارات التصفية أو إنشاء بلاغ صيانة جديد للفرع.
                    </p>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 3: TASKS (المهام التشغيلية والداخلية) */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في المهام (العنوان، المسؤول، البلاغ المرتبط)..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="pr-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-border p-1 bg-surface text-xs">
                  <button
                    onClick={() => setTaskFilter("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all",
                      taskFilter === "all" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                    )}
                  >
                    الكل ({tasksList.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter("open")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all",
                      taskFilter === "open" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                    )}
                  >
                    جارية ({openTasksCount})
                  </button>
                  <button
                    onClick={() => setTaskFilter("done")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold transition-all",
                      taskFilter === "done" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                    )}
                  >
                    مكتملة ({completedTasksCount})
                  </button>
                </div>

                <Select
                  value={taskCategoryFilter}
                  onValueChange={(val) => setTaskCategoryFilter(val)}
                >
                  <SelectTrigger className="w-[130px] text-xs">
                    <SelectValue placeholder="التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {taskCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button asChild size="sm" className="bg-brand-ink hover:bg-brand-ink/90 text-white">
                  <Link to="/branch-tasks">
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة مهمة
                  </Link>
                </Button>
              </div>
            </div>

            {/* Tasks Panel */}
            <Panel title={`مهام الفرع الداخلية والتشغيلية (${filteredTasks.length})`}>
              <div className="divide-y divide-border">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "group flex flex-col gap-3 p-4 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between",
                        task.done && "bg-muted/15"
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <Checkbox
                          checked={task.done}
                          onCheckedChange={() => toggleTaskDone(task.id)}
                          className="mt-1"
                        />

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn("text-[11px] font-bold", taskCategoryStyles[task.category])}
                            >
                              {task.category}
                            </Badge>

                            <Badge
                              variant="outline"
                              className={cn("text-[10px]", taskPriorityStyle[task.priority])}
                            >
                              أولوية {task.priority}
                            </Badge>

                            {task.ticketRef && (
                              <Link
                                to="/tickets/$ticketId"
                                params={{ ticketId: task.ticketRef }}
                                className="inline-flex items-center gap-1 rounded bg-brand-ink/5 px-2 py-0.5 font-mono text-xs font-bold text-brand-ink hover:underline"
                              >
                                بلاغ: {task.ticketRef}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            )}

                            {isLateTask(task) && (
                              <Badge className="bg-red-500/15 text-red-700 border-red-300 text-[10px]">
                                متأخرة
                              </Badge>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedTask(task)}
                            className="block text-right text-sm sm:text-base font-bold text-foreground group-hover:text-brand-ink transition-colors"
                          >
                            <span className={cn(task.done && "line-through text-muted-foreground")}>
                              {task.title}
                            </span>
                          </button>

                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                            <span>المسؤول: <strong className="text-foreground">{task.owner}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              الاستحقاق: {task.dueISO}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs flex items-center gap-1.5"
                          onClick={() => setSelectedTask(task)}
                        >
                          <MessageSquareText className="h-3.5 w-3.5 text-brand-ink" />
                          الملاحظات ({task.notes?.length || 0})
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <CheckSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      لا توجد مهام تطابق البحث
                    </p>
                    <p className="text-xs text-muted-foreground">
                      يمكنك جدولة مهمة جديدة للفرع أو تغيير عوامل التصفية.
                    </p>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 4: STAFF (طاقم عمل الفرع وبطاقات الهوية) */}
        {activeTab === "staff" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في طاقم العمل (الاسم، الوظيفة، كود الموظف، الهاتف)..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="pr-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={staffFilter} onValueChange={(val) => setStaffFilter(val)}>
                  <SelectTrigger className="w-[160px] text-xs">
                    <SelectValue placeholder="القسم / التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأقسام ({staffList.length})</SelectItem>
                    <SelectItem value="management">الإدارة والإشراف</SelectItem>
                    <SelectItem value="kitchen">المطبخ والحلواني</SelectItem>
                    <SelectItem value="cashier">كاشير ومبيعات</SelectItem>
                    <SelectItem value="tech">صيانة ودعم فني</SelectItem>
                    <SelectItem value="inventory">مخزون وتجهيز</SelectItem>
                  </SelectContent>
                </Select>

                <Button asChild size="sm" variant="outline">
                  <Link to="/branch-staff">
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    إدارة الطاقم بالكامل
                  </Link>
                </Button>
              </div>
            </div>

            {/* ID Card Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {filteredStaff.map((member) => {
                const cfg = staffCategoryConfig[member.category] || staffCategoryConfig.management;
                const IconComponent = cfg.icon;

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedStaffMember(member)}
                    className="cursor-pointer group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#caa469]/50 bg-gradient-to-b from-[#1b2234] via-[#141a29] to-[#0c101a] p-5 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#dfbe7f] hover:shadow-2xl"
                  >
                    {/* Golden luxury ambient highlight */}
                    <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#dfbe7f]/20 via-[#b38636]/10 to-transparent blur-2xl" />

                    {/* Lanyard Hole & Card Top Bar */}
                    <div>
                      <div className="flex items-center justify-between border-b border-[#caa469]/25 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#caa469] to-[#8d6221] shadow-sm">
                            <span className="font-serif font-black text-xs text-[#10141e]">و</span>
                          </div>
                          <div>
                            <span className="font-serif text-[11px] font-black tracking-wider text-[#dfbe7f]">
                              وزير الحلو WAZEER
                            </span>
                            <span className="block text-[8px] tracking-widest text-[#caa469]/80 uppercase">
                              EMPLOYEE ID BADGE
                            </span>
                          </div>
                        </div>

                        {/* Top Lanyard Clip slot */}
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-8 rounded-full border border-[#caa469]/40 bg-black/60 shadow-inner" />
                          <Wifi className="h-3.5 w-3.5 rotate-90 text-[#dfbe7f]/70" />
                        </div>
                      </div>

                      {/* Photo + Smart Chip + Info */}
                      <div className="mt-4 flex items-start gap-4">
                        {/* Photo Box with Gold Border */}
                        <div className="relative shrink-0">
                          <div className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-[#dfbe7f] bg-black/40 shadow-lg">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-white bg-brand-ink">
                                {member.name.slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <span
                            className={cn(
                              "absolute -bottom-1 -left-1 rounded-full px-2 py-0.5 text-[9px] font-bold shadow-md",
                              member.status === "على رأس العمل"
                                ? "bg-emerald-600 text-white"
                                : member.status === "في استراحة"
                                ? "bg-amber-600 text-white"
                                : "bg-stone-600 text-white"
                            )}
                          >
                            {member.status}
                          </span>
                        </div>

                        {/* Text Details & Chip */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-extrabold text-[#dfbe7f]">
                              {member.employeeCode || "WZ-EMP-00"}
                            </span>

                            {/* Simulated EMV Smart Chip */}
                            <div className="h-5 w-7 rounded-sm border border-[#caa469] bg-gradient-to-br from-[#dfbe7f] via-[#caa469] to-[#996f26] shadow-sm relative overflow-hidden">
                              <div className="absolute inset-x-1 top-1/2 h-[1px] bg-black/30" />
                              <div className="absolute inset-y-0.5 left-1/3 w-[1px] bg-black/30" />
                            </div>
                          </div>

                          <h3 className="mt-1 text-base font-black text-white group-hover:text-[#dfbe7f] transition-colors">
                            {member.name}
                          </h3>

                          <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#caa469]">
                            <IconComponent className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{member.role}</span>
                          </div>

                          <Badge
                            className={cn(
                              "mt-2 text-[10px] font-semibold border",
                              cfg.badgeBg,
                              cfg.badgeBorder
                            )}
                          >
                            {cfg.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Responsibilities & Shift */}
                      <p className="mt-3 text-xs leading-relaxed text-slate-300 line-clamp-2">
                        {member.responsibilities}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3 text-[#dfbe7f]" />
                        <span>{member.shift}</span>
                      </div>
                    </div>

                    {/* Bottom Card Footer: Barcode & Actions */}
                    <div className="mt-4 border-t border-[#caa469]/25 pt-3">
                      <div className="flex items-center justify-between">
                        {/* Decorative Barcode */}
                        <div className="flex items-center gap-[2px]">
                          <div className="h-5 w-[2px] bg-white/70" />
                          <div className="h-5 w-[1px] bg-white/70" />
                          <div className="h-5 w-[3px] bg-white/70" />
                          <div className="h-5 w-[1px] bg-white/40" />
                          <div className="h-5 w-[2px] bg-white/70" />
                          <div className="h-5 w-[4px] bg-white/70" />
                          <div className="h-5 w-[1px] bg-white/50" />
                          <div className="h-5 w-[2px] bg-white/70" />
                          <div className="h-5 w-[1px] bg-white/40" />
                          <div className="h-5 w-[3px] bg-white/70" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px] text-[#dfbe7f] hover:bg-white/10 hover:text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={`tel:${member.phone.replace(/\s+/g, "")}`}>
                              <Phone className="h-3 w-3 ml-1" />
                              اتصال
                            </a>
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2.5 text-[11px] font-bold bg-[#caa469] text-black hover:bg-[#dfbe7f]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStaffMember(member);
                            }}
                          >
                            عرض البطاقة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: BRANCH INFO & CONTACT */}
        {activeTab === "info" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="بيانات التواصل والمقر">
              <div className="space-y-4 p-5">
                <div className="flex gap-3 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-ink/10 text-brand-ink">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">رقم الهاتف المباشر</p>
                    <p className="mt-0.5 text-base font-bold text-foreground" dir="ltr">
                      {branch.phone}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      متاح على مدار ساعات عمل الفرع (08:00 ص - 12:00 ص)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-ink/10 text-brand-ink">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">العنوان الجغرافي</p>
                    <p className="mt-0.5 text-base font-bold text-foreground">
                      {branch.address}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      المنطقة: {branch.region || "القاهرة الجديدة"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-ink/10 text-brand-ink">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">الإدارة المسؤولة</p>
                    <p className="mt-0.5 text-base font-bold text-foreground">
                      {branch.manager}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      مدير الفرع المعتمد بالهيكل الإداري
                    </p>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="البنية التقنية والتجهيزات">
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-brand-ink" />
                    <span className="text-sm font-semibold">أجهزة المراقبة ونقاط البيع</span>
                  </div>
                  <span className="font-mono text-sm font-black text-foreground">
                    {branch.devicesCount || 24} جهاز
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2.5">
                    <Wrench className="h-4 w-4 text-brand-ink" />
                    <span className="text-sm font-semibold">الفني الميداني المعتمد</span>
                  </div>
                  <span className="text-sm font-bold text-brand-ink">أحمد سامي</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold">معدل رضا العملاء</span>
                  </div>
                  <span className="font-mono text-sm font-black text-amber-700 dark:text-amber-400">
                    {branch.satisfaction} / 5.0
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold">إجمالي البلاغات المحلولة</span>
                  </div>
                  <span className="font-mono text-sm font-black text-emerald-600">
                    {branch.closed} بلاغ منجز
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* MODAL: TASK DETAILS & TIMELINE NOTES */}
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent className="max-w-xl text-right" dir="rtl">
            {selectedTask && (
              <>
                <DialogHeader className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(taskCategoryStyles[selectedTask.category])}>
                      {selectedTask.category}
                    </Badge>
                    <Badge variant="outline" className={cn(taskPriorityStyle[selectedTask.priority])}>
                      أولوية {selectedTask.priority}
                    </Badge>
                    {selectedTask.ticketRef && (
                      <Link
                        to="/tickets/$ticketId"
                        params={{ ticketId: selectedTask.ticketRef }}
                        className="font-mono text-xs font-bold text-brand-ink hover:underline flex items-center gap-1"
                      >
                        بلاغ #{selectedTask.ticketRef}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  <DialogTitle className="mt-2 text-lg font-bold">
                    {selectedTask.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    المسؤول: {selectedTask.owner} • تاريخ الاستحقاق: {selectedTask.dueISO}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {selectedTask.description && (
                    <div className="rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-foreground">
                      <p className="font-bold text-muted-foreground mb-1">تفاصيل المهمة:</p>
                      {selectedTask.description}
                    </div>
                  )}

                  {/* Notes Timeline */}
                  <div>
                    <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-brand-ink" />
                      سجل الملاحظات والمتابعة ({selectedTask.notes?.length || 0})
                    </h4>

                    <div className="max-h-52 overflow-y-auto space-y-2 rounded-lg border border-border p-3 bg-card">
                      {selectedTask.notes && selectedTask.notes.length > 0 ? (
                        selectedTask.notes.map((note) => (
                          <div key={note.id} className="rounded-md border border-border/60 bg-surface/50 p-2.5 text-xs">
                            <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-1">
                              <span className="font-bold text-foreground">{note.author} ({note.authorRole || "عضو فريق"})</span>
                              <span className="font-mono">{note.date} - {note.time}</span>
                            </div>
                            <p className="text-foreground leading-relaxed">{note.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-xs text-muted-foreground">
                          لا توجد ملاحظات مدونة بعد. أضف أول ملاحظة بالأسفل.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Add Note Input */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="أضف ملاحظة أو متابعة لهذه المهمة..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="bg-brand-ink text-white text-xs"
                      >
                        <Send className="h-3 w-3 ml-1" />
                        حفظ الملاحظة
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-row justify-between gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toggleTaskDone(selectedTask.id);
                      setSelectedTask({ ...selectedTask, done: !selectedTask.done });
                    }}
                  >
                    {selectedTask.done ? "إعادة المهمة كـ جارية" : "تأكيد إنجاز المهمة"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
                    إغلاق
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL: STAFF ID CARD ENLARGED */}
        <Dialog open={!!selectedStaffMember} onOpenChange={(open) => !open && setSelectedStaffMember(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden border-2 border-[#caa469] bg-gradient-to-b from-[#1b2234] via-[#141a29] to-[#0c101a] text-white" dir="rtl">
            {selectedStaffMember && (
              <div className="p-6 relative">
                {/* Gold ambient */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#dfbe7f]/20 blur-3xl" />

                {/* Top Bar */}
                <div className="flex items-center justify-between border-b border-[#caa469]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#caa469] to-[#8d6221] text-[#10141e] font-serif font-black">
                      و
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-black text-[#dfbe7f]">وزير الحلو WAZEER</h4>
                      <p className="text-[9px] text-[#caa469]/80 uppercase">Official Employee Identification Card</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-[#dfbe7f]">
                    {selectedStaffMember.employeeCode || "WZ-EMP-00"}
                  </span>
                </div>

                {/* Portrait & Core Details */}
                <div className="mt-5 flex flex-col items-center text-center">
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-[#dfbe7f] shadow-2xl bg-black">
                    {selectedStaffMember.image ? (
                      <img
                        src={selectedStaffMember.image}
                        alt={selectedStaffMember.name}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-2xl text-white bg-brand-ink">
                        {selectedStaffMember.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-black text-white">
                    {selectedStaffMember.name}
                  </h3>
                  <p className="text-xs font-bold text-[#caa469]">
                    {selectedStaffMember.role}
                  </p>

                  <Badge className="mt-2 bg-[#caa469]/20 text-[#dfbe7f] border-[#caa469]/40 text-xs">
                    {branch.name} • {selectedStaffMember.shift}
                  </Badge>
                </div>

                {/* Responsibilities */}
                <div className="mt-4 rounded-xl border border-[#caa469]/25 bg-black/30 p-3.5 text-xs text-slate-200">
                  <p className="font-bold text-[#caa469] mb-1">المهام والمسؤوليات:</p>
                  <p className="leading-relaxed">{selectedStaffMember.responsibilities}</p>
                </div>

                {/* Contact Strip */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-[#caa469]/20 bg-black/20 p-2 text-center">
                    <p className="text-[10px] text-slate-400">الهاتف</p>
                    <p className="font-mono font-bold text-white mt-0.5" dir="ltr">{selectedStaffMember.phone}</p>
                  </div>
                  <div className="rounded-lg border border-[#caa469]/20 bg-black/20 p-2 text-center">
                    <p className="text-[10px] text-slate-400">الحالة</p>
                    <p className="font-bold text-emerald-400 mt-0.5">{selectedStaffMember.status}</p>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-5 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#caa469]/40 text-[#dfbe7f] hover:bg-[#caa469]/10"
                    onClick={() => setSelectedStaffMember(null)}
                  >
                    إغلاق البطاقة
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}