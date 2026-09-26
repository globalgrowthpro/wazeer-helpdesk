import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDownToLine,
  Bell,
  BellOff,
  Building2,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Hash,
  Info,
  LifeBuoy,
  Lock,
  Megaphone,
  MessageSquare,
  Pin,
  Plus,
  Power,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/helpdesk/app-shell";
import {
  CHAT_LOCKED_CHANNELS_KEY,
  CHAT_STATUS_EVENT,
  CHAT_SYSTEM_STATUS_KEY,
} from "@/components/helpdesk/internal-chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import { exportToExcel } from "@/lib/export-excel";
import { technicians, tickets } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "مركز المحادثات والتنسيق المركزي | وزير الحلو" },
      {
        name: "description",
        content: "غرفة العمليات المركزية لمتابعة محادثات الدعم، الفروع، الفنيين الميدانيين والمشتريات وإنشاء مجموعات العمل.",
      },
      { property: "og:title", content: "مركز المحادثات والتنسيق المركزي | وزير الحلو" },
      { property: "og:description", content: "غرفة العمليات المركزية والتنسيق الفوري لعمليات الصيانة والدعم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminChatCenter,
});

type MessagePriority = "normal" | "urgent" | "broadcast";

type ChatMessage = {
  id: string;
  channel: string;
  author: string;
  role: string;
  text: string;
  time: string;
  priority?: MessagePriority;
  pinned?: boolean;
  noReply?: boolean;
};

export type GroupMember = {
  id: string;
  name: string;
  role: string;
  type: "tech" | "branch" | "admin" | "hr";
};

export type CustomGroup = {
  id: string;
  name: string;
  desc: string;
  category: "operations" | "hr" | "urgent" | "procurement" | "general";
  badge: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: string;
  isAnnouncementOnly?: boolean;
};

const CHAT_STORAGE_KEY = "wazeer-internal-chat";
const CHAT_CUSTOM_GROUPS_KEY = "wazeer-chat-custom-groups";
const SOUND_KEY = "wazeer-chat-sound-enabled";

// Candidates list for adding members to groups
const systemCandidates: GroupMember[] = [
  // HR & Administration
  { id: "hafez", name: "م. حافظ رحيم", role: "مدير النظام والعمليات", type: "admin" },
  { id: "sara-hr", name: "سارة كمال", role: "إدارة الموارد البشرية (HR)", type: "hr" },
  { id: "mona-purchasing", name: "منى خالد", role: "إدارة المشتريات والتوريدات", type: "admin" },
  { id: "tarek-supervisor", name: "طارق حسني", role: "مشرف وردية العمليات", type: "admin" },
  // Technicians
  { id: "ahmed-samy", name: "أحمد سامي", role: "فني كاميرات مراقبة", type: "tech" },
  { id: "mahmoud-adel", name: "محمود عادل", role: "فني شبكات وخوادم", type: "tech" },
  { id: "sara-waleed", name: "سارة وليد", role: "فنية أنظمة تحكم وبطاقات", type: "tech" },
  { id: "khaled-hassan", name: "خالد حسن", role: "فني صيانة عامة وتشغيل", type: "tech" },
  // Branch Managers
  { id: "branch-04-mgr", name: "كريم محمود (فرع التجمع)", role: "مدير فرع التجمع", type: "branch" },
  { id: "branch-12-mgr", name: "نور أحمد (فرع مدينة نصر)", role: "مدير فرع مدينة نصر", type: "branch" },
  { id: "branch-02-mgr", name: "عمر حسن (فرع المعادي)", role: "مدير فرع المعادي", type: "branch" },
  { id: "branch-07-mgr", name: "إبراهيم خليل (فرع الشيخ زايد)", role: "مدير فرع الشيخ زايد", type: "branch" },
  { id: "branch-09-mgr", name: "ياسر سامي (فرع المهندسين)", role: "مدير فرع المهندسين", type: "branch" },
  { id: "branch-15-mgr", name: "هشام طلعت (فرع مصر الجديدة)", role: "مدير فرع مصر الجديدة", type: "branch" },
];

const initialCustomGroups: CustomGroup[] = [
  {
    id: "group-cameras-squad",
    name: "فريق طوارئ كاميرات المراقبة",
    desc: "متابعة صيانة ومحولات كاميرات فروع التجمع والمعادي",
    category: "operations",
    badge: "3 أعضاء",
    members: [
      { id: "hafez", name: "م. حافظ رحيم", role: "مدير النظام والعمليات", type: "admin" },
      { id: "ahmed-samy", name: "أحمد سامي", role: "فني كاميرات مراقبة", type: "tech" },
      { id: "branch-04-mgr", name: "كريم محمود (فرع التجمع)", role: "مدير فرع التجمع", type: "branch" },
    ],
    createdBy: "حافظ رحيم",
    createdAt: "2026-09-25",
    isAnnouncementOnly: false,
  },
  {
    id: "group-hr-roster",
    name: "لجنة الموارد البشرية والورديات",
    desc: "تنسيق جداول الورديات وتعيينات فرق الصيانة وتحديث البوابات",
    category: "hr",
    badge: "إعلانات HR",
    members: [
      { id: "sara-hr", name: "سارة كمال", role: "إدارة الموارد البشرية (HR)", type: "hr" },
      { id: "hafez", name: "م. حافظ رحيم", role: "مدير النظام والعمليات", type: "admin" },
      { id: "branch-12-mgr", name: "نور أحمد (فرع مدينة نصر)", role: "مدير فرع مدينة نصر", type: "branch" },
      { id: "branch-02-mgr", name: "عمر حسن (فرع المعادي)", role: "مدير فرع المعادي", type: "branch" },
    ],
    createdBy: "سارة كمال",
    createdAt: "2026-09-24",
    isAnnouncementOnly: true,
  },
];

const defaultChannels = [
  { id: "admin", label: "الإدارة والعمليات", desc: "التنسيق العام بين إدارة العمليات ومديري القطاعات", icon: Megaphone, category: "core", badge: "أولوية عليا", color: "text-rose-500" },
  { id: "technicians", label: "فنيو الميدان", desc: "المتابعة اللحظية لفرق الصيانة والزيارات الميدانية", icon: Wrench, category: "core", badge: "3 فنيين نشطين", color: "text-amber-500" },
  { id: "branches", label: "الفروع والبلاغات", desc: "التواصل اليومي المباشر مع مديري الفروع", icon: Building2, category: "branches", badge: "4 فروع متصلة", color: "text-sky-500" },
  { id: "purchasing", label: "المشتريات وقطع الغيار", desc: "اعتمادات أوامر الشراء وقطع الغيار والموردين", icon: LifeBuoy, category: "core", badge: "طلبات معتمدة", color: "text-emerald-500" },
  { id: "urgent", label: "الطوارئ والأعطال الحرجة", desc: "قناة التدخل السريع للحالات التي تؤثر على استمرارية العمل", icon: ShieldAlert, category: "core", badge: "🚨 عاجل", color: "text-red-600" },
  { id: "general", label: "عام وإعلانات الشركة", desc: "التعاميم والتنبيهات العامة لجميع منسوبي الصيانة", icon: Hash, category: "core", badge: "عام", color: "text-slate-500" },
  // Direct branch channels
  { id: "branch-04", label: "مباشر: فرع التجمع", desc: "متابعة بلاغات كاميرات المراقبة ومنطقة الاستلام", icon: Building2, category: "direct", badge: "مباشر", color: "text-emerald-600" },
  { id: "branch-02", label: "مباشر: فرع المعادي", desc: "متابعة عطل بطاقة تحكم الدخول وبوابة التوريد", icon: Building2, category: "direct", badge: "مباشر", color: "text-amber-600" },
  { id: "branch-12", label: "مباشر: فرع مدينة نصر", desc: "متابعة نقطة شبكة الكاشير ومعدات البيع", icon: Building2, category: "direct", badge: "مباشر", color: "text-sky-600" },
  { id: "branch-08", label: "مباشر: فرع مصر الجديدة", desc: "متابعة صالة العرض والمخبوزات وأجهزة المراقبة", icon: Building2, category: "direct", badge: "مباشر", color: "text-purple-600" },
];

const seedMessages: ChatMessage[] = [
  { id: "1", channel: "admin", author: "حافظ رحيم", role: "مدير النظام", text: "صباح الخير للجميع. يُرجى مراجعة كافة بلاغات الكاميرات ونقاط البيع اليوم وإعطاؤها الأولوية القصوى.", time: "08:30", priority: "broadcast", pinned: true },
  { id: "2", channel: "admin", author: "أحمد سامي", role: "فني كاميرات", text: "تم استلام البلاغ HD-2026-000452 وأنا الآن في فرع التجمع لفحص كابل PoE ومحول الطاقة.", time: "09:40", priority: "normal" },
  { id: "3", channel: "admin", author: "حافظ رحيم", role: "مدير النظام", text: "ممتاز يا أحمد، تأكد من استقرار الصورة قبل المغادرة وتأكيد التقرير هنا.", time: "09:42", priority: "normal" },
  { id: "4", channel: "technicians", author: "سارة وليد", role: "فنية شبكات وتحكم", text: "فرع المعادي يحتاج بطاقة دخول بديلة لبوابة الموظفين، تم رفع طلب الشراء PR-2026-0082.", time: "10:15", priority: "urgent" },
  { id: "5", channel: "technicians", author: "محمود عادل", role: "فني شبكات", text: "نقطة الكاشير في فرع مدينة نصر تعمل الآن بعد استبدال طرف كابل CAT6 وإعادة الضبط.", time: "10:35", priority: "normal" },
  { id: "6", channel: "purchasing", author: "منى خالد", role: "المشتريات", text: "تم اعتماد بطاقة الدخول البديلة لفرع المعادي، التوريد مجدول غداً الساعة 10:00 صباحاً.", time: "11:10", priority: "normal" },
  { id: "7", channel: "branches", author: "كريم فهمي", role: "مدير فرع المعادي", text: "نشكر فريق الصيانة والمشتريات على سرعة الاستجابة لاعتماد بطاقة الدخول البديلة.", time: "11:30", priority: "normal" },
  { id: "8", channel: "branch-04", author: "أحمد سامي", role: "فني كاميرات", text: "تم الانتهاء من فحص كاميرا 08، العطل كان في موصل الكابل وتم تغييره بنجاح.", time: "11:45", priority: "normal" },
  { id: "9", channel: "urgent", author: "طارق حسني", role: "مشرف وردية", text: "تنبيه طارئ: تم الإبلاغ عن حرارة مرتفعة في خزانة خوادم التجمع. تم إرسال فني لمعاينة التبريد فوراً.", time: "12:05", priority: "urgent", pinned: true },
  { id: "10", channel: "general", author: "سارة كمال", role: "الموارد البشرية (HR)", text: "📢 تعميم رسمي من إدارة الموارد البشرية: نلفت عناية السادة العاملين بجميع الفروع إلى ضرورة الالتزام بمواعيد تسجيل الحضور والانصراف عبر البوابة الإلكترونية وتحديث حالة المهام أولاً بأول. هذا الإعلان للمطالعة فقط ومغلق الردود.", time: "12:30", priority: "broadcast", pinned: true, noReply: true },
  { id: "g1-1", channel: "group-cameras-squad", author: "حافظ رحيم", role: "مدير النظام", text: "تم إنشاء هذه المجموعة لتنسيق أعمال صيانة الكاميرات العاجلة بين إدارة العمليات وفرع التجمع والفني أحمد سامي.", time: "09:00", priority: "normal" },
  { id: "g1-2", channel: "group-cameras-squad", author: "أحمد سامي", role: "فني كاميرات", text: "تم تأكيد الانضمام للمجموعة، وسأوافيكم بأي تطورات فورية هنا.", time: "09:05", priority: "normal" },
  { id: "g2-1", channel: "group-hr-roster", author: "سارة كمال", role: "الموارد البشرية (HR)", text: "📢 تعميم من الموارد البشرية: تم اعتماد جدول ورديات فرق الدعم للفترة القادمة. هذه المجموعة مخصصة للتعاميم الرسمية.", time: "08:00", priority: "broadcast", pinned: true, noReply: true },
];

function playNotificationChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch {
    // AudioContext blocked or unsupported
  }
}

function AdminChatCenter() {
  const { user } = useSession();
  const searchInputId = useId();

  // Master System Control: On / Off Toggle
  const [chatSystemEnabled, setChatSystemEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(CHAT_SYSTEM_STATUS_KEY) !== "false";
  });

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(SOUND_KEY) !== "false";
  });

  // Custom Groups state
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>(() => {
    if (typeof window === "undefined") return initialCustomGroups;
    try {
      const raw = localStorage.getItem(CHAT_CUSTOM_GROUPS_KEY);
      return raw ? JSON.parse(raw) : initialCustomGroups;
    } catch {
      return initialCustomGroups;
    }
  });

  const [activeChannelId, setActiveChannelId] = useState<string>("admin");
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [inputText, setInputText] = useState("");
  const [priority, setPriority] = useState<MessagePriority>("normal");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "core" | "groups" | "direct">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);

  // Group creation modal state
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  // Default collapsed group members section as requested
  const [isGroupMembersCollapsed, setIsGroupMembersCollapsed] = useState(true);
  const [isTicketsCollapsed, setIsTicketsCollapsed] = useState(false);
  const [isFieldTeamCollapsed, setIsFieldTeamCollapsed] = useState(false);

  // Individual channel reply lock state
  const [lockedChannels, setLockedChannels] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["general", "group-hr-roster"];
    try {
      const raw = localStorage.getItem(CHAT_LOCKED_CHANNELS_KEY);
      return raw ? JSON.parse(raw) : ["general", "group-hr-roster"];
    } catch {
      return ["general", "group-hr-roster"];
    }
  });

  // Per-message announcement no-reply checkbox
  const [isNoReplyAnnouncement, setIsNoReplyAnnouncement] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if current user is Admin or HR
  const canManageGroups = useMemo(() => {
    const roleStr = (user?.roleLabel || user?.role || "").toLowerCase();
    return roleStr.includes("مدير") || roleStr.includes("إدارة") || roleStr.includes("admin") || roleStr.includes("hr") || roleStr.includes("موارد");
  }, [user]);

  // Synchronize messages & status from localStorage
  useEffect(() => {
    const loadStoredData = () => {
      const rawMsgs = localStorage.getItem(CHAT_STORAGE_KEY);
      if (rawMsgs) {
        try {
          const sanitized = rawMsgs.includes("قارئ") ? rawMsgs.replaceAll("قارئ", "بطاقة") : rawMsgs;
          if (sanitized !== rawMsgs) localStorage.setItem(CHAT_STORAGE_KEY, sanitized);
          const parsed = JSON.parse(sanitized);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch {
          // keep existing state
        }
      }

      const rawGroups = localStorage.getItem(CHAT_CUSTOM_GROUPS_KEY);
      if (rawGroups) {
        try {
          setCustomGroups(JSON.parse(rawGroups));
        } catch {
          // keep existing state
        }
      }

      const rawEnabled = localStorage.getItem(CHAT_SYSTEM_STATUS_KEY);
      if (rawEnabled !== null) {
        setChatSystemEnabled(rawEnabled !== "false");
      }

      try {
        const rawLocks = localStorage.getItem(CHAT_LOCKED_CHANNELS_KEY);
        if (rawLocks) setLockedChannels(JSON.parse(rawLocks));
      } catch {
        // keep existing state
      }
    };

    loadStoredData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CHAT_STORAGE_KEY) loadStoredData();
      if (e.key === CHAT_CUSTOM_GROUPS_KEY) loadStoredData();
      if (e.key === CHAT_SYSTEM_STATUS_KEY) {
        setChatSystemEnabled(e.newValue !== "false");
      }
      if (e.key === CHAT_LOCKED_CHANNELS_KEY) {
        try {
          setLockedChannels(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          // ignore
        }
      }
    };

    const handleStatusEvent = () => loadStoredData();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CHAT_STATUS_EVENT, handleStatusEvent);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CHAT_STATUS_EVENT, handleStatusEvent);
    };
  }, []);

  // Auto-scroll when messages change or channel changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, activeChannelId]);

  // Master switch toggle
  const handleToggleChatSystem = (enabled: boolean) => {
    setChatSystemEnabled(enabled);
    localStorage.setItem(CHAT_SYSTEM_STATUS_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent(CHAT_STATUS_EVENT));

    if (enabled) {
      toast.success("تم تفعيل نظام المحادثة بنجاح", {
        description: "أصبح بإمكان الفروع والفنيين إرسال واستقبال الرسائل بشكل فوري.",
      });
    } else {
      toast.warning("تم إيقاف نظام المحادثة مؤقتاً", {
        description: "تم حظر إرسال الرسائل لجميع الفروع والفنيين حتى إعادة التفعيل.",
      });
    }
  };

  // Toggle individual channel reply lock (On / Off for this conversation)
  const handleToggleChannelReplyLock = (channelId: string) => {
    setLockedChannels((prev) => {
      const isCurrentlyLocked = prev.includes(channelId);
      const next = isCurrentlyLocked ? prev.filter((id) => id !== channelId) : [...prev, channelId];
      localStorage.setItem(CHAT_LOCKED_CHANNELS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(CHAT_STATUS_EVENT));

      const targetTitle = activeChannel.label;
      if (!isCurrentlyLocked) {
        toast.warning(`تم قفل الردود في ${targetTitle}`, {
          description: "المحادثة الآن مخصصة للإعلانات والتعاميم فقط (بدون استقبال ردود من الأعضاء).",
        });
      } else {
        toast.success(`تم فتح الردود في ${targetTitle}`, {
          description: "أصبح بإمكان جميع الأعضاء إرسال الردود بشكل طبيعي في هذه المحادثة.",
        });
      }
      return next;
    });
  };

  // Toggle Sound
  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem(SOUND_KEY, enabled ? "true" : "false");
    if (enabled) {
      playNotificationChime();
      toast.info("تم تفعيل التنبيهات الصوتية للمحادثات");
    } else {
      toast.info("تم كتم التنبيهات الصوتية للمحادثات");
    }
  };

  // Active channel details (check default channels or custom groups)
  const activeChannel = useMemo(() => {
    const foundGroup = customGroups.find((g) => g.id === activeChannelId);
    if (foundGroup) {
      return {
        id: foundGroup.id,
        label: foundGroup.name,
        desc: foundGroup.desc,
        icon: Users,
        category: "groups",
        badge: foundGroup.badge,
        color: "text-amber-500",
        isGroup: true,
        groupData: foundGroup,
      };
    }
    const foundDefault = defaultChannels.find((c) => c.id === activeChannelId);
    return foundDefault ? { ...foundDefault, isGroup: false } : { ...defaultChannels[0]!, isGroup: false };
  }, [activeChannelId, customGroups]);

  // Messages in current channel, filtered by search query
  const channelMessages = useMemo(() => {
    const list = messages.filter((m) => m.channel === activeChannelId);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (m) => m.text.toLowerCase().includes(q) || m.author.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [messages, activeChannelId, searchQuery]);

  // Channel unread/total badges
  const channelCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ch of defaultChannels) {
      map[ch.id] = messages.filter((m) => m.channel === ch.id).length;
    }
    for (const g of customGroups) {
      map[g.id] = messages.filter((m) => m.channel === g.id).length;
    }
    return map;
  }, [messages, customGroups]);

  // Filtered channel list
  const filteredChannels = useMemo(() => {
    let list: Array<{ id: string; label: string; desc: string; icon: typeof Hash; category: string; badge: string; color: string; isGroup?: boolean }> = [
      ...defaultChannels,
      ...customGroups.map((g) => ({
        id: g.id,
        label: g.name,
        desc: g.desc,
        icon: Users,
        category: "groups",
        badge: `${g.members.length} أعضاء`,
        color: "text-amber-500",
        isGroup: true,
      })),
    ];

    if (categoryFilter === "core") list = list.filter((c) => c.category === "core");
    else if (categoryFilter === "groups") list = list.filter((c) => c.category === "groups");
    else if (categoryFilter === "direct") list = list.filter((c) => c.category === "direct");

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((c) => c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }, [categoryFilter, searchQuery, customGroups]);

  // Create new group handler
  const handleCreateGroup = (newGroup: CustomGroup) => {
    const nextGroups = [newGroup, ...customGroups];
    setCustomGroups(nextGroups);
    localStorage.setItem(CHAT_CUSTOM_GROUPS_KEY, JSON.stringify(nextGroups));

    // If marked as announcement only, lock replies automatically
    if (newGroup.isAnnouncementOnly && !lockedChannels.includes(newGroup.id)) {
      const nextLocks = [...lockedChannels, newGroup.id];
      setLockedChannels(nextLocks);
      localStorage.setItem(CHAT_LOCKED_CHANNELS_KEY, JSON.stringify(nextLocks));
    }

    // Add initial system message to group
    const initialMsg: ChatMessage = {
      id: String(Date.now()),
      channel: newGroup.id,
      author: user?.name ?? "إدارة العمليات",
      role: user?.roleLabel ?? "مدير النظام",
      text: `🎉 تم إنشاء المجموعة بنجاح: "${newGroup.name}" بواسطة ${user?.name ?? "الإدارة"}. الأعضاء المشاركون: ${newGroup.members.map((m) => m.name).join("، ")}.`,
      time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
      priority: "broadcast",
      pinned: true,
    };
    const nextMessages = [...messages, initialMsg];
    setMessages(nextMessages);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextMessages));

    window.dispatchEvent(new CustomEvent(CHAT_STATUS_EVENT));
    setActiveChannelId(newGroup.id);
    setCreateGroupOpen(false);

    toast.success(`تم إنشاء المجموعة بنجاح: ${newGroup.name}`, {
      description: `تمت إضافة ${newGroup.members.length} أعضاء إلى المجموعة.`,
    });
  };

  // Delete custom group
  const handleDeleteGroup = (groupId: string) => {
    const nextGroups = customGroups.filter((g) => g.id !== groupId);
    setCustomGroups(nextGroups);
    localStorage.setItem(CHAT_CUSTOM_GROUPS_KEY, JSON.stringify(nextGroups));
    setActiveChannelId("admin");
    window.dispatchEvent(new CustomEvent(CHAT_STATUS_EVENT));
    toast.success("تم حذف المجموعة من سجل الغرف");
  };

  // Update members in group
  const handleUpdateGroupMembers = (groupId: string, updatedMembers: GroupMember[]) => {
    const nextGroups = customGroups.map((g) => {
      if (g.id === groupId) {
        return { ...g, members: updatedMembers, badge: `${updatedMembers.length} أعضاء` };
      }
      return g;
    });
    setCustomGroups(nextGroups);
    localStorage.setItem(CHAT_CUSTOM_GROUPS_KEY, JSON.stringify(nextGroups));
    window.dispatchEvent(new CustomEvent(CHAT_STATUS_EVENT));
    setManageMembersOpen(false);
    toast.success("تم تحديث قائمة أعضاء المجموعة بنجاح");
  };

  // Send message handler
  const handleSendMessage = (customText?: string) => {
    const textToSend = (customText ?? inputText).trim();
    if (!textToSend) return;

    if (!chatSystemEnabled) {
      toast.error("نظام المحادثة متوقف حالياً", {
        description: "يرجى تشغيل النظام من المفتاح العلوي قبل إرسال الرسائل.",
      });
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const effectiveNoReply = isNoReplyAnnouncement;
    const effectivePriority = isNoReplyAnnouncement ? "broadcast" : priority;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      channel: activeChannelId,
      author: user?.name ?? "حافظ رحيم",
      role: user?.roleLabel ?? "مدير النظام",
      text: textToSend,
      time: timeStr,
      priority: effectivePriority,
      pinned: effectivePriority === "broadcast",
      noReply: effectiveNoReply,
    };

    if (effectiveNoReply && !lockedChannels.includes(activeChannelId)) {
      const nextLocks = [...lockedChannels, activeChannelId];
      setLockedChannels(nextLocks);
      localStorage.setItem(CHAT_LOCKED_CHANNELS_KEY, JSON.stringify(nextLocks));
    }

    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextMessages));
    window.dispatchEvent(new CustomEvent(CHAT_STATUS_EVENT));

    setInputText("");
    setPriority("normal");
    setIsNoReplyAnnouncement(false);

    if (soundEnabled) {
      playNotificationChime();
    }

    toast.success("تم إرسال الرسالة", {
      description: `في: ${activeChannel.label}`,
    });
  };

  // Copy message
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
    toast.info("تم نسخ نص الرسالة");
  };

  // Export current or all channel messages to Excel
  const handleExportChat = () => {
    const rows = channelMessages.map((m) => ({
      رقم_الرسالة: m.id,
      القناة_أو_المجموعة: activeChannel.label,
      المرسل: m.author,
      الدور_الوظيفي: m.role,
      نص_الرسالة: m.text,
      الوقت: m.time,
      الأولوية: m.priority === "urgent" ? "عاجل" : m.priority === "broadcast" ? "إعلان رسمي" : "عادي",
    }));

    exportToExcel({
      rows,
      fileName: `محادثات-${activeChannel.id}-${new Date().toISOString().slice(0, 10)}`,
      sheetName: activeChannel.label.slice(0, 25),
    });

    toast.success("تم تصدير سجل المحادثة بنجاح إلى ملف Excel");
  };

  // Clear current channel messages
  const handleClearChannel = () => {
    const nextMessages = messages.filter((m) => m.channel !== activeChannelId);
    setMessages(nextMessages);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextMessages));
    window.dispatchEvent(new CustomEvent(CHAT_STATUS_EVENT));
    setClearDialogOpen(false);
    toast.success(`تم مسح رسائل ${activeChannel.label}`);
  };

  // Quick reply chips
  const quickActions = [
    "📢 تعميم رسمي من الموارد البشرية: يُرجى تسجيل مواعيد الورديات بدقة عبر النظام (إعلان رسمي)",
    "📢 إشعار إداري: مواعيد الصيانة الدورية للأسبوع القادم معتمدة ولا تقبل التعديل",
    "🚨 بلاغ عاجل: تم توجيه فني فوري للموقع والمعاينة جارية",
    "✅ تم اعتماد طلب الشراء وصرف القطعة المطلوبة",
    "👨‍🔧 الفني أحمد سامي وصل موقع الفرع وبدأ فحص الأعطال",
    "📋 يرجى تزويدنا برقم البلاغ وتفاصيل العطل بدقة لتسريع الدعم",
    "👍 تم إصلاح العطل واختبار التشغيل بنجاح، يُرجى التأكيد",
  ];

  return (
    <AppShell
      title="مركز المحادثات والتنسيق المركزي"
      role="admin"
      allowedRoles={["admin", "hr"]}
    >
      <div className="space-y-4">
        {/* Top Operational Command Bar & Master On/Off Switch */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold/25 to-primary/20 text-brand-ink dark:text-brand-gold">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground sm:text-xl">
                    غرفة العمليات المركزية وإدارة المجموعات
                  </h1>
                  <Badge
                    variant={chatSystemEnabled ? "default" : "destructive"}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold",
                      chatSystemEnabled
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-amber-600 text-white hover:bg-amber-700",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        chatSystemEnabled ? "bg-white animate-pulse" : "bg-white/80",
                      )}
                    />
                    {chatSystemEnabled ? "الخدمة نشطة ومتاحة للجميع" : "الخدمة متوقفة مؤقتاً"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  إنشاء مجموعات العمل، تعيين الأعضاء، وإدارة قنوات التواصل بين الإدارة والموارد البشرية والفروع والفنيين.
                </p>
              </div>
            </div>

            {/* Master Switch & System Controls */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border/70 bg-surface/60 p-2.5">
              {/* Create Group Button (for Admin & HR) */}
              {canManageGroups && (
                <Button
                  size="sm"
                  onClick={() => setCreateGroupOpen(true)}
                  className="h-9 gap-1.5 bg-brand-gold text-brand-ink hover:bg-brand-gold/90 font-bold text-xs"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>إنشاء مجموعة جديدة</span>
                </Button>
              )}

              {/* Master Turn On/Off Switch */}
              <div className="flex items-center gap-3 border-l border-border/80 pl-3">
                <div className="text-right">
                  <label htmlFor="chat-system-switch" className="block text-xs font-bold text-foreground cursor-pointer">
                    نظام المحادثات
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {chatSystemEnabled ? "مفعّل وشغال" : "معطل للإدارة فقط"}
                  </span>
                </div>
                <Switch
                  id="chat-system-switch"
                  checked={chatSystemEnabled}
                  onCheckedChange={handleToggleChatSystem}
                  aria-label="تفعيل أو إيقاف نظام المحادثات"
                  className={cn(
                    chatSystemEnabled ? "!bg-emerald-600" : "!bg-slate-400 dark:!bg-slate-600",
                  )}
                />
              </div>

              {/* Sound Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleSound(!soundEnabled)}
                className="h-9 gap-1.5 text-xs"
                title={soundEnabled ? "كتم التنبيهات الصوتية" : "تشغيل التنبيهات الصوتية"}
              >
                {soundEnabled ? (
                  <>
                    <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">الصوت مفعّل</span>
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                    <span className="hidden sm:inline">الصوت صامت</span>
                  </>
                )}
              </Button>

              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportChat}
                className="h-9 gap-1.5 text-xs"
              >
                <ArrowDownToLine className="h-4 w-4 text-brand-ink" />
                <span className="hidden md:inline">تصدير Excel</span>
              </Button>

              {/* Clear messages button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClearDialogOpen(true)}
                className="h-9 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                title="مسح رسائل القناة الحالية"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              {/* Info panel toggle */}
              <Button
                variant={showInfoSidebar ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                className="h-9 gap-1 text-xs"
                title={showInfoSidebar ? "إخفاء الشريط الجانبي للتفاصيل" : "عرض تفاصيل الفرقة والأعضاء"}
              >
                <Info className="h-4 w-4" />
                <span className="hidden xl:inline">
                  {showInfoSidebar ? "إخفاء التفاصيل" : "بيانات الفرقة / الأعضاء"}
                </span>
              </Button>
            </div>
          </div>

          {/* System Disabled Warning Banner */}
          {!chatSystemEnabled && (
            <div className="mt-3.5 flex items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>تنبيه إداري:</strong> تم إيقاف نظام المحادثات. الفروع والفنيون لن يتمكنوا من إرسال رسائل جديدة حتى تفعيل المفتاح أعلاه.
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleChatSystem(true)}
                className="h-7 border-amber-500/50 bg-amber-500/20 text-xs font-bold text-amber-900 hover:bg-amber-500/30 dark:text-amber-100"
              >
                إعادة التفعيل الفوري
              </Button>
            </div>
          )}
        </div>

        {/* Main Chat Grid (Sidebar Channels + Chat Arena + Info Drawer) */}
        <div
          className={cn(
            "grid gap-4 lg:grid-cols-[290px_1fr]",
            showInfoSidebar
              ? "xl:grid-cols-[300px_1fr_310px]"
              : "xl:grid-cols-[300px_1fr]"
          )}
        >
          {/* Right Column: Channels & Groups List */}
          <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Search & Channel Filters */}
            <div className="space-y-2.5 border-b border-border p-3 bg-surface/50">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={searchInputId}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في القنوات والمجموعات..."
                    className="h-8 pr-8.5 text-xs bg-card"
                    aria-label="بحث في القنوات والرسائل"
                  />
                </div>

                {canManageGroups && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCreateGroupOpen(true)}
                    className="h-8 w-8 shrink-0 border-brand-gold/50 text-brand-ink dark:text-brand-gold"
                    title="إنشاء مجموعة جديدة"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors shrink-0",
                    categoryFilter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-surface-strong text-muted-foreground",
                  )}
                >
                  الكل ({filteredChannels.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("groups")}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors shrink-0",
                    categoryFilter === "groups"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-surface-strong text-muted-foreground",
                  )}
                >
                  المجموعات ({customGroups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("core")}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors shrink-0",
                    categoryFilter === "core"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-surface-strong text-muted-foreground",
                  )}
                >
                  العمليات
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("direct")}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors shrink-0",
                    categoryFilter === "direct"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-surface-strong text-muted-foreground",
                  )}
                >
                  الفروع
                </button>
              </div>
            </div>

            {/* Channels & Groups Scroll Area */}
            <div className="flex-1 divide-y divide-border/60 overflow-y-auto max-h-[620px]">
              {filteredChannels.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  لا توجد قنوات أو مجموعات تطابق البحث
                </div>
              )}
              {filteredChannels.map((channel) => {
                const Icon = channel.icon;
                const active = channel.id === activeChannelId;
                const count = channelCounts[channel.id] ?? 0;
                const isLocked = lockedChannels.includes(channel.id);

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setActiveChannelId(channel.id)}
                    className={cn(
                      "flex w-full items-start gap-2.5 p-3 text-right transition-colors border-r-3",
                      active
                        ? "border-brand-gold bg-primary/10 text-foreground font-semibold"
                        : "border-transparent hover:bg-surface/70 text-foreground/80",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-strong",
                        channel.color,
                        channel.isGroup && "bg-brand-gold/15 text-brand-ink dark:text-brand-gold",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate text-xs font-bold text-foreground">
                            {channel.label}
                          </span>
                          {channel.isGroup && (
                            <Badge variant="secondary" className="text-[9px] py-0 px-1 font-mono">
                              مجموعة
                            </Badge>
                          )}
                          {isLocked && (
                            <span title="الردود مغلقة (إعلانات فقط)">
                              <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        {count > 0 && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.2 text-[10px] font-bold font-mono",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-surface-strong text-muted-foreground",
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {channel.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Quick Action */}
            <div className="border-t border-border p-2.5 bg-surface/30 flex items-center justify-between text-[11px] text-muted-foreground">
              {canManageGroups ? (
                <button
                  type="button"
                  onClick={() => setCreateGroupOpen(true)}
                  className="flex items-center gap-1.5 text-brand-ink dark:text-brand-gold font-bold hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>إنشاء مجموعة جديدة</span>
                </button>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  الاتصال: خادم العمليات الداخلي
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px]"
                onClick={() => toast.info("تم تحديث قنوات ومجموعات الاتصال")}
              >
                <RefreshCw className="h-3 w-3 ml-1" />
                تحديث
              </Button>
            </div>
          </div>

          {/* Center Column: Live Conversation Arena */}
          <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden min-h-[640px]">
            {/* Room Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/40 p-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-border shadow-xs",
                    activeChannel.color,
                  )}
                >
                  <activeChannel.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground sm:text-base">
                      {activeChannel.label}
                    </h2>
                    <Badge variant="outline" className="text-[10px] font-semibold py-0">
                      {activeChannel.badge}
                    </Badge>
                    {activeChannel.isGroup && (
                      <Badge className="bg-brand-gold text-brand-ink text-[10px] py-0 font-bold">
                        مجموعة مخصصة
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground hidden sm:block">
                    {activeChannel.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Manage members if custom group */}
                {activeChannel.isGroup && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManageMembersOpen(true)}
                    className="h-8 gap-1.5 text-xs font-semibold"
                  >
                    <Users className="h-3.5 w-3.5 text-brand-gold" />
                    <span>الأعضاء ({activeChannel.groupData?.members.length ?? 0})</span>
                  </Button>
                )}

                {/* Individual Channel Reply On/Off Toggle */}
                <Button
                  variant={lockedChannels.includes(activeChannelId) ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleToggleChannelReplyLock(activeChannelId)}
                  className={cn(
                    "h-8 gap-1.5 text-xs font-bold transition-all",
                    lockedChannels.includes(activeChannelId)
                      ? "bg-amber-500/15 text-amber-800 border-amber-500/40 hover:bg-amber-500/25 dark:text-amber-200"
                      : "text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/10 dark:text-emerald-400",
                  )}
                  title={
                    lockedChannels.includes(activeChannelId)
                      ? "الردود مقفلة حالياً. انقر لإتاحة الردود للجميع"
                      : "الردود متاحة. انقر لقفل الردود وجعل هذه القناة إعلاناً فقط"
                  }
                >
                  {lockedChannels.includes(activeChannelId) ? (
                    <>
                      <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>الردود: مغلقة (إعلان فقط)</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>الردود: مسموحة</span>
                    </>
                  )}
                </Button>

                {/* Export button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportChat}
                  className="h-8 gap-1 text-xs"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-brand-ink" />
                  <span>تصدير</span>
                </Button>

                {/* Delete group button if custom group */}
                {activeChannel.isGroup && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGroup(activeChannel.id)}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                    title="حذف هذه المجموعة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Pinned Broadcast Banner */}
            <div className="flex items-center gap-2.5 border-b border-brand-gold/30 bg-gradient-to-r from-brand-gold/15 via-brand-gold/10 to-transparent px-4 py-2 text-xs font-semibold text-brand-ink dark:text-brand-gold">
              <Pin className="h-3.5 w-3.5 shrink-0 text-brand-gold fill-brand-gold" />
              <span className="truncate">
                {activeChannel.isGroup
                  ? `مجموعة عمل خاصة: تم إنشاؤها للتنسيق المباشر بين الأعضاء المحددين.`
                  : "توجيه الإدارة: سرعة مراجعة وإغلاق بلاغات كاميرات التجمع ونقاط البيع قبل تقرير الوردية."}
              </span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4 bg-background/50">
              {channelMessages.length === 0 && (
                <div className="flex h-56 flex-col items-center justify-center text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-surface-strong text-muted-foreground">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-foreground">لا توجد رسائل بعد في هذه المحادثة</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeChannel.isGroup
                      ? "ابدأ بتوجيه أول رسالة أو إعلان لأعضاء المجموعة المحددين أدناه."
                      : "ابدأ المحادثة بإرسال توجيه أو استفسار لفريق العمل أدناه."}
                  </p>
                </div>
              )}

              {channelMessages.map((msg) => {
                const isAdmin = msg.role.includes("مدير") || msg.author.includes("حافظ");
                const isUrgent = msg.priority === "urgent";
                const isBroadcast = msg.priority === "broadcast";

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "group flex gap-3 transition-colors rounded-xl p-2.5",
                      isBroadcast
                        ? "border border-brand-gold/40 bg-brand-gold/5"
                        : isUrgent
                          ? "border border-red-500/30 bg-red-500/5"
                          : "hover:bg-surface/50",
                    )}
                  >
                    {/* User Avatar */}
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-border">
                      <AvatarFallback
                        className={cn(
                          "text-xs font-bold font-display",
                          isAdmin
                            ? "bg-brand-ink text-brand-gold"
                            : "bg-surface-strong text-foreground",
                        )}
                      >
                        {msg.author.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{msg.author}</span>
                          <Badge
                            variant={isAdmin ? "default" : "secondary"}
                            className="text-[10px] py-0 px-1.5 font-normal"
                          >
                            {msg.role}
                          </Badge>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-bold">
                              🚨 عاجل
                            </Badge>
                          )}
                          {isBroadcast && (
                            <Badge className="bg-brand-gold text-brand-ink text-[10px] py-0 px-1.5 font-bold">
                              📢 إعلان
                            </Badge>
                          )}
                          {msg.noReply && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 font-bold border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 flex items-center gap-1"
                            >
                              <Lock className="h-2.5 w-2.5" />
                              إعلان مغلق الردود
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="font-mono">{msg.time}</span>
                          <CheckCheck className="h-3 w-3 text-emerald-600" />
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                            title="نسخ الرسالة"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="mt-1 text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Response Bar */}
            <div className="border-t border-border/70 bg-surface/40 px-3 py-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-brand-gold" />
                  ردود وإعلانات:
                </span>
                {quickActions.map((qa, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={!chatSystemEnabled}
                    onClick={() => handleSendMessage(qa)}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:bg-surface hover:border-brand-gold/60 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {qa.slice(0, 34)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Message Composer */}
            <div className="border-t border-border p-3 bg-card">
              {!chatSystemEnabled ? (
                <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>المحادثات متوقفة حالياً. لإرسال رسائل أو استقبال ردود، قم بتفعيل النظام أعلاه.</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleChatSystem(true)}
                    className="h-7 text-xs font-bold"
                  >
                    تفعيل الآن
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="space-y-2.5"
                >
                  {/* Status Banner when replies are locked */}
                  {lockedChannels.includes(activeChannelId) && (
                    <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>هذه القناة مقفلة للردود أمام الفروع والفنيين (وضع الإعلانات الرسمية فقط).</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleChannelReplyLock(activeChannelId)}
                        className="h-6 px-2 text-[11px] font-bold text-amber-900 hover:bg-amber-500/20 dark:text-amber-100"
                      >
                        إتاحة الردود للجميع
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Priority Selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-muted-foreground font-semibold">نوع التوجيه:</span>
                      <button
                        type="button"
                        onClick={() => setPriority("normal")}
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-bold transition-colors",
                          priority === "normal"
                            ? "bg-surface-strong text-foreground border border-border"
                            : "text-muted-foreground hover:bg-surface",
                        )}
                      >
                        عادي
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority("urgent")}
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-bold transition-colors",
                          priority === "urgent"
                            ? "bg-red-600 text-white"
                            : "text-red-600 hover:bg-red-500/10",
                        )}
                      >
                        🚨 عاجل
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority("broadcast")}
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-bold transition-colors",
                          priority === "broadcast"
                            ? "bg-brand-gold text-brand-ink"
                            : "text-brand-ink dark:text-brand-gold hover:bg-brand-gold/10",
                        )}
                      >
                        📢 إعلان رسمي
                      </button>
                    </div>

                    {/* No-reply announcement checkbox */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={isNoReplyAnnouncement}
                        onChange={(e) => {
                          setIsNoReplyAnnouncement(e.target.checked);
                          if (e.target.checked) setPriority("broadcast");
                        }}
                        className="rounded border-border accent-brand-gold h-3.5 w-3.5"
                      />
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        إعلان أحادي الاتجاه (بدون قبول ردود)
                      </span>
                    </label>

                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      Enter للإرسال · Shift+Enter لسطر جديد
                    </span>
                  </div>

                  <div className="flex gap-2 items-end">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={
                        isNoReplyAnnouncement
                          ? `اكتب إعلاناً رسمياً أو تعميماً في "${activeChannel.label}" (لن يتم قبول ردود عليه)...`
                          : `اكتب رسالة أو توجيهاً في قناة "${activeChannel.label}"...`
                      }
                      rows={2}
                      className="resize-none min-h-[52px] text-xs sm:text-sm bg-background"
                      aria-label="نص الرسالة"
                    />

                    <Button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="h-[52px] px-5 gap-1.5 shrink-0 bg-brand-gold text-brand-ink hover:bg-brand-gold/90 font-bold"
                    >
                      <span>إرسال</span>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Left Column: Context Drawer (Active Staff, Groups & Linked Tickets) */}
          {showInfoSidebar && (
            <div className="flex flex-col gap-4">
              {/* If active channel is Custom Group: show its members (Collapsed by default) */}
              {activeChannel.isGroup && activeChannel.groupData && (
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsGroupMembersCollapsed(!isGroupMembersCollapsed)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-surface/60 transition-colors text-right cursor-pointer"
                    aria-expanded={!isGroupMembersCollapsed}
                    title={isGroupMembersCollapsed ? "توسيع قائمة الأعضاء" : "طي قائمة الأعضاء"}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-gold shrink-0" />
                      <span className="text-xs font-bold text-foreground">أعضاء هذه المجموعة</span>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {activeChannel.groupData.members.length} مشاركين
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-[11px] font-medium hidden sm:inline text-muted-foreground/80">
                        {isGroupMembersCollapsed ? "توسيع" : "طي"}
                      </span>
                      {isGroupMembersCollapsed ? (
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      ) : (
                        <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                      )}
                    </div>
                  </button>

                  {!isGroupMembersCollapsed && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-border/60 bg-card">
                      <div className="space-y-2 max-h-56 overflow-y-auto pt-2">
                        {activeChannel.groupData.members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-lg p-1.5 hover:bg-surface/50 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 border border-border">
                                <AvatarFallback className="text-[10px] font-bold bg-surface-strong">
                                  {m.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground truncate">{m.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{m.role}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setManageMembersOpen(true)}
                        className="mt-3 w-full text-xs font-bold gap-1"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>تعديل أعضاء المجموعة</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Linked Open Tickets */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setIsTicketsCollapsed(!isTicketsCollapsed)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-surface/60 transition-colors text-right cursor-pointer"
                  aria-expanded={!isTicketsCollapsed}
                  title={isTicketsCollapsed ? "توسيع البلاغات" : "طي البلاغات"}
                >
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4 text-brand-gold shrink-0" />
                    <span className="text-xs font-bold text-foreground">البلاغات المرتبطة بالمحادثة</span>
                    <Badge variant="outline" className="text-[10px]">
                      3 نشطة
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="text-[11px] font-medium hidden sm:inline text-muted-foreground/80">
                      {isTicketsCollapsed ? "توسيع" : "طي"}
                    </span>
                    {isTicketsCollapsed ? (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </div>
                </button>

                {!isTicketsCollapsed && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-border/60">
                    <div className="mt-2 space-y-2.5">
                      {tickets.slice(0, 3).map((t) => (
                        <Link
                          key={t.id}
                          to="/tickets/$ticketId"
                          params={{ ticketId: t.id }}
                          className="block rounded-lg border border-border/80 bg-surface/40 p-2.5 transition-colors hover:bg-surface hover:border-brand-gold/40"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-brand-ink font-mono">{t.id}</span>
                            <Badge variant="outline" className="text-[10px] py-0">
                              {t.status}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-xs font-semibold text-foreground">{t.title}</p>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{t.branch}</span>
                            <span>{t.technician}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* On-Duty Field Team & Branches */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setIsFieldTeamCollapsed(!isFieldTeamCollapsed)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-surface/60 transition-colors text-right cursor-pointer"
                  aria-expanded={!isFieldTeamCollapsed}
                  title={isFieldTeamCollapsed ? "توسيع فريق العمل" : "طي فريق العمل"}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-foreground">فريق العمل المناوب بالميدان</span>
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      متصل
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="text-[11px] font-medium hidden sm:inline text-muted-foreground/80">
                      {isFieldTeamCollapsed ? "توسيع" : "طي"}
                    </span>
                    {isFieldTeamCollapsed ? (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </div>
                </button>

                {!isFieldTeamCollapsed && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-border/60">
                    <div className="mt-2 space-y-2">
                      {technicians.map((tech) => (
                        <div
                          key={tech.id}
                          className="flex items-center justify-between rounded-lg p-2 hover:bg-surface/50 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 border border-border">
                              <AvatarFallback className="text-[10px] font-bold bg-surface-strong">
                                {tech.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-foreground">{tech.name}</p>
                              <p className="text-[10px] text-muted-foreground">{tech.skill}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-mono py-0">
                            {tech.load} مهام
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Hotline Box */}
              <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-card p-4 shadow-sm text-xs">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <UsersRound className="h-4 w-4 text-brand-gold" />
                  غرفة الدعم المركزي السريع
                </p>
                <p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
                  للطوارئ القصوى خارج أوقات العمل الرسمية يرجى التواصل المباشر مع مشرف العمليات.
                </p>
                <div className="mt-2.5 rounded-md border border-border bg-card p-2 text-center font-mono font-bold text-brand-ink text-xs">
                  هاتف: 201007419344+
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create New Group Modal (for Admin & HR) */}
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onCreateGroup={handleCreateGroup}
        creatorName={user?.name ?? "إدارة العمليات"}
      />

      {/* Manage Members in Active Group Modal */}
      {activeChannel.isGroup && activeChannel.groupData && (
        <ManageMembersDialog
          open={manageMembersOpen}
          onOpenChange={setManageMembersOpen}
          group={activeChannel.groupData}
          onSaveMembers={(updated) => handleUpdateGroupMembers(activeChannel.id, updated)}
        />
      )}

      {/* Clear Channel Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle>مسح رسائل {activeChannel.label}</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من مسح جميع رسائل هذه المحادثة من غرفة العمليات؟ لن تتمكن من استعادتها بعد المسح.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="destructive" onClick={handleClearChannel} className="text-xs font-bold">
              تأكيد المسح
            </Button>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)} className="text-xs">
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

// Dialog: Create New Work/Chat Group (Admin & HR)
function CreateGroupDialog({
  open,
  onOpenChange,
  onCreateGroup,
  creatorName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (group: CustomGroup) => void;
  creatorName: string;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<CustomGroup["category"]>("operations");
  const [isAnnouncementOnly, setIsAnnouncementOnly] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([
    "hafez",
    "sara-hr",
  ]);
  const [memberSearch, setMemberSearch] = useState("");

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  const filteredCandidates = useMemo(() => {
    if (!memberSearch.trim()) return systemCandidates;
    const q = memberSearch.toLowerCase().trim();
    return systemCandidates.filter(
      (m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [memberSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("يرجى كتابة اسم المجموعة أولاً");
      return;
    }
    if (selectedMemberIds.length === 0) {
      toast.error("يرجى اختيار عضو واحد على الأقل للمجموعة");
      return;
    }

    const chosenMembers = systemCandidates.filter((c) => selectedMemberIds.includes(c.id));

    const newGroup: CustomGroup = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      desc: desc.trim() || `مجموعة تم إنشاؤها للتنسيق المباشر`,
      category,
      badge: `${chosenMembers.length} أعضاء`,
      members: chosenMembers,
      createdBy: creatorName,
      createdAt: new Date().toISOString().slice(0, 10),
      isAnnouncementOnly,
    };

    onCreateGroup(newGroup);
    setName("");
    setDesc("");
    setSelectedMemberIds(["hafez", "sara-hr"]);
    setIsAnnouncementOnly(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="text-right">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gold/20 text-brand-ink dark:text-brand-gold">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  إنشاء مجموعة محادثة جديدة (Admin & HR)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  تسمية المجموعة وتحديد الأعضاء المشاركين وصلاحيات الردود.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Group Name & Description */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                اسم المجموعة <span className="text-destructive">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: فريق طوارئ كاميرات المراقبة، لجنة الموارد البشرية"
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                وصف المجموعة / الهدف
              </label>
              <Input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="مثال: متابعة فورية لكاميرات الفروع والتنسيق الميداني"
                className="text-xs"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                تصنيف المجموعة
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "operations", label: "عمليات وصيانة" },
                  { id: "hr", label: "موارد بشرية (HR)" },
                  { id: "urgent", label: "طوارئ وبلاغات" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as CustomGroup["category"])}
                    className={cn(
                      "rounded-lg border p-2 text-center text-xs font-semibold transition-colors",
                      category === cat.id
                        ? "border-brand-gold bg-brand-gold/15 text-brand-ink dark:text-brand-gold"
                        : "border-border hover:bg-surface text-muted-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply permission switch */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface/50 p-3">
              <div>
                <label className="block text-xs font-bold text-foreground">
                  وضع الإعلانات فقط (بدون قبول ردود)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  عند تفعيل هذا الخيار تكون المجموعة مخصصة لتعاميم الإدارة والموارد البشرية فقط.
                </span>
              </div>
              <Switch
                checked={isAnnouncementOnly}
                onCheckedChange={setIsAnnouncementOnly}
                aria-label="قفل الردود وجعلها إعلانات فقط"
              />
            </div>

            {/* Member Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-foreground">
                  إضافة الأعضاء للمجموعة <span className="text-destructive">*</span>
                </label>
                <span className="text-[11px] font-mono font-bold text-brand-ink dark:text-brand-gold">
                  تم اختيار {selectedMemberIds.length} عضو
                </span>
              </div>

              <div className="relative mb-2">
                <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="بحث عن عضو (فني، مدير فرع، إدارة)..."
                  className="h-8 pr-8 text-xs bg-background"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-border p-2 bg-background">
                {filteredCandidates.map((candidate) => {
                  const isSelected = selectedMemberIds.includes(candidate.id);
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => toggleMember(candidate.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md p-2 text-right text-xs transition-colors",
                        isSelected
                          ? "bg-brand-gold/15 text-foreground font-semibold border border-brand-gold/40"
                          : "hover:bg-surface text-foreground/80 border border-transparent",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-border">
                          <AvatarFallback className="text-[9px] font-bold">
                            {candidate.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-xs">{candidate.name}</p>
                          <p className="text-[10px] text-muted-foreground">{candidate.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            candidate.type === "admin" || candidate.type === "hr"
                              ? "default"
                              : candidate.type === "tech"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-[9px] py-0 px-1 font-normal"
                        >
                          {candidate.type === "hr"
                            ? "HR"
                            : candidate.type === "admin"
                              ? "إدارة"
                              : candidate.type === "tech"
                                ? "فني"
                                : "فرع"}
                        </Badge>
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "bg-brand-gold border-brand-gold text-brand-ink"
                              : "border-border bg-card",
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-start pt-2">
            <Button
              type="submit"
              className="bg-brand-gold text-brand-ink hover:bg-brand-gold/90 font-bold text-xs"
            >
              <CheckCircle2 className="h-4 w-4 ml-1" />
              <span>إنشاء المجموعة وبدء المحادثة</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Dialog: Manage Group Members (Add / Remove)
function ManageMembersDialog({
  open,
  onOpenChange,
  group,
  onSaveMembers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: CustomGroup;
  onSaveMembers: (updated: GroupMember[]) => void;
}) {
  const [currentMemberIds, setCurrentMemberIds] = useState<string[]>(
    group.members.map((m) => m.id),
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCurrentMemberIds(group.members.map((m) => m.id));
  }, [group]);

  const toggleMember = (memberId: string) => {
    setCurrentMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  const filteredCandidates = useMemo(() => {
    if (!search.trim()) return systemCandidates;
    const q = search.toLowerCase().trim();
    return systemCandidates.filter(
      (m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [search]);

  const handleSave = () => {
    const chosen = systemCandidates.filter((c) => currentMemberIds.includes(c.id));
    onSaveMembers(chosen);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className="text-right">
          <DialogTitle className="text-base font-bold text-foreground">
            إدارة أعضاء مجموعة: {group.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            إضافة أعضاء جدد أو إزالة مشاركين من هذه المجموعة.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن عضو لإضافته..."
              className="h-8 pr-8 text-xs bg-background"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-lg border border-border p-2 bg-background">
            {filteredCandidates.map((candidate) => {
              const isSelected = currentMemberIds.includes(candidate.id);
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => toggleMember(candidate.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md p-2 text-right text-xs transition-colors",
                    isSelected
                      ? "bg-brand-gold/15 text-foreground font-semibold border border-brand-gold/40"
                      : "hover:bg-surface text-foreground/80 border border-transparent",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-border">
                      <AvatarFallback className="text-[9px] font-bold">
                        {candidate.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-xs">{candidate.name}</p>
                      <p className="text-[10px] text-muted-foreground">{candidate.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="h-3 w-3" />
                        عضو
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Plus className="h-3 w-3" />
                        إضافة
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            onClick={handleSave}
            className="bg-brand-gold text-brand-ink hover:bg-brand-gold/90 font-bold text-xs"
          >
            حفظ التغييرات ({currentMemberIds.length} أعضاء)
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs">
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
