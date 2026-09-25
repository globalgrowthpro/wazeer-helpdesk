import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Info,
  LayoutGrid,
  ListChecks,
  MessageSquareText,
  Pencil,
  Plus,
  Send,
  Table2,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import { branches } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/branch-tasks")({
  head: () => ({
    meta: [
      { title: "مهام الفرع | وزير الحلو" },
      { name: "description", content: "إدارة مهام الفرع الداخلية ومتابعتها: تصنيف، أولويات، مواعيد، وتدوين الملاحظات." },
      { property: "og:title", content: "مهام الفرع | وزير الحلو" },
      { property: "og:description", content: "إدارة مهام الفرع الداخلية ومتابعتها: تصنيف، أولويات، مواعيد، وتدوين الملاحظات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell title="مهام الفرع" role="branch">
      <BranchTasks />
    </AppShell>
  ),
});

type Priority = "عالية" | "متوسطة" | "عادية";
type Category = "صيانة" | "سلامة" | "مخزون" | "إداري" | "خدمة عملاء";

export type TaskNote = {
  id: string;
  author: string;
  authorRole?: string;
  time: string;
  date: string;
  text: string;
};

export type Task = {
  id: string;
  title: string;
  owner: string;
  category: Category;
  priority: Priority;
  dueISO: string;
  done: boolean;
  ticketRef?: string | undefined;
  description?: string | undefined;
  notes?: TaskNote[] | undefined;
};

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const dayLabel = (dueISO: string) => {
  const today = iso(0);
  if (dueISO === today) return "اليوم";
  if (dueISO === iso(1)) return "غداً";
  if (dueISO === iso(-1)) return "أمس";
  return new Date(dueISO).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" });
};

export const priorityStyle: Record<Priority, string> = {
  "عالية": "border-transparent bg-[var(--kpi-crimson)]/10 text-[var(--kpi-crimson)] font-bold",
  "متوسطة": "border-transparent bg-[var(--kpi-amber)]/15 text-[#8a5c00] font-semibold",
  "عادية": "border-border text-muted-foreground",
};

export const categoryBadgeStyles: Record<Category, string> = {
  "صيانة": "bg-[var(--kpi-navy)]/10 text-[var(--kpi-navy)] border-[var(--kpi-navy)]/30",
  "سلامة": "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50",
  "مخزون": "bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700",
  "إداري": "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/50",
  "خدمة عملاء": "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50",
};

export const categories: Category[] = ["صيانة", "سلامة", "مخزون", "إداري", "خدمة عملاء"];

export const defaultTasks: Task[] = [
  {
    id: "t1",
    title: "تجهيز منطقة الكاشير لزيارة الفني",
    owner: "مدير الفرع",
    category: "صيانة",
    priority: "عالية",
    dueISO: iso(0),
    done: false,
    ticketRef: "HD-2026-000452",
    description: "تفريغ وتجهيز كاونتر الكاشير رقم 2 وتأمين كابلات الشبكة وفصل التيار المؤقت قبل وصول فني الصيانة الساعة 11:00 صباحاً.",
    notes: [
      {
        id: "n1",
        author: "كريم محمود",
        authorRole: "مدير الفرع",
        time: "09:15",
        date: "اليوم",
        text: "تم إخطار الكاشير الصباحي بنقل العمل مؤقتاً لنقطة البيع الاحتياطية وتجهيز أدوات السلامة.",
      },
    ],
  },
  {
    id: "t2",
    title: "تصوير عطل الكاميرا وإرفاقه بالبلاغ",
    owner: "مشرف الوردية",
    category: "صيانة",
    priority: "متوسطة",
    dueISO: iso(0),
    done: true,
    ticketRef: "HD-2026-000452",
    description: "التقاط صور واضحة للشاشة التي يظهر بها تشويش الكاميرا رقم 08 وبوابة الاستلام وإرسالها للدعم.",
    notes: [
      {
        id: "n2",
        author: "طارق سليم",
        authorRole: "مشرف الوردية",
        time: "10:30",
        date: "اليوم",
        text: "تم التقاط 3 صور واضحة للشاشة التالفة وإرسالها للفني الميداني أحمد سامي.",
      },
    ],
  },
  {
    id: "t3",
    title: "جرد طفايات الحريق الشهري",
    owner: "مسؤول السلامة",
    category: "سلامة",
    priority: "متوسطة",
    dueISO: iso(1),
    done: false,
    description: "مراجعة مؤشرات ضغط جميع طفايات البودرة ورغوة CO2 بالصالة والمطبخ ومستودع التجهيز، والتأكد من سريان الصلاحية وسلامة الخراطيم والأقفال.",
    notes: [
      {
        id: "n3",
        author: "علي جابر",
        authorRole: "مساعد تجهيز وسلامة",
        time: "11:00",
        date: "أمس",
        text: "تم فحص طفايات قسم المطبخ والحلواني ومؤشر الضغط في النطاق الأخضر السليم.",
      },
    ],
  },
  {
    id: "t4",
    title: "تأكيد استلام قطعة الغيار",
    owner: "مدير الفرع",
    category: "مخزون",
    priority: "عالية",
    dueISO: iso(-2),
    done: false,
    ticketRef: "HD-2026-000449",
    description: "استلام بطاقة البصمة البديل من مندوب شركة التوريدات ومطابقة أرقام الإرسالية وحفظها في غرفة قطع الغيار.",
    notes: [
      {
        id: "n4",
        author: "حسام حسن",
        authorRole: "مسؤول المخزون",
        time: "14:20",
        date: "قبل يومين",
        text: "تم التواصل مع المندوب وفي انتظار وصول الشحنة وتوقيع إشعار الاستلام.",
      },
    ],
  },
  {
    id: "t5",
    title: "تحديث سجل أصول الفروع الشهري",
    owner: "مسؤول الأصول",
    category: "إداري",
    priority: "عادية",
    dueISO: iso(3),
    done: false,
    description: "حصر أجهزة ومعدات الفرع (شاشات عرض الأسعار، ثلاجات العرض، أفران الحلويات، أجهزة التكييف) ومطابقة الأرقام التسلسلية بالسيريال نمبر في النظام المركزي.",
    notes: [],
  },
  {
    id: "t6",
    title: "متابعة شكوى عميل بشأن نقطة الشبكة",
    owner: "خدمة العملاء",
    category: "خدمة عملاء",
    priority: "عالية",
    dueISO: iso(0),
    done: false,
    description: "التواصل هاتفياً مع العميل الذي تأخرت معاملته عند كاشير الحلويات الشرقية بسبب بطء نقطة البيع وتقديم اعتذار وقسيمة خصم ترحيبية.",
    notes: [
      {
        id: "n5",
        author: "مروة عادل",
        authorRole: "مسؤولة الكاشير",
        time: "12:45",
        date: "اليوم",
        text: "تم الاتصال بالعميل وشكره على سعة صدره وتقديم كود خصم، وأبدى رضاه الكامل عن الخدمة.",
      },
    ],
  },
];

function BranchTasks() {
  const { user } = useSession();
  const branch = branches.find((b) => b.id === user?.branchId) ?? branches[0]!;
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`wazeer-branch-tasks-v3-${branch.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        /* ignore */
      }
    }
    return defaultTasks;
  });

  const [view, setView] = useState<"table" | "cards">("table");
  const [filter, setFilter] = useState<"all" | "open" | "done" | "late">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // New task form state
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("مدير الفرع");
  const [category, setCategory] = useState<Category>("إداري");
  const [priority, setPriority] = useState<Priority>("عادية");
  const [dueISO, setDueISO] = useState(iso(0));
  const [ticketRefInput, setTicketRefInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  // Details Modal & Notes State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  const today = iso(0);
  const isLate = (t: Task) => !t.done && t.dueISO < today;

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "open" && t.done) return false;
      if (filter === "done" && !t.done) return false;
      if (filter === "late" && !isLate(t)) return false;
      if (
        search &&
        !`${t.title} ${t.owner} ${t.category} ${t.ticketRef || ""}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [tasks, filter, search]);

  const doneCount = tasks.filter((t) => t.done).length;
  const lateCount = tasks.filter(isLate).length;
  const todayCount = tasks.filter((t) => !t.done && t.dueISO === today).length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const persistTasks = (next: Task[]) => {
    setTasks(next);
    localStorage.setItem(`wazeer-branch-tasks-v3-${branch.id}`, JSON.stringify(next));
  };

  const toggle = (id: string) => {
    const next = tasks.map((y) => (y.id === id ? { ...y, done: !y.done } : y));
    persistTasks(next);
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask({ ...selectedTask, done: !selectedTask.done });
    }
  };

  const remove = (id: string) => {
    persistTasks(tasks.filter((y) => y.id !== id));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(null);
    }
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      owner: owner.trim() || "مدير الفرع",
      category,
      priority,
      dueISO,
      done: false,
      ticketRef: ticketRefInput.trim() ? ticketRefInput.trim() : undefined,
      description: descriptionInput.trim() || undefined,
      notes: [],
    };

    persistTasks([newTask, ...tasks]);
    setTitle("");
    setTicketRefInput("");
    setDescriptionInput("");
    setShowForm(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newNoteText.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newNote: TaskNote = {
      id: `note-${Date.now()}`,
      author: user?.name || "مدير الفرع",
      authorRole: user?.role === "branch" ? "إدارة الفرع" : "فريق العمل",
      time: timeStr,
      date: "اليوم",
      text: newNoteText.trim(),
    };

    const updatedTask: Task = {
      ...selectedTask,
      notes: [newNote, ...(selectedTask.notes || [])],
    };

    const nextTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    persistTasks(nextTasks);
    setSelectedTask(updatedTask);
    setNewNoteText("");
  };

  const filterTabs = [
    { key: "all" as const, label: `الكل (${tasks.length})` },
    { key: "open" as const, label: `المفتوحة (${tasks.length - doneCount})` },
    { key: "late" as const, label: `متأخرة (${lateCount})` },
    { key: "done" as const, label: `المنجزة (${doneCount})` },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="إجمالي المهام"
          value={String(tasks.length)}
          note={`${doneCount} منجزة · ${percent}%`}
          icon={ClipboardList}
          tone="navy"
        />
        <Stat
          label="مهام اليوم"
          value={String(todayCount)}
          note="مستحقة قبل نهاية اليوم"
          icon={CalendarClock}
          tone="amber"
        />
        <Stat
          label="مهام متأخرة"
          value={String(lateCount)}
          note="تجاوزت موعد الاستحقاق"
          icon={AlertTriangle}
          tone={lateCount ? "crimson" : "forest"}
        />
        <Stat
          label="منجزة"
          value={String(doneCount)}
          note="أُغلقت خلال الشهر"
          icon={CheckCircle2}
          tone="forest"
        />
      </div>

      <Panel
        title={`مهام الفرع (${doneCount}/${tasks.length})`}
        icon={ListChecks}
        action={
          <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
            >
              <Table2 className="h-4 w-4" />
              جدول
            </Button>
            <Button
              variant={view === "cards" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              بطاقات
            </Button>
          </div>
        }
      >
        <div className="space-y-3 border-b border-border p-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--kpi-forest)] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {filterTabs.map((f) => (
                <Button
                  key={f.key}
                  size="sm"
                  variant={filter === f.key ? "default" : "outline"}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث في المهام..."
                className="h-9 w-44 text-xs"
              />
              <Button size="sm" onClick={() => setShowForm((s) => !s)}>
                <Plus className="h-4 w-4" />
                مهمة جديدة
              </Button>
            </div>
          </div>

          {/* New Task Form */}
          {showForm && (
            <form onSubmit={add} className="grid gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-5 text-xs">
              <div className="space-y-1 lg:col-span-2">
                <span className="font-bold">عنوان المهمة</span>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مراجعة مخزون علب التعبئة الفاخرة..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="font-bold">المسؤول عن التنفيذ</span>
                <Input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="مدير الفرع / الشيف / الكاشير"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="font-bold">التصنيف</span>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <span className="font-bold">الأولوية</span>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="عالية">عالية</SelectItem>
                    <SelectItem value="متوسطة">متوسطة</SelectItem>
                    <SelectItem value="عادية">عادية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <span className="font-bold">موعد الاستحقاق</span>
                <Input
                  type="date"
                  value={dueISO}
                  onChange={(e) => setDueISO(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">البلاغ المرتبط (اختياري)</span>
                  <span className="text-[10px] text-muted-foreground">اتركه فارغاً للمهام الداخلية</span>
                </div>
                <Input
                  value={ticketRefInput}
                  onChange={(e) => setTicketRefInput(e.target.value)}
                  placeholder="مثال: HD-2026-000452 (اختياري)"
                  className="h-9 text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1 lg:col-span-2">
                <span className="font-bold">تفاصيل ووصف المهمة (اختياري)</span>
                <Input
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="توجيهات أو خطوات العمل..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-end gap-2 lg:col-span-5 pt-2 border-t border-border/60">
                <Button type="submit" size="sm" className="gap-1 px-4">
                  <Plus className="h-4 w-4" />
                  حفظ المهمة
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">لا توجد مهام مطابقة.</p>
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>المهمة</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>المسؤول</TableHead>
                  <TableHead>الاستحقاق</TableHead>
                  <TableHead>البلاغ / النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-10 text-center" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("button") || target.closest("input") || target.closest("[data-slot='checkbox']")) return;
                      setSelectedTask(t);
                    }}
                    title="انقر لعرض تفاصيل المهمة وتدوين الملاحظات"
                    className={cn(
                      "cursor-pointer hover:bg-surface/70 transition-colors group",
                      isLate(t) && "bg-[var(--kpi-crimson)]/5"
                    )}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <p
                          className={cn(
                            "font-bold text-foreground group-hover:text-brand-ink group-hover:underline transition-colors",
                            t.done && "text-muted-foreground line-through"
                          )}
                        >
                          {t.title}
                        </p>
                        {t.notes && t.notes.length > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded-full bg-brand-ink/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-ink shrink-0"
                            title={`${t.notes.length} ملاحظات مسجلة`}
                          >
                            <MessageSquareText className="h-3 w-3" />
                            <span>{t.notes.length}</span>
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5", categoryBadgeStyles[t.category])}>
                        {t.category}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={priorityStyle[t.priority]}>
                        {t.priority}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-foreground/80 font-medium">{t.owner}</span>
                    </TableCell>

                    <TableCell>
                      <span className={cn("text-sm", isLate(t) && "font-bold text-[var(--kpi-crimson)]")}>
                        {dayLabel(t.dueISO)}
                      </span>
                    </TableCell>

                    <TableCell>
                      {t.ticketRef ? (
                        <Link
                          to="/tickets/$ticketId"
                          params={{ ticketId: t.ticketRef }}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-ink hover:underline font-mono"
                          title="فتح صفحة البلاغ المرتبط"
                        >
                          <span>{t.ticketRef}</span>
                          <ExternalLink className="h-3 w-3 text-brand-copper" />
                        </Link>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed bg-muted/30">
                          مهمة داخلية
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={t.done ? "secondary" : "outline"}>
                        {t.done ? "منجزة" : isLate(t) ? "متأخرة" : "مفتوحة"}
                      </Badge>
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-[var(--kpi-crimson)]"
                        onClick={() => remove(t.id)}
                        title="حذف المهمة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((t) => (
              <div
                key={t.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest("input") || target.closest("[data-slot='checkbox']")) return;
                  setSelectedTask(t);
                }}
                title="انقر لعرض تفاصيل المهمة وتدوين الملاحظات"
                className="cursor-pointer flex items-center gap-3 p-4 hover:bg-surface/70 transition-colors group"
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-bold text-foreground group-hover:text-brand-ink group-hover:underline transition-colors truncate",
                        t.done && "text-muted-foreground line-through"
                      )}
                    >
                      {t.title}
                    </p>
                    {t.notes && t.notes.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-ink/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-ink shrink-0">
                        <MessageSquareText className="h-3 w-3" />
                        <span>{t.notes.length}</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{t.owner}</span>
                    <span>·</span>
                    <span>{t.category}</span>
                    <span>·</span>
                    <span className={cn(isLate(t) && "font-bold text-[var(--kpi-crimson)]")}>{dayLabel(t.dueISO)}</span>
                    <span>·</span>
                    {t.ticketRef ? (
                      <span className="font-mono text-brand-ink font-bold">{t.ticketRef}</span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">مهمة داخلية</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={priorityStyle[t.priority]}>
                    {t.priority}
                  </Badge>
                  <Badge variant={t.done ? "secondary" : "outline"}>
                    {t.done ? "منجزة" : isLate(t) ? "متأخرة" : "مفتوحة"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-[var(--kpi-crimson)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(t.id);
                    }}
                    title="حذف المهمة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ========================================================= */}
      {/* TASK DETAILS & NOTES MODAL (نافذة تفاصيل المهمة وتدوين الملاحظات) */}
      {/* ========================================================= */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6" dir="rtl">
            <DialogHeader className="space-y-3 pb-3 border-b border-border">
              {/* Badges & Meta strip */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={selectedTask.done ? "secondary" : "outline"}>
                    {selectedTask.done ? "منجزة" : isLate(selectedTask) ? "متأخرة" : "مفتوحة"}
                  </Badge>
                  <Badge variant="outline" className={categoryBadgeStyles[selectedTask.category]}>
                    {selectedTask.category}
                  </Badge>
                  <Badge variant="outline" className={priorityStyle[selectedTask.priority]}>
                    أولوية {selectedTask.priority}
                  </Badge>
                </div>

                {/* Ticket reference vs Internal Task indicator */}
                {selectedTask.ticketRef ? (
                  <Link
                    to="/tickets/$ticketId"
                    params={{ ticketId: selectedTask.ticketRef }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-ink bg-brand-ink/5 border border-brand-ink/20 px-2.5 py-1 rounded-lg hover:bg-brand-ink/10 transition-colors font-mono"
                    title="الانتقال إلى صفحة تفاصيل البلاغ"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-brand-copper" />
                    <span>بلاغ مرتبط: {selectedTask.ticketRef}</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    مهمة تشغيلية داخلية للفرع
                  </span>
                )}
              </div>

              {/* Title */}
              <DialogTitle className="font-display text-lg sm:text-xl font-black text-foreground leading-snug">
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                تفاصيل المهمة، المسؤول عن المتابعة، والتوثيق والملاحظات المسجلة.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4 text-xs">
              {/* Info Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-surface/50 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <User className="h-3.5 w-3.5 text-brand-ink" />
                    <span>المسؤول عن التنفيذ</span>
                  </div>
                  <p className="font-bold text-sm text-foreground">{selectedTask.owner}</p>
                </div>

                <div className="rounded-xl border border-border bg-surface/50 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-brand-copper" />
                    <span>موعد الاستحقاق</span>
                  </div>
                  <p className={cn("font-bold text-sm text-foreground", isLate(selectedTask) && "text-[var(--kpi-crimson)]")}>
                    {dayLabel(selectedTask.dueISO)}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface/50 p-3 space-y-1 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Tag className="h-3.5 w-3.5 text-brand-ink" />
                    <span>الفرع والقسم</span>
                  </div>
                  <p className="font-bold text-sm text-foreground truncate">
                    {branch.name} · {selectedTask.category}
                  </p>
                </div>
              </div>

              {/* Task Description / Scope */}
              {selectedTask.description && (
                <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-brand-ink" />
                    تفاصيل ومحددات العمل:
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              {/* =================================================== */}
              {/* NOTES & COMMENTS SECTION (قسم الملاحظات والمتابعة) */}
              {/* =================================================== */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4 text-brand-ink" />
                    <span className="font-bold text-sm text-foreground">
                      سجل الملاحظات والمتابعة ({(selectedTask.notes || []).length})
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    سجل توثيق تقدم العمل والملاحظات الداخلية
                  </span>
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <Textarea
                    required
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="اكتب ملاحظة جديدة، تحديثات الإنجاز، أو توجيهات خاصة بهذه المهمة..."
                    className="min-h-[75px] text-xs resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newNoteText.trim()}
                      className="gap-1.5 bg-brand-ink text-primary-foreground font-bold text-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      إضافة الملاحظة
                    </Button>
                  </div>
                </form>

                {/* Notes Feed */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {(!selectedTask.notes || selectedTask.notes.length === 0) ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-xs">
                      لا توجد ملاحظات مدونة لهذه المهمة بعد. أضف أول ملاحظة أعلاه.
                    </div>
                  ) : (
                    selectedTask.notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-border/80 bg-surface/40 p-3 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{note.author}</span>
                            {note.authorRole && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {note.authorRole}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {note.date} · {note.time}
                          </span>
                        </div>
                        <p className="text-foreground/90 leading-relaxed text-xs">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-3 border-t border-border">
              <Button
                type="button"
                variant={selectedTask.done ? "outline" : "default"}
                onClick={() => toggle(selectedTask.id)}
                className="gap-1.5 text-xs font-bold"
              >
                <CheckCircle2 className="h-4 w-4" />
                {selectedTask.done ? "إعادة فتح المهمة" : "تحديد كمكتملة"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTask(null)}
                className="text-xs"
              >
                إغلاق
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => remove(selectedTask.id)}
                className="text-xs text-[var(--kpi-crimson)] hover:bg-[var(--kpi-crimson)]/10 mr-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف المهمة
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
