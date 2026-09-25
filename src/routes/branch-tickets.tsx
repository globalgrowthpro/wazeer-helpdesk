import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, Clock3, MapPin, Phone, Plus, RotateCcw, Star } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Field, Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import { branches, tickets } from "@/lib/helpdesk-data";

export const Route = createFileRoute("/branch-tickets")({
  head: () => ({ meta: [{ title: "بلاغات الفرع | وزير الحلو" }, { name: "description", content: "إنشاء البلاغات ومتابعتها وتأكيد الحل من لوحة الفرع." }, { property: "og:title", content: "بلاغات الفرع | وزير الحلو" }, { property: "og:description", content: "إنشاء البلاغات ومتابعتها وتأكيد الحل من لوحة الفرع." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: BranchPanel,
});

type Row = { id: string; title: string; status: string; sla: string; priority: string };
function BranchPanel() {
  return <AppShell title="بلاغات الفرع" role="branch"><BranchContent /></AppShell>;
}

function BranchContent() {
  const { user } = useSession();
  const branch = branches.find((b) => b.id === user?.branchId) ?? branches[0]!;
  const [rows, setRows] = useState<Row[]>(() => tickets.filter((t) => t.branchId === branch.id).map((t) => ({ id: t.id, title: t.title, status: t.status, sla: t.sla, priority: t.priority })));
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("كاميرات مراقبة");
  const [priority, setPriority] = useState("متوسطة");
  const [msg, setMsg] = useState("");
  const setStatus = (id: string, status: string) => setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setMsg("اكتب عنوان المشكلة أولاً.");
    const id = `HD-2026-000${453 + rows.length}`;
    setRows((r) => [{ id, title: `${title} (${category})`, status: "جديد", sla: "24:00", priority }, ...r]);
    setTitle(""); setMsg(`تم إنشاء البلاغ ${id} وإرساله للإدارة.`);
  };

  return <>
    <div><h1 className="text-2xl font-bold">{branch.name}</h1><p className="mt-1 text-sm text-muted-foreground">مدير الفرع: {branch.manager}</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="بلاغات مفتوحة" value={String(rows.filter((r) => r.status !== "مغلق").length)} icon={Clock3} /><Stat label="بلاغات مغلقة" value={String(branch.closed)} icon={CheckCircle2} /><Stat label="رضا الفرع" value={`${branch.satisfaction}/5`} icon={Star} /><Stat label="الحالة" value="يعمل" icon={Building2} /></section>

    <section className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="إنشاء بلاغ جديد" icon={Plus}><form onSubmit={create} className="space-y-4 p-5">
        <Field label="عنوان المشكلة"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: الطابعة لا تعمل" /></Field>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="التصنيف"><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["كاميرات مراقبة", "شبكات", "نقاط بيع", "كهرباء", "تكييف"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field><Field label="الأولوية"><Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["منخفضة", "متوسطة", "عالية", "حرجة"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field></div>
        <Field label="الوصف"><Textarea placeholder="صف المشكلة بالتفصيل..." /></Field>
        {msg && <p className="rounded-md bg-surface p-3 text-sm font-bold text-brand-green">{msg}</p>}
        <Button type="submit" className="w-full"><Plus className="h-4 w-4" />إرسال البلاغ</Button>
      </form></Panel>
      <Panel title="بلاغات الفرع"><div className="divide-y divide-border">{rows.map((t) => <div key={t.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-display text-xs font-bold text-brand-ink">{t.id}</p><p className="mt-1 font-bold">{t.title}</p><p className="mt-1 text-xs text-muted-foreground">الأولوية: {t.priority} · متبقي <span className="font-mono text-brand-red">{t.sla}</span></p></div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{t.status}</Badge>{t.status !== "مغلق" && <Button size="sm" onClick={() => setStatus(t.id, "مغلق")}><CheckCircle2 className="h-4 w-4" />تأكيد الحل</Button>}{t.status === "مغلق" && <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "أعيد فتحه")}><RotateCcw className="h-4 w-4" />إعادة فتح</Button>}</div></div>)}</div></Panel>
    </section>

    <Panel title="بيانات التواصل"><div className="grid gap-4 p-5 sm:grid-cols-2"><div className="flex gap-3"><Phone className="h-5 w-5 text-brand-ink" /><div><p className="text-xs text-muted-foreground">الهاتف</p><p className="mt-1 font-bold" dir="ltr">{branch.phone}</p></div></div><div className="flex gap-3"><MapPin className="h-5 w-5 text-brand-ink" /><div><p className="text-xs text-muted-foreground">العنوان</p><p className="mt-1 font-bold">{branch.address}</p></div></div></div></Panel>
  </>;
}
