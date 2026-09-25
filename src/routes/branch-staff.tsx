import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  CheckCircle2,
  ChefHat,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  UsersRound,
  Wifi,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, Stat } from "@/components/helpdesk/ui";
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
import { useSession } from "@/lib/auth";
import { branches, technicians } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/branch-staff")({
  head: () => ({
    meta: [
      { title: "طاقم عمل الفرع | وزير الحلو" },
      { name: "description", content: "دليل طاقم عمل الفرع، بطاقات الهوية، المشرفون، الموظفون، وفنيو الصيانة." },
      { property: "og:title", content: "طاقم عمل الفرع | وزير الحلو" },
      { property: "og:description", content: "دليل طاقم عمل الفرع، بطاقات الهوية، المشرفون، الموظفون، وفنيو الصيانة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell title="طاقم عمل الفرع" role="branch">
      <BranchStaffPage />
    </AppShell>
  ),
});

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  category: "management" | "cashier" | "inventory" | "tech" | "kitchen";
  phone: string;
  email?: string;
  shift: string;
  status: "على رأس العمل" | "في استراحة" | "إجازة";
  avatarColor?: string;
  image?: string;
  responsibilities: string;
  employeeCode?: string;
}

export const defaultStaff: StaffMember[] = [
  {
    id: "st-1",
    name: "كريم محمود",
    role: "مدير الفرع",
    category: "management",
    phone: "0100 123 4567",
    email: "kareem.m@wazeer.demo",
    shift: "الوردية الإدارية (09:00 ص - 06:00 م)",
    status: "على رأس العمل",
    image: "/staff/manager-kareem.jpg",
    avatarColor: "bg-brand-ink",
    responsibilities: "الإشراف العام على العمليات، متابعة المبيعات وجودة الخدمة وبلاغات الصيانة.",
    employeeCode: "WZ-MGR-01",
  },
  {
    id: "st-8",
    name: "شيف مصطفى السيد",
    role: "الشيف التنفيذي للحلويات",
    category: "kitchen",
    phone: "0102 334 5566",
    email: "chef.mostafa@wazeer.demo",
    shift: "الوردية الإنتاجية (06:00 ص - 03:00 م)",
    status: "على رأس العمل",
    image: "/staff/chef-mostafa.jpg",
    avatarColor: "bg-red-800",
    responsibilities: "إعداد وتطوير أصناف الحلويات الشرقية والغربية الفاخرة، والإشراف على الجودة ومقاييس الطعم والتجهيز.",
    employeeCode: "WZ-CHF-07",
  },
  {
    id: "st-9",
    name: "علي جابر",
    role: "مساعد مطبخ وتجهيز",
    category: "kitchen",
    phone: "0114 556 7788",
    shift: "الوردية الصباحية (06:30 ص - 03:30 م)",
    status: "على رأس العمل",
    image: "/staff/kitchen-ali.jpg",
    avatarColor: "bg-orange-700",
    responsibilities: "مساعدة الشيف في التجهيز، رص صواني الحلويات للعرض، وتعبئة الطلبات وفق معايير النظافة.",
    employeeCode: "WZ-KIT-14",
  },
  {
    id: "st-2",
    name: "طارق سليم",
    role: "مشرف الوردية الصباحية",
    category: "management",
    phone: "0112 345 6789",
    email: "tarek.s@wazeer.demo",
    shift: "وردية صباحية (08:00 ص - 04:00 م)",
    status: "على رأس العمل",
    image: "/staff/supervisor-tarek.jpg",
    avatarColor: "bg-amber-700",
    responsibilities: "تشغيل الصالة، مراقبة الكاميرات والأنظمة، والتنسيق مع فنيي الصيانة.",
    employeeCode: "WZ-SUP-02",
  },
  {
    id: "st-3",
    name: "مروة عادل",
    role: "مسؤولة الكاشير ونقاط البيع",
    category: "cashier",
    phone: "0123 456 7891",
    shift: "وردية صباحية (08:00 ص - 04:00 م)",
    status: "على رأس العمل",
    image: "/staff/cashier-marwa.jpg",
    avatarColor: "bg-emerald-700",
    responsibilities: "إدارة أجهزة الدفع الإلكتروني POS، تسجيل الإيرادات، وتأكيد عمل الطابعات.",
    employeeCode: "WZ-CSH-05",
  },
  {
    id: "st-4",
    name: "زياد الشافعي",
    role: "مشرف الوردية المسائية",
    category: "management",
    phone: "0109 876 5432",
    shift: "وردية مسائية (04:00 م - 12:00 ص)",
    status: "في استراحة",
    image: "/staff/supervisor-tarek.jpg",
    avatarColor: "bg-indigo-700",
    responsibilities: "إدارة الإغلاق، تسليم النقدية، وفحص أمان الفرع وأنظمة المراقبة.",
    employeeCode: "WZ-SUP-03",
  },
  {
    id: "st-5",
    name: "أحمد سامي",
    role: "فني الصيانة الميدانية المسند",
    category: "tech",
    phone: "0100 234 5678",
    email: "a.samy@wazeer.demo",
    shift: "دعم الطوارئ (09:00 ص - 05:00 م)",
    status: "على رأس العمل",
    image: "/staff/tech-ahmed.jpg",
    avatarColor: "bg-blue-800",
    responsibilities: "صيانة كاميرات المراقبة، شبكات الاتصال، وأجهزة الحضور والانصراف بالفرع.",
    employeeCode: "WZ-TCH-08",
  },
  {
    id: "st-6",
    name: "محمود عادل",
    role: "مهندس الشبكات والأنظمة المركزية",
    category: "tech",
    phone: "0128 765 4321",
    shift: "فحص دوري ودعم عن بُعد",
    status: "على رأس العمل",
    image: "/staff/tech-mahmoud.jpg",
    avatarColor: "bg-cyan-800",
    responsibilities: "صيانة راوتر الفرع، خطوط الفايبر، وربط نقاط البيع بالسيرفر المركزي.",
    employeeCode: "WZ-ENG-12",
  },
  {
    id: "st-7",
    name: "حسام حسن",
    role: "مسؤول المخزون والتجهيز",
    category: "inventory",
    phone: "0115 678 9012",
    shift: "وردية كاملة (09:00 ص - 05:00 م)",
    status: "إجازة",
    image: "/staff/inventory-hossam.jpg",
    avatarColor: "bg-stone-700",
    responsibilities: "استلام قطع الغيار ومستلزمات التعبئة والتنسيق مع المشتريات.",
    employeeCode: "WZ-INV-04",
  },
];

export const categoryConfig: Record<
  StaffMember["category"],
  {
    label: string;
    badgeBg: string;
    badgeBorder: string;
    headerGradient: string;
    icon: typeof ChefHat;
  }
> = {
  kitchen: {
    label: "المطبخ والحلواني",
    badgeBg: "bg-rose-500/10 text-rose-800 dark:text-rose-300",
    badgeBorder: "border-rose-300 dark:border-rose-800/40",
    headerGradient: "from-[#4a101d] via-[#2d0e14] to-[#1c080d]",
    icon: ChefHat,
  },
  management: {
    label: "الإدارة والإشراف",
    badgeBg: "bg-amber-500/10 text-amber-900 dark:text-amber-200",
    badgeBorder: "border-amber-300 dark:border-amber-800/40",
    headerGradient: "from-[#2e1d13] via-[#1a100a] to-[#0d0805]",
    icon: ShieldCheck,
  },
  cashier: {
    label: "كاشير ومبيعات",
    badgeBg: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    badgeBorder: "border-emerald-300 dark:border-emerald-800/40",
    headerGradient: "from-[#0d3326] via-[#092219] to-[#04120d]",
    icon: CreditCard,
  },
  tech: {
    label: "صيانة ودعم فني",
    badgeBg: "bg-blue-500/10 text-blue-800 dark:text-blue-300",
    badgeBorder: "border-blue-300 dark:border-blue-800/40",
    headerGradient: "from-[#102a45] via-[#0b1d30] to-[#06101c]",
    icon: Wrench,
  },
  inventory: {
    label: "مخزون وتجهيز",
    badgeBg: "bg-stone-500/10 text-stone-800 dark:text-stone-300",
    badgeBorder: "border-stone-300 dark:border-stone-700",
    headerGradient: "from-[#332b25] via-[#241e1a] to-[#14110e]",
    icon: Briefcase,
  },
};

function BranchStaffPage() {
  const { user } = useSession();
  const branch = branches.find((b) => b.id === user?.branchId) ?? branches[0]!;

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
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
    return defaultStaff;
  });

  const [activeTab, setActiveTab] = useState<"all" | "management" | "cashier" | "kitchen" | "tech" | "inventory">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New staff form state
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    category: "management" as StaffMember["category"],
    phone: "",
    email: "",
    shift: "وردية صباحية (08:00 ص - 04:00 م)",
    responsibilities: "",
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim()) return;

    const item: StaffMember = {
      id: `st-${Date.now()}`,
      name: newStaff.name.trim(),
      role: newStaff.role.trim() || "عضو طاقم",
      category: newStaff.category,
      phone: newStaff.phone.trim() || branch.phone,
      email: newStaff.email.trim(),
      shift: newStaff.shift,
      status: "على رأس العمل",
      avatarColor: "bg-brand-ink",
      responsibilities: newStaff.responsibilities.trim() || "مهام تشغيلية وخدمية بالفرع.",
      employeeCode: `WZ-${newStaff.category.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
    };

    const next = [item, ...staffList];
    setStaffList(next);
    localStorage.setItem(`wazeer-branch-staff-v4-${branch.id}`, JSON.stringify(next));
    setAddModalOpen(false);
    setNewStaff({
      name: "",
      role: "",
      category: "management",
      phone: "",
      email: "",
      shift: "وردية صباحية (08:00 ص - 04:00 م)",
      responsibilities: "",
    });
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchTab = activeTab === "all" || s.category === activeTab;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [staffList, activeTab, searchQuery]);

  // Counts
  const onDutyCount = staffList.filter((s) => s.status === "على رأس العمل").length;
  const techCount = staffList.filter((s) => s.category === "tech").length;
  const kitchenCount = staffList.filter((s) => s.category === "kitchen").length;

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-xl sm:text-2xl font-bold text-brand-ink">
              طاقم عمل {branch.name}
            </span>
            <Badge variant="outline" className="text-xs font-bold bg-brand-green/10 text-brand-green border-transparent">
              {staffList.length} أعضاء
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
            <span>مدير الفرع: <strong className="text-foreground">{branch.manager}</strong></span>
            <span>·</span>
            <span>{branch.address}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setAddModalOpen(true)} className="gap-1.5 text-xs font-bold">
            <UserPlus className="h-4 w-4" />
            <span>إضافة عضو جديد للطاقم</span>
          </Button>
        </div>
      </div>

      {/* Key Stats Row */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <Stat label="إجمالي الطاقم" value={String(staffList.length)} tone="navy" icon={UsersRound} note="مسجلون بهذا الفرع" />
        <Stat label="على رأس العمل الآن" value={String(onDutyCount)} tone="forest" icon={CheckCircle2} note="متاحون للتواصل الفوري" />
        <Stat label="المطبخ والحلواني" value={String(kitchenCount)} tone="crimson" icon={ShieldCheck} note="الشيف وفريق التجهيز" />
        <Stat label="فنيو الصيانة المسندون" value={String(techCount)} tone="amber" icon={Wrench} note="دعم ميداني وشبكات" />
      </section>

      {/* Controls & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-surface border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              activeTab === "all" ? "bg-card text-brand-ink shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            الكل ({staffList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kitchen")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              activeTab === "kitchen" ? "bg-card text-brand-ink shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            المطبخ والحلواني ({kitchenCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("management")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              activeTab === "management" ? "bg-card text-brand-ink shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            الإدارة والمشرفون
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cashier")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              activeTab === "cashier" ? "bg-card text-brand-ink shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            الكاشير ونقاط البيع
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tech")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              activeTab === "tech" ? "bg-card text-brand-ink shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            فنيو الصيانة ({techCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              activeTab === "inventory" ? "bg-card text-brand-ink shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            المخزون والتجهيز
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو التخصص..."
            className="h-9 pr-9 text-xs"
          />
        </div>
      </div>

      {/* Staff Grid Cards */}
      {filteredStaff.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <UsersRound className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-base font-bold">لا يوجد أفراد يطابقون خيارات البحث</p>
          <p className="mt-1 text-xs">جرب البحث بكلمات أخرى أو اختر تبويباً مختلفاً.</p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((staff) => {
            const cat = categoryConfig[staff.category] || categoryConfig.management;
            const CatIcon = cat.icon;
            const empCode = staff.employeeCode || `WZ-${staff.id.toUpperCase().replace("ST-", "0")}`;

            return (
              <div
                key={staff.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-copper/70 hover:shadow-xl"
              >
                {/* Lanyard Punch Hole Slot Effect at Top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <div className="h-2 w-12 rounded-full bg-black/40 border border-white/20 shadow-inner flex items-center justify-center backdrop-blur-xs">
                    <div className="h-0.5 w-7 rounded-full bg-black/80" />
                  </div>
                </div>

                {/* ID Card Top Header Strip */}
                <div className={cn("relative overflow-hidden px-4 pt-5 pb-3 text-white bg-gradient-to-r", cat.headerGradient)}>
                  {/* Subtle Watermark emblem in header */}
                  <div className="absolute -left-3 -bottom-3 opacity-15 pointer-events-none">
                    <img src="/wazeer-emblem.png" alt="" className="h-20 w-20 object-contain invert" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    {/* Logo & Company Title */}
                    <div className="flex items-center gap-2">
                      <img src="/wazeer-emblem.png" alt="Wazeer" className="h-6 w-6 object-contain drop-shadow" />
                      <div className="leading-tight">
                        <span className="font-display text-xs font-black tracking-wide text-amber-200">حلويات وزير الحلو</span>
                        <span className="block text-[8px] font-sans uppercase tracking-widest text-amber-100/70">
                          Staff Identity Card
                        </span>
                      </div>
                    </div>

                    {/* RFID Wave & Code */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 rounded border border-white/20 bg-black/35 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-200 shadow-2xs">
                        <Wifi className="h-2.5 w-2.5 rotate-90 text-amber-300" />
                        <span>{empCode}</span>
                      </div>
                      <span className="mt-0.5 text-[8px] text-white/70 font-medium">{branch.name}</span>
                    </div>
                  </div>
                </div>

                {/* Gold Foil Accent Ribbon */}
                <div className="h-[2.5px] bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 shadow-xs" />

                {/* ID Card Body */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-card via-card to-amber-500/[0.02]">
                  {/* Portrait & Core Data */}
                  <div className="flex items-start gap-3.5">
                    {/* Framed Photo with Chip & Status */}
                    <div className="relative shrink-0">
                      <div className="relative h-20 w-20 sm:h-22 sm:w-22 overflow-hidden rounded-xl border-2 border-brand-copper/60 shadow-md ring-2 ring-card bg-surface">
                        {staff.image ? (
                          <img
                            src={staff.image}
                            alt={staff.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-foreground font-black text-xl bg-muted">
                            {staff.name[0]}
                          </div>
                        )}
                      </div>

                      {/* Smartcard EMV Gold Contact Chip */}
                      <div
                        className="absolute -bottom-1 -left-1 h-5 w-7 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px] shadow-sm"
                        title="Smart Card Chip"
                      >
                        <div className="h-full w-full rounded-[2px] bg-amber-300 grid grid-cols-2 grid-rows-2 gap-[1px] p-[2px] border border-amber-600/40">
                          <div className="bg-amber-400/90 rounded-[1px]" />
                          <div className="bg-amber-400/90 rounded-[1px]" />
                          <div className="bg-amber-400/90 rounded-[1px]" />
                          <div className="bg-amber-400/90 rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-display text-base sm:text-lg font-black text-foreground truncate">
                          {staff.name}
                        </h3>
                        {/* Status Pill */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 shadow-2xs border",
                            staff.status === "على رأس العمل" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
                            staff.status === "في استراحة" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
                            staff.status === "إجازة" && "bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              staff.status === "على رأس العمل" && "bg-emerald-500 animate-pulse",
                              staff.status === "في استراحة" && "bg-amber-500",
                              staff.status === "إجازة" && "bg-stone-400"
                            )}
                          />
                          {staff.status}
                        </span>
                      </div>

                      {/* Role Title Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border", cat.badgeBg, cat.badgeBorder)}>
                          <CatIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{staff.role}</span>
                        </span>
                      </div>

                      {/* Shift info */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                        <Clock className="h-3.5 w-3.5 text-brand-copper shrink-0" />
                        <span className="text-[11px] font-medium truncate">{staff.shift}</span>
                      </div>
                    </div>
                  </div>

                  {/* Responsibilities snippet */}
                  <p className="line-clamp-2 rounded-lg bg-surface/70 px-2.5 py-1.5 text-[11px] leading-relaxed text-foreground/85 border border-border/50">
                    {staff.responsibilities}
                  </p>

                  {/* Authentic Barcode & QR Verification Band */}
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-border/80 bg-surface/40 px-3 py-1.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-[2px] h-5 opacity-80" aria-hidden="true">
                        {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1].map((w, idx) => (
                          <span key={idx} className="h-full bg-foreground/85 rounded-[0.5px]" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                      <span className="font-mono text-[8px] text-muted-foreground tracking-widest mt-0.5">
                        VERIFIED ID • {empCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground/80">
                      <QrCode className="h-6 w-6 text-foreground/60" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/70">
                    <a
                      href={`tel:${staff.phone}`}
                      dir="ltr"
                      className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-mono font-bold text-brand-ink hover:bg-card hover:border-brand-copper/50 transition-colors shadow-2xs"
                    >
                      <Phone className="h-3.5 w-3.5 text-brand-copper" />
                      <span>{staff.phone}</span>
                    </a>

                    {staff.category === "tech" ? (
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs font-bold gap-1 px-3 hover:border-brand-copper/50">
                        <Link to="/branch-tickets">
                          <Wrench className="h-3.5 w-3.5 text-brand-ink" />
                          <span>بلاغ</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs font-bold gap-1 px-3 hover:border-brand-copper/50">
                        <Link to="/branch-chat">
                          <MessageSquare className="h-3.5 w-3.5 text-brand-ink" />
                          <span>محادثة</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Staff Member Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-xl p-4 sm:p-6" dir="rtl">
          <form onSubmit={handleAddStaff}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                <UserPlus className="h-5 w-5 text-brand-ink" />
                إضافة عضو جديد لطاقم الفرع
              </DialogTitle>
              <DialogDescription className="text-xs">
                تسجيل بيانات موظف أو مشرف جديد تابع لـ {branch.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">اسم الموظف / العضو</label>
                <Input
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="الاسم ثلاثي"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">المسمى الوظيفي</label>
                  <Input
                    required
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    placeholder="مثال: كاشير أول"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">القسم / التصنيف</label>
                  <Select
                    value={newStaff.category}
                    onValueChange={(v) => setNewStaff({ ...newStaff, category: v as StaffMember["category"] })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="management">إدارة وإشراف</SelectItem>
                      <SelectItem value="kitchen">المطبخ والحلواني</SelectItem>
                      <SelectItem value="cashier">كاشير ومبيعات</SelectItem>
                      <SelectItem value="inventory">مخزون وتجهيز</SelectItem>
                      <SelectItem value="tech">صيانة ودعم فني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">رقم الهاتف</label>
                  <Input
                    required
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="0100 000 0000"
                    dir="ltr"
                    className="h-9 text-xs text-left font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">البريد الإلكتروني (اختياري)</label>
                  <Input
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="email@wazeer.demo"
                    dir="ltr"
                    className="h-9 text-xs text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">مواعيد الوردية</label>
                <Input
                  value={newStaff.shift}
                  onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                  placeholder="مثال: وردية صباحية (08:00 ص - 04:00 م)"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">المسؤوليات الرئيسية</label>
                <Input
                  value={newStaff.responsibilities}
                  onChange={(e) => setNewStaff({ ...newStaff, responsibilities: e.target.value })}
                  placeholder="أهم المهام المسندة إليه..."
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start pt-2">
              <Button type="submit" className="bg-brand-ink text-primary-foreground text-xs font-bold flex-1 sm:flex-initial">
                <Plus className="h-4 w-4" />
                إضافة للطاقم
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                className="text-xs flex-1 sm:flex-initial"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
