import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock3, FileText, LayoutGrid, Plus, RotateCcw, Table2, Timer, TicketCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import { branches, tickets } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/branch-tickets")({
  head: () => ({ meta: [{ title: "بلاغات الفرع | وزير الحلو" }, { name: "description", content: "إنشاء البلاغات ومتابعتها وتأكيد الحل مع تتبع مستوى الخدمة والفنيين." }, { property: "og:title", content: "بلاغات الفرع | وزير الحلو" }, { property: "og:description", content: "إنشاء البلاغات ومتابعتها وتأكيد الحل مع تتبع مستوى الخدمة والفنيين." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AppShell title="بلاغات الفرع" role="branch"><BranchTickets /></AppShell>,
});

type TicketRow = {
  id: string;
  title: string;
  category: string;
  priority: "منخفضة" | "متوسطة" | "عالية" | "حرجة";
  status: "جديد" | "قيد التنفيذ" | "بانتظار شراء" | "بانتظار تأكيد الفرع" | "مغلق" | "أعيد فتحه";
  sla: string;
  technician: string;
  createdISO: string;
  description?: string;
};

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const dateLabel = (createdISO: string) => {
  const today = iso(0);
  if (createdISO === today) return "اليوم";
  if (createdISO === iso(-1)) return "أمس";
  if (createdISO === iso(-2)) return "قبل يومين";
  return new Date(createdISO).toLocaleDateString("ar-EG", { day: "numeric", month: "long" });
};

const priorityStyle: Record<TicketRow["priority"], string> = {
  "حرجة": "border-transparent bg-[var(--kpi-crimson)]/10 text-[var(--kpi-crimson)] font-bold",
  "عالية": "border-transparent bg-[var(--kpi-flame)]/10 text-[var(--kpi-flame)]",
  "متوسطة": "border-transparent bg-[var(--kpi-amber)]/15 text-[#8a5c00]",
  "منخفضة": "border-border text-muted-foreground",
};

const statusStyle: Record<TicketRow["status"], string> = {
  "جديد": "border-transparent bg-[var(--kpi-navy)]/10 text-[var(--kpi-navy)]",
  "قيد التنفيذ": "border-transparent bg-[var(--kpi-amber)]/15 text-[#8a5c00]",
  "بانتظار شراء": "border-transparent bg-[var(--kpi-apricot)]/15 text-[#8a5c00]",
  "بانتظار تأكيد الفرع": "border-transparent bg-[var(--kpi-forest)]/10 text-[var(--kpi-forest)] font-bold",
  "مغلق": "border-border text-muted-foreground",
  "أعيد فتحه": "border-transparent bg-[var(--kpi-crimson)]/10 text-[var(--kpi-crimson)]",
};

const slaMinutes = (sla: string) => {
  const [h, m] = sla.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const categories = ["كاميرات مراقبة", "شبكات", "نقاط بيع", "كهرباء", "تكييف", "تحكم دخول"] as const;
const priorities: TicketRow["priority"][] = ["منخفضة", "متوسطة", "عالية", "حرجة"];

function BranchTickets() {
  const navigate = useNavigate();
  const { user } = useSession();
  const branch = branches.find((b) => b.id === user?.branchId) ?? branches[0]!;

  const [rows, setRows] = useState<TicketRow[]>(() => {
    const mine = tickets.filter((t) => t.branchId === branch.id);
    const mapped: TicketRow[] = mine.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      priority: t.priority as TicketRow["priority"],
      status: t.status === "بانتظار شراء" ? "بانتظار شراء" : t.status === "حرج" ? "قيد التنفيذ" : t.status as TicketRow["status"],
      sla: t.sla,
      technician: t.technician,
      createdISO: iso(-2),
      description: t.description,
    }));
    return [
      ...mapped,
      { id: "HD-2026-000447", title: "المكيف لا يبرد في صالة العرض", category: "تكييف", priority: "متوسطة", status: "بانتظار تأكيد الفرع", sla: "00:00", technician: "سارة وليد", createdISO: iso(-3), description: "تم صيانة الوحدة وتنظيف الفلاتر، والوحدة تعمل الآن بشكل طبيعي." },
      { id: "HD-2026-000441", title: "عطل في طابعة الإيصالات", category: "نقاط بيع", priority: "منخفضة", status: "مغلق", sla: "00:00", technician: "أحمد سامي", createdISO: iso(-6) },
      { id: "HD-2026-000438", title: "إضاءة المخزن الخلفي منطفئة", category: "كهرباء", priority: "عالية", status: "أعيد فتحه", sla: "04:10", technician: "محمود عادل", createdISO: iso(-4) },
    ];
  });

  const [view, setView] = useState<"table" | "cards">("table");
  const [filter, setFilter] = useState<"all" | "active" | "confirm" | "closed" | "late">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "sla" | "priority">("newest");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(categories[0]);
  const [priority, setPriority] = useState<TicketRow["priority"]>("متوسطة");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [msg, setMsg] = useState("");

  const priorityOrder: Record<TicketRow["priority"], number> = { "حرجة": 0, "عالية": 1, "متوسطة": 2, "منخفضة": 3 };
  const isSlaLate = (t: TicketRow) => t.status !== "مغلق" && slaMinutes(t.sla) < 60;
  const needsConfirm = (t: TicketRow) => t.status === "بانتظار تأكيد الفرع";

  const filtered = useMemo(() => {
    const list = rows.filter((t) => {
      if (filter === "active" && !["جديد", "قيد التنفيذ", "أعيد فتحه", "بانتظار شراء"].includes(t.status)) return false;
      if (filter === "confirm" && !needsConfirm(t)) return false;
      if (filter === "closed" && t.status !== "مغلق") return false;
      if (filter === "late" && !isSlaLate(t)) return false;
      if (search && !`${t.id} ${t.title} ${t.category} ${t.technician}`.includes(search.trim())) return false;
      return true;
    });
    if (sort === "sla") list.sort((a, b) => slaMinutes(a.sla) - slaMinutes(b.sla));
    else if (sort === "priority") list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return list;
  }, [rows, filter, search, sort]);

  const openCount = rows.filter((t) => t.status !== "مغلق").length;
  const confirmCount = rows.filter(needsConfirm).length;
  const closedCount = rows.filter((t) => t.status === "مغلق").length;
  const lateCount = rows.filter(isSlaLate).length;
  const percent = rows.length ? Math.round((closedCount / rows.length) * 100) : 0;

  const setStatus = (id: string, status: TicketRow["status"]) => setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setMsg("اكتب عنوان المشكلة أولاً.");
    const id = `HD-2026-000${453 + rows.filter((r) => r.id.startsWith("HD-2026-0004") && Number(r.id.slice(-3)) >= 453).length}`;
    setRows((r) => [{ id, title: title.trim(), category, priority, status: "جديد", sla: priority === "حرجة" ? "01:00" : priority === "عالية" ? "04:00" : "24:00", technician: "بانتظار الإسناد", createdISO: iso(0), description }, ...r]);
    setTitle(""); setDescription(""); setContact(""); setShowForm(false);
    setMsg(`تم إنشاء البلاغ ${id} وإرساله للإدارة للمراجعة.`);
  };

  const filterTabs = [
    { key: "all" as const, label: `الكل (${rows.length})` },
    { key: "active" as const, label: `المفتوحة (${openCount})` },
    { key: "confirm" as const, label: `بانتظار تأكيدك (${confirmCount})` },
    { key: "late" as const, label: `قاربت التجاوز (${lateCount})` },
    { key: "closed" as const, label: `المغلقة (${closedCount})` },
  ];

  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="إجمالي البلاغات" value={String(rows.length)} note={`${openCount} مفتوح · ${percent}% مكتمل`} icon={ClipboardList} tone="navy" />
      <Stat label="بانتظار تأكيدك" value={String(confirmCount)} note="الفني أنهى العمل — راجع وأكد" icon={TicketCheck} tone="amber" />
      <Stat label="قاربت التجاوز" value={String(lateCount)} note="متبقٍ أقل من ساعة للـ SLA" icon={AlertTriangle} tone={lateCount ? "crimson" : "forest"} />
      <Stat label="بلاغات مغلقة" value={String(closedCount)} note="تم تأكيد حلها من الفرع" icon={CheckCircle2} tone="forest" />
    </div>

    <Panel title={`بلاغات الفرع (${rows.length})`} icon={FileText}
      action={<div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
        <Button variant={view === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setView("table")}><Table2 className="h-4 w-4" />جدول</Button>
        <Button variant={view === "cards" ? "secondary" : "ghost"} size="sm" onClick={() => setView("cards")}><LayoutGrid className="h-4 w-4" />بطاقات</Button>
      </div>}>
      <div className="space-y-3 border-b border-border p-4">
        <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[var(--kpi-forest)] transition-all" style={{ width: `${percent}%` }} /></div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {filterTabs.map((f) => <Button key={f.key} size="sm" variant={filter === f.key ? "default" : "outline"} onClick={() => setFilter(f.key)}>{f.label}</Button>)}
          </div>
          <div className="flex items-center gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم البلاغ أو العنوان..." className="h-9 w-52" />
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                <SelectItem value="sla">الأقرب للتجاوز</SelectItem>
                <SelectItem value="priority">الأولوية</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" />بلاغ جديد</Button>
          </div>
        </div>
        {msg && <p className="rounded-md bg-surface p-3 text-sm font-bold text-brand-green">{msg}</p>}
        {showForm && <form onSubmit={create} className="grid gap-3 rounded-md border border-border bg-muted/40 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1 lg:col-span-2"><span className="text-xs font-bold">عنوان المشكلة</span><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: الطابعة لا تعمل" /></div>
          <div className="space-y-1"><span className="text-xs font-bold">التصنيف</span><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><span className="text-xs font-bold">الأولوية</span><Select value={priority} onValueChange={(v) => setPriority(v as TicketRow["priority"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1 lg:col-span-2"><span className="text-xs font-bold">الوصف</span><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="صف المشكلة بالتفصيل..." className="min-h-9" /></div>
          <div className="space-y-1 lg:col-span-2"><span className="text-xs font-bold">رقم للتواصل (اختياري)</span><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0123 456 7890" dir="ltr" className="text-left" /></div>
          <div className="flex items-end gap-2 lg:col-span-4"><Button type="submit"><Plus className="h-4 w-4" />إرسال البلاغ</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>إلغاء</Button></div>
        </form>}
      </div>

      {filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">لا توجد بلاغات مطابقة.</p>
        : view === "table" ? <Table>
          <TableHeader><TableRow><TableHead>البلاغ</TableHead><TableHead>التصنيف</TableHead><TableHead>الأولوية</TableHead><TableHead>الحالة</TableHead><TableHead>الفني</TableHead><TableHead>الـ SLA</TableHead><TableHead>الإنشاء</TableHead><TableHead className="w-44">إجراءات</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow
                key={t.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest("a")) return;
                  navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                }}
                className={cn(
                  "cursor-pointer hover:bg-surface/50 transition-colors",
                  isSlaLate(t) && !needsConfirm(t) && "bg-[var(--kpi-crimson)]/5",
                  needsConfirm(t) && "bg-[var(--kpi-forest)]/5"
                )}
              >
                <TableCell>
                  <Link to="/tickets/$ticketId" params={{ ticketId: t.id }} className="font-display text-xs font-bold text-[var(--kpi-navy)] underline-offset-2 hover:underline">{t.id}</Link>
                  <Link to="/tickets/$ticketId" params={{ ticketId: t.id }} className="mt-1 max-w-56 truncate font-bold block text-foreground hover:underline hover:text-brand-ink">{t.title}</Link>
                </TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{t.category}</span></TableCell>
                <TableCell><Badge variant="outline" className={priorityStyle[t.priority]}>{t.priority}</Badge></TableCell>
                <TableCell><Badge variant="outline" className={statusStyle[t.status]}>{t.status}</Badge></TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{t.technician}</span></TableCell>
                <TableCell>{t.status === "مغلق" || needsConfirm(t) ? <span className="text-xs text-muted-foreground">—</span> : <span className={cn("inline-flex items-center gap-1 font-mono text-sm font-bold", isSlaLate(t) ? "text-[var(--kpi-crimson)]" : "text-[var(--kpi-forest)]")}><Timer className="h-3.5 w-3.5" />{t.sla}</span>}</TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{dateLabel(t.createdISO)}</span></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {needsConfirm(t) && <Button size="sm" className="h-8 px-2 text-xs" onClick={() => setStatus(t.id, "مغلق")}><CheckCircle2 className="h-3.5 w-3.5" />تأكيد الحل</Button>}
                    {needsConfirm(t) && <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => setStatus(t.id, "أعيد فتحه")}><RotateCcw className="h-3.5 w-3.5" />رفض</Button>}
                    {t.status === "مغلق" && <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => setStatus(t.id, "أعيد فتحه")}><RotateCcw className="h-3.5 w-3.5" />إعادة فتح</Button>}
                    <Link to="/tickets/$ticketId" params={{ ticketId: t.id }}><Button size="sm" variant="ghost" className="h-8 px-2 text-xs font-bold text-brand-ink">التفاصيل</Button></Link>
                    {t.status === "أعيد فتحه" && <span className="text-xs font-bold text-[var(--kpi-crimson)]">قيد المراجعة</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        : <div className="divide-y divide-border">
            {filtered.map((t) => (
              <div
                key={t.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest("a")) return;
                  navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                }}
                className="cursor-pointer flex flex-col gap-3 p-4 hover:bg-surface/50 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link to="/tickets/$ticketId" params={{ ticketId: t.id }} className="font-display text-xs font-bold text-[var(--kpi-navy)] underline-offset-2 hover:underline">{t.id}</Link>
                  <Link to="/tickets/$ticketId" params={{ ticketId: t.id }} className="mt-1 font-bold block text-foreground hover:underline hover:text-brand-ink">{t.title}</Link>
                  <p className="mt-1 text-xs text-muted-foreground">{t.category} · {t.technician} · {dateLabel(t.createdISO)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={priorityStyle[t.priority]}>{t.priority}</Badge>
                  <Badge variant="outline" className={statusStyle[t.status]}>{t.status}</Badge>
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs font-bold">
                    <Link to="/tickets/$ticketId" params={{ ticketId: t.id }}>
                      عرض التفاصيل
                    </Link>
                  </Button>
                  {needsConfirm(t) && <Button size="sm" onClick={() => setStatus(t.id, "مغلق")}><CheckCircle2 className="h-4 w-4" />تأكيد الحل</Button>}
                  {t.status === "مغلق" && <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "أعيد فتحه")}><RotateCcw className="h-4 w-4" />إعادة فتح</Button>}
                </div>
              </div>
            ))}
          </div>}
    </Panel>
  </div>;
}
