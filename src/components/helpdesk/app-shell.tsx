import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, Building2, CheckCircle2, LayoutDashboard, LifeBuoy, LogOut, MapPin, MessageSquare, Menu, Plus, QrCode, Search, Settings, ShoppingCart, UserCheck, UsersRound, Wrench, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logout, roleHome, useSession, type Role } from "@/lib/auth";
import { cn } from "@/lib/utils";

type NavTo = "/" | "/tickets" | "/tasks" | "/field-service" | "/purchases" | "/reports" | "/branches" | "/technicians" | "/assets" | "/settings" | "/branch-panel" | "/branch-tickets" | "/branch-tasks" | "/branch-chat" | "/branch-staff" | "/tech-panel" | "/tech-profile" | "/tech-chat";
type NavGroup = { label: string; items: Array<{ label: string; icon: LucideIcon; to: NavTo }> };

const navByRole: Record<Role, NavGroup[]> = {
  admin: [
    { label: "العمليات", items: [
      { label: "لوحة التحكم", icon: LayoutDashboard, to: "/" },
      { label: "البلاغات", icon: LifeBuoy, to: "/tickets" },
      { label: "المهام", icon: CheckCircle2, to: "/tasks" },
      { label: "الخدمة الميدانية", icon: MapPin, to: "/field-service" },
      { label: "المشتريات", icon: ShoppingCart, to: "/purchases" },
      { label: "التقارير", icon: BarChart3, to: "/reports" },
    ] },
    { label: "الدليل والفريق", items: [
      { label: "الفروع", icon: Building2, to: "/branches" },
      { label: "الفنيون", icon: UsersRound, to: "/technicians" },
      { label: "الأصول", icon: QrCode, to: "/assets" },
      { label: "الإعدادات", icon: Settings, to: "/settings" },
    ] },
  ],
  branch: [
    {
      label: "لوحة الفرع",
      items: [
        { label: "الرئيسية", icon: LayoutDashboard, to: "/branch-panel" },
        { label: "البلاغات", icon: LifeBuoy, to: "/branch-tickets" },
        { label: "المهام", icon: CheckCircle2, to: "/branch-tasks" },
        { label: "طاقم العمل", icon: UsersRound, to: "/branch-staff" },
        { label: "المحادثة", icon: MessageSquare, to: "/branch-chat" },
      ],
    },
  ],
  technician: [
    {
      label: "لوحة الفني",
      items: [
        { label: "البلاغات والمهام", icon: Wrench, to: "/tech-panel" },
        { label: "الملف الشخصي والأداء", icon: UserCheck, to: "/tech-profile" },
        { label: "المحادثة الميدانية", icon: MessageSquare, to: "/tech-chat" },
      ],
    },
  ],
};

export function AppShell({
  children,
  title,
  role = "admin",
  allowedRoles,
}: {
  children: ReactNode;
  title: string;
  role?: Role;
  allowedRoles?: Role[];
}) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const { ready, user } = useSession();
  const navigate = useNavigate();

  const isRoleAllowed = (userRole: Role) => {
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(userRole);
    }
    return userRole === role;
  };

  useEffect(() => {
    const updateAvatar = () => {
      if (user) {
        const a =
          localStorage.getItem(`wazeer-tech-avatar-${user.technicianId || user.email}`) ||
          localStorage.getItem(`wazeer-user-avatar-${user.email}`) ||
          user.avatar;
        setAvatar(a || null);
      }
    };
    updateAvatar();
    window.addEventListener("avatar-updated", updateAvatar);
    window.addEventListener("storage", updateAvatar);
    return () => {
      window.removeEventListener("avatar-updated", updateAvatar);
      window.removeEventListener("storage", updateAvatar);
    };
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (!isRoleAllowed(user.role)) navigate({ to: roleHome[user.role], replace: true });
  }, [ready, user, role, allowedRoles, navigate]);

  if (!ready || !user || !isRoleAllowed(user.role))
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">جارٍ التحقق من الجلسة...</div>;

  return <div className="min-h-screen bg-background p-0 lg:p-4"><div className="dashboard-shadow mx-auto flex min-h-screen max-w-[1680px] overflow-hidden border-border bg-card lg:min-h-[calc(100vh-2rem)] lg:rounded-lg lg:border">
    <Sidebar role={user.role} userName={user.name} roleLabel={user.roleLabel} avatar={avatar} className={cn("fixed inset-y-0 right-0 z-50 transition-transform lg:static lg:translate-x-0", mobileMenu ? "translate-x-0" : "translate-x-full")} close={() => setMobileMenu(false)} />
    {mobileMenu && <Button aria-label="إغلاق القائمة" variant="ghost" className="fixed inset-0 z-40 h-auto w-auto rounded-none bg-foreground/35 lg:hidden" onClick={() => setMobileMenu(false)} />}
    <main className="min-w-0 flex-1 overflow-x-hidden bg-background"><header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur"><div className="grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Button className="lg:hidden" size="icon" variant="outline" onClick={() => setMobileMenu(true)} aria-label="فتح القائمة"><Menu className="h-5 w-5" /></Button>
        <img src="/wazeer-emblem.png" alt="وزير الحلو" className="h-8 w-auto object-contain lg:hidden" />
      </div>
      <div className="min-w-0"><p className="truncate text-lg font-bold">{title}</p><p className="hidden text-xs text-muted-foreground sm:block">الخميس، 24 سبتمبر 2026</p></div>
      <div className="flex shrink-0 items-center gap-2"><div className="relative hidden w-56 md:block"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-9 bg-background pr-9" placeholder="بحث سريع..." /></div><Button size="icon" variant="outline" aria-label="الإشعارات" className="relative"><Bell className="h-4 w-4" /><span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-red" /></Button>{role !== "technician" && <Button asChild size="sm"><Link to={role === "branch" ? "/branch-tickets" : "/tickets"}><Plus className="h-4 w-4" />بلاغ جديد</Link></Button>}</div>
    </div></header><div className="space-y-6 p-4 lg:p-6">{children}</div></main>
  </div></div>;
}

function Sidebar({ className, close, role, userName, roleLabel, avatar }: { className?: string; close: () => void; role: Role; userName: string; roleLabel: string; avatar?: string | null }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  return <aside className={cn("flex w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground", className)}>
    <div className="flex items-center justify-between border-b border-sidebar-border p-4">
      <Link to={roleHome[role]} onClick={close} className="flex min-w-0 items-center gap-2.5">
        <img src="/wazeer-emblem-light.png" alt="وزير الحلو" className="h-10 w-auto max-w-[110px] object-contain drop-shadow-sm" />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-white">وزير الحلو</p>
          <p className="truncate text-[10px] text-sidebar-foreground/70">الدعم والصيانة</p>
        </div>
      </Link>
      <Button size="icon" variant="ghost" className="text-sidebar-foreground lg:hidden" onClick={close} aria-label="إغلاق القائمة"><X className="h-5 w-5" /></Button>
    </div>
    <div className="flex-1 overflow-y-auto px-2 py-4">{navByRole[role].map((group) => <div key={group.label} className="mb-5"><p className="px-3 pb-2 text-[10px] font-bold text-sidebar-foreground/45">{group.label}</p><nav className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to); return <Link key={item.to} to={item.to} onClick={close} className={cn("flex items-center gap-2.5 rounded-md border-r-2 border-transparent px-3 py-2 text-[13px] transition-colors", active ? "border-brand-gold bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}><Icon className="h-4 w-4 shrink-0" /><span>{item.label}</span></Link>; })}</nav></div>)}</div>
    <div className="space-y-2 border-t border-sidebar-border p-3"><div className="flex items-center gap-2 rounded-md bg-sidebar-accent p-2.5">{avatar ? <img src={avatar} alt={userName} className="h-8 w-8 rounded-full object-cover shrink-0 border border-sidebar-border" /> : <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-green text-xs text-primary-foreground shrink-0">{userName[0]}</div>}<div className="min-w-0"><p className="truncate text-xs font-bold">{userName}</p><p className="truncate text-[10px] text-sidebar-foreground/60">{roleLabel}</p></div></div><Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}><LogOut className="h-4 w-4" />تسجيل الخروج</Button></div>
  </aside>;
}