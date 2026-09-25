import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/branch-tasks")({
  head: () => ({ meta: [{ title: "مهام الفرع | وزير الحلو" }, { name: "description", content: "قائمة مهام الفرع اليومية ومتابعة إنجازها." }, { property: "og:title", content: "مهام الفرع | وزير الحلو" }, { property: "og:description", content: "قائمة مهام الفرع اليومية ومتابعة إنجازها." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AppShell title="مهام الفرع" role="branch"><BranchTasks /></AppShell>,
});

type Task = { id: string; title: string; owner: string; due: string; done: boolean };

function BranchTasks() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", title: "تجهيز منطقة الكاشير لزيارة الفني", owner: "مدير الفرع", due: "اليوم 12:00", done: false },
    { id: "t2", title: "تصوير عطل الكاميرا وإرفاقه بالبلاغ", owner: "مشرف الوردية", due: "اليوم 10:00", done: true },
    { id: "t3", title: "جرد طفايات الحريق الشهري", owner: "مسؤول السلامة", due: "غداً", done: false },
    { id: "t4", title: "تأكيد استلام قطعة الغيار", owner: "مدير الفرع", due: "الأحد", done: false },
  ]);
  const [title, setTitle] = useState("");
  const add = (e: React.FormEvent) => { e.preventDefault(); if (!title.trim()) return; setTasks((t) => [{ id: String(Date.now()), title: title.trim(), owner: "مدير الفرع", due: "بدون موعد", done: false }, ...t]); setTitle(""); };
  const doneCount = tasks.filter((t) => t.done).length;
  return <Panel title={`مهام الفرع (${doneCount}/${tasks.length})`} icon={ListChecks}>
    <form onSubmit={add} className="flex gap-2 border-b border-border p-4"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="أضف مهمة جديدة..." /><Button type="submit"><Plus className="h-4 w-4" />إضافة</Button></form>
    <div className="divide-y divide-border">{tasks.map((t) => <label key={t.id} className="flex cursor-pointer items-center gap-3 p-4"><Checkbox checked={t.done} onCheckedChange={() => setTasks((x) => x.map((y) => (y.id === t.id ? { ...y, done: !y.done } : y)))} /><div className="flex-1"><p className={t.done ? "font-bold text-muted-foreground line-through" : "font-bold"}>{t.title}</p><p className="mt-1 text-xs text-muted-foreground">{t.owner} · {t.due}</p></div><Badge variant={t.done ? "secondary" : "outline"}>{t.done ? "منجزة" : "مفتوحة"}</Badge></label>)}</div>
  </Panel>;
}

