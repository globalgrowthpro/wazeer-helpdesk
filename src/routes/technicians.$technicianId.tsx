import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Boxes, CheckCircle2, Clock3, MapPin, MessageSquareText, Pause, Play, Send, UserRound, Wrench } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Field, Panel, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { technicians, tickets } from "@/lib/helpdesk-data";
export const Route = createFileRoute("/technicians/$technicianId")({ loader: ({ params }) => { const technician = technicians.find((item) => item.id === params.technicianId); if (!technician) throw notFound(); return technician; }, head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.name} | لوحة الفني` : "الفني غير موجود" }, { name: "description", content: "مساحة عمل الفني ومتابعة المهمة الحالية." }, { property: "og:title", content: loaderData ? `${loaderData.name} | لوحة الفني` : "الفني غير موجود" }, { property: "og:description", content: "مساحة عمل الفني ومتابعة المهمة الحالية." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: TechnicianWorkspace });
function TechnicianWorkspace() {
  const technician = Route.useLoaderData();
  const task = tickets.find((item) => item.technicianId === technician.id) ?? tickets[0];
  const [stage, setStage] = useState("جاهز للبدء");
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");
  if (!task) return null;

  return (
    <AppShell title="لوحة الفني">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/technicians">
            <ArrowRight className="h-4 w-4" />
            العودة للفنيين
          </Link>
        </Button>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {technician.avatar ? (
              <img
                src={technician.avatar}
                alt={technician.name}
                className="h-14 w-14 rounded-full object-cover border-2 border-brand-copper/40 shadow-sm shrink-0"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-ink/10 font-bold text-lg text-brand-ink shrink-0">
                {technician.name.slice(0, 1)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{technician.name}</h1>
                <Badge variant="outline">{stage}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {technician.skill} · {technician.zone}
              </p>
            </div>
          </div>
          <Button variant="outline">
            <MapPin className="h-4 w-4" />
            فتح الاتجاهات
          </Button>
        </div>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="المهام النشطة" value={String(technician.load)} icon={Wrench} />
        <Stat label="المكتملة هذا الشهر" value={String(technician.completed)} icon={CheckCircle2} />
        <Stat label="زمن الاستجابة" value="18 دقيقة" icon={Clock3} />
        <Stat label="التقييم" value="4.9/5" icon={UserRound} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[.75fr_1.25fr]">
        <Panel title="الوقت والإجراءات" icon={Clock3}>
          <div className="p-5">
            <p className="text-xs text-muted-foreground">وقت المهمة الحالية</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-display text-5xl font-bold">02:25</p>
              <span className={`h-3 w-3 rounded-full ${running ? "bg-brand-green" : "bg-muted-foreground"}`} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  setRunning(true);
                  setStage("العمل جارٍ");
                }}
              >
                <Play className="h-4 w-4" />
                بدء العمل
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRunning(false);
                  setStage("متوقف مؤقتاً");
                }}
              >
                <Pause className="h-4 w-4" />
                إيقاف مؤقت
              </Button>
            </div>
            <Button className="mt-2 w-full" variant="secondary" onClick={() => setStage("مقبولة")}>
              قبول المهمة
            </Button>
          </div>
        </Panel>
        <Panel
          title="المهمة الحالية"
          icon={Wrench}
          action={
            <Button asChild variant="outline" size="sm" className="h-7 text-xs font-bold gap-1">
              <Link to="/tickets/$ticketId" params={{ ticketId: task.id }}>
                عرض التفاصيل
              </Link>
            </Button>
          }
        >
          <Link
            to="/tickets/$ticketId"
            params={{ ticketId: task.id }}
            className="block p-5 hover:bg-surface/50 transition-colors group cursor-pointer"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-bold text-brand-ink group-hover:underline">
                {task.id}
              </span>
              <Badge>{task.priority}</Badge>
            </div>
            <h2 className="mt-2 text-lg font-bold group-hover:text-brand-copper transition-colors">{task.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {task.branch} · متبقي {task.sla}
            </p>
            <p className="mt-4 rounded-md bg-surface p-4 text-sm leading-7 text-foreground/90">{task.description}</p>
          </Link>
        </Panel>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Panel title="إضافة تحديث" icon={MessageSquareText}>
          <div className="space-y-4 p-5">
            <Field label="ملاحظات العمل">
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="اكتب ما تم فحصه أو إصلاحه..." />
            </Field>
            <Field label="مدة العمل">
              <Input defaultValue="02:25" />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setNote("")}>
                <Send className="h-4 w-4" />
                حفظ التحديث
              </Button>
              <Button variant="outline">
                <Boxes className="h-4 w-4" />
                طلب قطعة
              </Button>
              <Button variant="outline" onClick={() => setStage("بانتظار مراجعة الإدارة")}>
                <CheckCircle2 className="h-4 w-4" />
                إرسال للمراجعة
              </Button>
            </div>
          </div>
        </Panel>
        <Panel title="خطوات المهمة">
          <div className="space-y-4 p-5">
            {["قبول المهمة", "الوصول إلى الفرع", "بدء العمل", "إضافة تحديث", "إرسال للمراجعة"].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${index < 3 ? "bg-brand-green text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-bold">{item}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}