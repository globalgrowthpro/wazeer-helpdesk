import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  Award,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  CreditCard,
  Edit2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartPulse,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UsersRound,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/helpdesk/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
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
import { useSession } from "@/lib/auth";
import { exportToExcel } from "@/lib/export-excel";
import { branches } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hr-panel")({
  head: () => ({
    meta: [
      { title: "لوحة إدارة الموارد البشرية (HR) | وزير الحلو" },
      {
        name: "description",
        content:
          "البوابة المركزية لإدارة شؤون العاملين، طلبات الإجازات، الورديات، الحضور والانصراف، والشهادات الصحية لفروع حلواني وزير الحلو.",
      },
      { property: "og:title", content: "لوحة إدارة الموارد البشرية (HR) | وزير الحلو" },
      {
        property: "og:description",
        content:
          "البوابة المركزية لإدارة شؤون العاملين، طلبات الإجازات، الورديات، الحضور والانصراف، والشهادات الصحية لفروع حلواني وزير الحلو.",
      },
    ],
  }),
  component: HRPanelPage,
});

// Namespaced LocalStorage Keys
const HR_EMPLOYEES_KEY = "wazeer-hr-employees";
const HR_LEAVES_KEY = "wazeer-hr-leaves";
const HR_ATTENDANCE_KEY = "wazeer-hr-attendance";
const HR_PERMITS_KEY = "wazeer-hr-permits";
const HR_ANNOUNCEMENTS_KEY = "wazeer-hr-announcements";

type HRTab = "employees" | "leaves" | "attendance" | "health-permits" | "announcements";

// ==========================================
// 1. DATA MODELS
// ==========================================

export interface HREmployee {
  id: string;
  code: string;
  name: string;
  nationalId: string;
  role: string;
  department: string;
  branch: string;
  phone: string;
  email: string;
  hireDate: string;
  salary: number;
  shift: string;
  status: "على رأس العمل" | "في إجازة" | "معلق";
  healthCertExpiry: string;
  annualLeaveBalance: number;
  avatar?: string;
}

export interface HRLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  branch: string;
  role: string;
  leaveType: "اعتيادي" | "مرضي" | "عارضة" | "بدل راحة";
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: "بانتظار الاعتماد" | "معتمدة" | "مرفوضة";
  submittedAt: string;
  approvedBy?: string;
  notes?: string;
}

export interface HRAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  branch: string;
  date: string;
  shift: string;
  checkIn: string;
  checkOut?: string;
  delayMinutes: number;
  overtimeHours: number;
  status: "حاضر في الموعد" | "تأخير" | "ساعات إضافية" | "غائب" | "إجازة";
}

export interface HRHealthPermit {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  branch: string;
  role: string;
  certificateNo: string;
  healthOffice: string;
  issueDate: string;
  expiryDate: string;
  status: "سارية" | "تنتهي قريباً" | "منتهية";
}

export interface HRAnnouncement {
  id: string;
  title: string;
  targetAudience: string;
  content: string;
  date: string;
  author: string;
  pinned: boolean;
}

// ==========================================
// 2. SEED DEMO DATA
// ==========================================

const seedEmployees: HREmployee[] = [
  {
    id: "emp-01",
    code: "WZ-MGR-01",
    name: "كريم محمود",
    nationalId: "28809140102391",
    role: "مدير فرع",
    department: "إدارة الفروع والتشغيل",
    branch: "فرع التجمع",
    phone: "0100 123 4567",
    email: "kareem.m@wazeer.demo",
    hireDate: "2021-03-15",
    salary: 18500,
    shift: "الوردية الصباحية (08:00 ص - 04:00 م)",
    status: "على رأس العمل",
    healthCertExpiry: "2027-04-10",
    annualLeaveBalance: 16,
    avatar: "/staff/manager-kareem.jpg",
  },
  {
    id: "emp-02",
    code: "WZ-CHF-01",
    name: "شيف مصطفى السيد",
    nationalId: "28405110103445",
    role: "شيف حلويات شرقية رئيسي",
    department: "المطبخ والتجهيز المركزي",
    branch: "فرع التجمع",
    phone: "0111 234 5678",
    email: "mostafa.chef@wazeer.demo",
    hireDate: "2019-06-01",
    salary: 22000,
    shift: "وردية التجهيز (06:00 ص - 02:00 م)",
    status: "على رأس العمل",
    healthCertExpiry: "2026-11-20",
    annualLeaveBalance: 12,
    avatar: "/staff/chef-mostafa.jpg",
  },
  {
    id: "emp-03",
    code: "WZ-CSH-01",
    name: "مروة عادل",
    nationalId: "29508190104552",
    role: "مسؤولة كاشير واستقبال",
    department: "المبيعات والضيافة",
    branch: "فرع المعادي",
    phone: "0122 345 6789",
    email: "marwa.csh@wazeer.demo",
    hireDate: "2023-01-10",
    salary: 9500,
    shift: "الوردية المسائية (04:00 م - 12:00 ص)",
    status: "على رأس العمل",
    healthCertExpiry: "2027-02-15",
    annualLeaveBalance: 18,
    avatar: "/staff/cashier-marwa.jpg",
  },
  {
    id: "emp-04",
    code: "WZ-TECH-01",
    name: "أحمد سامي",
    nationalId: "29103210105663",
    role: "فني كاميرات وأنظمة أمنية",
    department: "الصيانة والتشغيل الميداني",
    branch: "الإدارة العامة",
    phone: "0100 234 8812",
    email: "ahmed.samy@wazeer.demo",
    hireDate: "2022-04-01",
    salary: 14000,
    shift: "الوردية الميدانية (09:00 ص - 05:00 م)",
    status: "على رأس العمل",
    healthCertExpiry: "2027-08-30",
    annualLeaveBalance: 14,
    avatar: "/staff/tech-ahmed.jpg",
  },
  {
    id: "emp-05",
    code: "WZ-TECH-02",
    name: "محمود عادل",
    nationalId: "29307120106774",
    role: "فني شبكات ونقاط بيع",
    department: "الصيانة والتشغيل الميداني",
    branch: "الإدارة العامة",
    phone: "0109 881 7720",
    email: "m.adel@wazeer.demo",
    hireDate: "2022-09-15",
    salary: 13500,
    shift: "الوردية الميدانية (09:00 ص - 05:00 م)",
    status: "على رأس العمل",
    healthCertExpiry: "2027-09-10",
    annualLeaveBalance: 15,
    avatar: "/staff/tech-mahmoud.jpg",
  },
  {
    id: "emp-06",
    code: "WZ-KIT-02",
    name: "علي جابر",
    nationalId: "29610050107885",
    role: "مساعد شيف حلويات غربية",
    department: "المطبخ والتجهيز المركزي",
    branch: "فرع مدينة نصر",
    phone: "0106 789 0123",
    email: "ali.jaber@wazeer.demo",
    hireDate: "2023-05-20",
    salary: 11000,
    shift: "الوردية المسائية (02:00 م - 10:00 م)",
    status: "في إجازة",
    healthCertExpiry: "2026-10-15",
    annualLeaveBalance: 8,
    avatar: "/staff/kitchen-ali.jpg",
  },
  {
    id: "emp-07",
    code: "WZ-MGR-02",
    name: "نور أحمد",
    nationalId: "29012040108996",
    role: "مديرة فرع مدينة نصر",
    department: "إدارة الفروع والتشغيل",
    branch: "فرع مدينة نصر",
    phone: "0102 345 6780",
    email: "nour@wazeer.demo",
    hireDate: "2021-08-01",
    salary: 18000,
    shift: "الوردية الإدارية (09:00 ص - 05:00 م)",
    status: "على رأس العمل",
    healthCertExpiry: "2027-05-12",
    annualLeaveBalance: 20,
    avatar: "/staff/cashier-marwa.jpg",
  },
  {
    id: "emp-08",
    code: "WZ-SUP-01",
    name: "م. طارق الحسيني",
    nationalId: "28204180109117",
    role: "مشرف العمليات الميدانية",
    department: "الصيانة والتشغيل الميداني",
    branch: "الإدارة العامة",
    phone: "0100 234 8812",
    email: "tarek@wazeer.demo",
    hireDate: "2018-02-10",
    salary: 24000,
    shift: "الوردية الإدارية (08:00 ص - 04:00 م)",
    status: "على رأس العمل",
    healthCertExpiry: "2027-12-01",
    annualLeaveBalance: 21,
    avatar: "/staff/supervisor-tarek.jpg",
  },
  {
    id: "emp-09",
    code: "WZ-HR-01",
    name: "أ. نادية إبراهيم",
    nationalId: "28911140101228",
    role: "مسؤولة الموارد البشرية والتدريب",
    department: "الموارد البشرية والشؤون الإدارية",
    branch: "الإدارة العامة",
    phone: "0112 554 9911",
    email: "nadia.hr@wazeer.demo",
    hireDate: "2020-07-01",
    salary: 19500,
    shift: "الوردية الإدارية (08:30 ص - 04:30 م)",
    status: "على رأس العمل",
    healthCertExpiry: "2028-01-15",
    annualLeaveBalance: 17,
    avatar: "/staff/cashier-marwa.jpg",
  },
  {
    id: "emp-10",
    code: "WZ-INV-01",
    name: "حسام الدين نبيل",
    nationalId: "29402230102339",
    role: "أمين مخزن ومستلزمات خامات",
    department: "المشتريات وسلاسل الإمداد",
    branch: "فرع الشيخ زايد",
    phone: "0114 567 8901",
    email: "hossam.inv@wazeer.demo",
    hireDate: "2022-11-01",
    salary: 10500,
    shift: "الوردية الصباحية (07:00 ص - 03:00 م)",
    status: "على رأس العمل",
    healthCertExpiry: "2026-10-25",
    annualLeaveBalance: 14,
    avatar: "/staff/inventory-hossam.jpg",
  },
];

const seedLeaves: HRLeaveRequest[] = [
  {
    id: "lev-101",
    employeeId: "emp-06",
    employeeName: "علي جابر",
    employeeCode: "WZ-KIT-02",
    branch: "فرع مدينة نصر",
    role: "مساعد شيف حلويات غربية",
    leaveType: "اعتيادي",
    startDate: "2026-09-25",
    endDate: "2026-09-28",
    daysCount: 3,
    reason: "إجازة عائلية سنوية مستحقة تم التنسيق بشأنها مسبقاً مع الشيف المسؤول.",
    status: "معتمدة",
    submittedAt: "2026-09-22",
    approvedBy: "أ. نادية إبراهيم (HR)",
    notes: "تم التأكد من توفير بديل في وردية المساء.",
  },
  {
    id: "lev-102",
    employeeId: "emp-03",
    employeeName: "مروة عادل",
    employeeCode: "WZ-CSH-01",
    branch: "فرع المعادي",
    role: "مسؤولة كاشير واستقبال",
    leaveType: "مرضي",
    startDate: "2026-09-27",
    endDate: "2026-09-28",
    daysCount: 2,
    reason: "مراجعة طبية وتقرير معتمد من التأمين الصحي.",
    status: "بانتظار الاعتماد",
    submittedAt: "2026-09-26",
    notes: "مرفق صورة الكشف الطبي من مستشفى المعادي.",
  },
  {
    id: "lev-103",
    employeeId: "emp-04",
    employeeName: "أحمد سامي",
    employeeCode: "WZ-TECH-01",
    branch: "الإدارة العامة",
    role: "فني كاميرات وأنظمة أمنية",
    leaveType: "عارضة",
    startDate: "2026-09-29",
    endDate: "2026-09-29",
    daysCount: 1,
    reason: "ظرف عائلي طارئ ليوم واحد وتغطية البلاغات مع الزميل محمود عادل.",
    status: "بانتظار الاعتماد",
    submittedAt: "2026-09-26",
  },
  {
    id: "lev-104",
    employeeId: "emp-10",
    employeeName: "حسام الدين نبيل",
    employeeCode: "WZ-INV-01",
    branch: "فرع الشيخ زايد",
    role: "أمين مخزن ومستلزمات خامات",
    leaveType: "بدل راحة",
    startDate: "2026-09-30",
    endDate: "2026-10-01",
    daysCount: 2,
    reason: "بدل راحة عن تشغيل يوم الجمعة أثناء أعمال الجرد الشهري للخامات والمستلزمات.",
    status: "بانتظار الاعتماد",
    submittedAt: "2026-09-25",
  },
  {
    id: "lev-105",
    employeeId: "emp-01",
    employeeName: "كريم محمود",
    employeeCode: "WZ-MGR-01",
    branch: "فرع التجمع",
    role: "مدير فرع",
    leaveType: "اعتيادي",
    startDate: "2026-09-10",
    endDate: "2026-09-14",
    daysCount: 4,
    reason: "إجازة سنوية تم قضاؤها وتعيين مشرف الوردية قائماً بالأعمال.",
    status: "معتمدة",
    submittedAt: "2026-09-02",
    approvedBy: "حافظ رحيم (مدير العمليات)",
  },
];

const seedAttendance: HRAttendanceRecord[] = [
  {
    id: "att-01",
    employeeId: "emp-01",
    employeeName: "كريم محمود",
    employeeCode: "WZ-MGR-01",
    branch: "فرع التجمع",
    date: "2026-09-26",
    shift: "الوردية الصباحية (08:00 - 16:00)",
    checkIn: "07:55 ص",
    checkOut: "04:10 م",
    delayMinutes: 0,
    overtimeHours: 0.2,
    status: "حاضر في الموعد",
  },
  {
    id: "att-02",
    employeeId: "emp-02",
    employeeName: "شيف مصطفى السيد",
    employeeCode: "WZ-CHF-01",
    branch: "فرع التجمع",
    date: "2026-09-26",
    shift: "وردية التجهيز (06:00 - 14:00)",
    checkIn: "05:50 ص",
    checkOut: "02:30 م",
    delayMinutes: 0,
    overtimeHours: 0.5,
    status: "ساعات إضافية",
  },
  {
    id: "att-03",
    employeeId: "emp-03",
    employeeName: "مروة عادل",
    employeeCode: "WZ-CSH-01",
    branch: "فرع المعادي",
    date: "2026-09-26",
    shift: "الوردية المسائية (16:00 - 00:00)",
    checkIn: "03:52 م",
    delayMinutes: 0,
    overtimeHours: 0,
    status: "حاضر في الموعد",
  },
  {
    id: "att-04",
    employeeId: "emp-04",
    employeeName: "أحمد سامي",
    employeeCode: "WZ-TECH-01",
    branch: "الإدارة العامة",
    date: "2026-09-26",
    shift: "الوردية الميدانية (09:00 - 17:00)",
    checkIn: "09:12 ص",
    delayMinutes: 12,
    overtimeHours: 0,
    status: "تأخير",
  },
  {
    id: "att-05",
    employeeId: "emp-05",
    employeeName: "محمود عادل",
    employeeCode: "WZ-TECH-02",
    branch: "الإدارة العامة",
    date: "2026-09-26",
    shift: "الوردية الميدانية (09:00 - 17:00)",
    checkIn: "08:58 ص",
    delayMinutes: 0,
    overtimeHours: 0,
    status: "حاضر في الموعد",
  },
  {
    id: "att-06",
    employeeId: "emp-06",
    employeeName: "علي جابر",
    employeeCode: "WZ-KIT-02",
    branch: "فرع مدينة نصر",
    date: "2026-09-26",
    shift: "الوردية المسائية (14:00 - 22:00)",
    checkIn: "-",
    delayMinutes: 0,
    overtimeHours: 0,
    status: "إجازة",
  },
];

const seedHealthPermits: HRHealthPermit[] = [
  {
    id: "hp-01",
    employeeId: "emp-02",
    employeeName: "شيف مصطفى السيد",
    employeeCode: "WZ-CHF-01",
    branch: "فرع التجمع",
    role: "شيف حلويات شرقية رئيسي",
    certificateNo: "HC-CAI-2024-8842",
    healthOffice: "مكتب صحة التجمع الخامس",
    issueDate: "2024-11-20",
    expiryDate: "2026-11-20",
    status: "تنتهي قريباً",
  },
  {
    id: "hp-02",
    employeeId: "emp-06",
    employeeName: "علي جابر",
    employeeCode: "WZ-KIT-02",
    branch: "فرع مدينة نصر",
    role: "مساعد شيف حلويات غربية",
    certificateNo: "HC-CAI-2024-9120",
    healthOffice: "مكتب صحة مدينة نصر أول",
    issueDate: "2024-10-15",
    expiryDate: "2026-10-15",
    status: "تنتهي قريباً",
  },
  {
    id: "hp-03",
    employeeId: "emp-03",
    employeeName: "مروة عادل",
    employeeCode: "WZ-CSH-01",
    branch: "فرع المعادي",
    role: "مسؤولة كاشير واستقبال",
    certificateNo: "HC-CAI-2025-1044",
    healthOffice: "مكتب صحة المعادي",
    issueDate: "2025-02-15",
    expiryDate: "2027-02-15",
    status: "سارية",
  },
  {
    id: "hp-04",
    employeeId: "emp-01",
    employeeName: "كريم محمود",
    employeeCode: "WZ-MGR-01",
    branch: "فرع التجمع",
    role: "مدير فرع",
    certificateNo: "HC-CAI-2025-2201",
    healthOffice: "مكتب صحة التجمع الخامس",
    issueDate: "2025-04-10",
    expiryDate: "2027-04-10",
    status: "سارية",
  },
  {
    id: "hp-05",
    employeeId: "emp-10",
    employeeName: "حسام الدين نبيل",
    employeeCode: "WZ-INV-01",
    branch: "فرع الشيخ زايد",
    role: "أمين مخزن ومستلزمات خامات",
    certificateNo: "HC-GIZ-2024-7731",
    healthOffice: "مكتب صحة الشيخ زايد",
    issueDate: "2024-10-25",
    expiryDate: "2026-10-25",
    status: "تنتهي قريباً",
  },
];

const seedAnnouncements: HRAnnouncement[] = [
  {
    id: "ann-01",
    title: "مواعيد الكشف الطبي وتجديد الشهادات الصحية للربع الأخير 2026",
    targetAudience: "جميع العاملين بمطابخ التجهيز والكاشير",
    content:
      "يرجى من جميع الزملاء الذين تنتهي شهاداتهم الصحية خلال شهري أكتوبر ونوفمبر التوجه لمكتب الصحة المعتمد لإجراء الفحوص الدورية وتجديد الشهادة، علماً بأن الشركة تتحمل كامل الرسوم المقررة.",
    date: "2026-09-24",
    author: "أ. نادية إبراهيم (مدير الموارد البشرية)",
    pinned: true,
  },
  {
    id: "ann-02",
    title: "صرف مكافأة الأداء المتميز لفرق عمل فروع القاهرة والجيزة",
    targetAudience: "جميع الفروع والأطقم الميدانية",
    content:
      "بناءً على التقييم الربعي لمؤشرات رضا العملاء وسرعة إنجاز بلاغات الدعم الميداني، تقرر صرف مكافأة تميز تشغيلي بنسبة 15% من الراتب الأساسي لكافة العاملين بفروع التجمع والمعادي.",
    date: "2026-09-20",
    author: "الإدارة العامة للموارد البشرية والتشغيل",
    pinned: false,
  },
];

export function HRPanelPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });

  const activeTab = useMemo<HRTab>(() => {
    const tabParam = new URLSearchParams(searchStr).get("tab") as HRTab | null;
    return tabParam && ["employees", "leaves", "attendance", "health-permits", "announcements"].includes(tabParam)
      ? tabParam
      : "employees";
  }, [searchStr]);

  const setActiveTab = (tab: HRTab) => {
    navigate({ to: "/hr-panel", search: { tab } as any });
  };

  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // LOCALSTORAGE PERSISTENT STATES
  // ==========================================
  const [employees, setEmployees] = useState<HREmployee[]>(() => {
    if (typeof window === "undefined") return seedEmployees;
    try {
      const raw = localStorage.getItem(HR_EMPLOYEES_KEY);
      return raw ? JSON.parse(raw) : seedEmployees;
    } catch {
      return seedEmployees;
    }
  });

  const [leaves, setLeaves] = useState<HRLeaveRequest[]>(() => {
    if (typeof window === "undefined") return seedLeaves;
    try {
      const raw = localStorage.getItem(HR_LEAVES_KEY);
      return raw ? JSON.parse(raw) : seedLeaves;
    } catch {
      return seedLeaves;
    }
  });

  const [attendance, setAttendance] = useState<HRAttendanceRecord[]>(() => {
    if (typeof window === "undefined") return seedAttendance;
    try {
      const raw = localStorage.getItem(HR_ATTENDANCE_KEY);
      return raw ? JSON.parse(raw) : seedAttendance;
    } catch {
      return seedAttendance;
    }
  });

  const [healthPermits, setHealthPermits] = useState<HRHealthPermit[]>(() => {
    if (typeof window === "undefined") return seedHealthPermits;
    try {
      const raw = localStorage.getItem(HR_PERMITS_KEY);
      return raw ? JSON.parse(raw) : seedHealthPermits;
    } catch {
      return seedHealthPermits;
    }
  });

  const [announcements, setAnnouncements] = useState<HRAnnouncement[]>(() => {
    if (typeof window === "undefined") return seedAnnouncements;
    try {
      const raw = localStorage.getItem(HR_ANNOUNCEMENTS_KEY);
      return raw ? JSON.parse(raw) : seedAnnouncements;
    } catch {
      return seedAnnouncements;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(HR_EMPLOYEES_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(HR_LEAVES_KEY, JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem(HR_ATTENDANCE_KEY, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(HR_PERMITS_KEY, JSON.stringify(healthPermits));
  }, [healthPermits]);

  useEffect(() => {
    localStorage.setItem(HR_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  }, [announcements]);

  // Filters
  const [branchFilter, setBranchFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("all");
  const [permitStatusFilter, setPermitStatusFilter] = useState("all");

  // Dialog states
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<HREmployee | null>(null);

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Filtered lists
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery);
      const matchBranch = branchFilter === "all" || emp.branch === branchFilter;
      const matchDept = deptFilter === "all" || emp.department === deptFilter;
      return matchSearch && matchBranch && matchDept;
    });
  }, [employees, searchQuery, branchFilter, deptFilter]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const matchSearch =
        l.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = leaveStatusFilter === "all" || l.status === leaveStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [leaves, searchQuery, leaveStatusFilter]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((att) => {
      return (
        att.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.branch.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [attendance, searchQuery]);

  const filteredPermits = useMemo(() => {
    return healthPermits.filter((hp) => {
      const matchSearch =
        hp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hp.certificateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hp.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = permitStatusFilter === "all" || hp.status === permitStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [healthPermits, searchQuery, permitStatusFilter]);

  // Unique Lists for Dropdowns
  const uniqueBranches = useMemo(() => {
    const list = Array.from(new Set(employees.map((e) => e.branch)));
    return list;
  }, [employees]);

  const uniqueDepartments = useMemo(() => {
    const list = Array.from(new Set(employees.map((e) => e.department)));
    return list;
  }, [employees]);

  // Key KPI Metrics
  const pendingLeavesCount = useMemo(() => {
    return leaves.filter((l) => l.status === "بانتظار الاعتماد").length;
  }, [leaves]);

  const expiringPermitsCount = useMemo(() => {
    return healthPermits.filter((p) => p.status === "تنتهي قريباً" || p.status === "منتهية").length;
  }, [healthPermits]);

  const onDutyCount = useMemo(() => {
    return employees.filter((e) => e.status === "على رأس العمل").length;
  }, [employees]);

  // ==========================================
  // ACTIONS / HANDLERS
  // ==========================================

  const handleApproveLeave = (id: string) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "معتمدة",
              approvedBy: user?.name ? `${user.name} (${user.roleLabel})` : "أ. نادية إبراهيم (HR)",
            }
          : l,
      ),
    );
    toast.success("تم اعتماد طلب الإجازة بنجاح وتحديث السجل.");
  };

  const handleRejectLeave = (id: string) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "مرفوضة",
              approvedBy: user?.name ? `${user.name} (${user.roleLabel})` : "أ. نادية إبراهيم (HR)",
            }
          : l,
      ),
    );
    toast.error("تم رفض طلب الإجازة وإشعار مقدم الطلب.");
  };

  const handleSaveEmployee = (item: HREmployee) => {
    if (editingEmployee) {
      setEmployees((prev) => prev.map((e) => (e.id === item.id ? item : e)));
      toast.success(`تم تحديث ملف الموظف "${item.name}"`);
    } else {
      setEmployees((prev) => [item, ...prev]);
      toast.success(`تمت إضافة الموظف الجديد "${item.name}" بنجاح.`);
    }
    setEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveLeaveRequest = (item: HRLeaveRequest) => {
    setLeaves((prev) => [item, ...prev]);
    toast.success(`تم تسجيل طلب إجازة جديد للموظف "${item.employeeName}" بنجاح.`);
    setLeaveModalOpen(false);
  };

  const handleDeleteEmployee = () => {
    const { id, name } = deleteConfirmDialog;
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    toast.success(`تم حذف سجل الموظف "${name}"`);
    setDeleteConfirmDialog({ open: false, id: "", name: "" });
  };

  const handleResetToDefaults = () => {
    setEmployees(seedEmployees);
    setLeaves(seedLeaves);
    setAttendance(seedAttendance);
    setHealthPermits(seedHealthPermits);
    setAnnouncements(seedAnnouncements);
    localStorage.setItem(HR_EMPLOYEES_KEY, JSON.stringify(seedEmployees));
    localStorage.setItem(HR_LEAVES_KEY, JSON.stringify(seedLeaves));
    localStorage.setItem(HR_ATTENDANCE_KEY, JSON.stringify(seedAttendance));
    localStorage.setItem(HR_PERMITS_KEY, JSON.stringify(seedHealthPermits));
    localStorage.setItem(HR_ANNOUNCEMENTS_KEY, JSON.stringify(seedAnnouncements));
    setResetConfirmOpen(false);
    toast.success("تمت استعادة البيانات الافتراضية لمنظومة الموارد البشرية بنجاح.");
  };

  // Quick punch simulation
  const handleQuickPunch = (emp: HREmployee) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toISOString().slice(0, 10);

    const existingIndex = attendance.findIndex(
      (a) => a.employeeId === emp.id && a.date === dateStr,
    );

    if (existingIndex >= 0) {
      // punch out
      setAttendance((prev) =>
        prev.map((a, idx) =>
          idx === existingIndex
            ? { ...a, checkOut: timeStr, status: "حاضر في الموعد" }
            : a,
        ),
      );
      toast.success(`تم تسجيل بصمة انصراف للموظف ${emp.name} في ${timeStr}`);
    } else {
      // punch in
      const newRec: HRAttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeCode: emp.code,
        branch: emp.branch,
        date: dateStr,
        shift: emp.shift,
        checkIn: timeStr,
        delayMinutes: 0,
        overtimeHours: 0,
        status: "حاضر في الموعد",
      };
      setAttendance((prev) => [newRec, ...prev]);
      toast.success(`تم تسجيل بصمة حضور للموظف ${emp.name} في ${timeStr}`);
    }
  };

  // ==========================================
  // EXCEL EXPORTS
  // ==========================================

  const handleExportEmployees = () => {
    const rows = filteredEmployees.map((e) => ({
      كود_الموظف: e.code,
      اسم_الموظف: e.name,
      الرقم_القومي: e.nationalId,
      المسمى_الوظيفي: e.role,
      الإدارة: e.department,
      الفرع: e.branch,
      الهاتف: e.phone,
      البريد_الإلكتروني: e.email,
      تاريخ_التعيين: e.hireDate,
      الراتب_الأساسي: e.salary,
      الوردية: e.shift,
      حالة_العمل: e.status,
      رصيد_الإجازات: e.annualLeaveBalance,
      انتهاء_الشهادة_الصحية: e.healthCertExpiry,
    }));
    exportToExcel({
      rows,
      fileName: "سجل_العاملين_والموظفين_وزير_الحلو",
      sheetName: "الموظفون",
    });
    toast.success("تم تصدير سجل الموظفين إلى Excel بنجاح!");
  };

  const handleExportLeaves = () => {
    const rows = filteredLeaves.map((l) => ({
      كود_الطلب: l.id,
      كود_الموظف: l.employeeCode,
      اسم_الموظف: l.employeeName,
      الفرع: l.branch,
      المسمى_الوظيفي: l.role,
      نوع_الإجازة: l.leaveType,
      تاريخ_البداية: l.startDate,
      تاريخ_النهاية: l.endDate,
      عدد_الأيام: l.daysCount,
      السبب: l.reason,
      الحالة: l.status,
      تاريخ_التقديم: l.submittedAt,
      الاعتماد_بواسطة: l.approvedBy || "-",
    }));
    exportToExcel({
      rows,
      fileName: "سجل_طلبات_الإجازات_وزير_الحلو",
      sheetName: "الإجازات",
    });
    toast.success("تم تصدير طلبات الإجازات إلى Excel بنجاح!");
  };

  const handleExportAttendance = () => {
    const rows = filteredAttendance.map((a) => ({
      التاريخ: a.date,
      كود_الموظف: a.employeeCode,
      اسم_الموظف: a.employeeName,
      الفرع: a.branch,
      الوردية: a.shift,
      وقت_الحضور: a.checkIn,
      وقت_الانصراف: a.checkOut || "لم يسجل بعد",
      دقائق_التأخير: a.delayMinutes,
      ساعات_إضافية: a.overtimeHours,
      حالة_الحضور: a.status,
    }));
    exportToExcel({
      rows,
      fileName: "سجل_الحضور_والانصراف_وزير_الحلو",
      sheetName: "الحضور والورديات",
    });
    toast.success("تم تصدير سجل الحضور إلى Excel بنجاح!");
  };

  const handleExportHealthPermits = () => {
    const rows = filteredPermits.map((hp) => ({
      رقم_الشهادة_الصحية: hp.certificateNo,
      كود_الموظف: hp.employeeCode,
      اسم_الموظف: hp.employeeName,
      الفرع: hp.branch,
      المسمى_الوظيفي: hp.role,
      مكتب_الصحة_المصدر: hp.healthOffice,
      تاريخ_الإصدار: hp.issueDate,
      تاريخ_الانتهاء: hp.expiryDate,
      حالة_الشهادة: hp.status,
    }));
    exportToExcel({
      rows,
      fileName: "سجل_الشهادات_الصحية_للعاملين_وزير_الحلو",
      sheetName: "الشهادات الصحية",
    });
    toast.success("تم تصدير سجل الشهادات الصحية إلى Excel بنجاح!");
  };

  return (
    <AppShell
      title="بوابة إدارة الموارد البشرية وشؤون العاملين (HR)"
      role="admin"
      allowedRoles={["admin", "hr"]}
    >
      <div className="space-y-6">
        {/* Top Header Card with Brand Styling & KPI Counters */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-ink dark:text-brand-gold">
                  <UsersRound className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    إدارة الموارد البشرية وشؤون العاملين
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    متابعة كادر العمل، طلبات الإجازات، الحضور والانصراف، والشهادات الصحية لفروع حلواني وزير الحلو (Wazeer Elhelw)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetConfirmOpen(true)}
                className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="استعادة البيانات الافتراضية"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">استعادة الافتراضي</span>
              </Button>
            </div>
          </div>

          {/* Key HR KPI Counters */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-border/70">
            <div
              onClick={() => setActiveTab("employees")}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all",
                activeTab === "employees"
                  ? "bg-brand-gold/10 border border-brand-gold/40 shadow-xs"
                  : "bg-surface/50 hover:bg-surface border border-transparent",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">إجمالي العاملين</span>
                <Users className="h-4 w-4 text-brand-gold" />
              </div>
              <p className="mt-1 text-xl font-black text-foreground font-mono">
                {employees.length} موظف
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ● {onDutyCount} على رأس العمل اليوم
              </p>
            </div>

            <div
              onClick={() => setActiveTab("leaves")}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all",
                activeTab === "leaves"
                  ? "bg-brand-gold/10 border border-brand-gold/40 shadow-xs"
                  : "bg-surface/50 hover:bg-surface border border-transparent",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">طلبات الإجازات</span>
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-1 text-xl font-black text-foreground font-mono">
                {leaves.length} طلب
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {pendingLeavesCount > 0 ? `⚠️ ${pendingLeavesCount} بانتظار الاعتماد` : "✓ لا توجد طلبات معلقة"}
              </p>
            </div>

            <div
              onClick={() => setActiveTab("attendance")}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all",
                activeTab === "attendance"
                  ? "bg-brand-gold/10 border border-brand-gold/40 shadow-xs"
                  : "bg-surface/50 hover:bg-surface border border-transparent",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">الحضور اليومي</span>
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-1 text-xl font-black text-foreground font-mono">
                96.4%
              </p>
              <p className="text-[11px] text-muted-foreground">
                {attendance.length} بصمة مسجلة اليوم
              </p>
            </div>

            <div
              onClick={() => setActiveTab("health-permits")}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all",
                activeTab === "health-permits"
                  ? "bg-brand-gold/10 border border-brand-gold/40 shadow-xs"
                  : "bg-surface/50 hover:bg-surface border border-transparent",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">الشهادات الصحية</span>
                <HeartPulse className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="mt-1 text-xl font-black text-foreground font-mono">
                {healthPermits.length} شهادة
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {expiringPermitsCount > 0 ? `تنبيه: ${expiringPermitsCount} تنتهي قريباً` : "✓ جميعها سارية"}
              </p>
            </div>
          </div>
        </div>

        {/* Active Section Header & Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-border text-brand-gold">
              {activeTab === "employees" && <Users className="h-4 w-4" />}
              {activeTab === "leaves" && <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              {activeTab === "attendance" && <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              {activeTab === "health-permits" && <HeartPulse className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
              {activeTab === "announcements" && <Megaphone className="h-4 w-4 text-brand-gold" />}
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {activeTab === "employees" && "سجل العاملين والموظفين"}
                {activeTab === "leaves" && "طلبات الإجازات والاستئذانات"}
                {activeTab === "attendance" && "سجل الحضور والانصراف والورديات"}
                {activeTab === "health-permits" && "الشهادات والتراخيص الصحية (سلامة الغذاء)"}
                {activeTab === "announcements" && "التعاميم والمكافآت الإدارية"}
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {activeTab === "employees" && `إجمالي ${employees.length} موظفاً عبر كافة الفروع والمطابخ`}
                {activeTab === "leaves" && `${leaves.length} طلباً مسجلاً (${pendingLeavesCount} بانتظار الاعتماد)`}
                {activeTab === "attendance" && `${attendance.length} تسجيلاً لحركات البصمة اليومية`}
                {activeTab === "health-permits" && `${healthPermits.length} شهادات صحية معتمدة`}
                {activeTab === "announcements" && `${announcements.length} تعاميم ومكافآت معتمدة`}
              </span>
            </div>
          </div>

          {/* Action buttons based on active tab */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === "employees" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportEmployees}
                  className="h-9 gap-1.5 text-xs font-bold"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-brand-gold" />
                  <span>تصدير Excel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingEmployee(null);
                    setEmployeeModalOpen(true);
                  }}
                  className="h-9 gap-1.5 text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>إضافة موظف</span>
                </Button>
              </>
            )}

            {activeTab === "leaves" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportLeaves}
                  className="h-9 gap-1.5 text-xs font-bold"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-brand-gold" />
                  <span>تصدير Excel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLeaveModalOpen(true)}
                  className="h-9 gap-1.5 text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
                >
                  <Plus className="h-4 w-4" />
                  <span>طلب إجازة جديد</span>
                </Button>
              </>
            )}

            {activeTab === "attendance" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAttendance}
                className="h-9 gap-1.5 text-xs font-bold"
              >
                <ArrowDownToLine className="h-3.5 w-3.5 text-brand-gold" />
                <span>تصدير Excel</span>
              </Button>
            )}

            {activeTab === "health-permits" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportHealthPermits}
                className="h-9 gap-1.5 text-xs font-bold"
              >
                <ArrowDownToLine className="h-3.5 w-3.5 text-brand-gold" />
                <span>تصدير Excel</span>
              </Button>
            )}

            {activeTab === "announcements" && (
              <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90">
                <Link to="/chat">
                  <Send className="h-4 w-4" />
                  <span>إرسال تعميم عبر المحادثة</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tab Search & Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card rounded-xl p-3 border border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "employees"
                  ? "بحث بالاسم، الكود، الوظيفة، أو الهاتف..."
                  : activeTab === "leaves"
                    ? "بحث باسم الموظف أو الفرع..."
                    : activeTab === "attendance"
                      ? "بحث في سجلات البصمة..."
                      : "بحث في الشهادات ومكاتب الصحة..."
              }
              className="h-9 pr-9 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "employees" && (
              <>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="h-9 w-44 text-xs bg-background">
                    <SelectValue placeholder="تصفية حسب الفرع" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">جميع الفروع</SelectItem>
                    {uniqueBranches.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="h-9 w-44 text-xs bg-background">
                    <SelectValue placeholder="تصفية حسب الإدارة" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">جميع الإدارات</SelectItem>
                    {uniqueDepartments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {activeTab === "leaves" && (
              <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
                <SelectTrigger className="h-9 w-44 text-xs bg-background">
                  <SelectValue placeholder="حالة الطلب" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="بانتظار الاعتماد">بانتظار الاعتماد</SelectItem>
                  <SelectItem value="معتمدة">معتمدة</SelectItem>
                  <SelectItem value="مرفوضة">مرفوضة</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === "health-permits" && (
              <Select value={permitStatusFilter} onValueChange={setPermitStatusFilter}>
                <SelectTrigger className="h-9 w-44 text-xs bg-background">
                  <SelectValue placeholder="حالة الشهادة" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="سارية">سارية</SelectItem>
                  <SelectItem value="تنتهي قريباً">تنتهي قريباً</SelectItem>
                  <SelectItem value="منتهية">منتهية</SelectItem>
                </SelectContent>
              </Select>
            )}

            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-9 px-2 text-xs text-muted-foreground"
              >
                مسح البحث
              </Button>
            )}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: STAFF DIRECTORY (EMPLOYEES)
           ========================================================================= */}
        {activeTab === "employees" && (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface/60">
                  <TableRow>
                    <TableHead className="text-right text-xs font-bold text-foreground">الموظف</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الكود والوظيفة</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الفرع والإدارة</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">بيانات التواصل</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الوردية</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الشهادة الصحية</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">رصيد الإجازات</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الحالة</TableHead>
                    <TableHead className="text-left text-xs font-bold text-foreground">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-36 text-center text-xs text-muted-foreground">
                        لا يوجد موظفون مطابقون لشروط البحث أو التصفية الحالية.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <TableRow key={emp.id} className="hover:bg-surface/40 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border border-border">
                              {emp.avatar && <AvatarImage src={emp.avatar} alt={emp.name} />}
                              <AvatarFallback className="text-[10px] font-bold bg-surface-strong">
                                {emp.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-xs text-foreground">{emp.name}</p>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                قيد: {emp.hireDate}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-mono text-[10px] font-bold text-brand-gold">
                              {emp.code}
                            </span>
                            <p className="text-xs font-semibold text-foreground">{emp.role}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-bold text-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {emp.branch}
                            </p>
                            <span className="text-[11px] text-muted-foreground">{emp.department}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-[11px] space-y-0.5">
                            <p className="font-mono text-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3 text-emerald-600" />
                              {emp.phone}
                            </p>
                            <p className="font-mono text-muted-foreground">{emp.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] text-muted-foreground block max-w-[140px] truncate">
                            {emp.shift}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-[11px] text-foreground block">
                            {emp.healthCertExpiry}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {emp.annualLeaveBalance} يوم
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                              emp.status === "على رأس العمل"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : emp.status === "في إجازة"
                                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                emp.status === "على رأس العمل"
                                  ? "bg-emerald-500"
                                  : emp.status === "في إجازة"
                                    ? "bg-blue-500"
                                    : "bg-muted-foreground",
                              )}
                            />
                            {emp.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleQuickPunch(emp)}
                              className="h-7 px-2 text-[11px] font-bold text-brand-ink dark:text-brand-gold hover:bg-brand-gold/15"
                              title="تسجيل بصمة سريعة"
                            >
                              بصمة
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingEmployee(emp);
                                setEmployeeModalOpen(true);
                              }}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="تعديل الموظف"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                setDeleteConfirmDialog({
                                  open: true,
                                  id: emp.id,
                                  name: emp.name,
                                })
                              }
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              title="حذف الموظف"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: LEAVE & PERMISSION MANAGEMENT
           ========================================================================= */}
        {activeTab === "leaves" && (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface/60">
                  <TableRow>
                    <TableHead className="text-right text-xs font-bold text-foreground">كود الطلب</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الموظف والفرع</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">نوع الإجازة</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الفترة الزمنية</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الأيام</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">السبب والملاحظات</TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">الحالة</TableHead>
                    <TableHead className="text-left text-xs font-bold text-foreground">الإجراء والاعتماد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                        لا توجد طلبات إجازة مطابقة للتصفية الحالية.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((l) => (
                      <TableRow key={l.id} className="hover:bg-surface/40 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-brand-gold">
                          {l.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-xs text-foreground">{l.employeeName}</p>
                            <span className="text-[11px] text-muted-foreground">
                              {l.employeeCode} · {l.branch}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold py-0.5",
                              l.leaveType === "مرضي" && "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
                              l.leaveType === "اعتيادي" && "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
                              l.leaveType === "عارضة" && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
                            )}
                          >
                            {l.leaveType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-mono">
                            <span className="text-foreground">{l.startDate}</span>
                            <span className="text-muted-foreground mx-1">إلى</span>
                            <span className="text-foreground">{l.endDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs font-mono">{l.daysCount} أيام</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[240px]">
                            <p className="text-xs text-foreground truncate">{l.reason}</p>
                            {l.approvedBy && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                الاعتماد: {l.approvedBy}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                              l.status === "معتمدة"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : l.status === "مرفوضة"
                                  ? "bg-red-500/15 text-red-700 dark:text-red-300"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300 animate-pulse",
                            )}
                          >
                            {l.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-left">
                          {l.status === "بانتظار الاعتماد" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => handleApproveLeave(l.id)}
                                className="h-7 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>اعتماد</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectLeave(l.id)}
                                className="h-7 px-2 text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30"
                              >
                                <X className="h-3 w-3" />
                                <span>رفض</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-semibold">
                              تم البت في الطلب
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: ATTENDANCE & SHIFTS
           ========================================================================= */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-surface/40 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    سجل البصمات الإلكترونية اليومي (Punch Clock)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    مزامنة حية مع ماكينات البصمة بمطابخ وكاشير فروع حلواني وزير الحلو
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {new Date().toISOString().slice(0, 10)}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-surface/60">
                    <TableRow>
                      <TableHead className="text-right text-xs font-bold text-foreground">الموظف</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">الفرع والوردية</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">وقت الحضور</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">وقت الانصراف</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">التأخير</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">ساعات إضافية</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((att) => (
                      <TableRow key={att.id} className="hover:bg-surface/40 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-bold text-xs text-foreground">{att.employeeName}</p>
                            <span className="font-mono text-[10px] text-muted-foreground">{att.employeeCode}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{att.branch}</p>
                            <span className="text-[11px] text-muted-foreground">{att.shift}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {att.checkIn}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {att.checkOut || "قيد العمل..."}
                        </TableCell>
                        <TableCell>
                          {att.delayMinutes > 0 ? (
                            <Badge variant="destructive" className="font-mono text-[10px] py-0">
                              +{att.delayMinutes} دقيقة
                            </Badge>
                          ) : (
                            <span className="text-xs text-emerald-600 font-bold font-mono">0 دقيقة</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {att.overtimeHours > 0 ? (
                            <Badge variant="outline" className="font-mono text-[10px] py-0 bg-brand-gold/15 text-brand-ink">
                              +{att.overtimeHours} س
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                              att.status === "حاضر في الموعد" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                              att.status === "ساعات إضافية" && "bg-brand-gold/20 text-brand-ink dark:text-brand-gold",
                              att.status === "تأخير" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                              att.status === "إجازة" && "bg-blue-500/15 text-blue-700 dark:text-blue-300",
                            )}
                          >
                            {att.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: HEALTH CERTIFICATES & COMPLIANCE
           ========================================================================= */}
        {activeTab === "health-permits" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <HeartPulse className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs sm:text-sm">
                  الاشتراطات الصحية لسلامة الغذاء وتداول الأغذية والحلويات:
                </p>
                <p className="text-[11px] leading-relaxed mt-0.5 text-amber-800 dark:text-amber-300">
                  وفقاً لتعليمات وزارة الصحة ومفتشي سلامة الأغذية، يتعين على كافة الشيفات ومساعدي المطابخ والكاشير تجديد الشهادة الصحية الرسمية سنوياً قبل انتهاء صلاحيتها بـ 30 يوماً على الأقل.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-surface/60">
                    <TableRow>
                      <TableHead className="text-right text-xs font-bold text-foreground">رقم الشهادة الصحية</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">اسم الموظف</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">الوظيفة والفرع</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">مكتب الصحة المعتمد</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">تاريخ الإصدار</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">تاريخ الانتهاء</TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">حالة السريان</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermits.map((hp) => (
                      <TableRow key={hp.id} className="hover:bg-surface/40 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-brand-gold">
                          {hp.certificateNo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-xs text-foreground">{hp.employeeName}</p>
                            <span className="font-mono text-[10px] text-muted-foreground">{hp.employeeCode}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{hp.role}</p>
                            <span className="text-[11px] text-muted-foreground">{hp.branch}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {hp.healthOffice}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {hp.issueDate}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {hp.expiryDate}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={hp.status === "سارية" ? "default" : "destructive"}
                            className={cn(
                              "text-[10px] font-bold py-0.5",
                              hp.status === "سارية" && "bg-emerald-600 text-white",
                              hp.status === "تنتهي قريباً" && "bg-amber-500 text-white",
                            )}
                          >
                            {hp.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: ANNOUNCEMENTS & ROSTER BROADCASTS
           ========================================================================= */}
        {activeTab === "announcements" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={cn(
                    "rounded-xl border p-4 shadow-sm bg-card transition-all flex flex-col justify-between",
                    ann.pinned ? "border-brand-gold/50 shadow-xs" : "border-border",
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-ink dark:text-brand-gold">
                          <Megaphone className="h-4 w-4" />
                        </span>
                        <div>
                          <h3 className="font-bold text-xs sm:text-sm text-foreground">{ann.title}</h3>
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            المستهدف: {ann.targetAudience}
                          </span>
                        </div>
                      </div>
                      {ann.pinned && (
                        <Badge variant="outline" className="text-[10px] border-brand-gold text-brand-gold">
                          تعميم مثبت
                        </Badge>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-line bg-surface/30 p-3 rounded-lg border border-border/50">
                      {ann.content}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>الجهة المصدرة: {ann.author}</span>
                    <span className="font-mono">{ann.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          DIALOGS / MODALS
         ========================================================================= */}

      {/* 1. Add / Edit Employee Dialog */}
      <EmployeeDialog
        open={employeeModalOpen}
        onOpenChange={setEmployeeModalOpen}
        initialData={editingEmployee}
        branchesList={uniqueBranches}
        departmentsList={uniqueDepartments}
        onSave={handleSaveEmployee}
      />

      {/* 2. Add Leave Request Dialog */}
      <LeaveRequestDialog
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        employeesList={employees}
        onSave={handleSaveLeaveRequest}
      />

      {/* 3. Delete Employee Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onOpenChange={(open) => setDeleteConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
              <Trash2 className="h-5 w-5" />
              <span>تأكيد حذف ملف الموظف</span>
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              هل أنت متأكد من رغبتك في حذف ملف الموظف <strong>"{deleteConfirmDialog.name}"</strong> من سجلات المنظومة؟ لن تتمكن من التراجع عن هذه الخطوة إلا عبر استعادة البيانات الافتراضية.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmDialog((prev) => ({ ...prev, open: false }))}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteEmployee}
              className="text-xs font-bold"
            >
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Reset Defaults Confirmation Dialog */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-5 w-5" />
              <span>استعادة البيانات الافتراضية لشؤون العاملين</span>
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              سيتم إعادة تعيين كافة سجلات الموظفين، طلبات الإجازات، سجلات البصمة والشهادات الصحية إلى بيانات المصنع الافتراضية وحفظها في التخزين المحلي.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetConfirmOpen(false)}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleResetToDefaults}
              className="text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
            >
              استعادة الآن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

// =========================================================================
// SUB-DIALOG COMPONENTS
// =========================================================================

function EmployeeDialog({
  open,
  onOpenChange,
  initialData,
  branchesList,
  departmentsList,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: HREmployee | null;
  branchesList: string[];
  departmentsList: string[];
  onSave: (item: HREmployee) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [salary, setSalary] = useState(10000);
  const [shift, setShift] = useState("الوردية الصباحية (08:00 ص - 04:00 م)");
  const [healthCertExpiry, setHealthCertExpiry] = useState("2027-01-01");
  const [annualLeaveBalance, setAnnualLeaveBalance] = useState(21);
  const [status, setStatus] = useState<"على رأس العمل" | "في إجازة" | "معلق">("على رأس العمل");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setNationalId(initialData.nationalId);
      setRole(initialData.role);
      setDepartment(initialData.department);
      setBranch(initialData.branch);
      setPhone(initialData.phone);
      setEmail(initialData.email);
      setHireDate(initialData.hireDate);
      setSalary(initialData.salary);
      setShift(initialData.shift);
      setHealthCertExpiry(initialData.healthCertExpiry);
      setAnnualLeaveBalance(initialData.annualLeaveBalance);
      setStatus(initialData.status);
    } else {
      setName("");
      setCode(`WZ-EMP-${Math.floor(10 + Math.random() * 89)}`);
      setNationalId("29" + Math.floor(100000000000 + Math.random() * 899999999999));
      setRole("");
      setDepartment(departmentsList[0] || "المطبخ والتجهيز المركزي");
      setBranch(branchesList[0] || "فرع التجمع");
      setPhone("0100 000 0000");
      setEmail("");
      setHireDate(new Date().toISOString().slice(0, 10));
      setSalary(12000);
      setShift("الوردية الصباحية (08:00 ص - 04:00 م)");
      setHealthCertExpiry("2027-06-30");
      setAnnualLeaveBalance(21);
      setStatus("على رأس العمل");
    }
  }, [initialData, open, branchesList, departmentsList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !phone.trim()) {
      toast.error("يرجى ملء الاسم والوظيفة ورقم الهاتف");
      return;
    }
    const item: HREmployee = {
      id: initialData ? initialData.id : `emp-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      nationalId: nationalId.trim(),
      role: role.trim(),
      department,
      branch,
      phone: phone.trim(),
      email: email.trim() || `${code.toLowerCase()}@wazeer.demo`,
      hireDate,
      salary: Number(salary) || 10000,
      shift,
      healthCertExpiry,
      annualLeaveBalance: Number(annualLeaveBalance) || 21,
      status,
      avatar: initialData?.avatar || "/staff/manager-kareem.jpg",
    };
    onSave(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {initialData ? "تعديل ملف الموظف" : "تسجيل موظف جديد"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            إدخال البيانات الوظيفية والشهادة الصحية والوردية المخصصة للموظف.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">اسم الموظف الرباعي *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم الموظف"
                className="h-8.5 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">كود الموظف الوظيفي *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="WZ-EMP-01"
                className="h-8.5 text-xs font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">الرقم القومي (14 رقم)</Label>
              <Input
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="29000000000000"
                className="h-8.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">المسمى الوظيفي *</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="مثال: شيف حلويات شرقية"
                className="h-8.5 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">الفرع المخصص</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branchesList.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">الإدارة / القسم</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">رقم الهاتف المحمول *</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0100 000 0000"
                className="h-8.5 text-xs font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">البريد الإلكتروني</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="emp@wazeer.demo"
                className="h-8.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">تاريخ التعيين</Label>
              <Input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="h-8.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">الراتب الأساسي (ج.م)</Label>
              <Input
                type="number"
                min="3000"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="h-8.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">رصيد الإجازات السنوي</Label>
              <Input
                type="number"
                min="0"
                max="30"
                value={annualLeaveBalance}
                onChange={(e) => setAnnualLeaveBalance(Number(e.target.value))}
                className="h-8.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">الوردية المخصصة</Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الوردية الصباحية (08:00 ص - 04:00 م)">الوردية الصباحية (08:00 ص - 04:00 م)</SelectItem>
                  <SelectItem value="الوردية المسائية (04:00 م - 12:00 ص)">الوردية المسائية (04:00 م - 12:00 ص)</SelectItem>
                  <SelectItem value="وردية التجهيز (06:00 ص - 02:00 م)">وردية التجهيز (06:00 ص - 02:00 م)</SelectItem>
                  <SelectItem value="الوردية الميدانية (09:00 ص - 05:00 م)">الوردية الميدانية (09:00 ص - 05:00 م)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">تاريخ انتهاء الشهادة الصحية</Label>
              <Input
                type="date"
                value={healthCertExpiry}
                onChange={(e) => setHealthCertExpiry(e.target.value)}
                className="h-8.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">حالة العمل</Label>
            <Select
              value={status}
              onValueChange={(v: "على رأس العمل" | "في إجازة" | "معلق") => setStatus(v)}
            >
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="على رأس العمل">على رأس العمل</SelectItem>
                <SelectItem value="في إجازة">في إجازة</SelectItem>
                <SelectItem value="معلق">معلق</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
            >
              حفظ الموظف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LeaveRequestDialog({
  open,
  onOpenChange,
  employeesList,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeesList: HREmployee[];
  onSave: (item: HRLeaveRequest) => void;
}) {
  const [selectedEmpId, setSelectedEmpId] = useState(employeesList[0]?.id || "");
  const [leaveType, setLeaveType] = useState<"اعتيادي" | "مرضي" | "عارضة" | "بدل راحة">("اعتيادي");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [daysCount, setDaysCount] = useState(1);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employeesList.find((x) => x.id === selectedEmpId) || employeesList[0];
    if (!emp || !reason.trim()) {
      toast.error("يرجى اختيار الموظف وكتابة سبب الإجازة");
      return;
    }

    const item: HRLeaveRequest = {
      id: `lev-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.code,
      branch: emp.branch,
      role: emp.role,
      leaveType,
      startDate,
      endDate,
      daysCount: Number(daysCount) || 1,
      reason: reason.trim(),
      status: "بانتظار الاعتماد",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    onSave(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">تسجيل طلب إجازة جديد</DialogTitle>
          <DialogDescription className="text-xs">
            تقديم طلب إجازة اعتيادية أو مرضية أو عارضة لموظفي الفروع والمطابخ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs mt-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">الموظف صاحب الطلب *</Label>
            <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                {employeesList.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role} - {emp.branch})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">نوع الإجازة</Label>
              <Select
                value={leaveType}
                onValueChange={(v: "اعتيادي" | "مرضي" | "عارضة" | "بدل راحة") => setLeaveType(v)}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="اعتيادي">اعتيادي (سنوي)</SelectItem>
                  <SelectItem value="مرضي">مرضي (تقرير طبي)</SelectItem>
                  <SelectItem value="عارضة">عارضة</SelectItem>
                  <SelectItem value="بدل راحة">بدل راحة أسبوعية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">عدد الأيام المطلوبة</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="h-8.5 text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">تاريخ البداية</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8.5 text-xs font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">تاريخ النهاية</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8.5 text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">سبب الإجازة وملاحظات التغطية *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب الإجازة واسم الزميل القائم بالعمل البديل إن وجد..."
              className="resize-none text-xs min-h-[60px]"
              required
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
            >
              تقديم الطلب
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
