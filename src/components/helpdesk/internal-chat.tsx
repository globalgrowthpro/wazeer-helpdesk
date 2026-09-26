import { Hash, MessageSquare, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Panel } from "@/components/helpdesk/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { id: string; channel: string; author: string; role: string; text: string; time: string };

const channels = [
  { id: "admin", label: "الإدارة" },
  { id: "technicians", label: "الفنيون" },
  { id: "branches", label: "الفروع" },
  { id: "purchasing", label: "فريق المشتريات" },
  { id: "general", label: "عام" },
];

const seed: Msg[] = [
  { id: "1", channel: "admin", author: "حافظ رحيم", role: "مدير النظام", text: "يرجى تأكيد وصول الفني لفرع التجمع.", time: "09:42" },
  { id: "2", channel: "technicians", author: "أحمد سامي", role: "فني", text: "وصلت الفرع وبدأت فحص الكاميرا 08.", time: "10:05" },
  { id: "3", channel: "purchasing", author: "منى خالد", role: "المشتريات", text: "تم اعتماد بطاقة الدخول، التسليم غداً.", time: "11:10" },
  { id: "4", channel: "general", author: "نور أحمد", role: "فرع مدينة نصر", text: "صباح الخير للجميع.", time: "08:30" },
];

const KEY = "wazeer-internal-chat";
export const CHAT_SYSTEM_STATUS_KEY = "wazeer-chat-system-enabled";
export const CHAT_LOCKED_CHANNELS_KEY = "wazeer-chat-locked-channels";
export const CHAT_STATUS_EVENT = "wazeer-chat-status-updated";

export function InternalChat({
  author,
  role,
  initialChannel = "admin",
  title = "المحادثة الداخلية",
  quickActions = [],
}: {
  author: string;
  role: string;
  initialChannel?: string;
  title?: string;
  quickActions?: string[];
}) {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [channel, setChannel] = useState(initialChannel);
  const [text, setText] = useState("");
  const [chatEnabled, setChatEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(CHAT_SYSTEM_STATUS_KEY) !== "false";
  });
  const [lockedChannels, setLockedChannels] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(CHAT_LOCKED_CHANNELS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = () => {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        try {
          const sanitized = raw.includes("قارئ") ? raw.replaceAll("قارئ", "بطاقة") : raw;
          if (sanitized !== raw) localStorage.setItem(KEY, sanitized);
          setMsgs(JSON.parse(sanitized));
        } catch { /* ignore */ }
      }

      try {
        const rawLocks = localStorage.getItem(CHAT_LOCKED_CHANNELS_KEY);
        if (rawLocks) setLockedChannels(JSON.parse(rawLocks));
      } catch { /* ignore */ }
    };
    loadData();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === KEY) loadData();
      if (e.key === CHAT_SYSTEM_STATUS_KEY) {
        setChatEnabled(e.newValue !== "false");
      }
      if (e.key === CHAT_LOCKED_CHANNELS_KEY) {
        try {
          setLockedChannels(e.newValue ? JSON.parse(e.newValue) : []);
        } catch { /* ignore */ }
      }
    };
    const handleStatusEvent = () => {
      setChatEnabled(localStorage.getItem(CHAT_SYSTEM_STATUS_KEY) !== "false");
      try {
        const rawLocks = localStorage.getItem(CHAT_LOCKED_CHANNELS_KEY);
        setLockedChannels(rawLocks ? JSON.parse(rawLocks) : []);
      } catch { /* ignore */ }
      loadData();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CHAT_STATUS_EVENT, handleStatusEvent);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CHAT_STATUS_EVENT, handleStatusEvent);
    };
  }, []);

  const isChannelLocked = lockedChannels.includes(channel);
  const isAdmin = role.includes("مدير") || role.includes("إدارة") || role.includes("HR") || role.includes("موارد");
  const canSend = chatEnabled && (!isChannelLocked || isAdmin);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [msgs, channel]);

  const send = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    if (!chatEnabled) return;
    const content = (customText ?? text).trim();
    if (!content) return;
    const now = new Date();
    const m: Msg = { id: String(Date.now()), channel, author, role, text: content, time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` };
    const next = [...msgs, m];
    setMsgs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CHAT_STATUS_EVENT));
    setText("");
  };

  const list = msgs.filter((m) => m.channel === channel);
  return <Panel title={title} icon={MessageSquare}>
    <div className="grid md:grid-cols-[180px_1fr]">
      <nav className="flex gap-1 overflow-x-auto border-b border-border p-2 md:flex-col md:border-b-0 md:border-l">
        {channels.map((c) => <button key={c.id} onClick={() => setChannel(c.id)} className={cn("flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors", channel === c.id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-foreground/80")}><Hash className="h-4 w-4" />{c.label}<span className="mr-auto text-xs opacity-70">{msgs.filter((m) => m.channel === c.id).length}</span></button>)}
      </nav>
      <div className="flex h-[480px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {list.length === 0 && <p className="text-center text-sm text-muted-foreground">لا توجد رسائل بعد في هذه القناة.</p>}
          {list.map((m) => { const mine = m.author === author; return <div key={m.id} className={cn("flex", mine ? "justify-start" : "justify-end")}><div className={cn("max-w-[80%] rounded-lg px-3.5 py-2.5 shadow-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}><div className="flex items-center gap-2"><p className="text-xs font-bold opacity-90">{m.author}</p><span className="text-[10px] opacity-70">({m.role})</span></div><p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p><p className="mt-1 text-[10px] opacity-60 text-left">{m.time}</p></div></div>; })}
          <div ref={endRef} />
        </div>
        {quickActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-border/60 bg-surface/50 px-3 py-2">
            <span className="text-[11px] font-bold text-muted-foreground self-center ml-1">رسائل سريعة:</span>
            {quickActions.map((qa, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(qa)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-brand-ink transition-colors hover:bg-surface hover:border-brand-gold/50"
              >
                {qa}
              </button>
            ))}
          </div>
        )}
        {!chatEnabled ? (
          <div className="flex items-center gap-2 border-t border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <span>⚠️</span>
            <span>تم إيقاف نظام المحادثات مؤقتاً بواسطة الإدارة. لا يمكن إرسال رسائل جديدة حالياً.</span>
          </div>
        ) : isChannelLocked && !isAdmin ? (
          <div className="flex items-center gap-2 border-t border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span>🔒</span>
            <span>هذه القناة مخصصة للتعاميم والإعلانات من الإدارة / الموارد البشرية فقط، والردود مغلقة.</span>
          </div>
        ) : null}
        <form onSubmit={send} className="flex gap-2 border-t border-border p-3 bg-card">
          <Input
            disabled={!canSend}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              !chatEnabled
                ? "المحادثة متوقفة مؤقتاً من قبل الإدارة..."
                : isChannelLocked && !isAdmin
                  ? "الردود معطلة في هذا الإعلان / القناة..."
                  : "اكتب رسالة للتواصل..."
            }
          />
          <Button type="submit" size="icon" aria-label="إرسال" disabled={!canSend}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  </Panel>;
}
