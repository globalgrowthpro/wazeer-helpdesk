import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LogIn,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoAccounts, login, roleHome, useSession, type Role } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | وزير الحلو للدعم الفني" },
      { name: "description", content: "سجّل الدخول إلى نظام إدارة البلاغات حسب دورك." },
      { property: "og:title", content: "تسجيل الدخول | وزير الحلو للدعم الفني" },
      { property: "og:description", content: "سجّل الدخول إلى نظام إدارة البلاغات حسب دورك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const roleIcon: Record<Role, typeof ShieldCheck> = {
  admin: ShieldCheck,
  branch: Building2,
  technician: Wrench,
};

const wallpapers = [
  {
    src: "/wallpaper.png",
    tag: "إدارة البلاغات والدعم الذكي",
    title: "منصة واحدة متكاملة لكل فروع وزير الحلو",
  },
  {
    src: "/wallpaper1.png",
    tag: "خدمة أسرع .. استجابة أذكى",
    title: "متابعة مؤشرات الأداء والـ SLA لحظياً",
  },
  {
    src: "/wallpaper2.png",
    tag: "الصيانة والتشغيل الميداني",
    title: "ربط الفروع المباشر مع غرفة العمليات",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { ready, user } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % wallpapers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + wallpapers.length) % wallpapers.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % wallpapers.length);
  };

  useEffect(() => {
    if (ready && user) navigate({ to: roleHome[user.role], replace: true });
  }, [ready, user, navigate]);

  const submit = (e?: React.FormEvent, em = email, pw = password) => {
    e?.preventDefault();
    const u = login(em, pw);
    if (!u) return setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    navigate({ to: roleHome[u.role], replace: true });
  };

  return (
    <div className="grid h-screen w-screen overflow-hidden bg-background lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px]">
      {/* LEFT COLUMN: HERO SLIDER (Contain format, wide space) */}
      <div className="relative hidden h-full w-full overflow-hidden select-none lg:flex lg:flex-col lg:justify-between bg-[#120c2b]">
        {/* Background Images with Contain Format & Fade Transition */}
        {wallpapers.map((wp, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={wp.src}
              className={`absolute inset-0 flex h-full w-full items-center justify-center p-4 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
              }`}
            >
              <img
                src={wp.src}
                alt={wp.title}
                className="max-h-full max-w-full object-contain drop-shadow-2xl"
              />
            </div>
          );
        })}

        {/* Subtle Top & Bottom Vignette Overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#120c2b]/90 via-[#120c2b]/30 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#120c2b]/95 via-[#120c2b]/40 to-transparent z-10" />

        {/* Top Header */}
        <div className="relative z-20 flex items-center justify-between p-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/wazeer-emblem-light.png"
              alt="وزير الحلو"
              className="h-10 w-auto max-w-[120px] object-contain drop-shadow-md"
            />
            <div className="border-r border-white/20 pr-2.5">
              <p className="font-display text-xs font-bold text-white">وزير الحلو</p>
              <p className="text-[10px] text-white/70">الدعم الفني والصيانة الميدانية</p>
            </div>
          </div>

          <Badge variant="outline" className="border-white/20 bg-white/10 text-white backdrop-blur-md text-[11px] gap-1.5 py-0.5 px-2.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            2026 Helpdesk Edition
          </Badge>
        </div>

        {/* Bottom Floating Controls Bar */}
        <div className="relative z-20 flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/80 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5">
              {wallpapers[currentSlide]?.tag}
            </Badge>
            <span className="text-xs text-white/80 font-medium">
              {wallpapers[currentSlide]?.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {wallpapers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`انتقال للشريحة ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={prevSlide}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                aria-label="الشريحة السابقة"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={nextSlide}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                aria-label="الشريحة التالية"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: REDUCED, SLEEK LOGIN FORM (No Scrollbar) */}
      <div className="flex h-full w-full flex-col justify-center overflow-y-auto px-6 py-6 border-r border-border bg-card/60 backdrop-blur-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-full max-w-[340px] space-y-4">
          {/* Logo on form */}
          <div className="flex items-center gap-2.5">
            <img
              src="/wazeer-emblem.png"
              alt="وزير الحلو"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">تسجيل الدخول</h2>
              <p className="text-[11px] text-muted-foreground">نظام وزير الحلو للدعم والصيانة</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3 pt-1">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">البريد الإلكتروني</Label>
              <Input
                id="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@wazeer.demo"
                className="h-9 text-left font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-bold text-foreground">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-left font-mono text-xs"
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-xs font-bold text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="sm" className="w-full gap-2 font-bold shadow-xs">
              <LogIn className="h-3.5 w-3.5" />
              دخول إلى النظام
            </Button>
          </form>

          {/* Quick Demo Accounts - Reduced & Compact */}
          <div className="pt-2 border-t border-border/80">
            <p className="mb-2 text-[11px] font-bold text-muted-foreground">
              حسابات تجريبية سريعة (كلمة المرور 123456):
            </p>
            <div className="space-y-1.5">
              {demoAccounts.map((a) => {
                const Icon = roleIcon[a.role];
                return (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => {
                      setEmail(a.email);
                      setPassword(a.password);
                      submit(undefined, a.email, a.password);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-border/70 bg-card/80 p-2 text-right transition-all hover:border-primary/50 hover:bg-muted/40"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-foreground leading-tight">
                        {a.name} · {a.roleLabel}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted-foreground" dir="ltr">
                        {a.email}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
