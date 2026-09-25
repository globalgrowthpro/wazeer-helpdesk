import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, LayoutGrid, ListChecks, Plus, Table2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/branch-tasks")({
  head: () => ({ meta: [{ title: "مهام الفرع | وزير الحلو" }, { name: "description", content: "إدارة مهام الفرع اليومية: تصنيف، أولويات، مواعيد ومتابعة إنجاز." }, { property: "og:title", content: "مهام الفرع | وزير الحلو" }, { property: "og:description", content: "إدارة مهام الفرع اليومية: تصنيف، أولويات، مواعيد ومتابعة إنجاز." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AppShell title="مهام الفرع" role="branch"><BranchTasks /></AppShell>,
});

type Priority = "عالية" | "متوسطة" | "عادية";
type Category = "صيانة" | "سلامة" | "مخزون" | "إداري" | "خدمة عملاء";

type Task = {
  id: string;
  title: string;
  owner: string;
  category: Category;
  priority: Priority;
  dueISO: string;
  done: boolean;
  ticketRef?: string;
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

const priorityStyle: Record<Priority, string> = {
  "عالية": "border-transparent bg-[var(--kpi-crimson)]/10 text-[var(--kpi-crimson)]",
  "متوسطة": "border-transparent bg-[var(--kpi-amber)]/15 text-[#8a5c00]",
  "عادية": "border-border text-muted-foreground",
};

const categories: Category[] = ["صيانة", "سلامة", "مخزون", "إداري", "خدمة عملاء"];

function BranchTasks() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", title: "تجهيز منطقة الكاشير لزيارة الفني", owner: "مدير الفرع", category: "صيانة", priority: "عالية", dueISO: iso(0), done: false, ticketRef: "HD-2026-000452" },
    { id: "t2", title: "تصوير عطل الكاميرا وإرفاقه بالبلاغ", owner: "مشرف الوردية", category: "صيانة", priority: "متوسطة", dueISO: iso(0), done: true, ticketRef: "HD-2026-000452" },
    { id: "t3", title: "جرد طفايات الحريق الشهري", owner: "مسؤول السلامة", category: "سلامة", priority: "متوسطة", dueISO: iso(1), done: false },
    { id: "t4", title: "تأكيد استلام قطعة الغيار", owner: "مدير الفرع", category: "مخزون", priority: "عالية", dueISO: iso(-2), done: false, ticketRef: "HD-2026-000449" },
    { id: "t5", title: "تحديث سجل أصول الفروع الشهري", owner: "مسؤول الأصول", category: "إداري", priority: "عادية", dueISO: iso(3), done: false },
    { id: "t6", title: "متابعة شكوى عميل بشأن نقطة الشبكة", owner: "خدمة العملاء", category: "خدمة عملاء", priority: "عالية", dueISO: iso(0), done: false },
  ]);
  const [view, setView] = useState<"table" | "cards">("table");
  const [filter, setFilter] = useState<"all" | "open" | "done" | "late">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("مدير الفرع");
  const [category, setCategory] = useState<Category>("إداري");
  const [priority, setPriority] = useState<Priority>("عادية");
  const [dueISO, setDueISO] = useState(iso(0));

  const today = iso(0);
  const isLate = (t: Task) => !t.done && t.dueISO < today;

  const filtered = useMemo(() => tasks.filter((t) => {
    if (filter === "open" && t.done) return false;
    if (filter === "done" && !t.done) return false;
    if (filter === "late" && !isLate(t)) return false;
    if (search && !`${t.title} ${t.owner} ${t.category}`.includes(search.trim())) return false;
    return true;
  }), [tasks, filter, search]);

  const doneCount = tasks.filter((t) => t.done).length;
  const lateCount = tasks.filter(isLate).length;
  const todayCount = tasks.filter((t) => !t.done && t.dueISO === today).length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const toggle = (id: string) => setTasks((x) => x.map((y) => (y.id === id ? { ...y, done: !y.done } : y)));
  const remove = (id: string) => setTasks((x) => x.filter((y) => y.id !== id));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks((t) => [{ id: String(Date.now()), title: title.trim(), owner, category, priority, dueISO, done: false }, ...t]);
    setTitle("");
    setShowForm(false);
  };

  const filterTabs = [
    { key: "all" as const, label: `الكل (${tasks.length})` },
    { key: "open" as const, label: `المفتوحة (${tasks.length - doneCount})` },
    { key: "late" as const, label: `متأخرة (${lateCount})` },
    { key: "done" as const, label: `المنجزة (${doneCount})` },
  ];

  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="إجمالي المهام" value={String(tasks.length)} note={`${doneCount} منجزة · ${percent}%`} icon={ClipboardList} tone="navy" />
      <Stat label="مهام اليوم" value={String(todayCount)} note="مستحقة قبل نهاية اليوم" icon={CalendarClock} tone="amber" />
      <Stat label="مهام متأخرة" value={String(lateCount)} note="تجاوزت موعد الاستحقاق" icon={AlertTriangle} tone={lateCount ? "crimson" : "forest"} />
      <Stat label="منجزة" value={String(doneCount)} note="أُغلقت خلال الشهر" icon={CheckCircle2} tone="forest" />
    </div>

    <Panel title={`مهام الفرع (${doneCount}/${tasks.length})`} icon={ListChecks}
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
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في المهام..." className="h-9 w-44" />
            <Button size="sm" onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" />مهمة جديدة</Button>
          </div>
        </div>
        {showForm && <form onSubmit={add} className="grid gap-3 rounded-md border border-border bg-muted/40 p-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1 lg:col-span-2"><span className="text-xs font-bold">عنوان المهمة</span><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اكتب المهمة..." /></div>
          <div className="space-y-1"><span className="text-xs font-bold">المسؤول</span><Input value={owner} onChange={(e) => setOwner(e.target.value)} /></div>
          <div className="space-y-1"><span className="text-xs font-bold">التصنيف</span><Select value={category} onValueChange={(v) => setCategory(v as Category)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><span className="text-xs font-bold">الأولوية</span><Select value={priority} onValueChange={(v) => setPriority(v as Priority)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="عالية">عالية</SelectItem><SelectItem value="متوسطة">متوسطة</SelectItem><SelectItem value="عادية">عادية</SelectItem></SelectContent></Select></div>
          <div className="space-y-1"><span className="text-xs font-bold">موعد الاستحقاق</span><Input type="date" value={dueISO} onChange={(e) => setDueISO(e.target.value)} /></div>
          <div className="flex items-end gap-2 lg:col-span-4"><Button type="submit"><Plus className="h-4 w-4" />إضافة</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>إلغاء</Button></div>
        </form>}
      </div>

      {filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">لا توجد مهام مطابقة.</p>
        : view === "table" ? <Table>
          <TableHeader><TableRow><TableHead className="w-10" /><TableHead>المهمة</TableHead><TableHead>التصنيف</TableHead><TableHead>الأولوية</TableHead><TableHead>المسؤول</TableHead><TableHead>الاستحقاق</TableHead><TableHead>البلاغ</TableHead><TableHead>الحالة</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
          <TableBody>
            {filtered.map((t) => <TableRow key={t.id} className={cn(isLate(t) && "bg-[var(--kpi-crimson)]/5")}>
              <TableCell><Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} /></TableCell>
              <TableCell><p className={cn("font-bold", t.done && "text-muted-foreground line-through")}>{t.title}</p></TableCell>
              <TableCell><span className="text-sm text-muted-foreground">{t.category}</span></TableCell>
              <TableCell><Badge variant="outline" className={priorityStyle[t.priority]}>{t.priority}</Badge></TableCell>
              <TableCell><span className="text-sm text-muted-foreground">{t.owner}</span></TableCell>
              <TableCell><span className={cn("text-sm", isLate(t) && "font-bold text-[var(--kpi-crimson)]")}>{dayLabel(t.dueISO)}</span></TableCell>
              <TableCell>{t.ticketRef ? <Link to="/tickets/$ticketId" params={{ ticketId: t.ticketRef }} className="text-xs font-bold text-[var(--kpi-navy)] underline-offset-2 hover:underline">{t.ticketRef}</Link> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
              <TableCell><Badge variant={t.done ? "secondary" : "outline"}>{t.done ? "منجزة" : isLate(t) ? "متأخرة" : "مفتوحة"}</Badge></TableCell>
              <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[var(--kpi-crimson)]" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
        : <div className="divide-y divide-border">{filtered.map((t) => <label key={t.id} className="flex cursor-pointer items-center gap-3 p-4">
          <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
          <div className="flex-1"><p className={cn("font-bold", t.done && "text-muted-foreground line-through")}>{t.title}</p><p className="mt-1 text-xs text-muted-foreground">{t.owner} · {t.category} · {dayLabel(t.dueISO)}</p></div>
          <Badge variant="outline" className={priorityStyle[t.priority]}>{t.priority}</Badge>
          <Badge variant={t.done ? "secondary" : "outline"}>{t.done ? "منجزة" : isLate(t) ? "متأخرة" : "مفتوحة"}</Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[var(--kpi-crimson)]" onClick={(e) => { e.preventDefault(); remove(t.id); }}><Trash2 className="h-4 w-4" /></Button>
        </label>)}</div>}
    </Panel>
  </div>;
}
