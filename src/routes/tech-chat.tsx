import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/helpdesk/app-shell";
import { InternalChat } from "@/components/helpdesk/internal-chat";
import { TechNavTabs } from "@/components/helpdesk/tech-nav-tabs";
import { useSession } from "@/lib/auth";
import { technicians } from "@/lib/helpdesk-data";

export const Route = createFileRoute("/tech-chat")({
  head: () => ({
    meta: [
      { title: "المحادثة الميدانية | وزير الحلو" },
      { name: "description", content: "غرفة المحادثات والتنسيق الميداني بين الفنيين وغرفة العمليات والفروع." },
      { property: "og:title", content: "المحادثة الميدانية | وزير الحلو" },
      { property: "og:description", content: "غرفة المحادثات والتنسيق الميداني بين الفنيين وغرفة العمليات والفروع." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell title="المحادثة الميدانية" role="technician">
      <TechChatPage />
    </AppShell>
  ),
});

function TechChatPage() {
  const { user } = useSession();
  const techBase = technicians.find((t) => t.id === user?.technicianId) ?? technicians[0]!;

  return (
    <div className="space-y-4">
      <TechNavTabs active="chat" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-foreground">قنوات التنسيق والمحادثة الميدانية</h2>
          <p className="text-xs text-muted-foreground">تواصل فوري مع غرفة العمليات، الفروع، والمشتريات لتسريع إنجاز المهام.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">متصل بالشبكة الداخلية</span>
        </div>
      </div>

      <InternalChat
        author={techBase.name}
        role={`فني ميداني (${techBase.skill})`}
        initialChannel="technicians"
        title="غرفة المحادثات والتنسيق الميداني"
        quickActions={[
          "وصلت لموقع الفرع وبدأت الفحص",
          "أحتاج توفير قطعة غيار عاجلة",
          "تم إصلاح العطل بنجاح والاختبار يعمل",
          "يرجى مراجعة إغلاق البلاغ",
        ]}
      />
    </div>
  );
}
