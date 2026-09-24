import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, LogIn, ShieldCheck, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import wazeerLogo from "@/assets/wazeer-emblem.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoAccounts, login, roleHome, useSession, type Role } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | وزير الحلو للدعم الفني" }, { name: "description", content: "سجّل الدخول إلى نظام إدارة البلاغات حسب دورك." }, { property: "og:title", content: "تسجيل الدخول | وزير الحلو للدعم الفني" }, { property: "og:description", content: "سجّل الدخول إلى نظام إدارة البلاغات حسب دورك." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: LoginPage,
});

const roleIcon: Record<Role, typeof ShieldCheck> = { admin: ShieldCheck, branch: Building2, technician: Wrench };

function LoginPage() {
  const navigate = useNavigate();
  const { ready, user } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { if (ready && user) navigate({ to: roleHome[user.role], replace: true }); }, [ready, user, navigate]);

  const submit = (e?: React.FormEvent, em = email, pw = password) => {
    e?.preventDefault();
    const u = login(em, pw);
    if (!u) return setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    navigate({ to: roleHome[u.role], replace: true });
  };

  return <div className="grid min-h-screen bg-background lg:grid-cols-2">
    <div className="wazeer-sidebar-gradient hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-md bg-card p-1"><img src={wazeerLogo.url} alt="وزير الحلو" className="max-h-full object-contain" /></div><div><p className="font-display text-lg font-bold">وزير الحلو</p><p className="text-xs text-sidebar-foreground/60">نظام الدعم والصيانة الذكي</p></div></div>
      <div><h1 className="text-4xl font-bold leading-tight">منصة واحدة لكل البلاغات،<br />ولوحة مخصصة لكل دور.</h1><p className="mt-4 max-w-md text-sm leading-7 text-sidebar-foreground/70">الإدارة تراجع وتُسند، الفروع تُنشئ وتتابع، والفنيون يُنجزون المهام — كلٌّ في لوحته بعد تسجيل الدخول.</p></div>
      <p className="text-xs text-sidebar-foreground/50">نسخة تجريبية للواجهة فقط</p>
    </div>
    <div className="flex items-center justify-center p-6"><div className="w-full max-w-md space-y-6">
      <div><h2 className="text-2xl font-bold">تسجيل الدخول</h2><p className="mt-1 text-sm text-muted-foreground">سيتم توجيهك تلقائياً إلى لوحتك حسب صلاحيتك.</p></div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@wazeer.demo" /></div>
        <div className="space-y-2"><Label htmlFor="password">كلمة المرور</Label><Input id="password" type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full"><LogIn className="h-4 w-4" />دخول</Button>
      </form>
      <div><p className="mb-2 text-xs font-bold text-muted-foreground">حسابات تجريبية (كلمة المرور 123456) — اضغط للدخول مباشرة</p><div className="space-y-2">{demoAccounts.map((a) => { const Icon = roleIcon[a.role]; return <button key={a.email} type="button" onClick={() => { setEmail(a.email); setPassword(a.password); submit(undefined, a.email, a.password); }} className="flex w-full items-center gap-3 rounded-md border border-border bg-card p-3 text-right transition-colors hover:bg-surface"><span className="grid h-9 w-9 place-items-center rounded-md bg-surface text-brand-ink"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{a.name} · {a.roleLabel}</span><span className="block text-xs text-muted-foreground" dir="ltr">{a.email}</span></span></button>; })}</div></div>
    </div></div>
  </div>;
}
