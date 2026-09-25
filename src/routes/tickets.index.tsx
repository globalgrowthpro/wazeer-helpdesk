import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  LayoutGrid,
  LifeBuoy,
  Pencil,
  Plus,
  Search,
  Table as TableIcon,
  Timer,
  Trash2,
  Wrench,
} from "lucide-react";
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
  getStoredTickets,
  saveStoredTickets,
  technicians,
  ticketCategories,
  type Ticket,
} from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tickets/")({
  head: () => ({
    meta: [
      { title: "البلاغات | وزير الحلو" },
      { name: "description", content: "إضافة وتعديل ومتابعة وفرز جميع بلاغات الدعم والتصنيفات." },
      { property: "og:title", content: "البلاغات | وزير الحلو" },
      { property: "og:description", content: "إضافة وتعديل ومتابعة وفرز جميع بلاغات الدعم والتصنيفات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TicketsPage,
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
  "بانتظار تأكيد الفرع": "border-transparent bg-[var(--kpi-forest)]/15 text-[var(--kpi-forest)] font-bold",
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

function TicketsPage() {
  // Stored tickets state with persistence
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    setAllTickets(getStoredTickets());
    const onSync = () => setAllTickets(getStoredTickets());
    window.addEventListener("wazeer-tickets-updated", onSync);
    return () => window.removeEventListener("wazeer-tickets-updated", onSync);
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
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Form State for Add Ticket
  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    branchId: string;
    technicianId: string;
    priority: string;
    status: string;
    sla: string;
    location: string;
    branchPhone: string;
    description: string;
  }>({
    title: "",
    category: ticketCategories[0] || "كاميرات مراقبة",
    branchId: branches[0]?.id || "branch-04",
    technicianId: technicians[0]?.id || "ahmed-samy",
    priority: "عالية",
    status: "جديد",
    sla: "02:00",
    location: "الصالة الرئيسية",
    branchPhone: branches[0]?.phone || "02 2618 4401",
    description: "",
  });

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      category: ticketCategories[0] || "كاميرات مراقبة",
      branchId: branches[0]?.id || "branch-04",
      technicianId: technicians[0]?.id || "ahmed-samy",
      priority: "عالية",
      status: "جديد",
      sla: "02:00",
      location: "الصالة الرئيسية",
      branchPhone: branches[0]?.phone || "02 2618 4401",
      description: "",
    });
    setAddModalOpen(true);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const branchObj = branches.find((b) => b.id === formData.branchId) || branches[0]!;
    const techObj = technicians.find((t) => t.id === formData.technicianId) || technicians[0]!;
    const randNum = Math.floor(100 + Math.random() * 900);
    const newId = `HD-2026-000${randNum}`;

    const newTicket: Ticket = {
      id: newId,
      title: formData.title.trim(),
      category: formData.category,
      branch: branchObj.name,
      branchId: branchObj.id,
      technician: techObj.name,
      technicianId: techObj.id,
      priority: formData.priority,
      status: formData.status,
      sla: formData.sla || "02:00",
      location: formData.location || "الصالة الرئيسية",
      branchPhone: formData.branchPhone || branchObj.phone,
      description: formData.description.trim() || "بلاغ صيانة جديد تم تسجيله عبر لوحة الإدارة.",
      createdISO: new Date().toISOString().slice(0, 10),
    };

    const nextList = [newTicket, ...allTickets];
    setAllTickets(nextList);
    saveStoredTickets(nextList);
    setAddModalOpen(false);
  };

  const handleOpenEdit = (t: Ticket) => {
    setEditingTicket(t);
    setFormData({
      title: t.title,
      category: (t.category as typeof ticketCategories[number]) || ticketCategories[0],
      branchId: t.branchId || branches[0]?.id || "",
      technicianId: t.technicianId || technicians[0]?.id || "",
      priority: t.priority,
      status: t.status,
      sla: t.sla,
      location: t.location || "الصالة الرئيسية",
      branchPhone: t.branchPhone || "",
      description: t.description || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket || !formData.title.trim()) return;

    const branchObj = branches.find((b) => b.id === formData.branchId) || branches[0]!;
    const techObj = technicians.find((t) => t.id === formData.technicianId) || technicians[0]!;

    const updatedTicket: Ticket = {
      ...editingTicket,
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
      branchPhone: formData.branchPhone || branchObj.phone,
      description: formData.description.trim(),
    };

    const nextList = allTickets.map((t) => (t.id === editingTicket.id ? updatedTicket : t));
    setAllTickets(nextList);
    saveStoredTickets(nextList);
    setEditModalOpen(false);
    setEditingTicket(null);
  };

  const handleDeleteTicket = (id: string) => {
    if (window.confirm(`هل أنت متأكد من حذف البلاغ ${id}؟`)) {
      const nextList = allTickets.filter((t) => t.id !== id);
      setAllTickets(nextList);
      saveStoredTickets(nextList);
    }
  };

  const filteredTickets = useMemo(() => {
    return allTickets.filter((t) => {
      const matchSearch =
        search === "" ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.branch.toLowerCase().includes(search.toLowerCase()) ||
        t.technician.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && t.status !== "مغلق") ||
        (statusFilter === "in_progress" && (t.status === "قيد التنفيذ" || t.status === "العمل جارٍ")) ||
        (statusFilter === "purchasing" && (t.status === "بانتظار شراء" || t.status === "بانتظار قطعة")) ||
        (statusFilter === "closed" && t.status === "مغلق");

      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [allTickets, search, statusFilter, priorityFilter, categoryFilter]);

  const openCount = allTickets.filter((t) => t.status !== "مغلق").length;
  const criticalCount = allTickets.filter((t) => t.priority === "حرجة" || t.status === "حرج").length;
  const inProgressCount = allTickets.filter((t) => t.status === "قيد التنفيذ" || t.status === "العمل جارٍ").length;

  return (
    <AppShell title="البلاغات">
      <SectionHeading
        title="جميع البلاغات والتصنيفات"
        description="إضافة وتعديل البلاغات، ومراجعة الحالة والأولوية ومستوى الخدمة والفني المسند"
        action={
          <Button onClick={handleOpenAdd} className="bg-brand-ink text-primary-foreground hover:bg-brand-ink/90">
            <Plus className="h-4 w-4" />
            بلاغ جديد
          </Button>
        }
      />

      {/* KPI Stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="إجمالي البلاغات" value={String(allTickets.length)} tone="navy" icon={LifeBuoy} note="مسجلة بالنظام" />
        <Stat label="البلاغات المفتوحة" value={String(openCount)} tone="amber" icon={Clock3} note="تحتاج متابعة" />
        <Stat label="بلاغات حرجة" value={String(criticalCount)} tone="crimson" icon={AlertTriangle} note="استجابة فورية" />
        <Stat label="قيد المعالجة الميدانية" value={String(inProgressCount)} tone="forest" icon={Wrench} note="مع الفنيين" />
      </section>

      <Panel title={`قائمة البلاغات (${filteredTickets.length})`}>
        {/* Filters & View Switcher */}
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pr-9 text-xs"
                  placeholder="ابحث برقم البلاغ، التصنيف، الفرع، أو الفني..."
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
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="open">المفتوحة فقط</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="purchasing">بانتظار شراء/قطعة</SelectItem>
                  <SelectItem value="closed">المغلقة والمكتملة</SelectItem>
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

            {/* View Toggle - Table is default */}
            <div className="flex items-center gap-1 border-t border-border pt-2 md:border-t-0 md:pt-0">
              <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">طريقة العرض:</span>
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
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-muted-foreground ml-1">التصنيفات:</span>
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
              الكل ({allTickets.length})
            </button>
            {ticketCategories.map((cat) => {
              const count = allTickets.filter((t) => t.category === cat).length;
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

        {/* Content View: Table as Default */}
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            لا توجد بلاغات تطابق معايير البحث الحالية.
          </div>
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">رقم البلاغ</TableHead>
                  <TableHead>عنوان المشكلة</TableHead>
                  <TableHead className="w-36">التصنيف</TableHead>
                  <TableHead>الفرع والموقع</TableHead>
                  <TableHead>الفني المسند</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الـ SLA</TableHead>
                  <TableHead className="w-32 text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-surface/50">
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
                        className="font-bold text-sm hover:underline block truncate max-w-xs"
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
                      <span className="text-sm font-semibold">{ticket.branch}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{ticket.technician}</span>
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
                            عرض
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-brand-ink hover:bg-surface"
                          onClick={() => handleOpenEdit(ticket)}
                          title="تعديل البلاغ"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-brand-red hover:bg-brand-red/10"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          title="حذف البلاغ"
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
          <div className="divide-y divide-border">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="grid gap-3 p-5 transition-colors hover:bg-surface md:grid-cols-[1.2fr_auto_.8fr_.7fr_.5fr_auto_auto] md:items-center"
              >
                <div>
                  <Link
                    to="/tickets/$ticketId"
                    params={{ ticketId: ticket.id }}
                    className="text-xs font-bold text-brand-ink hover:underline block"
                  >
                    {ticket.id}
                  </Link>
                  <p className="mt-1 font-bold">{ticket.title}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-semibold px-2 py-0.5", categoryBadgeStyles[ticket.category] || "bg-muted/50")}
                >
                  {ticket.category}
                </Badge>
                <div>
                  <p className="text-sm font-semibold text-foreground">{ticket.branch}</p>
                  <p className="text-xs text-muted-foreground">{ticket.location || "الموقع الرئيسي"}</p>
                </div>
                <span className="text-sm">{ticket.technician}</span>
                <span className="font-mono text-sm font-bold text-brand-red flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  {ticket.sla}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={priorityStyles[ticket.priority] || ""}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline" className={statusStyles[ticket.status] || ""}>
                    {ticket.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => handleOpenEdit(ticket)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-brand-red"
                    onClick={() => handleDeleteTicket(ticket.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ================= MODAL: ADD NEW TICKET ================= */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-ink" />
              إضافة بلاغ صيانة جديد
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات البلاغ، وحدد التصنيف والفرع المعني والفني المسند إليه.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4 py-2">
            <Field label="عنوان البلاغ">
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: توقف شاشة الكاشير أو عطل في كاميرا المراقبة"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="التصنيف الفني">
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

              <Field label="الفرع المعني">
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

              <Field label="زمن الاستجابة SLA">
                <Input
                  value={formData.sla}
                  onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                  placeholder="02:00"
                  dir="ltr"
                  className="font-mono text-left"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="الموقع داخل الفرع">
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="مثال: كاشير 1، غرفة الخوادم، البوابة الخلفية"
                />
              </Field>
              <Field label="رقم هاتف للتواصل">
                <Input
                  value={formData.branchPhone}
                  onChange={(e) => setFormData({ ...formData, branchPhone: e.target.value })}
                  placeholder="02 2618 4401"
                  dir="ltr"
                  className="font-mono text-left"
                />
              </Field>
            </div>

            <Field label="تفاصيل ووصف المشكلة">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="اشرح المشكلة والأعراض الملاحظة بالتفصيل..."
                className="min-h-20"
              />
            </Field>

            <DialogFooter className="gap-2 sm:justify-start pt-2">
              <Button type="submit" className="bg-brand-ink text-primary-foreground">
                <Plus className="h-4 w-4" />
                حفظ وإصدار البلاغ
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: EDIT TICKET ================= */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-brand-ink" />
              تعديل بيانات البلاغ ({editingTicket?.id})
            </DialogTitle>
            <DialogDescription>
              تحديث بيانات المشكلة والتصنيف أو إعادة إسناد الفني وتعديل الحالة.
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
              <Field label="التصنيف الفني">
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

              <Field label="الفرع المعني">
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

              <Field label="الحالة الحالية">
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

            <Field label="تفاصيل ووصف المشكلة">
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