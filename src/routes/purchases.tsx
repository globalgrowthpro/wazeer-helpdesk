import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  Eye,
  LayoutGrid,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Table2,
  Trash2,
  Truck,
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

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [
      { title: "إدارة المشتريات | وزير الحلو" },
      { name: "description", content: "إدارة طلبات قطع الغيار من الاعتماد حتى التسليم للفني." },
      { property: "og:title", content: "إدارة المشتريات | وزير الحلو" },
      { property: "og:description", content: "إدارة طلبات قطع الغيار من الاعتماد حتى التسليم للفني." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PurchasesPage,
});

type PurchaseStatus = "بانتظار الاعتماد" | "معتمد" | "تم التسليم" | "مرفوض";

type Purchase = {
  id: string;
  item: string;
  category: string;
  quantity: number;
  unitPrice: number;
  ticket: string;
  branch: string;
  technician: string;
  supplier: string;
  status: PurchaseStatus;
  requestDate: string;
  notes: string;
};

const STORAGE_KEY = "wazeer-purchases-v1";
const branches = ["فرع التجمع", "فرع مدينة نصر", "فرع المعادي", "فرع مصر الجديدة"];
const categories = ["كاميرات مراقبة", "معدات شبكة", "نقاط بيع", "تحكم دخول", "معدات تشغيل", "أخرى"];
const statuses: PurchaseStatus[] = ["بانتظار الاعتماد", "معتمد", "تم التسليم", "مرفوض"];

const initialPurchases: Purchase[] = [
  { id: "PR-2026-0082", item: "قارئ دخول بديل ZK-F22", category: "تحكم دخول", quantity: 1, unitPrice: 770, ticket: "HD-2026-000449", branch: "فرع المعادي", technician: "سارة وليد", supplier: "شركة الأمان للأنظمة", status: "بانتظار الاعتماد", requestDate: "2026-09-25", notes: "القارئ الحالي متوقف تماماً ويحتاج استبدالاً عاجلاً." },
  { id: "PR-2026-0081", item: "كابل شبكة CAT6 (لفة 305م)", category: "معدات شبكة", quantity: 1, unitPrice: 340, ticket: "HD-2026-000451", branch: "فرع مدينة نصر", technician: "محمود عادل", supplier: "المتحدة للشبكات", status: "بانتظار الاعتماد", requestDate: "2026-09-25", notes: "لتمديد نقطة شبكة جديدة في منطقة الكاشير." },
  { id: "PR-2026-0080", item: "محول طاقة 12V", category: "كاميرات مراقبة", quantity: 2, unitPrice: 185, ticket: "HD-2026-000452", branch: "فرع التجمع", technician: "أحمد سامي", supplier: "تك لاين للإلكترونيات", status: "معتمد", requestDate: "2026-09-24", notes: "محولان احتياطيان لكاميرات منطقة الاستلام." },
  { id: "PR-2026-0079", item: "وحدة قص لطابعة الإيصالات", category: "نقاط بيع", quantity: 1, unitPrice: 420, ticket: "HD-2026-000447", branch: "فرع مدينة نصر", technician: "سارة وليد", supplier: "بوس تك", status: "معتمد", requestDate: "2026-09-23", notes: "استبدال وحدة القص التالفة في الطابعة الحرارية." },
  { id: "PR-2026-0078", item: "قرص تخزين مراقبة 4TB", category: "كاميرات مراقبة", quantity: 1, unitPrice: 2150, ticket: "HD-2026-000443", branch: "فرع مصر الجديدة", technician: "أحمد سامي", supplier: "شركة الأمان للأنظمة", status: "تم التسليم", requestDate: "2026-09-21", notes: "زيادة مدة الاحتفاظ بالتسجيلات إلى 45 يوماً." },
  { id: "PR-2026-0077", item: "بطارية احتياطية UPS", category: "معدات تشغيل", quantity: 2, unitPrice: 640, ticket: "HD-2026-000438", branch: "فرع التجمع", technician: "خالد حسن", supplier: "باور هاوس", status: "تم التسليم", requestDate: "2026-09-19", notes: "لجهازي UPS الخاصين بغرفة الخوادم." },
  { id: "PR-2026-0076", item: "حساس بصمة احتياطي", category: "تحكم دخول", quantity: 1, unitPrice: 890, ticket: "HD-2026-000430", branch: "فرع المعادي", technician: "سارة وليد", supplier: "شركة الأمان للأنظمة", status: "مرفوض", requestDate: "2026-09-18", notes: "أُرفض لتوفر قطعة بديلة في مخزون فرع التجمع." },
];

const emptyForm = (): Omit<Purchase, "id"> => ({
  item: "",
  category: categories[0] ?? "",
  quantity: 1,
  unitPrice: 0,
  ticket: "",
  branch: branches[0] ?? "",
  technician: "",
  supplier: "",
  status: "بانتظار الاعتماد",
  requestDate: "2026-09-26",
  notes: "",
});

const statusStyle: Record<PurchaseStatus, string> = {
  "بانتظار الاعتماد": "border-transparent bg-kpi-amber/15 text-foreground",
  "معتمد": "border-transparent bg-secondary text-secondary-foreground",
  "تم التسليم": "border-transparent bg-accent text-accent-foreground",
  "مرفوض": "border-transparent bg-destructive/10 text-destructive",
};

const formatMoney = (value: number) => `${value.toLocaleString("en-US")} ج.م`;

function nextId(purchases: Purchase[]) {
  const max = purchases.reduce((acc, purchase) => {
    const num = Number(purchase.id.split("-").pop());
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);
  return `PR-2026-${String(max + 1).padStart(4, "0")}`;
}

function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [selected, setSelected] = useState<Purchase | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Purchase | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) setPurchases(parsed as Purchase[]);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const savePurchases = (next: Purchase[]) => {
    setPurchases(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    const result = purchases.filter((purchase) => {
      const matchesSearch = !query || `${purchase.id} ${purchase.item} ${purchase.ticket} ${purchase.technician} ${purchase.supplier}`.toLocaleLowerCase("ar").includes(query);
      return matchesSearch && (statusFilter === "all" || purchase.status === statusFilter) && (branchFilter === "all" || purchase.branch === branchFilter);
    });
    return result.sort((a, b) => {
      if (sort === "value") return b.quantity * b.unitPrice - a.quantity * a.unitPrice;
      if (sort === "oldest") return a.requestDate.localeCompare(b.requestDate);
      return b.requestDate.localeCompare(a.requestDate);
    });
  }, [purchases, branchFilter, search, sort, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (purchase: Purchase) => {
    setEditingId(purchase.id);
    setForm({ item: purchase.item, category: purchase.category, quantity: purchase.quantity, unitPrice: purchase.unitPrice, ticket: purchase.ticket, branch: purchase.branch, technician: purchase.technician, supplier: purchase.supplier, status: purchase.status, requestDate: purchase.requestDate, notes: purchase.notes });
    setFormError("");
    setFormOpen(true);
  };

  const submitPurchase = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.item.trim() || !form.technician.trim() || !form.supplier.trim()) {
      setFormError("أكمل الحقول المطلوبة قبل الحفظ.");
      return;
    }
    if (form.quantity < 1 || form.unitPrice <= 0) {
      setFormError("أدخل كمية وسعراً صحيحين أكبر من صفر.");
      return;
    }
    const cleaned = { ...form, item: form.item.trim(), technician: form.technician.trim(), supplier: form.supplier.trim(), ticket: form.ticket.trim().toUpperCase(), notes: form.notes.trim() };
    if (editingId) {
      const next = purchases.map((purchase) => purchase.id === editingId ? { ...purchase, ...cleaned } : purchase);
      savePurchases(next);
      setSelected((current) => current?.id === editingId ? { ...current, ...cleaned } : current);
      setNotice(`تم تحديث الطلب ${editingId} بنجاح.`);
    } else {
      const id = nextId(purchases);
      savePurchases([{ id, ...cleaned }, ...purchases]);
      setNotice(`تم إنشاء الطلب ${id} بنجاح.`);
    }
    setFormOpen(false);
  };

  const setStatus = (purchase: Purchase, status: PurchaseStatus) => {
    const next = purchases.map((item) => item.id === purchase.id ? { ...item, status } : item);
    savePurchases(next);
    setSelected((current) => current?.id === purchase.id ? { ...current, status } : current);
    const messages: Record<PurchaseStatus, string> = {
      "بانتظار الاعتماد": `أعيد الطلب ${purchase.id} إلى الاعتماد.`,
      "معتمد": `تم اعتماد الطلب ${purchase.id}.`,
      "تم التسليم": `تم تسجيل تسليم الطلب ${purchase.id} للفني.`,
      "مرفوض": `تم رفض الطلب ${purchase.id}.`,
    };
    setNotice(messages[status]);
  };

  const deletePurchase = () => {
    if (!pendingDelete) return;
    savePurchases(purchases.filter((purchase) => purchase.id !== pendingDelete.id));
    setNotice(`تم حذف الطلب ${pendingDelete.id}.`);
    if (selected?.id === pendingDelete.id) setSelected(null);
    setPendingDelete(null);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setNotice(`تم نسخ رقم الطلب ${code}.`);
  };

  const pendingCount = purchases.filter((purchase) => purchase.status === "بانتظار الاعتماد").length;
  const approvedCount = purchases.filter((purchase) => purchase.status === "معتمد").length;
  const deliveredCount = purchases.filter((purchase) => purchase.status === "تم التسليم").length;
  const totalValue = purchases.filter((purchase) => purchase.status !== "مرفوض").reduce((sum, purchase) => sum + purchase.quantity * purchase.unitPrice, 0);

  return <AppShell title="المشتريات">
    <div className="space-y-5">
      <SectionHeading title="إدارة المشتريات" description="متابعة طلبات قطع الغيار من الاعتماد حتى التسليم للفني" action={<Button onClick={openCreate}><Plus className="h-4 w-4" />طلب شراء جديد</Button>} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="بانتظار الاعتماد" value={String(pendingCount)} note="تحتاج قرار المشتريات" icon={Clock3} tone="amber" />
        <Stat label="طلبات معتمدة" value={String(approvedCount)} note="قيد التوريد" icon={BadgeCheck} tone="navy" />
        <Stat label="تم التسليم" value={String(deliveredCount)} note="وصلت للفنيين" icon={PackageCheck} tone="forest" />
        <Stat label="القيمة الإجمالية" value={formatMoney(totalValue)} note="بدون الطلبات المرفوضة" icon={CircleDollarSign} tone="flame" />
      </section>

      {notice && <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-green/30 bg-accent px-4 py-3 text-sm font-bold text-accent-foreground"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{notice}</span><Button variant="ghost" size="sm" onClick={() => setNotice("")}>إخفاء</Button></div>}

      <Panel title={`طلبات الشراء (${filtered.length})`} icon={ShoppingCart} action={<div className="flex items-center gap-1 rounded-md border border-border bg-background p-1"><Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><Table2 className="h-4 w-4" />جدول</Button><Button size="sm" variant={view === "cards" ? "secondary" : "ghost"} onClick={() => setView("cards")}><LayoutGrid className="h-4 w-4" />بطاقات</Button></div>}>
        <div className="grid gap-3 border-b border-border bg-muted/25 p-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_200px_200px_180px]">
          <div className="relative"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث برقم الطلب أو القطعة أو البلاغ..." className="pr-9" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="كل الحالات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem>{statuses.map((status) => <SelectItem value={status} key={status}>{status}</SelectItem>)}</SelectContent></Select>
          <Select value={branchFilter} onValueChange={setBranchFilter}><SelectTrigger><SelectValue placeholder="كل الفروع" /></SelectTrigger><SelectContent><SelectItem value="all">كل الفروع</SelectItem>{branches.map((branch) => <SelectItem value={branch} key={branch}>{branch}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">الأحدث</SelectItem><SelectItem value="oldest">الأقدم</SelectItem><SelectItem value="value">الأعلى قيمة</SelectItem></SelectContent></Select>
        </div>

        {filtered.length === 0 ? <div className="grid min-h-60 place-items-center p-8 text-center"><div><Search className="mx-auto h-10 w-10 text-muted-foreground/50" /><h3 className="mt-3 font-bold">لا توجد طلبات مطابقة</h3><p className="mt-1 text-sm text-muted-foreground">جرّب تغيير البحث أو الفلاتر الحالية.</p><Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setStatusFilter("all"); setBranchFilter("all"); }}>مسح الفلاتر</Button></div></div>
        : view === "table" ? <Table>
          <TableHeader><TableRow className="bg-muted/35"><TableHead className="min-w-52">الطلب</TableHead><TableHead className="min-w-32">التصنيف</TableHead><TableHead className="min-w-36">الفرع / الفني</TableHead><TableHead className="min-w-28">الكمية</TableHead><TableHead className="min-w-32">القيمة</TableHead><TableHead>الحالة</TableHead><TableHead className="min-w-32">تاريخ الطلب</TableHead><TableHead className="w-16">إجراء</TableHead></TableRow></TableHeader>
          <TableBody>{filtered.map((purchase) => <TableRow key={purchase.id} className="group cursor-pointer" onClick={() => setSelected(purchase)}>
            <TableCell><div><p className="font-bold">{purchase.item}</p><p className="font-display text-xs font-bold text-brand-ink">{purchase.id}</p></div></TableCell>
            <TableCell className="text-muted-foreground">{purchase.category}</TableCell>
            <TableCell><p className="font-medium">{purchase.branch}</p><p className="mt-0.5 text-xs text-muted-foreground">{purchase.technician}</p></TableCell>
            <TableCell className="text-muted-foreground">{purchase.quantity} × {formatMoney(purchase.unitPrice)}</TableCell>
            <TableCell className="font-bold">{formatMoney(purchase.quantity * purchase.unitPrice)}</TableCell>
            <TableCell><Badge variant="outline" className={statusStyle[purchase.status]}>{purchase.status}</Badge></TableCell>
            <TableCell className="text-muted-foreground" dir="ltr">{purchase.requestDate}</TableCell>
            <TableCell onClick={(event) => event.stopPropagation()}><PurchaseActions purchase={purchase} onView={() => setSelected(purchase)} onEdit={() => openEdit(purchase)} onDelete={() => setPendingDelete(purchase)} onCopy={() => copyCode(purchase.id)} onStatus={(status) => setStatus(purchase, status)} /></TableCell>
          </TableRow>)}</TableBody>
        </Table>
        : <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((purchase) => <article key={purchase.id} className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-flow text-brand-ink"><ShoppingCart className="h-5 w-5" /></span><PurchaseActions purchase={purchase} onView={() => setSelected(purchase)} onEdit={() => openEdit(purchase)} onDelete={() => setPendingDelete(purchase)} onCopy={() => copyCode(purchase.id)} onStatus={(status) => setStatus(purchase, status)} /></div><Button type="button" variant="ghost" className="mt-3 h-auto w-full justify-start px-0 py-1 text-right hover:bg-transparent" onClick={() => setSelected(purchase)}><span className="block w-full"><span className="block font-display text-xs font-bold text-brand-ink">{purchase.id}</span><span className="mt-1 block font-bold text-foreground">{purchase.item}</span><span className="mt-2 block text-sm font-normal text-muted-foreground">{purchase.branch} · {purchase.technician}</span><span className="mt-4 flex items-center justify-between gap-2"><Badge variant="outline" className={statusStyle[purchase.status]}>{purchase.status}</Badge><span className="text-sm font-bold">{formatMoney(purchase.quantity * purchase.unitPrice)}</span></span></span></Button></article>)}</div>}
      </Panel>
    </div>

    <PurchaseFormDialog open={formOpen} onOpenChange={setFormOpen} editing={Boolean(editingId)} form={form} setForm={setForm} error={formError} onSubmit={submitPurchase} />
    <PurchaseDetails purchase={selected} onOpenChange={(open) => { if (!open) setSelected(null); }} onEdit={() => { if (selected) { setSelected(null); openEdit(selected); } }} onStatus={(status) => { if (selected) setStatus(selected, status); }} />
    <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}><AlertDialogContent dir="rtl"><AlertDialogHeader className="text-right"><AlertDialogTitle>حذف طلب الشراء؟</AlertDialogTitle><AlertDialogDescription>سيتم حذف طلب «{pendingDelete?.item}» ({pendingDelete?.id}) من هذه النسخة التجريبية. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="gap-2 sm:space-x-0"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deletePurchase}>حذف الطلب</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </AppShell>;
}

function PurchaseActions({ purchase, onView, onEdit, onDelete, onCopy, onStatus }: { purchase: Purchase; onView: () => void; onEdit: () => void; onDelete: () => void; onCopy: () => void; onStatus: (status: PurchaseStatus) => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label={`إجراءات ${purchase.id}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48 text-right">
    <DropdownMenuItem onClick={onView}><Eye className="h-4 w-4" />عرض التفاصيل</DropdownMenuItem>
    <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4" />تعديل الطلب</DropdownMenuItem>
    <DropdownMenuItem onClick={onCopy}><Copy className="h-4 w-4" />نسخ رقم الطلب</DropdownMenuItem>
    <DropdownMenuSeparator />
    {purchase.status === "بانتظار الاعتماد" && <>
      <DropdownMenuItem onClick={() => onStatus("معتمد")}><BadgeCheck className="h-4 w-4" />اعتماد الطلب</DropdownMenuItem>
      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onStatus("مرفوض")}><Ban className="h-4 w-4" />رفض الطلب</DropdownMenuItem>
    </>}
    {purchase.status === "معتمد" && <DropdownMenuItem onClick={() => onStatus("تم التسليم")}><Truck className="h-4 w-4" />تسجيل التسليم للفني</DropdownMenuItem>}
    {(purchase.status === "مرفوض" || purchase.status === "تم التسليم") && <DropdownMenuItem onClick={() => onStatus("بانتظار الاعتماد")}><Clock3 className="h-4 w-4" />إعادة للاعتماد</DropdownMenuItem>}
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4" />حذف الطلب</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;
}

function PurchaseFormDialog({ open, onOpenChange, editing, form, setForm, error, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; editing: boolean; form: Omit<Purchase, "id">; setForm: React.Dispatch<React.SetStateAction<Omit<Purchase, "id">>>; error: string; onSubmit: (event: React.FormEvent) => void }) {
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-2xl" dir="rtl"><form onSubmit={onSubmit}><DialogHeader className="text-right"><DialogTitle>{editing ? "تعديل طلب الشراء" : "طلب شراء جديد"}</DialogTitle><DialogDescription>أدخل بيانات القطعة والكمية والمورد لإنشاء طلب الشراء.</DialogDescription></DialogHeader><div className="grid gap-4 py-5 sm:grid-cols-2">
    <div className="sm:col-span-2"><FormField label="اسم القطعة *"><Input aria-label="اسم القطعة" value={form.item} onChange={(event) => update("item", event.target.value)} placeholder="مثال: قارئ دخول بديل ZK-F22" /></FormField></div>
    <FormField label="التصنيف"><Select value={form.category} onValueChange={(value) => update("category", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem value={category} key={category}>{category}</SelectItem>)}</SelectContent></Select></FormField>
    <FormField label="الحالة"><Select value={form.status} onValueChange={(value) => update("status", value as PurchaseStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem value={status} key={status}>{status}</SelectItem>)}</SelectContent></Select></FormField>
    <FormField label="الكمية *"><Input aria-label="الكمية" type="number" min={1} value={form.quantity} onChange={(event) => update("quantity", Number(event.target.value))} dir="ltr" className="text-left" /></FormField>
    <FormField label="سعر الوحدة (ج.م) *"><Input aria-label="سعر الوحدة" type="number" min={0} step="0.01" value={form.unitPrice} onChange={(event) => update("unitPrice", Number(event.target.value))} dir="ltr" className="text-left" /></FormField>
    <FormField label="الفرع"><Select value={form.branch} onValueChange={(value) => update("branch", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{branches.map((branch) => <SelectItem value={branch} key={branch}>{branch}</SelectItem>)}</SelectContent></Select></FormField>
    <FormField label="البلاغ المرتبط"><Input aria-label="البلاغ المرتبط" value={form.ticket} onChange={(event) => update("ticket", event.target.value)} placeholder="HD-2026-000000" dir="ltr" className="text-left" /></FormField>
    <FormField label="الفني الطالب *"><Input aria-label="الفني الطالب" value={form.technician} onChange={(event) => update("technician", event.target.value)} placeholder="اسم الفني" /></FormField>
    <FormField label="المورد *"><Input aria-label="المورد" value={form.supplier} onChange={(event) => update("supplier", event.target.value)} placeholder="اسم المورد أو الشركة" /></FormField>
    <FormField label="تاريخ الطلب"><Input type="date" value={form.requestDate} onChange={(event) => update("requestDate", event.target.value)} /></FormField>
    <div className="sm:col-span-2"><FormField label="ملاحظات"><Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="سبب الطلب أو تفاصيل إضافية..." className="min-h-24" /></FormField></div>
  </div>{error && <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">{error}</p>}<DialogFooter className="gap-2 sm:space-x-0"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button type="submit">{editing ? "حفظ التعديلات" : "إنشاء الطلب"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function PurchaseDetails({ purchase, onOpenChange, onEdit, onStatus }: { purchase: Purchase | null; onOpenChange: (open: boolean) => void; onEdit: () => void; onStatus: (status: PurchaseStatus) => void }) {
  if (!purchase) return null;
  const total = purchase.quantity * purchase.unitPrice;
  return <Dialog open={Boolean(purchase)} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-2xl" dir="rtl"><DialogHeader className="text-right"><div className="flex items-start gap-3 pl-8"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-flow text-brand-ink"><ShoppingCart className="h-6 w-6" /></span><div><DialogTitle>{purchase.item}</DialogTitle><DialogDescription className="mt-1 font-display font-bold text-brand-ink">{purchase.id}</DialogDescription></div></div></DialogHeader>
    <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      <Detail label="الحالة"><Badge variant="outline" className={statusStyle[purchase.status]}>{purchase.status}</Badge></Detail>
      <Detail label="التصنيف">{purchase.category}</Detail>
      <Detail label="الكمية">{purchase.quantity}</Detail>
      <Detail label="سعر الوحدة">{formatMoney(purchase.unitPrice)}</Detail>
      <Detail label="القيمة الإجمالية">{formatMoney(total)}</Detail>
      <Detail label="تاريخ الطلب">{purchase.requestDate}</Detail>
      <Detail label="الفرع">{purchase.branch}</Detail>
      <Detail label="الفني الطالب">{purchase.technician}</Detail>
      <Detail label="المورد">{purchase.supplier}</Detail>
      <Detail label="البلاغ المرتبط">{purchase.ticket ? <Link to="/tickets/$ticketId" params={{ ticketId: purchase.ticket }} className="font-display text-brand-ink underline underline-offset-4">{purchase.ticket}</Link> : "غير مرتبط"}</Detail>
    </div>
    <div className="rounded-lg border border-border p-4"><h3 className="font-bold">ملاحظات الطلب</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{purchase.notes || "لا توجد ملاحظات مسجلة."}</p></div>
    <div className="flex flex-wrap gap-2">
      {purchase.status === "بانتظار الاعتماد" && <><Button onClick={() => onStatus("معتمد")}><BadgeCheck className="h-4 w-4" />اعتماد الطلب</Button><Button variant="outline" className="text-destructive" onClick={() => onStatus("مرفوض")}><Ban className="h-4 w-4" />رفض الطلب</Button></>}
      {purchase.status === "معتمد" && <Button onClick={() => onStatus("تم التسليم")}><Truck className="h-4 w-4" />تسجيل التسليم للفني</Button>}
      {(purchase.status === "مرفوض" || purchase.status === "تم التسليم") && <Button variant="outline" onClick={() => onStatus("بانتظار الاعتماد")}><Clock3 className="h-4 w-4" />إعادة للاعتماد</Button>}
    </div>
    <DialogFooter className="gap-2 sm:space-x-0"><Button variant="outline" onClick={() => onOpenChange(false)}>إغلاق</Button><Button onClick={onEdit}><Pencil className="h-4 w-4" />تعديل الطلب</Button></DialogFooter></DialogContent></Dialog>;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="bg-card p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 text-sm font-bold">{children}</div></div>;
}
