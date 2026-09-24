import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, Boxes, Building2, CheckCircle2, LayoutDashboard, LifeBuoy, MapPin, Menu, Plus, QrCode, Search, Settings, ShoppingCart, UsersRound, Wrench, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import wazeerLogo from "@/assets/wazeer-emblem.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navGroups: Array<{ label: string; items: Array<{ label: string; icon: LucideIcon; to: "/" | "/tickets" | "/tasks" | "/field-service" | "/purchases" | "/reports" | "/branches" | "/technicians" | "/assets" | "/settings" | "/branches/$branchId" | "/technicians/$technicianId"; params?: Record<string, string> }> }> = [
  { label: "العمليات", items: [
    { label: "لوحة التحكم", icon: LayoutDashboard, to: "/" },
    { label: "البلاغات", icon: LifeBuoy, to: "/tickets" },
    { label: "المهام", icon: CheckCircle2, to: "/tasks" },
    { label: "الخدمة الميدانية", icon: MapPin, to: "/field-service" },
    { label: "المشتريات", icon: ShoppingCart, to: "/purchases" },
    { label: "التقارير", icon: BarChart3, to: "/reports" },
  ] },
  { label: "لوحات الأدوار", items: [
    { label: "لوحة الفرع", icon: Building2, to: "/branches/$branchId", params: { branchId: "branch-04" } },
    { label: "لوحة الفني", icon: Wrench, to: "/technicians/$technicianId", params: { technicianId: "ahmed-samy" } },
  ] },
  { label: "الدليل والفريق", items: [
    { label: "الفروع", icon: Building2, to: "/branches" },
    { label: "الفنيون", icon: UsersRound, to: "/technicians" },
    { label: "الأصول", icon: QrCode, to: "/assets" },
    { label: "الإعدادات", icon: Settings, to: "/settings" },
  ] },
];

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  return <div className="min-h-screen bg-background p-0 lg:p-4"><div className="dashboard-shadow mx-auto flex min-h-screen max-w-[1680px] overflow-hidden border-border bg-card lg:min-h-[calc(100vh-2rem)] lg:rounded-lg lg:border">
    <Sidebar className={cn("fixed inset-y-0 right-0 z-50 transition-transform lg:static lg:translate-x-0", mobileMenu ? "translate-x-0" : "translate-x-full")} close={() => setMobileMenu(false)} />
    {mobileMenu && <Button aria-label="إغلاق القائمة" variant="ghost" className="fixed inset-0 z-40 h-auto w-auto rounded-none bg-foreground/35 lg:hidden" onClick={() => setMobileMenu(false)} />}
    <main className="min-w-0 flex-1 overflow-x-hidden bg-background"><header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur"><div className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 lg:px-6">
      <Button className="lg:hidden" size="icon" variant="outline" onClick={() => setMobileMenu(true)} aria-label="فتح القائمة"><Menu className="h-5 w-5" /></Button>
      <div className="min-w-0"><p className="truncate text-lg font-bold">{title}</p><p className="hidden text-xs text-muted-foreground sm:block">الخميس، 24 سبتمبر 2026</p></div>
      <div className="flex shrink-0 items-center gap-2"><div className="relative hidden w-56 md:block"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-9 bg-background pr-9" placeholder="بحث سريع..." /></div><Button size="icon" variant="outline" aria-label="الإشعارات" className="relative"><Bell className="h-4 w-4" /><span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-red" /></Button><Button asChild size="sm"><Link to="/branches"><Plus className="h-4 w-4" />بلاغ جديد</Link></Button></div>
    </div></header><div className="space-y-6 p-4 lg:p-6">{children}</div></main>
  </div></div>;
}

function Sidebar({ className, close }: { className?: string; close: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return <aside className={cn("flex w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground", className)}>
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-sidebar-border p-4"><div className="grid h-10 w-10 place-items-center rounded-md bg-card p-1"><img src={wazeerLogo.url} alt="وزير الحلو" className="max-h-full max-w-full object-contain" /></div><div className="min-w-0"><p className="truncate font-display text-sm font-bold">وزير الحلو</p><p className="truncate text-[11px] text-sidebar-foreground/60">الدعم والصيانة</p></div><Button size="icon" variant="ghost" className="text-sidebar-foreground lg:hidden" onClick={close} aria-label="إغلاق القائمة"><X className="h-5 w-5" /></Button></div>
    <div className="flex-1 overflow-y-auto px-2 py-4">{navGroups.map((group) => <div key={group.label} className="mb-5"><p className="px-3 pb-2 text-[10px] font-bold text-sidebar-foreground/45">{group.label}</p><nav className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to); return <Link key={item.to} to={item.to} onClick={close} className={cn("flex items-center gap-2.5 rounded-md border-r-2 border-transparent px-3 py-2 text-[13px] transition-colors", active ? "border-brand-gold bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}><Icon className="h-4 w-4 shrink-0" /><span>{item.label}</span></Link>; })}</nav></div>)}</div>
    <div className="border-t border-sidebar-border p-3"><div className="flex items-center gap-2 rounded-md bg-sidebar-accent p-2.5"><div className="grid h-8 w-8 place-items-center rounded-full bg-brand-green text-xs text-primary-foreground">ح</div><div className="min-w-0"><p className="truncate text-xs font-bold">حافظ رحيم</p><p className="text-[10px] text-sidebar-foreground/60">مدير النظام</p></div></div></div>
  </aside>;
}