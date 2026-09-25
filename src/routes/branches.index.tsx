import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  Filter,
  LayoutGrid,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Table2,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, SectionHeading, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Branch,
  branches,
  getStoredBranches,
  saveStoredBranches,
} from "@/lib/helpdesk-data";

export const Route = createFileRoute("/branches/")({
  head: () => ({
    meta: [
      { title: "دليل الفروع | وزير الحلو" },
      { name: "description", content: "إدارة شبكة فروع حلواني وزير الحلو، إضافة وتعديل الفروع ومتابعة البلاغات." },
      { property: "og:title", content: "دليل الفروع | وزير الحلو" },
      { property: "og:description", content: "إدارة شبكة فروع حلواني وزير الحلو، إضافة وتعديل الفروع ومتابعة البلاغات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BranchesPage,
});

const regions = [
  "جميع المناطق",
  "القاهرة الجديدة",
  "شرق القاهرة",
  "جنوب القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدلتا",
] as const;

export function BranchesPage() {
  const [allBranches, setAllBranches] = useState<Branch[]>(() => {
    return getStoredBranches();
  });

  useEffect(() => {
    const handleSync = () => {
      setAllBranches(getStoredBranches());
    };
    window.addEventListener("wazeer-branches-updated", handleSync);
    return () => window.removeEventListener("wazeer-branches-updated", handleSync);
  }, []);

  // Default view is TABLE view
  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("جميع المناطق");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    manager: string;
    phone: string;
    region: string;
    address: string;
    status: "نشط" | "تحت التجهيز" | "صيانة شاملة";
    devicesCount: number;
  }>({
    id: "",
    name: "",
    manager: "",
    phone: "",
    region: "القاهرة الجديدة",
    address: "",
    status: "نشط",
    devicesCount: 20,
  });

  const handleOpenAdd = () => {
    const nextNum = allBranches.length + 1;
    const padNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setFormData({
      id: `branch-${padNum}`,
      name: "",
      manager: "",
      phone: "02 ",
      region: "القاهرة الجديدة",
      address: "",
      status: "نشط",
      devicesCount: 20,
    });
    setAddModalOpen(true);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.manager.trim()) return;

    const newBranch: Branch = {
      id: formData.id.trim() || `branch-${Date.now().toString().slice(-3)}`,
      name: formData.name.trim(),
      manager: formData.manager.trim(),
      phone: formData.phone.trim() || "02 2618 4400",
      address: formData.address.trim() || "العنوان قيد التحديث",
      region: formData.region,
      status: formData.status,
      devicesCount: Number(formData.devicesCount) || 15,
      open: 0,
      closed: 0,
      satisfaction: "5.0",
    };

    const nextList = [newBranch, ...allBranches];
    setAllBranches(nextList);
    saveStoredBranches(nextList);
    setAddModalOpen(false);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      id: branch.id,
      name: branch.name,
      manager: branch.manager,
      phone: branch.phone,
      region: branch.region || "القاهرة الجديدة",
      address: branch.address,
      status: branch.status || "نشط",
      devicesCount: branch.devicesCount || 20,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !formData.name.trim()) return;

    const updatedList = allBranches.map((item) => {
      if (item.id === editingBranch.id) {
        return {
          ...item,
          name: formData.name.trim(),
          manager: formData.manager.trim(),
          phone: formData.phone.trim(),
          region: formData.region,
          address: formData.address.trim(),
          status: formData.status,
          devicesCount: Number(formData.devicesCount) || item.devicesCount || 15,
        };
      }
      return item;
    });

    setAllBranches(updatedList);
    saveStoredBranches(updatedList);
    setEditModalOpen(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف ${name} من دليل الفروع؟`)) {
      const nextList = allBranches.filter((b) => b.id !== id);
      setAllBranches(nextList);
      saveStoredBranches(nextList);
    }
  };

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return allBranches.filter((branch) => {
      if (selectedRegion !== "جميع المناطق" && branch.region !== selectedRegion) {
        return false;
      }
      if (statusFilter !== "all" && branch.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const text = `${branch.name} ${branch.manager} ${branch.phone} ${branch.address} ${branch.id} ${branch.region || ""}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });
  }, [allBranches, selectedRegion, statusFilter, search]);

  // Statistics
  const totalBranches = allBranches.length;
  const activeCount = allBranches.filter((b) => (b.status ?? "نشط") === "نشط").length;
  const totalOpenTickets = allBranches.reduce((acc, curr) => acc + (curr.open || 0), 0);
  const avgSatisfaction = (
    allBranches.reduce((acc, curr) => acc + parseFloat(curr.satisfaction || "5.0"), 0) /
    (totalBranches || 1)
  ).toFixed(1);

  return (
    <AppShell title="إدارة شبكة الفروع">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              شبكة فروع حلواني وزير الحلو
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              دليل الفروع، متابعة البلاغات المفتوحة ومسؤولي الفروع، وإضافة وتعديل بيانات الفروع.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            إضافة فرع جديد
          </Button>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="إجمالي الفروع المسجلة"
            value={String(totalBranches)}
            note="فرعاً في منظومة وزير الحلو"
            icon={Building2}
            tone="navy"
          />
          <Stat
            label="الفروع النشطة"
            value={String(activeCount)}
            note="تعمل بكامل طاقتها التشغيلية"
            icon={CheckCircle2}
            tone="forest"
          />
          <Stat
            label="بلاغات الفروع المفتوحة"
            value={String(totalOpenTickets)}
            note="قيد المتابعة والإنجاز الفني"
            icon={Clock3}
            tone={totalOpenTickets > 0 ? "amber" : "forest"}
          />
          <Stat
            label="متوسط رضا الفروع"
            value={`${avgSatisfaction}/5.0`}
            note="بناءً على تقييم جودة الصيانة"
            icon={Star}
            tone="sand"
          />
        </section>

        {/* Main Panel */}
        <Panel
          title={`دليل الفروع (${filteredBranches.length})`}
          icon={Building2}
          action={
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 shadow-xs">
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("table")}
                className="gap-1.5 text-xs font-semibold"
              >
                <Table2 className="h-4 w-4" />
                جدول
              </Button>
              <Button
                variant={view === "cards" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("cards")}
                className="gap-1.5 text-xs font-semibold"
              >
                <LayoutGrid className="h-4 w-4" />
                بطاقات
              </Button>
            </div>
          }
        >
          {/* Controls Bar */}
          <div className="space-y-3 border-b border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث باسم الفرع، المدير، الهاتف، أو العنوان..."
                  className="h-9 pr-9 text-sm"
                />
              </div>

              {/* Status & Region Selects */}
              <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-36 text-xs">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="تحت التجهيز">تحت التجهيز</SelectItem>
                    <SelectItem value="صيانة شاملة">صيانة شاملة</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleOpenAdd} size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  فرع جديد
                </Button>
              </div>
            </div>

            {/* Region Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="flex items-center gap-1 pl-1 text-xs font-medium text-muted-foreground">
                <Filter className="h-3 w-3" />
                المنطقة:
              </span>
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedRegion === reg
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Content: Table or Cards */}
          {filteredBranches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 font-semibold text-foreground">لا توجد فروع مطابقة لمعايير البحث</p>
              <p className="mt-1 text-xs text-muted-foreground">
                جرب تغيير خيارات التصفية أو أضف فرعاً جديداً.
              </p>
              <Button onClick={handleOpenAdd} size="sm" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                إضافة فرع الآن
              </Button>
            </div>
          ) : view === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">الفرع والكود</TableHead>
                  <TableHead>المنطقة</TableHead>
                  <TableHead>مدير الفرع</TableHead>
                  <TableHead>الهاتف والتواصل</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>البلاغات</TableHead>
                  <TableHead>الرضا</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-32 text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id} className="group hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[var(--kpi-navy)]/10 text-[var(--kpi-navy)]">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <div>
                          <Link
                            to="/branches/$branchId"
                            params={{ branchId: branch.id }}
                            className="font-bold text-foreground hover:text-primary hover:underline"
                          >
                            {branch.name}
                          </Link>
                          <p className="font-mono text-xs text-muted-foreground">{branch.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border text-xs">
                        {branch.region || "القاهرة"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{branch.manager}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground" dir="ltr">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[200px] truncate text-xs text-muted-foreground" title={branch.address}>
                        {branch.address}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[var(--kpi-crimson)]">
                          {branch.open} مفتوح
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          {branch.closed} منجز
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{branch.satisfaction}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          (branch.status ?? "نشط") === "نشط"
                            ? "border-transparent bg-[var(--kpi-forest)]/10 text-[var(--kpi-forest)] font-bold"
                            : "border-transparent bg-[var(--kpi-amber)]/15 text-[#8a5c00]"
                        }
                      >
                        {branch.status ?? "نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link to="/branches/$branchId" params={{ branchId: branch.id }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="عرض صفحة الفرع"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleOpenEdit(branch)}
                          title="تعديل بيانات الفرع"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteBranch(branch.id, branch.name)}
                          title="حذف الفرع"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--kpi-navy)]/10 text-[var(--kpi-navy)]">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={
                            (branch.status ?? "نشط") === "نشط"
                              ? "border-transparent bg-[var(--kpi-forest)]/10 text-[var(--kpi-forest)] font-bold text-xs"
                              : "border-transparent bg-[var(--kpi-amber)]/15 text-[#8a5c00] text-xs"
                          }
                        >
                          {branch.status ?? "نشط"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {branch.region || "القاهرة"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-bold text-lg text-foreground">{branch.name}</h3>
                      <p className="font-mono text-xs text-muted-foreground">{branch.id}</p>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>مدير الفرع: <strong className="text-foreground">{branch.manager}</strong></span>
                      </div>
                      <div className="flex items-center gap-2" dir="ltr">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{branch.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--kpi-crimson)]">
                        {branch.open} بلاغات مفتوحة
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {branch.satisfaction}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Link to="/branches/$branchId" params={{ branchId: branch.id }} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                          <ExternalLink className="h-3 w-3" />
                          لوحة الفرع
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleOpenEdit(branch)}
                      >
                        <Edit3 className="h-3 w-3" />
                        تعديل
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteBranch(branch.id, branch.name)}
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
      </div>

      {/* ADD BRANCH MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[550px]" dir="rtl">
          <form onSubmit={handleCreateBranch}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Building2 className="h-5 w-5 text-primary" />
                إضافة فرع جديد للمنظومة
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات الفرع الجديد وتفاصيل المدير وموقع الفرع لربطه بالنظام الفني.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">اسم الفرع *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: فرع الشيخ زايد - هايبر وان"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">كود الفرع (ID)</label>
                <Input
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="branch-07"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">المنطقة الجغرافية</label>
                <Select
                  value={formData.region}
                  onValueChange={(val) => setFormData({ ...formData, region: val })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.filter((r) => r !== "جميع المناطق").map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">مدير الفرع *</label>
                <Input
                  required
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="اسم مدير الفرع المسؤول"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">رقم الهاتف للتواصل</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="02 3850 1422"
                  dir="ltr"
                  className="text-left font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">الحالة التشغيلية</label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      status: val as "نشط" | "تحت التجهيز" | "صيانة شاملة",
                    })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط (يعمل بالكامل)</SelectItem>
                    <SelectItem value="تحت التجهيز">تحت التجهيز</SelectItem>
                    <SelectItem value="صيانة شاملة">صيانة شاملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">عدد الأجهزة والمعدات</label>
                <Input
                  type="number"
                  value={formData.devicesCount}
                  onChange={(e) =>
                    setFormData({ ...formData, devicesCount: parseInt(e.target.value) || 0 })
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">العنوان التفصيلي وملاحظات الموقع</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="مثال: محور 26 يوليو، مدخل الشيخ زايد، بجوار هايبر وان..."
                  className="min-h-[70px] text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start">
              <Button type="submit" className="gap-2 font-bold">
                <Plus className="h-4 w-4" />
                حفظ وإضافة الفرع
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT BRANCH MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[550px]" dir="rtl">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Edit3 className="h-5 w-5 text-primary" />
                تعديل بيانات {editingBranch?.name}
              </DialogTitle>
              <DialogDescription>
                تحديث بيانات الفرع، اسم المدير، الهاتف، أو العنوان.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">اسم الفرع *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">المنطقة الجغرافية</label>
                <Select
                  value={formData.region}
                  onValueChange={(val) => setFormData({ ...formData, region: val })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.filter((r) => r !== "جميع المناطق").map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">مدير الفرع *</label>
                <Input
                  required
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">رقم الهاتف للتواصل</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  dir="ltr"
                  className="text-left font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">الحالة التشغيلية</label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      status: val as "نشط" | "تحت التجهيز" | "صيانة شاملة",
                    })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط (يعمل بالكامل)</SelectItem>
                    <SelectItem value="تحت التجهيز">تحت التجهيز</SelectItem>
                    <SelectItem value="صيانة شاملة">صيانة شاملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">عدد الأجهزة والمعدات</label>
                <Input
                  type="number"
                  value={formData.devicesCount}
                  onChange={(e) =>
                    setFormData({ ...formData, devicesCount: parseInt(e.target.value) || 0 })
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">العنوان التفصيلي وملاحظات الموقع</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="min-h-[70px] text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start">
              <Button type="submit" className="gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                حفظ التعديلات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}