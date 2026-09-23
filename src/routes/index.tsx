import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Boxes,
  Building2,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock3,
  FileDown,
  Headphones,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareText,
  PackageCheck,
  Plus,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Timer,
  UserCog,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import wazeerLogo from "@/assets/wazeer-emblem.png.asset.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "وزير الحلو | لوحة المساعدة الذكية" },
      {
        name: "description",
        content:
          "نموذج عربي لإدارة بلاغات الصيانة والفنيين والمشتريات ومستويات الخدمة.",
      },
      { property: "og:title", content: "وزير الحلو | لوحة المساعدة الذكية" },
      {
        property: "og:description",
        content: "إدارة بلاغات الفروع، متابعة الفنيين، واعتماد المشتريات من واجهة عربية واحدة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpdeskHome,
});

const navItems = [
  { label: "الرئيسية", icon: LayoutDashboard, active: true },
  { label: "البلاغات", icon: LifeBuoy },
  { label: "الفروع", icon: Building2 },
  { label: "الفنيون", icon: Wrench },
  { label: "المشتريات", icon: Boxes },
  { label: "التقارير", icon: FileDown },
  { label: "الإعدادات", icon: Settings },
];

const summaryStats = [
  {
    label: "إجمالي البلاغات",
    value: "452",
    note: "48 جديد اليوم",
    icon: LifeBuoy,
    tone: "bg-brand-ink text-primary-foreground",
  },
  {
    label: "قيد التنفيذ",
    value: "86",
    note: "23 فني نشط",
    icon: Timer,
    tone: "bg-info text-primary-foreground",
  },
  {
    label: "بانتظار شراء",
    value: "17",
    note: "5 عاجلة",
    icon: PackageCheck,
    tone: "bg-warning text-secondary-foreground",
  },
  {
    label: "تحذير SLA",
    value: "12",
    note: "3 حرجة",
    icon: AlertTriangle,
    tone: "bg-brand-red text-primary-foreground",
  },
];

const tickets = [
  {
    id: "HD-2026-000452",
    title: "كاميرا 08 لا تعرض صورة",
    branch: "فرع 04 - التجمع",
    category: "CCTV",
    priority: "عالية",
    status: "قيد المراجعة",
    sla: "02:45",
    statusTone: "border-warning bg-warning/15 text-secondary-foreground",
  },
  {
    id: "HD-2026-000451",
    title: "توقف نقطة شبكة في الكاشير",
    branch: "فرع 12 - مدينة نصر",
    category: "Network",
    priority: "حرجة",
    status: "مُسند لفني",
    sla: "00:36",
    statusTone: "border-danger bg-danger/15 text-foreground",
  },
  {
    id: "HD-2026-000449",
    title: "طلب قارئ دخول بديل",
    branch: "فرع 02 - المعادي",
    category: "Access Control",
    priority: "متوسطة",
    status: "بانتظار شراء",
    sla: "18:20",
    statusTone: "border-info bg-info/15 text-foreground",
  },
];

const workflow = [
  "بلاغ جديد",
  "مراجعة الإدارة",
  "إسناد فني",
  "تنفيذ العمل",
  "طلب شراء",
  "مراجعة الحل",
  "تأكيد الفرع",
  "إغلاق",
];

const technicians = [
  { name: "أحمد سامي", skill: "CCTV", load: "4 بلاغات", state: "متاح", progress: "w-7/12" },
  { name: "محمود عادل", skill: "Network", load: "6 بلاغات", state: "مشغول", progress: "w-10/12" },
  { name: "سارة وليد", skill: "IT Support", load: "2 بلاغات", state: "متاح", progress: "w-4/12" },
];

const timeline = [
  { time: "09:20", title: "تم إنشاء البلاغ", desc: "فرع 04 أرسل بلاغ كاميرا مع مرفق صورة." },
  { time: "09:35", title: "مراجعة الإدارة", desc: "تم تأكيد الأولوية وربط الأصل CCTV-CAM-008." },
  { time: "09:40", title: "إسناد الفني", desc: "اقتراح أحمد سامي بناءً على المهارة والتفرغ." },
  { time: "10:10", title: "بدء العمل", desc: "الفني قبل البلاغ وبدأ المؤقت الميداني." },
];

const permissions = ["tickets.view", "tickets.assign", "purchase.approve", "reports.export"];

const trendBars = ["h-14", "h-20", "h-12", "h-28", "h-24", "h-32", "h-18", "h-36"];

function HelpdeskHome() {
  return (
    <main className="min-h-screen wazeer-page-shell text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden border-l border-sidebar-border wazeer-sidebar-gradient text-sidebar-foreground lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-card p-1 shadow-sm">
              <img src={wazeerLogo.url} alt="وزير الحلو" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <p className="text-base font-bold">وزير الحلو</p>
              <p className="text-xs text-sidebar-foreground/70">نظام الدعم والصيانة</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5" aria-label="القائمة الرئيسية">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={`#${item.label}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    item.active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-md bg-sidebar-accent p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" />
                صلاحيات الإدارة
              </div>
              <p className="mt-2 text-xs leading-6 text-sidebar-foreground/72">
                عرض كامل للبلاغات، الإسناد، اعتماد المشتريات، التقارير، وسجل التدقيق.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-card p-1 shadow-sm">
                  <img src={wazeerLogo.url} alt="وزير الحلو" className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <p className="font-bold">وزير الحلو</p>
                  <p className="text-xs text-muted-foreground">مركز المساعدة</p>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">لوحة تحكم عربية موحدة</p>
                <h1 className="mt-1 text-2xl font-bold tracking-normal text-foreground md:text-3xl">
                  إدارة البلاغات والصيانة الميدانية
                </h1>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-10 pr-10" placeholder="بحث برقم البلاغ أو الفرع أو الفني" />
                </div>
                <Button size="icon" variant="outline" aria-label="الإشعارات">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button>
                  <Plus className="h-4 w-4" />
                  بلاغ جديد
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-10 px-4 py-6 lg:px-8">
            <section id="الرئيسية" className="wazeer-subtle-grid rounded-md border border-border bg-card p-4 shadow-sm md:p-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-brand-green bg-accent text-accent-foreground" variant="outline">
                      عربي RTL
                    </Badge>
                    <Badge className="border-brand-red bg-danger/10 text-foreground" variant="outline">
                      دورة بلاغ كاملة
                    </Badge>
                    <Badge className="border-brand-gold bg-warning/20 text-secondary-foreground" variant="outline">
                      SLA مباشر
                    </Badge>
                  </div>
                  <div>
                    <h2 className="max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
                      مركز تشغيل واحد للفرع، الإدارة، والفني — من إنشاء البلاغ حتى الإغلاق.
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                      الواجهة الحالية تبدأ بنواة عملية: متابعة البلاغات، مراجعة الإدارة، إسناد الفنيين، طلبات الشراء، مؤقت العمل، وسجل الأحداث.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button>
                      <Headphones className="h-4 w-4" />
                      فتح مركز التحكم
                    </Button>
                    <Button variant="outline">
                      <ClipboardCheck className="h-4 w-4" />
                      مراجعة بلاغ عاجل
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">البلاغ الحالي</p>
                      <p className="mt-1 font-bold">HD-2026-000452</p>
                    </div>
                    <Badge className="border-danger bg-danger/15 text-foreground" variant="outline">
                      أولوية عالية
                    </Badge>
                  </div>
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">المشكلة</p>
                      <p className="mt-1 font-semibold">كاميرا 08 توقفت عن عرض الفيديو</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <InfoTile label="الفرع" value="فرع 04" />
                      <InfoTile label="التصنيف" value="CCTV" />
                      <InfoTile label="الأصل" value="CCTV-CAM-008" />
                      <InfoTile label="المتبقي" value="02:45" />
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                        <span>مستوى الخدمة</span>
                        <span>68%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-8/12 rounded-full bg-brand-red" />
                      </div>
                    </div>
                    <Button className="w-full">
                      إسناد فني الآن
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="مؤشرات الأداء">
              {summaryStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article key={stat.label} className="rounded-md border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="mt-3 text-3xl font-bold">{stat.value}</p>
                      </div>
                      <span className={cn("rounded-md p-3", stat.tone)}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-muted-foreground">{stat.note}</p>
                  </article>
                );
              })}
            </section>

            <section id="البلاغات" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div>
                <SectionTitle
                  eyebrow="تشغيل مباشر"
                  title="قائمة البلاغات النشطة"
                  description="عرض سريع للحالة، الأولوية، الفرع، ومؤقت SLA مع إجراءات الإدارة."
                />
                <div className="mt-4 overflow-hidden rounded-md border border-border bg-card shadow-sm">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-border bg-surface px-4 py-3 text-xs font-bold text-muted-foreground md:grid-cols-[1.2fr_0.8fr_0.7fr_0.6fr_auto]">
                    <span>البلاغ</span>
                    <span className="hidden md:block">الفرع</span>
                    <span className="hidden md:block">التصنيف</span>
                    <span>المتبقي</span>
                    <span>الحالة</span>
                  </div>
                  {tickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.7fr_0.6fr_auto] md:items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-brand-ink">{ticket.id}</p>
                        <p className="mt-1 truncate font-bold">{ticket.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground md:hidden">{ticket.branch}</p>
                      </div>
                      <p className="hidden text-sm text-muted-foreground md:block">{ticket.branch}</p>
                      <p className="hidden text-sm font-medium md:block">{ticket.category}</p>
                      <p className="font-mono text-sm font-bold text-brand-red">{ticket.sla}</p>
                      <Badge className={ticket.statusTone} variant="outline">
                        {ticket.status}
                      </Badge>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-gold" />
                  <h3 className="text-lg font-bold">اقتراح ذكي للإسناد</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  الترتيب حسب المهارة، الحمل الحالي، القرب من الفرع، وعدد البلاغات الحرجة.
                </p>
                <div className="mt-5 space-y-4">
                  {technicians.map((tech) => (
                    <div key={tech.name} className="rounded-md border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">{tech.name}</p>
                          <p className="text-xs text-muted-foreground">{tech.skill} · {tech.load}</p>
                        </div>
                        <Badge className="border-brand-green bg-accent text-accent-foreground" variant="outline">
                          {tech.state}
                        </Badge>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full bg-brand-green", tech.progress)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-md border border-border bg-card p-5 shadow-sm">
              <SectionTitle
                eyebrow="سير العمل"
                title="دورة البلاغ من البداية للنهاية"
                description="المسار المعتمد في الخطة: فرع، إدارة، فني، مشتريات عند الحاجة، مراجعة، ثم تأكيد الإغلاق."
              />
              <div className="mt-6 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
                {workflow.map((step, index) => (
                  <div key={step} className="relative rounded-md border border-border bg-surface p-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <p className="mt-4 text-sm font-bold leading-6">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="الفروع" className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
              <div>
                <SectionTitle
                  eyebrow="لوحة الفرع"
                  title="إنشاء بلاغ جديد"
                  description="حقول البلاغ الأساسية كما وردت في الخطة، جاهزة لتجربة عربية فقط الآن."
                />
                <div className="mt-4 rounded-md border border-border bg-card p-5 shadow-sm">
                  <div className="space-y-4">
                    <Field label="رقم البلاغ التلقائي">
                      <Input value="HD-2026-000453" readOnly />
                    </Field>
                    <Field label="الفرع">
                      <Select defaultValue="branch-04">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="branch-04">فرع 04 - التجمع</SelectItem>
                          <SelectItem value="branch-12">فرع 12 - مدينة نصر</SelectItem>
                          <SelectItem value="branch-02">فرع 02 - المعادي</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="التصنيف">
                      <Select defaultValue="cctv">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cctv">كاميرات مراقبة</SelectItem>
                          <SelectItem value="network">شبكات</SelectItem>
                          <SelectItem value="access">تحكم دخول</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="الموضوع">
                      <Input placeholder="مثال: كاميرا 08 لا تعمل" />
                    </Field>
                    <Button className="w-full">
                      <Plus className="h-4 w-4" />
                      إرسال البلاغ للإدارة
                    </Button>
                  </div>
                </div>
              </div>

              <div id="الفنيون">
                <SectionTitle
                  eyebrow="مساحة الفني"
                  title="تنفيذ العمل الميداني"
                  description="قبول البلاغ، بدء العمل، الإيقاف، إضافة تحديث، طلب قطعة، ثم إرسال للمراجعة."
                />
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <article className="rounded-md border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">المؤقت النشط</p>
                        <p className="mt-2 text-4xl font-bold">02:25</p>
                      </div>
                      <Timer className="h-10 w-10 text-brand-red" />
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <Button size="sm">بدء</Button>
                      <Button size="sm" variant="secondary">إيقاف</Button>
                      <Button size="sm" variant="outline">استكمال</Button>
                    </div>
                  </article>
                  <article className="rounded-md border border-border bg-card p-5 shadow-sm">
                    <p className="font-bold">إجراءات الفني السريعة</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm"><Camera className="h-4 w-4" />صورة</Button>
                      <Button variant="outline" size="sm"><MessageSquareText className="h-4 w-4" />تحديث</Button>
                      <Button variant="outline" size="sm"><Boxes className="h-4 w-4" />طلب قطعة</Button>
                      <Button variant="outline" size="sm"><CheckCircle2 className="h-4 w-4" />إنهاء</Button>
                    </div>
                  </article>
                  <article className="rounded-md border border-border bg-card p-5 shadow-sm md:col-span-2">
                    <p className="font-bold">تحديث فني</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      تم فحص مصدر الكهرباء وكابل الشبكة. يوجد احتمال احتياج محول طاقة بديل، وتم رفع صورة للحالة الحالية.
                    </p>
                  </article>
                </div>
              </div>
            </section>

            <section id="المشتريات" className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <SectionTitle
                  eyebrow="طلبات الشراء"
                  title="مسار القطع والموافقات"
                  description="الفني يطلب، النظام يرسل للفريق، الإدارة تراجع، ثم يتم الاستلام والصرف على البلاغ."
                />
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <PurchaseStep icon={Boxes} title="طلب قطعة" desc="محول طاقة 12V للكاميرا" />
                  <PurchaseStep icon={UserCog} title="اعتماد" desc="أقل من 5,000 جنيه مباشرة" />
                  <PurchaseStep icon={PackageCheck} title="صرف للفني" desc="ربط التكلفة بالبلاغ" />
                </div>
              </div>
              <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                <p className="font-bold">تكلفة البلاغ</p>
                <div className="mt-5 space-y-3 text-sm">
                  <CostLine label="زمن العمل" value="2س 25د" />
                  <CostLine label="مواد مستخدمة" value="350 ج.م" />
                  <CostLine label="شراء" value="420 ج.م" />
                  <div className="border-t border-border pt-3">
                    <CostLine label="الإجمالي" value="770 ج.م" strong />
                  </div>
                </div>
              </div>
            </section>

            <section id="التقارير" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div>
                <SectionTitle
                  eyebrow="تقارير وتحليل"
                  title="اتجاه البلاغات وأداء SLA"
                  description="تقارير حسب التاريخ، الفرع، التصنيف، الفني، التكلفة، والالتزام بمستوى الخدمة."
                />
                <div className="mt-4 rounded-md border border-border bg-card p-5 shadow-sm">
                  <div className="flex h-48 items-end justify-between gap-3 border-b border-border px-2 pb-4">
                    {trendBars.map((height, index) => (
                      <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-2">
                        <div className={cn("w-full rounded-t-md bg-brand-ink", height)} />
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline"><FileDown className="h-4 w-4" />PDF</Button>
                    <Button size="sm" variant="outline"><FileDown className="h-4 w-4" />Excel</Button>
                    <Button size="sm" variant="outline"><FileDown className="h-4 w-4" />CSV</Button>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                <p className="font-bold">سجل الأحداث</p>
                <div className="mt-5 space-y-4">
                  {timeline.map((item) => (
                    <div key={`${item.time}-${item.title}`} className="grid grid-cols-[4.5rem_1fr] gap-3">
                      <span className="font-mono text-sm font-bold text-brand-ink">{item.time}</span>
                      <div className="border-r-2 border-brand-green pr-3">
                        <p className="font-bold">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="الإعدادات" className="grid gap-6 xl:grid-cols-3">
              <article className="rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5 text-brand-ink" />
                  <h3 className="font-bold">الصلاحيات</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">{permission}</Badge>
                  ))}
                </div>
              </article>
              <article className="rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-brand-green" />
                  <h3 className="font-bold">أصول QR</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  مسح أصل، عرض سجل الصيانة، ثم إنشاء بلاغ مرتبط بنفس المعدة.
                </p>
              </article>
              <article className="rounded-md border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-gold" />
                  <h3 className="font-bold">مساعد ذكي</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  اقتراح التصنيف، الأولوية، البلاغات المتشابهة، ومقالات قاعدة المعرفة حسب الصلاحيات.
                </p>
              </article>
            </section>
          </div>

          <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-border bg-background/95 px-2 py-2 backdrop-blur lg:hidden" aria-label="قائمة الهاتف">
            {[
              { label: "الرئيسية", icon: LayoutDashboard },
              { label: "بلاغات", icon: LifeBuoy },
              { label: "إنشاء", icon: Plus },
              { label: "محادثة", icon: MessageSquareText },
              { label: "ملفي", icon: UserCog },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} href="#الرئيسية" className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-brand-red">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-normal">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}

function PurchaseStep({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <article className="rounded-md border border-border bg-card p-5 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-flow text-brand-ink">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
    </article>
  );
}

function CostLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", strong && "text-lg font-bold")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}