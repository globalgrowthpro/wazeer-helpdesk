import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  FileDown,
  Headphones,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Menu,
  MessageSquareText,
  PackageCheck,
  Plus,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Timer,
  UserCog,
  UsersRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import wazeerLogo from "@/assets/wazeer-emblem.png.asset.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "وزير الحلو | لوحة العمليات" },
      { name: "description", content: "لوحة عربية لإدارة بلاغات الصيانة والفنيين والمشتريات ومستويات الخدمة." },
      { property: "og:title", content: "وزير الحلو | لوحة العمليات" },
      { property: "og:description", content: "متابعة البلاغات والفنيين والمشتريات من لوحة تشغيل عربية موحدة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpdeskHome,
});

const navGroups = [
  {
    label: "العمليات",
    items: [
      { label: "لوحة التحكم", icon: LayoutDashboard, href: "#الرئيسية", active: true },
      { label: "البلاغات", icon: LifeBuoy, href: "#البلاغات" },
      { label: "المهام", icon: CheckCircle2, href: "#الفنيون" },
      { label: "الخدمة الميدانية", icon: MapPin, href: "#الفنيون" },
      { label: "المشتريات", icon: ShoppingCart, href: "#المشتريات" },
      { label: "التقارير", icon: BarChart3, href: "#التقارير" },
    ],
  },
  {
    label: "الدليل والفريق",
    items: [
      { label: "الفروع", icon: Building2, href: "#الفروع" },
      { label: "الفنيون", icon: UsersRound, href: "#الفنيون" },
      { label: "الأصول", icon: QrCode, href: "#الإعدادات" },
      { label: "الإعدادات", icon: Settings, href: "#الإعدادات" },
    ],
  },
];

const metrics: Array<{ label: string; value: string; note: string; icon: LucideIcon; card: string; iconTone: string; valueTone: string }> = [
  { label: "إجمالي البلاغات", value: "452", note: "+12.4% عن الأسبوع الماضي", icon: LifeBuoy, card: "kpi-blue", iconTone: "bg-kpi-blue", valueTone: "text-kpi-blue" },
  { label: "البلاغات المفتوحة", value: "46", note: "نشطة الآن", icon: Clock3, card: "kpi-gold", iconTone: "bg-kpi-orange", valueTone: "text-kpi-orange" },
  { label: "بلاغات حرجة", value: "3", note: "تحتاج اهتماماً فورياً", icon: AlertTriangle, card: "kpi-red", iconTone: "bg-brand-red", valueTone: "text-brand-red" },
  { label: "تم حلها اليوم", value: "295", note: "بلاغاً مغلقاً", icon: CheckCircle2, card: "kpi-green", iconTone: "bg-brand-green", valueTone: "text-brand-green" },
  { label: "طلبات الشراء", value: "17", note: "5 بانتظار الاعتماد", icon: ShoppingCart, card: "kpi-cyan", iconTone: "bg-kpi-cyan", valueTone: "text-kpi-cyan" },
  { label: "الالتزام بـ SLA", value: "93%", note: "420 من 452 ملتزم", icon: BarChart3, card: "kpi-violet", iconTone: "bg-kpi-violet", valueTone: "text-kpi-violet" },
  { label: "رضا الفروع", value: "4.8/5", note: "مؤشر رضا مرتفع", icon: Sparkles, card: "kpi-gold", iconTone: "bg-kpi-orange", valueTone: "text-kpi-orange" },
  { label: "الفنيون النشطون", value: "23", note: "من أصل 28 فنياً", icon: UsersRound, card: "kpi-cyan", iconTone: "bg-kpi-cyan", valueTone: "text-kpi-cyan" },
  { label: "زيارات اليوم", value: "8", note: "3 قيد التنفيذ", icon: MapPin, card: "kpi-violet", iconTone: "bg-kpi-violet", valueTone: "text-kpi-violet" },
  { label: "تكلفة الشهر", value: "48.2K", note: "جنيه مصري", icon: CircleDollarSign, card: "kpi-green", iconTone: "bg-brand-green", valueTone: "text-brand-green" },
];

const tickets = [
  { id: "HD-2026-000452", title: "كاميرا 08 لا تعرض صورة", branch: "فرع التجمع", category: "CCTV", sla: "02:45", status: "قيد المراجعة", tone: "bg-warning/15 text-foreground border-warning/40" },
  { id: "HD-2026-000451", title: "توقف نقطة شبكة في الكاشير", branch: "فرع مدينة نصر", category: "Network", sla: "00:36", status: "حرج", tone: "bg-danger/10 text-danger border-danger/30" },
  { id: "HD-2026-000449", title: "طلب قارئ دخول بديل", branch: "فرع المعادي", category: "Access Control", sla: "18:20", status: "بانتظار شراء", tone: "bg-info/10 text-info border-info/30" },
];

const technicians = [
  { name: "أحمد سامي", skill: "CCTV", load: "4 بلاغات", progress: "w-7/12" },
  { name: "محمود عادل", skill: "Network", load: "6 بلاغات", progress: "w-10/12" },
  { name: "سارة وليد", skill: "IT Support", load: "2 بلاغ", progress: "w-4/12" },
];

const timeline = [
  { time: "09:20", title: "إنشاء البلاغ", desc: "أرسل فرع التجمع بلاغ كاميرا جديداً." },
  { time: "09:35", title: "مراجعة الإدارة", desc: "تم تأكيد الأولوية وربط الأصل." },
  { time: "09:40", title: "إسناد الفني", desc: "تم ترشيح أحمد سامي للمهمة." },
];

function HelpdeskHome() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background p-0 lg:p-5">
      <div className="dashboard-shadow mx-auto flex min-h-screen max-w-[1600px] overflow-hidden border-border bg-card lg:min-h-[calc(100vh-2.5rem)] lg:rounded-lg lg:border">
        <Sidebar className={cn("fixed inset-y-0 right-0 z-50 transition-transform lg:static lg:translate-x-0", mobileMenu ? "translate-x-0" : "translate-x-full")} close={() => setMobileMenu(false)} />
        {mobileMenu && <button aria-label="إغلاق القائمة" className="fixed inset-0 z-40 bg-foreground/35 lg:hidden" onClick={() => setMobileMenu(false)} />}

        <main className="min-w-0 flex-1 overflow-x-hidden bg-background">
          <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
            <div className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 lg:px-6">
              <Button className="lg:hidden" size="icon" variant="outline" onClick={() => setMobileMenu(true)} aria-label="فتح القائمة"><Menu className="h-5 w-5" /></Button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold md:text-xl">لوحة العمليات</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">الخميس، 24 سبتمبر 2026</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="relative hidden w-64 md:block">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-9 bg-background pr-9" placeholder="بحث سريع..." />
                </div>
                <Button size="icon" variant="outline" aria-label="الإشعارات" className="relative"><Bell className="h-4 w-4" /><span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-red" /></Button>
                <Button size="sm"><Plus className="h-4 w-4" />بلاغ جديد</Button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-4 lg:p-6">
            <section id="الرئيسية" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="مؤشرات الأداء">
              {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,0.8fr)]">
              <ChartPanel />
              <StatusPanel />
            </section>

            <section id="البلاغات" className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]">
              <Panel title="البلاغات النشطة" action="عرض الكل">
                <div className="overflow-x-auto">
                  <div className="min-w-[680px]">
                    <div className="grid grid-cols-[1.4fr_.8fr_.7fr_.5fr_.65fr] gap-3 border-b border-border bg-surface px-5 py-3 text-xs font-bold text-muted-foreground">
                      <span>البلاغ</span><span>الفرع</span><span>التصنيف</span><span>المتبقي</span><span>الحالة</span>
                    </div>
                    {tickets.map((ticket) => (
                      <article key={ticket.id} className="grid grid-cols-[1.4fr_.8fr_.7fr_.5fr_.65fr] items-center gap-3 border-b border-border px-5 py-4 last:border-0 hover:bg-surface/70">
                        <div className="min-w-0"><p className="text-xs font-bold text-brand-ink">{ticket.id}</p><p className="mt-1 truncate text-sm font-semibold">{ticket.title}</p></div>
                        <span className="text-sm text-muted-foreground">{ticket.branch}</span><span className="text-sm">{ticket.category}</span><span className="font-mono text-sm font-bold text-brand-red">{ticket.sla}</span><Badge variant="outline" className={ticket.tone}>{ticket.status}</Badge>
                      </article>
                    ))}
                  </div>
                </div>
              </Panel>
              <Panel title="إشغال الفنيين" icon={UsersRound}>
                <div className="space-y-4 p-5">
                  {technicians.map((tech) => (
                    <div key={tech.name}>
                      <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{tech.name}</p><p className="text-xs text-muted-foreground">{tech.skill} · {tech.load}</p></div><span className="h-2 w-2 rounded-full bg-brand-green" /></div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full bg-brand-green", tech.progress)} /></div>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section id="الفروع" className="grid gap-4 xl:grid-cols-[minmax(18rem,.7fr)_minmax(0,1.3fr)]">
              <Panel title="إنشاء بلاغ جديد" icon={Plus}>
                <div className="space-y-4 p-5">
                  <Field label="الفرع"><Select defaultValue="branch-04"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="branch-04">فرع التجمع</SelectItem><SelectItem value="branch-12">فرع مدينة نصر</SelectItem><SelectItem value="branch-02">فرع المعادي</SelectItem></SelectContent></Select></Field>
                  <Field label="التصنيف"><Select defaultValue="cctv"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cctv">كاميرات مراقبة</SelectItem><SelectItem value="network">شبكات</SelectItem><SelectItem value="access">تحكم دخول</SelectItem></SelectContent></Select></Field>
                  <Field label="الموضوع"><Input placeholder="اكتب وصفاً مختصراً للمشكلة" /></Field>
                  <Button className="w-full"><Plus className="h-4 w-4" />إرسال البلاغ</Button>
                </div>
              </Panel>
              <Panel title="مساحة الفني" icon={Wrench}>
                <div id="الفنيون" className="grid gap-4 p-5 md:grid-cols-[.8fr_1.2fr]">
                  <div className="rounded-md border border-border bg-surface p-5"><p className="text-xs text-muted-foreground">المؤقت النشط</p><div className="mt-2 flex items-center justify-between"><p className="font-display text-4xl font-bold">02:25</p><Timer className="h-9 w-9 text-brand-red" /></div><div className="mt-5 grid grid-cols-3 gap-2"><Button size="sm">بدء</Button><Button size="sm" variant="secondary">إيقاف</Button><Button size="sm" variant="outline">إنهاء</Button></div></div>
                  <div className="rounded-md border border-border p-5"><p className="font-bold">آخر تحديث فني</p><p className="mt-2 text-sm leading-6 text-muted-foreground">تم فحص مصدر الكهرباء وكابل الشبكة. يوجد احتمال احتياج محول طاقة بديل، وتم رفع صورة للحالة الحالية.</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline"><MessageSquareText className="h-4 w-4" />إضافة تحديث</Button><Button size="sm" variant="outline"><Boxes className="h-4 w-4" />طلب قطعة</Button><Button size="sm" variant="outline"><CheckCircle2 className="h-4 w-4" />إرسال للمراجعة</Button></div></div>
                </div>
              </Panel>
            </section>

            <section id="المشتريات" className="grid gap-4 md:grid-cols-3">
              <ActionCard icon={Boxes} title="طلب قطعة" text="محول طاقة 12V للكاميرا" />
              <ActionCard icon={ShieldCheck} title="اعتماد الطلب" text="ضمن حد الاعتماد المباشر" />
              <ActionCard icon={PackageCheck} title="صرف للفني" text="ربط القطعة والتكلفة بالبلاغ" />
            </section>

            <section id="التقارير" className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <Panel title="ملخص التقارير" action="تصدير التقرير">
                <div className="grid gap-3 p-5 sm:grid-cols-3"><Info label="متوسط زمن الحل" value="3س 42د"/><Info label="الزيارات المكتملة" value="128"/><Info label="تكلفة القطع" value="48,200 ج.م"/></div>
              </Panel>
              <Panel title="آخر الأحداث" icon={CalendarDays}>
                <div className="space-y-4 p-5">{timeline.map((item) => <div key={item.time} className="grid grid-cols-[3rem_1fr] gap-3"><span className="font-mono text-xs font-bold text-brand-ink">{item.time}</span><div className="border-r-2 border-brand-green pr-3"><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.desc}</p></div></div>)}</div>
              </Panel>
            </section>

            <section id="الإعدادات" className="grid gap-4 md:grid-cols-3">
              <ActionCard icon={UsersRound} title="الصلاحيات" text="إدارة الأدوار وصلاحيات فرق التشغيل" />
              <ActionCard icon={QrCode} title="أصول QR" text="الوصول إلى سجل صيانة كل معدة" />
              <ActionCard icon={Sparkles} title="المساعد الذكي" text="اقتراح الأولوية والفني والتصنيف" />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ className, close }: { className?: string; close: () => void }) {
  return <aside className={cn("flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground", className)}>
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-sidebar-border p-5">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-card p-1"><img src={wazeerLogo.url} alt="وزير الحلو" className="max-h-full max-w-full object-contain" /></div>
      <div className="min-w-0"><p className="truncate font-display font-bold">وزير الحلو</p><p className="truncate text-xs text-sidebar-foreground/60">نظام الدعم والصيانة</p></div>
      <Button size="icon" variant="ghost" className="text-sidebar-foreground lg:hidden" onClick={close} aria-label="إغلاق القائمة"><X className="h-5 w-5" /></Button>
    </div>
    <div className="flex-1 overflow-y-auto px-3 py-5">{navGroups.map((group) => <div key={group.label} className="mb-7"><p className="px-3 pb-2 text-[11px] font-bold text-sidebar-foreground/45">{group.label}</p><nav className="space-y-1">{group.items.map((item) => { const Icon = item.icon; return <a key={item.label} href={item.href} onClick={close} className={cn("flex items-center gap-3 rounded-md border-r-2 border-transparent px-3 py-2.5 text-sm transition-colors", item.active ? "border-brand-gold bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}><Icon className="h-4 w-4 shrink-0"/><span>{item.label}</span></a>; })}</nav></div>)}</div>
    <div className="border-t border-sidebar-border p-4"><div className="flex items-center gap-3 rounded-md bg-sidebar-accent p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-brand-green text-primary-foreground">ح</div><div><p className="text-sm font-bold">حافظ رحيم</p><p className="text-xs text-sidebar-foreground/60">مدير النظام</p></div></div></div>
  </aside>;
}

function MetricCard({ label, value, note, icon: Icon, card, iconTone, valueTone }: (typeof metrics)[number]) {
  return <article className={cn("group flex min-h-32 flex-col justify-between rounded-lg border p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5", card)}><div className="flex items-start justify-between gap-3"><p className={cn("text-xs font-bold", valueTone)}>{label}</p><span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md text-primary-foreground shadow-sm", iconTone)}><Icon className="h-4 w-4"/></span></div><div><p className={cn("font-display text-2xl font-bold", valueTone)}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div></article>;
}

function ChartPanel() {
  return <Panel title="اتجاهات البلاغات" action="أسبوعي"><div className="px-5 pb-5"><div className="relative h-64 overflow-hidden border-b border-l border-border"><div className="absolute inset-0 grid grid-rows-4">{[1,2,3,4].map((n) => <div key={n} className="border-t border-dashed border-border" />)}</div><svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 260" preserveAspectRatio="none" aria-label="رسم اتجاهات البلاغات"><path d="M0 248 C90 230 145 205 220 145 S330 84 420 72 S560 35 635 58 S685 205 800 250 L800 260 L0 260 Z" className="fill-brand-ink/10"/><path d="M0 248 C90 230 145 205 220 145 S330 84 420 72 S560 35 635 58 S685 205 800 250" className="fill-none stroke-brand-ink" strokeWidth="3"/><path d="M0 230 C100 190 170 210 275 190 S390 40 475 54 S610 110 690 205 S760 245 800 252" className="fill-none stroke-brand-red" strokeWidth="3"/></svg></div><div className="mt-3 grid grid-cols-7 text-center text-[11px] text-muted-foreground">{["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"].map((day) => <span key={day}>{day}</span>)}</div><div className="mt-4 flex gap-5 text-xs"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-brand-ink"/>البلاغات الجديدة</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-brand-red"/>البلاغات المغلقة</span></div></div></Panel>;
}

function StatusPanel() {
  const legend = [["مغلقة","bg-muted-foreground"],["محلولة","bg-brand-green"],["قيد الانتظار","bg-brand-gold"],["قيد المعالجة","bg-kpi-orange"],["مفتوحة","bg-brand-ink"]];
  return <Panel title="حالة البلاغات"><div className="flex flex-col items-center p-5"><div className="ticket-donut grid h-44 w-44 place-items-center rounded-full"><div className="grid h-28 w-28 place-items-center rounded-full bg-card text-center"><div><p className="font-display text-3xl font-bold">452</p><p className="text-xs text-muted-foreground">إجمالي البلاغات</p></div></div></div><div className="mt-6 grid w-full grid-cols-2 gap-3 text-xs">{legend.map(([label,tone]) => <div key={label} className="flex items-center gap-2"><span className={cn("h-2.5 w-2.5 rounded-full", tone)}/><span>{label}</span></div>)}</div></div></Panel>;
}

function Panel({ title, action, icon: Icon, children }: { title: string; action?: string; icon?: LucideIcon; children: ReactNode }) {
  return <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"><header className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5"><div className="flex min-w-0 items-center gap-2">{Icon && <Icon className="h-5 w-5 shrink-0 text-brand-ink"/>}<h2 className="truncate text-lg font-bold">{title}</h2></div>{action && <Button size="sm" variant="ghost">{action}<ChevronLeft className="h-4 w-4"/></Button>}</header>{children}</section>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-2"><span className="text-sm font-bold">{label}</span>{children}</label>; }
function ActionCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) { return <article className="rounded-lg border border-border bg-card p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-md bg-flow text-brand-ink"><Icon className="h-5 w-5"/></span><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p></article>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p></div>; }