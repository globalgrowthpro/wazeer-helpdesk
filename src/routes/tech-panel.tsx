import { createFileRoute } from "@tanstack/react-router";
import { Boxes, CheckCircle2, Clock3, MapPin, MessageSquareText, Pause, Play, Send, UserRound, Wrench } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Field, Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import { technicians, tickets } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tech-panel")({
  head: () => ({ meta: [{ title: "لوحة الفني | وزير الحلو" }, { name: "description", content: "مهام الفني: قبول، بدء العمل، التحديثات، طلب القطع والإرسال للمراجعة." }, { property: "og:title", content: "لوحة الفني | وزير الحلو" }, { property: "og:description", content: "مهام الفني: قبول، بدء العمل، التحديثات، طلب القطع والإرسال للمراجعة." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AppShell title="لوحة الفني" role="technician"><TechContent /></AppShell>,
});

const steps = ["مسندة", "مقبولة", "العمل جارٍ", "بانتظار قطعة", "بانتظار مراجعة الإدارة"];

function TechContent() {
  const { user } = useSession();
  const tech = technicians.find((t) => t.id === user?.technicianId) ?? technicians[0]!;
  const mine = tickets.filter((t) => t.technicianId === tech.id);
  const list = mine.length ? mine : tickets.slice(0, 1);
  const [selected, setSelected] = useState(list[0]!.id);
  const [stages, setStages] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const task = list.find((t) => t.id === selected)!;
  const stage = stages[task.id] ?? "مسندة";
  const setStage = (s: string, entry: string) => { setStages((p) => ({ ...p, [task.id]: s })); setLog((l) => [`${task.id}: ${entry}`, ...l]); };
  const idx = steps.indexOf(stage);

  return <>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold">مرحباً، {tech.name}</h1><p className="mt-1 text-sm text-muted-foreground">{tech.skill} · {tech.zone}</p></div><Button variant="outline"><MapPin className="h-4 w-4" />فتح الاتجاهات</Button></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="المهام النشطة" value={String(tech.load)} icon={Wrench} /><Stat label="المكتملة هذا الشهر" value={String(tech.completed)} icon={CheckCircle2} /><Stat label="زمن الاستجابة" value="18 دقيقة" icon={Clock3} /><Stat label="التقييم" value="4.9/5" icon={UserRound} /></section>
    <section className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel title="مهامي المسندة"><div className="divide-y divide-border">{list.map((t) => <button key={t.id} type="button" onClick={() => setSelected(t.id)} className={cn("block w-full p-4 text-right transition-colors hover:bg-surface", t.id === selected && "bg-surface")}><div className="flex items-center justify-between gap-2"><span className="font-display text-xs font-bold text-brand-ink">{t.id}</span><Badge variant="outline">{stages[t.id] ?? "مسندة"}</Badge></div><p className="mt-1 font-bold">{t.title}</p><p className="mt-1 text-xs text-muted-foreground">{t.branch} · متبقي {t.sla}</p></button>)}</div></Panel>
      <Panel title="المهمة الحالية" icon={Wrench}><div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2"><span className="font-display font-bold text-brand-ink">{task.id}</span><Badge>{task.priority}</Badge><Badge variant="outline">{stage}</Badge></div>
        <h2 className="text-lg font-bold">{task.title}</h2>
        <p className="rounded-md bg-surface p-4 text-sm leading-7">{task.description}</p>
        <div className="flex gap-1">{steps.map((s, i) => <div key={s} className={cn("h-1.5 flex-1 rounded-full", i <= idx ? "bg-brand-green" : "bg-muted")} />)}</div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={stage !== "مسندة"} onClick={() => setStage("مقبولة", "تم قبول المهمة")}><CheckCircle2 className="h-4 w-4" />قبول المهمة</Button>
          <Button variant="secondary" disabled={idx < 1 || stage === "العمل جارٍ"} onClick={() => setStage("العمل جارٍ", "بدء العمل")}><Play className="h-4 w-4" />بدء العمل</Button>
          <Button variant="outline" disabled={stage !== "العمل جارٍ"} onClick={() => setStage("مقبولة", "إيقاف مؤقت")}><Pause className="h-4 w-4" />إيقاف مؤقت</Button>
        </div>
      </div></Panel>
    </section>
    <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <Panel title="إضافة تحديث" icon={MessageSquareText}><div className="space-y-4 p-5"><Field label="ملاحظات العمل"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="اكتب ما تم فحصه أو إصلاحه..." /></Field><Field label="مدة العمل"><Input defaultValue="02:25" dir="ltr" /></Field><div className="flex flex-wrap gap-2"><Button disabled={idx < 1 || !note.trim()} onClick={() => { setLog((l) => [`${task.id}: ${note}`, ...l]); setNote(""); }}><Send className="h-4 w-4" />حفظ التحديث</Button><Button variant="outline" disabled={idx < 2} onClick={() => setStage("بانتظار قطعة", "طلب قطعة غيار — أُرسل للمشتريات")}><Boxes className="h-4 w-4" />طلب قطعة</Button><Button variant="outline" disabled={idx < 2} onClick={() => setStage("بانتظار مراجعة الإدارة", "تم الإنجاز وأُرسل للمراجعة")}><CheckCircle2 className="h-4 w-4" />إنجاز وإرسال للمراجعة</Button></div></div></Panel>
      <Panel title="سجل نشاطي"><div className="space-y-3 p-5">{log.length ? log.map((l, i) => <p key={i} className="rounded-md bg-surface p-3 text-sm">{l}</p>) : <p className="text-sm text-muted-foreground">لا توجد تحديثات بعد.</p>}</div></Panel>
    </section>
  </>;
}
