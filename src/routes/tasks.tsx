import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileDown,
  Filter,
  LayoutGrid,
  ListChecks,
  Pencil,
  Plus,
  Search,
  Table as TableIcon,
  Timer,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { exportToExcel } from "@/lib/export-excel";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Field, Panel, SectionHeading, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  branches,
  getStoredTasks,
  saveStoredTasks,
  technicians,
  ticketCategories,
  type Ticket,
} from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "المهام | وزير الحلو" },
      { name: "description", content: "إضافة وتعديل ومتابعة مهام الصيانة المسندة والتصنيفات." },
      { property: "og:title", content: "المهام | وزير الحلو" },
      { property: "og:description", content: "إضافة وتعديل ومتابعة مهام الصيانة المسندة والتصنيفات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
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
  "حرج": "border-transparent bg-[var(--kpi-crimson)]/15 text-[var(--kpi-crimson)] font-bold",
  "بانتظار شراء": "border-transparent bg-[var(--kpi-apricot)]/25 text-[#8a5c00] font-bold",
  "بانتظار قطعة": "border-transparent bg-[var(--kpi-apricot)]/25 text-[#8a5c00] font-bold",
  "بانتظار مراجعة الإدارة": "border-transparent bg-[var(--kpi-forest)]/15 text-[var(--kpi-forest)] font-bold",
  "مغلق": "border-border text-muted-foreground bg-muted/40",
};

const categoryBadgeStyles: Record<string, string> = {
  "كاميرات مراقبة": "bg-[var(--kpi-navy)]/10 text-[var(--kpi-navy)] border-[var(--kpi-navy)]/30",
  "شبكات": "bg-[var(--kpi-sage)]/25 text-[#1f4e38] border-[var(--kpi-sage)]/40",
  "تحكم دخول": "bg-[var(--kpi-amber)]/15 text-[#8a5c00] border-[var(--kpi-amber)]/30",
  "نقاط البيع والكاشير": "bg-[var(--kpi-flame)]/10 text-[var(--kpi-flame)] border-[var(--kpi-flame)]/30",
  "طابعات فواتير": "bg-[var(--kpi-sand)]/25 text-[#735118] border-[var(--kpi-sand)]/40",
  "كهرباء وطاقة": "bg-[var(--kpi-crimson)]/10 text-[var(--kpi-crimson)] border-[var(--kpi-crimson)]/30",
};

function TasksPage() {
  const navigate = useNavigate();
  // Stored tasks state with persistence
  const [allTasks, setAllTasks] = useState<Ticket[]>([]);

  useEffect(() => {
    setAllTasks(getStoredTasks());
    const onSync = () => setAllTasks(getStoredTasks());
    window.addEventListener("wazeer-tasks-updated", onSync);
    return () => window.removeEventListener("wazeer-tasks-updated", onSync);
  }, []);

  // Table view is DEFAULT
  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal States: Add & Edit
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Ticket | null>(null);

  // Form State for Add/Edit
  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    branchId: string;
    technicianId: string;
    priority: string;
    status: string;
    sla: string;
    location: string;
    description: string;
  }>({
    title: "",
    category: ticketCategories[0] || "كاميرات مراقبة",
    branchId: branches[0]?.id || "branch-04",
    technicianId: technicians[0]?.id || "ahmed-samy",
    priority: "عالية",
    status: "قيد التنفيذ",
    sla: "02:30",
    location: "الصالة الرئيسية",
    description: "",
  });

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      category: ticketCategories[0] || "كاميرات مراقبة",
      branchId: branches[0]?.id || "branch-04",
      technicianId: technicians[0]?.id || "ahmed-samy",
      priority: "عالية",
      status: "قيد التنفيذ",
      sla: "02:30",
      location: "الصالة الرئيسية",
      description: "",
    });
    setAddModalOpen(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const branchObj = branches.find((b) => b.id === formData.branchId) || branches[0]!;
    const techObj = technicians.find((t) => t.id === formData.technicianId) || technicians[0]!;
    const randNum = Math.floor(100 + Math.random() * 900);
    const newId = `HD-2026-000${randNum}`;

    const newTask: Ticket = {
      id: newId,
      title: formData.title.trim(),
      category: formData.category,
      branch: branchObj.name,
      branchId: branchObj.id,
      technician: techObj.name,
      technicianId: techObj.id,
      priority: formData.priority,
      status: formData.status,
      sla: formData.sla || "02:30",
      location: formData.location || "الصالة الرئيسية",
      description: formData.description.trim() || "مهمة صيانة تشغيلية مسندة لفريق الدعم الفني.",
      createdISO: new Date().toISOString().slice(0, 10),
    };

    const nextList = [newTask, ...allTasks];
    setAllTasks(nextList);
    saveStoredTasks(nextList);
    setAddModalOpen(false);
  };

  const handleOpenEdit = (task: Ticket) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: (task.category as typeof ticketCategories[number]) || ticketCategories[0],
      branchId: task.branchId || branches[0]?.id || "",
      technicianId: task.technicianId || technicians[0]?.id || "",
      priority: task.priority,
      status: task.status,
      sla: task.sla,
      location: task.location || "الصالة الرئيسية",
      description: task.description || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formData.title.trim()) return;

    const branchObj = branches.find((b) => b.id === formData.branchId) || branches[0]!;
    const techObj = technicians.find((t) => t.id === formData.technicianId) || technicians[0]!;

    const updatedTask: Ticket = {
      ...editingTask,
      title: formData.title.trim(),
      category: formData.category,
      branch: branchObj.name,
      branchId: branchObj.id,
      technician: techObj.name,
      technicianId: techObj.id,
      priority: formData.priority,
      status: formData.status,
      sla: formData.sla,
      location: formData.location,
      description: formData.description.trim(),
    };

    const nextList = allTasks.map((t) => (t.id === editingTask.id ? updatedTask : t));
    setAllTasks(nextList);
    saveStoredTasks(nextList);
    setEditModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المهمة ${id}؟`)) {
      const nextList = allTasks.filter((t) => t.id !== id);
      setAllTasks(nextList);
      saveStoredTasks(nextList);
    }
  };

  const filteredTasks = useMemo(() => {
    return allTasks.filter((ticket) => {
      const matchSearch =
        search === "" ||
        ticket.id.toLowerCase().includes(search.toLowerCase()) ||
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.branch.toLowerCase().includes(search.toLowerCase()) ||
        ticket.technician.toLowerCase().includes(search.toLowerCase()) ||
        ticket.category.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && (ticket.status === "قيد التنفيذ" || ticket.status === "العمل جارٍ")) ||
        (statusFilter === "assigned" && (ticket.status === "مسندة" || ticket.status === "جديد")) ||
        (statusFilter === "waiting" && (ticket.status === "بانتظار قطعة" || ticket.status === "بانتظار شراء")) ||
        (statusFilter === "closed" && ticket.status === "مغلق");

      const matchPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchCategory = categoryFilter === "all" || ticket.category === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [allTasks, search, statusFilter, priorityFilter, categoryFilter]);

  const activeCount = allTasks.filter((t) => t.status === "قيد التنفيذ" || t.status === "العمل جارٍ").length;
  const assignedCount = allTasks.filter((t) => t.status === "مسندة" || t.status === "جديد").length;
  const closedCount = allTasks.filter((t) => t.status === "مغلق").length;

  const handleExport = () => {
    exportToExcel({
      rows: filteredTasks.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        branch: t.branch,
        technician: t.technician,
        priority: t.priority,
        status: t.status,
        location: t.location,
        description: t.description,
      })),
      headers: {
        id: "رقم المهمة",
        title: "عنوان المهمة",
        category: "التصنيف",
        branch: "الفرع",
        technician: "الفني المسند",
        priority: "الأولوية",
        status: "الحالة",
        location: "الموقع",
        description: "الوصف",
      },
      sheetName: "المهام",
      fileName: `وزير-المهام-${new Date().toISOString().slice(0, 10)}`,
    });
  };

  return (
    <AppShell title="المهام">
      <SectionHeading
        title="مهام فريق الصيانة والتصنيفات"
        description="إضافة وتعديل المهام، ومتابعة التقدم الميداني والتوزيع على الفنيين والفروع"
        action={
          <Button onClick={handleOpenAdd} className="bg-brand-ink text-primary-foreground hover:bg-brand-ink/90">
            <Plus className="h-4 w-4" />
            مهمة جديدة
          </Button>
        }
      />

      {/* KPI Stats Row */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="قيد التنفيذ" value={String(activeCount || 14)} tone="amber" icon={Clock3} note="يجري العمل عليها" />
        <Stat label="بانتظار البدء" value={String(assignedCount || 5)} tone="navy" icon={UserRound} note="مسندة للفنيين" />
        <Stat label="مكتملة اليوم" value={String(closedCount || 32)} tone="forest" icon={CheckCircle2} note="تم اعتمادها" />
        <Stat label="إجمالي المهام" value={String(allTasks.length || 51)} tone="sage" icon={ListChecks} note="سجل العمليات" />
      </section>

      <Panel title={`قائمة المهام النشطة (${filteredTasks.length})`}>
        {/* Filters and View Switcher */}
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pr-9 text-xs"
                  placeholder="ابحث بالمهمة، التصنيف، الفني، أو الفرع..."
                />
              </div>

              {/* Category Dropdown */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-40 text-xs font-semibold">
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {ticketCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-36 text-xs">
                  <SelectValue placeholder="حالة المهمة" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">قيد التنفيذ</SelectItem>
                  <SelectItem value="assigned">مسندة / جديدة</SelectItem>
                  <SelectItem value="waiting">بانتظار قطع</SelectItem>
                  <SelectItem value="closed">مكتملة ومغلقة</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-32 text-xs">
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

            {/* View Switcher: Table is DEFAULT */}
            <div className="flex items-center gap-2 border-t border-border pt-2 md:border-t-0 md:pt-0">
              <span className="ml-1 text-xs text-muted-foreground hidden sm:inline">طريقة العرض:</span>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1 px-3 text-xs"
                onClick={() => setView("table")}
              >
                <TableIcon className="h-3.5 w-3.5" />
                جدول
              </Button>
              <Button
                variant={view === "cards" ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1 px-3 text-xs"
                onClick={() => setView("cards")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                بطاقات
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={handleExport}
                disabled={filteredTasks.length === 0}
                title="تصدير إلى Excel"
              >
                <FileDown className="h-3.5 w-3.5" />
                تصدير Excel
              </Button>
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-muted-foreground ml-1">تصنيف المهام:</span>
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors border",
                categoryFilter === "all"
                  ? "bg-brand-ink text-primary-foreground border-brand-ink"
                  : "bg-surface hover:bg-muted border-border text-foreground/80",
              )}
            >
              الكل ({allTasks.length})
            </button>
            {ticketCategories.map((cat) => {
              const count = allTasks.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors border",
                    categoryFilter === cat
                      ? "bg-brand-ink text-primary-foreground border-brand-ink"
                      : "bg-surface hover:bg-muted border-border text-foreground/80",
                  )}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content: Table as Default */}
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            لا توجد مهام تطابق معايير البحث والتصنيف الحالية.
          </div>
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">كود المهمة</TableHead>
                  <TableHead>عنوان المهمة</TableHead>
                  <TableHead className="w-36">التصنيف</TableHead>
                  <TableHead>الفني المسند</TableHead>
                  <TableHead>الفرع والموقع</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الـ SLA المتبقي</TableHead>
                  <TableHead className="w-32 text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="hover:bg-surface/50 cursor-pointer transition-colors"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("button") || target.closest("a") || target.closest("input")) return;
                      navigate({ to: "/tickets/$ticketId", params: { ticketId: ticket.id } });
                    }}
                  >
                    <TableCell className="font-display text-xs font-bold text-brand-ink">
                      <Link
                        to="/tickets/$ticketId"
                        params={{ ticketId: ticket.id }}
                        className="text-brand-ink underline-offset-2 hover:underline"
                      >
                        {ticket.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to="/tickets/$ticketId"
                        params={{ ticketId: ticket.id }}
                        className="font-bold text-sm hover:underline block max-w-xs truncate"
                      >
                        {ticket.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">{ticket.location || "الموقع الرئيسي"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs font-semibold px-2 py-0.5", categoryBadgeStyles[ticket.category] || "bg-muted/50")}
                      >
                        {ticket.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-brand-ink shrink-0" />
                        <span className="text-sm font-semibold">{ticket.technician}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">{ticket.branch}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityStyles[ticket.priority] || ""}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[ticket.status] || ""}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-brand-red">
                        <Timer className="h-3 w-3" />
                        {ticket.sla}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs font-semibold">
                          <Link to="/tickets/$ticketId" params={{ ticketId: ticket.id }}>
                            فتح
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-brand-ink hover:bg-surface"
                          onClick={() => handleOpenEdit(ticket)}
                          title="تعديل المهمة"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-brand-red hover:bg-brand-red/10"
                          onClick={() => handleDeleteTask(ticket.id)}
                          title="حذف المهمة"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Cards View */
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((ticket) => (
              <div
                key={ticket.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest("a") || target.closest("input")) return;
                  navigate({ to: "/tickets/$ticketId", params: { ticketId: ticket.id } });
                }}
                className="cursor-pointer rounded-xl border border-border p-4 transition-all hover:bg-surface hover:border-brand-copper/50 hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/tickets/$ticketId"
                      params={{ ticketId: ticket.id }}
                      className="font-display text-xs font-bold text-brand-ink hover:underline"
                    >
                      {ticket.id}
                    </Link>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={priorityStyles[ticket.priority] || ""}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className={statusStyles[ticket.status] || ""}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                  <h2 className="mt-3 font-bold text-sm leading-snug group-hover:text-brand-copper transition-colors">
                    {ticket.title}
                  </h2>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-semibold px-2 py-0.5", categoryBadgeStyles[ticket.category] || "bg-muted/50")}
                    >
                      {ticket.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{ticket.technician}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-xs">
                  <span className="text-muted-foreground">{ticket.branch}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-brand-red flex items-center gap-1 ml-2">
                      <Timer className="h-3 w-3" />
                      {ticket.sla}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleOpenEdit(ticket)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-brand-red"
                      onClick={() => handleDeleteTask(ticket.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ================= MODAL: ADD NEW TASK ================= */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-ink" />
              إضافة مهمة صيانة جديدة
            </DialogTitle>
            <DialogDescription>
              إنشاء مهمة فنية جديدة وتحديد الفني المسؤول والفرع والمهلة الزمنية.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 py-2">
            <Field label="عنوان المهمة">
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: فحص نقاط الشبكة في الفرع أو صيانة الكاميرات الخارجية"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="التصنيف">
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as typeof ticketCategories[number] })}
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
                        {t.name} ({t.skill})
                      </SelectItem>
                    ))}
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

              <Field label="المهلة المتوقعة SLA">
                <Input
                  value={formData.sla}
                  onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                  placeholder="02:30"
                  dir="ltr"
                  className="font-mono text-left"
                />
              </Field>
            </div>

            <Field label="موقع العمل بالفرع">
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="الصالة الرئيسية، منطقة التحميل، غرفة السيرفر..."
              />
            </Field>

            <Field label="تفاصيل المهمة ومتطلبات العمل">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="اكتب تعليمات وإجراءات المهمة بالتفصيل..."
                className="min-h-20"
              />
            </Field>

            <DialogFooter className="gap-2 sm:justify-start pt-2">
              <Button type="submit" className="bg-brand-ink text-primary-foreground">
                <Plus className="h-4 w-4" />
                حفظ وإسناد المهمة
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: EDIT TASK ================= */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-brand-ink" />
              تعديل بيانات المهمة ({editingTask?.id})
            </DialogTitle>
            <DialogDescription>
              تحديث بيانات المهمة أو إعادة إسنادها وتعديل الحالة والمهلة الزمنية.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <Field label="عنوان المهمة">
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
                  onValueChange={(v) => setFormData({ ...formData, category: v as typeof ticketCategories[number] })}
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
              <Field label="المهلة الزمنية SLA">
                <Input
                  value={formData.sla}
                  onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                  dir="ltr"
                  className="font-mono text-left"
                />
              </Field>
              <Field label="موقع العمل بالفرع">
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Field>
            </div>

            <Field label="تفاصيل المهمة ومتطلبات العمل">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-20"
              />
            </Field>

            <DialogFooter className="gap-2 sm:justify-start pt-2">
              <Button type="submit" className="bg-brand-ink text-primary-foreground">
                <CheckCircle2 className="h-4 w-4" />
                حفظ التعديلات
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}