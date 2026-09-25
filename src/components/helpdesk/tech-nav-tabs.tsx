import { Link } from "@tanstack/react-router";
import { MessageSquare, UserCheck, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

export function TechNavTabs({ active }: { active: "panel" | "profile" | "chat" }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border no-scrollbar">
      <Link
        to="/tech-panel"
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
          active === "panel"
            ? "border-brand-gold bg-card text-brand-ink shadow-sm"
            : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
        )}
      >
        <Wrench className="h-4 w-4" />
        <span>البلاغات والمهام الميدانية</span>
      </Link>
      <Link
        to="/tech-profile"
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
          active === "profile"
            ? "border-brand-gold bg-card text-brand-ink shadow-sm"
            : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
        )}
      >
        <UserCheck className="h-4 w-4" />
        <span>الملف الشخصي والأداء</span>
      </Link>
      <Link
        to="/tech-chat"
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-3.5 py-2 text-xs sm:text-sm font-bold transition-all",
          active === "chat"
            ? "border-brand-gold bg-card text-brand-ink shadow-sm"
            : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        <span>المحادثة الميدانية</span>
        <span className="h-2 w-2 rounded-full bg-brand-red animate-pulse" />
      </Link>
    </div>
  );
}
