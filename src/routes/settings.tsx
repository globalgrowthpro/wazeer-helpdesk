import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Copy,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileCode,
  FileText,
  Filter,
  Globe,
  HardDrive,
  Key,
  Laptop,
  Layers,
  Lock,
  Mail,
  MoreVertical,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Terminal,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Panel, SectionHeading, Stat } from "@/components/helpdesk/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { branches, getStoredBranches, getStoredTasks, getStoredTickets } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "إعدادات النظام | وزير الحلو" },
      { name: "description", content: "إعدادات شاملة: البيانات العامة، المستخدمون، الأدوار والصلاحيات، البريد، النسخ الاحتياطي والأمان." },
      { property: "og:title", content: "إعدادات النظام | وزير الحلو" },
      { property: "og:description", content: "إعدادات شاملة: البيانات العامة، المستخدمون، الأدوار والصلاحيات، البريد، النسخ الاحتياطي والأمان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

type SettingsTab = "general" | "users" | "roles" | "smtp" | "backup" | "security";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  branch: string;
  status: "نشط" | "معطل";
  lastLogin: string;
}

interface BackupRecord {
  id: string;
  fileName: string;
  size: string;
  date: string;
  type: "يدوي" | "تلقائي";
  status: "مكتمل" | "قيد المعالجة";
}

interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  time: string;
  status: "ناجح" | "تحذير" | "فشل";
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const triggerSaveNotification = (msg = "تم حفظ الإعدادات بنجاح!") => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 4000);
  };

  // ==========================================
  // 1. GENERAL INFO STATE
  // ==========================================
  const [generalInfo, setGeneralInfo] = useState({
    systemName: "نظام وزير الحلو للدعم الفني والصيانة الميدانية",
    companyName: "حلواني وزير الحلو (Wazeer Elhelw)",
    supportEmail: "support@wazeer.demo",
    hotline: "19876",
    timezone: "Africa/Cairo (GMT+2)",
    defaultLanguage: "ar",
    workingDays: "السبت - الخميس",
    workingHours: "08:00 ص - 11:00 م",
    maintenanceMode: false,
    slaGraceMinutes: 15,
  });

  // ==========================================
  // 2. USERS MANAGEMENT STATE
  // ==========================================
  const [usersList, setUsersList] = useState<SystemUser[]>([
    { id: "u-1", name: "م. حافظ رحيم", email: "info@odooteams.com", role: "مدير النظام", roleId: "admin", branch: "الإدارة العامة", status: "نشط", lastLogin: "الآن" },
    { id: "u-2", name: "كريم محمود", email: "kareem@wazeer.demo", role: "مدير فرع", roleId: "branch", branch: "فرع التجمع", status: "نشط", lastLogin: "منذ ساعتين" },
    { id: "u-3", name: "نور أحمد", email: "nour@wazeer.demo", role: "مدير فرع", roleId: "branch", branch: "فرع مدينة نصر", status: "نشط", lastLogin: "اليوم 09:30 ص" },
    { id: "u-4", name: "أحمد سامي", email: "ahmed.samy@wazeer.demo", role: "فني دعم ميداني", roleId: "technician", branch: "قطاع القاهرة الجديدة", status: "نشط", lastLogin: "منذ 15 دقيقة" },
    { id: "u-5", name: "محمود عادل", email: "m.adel@wazeer.demo", role: "فني دعم ميداني", roleId: "technician", branch: "قطاع مدينة نصر", status: "نشط", lastLogin: "اليوم 11:20 ص" },
    { id: "u-6", name: "سارة وليد", email: "sara.waleed@wazeer.demo", role: "فني دعم ميداني", roleId: "technician", branch: "قطاع المعادي", status: "نشط", lastLogin: "أمس 04:15 م" },
    { id: "u-7", name: "م. طارق الحسيني", email: "tarek@wazeer.demo", role: "مشرف العمليات", roleId: "supervisor", branch: "غرفة التحكم المركزية", status: "نشط", lastLogin: "اليوم 08:00 ص" },
    { id: "u-8", name: "ياسر إبراهيم", email: "purchases@wazeer.demo", role: "مسؤول المشتريات", roleId: "procurement", branch: "إدارة المشتريات والمخازن", status: "نشط", lastLogin: "أمس 02:40 م" },
    { id: "u-9", name: "أ. نادية إبراهيم", email: "nadia.hr@wazeer.demo", role: "مسؤول الموارد البشرية", roleId: "hr", branch: "المقر الرئيسي - شؤون الموظفين", status: "نشط", lastLogin: "اليوم 10:15 ص" },
    { id: "u-10", name: "علي جابر", email: "ali.jaber@wazeer.demo", role: "مستخدم داخلي", roleId: "internal_user", branch: "فرع التجمع", status: "نشط", lastLogin: "اليوم 08:30 ص" },
    { id: "u-11", name: "مروة عادل", email: "marwa.csh@wazeer.demo", role: "مستخدم داخلي", roleId: "internal_user", branch: "فرع المعادي", status: "نشط", lastLogin: "أمس 06:10 م" },
  ]);

  const [userSearch, setUserSearch] = useState("");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    roleId: "branch",
    role: "مدير فرع",
    branch: "فرع التجمع",
    status: "نشط" as "نشط" | "معطل",
  });

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: "",
      email: "",
      roleId: "branch",
      role: "مدير فرع",
      branch: "فرع التجمع",
      status: "نشط",
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      role: user.role,
      branch: user.branch,
      status: user.status,
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) return;

    if (editingUser) {
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: userFormData.name.trim(),
                email: userFormData.email.trim(),
                role: userFormData.role,
                roleId: userFormData.roleId,
                branch: userFormData.branch,
                status: userFormData.status,
              }
            : u
        )
      );
      triggerSaveNotification(`تم تحديث بيانات المستخدم "${userFormData.name}"`);
    } else {
      const newUser: SystemUser = {
        id: `u-${Date.now().toString().slice(-4)}`,
        name: userFormData.name.trim(),
        email: userFormData.email.trim(),
        role: userFormData.role,
        roleId: userFormData.roleId,
        branch: userFormData.branch,
        status: userFormData.status,
        lastLogin: "لم يسجل بعد",
      };
      setUsersList([newUser, ...usersList]);
      triggerSaveNotification(`تمت إضافة المستخدم الجديد "${newUser.name}"`);
    }
    setUserModalOpen(false);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم ${name}؟`)) {
      setUsersList((prev) => prev.filter((u) => u.id !== id));
      triggerSaveNotification(`تم حذف المستخدم ${name}`);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList;
    const q = userSearch.toLowerCase();
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.branch.toLowerCase().includes(q)
    );
  }, [usersList, userSearch]);

  // ==========================================
  // 3. ROLES, PERMISSIONS & ALLOWED PAGES STATE
  // ==========================================
  const systemRoles = [
    {
      id: "admin",
      name: "مدير النظام (Admin)",
      arabicTitle: "مدير النظام العام",
      englishTitle: "System Administrator",
      code: "ADMIN",
      badge: "صلاحيات كاملة مطلقة",
      badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
      accentBg: "from-indigo-900/25 via-indigo-900/10 to-transparent",
      accentBorder: "border-indigo-500/40",
      icon: ShieldAlert,
      description: "تحكم شامل ومطلق في جميع إعدادات النظام، قواعد البيانات، الصلاحيات، الفروع، والمستخدمين.",
    },
    {
      id: "hr",
      name: "مسؤول الموارد البشرية (HR)",
      arabicTitle: "مسؤول الموارد البشرية",
      englishTitle: "Human Resources Officer",
      code: "HR-MGR",
      badge: "شؤون الموظفين والبطاقات",
      badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
      accentBg: "from-purple-900/25 via-purple-900/10 to-transparent",
      accentBorder: "border-purple-500/40",
      icon: UsersRound,
      description: "إدارة طاقم عمل الفروع، إصدار بطاقات الهوية الرسمية ID، الورديات، تقييمات الأداء، ومتابعة سجلات الموظفين.",
    },
    {
      id: "supervisor",
      name: "مشرف العمليات (Supervisor)",
      arabicTitle: "مشرف العمليات المركزية",
      englishTitle: "Operations Supervisor",
      code: "SUPV",
      badge: "متابعة وتشغيل واعتماد",
      badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
      accentBg: "from-amber-900/25 via-amber-900/10 to-transparent",
      accentBorder: "border-amber-500/40",
      icon: Eye,
      description: "متابعة البلاغات والمهام التشغيلية، إسناد الفنيين الميدانيين، مراقبة مؤشرات الـ SLA، واعتماد تقارير الصيانة.",
    },
    {
      id: "branch",
      name: "مدير الفرع (Branch Manager)",
      arabicTitle: "مدير الفرع",
      englishTitle: "Branch Manager",
      code: "BR-MGR",
      badge: "إدارة الفرع والعمليات",
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      accentBg: "from-emerald-900/25 via-emerald-900/10 to-transparent",
      accentBorder: "border-emerald-500/40",
      icon: Building2,
      description: "إنشاء بلاغات الصيانة للفرع، متابعة المهام التشغيلية الداخلية، الإشراف على طاقم الفرع، وتأكيد إغلاق الأعطال.",
    },
    {
      id: "technician",
      name: "فني دعم ميداني (Technician)",
      arabicTitle: "فني الصيانة الميدانية",
      englishTitle: "Field Service Technician",
      code: "TECH",
      badge: "تنفيذ الصيانة والإصلاح",
      badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
      accentBg: "from-blue-900/25 via-blue-900/10 to-transparent",
      accentBorder: "border-blue-500/40",
      icon: Wrench,
      description: "لوحة الفني المتنقل، استلام وتحديث مهام الصيانة، تشغيل مؤقت العمل، طلب قطع الغيار، ورفع تقارير الزيارات الميدانية.",
    },
    {
      id: "procurement",
      name: "مسؤول المشتريات (Procurement)",
      arabicTitle: "مسؤول المشتريات والمخازن",
      englishTitle: "Procurement Specialist",
      code: "PROC",
      badge: "المخزون وسلاسل الإمداد",
      badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
      accentBg: "from-rose-900/25 via-rose-900/10 to-transparent",
      accentBorder: "border-rose-500/40",
      icon: ShoppingBag,
      description: "إدارة ومطابقة طلبات قطع الغيار، طلبات الشراء، عروض أسعار الموردين، وإدارة أصول وأجهزة الفروع.",
    },
    {
      id: "internal_user",
      name: "مستخدم داخلي (Internal User)",
      arabicTitle: "مستخدم داخلي / طاقم تشغيلي",
      englishTitle: "Internal Staff Member",
      code: "INT-USR",
      badge: "المهام والمتابعة اليومية",
      badgeColor: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
      accentBg: "from-cyan-900/25 via-cyan-900/10 to-transparent",
      accentBorder: "border-cyan-500/40",
      icon: Laptop,
      description: "موظف داخلي (مثل الشيف التنفيذي، مساعد التجهيز، مسؤول السلامة، أو الكاشير) لمتابعة المهام المسندة وتدوين الملاحظات اليومية.",
    },
  ];

  const systemPages = [
    { key: "dashboard", label: "لوحة العمليات والتحكم الرئيسية", path: "/", domain: "general", domainLabel: "الإدارة والتحكم" },
    { key: "tickets", label: "إدارة البلاغات والأعطال", path: "/tickets", domain: "maintenance", domainLabel: "الصيانة والخدمة" },
    { key: "tasks", label: "المهام التشغيلية المركزية", path: "/tasks", domain: "maintenance", domainLabel: "الصيانة والخدمة" },
    { key: "branchTasks", label: "مهام الفرع الداخلية وسجل الملاحظات", path: "/branch-tasks", domain: "branches", domainLabel: "الفروع والتشغيل" },
    { key: "branchStaff", label: "دليل طاقم العمل وبطاقات الهوية الرسمية", path: "/branch-staff", domain: "hr", domainLabel: "شؤون الموظفين" },
    { key: "branchPanel", label: "بوابة الفرع وبلاغاته المباشرة", path: "/branch-panel", domain: "branches", domainLabel: "الفروع والتشغيل" },
    { key: "techPanel", label: "بوابة الفني الميداني ومؤقت العمل", path: "/tech-panel", domain: "maintenance", domainLabel: "الصيانة والخدمة" },
    { key: "fieldService", label: "الزيارات الميدانية وجدولة الصيانة", path: "/field-service", domain: "maintenance", domainLabel: "الصيانة والخدمة" },
    { key: "purchases", label: "المشتريات وعروض الأسعار وقطع الغيار", path: "/purchases", domain: "inventory", domainLabel: "المشتريات والمخزون" },
    { key: "reports", label: "التقارير التحليلية ومؤشرات الـ SLA", path: "/reports", domain: "general", domainLabel: "الإدارة والتحكم" },
    { key: "branches", label: "دليل شبكة الفروع وإدارتها", path: "/branches", domain: "branches", domainLabel: "الفروع والتشغيل" },
    { key: "technicians", label: "دليل الفنيين وتقييم الأداء والمناطق", path: "/technicians", domain: "hr", domainLabel: "شؤون الموظفين" },
    { key: "assets", label: "سجل أجهزة ومعدات وأصول الفروع", path: "/assets", domain: "inventory", domainLabel: "المشتريات والمخزون" },
    { key: "settings", label: "إعدادات النظام، الصلاحيات والأمان", path: "/settings", domain: "general", domainLabel: "الإدارة والتحكم" },
  ];

  const [selectedRole, setSelectedRole] = useState("admin");
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>("all");

  // Allowed pages map per role
  const [rolePageAccess, setRolePageAccess] = useState<Record<string, string[]>>({
    admin: [
      "dashboard",
      "tickets",
      "tasks",
      "branchTasks",
      "branchStaff",
      "branchPanel",
      "techPanel",
      "fieldService",
      "purchases",
      "reports",
      "branches",
      "technicians",
      "assets",
      "settings",
    ],
    hr: [
      "dashboard",
      "branchStaff",
      "technicians",
      "branches",
      "branchTasks",
      "reports",
      "settings",
    ],
    supervisor: [
      "dashboard",
      "tickets",
      "tasks",
      "branchTasks",
      "fieldService",
      "purchases",
      "reports",
      "branches",
      "technicians",
      "assets",
    ],
    branch: ["branchPanel", "tickets", "tasks", "branchTasks", "branchStaff"],
    technician: ["techPanel", "tickets", "tasks", "fieldService"],
    procurement: ["dashboard", "purchases", "assets", "reports"],
    internal_user: ["tasks", "branchTasks", "branchPanel", "tickets"],
  });

  // Action permissions per role
  const [rolePermissions, setRolePermissions] = useState<
    Record<
      string,
      {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
        approve: boolean;
        exportData: boolean;
      }
    >
  >({
    admin: { view: true, create: true, edit: true, delete: true, approve: true, exportData: true },
    hr: { view: true, create: true, edit: true, delete: false, approve: true, exportData: true },
    supervisor: { view: true, create: true, edit: true, delete: false, approve: true, exportData: true },
    branch: { view: true, create: true, edit: true, delete: false, approve: false, exportData: false },
    technician: { view: true, create: true, edit: true, delete: false, approve: false, exportData: false },
    procurement: { view: true, create: true, edit: true, delete: false, approve: true, exportData: true },
    internal_user: { view: true, create: true, edit: false, delete: false, approve: false, exportData: false },
  });

  const togglePageAccess = (roleId: string, pageKey: string) => {
    setRolePageAccess((prev) => {
      const current = prev[roleId] ?? [];
      const updated = current.includes(pageKey)
        ? current.filter((k) => k !== pageKey)
        : [...current, pageKey];
      return { ...prev, [roleId]: updated };
    });
  };

  const toggleActionPermission = (
    roleId: string,
    action: "view" | "create" | "edit" | "delete" | "approve" | "exportData"
  ) => {
    setRolePermissions((prev) => {
      const current = prev[roleId] ?? { view: true, create: false, edit: false, delete: false, approve: false, exportData: false };
      return {
        ...prev,
        [roleId]: {
          ...current,
          [action]: !current[action],
        },
      };
    });
  };

  // ==========================================
  // 4. SMTP CONFIGURATION STATE
  // ==========================================
  const [smtpConfig, setSmtpConfig] = useState({
    host: "smtp.odooteams.com",
    port: "587",
    encryption: "tls",
    senderName: "حلواني وزير الحلو - إشعارات الصيانة",
    senderEmail: "helpdesk@odooteams.com",
    username: "notifications@odooteams.com",
    password: "••••••••••••••••",
    notifyOnNewTicket: true,
    notifyOnSlaBreach: true,
    notifyOnAssignTech: true,
    notifyOnPartsRequest: true,
  });

  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleTestSmtp = () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    setTimeout(() => {
      setSmtpTesting(false);
      setSmtpTestResult("تم إرسال بريد الاختبار بنجاح إلى " + smtpConfig.senderEmail);
    }, 1500);
  };

  // ==========================================
  // 5. BACKUP & RESTORE STATE
  // ==========================================
  const [backupSchedule, setBackupSchedule] = useState({
    autoBackup: true,
    frequency: "daily",
    retentionDays: 30,
    storageTarget: "local_and_cloud",
  });

  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([
    { id: "bk-1", fileName: "wazeer_backup_2026-09-25_0300.json", size: "2.4 MB", date: "2026-09-25 03:00 ص", type: "تلقائي", status: "مكتمل" },
    { id: "bk-2", fileName: "wazeer_backup_2026-09-24_0300.json", size: "2.3 MB", date: "2026-09-24 03:00 ص", type: "تلقائي", status: "مكتمل" },
    { id: "bk-3", fileName: "wazeer_backup_2026-09-23_1820_manual.json", size: "2.1 MB", date: "2026-09-23 06:20 م", type: "يدوي", status: "مكتمل" },
    { id: "bk-4", fileName: "wazeer_backup_2026-09-22_0300.json", size: "2.0 MB", date: "2026-09-22 03:00 ص", type: "تلقائي", status: "مكتمل" },
  ]);

  const [creatingBackup, setCreatingBackup] = useState(false);

  const handleCreateInstantBackup = () => {
    setCreatingBackup(true);
    setTimeout(() => {
      const tickets = getStoredTickets();
      const tasks = getStoredTasks();
      const brs = getStoredBranches();
      const backupData = {
        meta: {
          app: "Wazeer Helpdesk",
          exportDate: new Date().toISOString(),
          version: "2.4.0",
        },
        tickets,
        tasks,
        branches: brs,
        settings: generalInfo,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `wazeer_backup_${dateStr}_instant.json`;
      a.click();
      URL.revokeObjectURL(url);

      const newRec: BackupRecord = {
        id: `bk-${Date.now().toString().slice(-4)}`,
        fileName: `wazeer_backup_${dateStr}_instant.json`,
        size: "2.5 MB",
        date: "الآن",
        type: "يدوي",
        status: "مكتمل",
      };
      setBackupRecords([newRec, ...backupRecords]);
      setCreatingBackup(false);
      triggerSaveNotification("تم إنشاء وتنزيل النسخة الاحتياطية بنجاح!");
    }, 1200);
  };

  // ==========================================
  // 6. SECURITY & AUDIT STATE
  // ==========================================
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeoutMinutes: 45,
    maxLoginAttempts: 5,
    requireStrongPassword: true,
    ipRestrictionsEnabled: false,
    allowedIps: "197.38.12.0/24, 156.204.45.10",
  });

  const [auditLogs] = useState<AuditLogItem[]>([
    { id: "lg-1", user: "م. حافظ رحيم (Admin)", action: "تعديل إعدادات الصلاحيات", target: "أدوار النظام", ip: "197.38.12.44", time: "اليوم 09:42 ص", status: "ناجح" },
    { id: "lg-2", user: "أحمد سامي (Technician)", action: "تسجيل دخول للنظام", target: "بوابة الفني", ip: "156.204.45.18", time: "اليوم 09:25 ص", status: "ناجح" },
    { id: "lg-3", user: "كريم محمود (Branch)", action: "إنشاء بلاغ عاجل HD-2026-000452", target: "فرع التجمع", ip: "197.38.12.90", time: "اليوم 09:12 ص", status: "ناجح" },
    { id: "lg-4", user: "مجهول (Unknown)", action: "محاولة دخول بكلمة مرور خاطئة", target: "صفحة الدخول", ip: "41.238.110.5", time: "اليوم 07:44 ص", status: "تحذير" },
    { id: "lg-5", user: "نظام آلي (System)", action: "إنشاء نسخة احتياطية مجدولة", target: "قاعدة البيانات", ip: "127.0.0.1", time: "اليوم 03:00 ص", status: "ناجح" },
    { id: "lg-6", user: "م. حافظ رحيم (Admin)", action: "إضافة فرع جديد (الشيخ زايد)", target: "دليل الفروع", ip: "197.38.12.44", time: "أمس 04:30 م", status: "ناجح" },
  ]);

  // Tab definitions
  const tabsList = [
    { id: "general" as const, label: "البيانات العامة", icon: Globe },
    { id: "users" as const, label: "المستخدمون", count: usersList.length, icon: Users },
    { id: "roles" as const, label: "الأدوار والصلاحيات والصفحات", icon: ShieldCheck },
    { id: "smtp" as const, label: "البريد الإلكتروني (SMTP)", icon: Mail },
    { id: "backup" as const, label: "النسخ الاحتياطي والاستعادة", icon: HardDrive },
    { id: "security" as const, label: "الأمان وسجل النشاط", icon: Lock },
  ];

  return (
    <AppShell title="إعدادات النظام">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              لوحة تحكم إعدادات المنظومة
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة الهوية العامة، حسابات المستخدمين، مصفوفة الصلاحيات والصفحات، خادم SMTP، والنسخ الاحتياطي.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => triggerSaveNotification("تم تطبيق كافة إعدادات النظام بنجاح!")}
              className="gap-2 font-bold shadow-sm"
            >
              <Save className="h-4 w-4" />
              حفظ جميع التغييرات
            </Button>
          </div>
        </div>

        {/* Global Save Notification Toast */}
        {saveSuccessMsg && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMsg("")}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-2">
          {tabsList.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==================================================== */}
        {/* TAB 1: GENERAL INFO */}
        {/* ==================================================== */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Panel title="الهوية ومعلومات المنظومة الأساسية" icon={Building2}>
                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-foreground">اسم النظام</label>
                      <Input
                        value={generalInfo.systemName}
                        onChange={(e) =>
                          setGeneralInfo({ ...generalInfo, systemName: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">اسم الشركة / المؤسسة</label>
                      <Input
                        value={generalInfo.companyName}
                        onChange={(e) =>
                          setGeneralInfo({ ...generalInfo, companyName: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">البريد الإلكتروني الرسمي للدعم</label>
                      <Input
                        value={generalInfo.supportEmail}
                        onChange={(e) =>
                          setGeneralInfo({ ...generalInfo, supportEmail: e.target.value })
                        }
                        dir="ltr"
                        className="text-left font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">الخط الساخن والدعم المباشر</label>
                      <Input
                        value={generalInfo.hotline}
                        onChange={(e) =>
                          setGeneralInfo({ ...generalInfo, hotline: e.target.value })
                        }
                        dir="ltr"
                        className="text-left font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">المنطقة الزمنية</label>
                      <Select
                        value={generalInfo.timezone}
                        onValueChange={(val) =>
                          setGeneralInfo({ ...generalInfo, timezone: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Cairo (GMT+2)">القاهرة (GMT+2)</SelectItem>
                          <SelectItem value="Asia/Riyadh (GMT+3)">الرياض (GMT+3)</SelectItem>
                          <SelectItem value="Asia/Dubai (GMT+4)">دبي (GMT+4)</SelectItem>
                          <SelectItem value="UTC">توقيت جرينتش العالمي (UTC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">أيام العمل الأسبوعية</label>
                      <Input
                        value={generalInfo.workingDays}
                        onChange={(e) =>
                          setGeneralInfo({ ...generalInfo, workingDays: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">ساعات العمل الرسمية</label>
                      <Input
                        value={generalInfo.workingHours}
                        onChange={(e) =>
                          setGeneralInfo({ ...generalInfo, workingHours: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </Panel>

                <Panel title="إعدادات مستويات الخدمة (SLA Rules)" icon={Clock}>
                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">زمن الاستجابة للحالات الحرجة</label>
                      <Input defaultValue="30 دقيقة" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">زمن الحل الأقصى للحالات الحرجة</label>
                      <Input defaultValue="3 ساعات" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">زمن الاستجابة للأولوية العالية</label>
                      <Input defaultValue="60 دقيقة" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">زمن الحل الأقصى للأولوية العالية</label>
                      <Input defaultValue="6 ساعات" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-foreground">فترة السماح قبل احتساب تجاوز الـ SLA (بالدقائق)</label>
                      <Input
                        type="number"
                        value={generalInfo.slaGraceMinutes}
                        onChange={(e) =>
                          setGeneralInfo({
                            ...generalInfo,
                            slaGraceMinutes: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Side Status & Toggles */}
              <div className="space-y-6">
                <Panel title="حالة النظام والصيانة" icon={Sliders}>
                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">وضع الصيانة المؤقت</p>
                        <p className="text-[11px] text-muted-foreground">
                          إيقاف استقبال بلاغات جديدة مؤقتاً
                        </p>
                      </div>
                      <Switch
                        checked={generalInfo.maintenanceMode}
                        onCheckedChange={(val) =>
                          setGeneralInfo({ ...generalInfo, maintenanceMode: val })
                        }
                      />
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-[var(--kpi-forest)]" />
                        الخادم يعمل بكفاءة 100%
                      </div>
                      <p className="mt-1">
                        الإصدار: 2.4.0 (Cloudflare/Nitro Module)
                      </p>
                      <p className="mt-0.5">
                        آخر تحديث برمجي: اليوم 22:15
                      </p>
                    </div>

                    <Button
                      onClick={() => triggerSaveNotification("تم حفظ البيانات العامة للنظام")}
                      className="w-full gap-2 font-bold"
                    >
                      <Save className="h-4 w-4" />
                      حفظ البيانات العامة
                    </Button>
                  </div>
                </Panel>

                <Panel title="شعار وهوية المنظومة (Logo & Emblem)" icon={Building2}>
                  <div className="space-y-4 p-5">
                    <div>
                      <p className="text-xs font-bold text-foreground mb-1.5">الشعار المعتمد للقوائم الداكنة</p>
                      <div className="flex items-center justify-center rounded-lg bg-[var(--sidebar)] p-4 border border-sidebar-border">
                        <img
                          src="/wazeer-emblem-light.png"
                          alt="شعار وزير الحلو - فاتح"
                          className="h-16 w-auto max-w-[180px] object-contain drop-shadow"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">ملف: wazeer-emblem-light.png (للخلفيات الداكنة)</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-foreground mb-1.5">الشعار المعتمد للطباعة والشاشات الفاتحة</p>
                      <div className="flex items-center justify-center rounded-lg bg-card p-4 border border-border">
                        <img
                          src="/wazeer-emblem.png"
                          alt="شعار وزير الحلو - داكن"
                          className="h-16 w-auto max-w-[180px] object-contain drop-shadow-sm"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">ملف: wazeer-emblem.png (للخلفيات الفاتحة)</p>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: USERS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <Panel
              title={`قائمة المستخدمين في النظام (${filteredUsers.length})`}
              icon={Users}
              action={
                <Button onClick={handleOpenAddUser} size="sm" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  مستخدم جديد
                </Button>
              }
            >
              <div className="flex items-center justify-between border-b border-border bg-muted/20 p-4">
                <div className="relative w-72">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="بحث بالاسم، البريد، أو الفرع..."
                    className="h-9 pr-9 text-xs"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  إجمالي الحسابات: <strong>{usersList.length}</strong> حساب
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الدور الوظيفي</TableHead>
                    <TableHead>الفرع / الموقع</TableHead>
                    <TableHead>آخر دخول</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="w-24 text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {user.name[0]}
                          </span>
                          <span className="font-bold text-foreground">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                          {user.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border text-xs font-medium">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{user.branch}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{user.lastLogin}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === "نشط"
                              ? "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs"
                              : "border-transparent bg-red-500/10 text-red-700 dark:text-red-400 text-xs"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleOpenEditUser(user)}
                            title="تعديل المستخدم"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            title="حذف المستخدم"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: ROLES, PERMISSIONS & ALLOWED PAGES */}
        {/* ==================================================== */}
        {/* ==================================================== */}
        {/* TAB 3: ROLES, PERMISSIONS & ALLOWED PAGES */}
        {/* ==================================================== */}
        {activeTab === "roles" && (() => {
          const currentRoleObj =
            systemRoles.find((r) => r.id === selectedRole) || systemRoles[0]!;
          const IconComp = currentRoleObj.icon;
          const assignedUsers = usersList.filter((u) => u.roleId === selectedRole);
          const currentPages = rolePageAccess[selectedRole] ?? [];
          const currentPerms = rolePermissions[selectedRole] ?? {
            view: true,
            create: false,
            edit: false,
            delete: false,
            approve: false,
            exportData: false,
          };

          const filteredRoles = systemRoles.filter(
            (r) =>
              r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
              r.englishTitle.toLowerCase().includes(roleSearch.toLowerCase()) ||
              r.code.toLowerCase().includes(roleSearch.toLowerCase()) ||
              r.description.toLowerCase().includes(roleSearch.toLowerCase())
          );

          const filteredPages = systemPages.filter((p) => {
            if (selectedDomainFilter === "all") return true;
            return p.domain === selectedDomainFilter;
          });

          const grantAllPages = () => {
            setRolePageAccess((prev) => ({
              ...prev,
              [selectedRole]: systemPages.map((p) => p.key),
            }));
            triggerSaveNotification(`تم منح صلاحية الوصول لجميع الصفحات للدور: ${currentRoleObj.arabicTitle}`);
          };

          const revokeAllPages = () => {
            setRolePageAccess((prev) => ({
              ...prev,
              [selectedRole]: [],
            }));
            triggerSaveNotification(`تم إلغاء الوصول لجميع الصفحات للدور: ${currentRoleObj.arabicTitle}`);
          };

          const grantAllPermissions = () => {
            setRolePermissions((prev) => ({
              ...prev,
              [selectedRole]: {
                view: true,
                create: true,
                edit: true,
                delete: true,
                approve: true,
                exportData: true,
              },
            }));
            triggerSaveNotification(`تم تفعيل كافة العمليات الإجرائية للدور: ${currentRoleObj.arabicTitle}`);
          };

          return (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                {/* 1. ROLE SELECTOR SIDEBAR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">أدوار ومستويات النظام</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {systemRoles.length} أدوار معرفة بالصلاحيات
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {systemRoles.length} Roles
                    </Badge>
                  </div>

                  {/* Search Roles Input */}
                  <div className="relative">
                    <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="بحث في الأدوار (HR, Admin, فني)..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      className="pr-8 text-xs"
                    />
                  </div>

                  {/* Role Cards List */}
                  <div className="space-y-2">
                    {filteredRoles.map((role) => {
                      const isSelected = selectedRole === role.id;
                      const RoleIcon = role.icon;
                      const userCount = usersList.filter((u) => u.roleId === role.id).length;
                      const pagesCount = (rolePageAccess[role.id] ?? []).length;

                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={cn(
                            "group relative w-full rounded-xl border p-3.5 text-right transition-all duration-200",
                            isSelected
                              ? "border-brand-ink bg-gradient-to-l from-card via-card to-brand-ink/10 shadow-sm ring-1 ring-brand-ink/30"
                              : "border-border bg-card hover:border-border/80 hover:bg-surface"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105 shadow-xs",
                                  isSelected
                                    ? "border-brand-ink/40 bg-brand-ink text-white"
                                    : "border-border bg-muted/40 text-muted-foreground"
                                )}
                              >
                                <RoleIcon className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="truncate text-xs font-bold text-foreground">
                                    {role.arabicTitle}
                                  </h4>
                                </div>
                                <span className="block truncate text-[10px] font-mono text-muted-foreground" dir="ltr">
                                  {role.code} • {role.englishTitle}
                                </span>
                              </div>
                            </div>

                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 text-[10px] font-mono px-1.5 py-0.5",
                                isSelected
                                  ? "border-brand-ink/40 bg-brand-ink/10 text-brand-ink font-bold"
                                  : "border-border text-muted-foreground"
                              )}
                            >
                              {userCount} مستخدم
                            </Badge>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                            <span className="truncate text-[10px]">{role.badge}</span>
                            <span className="font-mono text-[10px] text-foreground font-semibold">
                              {pagesCount} / {systemPages.length} صفحة
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. ROLE DETAILS & PERMISSIONS WORKSPACE */}
                <div className="space-y-6">
                  {/* Hero Role Banner */}
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl border p-5 sm:p-6 bg-gradient-to-r shadow-xs",
                      currentRoleObj.accentBg,
                      currentRoleObj.accentBorder
                    )}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-md">
                          <IconComp className="h-6 w-6 text-brand-ink" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-foreground">
                              {currentRoleObj.arabicTitle}
                            </h2>
                            <Badge
                              variant="outline"
                              className={cn("text-xs font-bold font-mono", currentRoleObj.badgeColor)}
                            >
                              {currentRoleObj.code}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {currentRoleObj.badge}
                            </Badge>
                          </div>

                          <p className="font-mono text-xs text-muted-foreground mt-0.5" dir="ltr">
                            {currentRoleObj.englishTitle}
                          </p>

                          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                            {currentRoleObj.description}
                          </p>
                        </div>
                      </div>

                      {/* Quick Bulk Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 self-start">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-card hover:bg-muted font-bold"
                          onClick={grantAllPages}
                        >
                          <Check className="h-3.5 w-3.5 ml-1 text-emerald-600" />
                          منح كافة الشاشات
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-card hover:bg-muted font-bold"
                          onClick={grantAllPermissions}
                        >
                          <Sparkles className="h-3.5 w-3.5 ml-1 text-amber-600" />
                          تفعيل كل العمليات
                        </Button>
                      </div>
                    </div>

                    {/* Metric Badges */}
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 border-t border-border/40 pt-4">
                      <div className="rounded-xl border border-border/60 bg-card/80 p-3 shadow-xs">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          الشاشات المصرح بها
                        </span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-foreground">
                            {currentPages.length}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            من {systemPages.length} صفحة
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-card/80 p-3 shadow-xs">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          العمليات التنفيذية
                        </span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-brand-ink">
                            {Object.values(currentPerms).filter(Boolean).length}
                          </span>
                          <span className="text-xs text-muted-foreground">من 6 عمليات</span>
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1 rounded-xl border border-border/60 bg-card/80 p-3 shadow-xs">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          المستخدمون الفعليون
                        </span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-foreground">
                            {assignedUsers.length}
                          </span>
                          <span className="text-xs text-emerald-600 font-bold">
                            حسابات نشطة
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. ACTION PERMISSIONS (صلاحيات العمليات) */}
                  <Panel
                    title={`صلاحيات العمليات الإجرائية (${Object.values(currentPerms).filter(Boolean).length} / 6 مفعلة)`}
                    icon={ShieldCheck}
                  >
                    <div className="grid gap-3.5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        {
                          key: "view" as const,
                          label: "عرض وقراءة السجلات (Read)",
                          desc: "الاطلاع على البلاغات والتقارير وسجلات النظام",
                          icon: Eye,
                          color: "text-blue-600",
                        },
                        {
                          key: "create" as const,
                          label: "إنشاء وإرسال بلاغات (Create)",
                          desc: "فتح بلاغات صيانة، إضافة مهام جديدة، وتسجيل طلبات",
                          icon: Plus,
                          color: "text-emerald-600",
                        },
                        {
                          key: "edit" as const,
                          label: "تعديل وتحديث الحالات (Edit)",
                          desc: "تغيير مراحل الأعطال، تعديل الملاحظات والبيانات",
                          icon: Edit3,
                          color: "text-amber-600",
                        },
                        {
                          key: "delete" as const,
                          label: "حذف السجلات والبيانات (Delete)",
                          desc: "صلاحية حذف البلاغات أو المهام أو السجلات الحساسة",
                          icon: Trash2,
                          color: "text-red-600",
                        },
                        {
                          key: "approve" as const,
                          label: "الاعتماد المالي والإداري (Approve)",
                          desc: "اعتماد طلبات الشراء، المصادقة على الإغلاق وأذونات الصرف",
                          icon: ShieldAlert,
                          color: "text-purple-600",
                        },
                        {
                          key: "exportData" as const,
                          label: "تصدير وطباعة التقارير (Export)",
                          desc: "استخراج ملفات Excel/PDF وطباعة التقارير الرسمية",
                          icon: Download,
                          color: "text-indigo-600",
                        },
                      ].map((item) => {
                        const isAllowed = currentPerms[item.key] ?? false;
                        const ItemIcon = item.icon;

                        return (
                          <div
                            key={item.key}
                            onClick={() => toggleActionPermission(selectedRole, item.key)}
                            className={cn(
                              "cursor-pointer rounded-xl border p-4 transition-all duration-200 select-none flex flex-col justify-between gap-3",
                              isAllowed
                                ? "border-brand-ink/40 bg-surface shadow-xs"
                                : "border-border bg-card/60 opacity-80 hover:bg-surface"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card", item.color)}>
                                  <ItemIcon className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-foreground">
                                    {item.label}
                                  </h4>
                                </div>
                              </div>

                              <Switch
                                checked={isAllowed}
                                onCheckedChange={() => toggleActionPermission(selectedRole, item.key)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
                              <span className="text-muted-foreground line-clamp-1">
                                {item.desc}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-bold px-1.5 shrink-0",
                                  isAllowed
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300"
                                    : "bg-muted text-muted-foreground border-border"
                                )}
                              >
                                {isAllowed ? "مفعل ومصرح" : "معطل"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>

                  {/* 2. ALLOWED PAGES MATRIX */}
                  <Panel
                    title={`مصفوفة الشاشات والصفحات المسموح بالوصول إليها (${currentPages.length} / ${systemPages.length})`}
                    icon={Layers}
                    action={
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-brand-ink"
                          onClick={grantAllPages}
                        >
                          تحديد الكل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-destructive"
                          onClick={revokeAllPages}
                        >
                          إلغاء التحديد
                        </Button>
                      </div>
                    }
                  >
                    {/* Domain Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/20 px-5 py-3 text-xs">
                      <span className="text-muted-foreground font-semibold ml-2">تصنيف الشاشات:</span>
                      {[
                        { key: "all", label: `الكل (${systemPages.length})` },
                        { key: "general", label: "🏢 الإدارة والتحكم" },
                        { key: "maintenance", label: "🎫 الصيانة والخدمة" },
                        { key: "branches", label: "🏪 الفروع والتشغيل" },
                        { key: "hr", label: "👥 شؤون الموظفين" },
                        { key: "inventory", label: "📦 المشتريات والمخزون" },
                      ].map((dom) => (
                        <button
                          key={dom.key}
                          onClick={() => setSelectedDomainFilter(dom.key)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                            selectedDomainFilter === dom.key
                              ? "bg-brand-ink text-white shadow-xs"
                              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          {dom.label}
                        </button>
                      ))}
                    </div>

                    {/* Pages List */}
                    <div className="divide-y divide-border">
                      {filteredPages.map((page) => {
                        const hasAccess = currentPages.includes(page.key);

                        return (
                          <div
                            key={page.key}
                            className={cn(
                              "flex items-center justify-between p-4 transition-colors hover:bg-surface",
                              hasAccess ? "bg-card" : "bg-muted/10 opacity-75"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px] text-muted-foreground shrink-0"
                              >
                                {page.domainLabel}
                              </Badge>

                              <div className="min-w-0">
                                <p className="font-bold text-sm text-foreground truncate">
                                  {page.label}
                                </p>
                                <span className="font-mono text-xs text-brand-ink/80 block mt-0.5" dir="ltr">
                                  {page.path}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <Badge
                                className={cn(
                                  "text-[11px] font-bold",
                                  hasAccess
                                    ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                                    : "bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-300"
                                )}
                                variant="outline"
                              >
                                {hasAccess ? "مسموح بالوصول" : "محظور"}
                              </Badge>

                              <Switch
                                checked={hasAccess}
                                onCheckedChange={() => togglePageAccess(selectedRole, page.key)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-border bg-muted/20 p-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        يتم تفعيل الصلاحيات فورياً على الجلسة وحفظها محلياً.
                      </p>
                      <Button
                        onClick={() =>
                          triggerSaveNotification(
                            `تم حفظ مصفوفة الصلاحيات والصفحات لدور "${currentRoleObj.arabicTitle}"`
                          )
                        }
                        className="bg-brand-ink hover:bg-brand-ink/90 text-white gap-2 font-bold shadow-xs"
                      >
                        <Save className="h-4 w-4" />
                        حفظ صلاحيات هذا الدور
                      </Button>
                    </div>
                  </Panel>

                  {/* 3. ASSIGNED USERS WITH THIS ROLE */}
                  <Panel
                    title={`المستخدمون المعينون بهذا الدور (${assignedUsers.length})`}
                    icon={Users}
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold"
                        onClick={() => {
                          setUserFormData({
                            name: "",
                            email: "",
                            roleId: selectedRole,
                            role: currentRoleObj.arabicTitle,
                            branch: "فرع التجمع",
                            status: "نشط",
                          });
                          setUserModalOpen(true);
                        }}
                      >
                        <UserPlus className="h-3.5 w-3.5 ml-1 text-brand-ink" />
                        إضافة مستخدم بهذا الدور
                      </Button>
                    }
                  >
                    <div className="p-5">
                      {assignedUsers.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {assignedUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs transition-colors hover:border-brand-ink/40 hover:bg-surface"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-ink/10 font-bold text-sm text-brand-ink">
                                  {user.name.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="truncate text-xs font-bold text-foreground">
                                    {user.name}
                                  </h4>
                                  <p className="font-mono text-[11px] text-muted-foreground truncate" dir="ltr">
                                    {user.email}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                                    <span>{user.branch}</span>
                                    <span>•</span>
                                    <span className="text-emerald-600 font-semibold">{user.status}</span>
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-brand-ink shrink-0"
                                onClick={() => handleOpenEditUser(user)}
                                title="تعديل حساب المستخدم"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <UsersRound className="mx-auto h-8 w-8 text-muted-foreground/40" />
                          <p className="mt-2 text-xs font-semibold text-foreground">
                            لا يوجد مستخدمون حالياً معينون بدور "{currentRoleObj.arabicTitle}"
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            يمكنك إضافة مستخدم جديد أو تعديل دور أي مستخدم حالي من تبويب المستخدمين.
                          </p>
                        </div>
                      )}
                    </div>
                  </Panel>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ==================================================== */}
        {/* TAB 4: SMTP EMAIL SETTINGS */}
        {/* ==================================================== */}
        {activeTab === "smtp" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Panel title="إعدادات خادم البريد الصادر (SMTP Configuration)" icon={Mail}>
                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-foreground">خادم البريد (SMTP Host)</label>
                      <Input
                        value={smtpConfig.host}
                        onChange={(e) =>
                          setSmtpConfig({ ...smtpConfig, host: e.target.value })
                        }
                        dir="ltr"
                        className="text-left font-mono text-sm"
                        placeholder="smtp.gmail.com أو mail.wazeer.demo"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">منفذ الاتصال (Port)</label>
                      <Input
                        value={smtpConfig.port}
                        onChange={(e) =>
                          setSmtpConfig({ ...smtpConfig, port: e.target.value })
                        }
                        dir="ltr"
                        className="text-left font-mono text-sm"
                        placeholder="587 أو 465"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">نوع التشفير (Encryption)</label>
                      <Select
                        value={smtpConfig.encryption}
                        onValueChange={(val) =>
                          setSmtpConfig({ ...smtpConfig, encryption: val })
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">STARTTLS (موصى به - منفذ 587)</SelectItem>
                          <SelectItem value="ssl">SSL / TLS (منفذ 465)</SelectItem>
                          <SelectItem value="none">بدون تشفير (غير آمن)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">اسم المرسل الظاهر</label>
                      <Input
                        value={smtpConfig.senderName}
                        onChange={(e) =>
                          setSmtpConfig({ ...smtpConfig, senderName: e.target.value })
                        }
                        placeholder="حلواني وزير الحلو"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">عنوان بريد الإرسال (From Email)</label>
                      <Input
                        value={smtpConfig.senderEmail}
                        onChange={(e) =>
                          setSmtpConfig({ ...smtpConfig, senderEmail: e.target.value })
                        }
                        dir="ltr"
                        className="text-left font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">اسم مستخدم SMTP (Username)</label>
                      <Input
                        value={smtpConfig.username}
                        onChange={(e) =>
                          setSmtpConfig({ ...smtpConfig, username: e.target.value })
                        }
                        dir="ltr"
                        className="text-left font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">كلمة المرور / مفتاح التطبيق</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={smtpConfig.password}
                          onChange={(e) =>
                            setSmtpConfig({ ...smtpConfig, password: e.target.value })
                          }
                          dir="ltr"
                          className="text-left font-mono text-sm pl-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between border-t border-border bg-muted/20 p-4">
                    <Button
                      onClick={() => triggerSaveNotification("تم حفظ إعدادات خادم البريد SMTP")}
                      className="gap-2 font-bold"
                    >
                      <Save className="h-4 w-4" />
                      حفظ إعدادات SMTP
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleTestSmtp}
                      disabled={smtpTesting}
                      className="gap-2"
                    >
                      {smtpTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      إرسال بريد اختباري
                    </Button>
                  </div>
                </Panel>

                {smtpTestResult && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{smtpTestResult}</span>
                  </div>
                )}
              </div>

              {/* Notification Toggles */}
              <div className="space-y-6">
                <Panel title="تنبيهات البريد الآلية" icon={Bell}>
                  <div className="space-y-3 p-5">
                    {[
                      { key: "notifyOnNewTicket" as const, label: "إشعار عند إنشاء بلاغ جديد" },
                      { key: "notifyOnSlaBreach" as const, label: "تنبيه عند اقتراب تجاوز الـ SLA" },
                      { key: "notifyOnAssignTech" as const, label: "إشعار الفني عند إسناد مهمة له" },
                      { key: "notifyOnPartsRequest" as const, label: "إشعار عند تقديم طلب قطع غيار" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <span className="text-xs font-semibold text-foreground">{item.label}</span>
                        <Switch
                          checked={smtpConfig[item.key]}
                          onCheckedChange={(val) =>
                            setSmtpConfig({ ...smtpConfig, [item.key]: val })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: BACKUP & RESTORE */}
        {/* ==================================================== */}
        {activeTab === "backup" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Panel
                  title="سجل النسخ الاحتياطية المتاحة"
                  icon={HardDrive}
                  action={
                    <Button
                      onClick={handleCreateInstantBackup}
                      disabled={creatingBackup}
                      size="sm"
                      className="gap-2 font-bold"
                    >
                      {creatingBackup ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      إنشاء نسخة احتياطية فورية الآن
                    </Button>
                  }
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم ملف النسخة</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead>الحجم</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead className="w-24 text-center">تنزيل</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backupRecords.map((b) => (
                        <TableRow key={b.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-primary" />
                              <span className="font-mono text-xs font-semibold text-foreground" dir="ltr">
                                {b.fileName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">{b.date}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground">{b.size}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {b.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {b.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={handleCreateInstantBackup}
                              title="تنزيل النسخة"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Panel>
              </div>

              {/* Backup Schedule Configuration */}
              <div className="space-y-6">
                <Panel title="جدولة النسخ التلقائي" icon={Clock}>
                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">النسخ الاحتياطي التلقائي</p>
                        <p className="text-[11px] text-muted-foreground">
                          أخذ نسخة مجدولة تلقائياً
                        </p>
                      </div>
                      <Switch
                        checked={backupSchedule.autoBackup}
                        onCheckedChange={(val) =>
                          setBackupSchedule({ ...backupSchedule, autoBackup: val })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">تكرار النسخ الاحتياطي</label>
                      <Select
                        value={backupSchedule.frequency}
                        onValueChange={(val) =>
                          setBackupSchedule({ ...backupSchedule, frequency: val })
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">يومياً (عند الساعة 03:00 ص)</SelectItem>
                          <SelectItem value="weekly">أسبوعياً (كل يوم جمعة)</SelectItem>
                          <SelectItem value="monthly">شهرياً (بداية كل شهر)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">مدة الاحتفاظ بالنسخ (أيام)</label>
                      <Input
                        type="number"
                        value={backupSchedule.retentionDays}
                        onChange={(e) =>
                          setBackupSchedule({
                            ...backupSchedule,
                            retentionDays: parseInt(e.target.value) || 30,
                          })
                        }
                      />
                    </div>

                    <Button
                      onClick={() => triggerSaveNotification("تم حفظ جدولة النسخ الاحتياطي")}
                      className="w-full gap-2 font-bold"
                    >
                      <Save className="h-4 w-4" />
                      حفظ إعدادات النسخ
                    </Button>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: SECURITY & AUDIT LOG */}
        {/* ==================================================== */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Panel title="سجل العمليات والتدقيق الأمني (Audit Log)" icon={FileText}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المستخدم</TableHead>
                        <TableHead>العملية</TableHead>
                        <TableHead>الهدف / الكيان</TableHead>
                        <TableHead>عنوان IP</TableHead>
                        <TableHead>الوقت</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/30">
                          <TableCell>
                            <span className="font-bold text-xs text-foreground">{log.user}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-foreground">{log.action}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px]">
                              {log.target}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                              {log.ip}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">{log.time}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                log.status === "ناجح"
                                  ? "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold"
                                  : "border-transparent bg-amber-500/15 text-amber-800 text-xs font-bold"
                              }
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Panel>
              </div>

              {/* Security Policy Settings */}
              <div className="space-y-6">
                <Panel title="سياسات الأمان والحماية" icon={Lock}>
                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">التحقق بخطوتين (2FA)</p>
                        <p className="text-[11px] text-muted-foreground">
                          إلزام المدراء برمز الأمان
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(val) =>
                          setSecuritySettings({ ...securitySettings, twoFactorAuth: val })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">إنهاء الجلسة التلقائي (بالدقائق)</label>
                      <Select
                        value={String(securitySettings.sessionTimeoutMinutes)}
                        onValueChange={(val) =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeoutMinutes: parseInt(val),
                          })
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 دقيقة</SelectItem>
                          <SelectItem value="30">30 دقيقة</SelectItem>
                          <SelectItem value="45">45 دقيقة (الموصى به)</SelectItem>
                          <SelectItem value="60">ساعة واحدة</SelectItem>
                          <SelectItem value="120">ساعتان</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">أقصى محاولات دخول فاشلة قبل القفل</label>
                      <Select
                        value={String(securitySettings.maxLoginAttempts)}
                        onValueChange={(val) =>
                          setSecuritySettings({
                            ...securitySettings,
                            maxLoginAttempts: parseInt(val),
                          })
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 محاولات</SelectItem>
                          <SelectItem value="5">5 محاولات (الموصى به)</SelectItem>
                          <SelectItem value="10">10 محاولات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">تقييد عناوين IP (Whitelist)</p>
                        <p className="text-[11px] text-muted-foreground">
                          حصر الدخول من شبكة فروع وزير الحلو
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.ipRestrictionsEnabled}
                        onCheckedChange={(val) =>
                          setSecuritySettings({
                            ...securitySettings,
                            ipRestrictionsEnabled: val,
                          })
                        }
                      />
                    </div>

                    <Button
                      onClick={() => triggerSaveNotification("تم تحديث سياسات الأمان بنجاح")}
                      className="w-full gap-2 font-bold"
                    >
                      <Save className="h-4 w-4" />
                      تطبيق سياسات الأمان
                    </Button>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ADD/EDIT USER MODAL */}
        {/* ==================================================== */}
        <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <form onSubmit={handleSaveUser}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <UserPlus className="h-5 w-5 text-primary" />
                  {editingUser ? "تعديل حساب المستخدم" : "إضافة مستخدم جديد للنظام"}
                </DialogTitle>
                <DialogDescription>
                  أدخل بيانات الحساب لتحديد مستوى الصلاحيات والفرع المسؤول عنه.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">الاسم الكامل *</label>
                  <Input
                    required
                    value={userFormData.name}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, name: e.target.value })
                    }
                    placeholder="مثال: أحمد عبد الله"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">البريد الإلكتروني *</label>
                  <Input
                    required
                    type="email"
                    value={userFormData.email}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, email: e.target.value })
                    }
                    dir="ltr"
                    className="text-left font-mono"
                    placeholder="user@wazeer.demo"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">الدور الوظيفي</label>
                    <Select
                      value={userFormData.roleId}
                      onValueChange={(val) => {
                        const r = systemRoles.find((sr) => sr.id === val);
                        setUserFormData({
                          ...userFormData,
                          roleId: val,
                          role: r ? r.arabicTitle : "مدير فرع",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {systemRoles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">الفرع / الموقع المسؤول</label>
                    <Input
                      value={userFormData.branch}
                      onChange={(e) =>
                        setUserFormData({ ...userFormData, branch: e.target.value })
                      }
                      placeholder="مثال: فرع المعادي"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">حالة الحساب</label>
                  <Select
                    value={userFormData.status}
                    onValueChange={(val) =>
                      setUserFormData({
                        ...userFormData,
                        status: val as "نشط" | "معطل",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نشط">نشط ومفعل</SelectItem>
                      <SelectItem value="معطل">معطل مؤقتاً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-start">
                <Button type="submit" className="gap-2 font-bold">
                  <Check className="h-4 w-4" />
                  {editingUser ? "حفظ التعديلات" : "إضافة المستخدم"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserModalOpen(false)}
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}