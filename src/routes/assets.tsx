import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Boxes,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Eye,
  History,
  LayoutGrid,
  MapPin,
  Monitor,
  MoreHorizontal,
  Network,
  Pencil,
  Plus,
  QrCode,
  Search,
  Table2,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, SectionHeading, Stat } from "@/components/helpdesk/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "إدارة الأصول | وزير الحلو" },
      { name: "description", content: "إدارة أصول الفروع ومتابعة حالتها وسجل صيانتها." },
      { property: "og:title", content: "إدارة الأصول | وزير الحلو" },
      { property: "og:description", content: "إدارة أصول الفروع ومتابعة حالتها وسجل صيانتها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssetsPage,
});

type AssetStatus = "يعمل" | "تحت الصيانة" | "يحتاج متابعة" | "متوقف";
type AssetType = "كاميرات مراقبة" | "معدات شبكة" | "نقاط بيع" | "تحكم دخول" | "معدات تشغيل";

type MaintenanceEntry = {
  date: string;
  action: string;
  technician: string;
};

type Asset = {
  id: string;
  name: string;
  type: AssetType;
  branch: string;
  location: string;
  serial: string;
  status: AssetStatus;
  responsible: string;
  lastMaintenance: string;
  purchaseDate: string;
  notes: string;
  history: MaintenanceEntry[];
};

const STORAGE_KEY = "wazeer-assets-v2";
const branches = ["فرع التجمع", "فرع مدينة نصر", "فرع المعادي", "فرع مصر الجديدة"];
const types: AssetType[] = ["كاميرات مراقبة", "معدات شبكة", "نقاط بيع", "تحكم دخول", "معدات تشغيل"];
const statuses: AssetStatus[] = ["يعمل", "تحت الصيانة", "يحتاج متابعة", "متوقف"];

const initialAssets: Asset[] = [
  { id: "CCTV-008", name: "كاميرا منطقة الاستلام", type: "كاميرات مراقبة", branch: "فرع التجمع", location: "منطقة الاستلام", serial: "DH-4K-08261", status: "يعمل", responsible: "أحمد سامي", lastMaintenance: "2026-09-18", purchaseDate: "2024-02-12", notes: "كاميرا خارجية بدقة 4K مرتبطة بجهاز التسجيل الرئيسي.", history: [{ date: "2026-09-18", action: "تنظيف العدسة وفحص التوصيلات", technician: "أحمد سامي" }, { date: "2026-06-04", action: "استبدال موصل الشبكة", technician: "محمود عادل" }] },
  { id: "NET-114", name: "محول الشبكة الرئيسي", type: "معدات شبكة", branch: "فرع مدينة نصر", location: "غرفة الخوادم", serial: "SW-24P-41982", status: "يحتاج متابعة", responsible: "محمود عادل", lastMaintenance: "2026-08-27", purchaseDate: "2023-11-06", notes: "محول 24 منفذاً يدعم PoE ويغذي كاميرات الدور الأرضي.", history: [{ date: "2026-08-27", action: "تحديث النظام وإعادة توزيع المنافذ", technician: "محمود عادل" }] },
  { id: "POS-031", name: "جهاز نقطة البيع", type: "نقاط بيع", branch: "فرع المعادي", location: "كاشير رقم 1", serial: "POS-AIO-77310", status: "يعمل", responsible: "سارة وليد", lastMaintenance: "2026-09-11", purchaseDate: "2025-01-18", notes: "جهاز البيع الرئيسي مزود بطابعة فواتير وقارئ باركود.", history: [{ date: "2026-09-11", action: "تنظيف الجهاز وتحديث برنامج التشغيل", technician: "سارة وليد" }] },
  { id: "CCTV-021", name: "كاميرا بوابة السيارات", type: "كاميرات مراقبة", branch: "فرع المعادي", location: "بوابة التوريد", serial: "HK-IP-12094", status: "تحت الصيانة", responsible: "أحمد سامي", lastMaintenance: "2026-09-25", purchaseDate: "2024-07-20", notes: "يوجد تشويش متقطع في الصورة أثناء الليل.", history: [{ date: "2026-09-25", action: "فحص الكابل ومصدر الطاقة", technician: "أحمد سامي" }] },
  { id: "ACC-014", name: "قارئ دخول الموظفين", type: "تحكم دخول", branch: "فرع التجمع", location: "البوابة الخلفية", serial: "ZK-F22-66281", status: "متوقف", responsible: "سارة وليد", lastMaintenance: "2026-09-24", purchaseDate: "2022-05-09", notes: "بانتظار وصول لوحة تحكم بديلة من المشتريات.", history: [{ date: "2026-09-24", action: "تشخيص عطل لوحة التحكم", technician: "سارة وليد" }] },
  { id: "NET-087", name: "نقطة وصول لاسلكية", type: "معدات شبكة", branch: "فرع التجمع", location: "صالة العملاء", serial: "AP-6-55821", status: "يعمل", responsible: "محمود عادل", lastMaintenance: "2026-09-02", purchaseDate: "2025-03-14", notes: "تغطي الصالة الرئيسية ومنطقة الانتظار.", history: [{ date: "2026-09-02", action: "تحسين القنوات وتحديث كلمة المرور", technician: "محمود عادل" }] },
  { id: "OPS-042", name: "ميزان المنتجات الرقمي", type: "معدات تشغيل", branch: "فرع مصر الجديدة", location: "قسم المخبوزات", serial: "SCALE-90557", status: "يعمل", responsible: "خالد حسن", lastMaintenance: "2026-08-15", purchaseDate: "2024-09-01", notes: "تمت معايرته واعتماده للاستخدام.", history: [{ date: "2026-08-15", action: "معايرة الوزن واختبار الدقة", technician: "خالد حسن" }] },
  { id: "POS-044", name: "طابعة إيصالات حرارية", type: "نقاط بيع", branch: "فرع مدينة نصر", location: "كاشير رقم 3", serial: "PRT-T80-44103", status: "يحتاج متابعة", responsible: "سارة وليد", lastMaintenance: "2026-09-20", purchaseDate: "2025-06-22", notes: "صوت مرتفع عند سحب الورق ويُنصح بتغيير وحدة القص.", history: [{ date: "2026-09-20", action: "تنظيف رأس الطباعة وفحص وحدة القص", technician: "سارة وليد" }] },
];

const emptyForm = (): Omit<Asset, "history"> => ({
  id: "",
  name: "",
  type: "كاميرات مراقبة",
  branch: branches[0] ?? "",
  location: "",
  serial: "",
  status: "يعمل",
  responsible: "",
  lastMaintenance: "2026-09-26",
  purchaseDate: "2026-09-26",
  notes: "",
});

const statusStyle: Record<AssetStatus, string> = {
  "يعمل": "border-transparent bg-accent text-accent-foreground",
  "تحت الصيانة": "border-transparent bg-secondary text-secondary-foreground",
  "يحتاج متابعة": "border-transparent bg-kpi-amber/15 text-foreground",
  "متوقف": "border-transparent bg-destructive/10 text-destructive",
};

const typeIcon: Record<AssetType, typeof Camera> = {
  "كاميرات مراقبة": Camera,
  "معدات شبكة": Network,
  "نقاط بيع": Monitor,
  "تحكم دخول": QrCode,
  "معدات تشغيل": Boxes,
};

function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [selected, setSelected] = useState<Asset | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Asset | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) setAssets(parsed as Asset[]);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const saveAssets = (next: Asset[]) => {
    setAssets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    const result = assets.filter((asset) => {
      const matchesSearch = !query || `${asset.id} ${asset.name} ${asset.serial} ${asset.location} ${asset.responsible}`.toLocaleLowerCase("ar").includes(query);
      return matchesSearch && (statusFilter === "all" || asset.status === statusFilter) && (typeFilter === "all" || asset.type === typeFilter) && (branchFilter === "all" || asset.branch === branchFilter);
    });
    return result.sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "ar") : sort === "oldest" ? a.lastMaintenance.localeCompare(b.lastMaintenance) : b.lastMaintenance.localeCompare(a.lastMaintenance));
  }, [assets, branchFilter, search, sort, statusFilter, typeFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setForm({ id: asset.id, name: asset.name, type: asset.type, branch: asset.branch, location: asset.location, serial: asset.serial, status: asset.status, responsible: asset.responsible, lastMaintenance: asset.lastMaintenance, purchaseDate: asset.purchaseDate, notes: asset.notes });
    setFormError("");
    setFormOpen(true);
  };

  const submitAsset = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.id.trim() || !form.name.trim() || !form.serial.trim() || !form.location.trim() || !form.responsible.trim()) {
      setFormError("أكمل الحقول المطلوبة قبل الحفظ.");
      return;
    }
    const duplicate = assets.some((asset) => asset.id.toLowerCase() === form.id.trim().toLowerCase() && asset.id !== editingId);
    if (duplicate) {
      setFormError("كود الأصل مستخدم بالفعل. اختر كوداً مختلفاً.");
      return;
    }
    const cleaned = { ...form, id: form.id.trim().toUpperCase(), name: form.name.trim(), serial: form.serial.trim(), location: form.location.trim(), responsible: form.responsible.trim(), notes: form.notes.trim() };
    if (editingId) {
      const next = assets.map((asset) => asset.id === editingId ? { ...asset, ...cleaned } : asset);
      saveAssets(next);
      setSelected((current) => current?.id === editingId ? { ...current, ...cleaned } : current);
      setNotice(`تم تحديث الأصل ${cleaned.id} بنجاح.`);
    } else {
      saveAssets([{ ...cleaned, history: [] }, ...assets]);
      setNotice(`تمت إضافة الأصل ${cleaned.id} بنجاح.`);
    }
    setFormOpen(false);
  };

  const deleteAsset = () => {
    if (!pendingDelete) return;
    saveAssets(assets.filter((asset) => asset.id !== pendingDelete.id));
    setNotice(`تم حذف الأصل ${pendingDelete.id}.`);
    if (selected?.id === pendingDelete.id) setSelected(null);
    setPendingDelete(null);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setNotice(`تم نسخ الكود ${code}.`);
  };

  const workingCount = assets.filter((asset) => asset.status === "يعمل").length;
  const maintenanceCount = assets.filter((asset) => asset.status === "تحت الصيانة").length;
  const attentionCount = assets.filter((asset) => asset.status === "يحتاج متابعة" || asset.status === "متوقف").length;

  return <AppShell title="الأصول">
    <div className="space-y-5">
      <SectionHeading title="إدارة الأصول" description="متابعة الأجهزة والمعدات ودورة صيانتها في جميع الفروع" action={<Button onClick={openCreate}><Plus className="h-4 w-4" />إضافة أصل</Button>} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="إجمالي الأصول" value={String(assets.length)} note="أصل مسجل بالنظام" icon={QrCode} tone="navy" />
        <Stat label="أصول تعمل" value={String(workingCount)} note={`${Math.round((workingCount / Math.max(assets.length, 1)) * 100)}% من الأصول`} icon={CheckCircle2} tone="forest" />
        <Stat label="تحت الصيانة" value={String(maintenanceCount)} note="قيد المعالجة حالياً" icon={Wrench} tone="flame" />
        <Stat label="تحتاج متابعة" value={String(attentionCount)} note="تتطلب إجراء قريباً" icon={AlertTriangle} tone="amber" />
      </section>

      {notice && <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-green/30 bg-accent px-4 py-3 text-sm font-bold text-accent-foreground"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{notice}</span><Button variant="ghost" size="sm" onClick={() => setNotice("")}>إخفاء</Button></div>}

      <Panel title={`سجل الأصول (${filtered.length})`} icon={ClipboardCheck} action={<div className="flex items-center gap-1 rounded-md border border-border bg-background p-1"><Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><Table2 className="h-4 w-4" />جدول</Button><Button size="sm" variant={view === "cards" ? "secondary" : "ghost"} onClick={() => setView("cards")}><LayoutGrid className="h-4 w-4" />بطاقات</Button></div>}>
        <div className="grid gap-3 border-b border-border bg-muted/25 p-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_180px_180px_160px]">
          <div className="relative"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث بالكود أو الاسم أو الرقم التسلسلي..." className="pr-9" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="كل الحالات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem>{statuses.map((status) => <SelectItem value={status} key={status}>{status}</SelectItem>)}</SelectContent></Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger><SelectValue placeholder="كل الأنواع" /></SelectTrigger><SelectContent><SelectItem value="all">كل الأنواع</SelectItem>{types.map((type) => <SelectItem value={type} key={type}>{type}</SelectItem>)}</SelectContent></Select>
          <Select value={branchFilter} onValueChange={setBranchFilter}><SelectTrigger><SelectValue placeholder="كل الفروع" /></SelectTrigger><SelectContent><SelectItem value="all">كل الفروع</SelectItem>{branches.map((branch) => <SelectItem value={branch} key={branch}>{branch}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">آخر صيانة</SelectItem><SelectItem value="oldest">الأقدم صيانة</SelectItem><SelectItem value="name">الاسم أبجدياً</SelectItem></SelectContent></Select>
        </div>

        {filtered.length === 0 ? <div className="grid min-h-60 place-items-center p-8 text-center"><div><Search className="mx-auto h-10 w-10 text-muted-foreground/50" /><h3 className="mt-3 font-bold">لا توجد أصول مطابقة</h3><p className="mt-1 text-sm text-muted-foreground">جرّب تغيير البحث أو الفلاتر الحالية.</p><Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setBranchFilter("all"); }}>مسح الفلاتر</Button></div></div>
        : view === "table" ? <Table>
          <TableHeader><TableRow className="bg-muted/35"><TableHead className="min-w-52">الأصل</TableHead><TableHead className="min-w-36">النوع</TableHead><TableHead className="min-w-40">الفرع والموقع</TableHead><TableHead className="min-w-36">الرقم التسلسلي</TableHead><TableHead>الحالة</TableHead><TableHead className="min-w-32">آخر صيانة</TableHead><TableHead className="min-w-32">المسؤول</TableHead><TableHead className="w-16">إجراء</TableHead></TableRow></TableHeader>
          <TableBody>{filtered.map((asset) => { const Icon = typeIcon[asset.type]; return <TableRow key={asset.id} className="group cursor-pointer" onClick={() => setSelected(asset)}>
            <TableCell><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-flow text-brand-ink"><Icon className="h-5 w-5" /></span><div><p className="font-bold">{asset.name}</p><p className="font-display text-xs font-bold text-brand-ink">{asset.id}</p></div></div></TableCell>
            <TableCell className="text-muted-foreground">{asset.type}</TableCell>
            <TableCell><p className="font-medium">{asset.branch}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{asset.location}</p></TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground" dir="ltr">{asset.serial}</TableCell>
            <TableCell><Badge variant="outline" className={statusStyle[asset.status]}>{asset.status}</Badge></TableCell>
            <TableCell className="text-muted-foreground" dir="ltr">{asset.lastMaintenance}</TableCell>
            <TableCell className="text-muted-foreground">{asset.responsible}</TableCell>
            <TableCell onClick={(event) => event.stopPropagation()}><AssetActions asset={asset} onView={() => setSelected(asset)} onEdit={() => openEdit(asset)} onDelete={() => setPendingDelete(asset)} onCopy={() => copyCode(asset.id)} /></TableCell>
          </TableRow>; })}</TableBody>
        </Table>
        : <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((asset) => { const Icon = typeIcon[asset.type]; return <article key={asset.id} className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-flow text-brand-ink"><Icon className="h-5 w-5" /></span><AssetActions asset={asset} onView={() => setSelected(asset)} onEdit={() => openEdit(asset)} onDelete={() => setPendingDelete(asset)} onCopy={() => copyCode(asset.id)} /></div><Button type="button" variant="ghost" className="mt-3 h-auto w-full justify-start px-0 py-1 text-right hover:bg-transparent" onClick={() => setSelected(asset)}><span className="block w-full"><span className="block font-display text-xs font-bold text-brand-ink">{asset.id}</span><span className="mt-1 block font-bold text-foreground">{asset.name}</span><span className="mt-2 flex items-center gap-1 text-sm font-normal text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{asset.branch} · {asset.location}</span><span className="mt-4 flex items-center justify-between gap-2"><Badge variant="outline" className={statusStyle[asset.status]}>{asset.status}</Badge><span className="text-xs font-normal text-muted-foreground">صيانة: {asset.lastMaintenance}</span></span></span></Button></article>; })}</div>}
      </Panel>
    </div>

    <AssetFormDialog open={formOpen} onOpenChange={setFormOpen} editing={Boolean(editingId)} form={form} setForm={setForm} error={formError} onSubmit={submitAsset} />
    <AssetDetails asset={selected} onOpenChange={(open) => { if (!open) setSelected(null); }} onEdit={() => { if (selected) { setSelected(null); openEdit(selected); } }} />
    <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}><AlertDialogContent dir="rtl"><AlertDialogHeader className="text-right"><AlertDialogTitle>حذف الأصل؟</AlertDialogTitle><AlertDialogDescription>سيتم حذف «{pendingDelete?.name}» وكامل سجل صيانته من هذه النسخة التجريبية. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="gap-2 sm:space-x-0"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteAsset}>حذف الأصل</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </AppShell>;
}

function AssetActions({ asset, onView, onEdit, onDelete, onCopy }: { asset: Asset; onView: () => void; onEdit: () => void; onDelete: () => void; onCopy: () => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label={`إجراءات ${asset.name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44 text-right"><DropdownMenuItem onClick={onView}><Eye className="h-4 w-4" />عرض التفاصيل</DropdownMenuItem><DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4" />تعديل الأصل</DropdownMenuItem><DropdownMenuItem onClick={onCopy}><Copy className="h-4 w-4" />نسخ الكود</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4" />حذف الأصل</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}

function AssetFormDialog({ open, onOpenChange, editing, form, setForm, error, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; editing: boolean; form: Omit<Asset, "history">; setForm: React.Dispatch<React.SetStateAction<Omit<Asset, "history">>>; error: string; onSubmit: (event: React.FormEvent) => void }) {
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-2xl" dir="rtl"><form onSubmit={onSubmit}><DialogHeader className="text-right"><DialogTitle>{editing ? "تعديل بيانات الأصل" : "إضافة أصل جديد"}</DialogTitle><DialogDescription>أدخل بيانات التعريف والموقع والمسؤول لتحديث سجل الأصول.</DialogDescription></DialogHeader><div className="grid gap-4 py-5 sm:grid-cols-2">
    <FormField label="كود الأصل *"><Input aria-label="كود الأصل" value={form.id} onChange={(event) => update("id", event.target.value)} placeholder="مثال: CCTV-025" dir="ltr" className="text-left" disabled={editing} /></FormField>
    <FormField label="اسم الأصل *"><Input aria-label="اسم الأصل" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="مثال: كاميرا المدخل الرئيسي" /></FormField>
    <FormField label="النوع"><Select value={form.type} onValueChange={(value) => update("type", value as AssetType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{types.map((type) => <SelectItem value={type} key={type}>{type}</SelectItem>)}</SelectContent></Select></FormField>
    <FormField label="الحالة"><Select value={form.status} onValueChange={(value) => update("status", value as AssetStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem value={status} key={status}>{status}</SelectItem>)}</SelectContent></Select></FormField>
    <FormField label="الفرع"><Select value={form.branch} onValueChange={(value) => update("branch", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{branches.map((branch) => <SelectItem value={branch} key={branch}>{branch}</SelectItem>)}</SelectContent></Select></FormField>
    <FormField label="الموقع داخل الفرع *"><Input aria-label="الموقع داخل الفرع" value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="مثال: غرفة الخوادم" /></FormField>
    <FormField label="الرقم التسلسلي *"><Input aria-label="الرقم التسلسلي" value={form.serial} onChange={(event) => update("serial", event.target.value)} placeholder="Serial Number" dir="ltr" className="text-left" /></FormField>
    <FormField label="المسؤول *"><Input aria-label="المسؤول" value={form.responsible} onChange={(event) => update("responsible", event.target.value)} placeholder="اسم الفني أو المسؤول" /></FormField>
    <FormField label="تاريخ الشراء"><Input type="date" value={form.purchaseDate} onChange={(event) => update("purchaseDate", event.target.value)} /></FormField>
    <FormField label="آخر صيانة"><Input type="date" value={form.lastMaintenance} onChange={(event) => update("lastMaintenance", event.target.value)} /></FormField>
    <div className="sm:col-span-2"><FormField label="ملاحظات"><Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="معلومات إضافية عن الأصل أو حالته..." className="min-h-24" /></FormField></div>
  </div>{error && <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">{error}</p>}<DialogFooter className="gap-2 sm:space-x-0"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button type="submit">{editing ? "حفظ التعديلات" : "إضافة الأصل"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function AssetDetails({ asset, onOpenChange, onEdit }: { asset: Asset | null; onOpenChange: (open: boolean) => void; onEdit: () => void }) {
  if (!asset) return null;
  const Icon = typeIcon[asset.type];
  return <Dialog open={Boolean(asset)} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-2xl" dir="rtl"><DialogHeader className="text-right"><div className="flex items-start gap-3 pl-8"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-flow text-brand-ink"><Icon className="h-6 w-6" /></span><div><DialogTitle>{asset.name}</DialogTitle><DialogDescription className="mt-1 font-display font-bold text-brand-ink">{asset.id}</DialogDescription></div></div></DialogHeader><div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2"><Detail label="الحالة"><Badge variant="outline" className={statusStyle[asset.status]}>{asset.status}</Badge></Detail><Detail label="النوع">{asset.type}</Detail><Detail label="الفرع">{asset.branch}</Detail><Detail label="الموقع">{asset.location}</Detail><Detail label="الرقم التسلسلي"><span dir="ltr" className="font-mono text-xs">{asset.serial}</span></Detail><Detail label="المسؤول">{asset.responsible}</Detail><Detail label="تاريخ الشراء">{asset.purchaseDate}</Detail><Detail label="آخر صيانة">{asset.lastMaintenance}</Detail></div><div className="rounded-lg border border-border p-4"><h3 className="font-bold">ملاحظات الأصل</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{asset.notes || "لا توجد ملاحظات مسجلة."}</p></div><div><h3 className="flex items-center gap-2 font-bold"><History className="h-4 w-4 text-brand-ink" />سجل الصيانة</h3><div className="mt-3 space-y-2">{asset.history.length ? asset.history.map((entry, index) => <div key={`${entry.date}-${index}`} className="flex gap-3 rounded-lg border border-border p-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-green" /><div><p className="text-sm font-bold">{entry.action}</p><p className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground"><span>{entry.date}</span><span className="flex items-center gap-1"><UserRound className="h-3 w-3" />{entry.technician}</span></p></div></div>) : <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">لا يوجد سجل صيانة لهذا الأصل بعد.</p>}</div></div><DialogFooter className="gap-2 sm:space-x-0"><Button variant="outline" onClick={() => onOpenChange(false)}>إغلاق</Button><Button onClick={onEdit}><Pencil className="h-4 w-4" />تعديل البيانات</Button></DialogFooter></DialogContent></Dialog>;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="bg-card p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 text-sm font-bold">{children}</div></div>;
}