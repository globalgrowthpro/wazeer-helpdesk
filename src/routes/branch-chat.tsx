import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/helpdesk/app-shell";
import { InternalChat } from "@/components/helpdesk/internal-chat";
import { useSession } from "@/lib/auth";
import { branches } from "@/lib/helpdesk-data";

export const Route = createFileRoute("/branch-chat")({
  head: () => ({ meta: [{ title: "المحادثة الداخلية | وزير الحلو" }, { name: "description", content: "تواصل الفرع مع الإدارة والفنيين وفريق المشتريات." }, { property: "og:title", content: "المحادثة الداخلية | وزير الحلو" }, { property: "og:description", content: "تواصل الفرع مع الإدارة والفنيين وفريق المشتريات." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AppShell title="المحادثة الداخلية" role="branch"><ChatPage /></AppShell>,
});

function ChatPage() {
  const { user } = useSession();
  const branch = branches.find((b) => b.id === user?.branchId) ?? branches[0]!;
  return <InternalChat author={user?.name ?? branch.name} role={branch.name} />;
}
