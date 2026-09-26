import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  Building,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Edit2,
  Eye,
  FileSpreadsheet,
  FolderTree,
  Inbox,
  Layers,
  LifeBuoy,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/helpdesk/app-shell";
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
import { exportToExcel } from "@/lib/export-excel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "دليل النظام المرجعي | وزير الحلو" },
      {
        name: "description",
        content:
          "الدليل المركزي: إدارة التصنيفات، الإدارات والأقسام، المواقع الجغرافية (المدن والأحياء)، وقوالب البريد الإلكتروني التشغيلية.",
      },
      { property: "og:title", content: "دليل النظام المرجعي | وزير الحلو" },
      {
        property: "og:description",
        content:
          "الدليل المركزي: إدارة التصنيفات، الإدارات والأقسام، المواقع الجغرافية (المدن والأحياء)، وقوالب البريد الإلكتروني التشغيلية.",
      },
    ],
  }),
  component: DirectoryPage,
});

// Storage Namespaces per AGENTS.md rule
const DIR_CATEGORIES_KEY = "wazeer-dir-categories";
const DIR_DEPARTMENTS_KEY = "wazeer-dir-departments";
const DIR_LOCATIONS_KEY = "wazeer-dir-locations";
const DIR_EMAIL_TEMPLATES_KEY = "wazeer-dir-email-templates";

type DirectoryTab = "categories" | "departments" | "locations" | "email-templates";

// ==========================================
// 1. DATA MODELS
// ==========================================
export interface CategoryItem {
  id: string;
  name: string;
  code: string;
  department: string;
  slaResponseHours: number;
  slaResolveHours: number;
  defaultPriority: "منخفضة" | "متوسطة" | "عالية" | "حرجة";
  activeTicketsCount: number;
  description: string;
  status: "نشط" | "معطل";
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  headName: string;
  headTitle: string;
  email: string;
  phone: string;
  location: string;
  staffCount: number;
  activeTicketsCount: number;
  status: "نشط" | "معطل";
}

export interface LocationItem {
  id: string;
  city: string;
  district: string;
  zone: string;
  branchesCount: number;
  branchesList: string[];
  techniciansCount: number;
  supervisorName: string;
  coverageType: "تغطية 24/7" | "وردية نهارية (08 ص - 11 م)" | "تغطية طوارئ";
  status: "نشط ومغطى" | "قيد التوسعة";
}

export interface EmailTemplateItem {
  id: string;
  name: string;
  code: string;
  triggerEvent: string;
  recipientRole: string;
  subject: string;
  body: string;
  variables: string[];
  category: "بلاغات" | "مشتريات" | "طوارئ وSLA" | "تعاميم";
  status: "مفعل" | "معطل";
  lastUpdated: string;
}

// ==========================================
// SEED INITIAL DATA
// ==========================================
const seedCategories: CategoryItem[] = [
  {
    id: "cat-cameras",
    name: "كاميرات مراقبة وأنظمة أمنية",
    code: "SEC-CAM",
    department: "إدارة تكنولوجيا المعلومات والنظم",
    slaResponseHours: 1,
    slaResolveHours: 4,
    defaultPriority: "عالية",
    activeTicketsCount: 8,
    description: "صيانة وتركيب كاميرات المراقبة الرقمية (IP/NVR)، أجهزة التسجيل، ومحولات PoE.",
    status: "نشط",
  },
  {
    id: "cat-networks",
    name: "شبكات وربط اتصالات الفروع",
    code: "NET-IT",
    department: "إدارة تكنولوجيا المعلومات والنظم",
    slaResponseHours: 0.5,
    slaResolveHours: 2,
    defaultPriority: "حرجة",
    activeTicketsCount: 5,
    description: "نقاط الشبكة لكبائن الكاشير، أجهزة الراوتر، السويتشات، وبوابات الإنترنت VPN.",
    status: "نشط",
  },
  {
    id: "cat-access",
    name: "تحكم الدخول وبطاقات الهوية",
    code: "ACC-CRD",
    department: "إدارة الصيانة والتشغيل الميداني",
    slaResponseHours: 2,
    slaResolveHours: 8,
    defaultPriority: "متوسطة",
    activeTicketsCount: 3,
    description: "أقفال الأبواب المغناطيسية، بطاقة الدخول الذكية، وماكينات بصمة الحضور والانصراف.",
    status: "نشط",
  },
  {
    id: "cat-pos",
    name: "نقاط البيع والكاشير (POS)",
    code: "POS-RTL",
    department: "إدارة تكنولوجيا المعلومات والنظم",
    slaResponseHours: 0.5,
    slaResolveHours: 1.5,
    defaultPriority: "حرجة",
    activeTicketsCount: 7,
    description: "شاشات اللمس الطرفية، أجهزة قراءة الباركود، طابعات الشيكات، وأدراج النقدية.",
    status: "نشط",
  },
  {
    id: "cat-printers",
    name: "طابعات الفواتير والإيصالات",
    code: "PRT-RCT",
    department: "إدارة تكنولوجيا المعلومات والنظم",
    slaResponseHours: 1,
    slaResolveHours: 3,
    defaultPriority: "متوسطة",
    activeTicketsCount: 4,
    description: "طابعات الإيصالات الحرارية (Epson/Bixolon) ورولات الطباعة وكابلات الاتصال USB/LAN.",
    status: "نشط",
  },
  {
    id: "cat-electric",
    name: "كهرباء وطاقة ولوحات التحكم",
    code: "PWR-ENG",
    department: "إدارة الصيانة والتشغيل الميداني",
    slaResponseHours: 1,
    slaResolveHours: 4,
    defaultPriority: "عالية",
    activeTicketsCount: 6,
    description: "لوحات القواطع، أجهزة مانع انقطاع التيار UPS، ومولدات الطوارئ للثلاجات والمعامل.",
    status: "نشط",
  },
  {
    id: "cat-cooling",
    name: "تبريد وتكييف ثلاجات العرض",
    code: "HVAC-REF",
    department: "إدارة الصيانة والتشغيل الميداني",
    slaResponseHours: 1,
    slaResolveHours: 3,
    defaultPriority: "حرجة",
    activeTicketsCount: 9,
    description: "ثلاجات حفظ الحلويات الشرقية والغربية، وحدات التكييف المركزي، وغرف التجميد.",
    status: "نشط",
  },
  {
    id: "cat-kitchen",
    name: "أفران ومعدات مطابخ التجهيز",
    code: "KIT-OVEN",
    department: "إدارة الصيانة والتشغيل الميداني",
    slaResponseHours: 2,
    slaResolveHours: 6,
    defaultPriority: "عالية",
    activeTicketsCount: 4,
    description: "أفران الخبز الدوارة، خلاطات العجين الضخمة، ماكينات صب الشوكولاتة، وقلايات الحلويات.",
    status: "نشط",
  },
];

const seedDepartments: DepartmentItem[] = [
  {
    id: "dept-it",
    name: "إدارة تكنولوجيا المعلومات والنظم",
    code: "IT-SYS",
    headName: "م. حافظ رحيم",
    headTitle: "رئيس قطاع التحول الرقمي وتكنولوجيا المعلومات",
    email: "info@odooteams.com",
    phone: "+201007419344",
    location: "المقر الرئيسي - الطابق الثالث (جناح النظم)",
    staffCount: 14,
    activeTicketsCount: 20,
    status: "نشط",
  },
  {
    id: "dept-maintenance",
    name: "إدارة الصيانة والتشغيل الميداني",
    code: "FLD-MNT",
    headName: "م. طارق الحسيني",
    headTitle: "مدير الصيانة العامة والتشغيل الميداني",
    email: "tarek@wazeer.demo",
    phone: "0100 234 8812",
    location: "مجمع الصيانة والورش المركزية - المعادي",
    staffCount: 22,
    activeTicketsCount: 22,
    status: "نشط",
  },
  {
    id: "dept-procurement",
    name: "إدارة المشتريات وسلاسل الإمداد",
    code: "PROC-SCM",
    headName: "أ. ياسر إبراهيم",
    headTitle: "مدير المشتريات والتعاقدات",
    email: "purchases@wazeer.demo",
    phone: "0109 881 7720",
    location: "المقر الرئيسي - الطابق الثاني",
    staffCount: 8,
    activeTicketsCount: 7,
    status: "نشط",
  },
  {
    id: "dept-hr",
    name: "إدارة الموارد البشرية وشؤون العاملين",
    code: "HR-OPS",
    headName: "أ. نادية إبراهيم",
    headTitle: "مدير عام الموارد البشرية والتدريب",
    email: "nadia.hr@wazeer.demo",
    phone: "0112 554 9911",
    location: "المقر الرئيسي - الطابق الأول",
    staffCount: 12,
    activeTicketsCount: 3,
    status: "نشط",
  },
  {
    id: "dept-quality",
    name: "إدارة الجودة والسلامة المهنية",
    code: "QA-SAFE",
    headName: "د. سمر العوضي",
    headTitle: "مدير مراقبة الجودة وسلامة الأغذية",
    email: "quality@wazeer.demo",
    phone: "0128 334 1190",
    location: "المصنع المركزي - معمل الفحص المخبري",
    staffCount: 9,
    activeTicketsCount: 4,
    status: "نشط",
  },
  {
    id: "dept-operations",
    name: "غرفة العمليات المركزية ودعم الفروع",
    code: "OPS-CTRL",
    headName: "كريم محمود",
    headTitle: "مشرف عام غرفة المتابعة ودعم الفروع",
    email: "operations@wazeer.demo",
    phone: "19876",
    location: "غرفة التحكم والعمليات - المقر الرئيسي",
    staffCount: 16,
    activeTicketsCount: 41,
    status: "نشط",
  },
  {
    id: "dept-finance",
    name: "إدارة الشؤون المالية والحسابات",
    code: "FIN-ACC",
    headName: "أ. هشام طلعت",
    headTitle: "المدير المالي التنفيذي",
    email: "finance@wazeer.demo",
    phone: "02 2415 6320",
    location: "المقر الرئيسي - الطابق الرابع",
    staffCount: 11,
    activeTicketsCount: 2,
    status: "نشط",
  },
];

const seedLocations: LocationItem[] = [
  {
    id: "loc-cairo-tagamoa",
    city: "القاهرة",
    district: "التجمع الخامس",
    zone: "قطاع شرق القاهرة والقاهرة الجديدة",
    branchesCount: 3,
    branchesList: ["فرع التجمع الخامس الرئيسي", "فرع مجمع البنوك التسعين", "فرع ميني بوتيك التجمع"],
    techniciansCount: 3,
    supervisorName: "أحمد سامي",
    coverageType: "تغطية 24/7",
    status: "نشط ومغطى",
  },
  {
    id: "loc-cairo-nasr-city",
    city: "القاهرة",
    district: "مدينة نصر",
    zone: "قطاع شرق القاهرة",
    branchesCount: 4,
    branchesList: ["فرع عباس العقاد", "فرع مكرم عبيد", "فرع الطيران", "فرع سيتي ستارز"],
    techniciansCount: 4,
    supervisorName: "محمود عادل",
    coverageType: "تغطية 24/7",
    status: "نشط ومغطى",
  },
  {
    id: "loc-cairo-maadi",
    city: "القاهرة",
    district: "المعادي",
    zone: "قطاع جنوب القاهرة",
    branchesCount: 3,
    branchesList: ["فرع شارع النصر المعادي", "فرع دجلة المعادي", "فرع كورنيش المعادي"],
    techniciansCount: 2,
    supervisorName: "سارة وليد",
    coverageType: "تغطية 24/7",
    status: "نشط ومغطى",
  },
  {
    id: "loc-cairo-heliopolis",
    city: "القاهرة",
    district: "مصر الجديدة (الكوربة)",
    zone: "قطاع شرق القاهرة",
    branchesCount: 3,
    branchesList: ["فرع الكوربة التراثي", "فرع روكسي", "فرع الميرغني"],
    techniciansCount: 2,
    supervisorName: "محمود عادل",
    coverageType: "وردية نهارية (08 ص - 11 م)",
    status: "نشط ومغطى",
  },
  {
    id: "loc-giza-sheikh-zayed",
    city: "الجيزة",
    district: "الشيخ زايد",
    zone: "قطاع غرب الجيزة وأكتوبر",
    branchesCount: 2,
    branchesList: ["فرع هايبر وان الشيخ زايد", "فرع كابيتال بيزنس بارك"],
    techniciansCount: 2,
    supervisorName: "م. طارق الحسيني",
    coverageType: "وردية نهارية (08 ص - 11 م)",
    status: "نشط ومغطى",
  },
  {
    id: "loc-giza-mohandessin",
    city: "الجيزة",
    district: "المهندسين والدقي",
    zone: "قطاع وسط الجيزة",
    branchesCount: 3,
    branchesList: ["فرع جامعة الدول العربية", "فرع مصدق الدقي", "فرع ميدان لبنان"],
    techniciansCount: 3,
    supervisorName: "سارة وليد",
    coverageType: "تغطية 24/7",
    status: "نشط ومغطى",
  },
  {
    id: "loc-giza-october",
    city: "الجيزة",
    district: "السادس من أكتوبر",
    zone: "قطاع غرب الجيزة وأكتوبر",
    branchesCount: 3,
    branchesList: ["فرع الحصري", "فرع مول العرب", "فرع المنطقة الصناعية والمصنع"],
    techniciansCount: 3,
    supervisorName: "م. طارق الحسيني",
    coverageType: "تغطية 24/7",
    status: "نشط ومغطى",
  },
  {
    id: "loc-alex-smouha",
    city: "الإسكندرية",
    district: "سموحة وسيدي جابر",
    zone: "قطاع الإسكندرية المركزي",
    branchesCount: 2,
    branchesList: ["فرع سموحة نادي النصر", "فرع كورنيش ستانلي"],
    techniciansCount: 2,
    supervisorName: "كريم محمود",
    coverageType: "وردية نهارية (08 ص - 11 م)",
    status: "نشط ومغطى",
  },
  {
    id: "loc-cairo-rehab-shorouk",
    city: "القاهرة",
    district: "الرحاب والشروق",
    zone: "قطاع المدن الجديدة",
    branchesCount: 2,
    branchesList: ["فرع السوق الشرقي بالرحاب", "فرع سيتي بلازا الشروق"],
    techniciansCount: 1,
    supervisorName: "أحمد سامي",
    coverageType: "وردية نهارية (08 ص - 11 م)",
    status: "نشط ومغطى",
  },
  {
    id: "loc-qalyubia-banha",
    city: "القليوبية",
    district: "بنها وشبرا الخيمة",
    zone: "قطاع الدلتا الجنوبي",
    branchesCount: 1,
    branchesList: ["فرع كورنيش النيل بنها"],
    techniciansCount: 1,
    supervisorName: "م. طارق الحسيني",
    coverageType: "تغطية طوارئ",
    status: "قيد التوسعة",
  },
];

const seedEmailTemplates: EmailTemplateItem[] = [
  {
    id: "tpl-ticket-created",
    name: "إشعار تسجيل بلاغ عطل جديد",
    code: "TICKET_NEW",
    triggerEvent: "عند فتح بلاغ جديد من الفرع عبر البوابة",
    recipientRole: "مدير الفرع ومسؤول الصيانة المناوب",
    subject: "[حلواني وزير الحلو] تأكيد تسجيل بلاغ جديد رقم {{ticket_id}} - {{branch_name}}",
    body: `عزيزنا مدير الفرع المحترم،

نود إحاطتكم بأنه تم بنجاح استلام وتسجيل بلاغ العطل التالي في منظومة الدعم الفني:
• رقم البلاغ: {{ticket_id}}
• عنوان العطل: {{ticket_title}}
• الفرع: {{branch_name}}
• القسم والتصنيف: {{category}}
• مستوى الأولوية: {{priority}}
• الحد الأقصى للاستجابة الميدانية (SLA): {{sla_time}}

فريق العمليات يعكف حالياً على توجيه الفني المختص، وسنوافيكم بتفاصيل التعيين فوراً.
لأي استفسار طارئ يمكنكم الرد على هذه الرسالة أو التواصل مع غرفة العمليات على 19876.

إدارة تكنولوجيا المعلومات والتشغيل الميداني
حلواني وزير الحلو (Wazeer Elhelw)`,
    variables: ["ticket_id", "ticket_title", "branch_name", "category", "priority", "sla_time", "created_date"],
    category: "بلاغات",
    status: "مفعل",
    lastUpdated: "2026-09-25",
  },
  {
    id: "tpl-tech-assigned",
    name: "إشعار إسناد البلاغ لفني الدعم الميداني",
    code: "TECH_DISPATCH",
    triggerEvent: "عند تعيين فني دعم ميداني على البلاغ",
    recipientRole: "الفني المكلف، مدير الفرع، ومشرف القطاع",
    subject: "[تكليف ميداني] إسناد البلاغ {{ticket_id}} إلى الفني {{technician_name}}",
    body: `تحية طيبة،

تم رسمياً إسناد البلاغ {{ticket_id}} إلى الفني: {{technician_name}}
• هاتف الفني: {{technician_phone}}
• عنوان الفرع والموقع: {{branch_address}}
• وصف المشكلة: {{description}}
• المهلة الزمنية للإنجاز: {{sla_deadline}}

يرجى من الفني التوجه المباشر للفرع والتنسيق مع مدير الفرع فور الوصول وإجراء فحص الأمان والسلامة.

إدارة العمليات المركزية
حلواني وزير الحلو`,
    variables: ["ticket_id", "technician_name", "technician_phone", "branch_name", "branch_address", "description", "sla_deadline"],
    category: "بلاغات",
    status: "مفعل",
    lastUpdated: "2026-09-24",
  },
  {
    id: "tpl-ticket-status",
    name: "إشعار تحديث حالة البلاغ وطلب قطع غيار",
    code: "TICKET_PROGRESS",
    triggerEvent: "عند تغيير حالة البلاغ (بانتظار شراء / قيد الصيانة)",
    recipientRole: "مدير الفرع وإدارة المشتريات",
    subject: "[تحديث حالة] البلاغ {{ticket_id}} في {{branch_name}} أصبحت حالته: {{status}}",
    body: `إحاطة إدارية عاجلة،

تم تحديث حالة البلاغ رقم {{ticket_id}} إلى: {{status}}
• ملاحظات الفني المشرف: {{notes}}
• القطع المطلوبة (إن وجدت): {{parts_required}}
• التقدير الزمني المتوقع لإنهاء الصيانة: {{estimated_completion}}

تتم متابعة التوريد مباشرة مع إدارة المشتريات وسلاسل الإمداد لضمان استمرارية تشغيل الفرع بأعلى كفاءة.

قسم المتابعة والدعم
حلواني وزير الحلو`,
    variables: ["ticket_id", "branch_name", "status", "notes", "parts_required", "estimated_completion"],
    category: "بلاغات",
    status: "مفعل",
    lastUpdated: "2026-09-25",
  },
  {
    id: "tpl-ticket-resolved",
    name: "إشعار إغلاق البلاغ واكتمال أعمال الصيانة",
    code: "TICKET_CLOSED",
    triggerEvent: "عند اكتمال الإصلاح واعتماد مدير العمليات",
    recipientRole: "مدير الفرع وإدارة الجودة",
    subject: "[تم الإنجاز بنجاح] اكتمال معالجة البلاغ {{ticket_id}} - فرع {{branch_name}}",
    body: `يسعدنا إعلامكم باكتمال صيانة ومعالجة البلاغ رقم {{ticket_id}} بنجاح:
• الفرع: {{branch_name}}
• الفني المنفذ: {{technician_name}}
• الإجراء المتخذ: {{resolution_summary}}
• وقت الاستجابة الفعلي: {{actual_resolution_time}}

يرجى من مدير الفرع الدخول على المنظومة لتأكيد استلام المعدة وتقييم جودة الخدمة المقدمة من 1 إلى 5 نجوم.

شكراً لتعاونكم معنا،
منظومة وزير الحلو للدعم الفني`,
    variables: ["ticket_id", "branch_name", "technician_name", "resolution_summary", "actual_resolution_time", "rating_link"],
    category: "بلاغات",
    status: "مفعل",
    lastUpdated: "2026-09-23",
  },
  {
    id: "tpl-sla-warning",
    name: "إنذار عاجل: اقتراب خرق اتفاقية مستوى الخدمة SLA",
    code: "SLA_BREACH_ALERT",
    triggerEvent: "عند تبقي أقل من 30 دقيقة على مهلة حل البلاغ الحرجة",
    recipientRole: "مشرف العمليات، الفني، ومدير النظام",
    subject: "🚨 [تنبيه SLA حرج] تبقي {{remaining_minutes}} دقيقة على خرق مهلة البلاغ {{ticket_id}}",
    body: `تنبيه عالي الأهمية،

يفيد النظام باقتراب انتهاء مهلة اتفاقية مستوى الخدمة (SLA) للبلاغ التالي:
• رقم البلاغ: {{ticket_id}}
• الأولوية: {{priority}}
• الفرع: {{branch_name}}
• الفني المسؤول: {{technician_name}}
• الوقت المتبقي: {{remaining_minutes}} دقيقة

يرجى من مشرف الصيانة التواصل الفوري مع الفني لتقديم الدعم أو إعادة تصعيد البلاغ للتدخل السريع.

نظام المراقبة والتحكم الآلي
حلواني وزير الحلو`,
    variables: ["ticket_id", "priority", "branch_name", "technician_name", "remaining_minutes", "sla_target"],
    category: "طوارئ وSLA",
    status: "مفعل",
    lastUpdated: "2026-09-25",
  },
  {
    id: "tpl-purchase-approved",
    name: "إشعار اعتماد طلب شراء قطع الغيار والمعدات",
    code: "PURCHASE_APPROVED",
    triggerEvent: "عند موافقة مسؤول المشتريات على طلب الشراء",
    recipientRole: "الفني طالب القطعة ومسؤول المخازن",
    subject: "✅ [اعتماد طلب شراء] تمت الموافقة على طلب الشراء رقم {{po_number}}",
    body: `السلام عليكم،

نحيطكم علماً بأنه تم اعتماد أمر الشراء رقم {{po_number}} من قبل إدارة المشتريات:
• البند / القطعة: {{item_name}}
• الكمية المعتمدة: {{quantity}}
• الفرع المستفيد: {{branch_name}}
• المورد المعتمد: {{vendor_name}}
• موعد التسليم المتوقع: {{delivery_date}}

يمكن لمسؤول الفرع أو الفني استلام الشحنة وتوقيع إيصال الاستلام بمجرد وصول المندوب.

إدارة المشتريات وسلاسل الإمداد
حلواني وزير الحلو`,
    variables: ["po_number", "item_name", "quantity", "branch_name", "vendor_name", "delivery_date"],
    category: "مشتريات",
    status: "مفعل",
    lastUpdated: "2026-09-24",
  },
  {
    id: "tpl-broadcast-announcement",
    name: "تعميم إداري رسمي للفروع وطاقم العمل",
    code: "ADMIN_ANNOUNCEMENT",
    triggerEvent: "عند إرسال تعميم رسمي من لوحة إدارة النظام",
    recipientRole: "جميع مديري الفروع والأطقم الفنية",
    subject: "📢 [تعميم إداري رسمي] {{announcement_title}} - إدارة حلواني وزير الحلو",
    body: `السادة الزملاء مديري الفروع وفرق الصيانة والتشغيل،

نود إبلاغكم بالتعميم الإداري الهام التالي:
عنوان التعميم: {{announcement_title}}
تاريخ السريان: {{effective_date}}

نص التعميم:
{{announcement_body}}

يرجى الالتزام التام بما ورد في هذا التوجيه والتأكد من إحاطة جميع العاملين بالفرع.

مع خالص التحية والتقدير،
الإدارة العامة - حلواني وزير الحلو`,
    variables: ["announcement_title", "effective_date", "announcement_body", "admin_name"],
    category: "تعاميم",
    status: "مفعل",
    lastUpdated: "2026-09-26",
  },
];

export function DirectoryPage() {
  const [activeTab, setActiveTab] = useState<DirectoryTab>("categories");
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // STATE MANAGEMENT WITH LOCALSTORAGE
  // ==========================================
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    if (typeof window === "undefined") return seedCategories;
    try {
      const raw = localStorage.getItem(DIR_CATEGORIES_KEY);
      return raw ? JSON.parse(raw) : seedCategories;
    } catch {
      return seedCategories;
    }
  });

  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    if (typeof window === "undefined") return seedDepartments;
    try {
      const raw = localStorage.getItem(DIR_DEPARTMENTS_KEY);
      return raw ? JSON.parse(raw) : seedDepartments;
    } catch {
      return seedDepartments;
    }
  });

  const [locations, setLocations] = useState<LocationItem[]>(() => {
    if (typeof window === "undefined") return seedLocations;
    try {
      const raw = localStorage.getItem(DIR_LOCATIONS_KEY);
      return raw ? JSON.parse(raw) : seedLocations;
    } catch {
      return seedLocations;
    }
  });

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateItem[]>(() => {
    if (typeof window === "undefined") return seedEmailTemplates;
    try {
      const raw = localStorage.getItem(DIR_EMAIL_TEMPLATES_KEY);
      if (!raw) return seedEmailTemplates;
      const sanitized = raw.includes("Wazeer Sweets")
        ? raw.replaceAll("Wazeer Sweets", "Wazeer Elhelw")
        : raw;
      if (sanitized !== raw) {
        localStorage.setItem(DIR_EMAIL_TEMPLATES_KEY, sanitized);
      }
      return JSON.parse(sanitized);
    } catch {
      return seedEmailTemplates;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(DIR_CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(DIR_DEPARTMENTS_KEY, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(DIR_LOCATIONS_KEY, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(DIR_EMAIL_TEMPLATES_KEY, JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  // Filters
  const [categoryDeptFilter, setCategoryDeptFilter] = useState("all");
  const [locationCityFilter, setLocationCityFilter] = useState("all");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("all");

  // Modal Dialog States
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateItem | null>(null);

  // Live Email Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateItem | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  // Delete Confirm Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "category" | "department" | "location" | "template";
    id: string;
    title: string;
  }>({ open: false, type: "category", id: "", title: "" });

  // Reset to Defaults Dialog
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // ==========================================
  // FILTERED DATA
  // ==========================================
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = categoryDeptFilter === "all" || c.department === categoryDeptFilter;
      return matchSearch && matchDept;
    });
  }, [categories, searchQuery, categoryDeptFilter]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [departments, searchQuery]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchSearch =
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.supervisorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = locationCityFilter === "all" || loc.city === locationCityFilter;
      return matchSearch && matchCity;
    });
  }, [locations, searchQuery, locationCityFilter]);

  const filteredTemplates = useMemo(() => {
    return emailTemplates.filter((tpl) => {
      const matchSearch =
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        templateCategoryFilter === "all" || tpl.category === templateCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [emailTemplates, searchQuery, templateCategoryFilter]);

  // Unique lists for dropdowns
  const uniqueCities = useMemo(() => {
    return Array.from(new Set(locations.map((l) => l.city)));
  }, [locations]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(departments.map((d) => d.name)));
  }, [departments]);

  // ==========================================
  // EXCEL EXPORTS
  // ==========================================
  const handleExportCategories = () => {
    const rows = filteredCategories.map((c) => ({
      كود_التصنيف: c.code,
      اسم_التصنيف: c.name,
      الإدارة_المسؤولة: c.department,
      مهلة_الاستجابة_ساعات: c.slaResponseHours,
      مهلة_الحل_ساعات: c.slaResolveHours,
      الأولوية_الافتراضية: c.defaultPriority,
      البلاغات_النشطة: c.activeTicketsCount,
      الحالة: c.status,
      الوصف: c.description,
    }));
    exportToExcel({
      rows,
      fileName: "دليل_تصنيفات_البلاغات_وزير_الحلو",
      sheetName: "التصنيفات",
    });
    toast.success("تم تصدير دليل التصنيفات إلى Excel بنجاح!");
  };

  const handleExportDepartments = () => {
    const rows = filteredDepartments.map((d) => ({
      كود_الإدارة: d.code,
      اسم_الإدارة: d.name,
      المدير_المسؤول: d.headName,
      المسمى_الوظيفي: d.headTitle,
      البريد_الإلكتروني: d.email,
      رقم_الهاتف: d.phone,
      الموقع_المكتبي: d.location,
      عدد_الكادر: d.staffCount,
      البلاغات_المرتبطة: d.activeTicketsCount,
      الحالة: d.status,
    }));
    exportToExcel({
      rows,
      fileName: "دليل_الإدارات_والأقسام_وزير_الحلو",
      sheetName: "الإدارات",
    });
    toast.success("تم تصدير دليل الإدارات إلى Excel بنجاح!");
  };

  const handleExportLocations = () => {
    const rows = filteredLocations.map((loc) => ({
      المدينة: loc.city,
      الحي_المنطقة: loc.district,
      القطاع_الجغرافي: loc.zone,
      عدد_الفروع: loc.branchesCount,
      الفروع_المغطاة: loc.branchesList.join(" ، "),
      عدد_الفنيين: loc.techniciansCount,
      المشرف_الميداني: loc.supervisorName,
      نظام_التغطية: loc.coverageType,
      حالة_التغطية: loc.status,
    }));
    exportToExcel({
      rows,
      fileName: "دليل_المواقع_والمدن_والأحياء_وزير_الحلو",
      sheetName: "المواقع الجغرافية",
    });
    toast.success("تم تصدير دليل المواقع والأحياء إلى Excel بنجاح!");
  };

  const handleExportEmailTemplates = () => {
    const rows = filteredTemplates.map((t) => ({
      كود_القالب: t.code,
      اسم_القالب: t.name,
      الحدث_المشغل: t.triggerEvent,
      المستلم_المستهدف: t.recipientRole,
      عنوان_الرسالة: t.subject,
      التصنيف: t.category,
      المتغيرات_المستخدمة: t.variables.join(" , "),
      تاريخ_آخر_تحديث: t.lastUpdated,
      الحالة: t.status,
    }));
    exportToExcel({
      rows,
      fileName: "دليل_قوالب_البريد_الإلكتروني_وزير_الحلو",
      sheetName: "قوالب البريد",
    });
    toast.success("تم تصدير قوالب البريد إلى Excel بنجاح!");
  };

  // ==========================================
  // CRUD HANDLERS
  // ==========================================
  const handleSaveCategory = (item: CategoryItem) => {
    if (editingCategory) {
      setCategories((prev) => prev.map((c) => (c.id === item.id ? item : c)));
      toast.success(`تم تحديث تصنيف "${item.name}" بنجاح`);
    } else {
      setCategories((prev) => [item, ...prev]);
      toast.success(`تمت إضافة التصنيف الجديد "${item.name}"`);
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveDepartment = (item: DepartmentItem) => {
    if (editingDepartment) {
      setDepartments((prev) => prev.map((d) => (d.id === item.id ? item : d)));
      toast.success(`تم تحديث إدارة "${item.name}" بنجاح`);
    } else {
      setDepartments((prev) => [item, ...prev]);
      toast.success(`تمت إضافة الإدارة الجديدة "${item.name}"`);
    }
    setDepartmentModalOpen(false);
    setEditingDepartment(null);
  };

  const handleSaveLocation = (item: LocationItem) => {
    if (editingLocation) {
      setLocations((prev) => prev.map((loc) => (loc.id === item.id ? item : loc)));
      toast.success(`تم تحديث موقع "${item.district} - ${item.city}" بنجاح`);
    } else {
      setLocations((prev) => [item, ...prev]);
      toast.success(`تمت إضافة الحي/المنطقة الجديدة "${item.district}"`);
    }
    setLocationModalOpen(false);
    setEditingLocation(null);
  };

  const handleSaveTemplate = (item: EmailTemplateItem) => {
    if (editingTemplate) {
      setEmailTemplates((prev) => prev.map((t) => (t.id === item.id ? item : t)));
      toast.success(`تم تحديث قالب البريد "${item.name}" بنجاح`);
    } else {
      setEmailTemplates((prev) => [item, ...prev]);
      toast.success(`تمت إضافة قالب البريد الجديد "${item.name}"`);
    }
    setTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  const handleConfirmDelete = () => {
    const { type, id, title } = deleteDialog;
    if (type === "category") {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else if (type === "department") {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } else if (type === "location") {
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } else if (type === "template") {
      setEmailTemplates((prev) => prev.filter((t) => t.id !== id));
    }
    toast.success(`تم حذف "${title}" بنجاح.`);
    setDeleteDialog({ open: false, type: "category", id: "", title: "" });
  };

  const handleResetToDefaults = () => {
    setCategories(seedCategories);
    setDepartments(seedDepartments);
    setLocations(seedLocations);
    setEmailTemplates(seedEmailTemplates);
    localStorage.setItem(DIR_CATEGORIES_KEY, JSON.stringify(seedCategories));
    localStorage.setItem(DIR_DEPARTMENTS_KEY, JSON.stringify(seedDepartments));
    localStorage.setItem(DIR_LOCATIONS_KEY, JSON.stringify(seedLocations));
    localStorage.setItem(DIR_EMAIL_TEMPLATES_KEY, JSON.stringify(seedEmailTemplates));
    setResetConfirmOpen(false);
    toast.success("تمت استعادة البيانات الافتراضية لكافة أقسام الدليل المرجعي بنجاح!");
  };

  // Render simulated email body with sample tags replaced
  const renderPreviewEmail = (tpl: EmailTemplateItem) => {
    const samples: Record<string, string> = {
      ticket_id: "HD-2026-000452",
      ticket_title: "كاميرا 08 لا تعرض صورة",
      branch_name: "فرع التجمع الخامس الرئيسي",
      branch_address: "شارع التسعين، مجمع البنوك، القاهرة الجديدة",
      category: "كاميرات مراقبة وأنظمة أمنية",
      priority: "عالية جداً (High)",
      technician_name: "أحمد سامي",
      technician_phone: "0100 234 8812",
      sla_time: "ساعة واحدة للاستجابة الميدانية",
      sla_deadline: "خلال 03:00 ساعات عمل",
      created_date: "2026-09-26 10:30 ص",
      status: "قيد الصيانة الميدانية",
      notes: "تم فحص محول الطاقة وجارٍ استبدال كابل الشبكة PoE",
      parts_required: "كابل Cat6 بطول 15م + وصلات BNC مائية",
      estimated_completion: "اليوم الساعة 02:00 ظهراً",
      resolution_summary: "تم تبديل الكابل وإعادة ضبط البث بجودة 4K",
      actual_resolution_time: "01:45 ساعة",
      rating_link: "https://wazeer.demo/survey/452",
      remaining_minutes: "24",
      sla_target: "04:00 ساعات",
      po_number: "PO-2026-0891",
      item_name: "كاميرا مراقبة خارجية 8MP Dahua Bullet",
      quantity: "2 قطع",
      vendor_name: "شركة النظم الأمنية والشبكات",
      delivery_date: "غداً صباحاً 10:00 ص",
      announcement_title: "خطة الصيانة الوقائية السنوية لثلاجات ومبردات الفروع",
      effective_date: "من 01 أكتوبر 2026",
      announcement_body:
        "يرجى من جميع الفروع تسهيل دخول فرق الصيانة المركزية خلال وردية الفجر لإجراء فحص دوري وضغط غاز الفريون.",
      admin_name: "م. حافظ رحيم (مدير العمليات والنظم)",
    };

    let text = tpl.body;
    for (const [key, val] of Object.entries(samples)) {
      text = text.replaceAll(`{{${key}}}`, val);
    }
    let subject = tpl.subject;
    for (const [key, val] of Object.entries(samples)) {
      subject = subject.replaceAll(`{{${key}}}`, val);
    }

    return { subject, body: text };
  };

  return (
    <AppShell
      title="دليل النظام المرجعي | الإدارات، التصنيفات، المواقع، وقوالب البريد"
      role="admin"
      allowedRoles={["admin", "hr"]}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-ink dark:text-brand-gold">
                  <FolderTree className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    دليل النظام المرجعي الموحد
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    البيانات الأساسية لمنظومة وزير الحلو: التصنيفات، الإدارات، التوزيع الجغرافي للمدن والأحياء، وقوالب الإشعارات البريدية
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
                title="استعادة البيانات التجريبية الافتراضية"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">استعادة الافتراضي</span>
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-border/70">
            <div
              onClick={() => setActiveTab("categories")}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all",
                activeTab === "categories"
                  ? "bg-brand-gold/10 border border-brand-gold/40 shadow-xs"
                  : "bg-surface/50 hover:bg-surface border border-transparent",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">التصنيفات</span>
                <Tag className="h-4 w-4 text-brand-gold" />
              </div>
              <p className="mt-1 text-xl font-black text-foreground font-mono">
                {categories.length}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {categories.filter((c) => c.status === "نشط").length} تصنيف نشط
              </p>
            </div>

            <div
              onClick={() => setActiveTab("departments")}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all",
                activeTab === "departments"
                  ? "bg-brand-gold/10 border border-brand-gold/40 shadow-xs"
                  : "bg-surface/50 hover:bg-surface border border-transparent",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">الإدارات والأقسام</span>
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-1 text-xl font-black text-foreground font-mono">
                {departments.length}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {departments.reduce((acc, d) => acc + d.staffCount, 0)} موظف ومسؤول
              </p>
            </div>

            <div
              onClick={() => setActiveTab("locations")}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all",
                activeTab === "locations"
                  ? "bg-brand-gold/10 border border-brand-gold/40 shadow-xs"
                  : "bg-surface/50 hover:bg-surface border border-transparent",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">المواقع الجغرافية</span>
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-1 text-xl font-black text-foreground font-mono">
                {locations.length}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {uniqueCities.length} مدن مغطاة بالكامل
              </p>
            </div>

            <div
              onClick={() => setActiveTab("email-templates")}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all",
                activeTab === "email-templates"
                  ? "bg-brand-gold/10 border border-brand-gold/40 shadow-xs"
                  : "bg-surface/50 hover:bg-surface border border-transparent",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">قوالب البريد</span>
                <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="mt-1 text-xl font-black text-foreground font-mono">
                {emailTemplates.length}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {emailTemplates.filter((t) => t.status === "مفعل").length} قالب آلي مفعّل
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
          {/* Main 4 Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface/70 border border-border max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab("categories");
                setSearchQuery("");
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shrink-0",
                activeTab === "categories"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface",
              )}
            >
              <Tag className="h-3.5 w-3.5 text-brand-gold" />
              <span>التصنيفات والخدمات</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                {categories.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("departments");
                setSearchQuery("");
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shrink-0",
                activeTab === "departments"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface",
              )}
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>الإدارات والأقسام</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                {departments.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("locations");
                setSearchQuery("");
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shrink-0",
                activeTab === "locations"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface",
              )}
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>المواقع (المدن والأحياء)</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                {locations.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("email-templates");
                setSearchQuery("");
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shrink-0",
                activeTab === "email-templates"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface",
              )}
            >
              <Mail className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>قوالب البريد الإلكتروني</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                {emailTemplates.length}
              </Badge>
            </button>
          </div>

          {/* Action buttons based on active tab */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === "categories" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCategories}
                  className="h-9 gap-1.5 text-xs font-bold"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-brand-gold" />
                  <span>تصدير Excel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryModalOpen(true);
                  }}
                  className="h-9 gap-1.5 text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة تصنيف</span>
                </Button>
              </>
            )}

            {activeTab === "departments" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportDepartments}
                  className="h-9 gap-1.5 text-xs font-bold"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-brand-gold" />
                  <span>تصدير Excel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDepartment(null);
                    setDepartmentModalOpen(true);
                  }}
                  className="h-9 gap-1.5 text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة إدارة</span>
                </Button>
              </>
            )}

            {activeTab === "locations" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportLocations}
                  className="h-9 gap-1.5 text-xs font-bold"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-brand-gold" />
                  <span>تصدير Excel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingLocation(null);
                    setLocationModalOpen(true);
                  }}
                  className="h-9 gap-1.5 text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة حي/مدينة</span>
                </Button>
              </>
            )}

            {activeTab === "email-templates" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportEmailTemplates}
                  className="h-9 gap-1.5 text-xs font-bold"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-brand-gold" />
                  <span>تصدير Excel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateModalOpen(true);
                  }}
                  className="h-9 gap-1.5 text-xs font-bold bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة قالب</span>
                </Button>
              </>
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
                activeTab === "categories"
                  ? "بحث في التصنيفات والأكواد والوصف..."
                  : activeTab === "departments"
                    ? "بحث في الإدارات والمديرين والبريد..."
                    : activeTab === "locations"
                      ? "بحث في المدن والأحياء والمناطق..."
                      : "بحث في قوالب البريد، الأحداث والعناوين..."
              }
              className="h-9 pr-9 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "categories" && (
              <Select value={categoryDeptFilter} onValueChange={setCategoryDeptFilter}>
                <SelectTrigger className="h-9 w-52 text-xs bg-background">
                  <SelectValue placeholder="تصفية حسب الإدارة" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع الإدارات</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {activeTab === "locations" && (
              <Select value={locationCityFilter} onValueChange={setLocationCityFilter}>
                <SelectTrigger className="h-9 w-44 text-xs bg-background">
                  <SelectValue placeholder="تصفية حسب المدينة" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {activeTab === "email-templates" && (
              <Select value={templateCategoryFilter} onValueChange={setTemplateCategoryFilter}>
                <SelectTrigger className="h-9 w-44 text-xs bg-background">
                  <SelectValue placeholder="نوع القالب" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="بلاغات">بلاغات</SelectItem>
                  <SelectItem value="مشتريات">مشتريات</SelectItem>
                  <SelectItem value="طوارئ وSLA">طوارئ وSLA</SelectItem>
                  <SelectItem value="تعاميم">تعاميم</SelectItem>
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

        {/* ==========================================
            TAB 1: CATEGORIES
           ========================================== */}
        {activeTab === "categories" && (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface/60">
                  <TableRow>
                    <TableHead className="text-right text-xs font-bold text-foreground">
                      كود التصنيف
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">
                      اسم التصنيف
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">
                      الإدارة المسؤولة
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">
                      مهلة الاستجابة
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">
                      مهلة الحل
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">
                      الأولوية الافتراضية
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">
                      البلاغات النشطة
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold text-foreground">
                      الحالة
                    </TableHead>
                    <TableHead className="text-left text-xs font-bold text-foreground">
                      إجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-36 text-center text-xs text-muted-foreground">
                        لا توجد تصنيفات مطابقة للبحث أو التصفية الحالية.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((cat) => (
                      <TableRow key={cat.id} className="hover:bg-surface/40 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-brand-gold">
                          {cat.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-xs text-foreground">{cat.name}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {cat.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {cat.department}
                        </TableCell>
                        <TableCell className="text-xs font-semibold font-mono">
                          {cat.slaResponseHours} س
                        </TableCell>
                        <TableCell className="text-xs font-semibold font-mono">
                          {cat.slaResolveHours} س
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              cat.defaultPriority === "حرجة"
                                ? "destructive"
                                : cat.defaultPriority === "عالية"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={cn(
                              "text-[10px] font-bold py-0.5",
                              cat.defaultPriority === "حرجة" && "bg-red-600 text-white",
                              cat.defaultPriority === "عالية" && "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/40",
                            )}
                          >
                            {cat.defaultPriority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {cat.activeTicketsCount} بلاغ
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                              cat.status === "نشط"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                cat.status === "نشط" ? "bg-emerald-500" : "bg-muted-foreground",
                              )}
                            />
                            {cat.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingCategory(cat);
                                setCategoryModalOpen(true);
                              }}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="تعديل التصنيف"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  type: "category",
                                  id: cat.id,
                                  title: cat.name,
                                })
                              }
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              title="حذف التصنيف"
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

        {/* ==========================================
            TAB 2: DEPARTMENTS
           ========================================== */}
        {activeTab === "departments" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:border-brand-gold/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-foreground">{dept.name}</h3>
                        <span className="font-mono text-[10px] font-bold text-brand-gold">
                          {dept.code}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={dept.status === "نشط" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {dept.status}
                    </Badge>
                  </div>

                  <div className="mt-3.5 space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">المدير المسؤول:</span>
                      <p className="font-bold text-foreground">{dept.headName}</p>
                      <p className="text-[11px] text-muted-foreground">{dept.headTitle}</p>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-border/50 text-[11px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3 w-3 text-brand-gold shrink-0" />
                        <span className="font-mono truncate">{dept.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="font-mono">{dept.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3 w-3 text-purple-600 shrink-0" />
                        <span className="truncate">{dept.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {dept.staffCount} كادر
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {dept.activeTicketsCount} بلاغ نشط
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingDepartment(dept);
                        setDepartmentModalOpen(true);
                      }}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="تعديل الإدارة"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          type: "department",
                          id: dept.id,
                          title: dept.name,
                        })
                      }
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      title="حذف الإدارة"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==========================================
            TAB 3: LOCATIONS (CITIES & DISTRICTS)
           ========================================== */}
        {activeTab === "locations" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-surface/60">
                    <TableRow>
                      <TableHead className="text-right text-xs font-bold text-foreground">
                        المدينة
                      </TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">
                        الحي / المنطقة
                      </TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">
                        القطاع الجغرافي
                      </TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">
                        الفروع المغطاة
                      </TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">
                        الفنيون والمشرف
                      </TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">
                        نظام التغطية
                      </TableHead>
                      <TableHead className="text-right text-xs font-bold text-foreground">
                        الحالة
                      </TableHead>
                      <TableHead className="text-left text-xs font-bold text-foreground">
                        إجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                          لا توجد مواقع أو أحياء مطابقة لمعايير البحث.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLocations.map((loc) => (
                        <TableRow key={loc.id} className="hover:bg-surface/40 transition-colors">
                          <TableCell className="font-bold text-xs text-foreground">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                              {loc.city}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-xs text-brand-ink">
                            {loc.district}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {loc.zone}
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="outline" className="font-mono text-[10px]">
                                {loc.branchesCount} فروع
                              </Badge>
                              <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1 max-w-[200px]">
                                {loc.branchesList.join("، ")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {loc.supervisorName} (مشرف)
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {loc.techniciansCount} فنيين ميدانيين
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] py-0.5",
                                loc.coverageType === "تغطية 24/7"
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                                  : "border-blue-500/40 bg-blue-500/10 text-blue-800 dark:text-blue-200",
                              )}
                            >
                              {loc.coverageType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                loc.status === "نشط ومغطى"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  loc.status === "نشط ومغطى" ? "bg-emerald-500" : "bg-amber-500",
                                )}
                              />
                              {loc.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingLocation(loc);
                                  setLocationModalOpen(true);
                                }}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="تعديل الموقع"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "location",
                                    id: loc.id,
                                    title: `${loc.district} - ${loc.city}`,
                                  })
                                }
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                title="حذف الموقع"
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
          </div>
        )}

        {/* ==========================================
            TAB 4: EMAIL TEMPLATES
           ========================================== */}
        {activeTab === "email-templates" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:border-brand-gold/40 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xs sm:text-sm text-foreground">{tpl.name}</h3>
                          <Badge
                            variant={
                              tpl.category === "طوارئ وSLA"
                                ? "destructive"
                                : tpl.category === "مشتريات"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-[10px] py-0"
                          >
                            {tpl.category}
                          </Badge>
                        </div>
                        <p className="mt-1 font-mono text-[10px] font-bold text-brand-gold">
                          {tpl.code}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          tpl.status === "مفعل"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {tpl.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          الحدث المشغل:
                        </span>
                        <p className="text-foreground text-xs mt-0.5">{tpl.triggerEvent}</p>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          عنوان البريد (Subject):
                        </span>
                        <p className="mt-0.5 rounded bg-surface/60 p-2 font-mono text-[11px] text-foreground border border-border/50 break-all">
                          {tpl.subject}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted-foreground font-semibold block mb-1">
                          المتغيرات الديناميكية المتوفرة:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {tpl.variables.map((v) => (
                            <span
                              key={v}
                              className="rounded bg-surface-strong px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                            >
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-[10px] text-muted-foreground">
                      آخر تحديث: {tpl.lastUpdated}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPreviewTemplate(tpl);
                          setPreviewModalOpen(true);
                        }}
                        className="h-7 text-xs font-bold gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-brand-gold" />
                        <span>معاينة حية</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingTemplate(tpl);
                          setTemplateModalOpen(true);
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="تعديل القالب"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            type: "template",
                            id: tpl.id,
                            title: tpl.name,
                          })
                        }
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        title="حذف القالب"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS / DIALOGS
         ========================================================================= */}

      {/* 1. Category Modal (Add / Edit) */}
      <CategoryDialog
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        initialData={editingCategory}
        departmentsList={uniqueDepartments}
        onSave={handleSaveCategory}
      />

      {/* 2. Department Modal (Add / Edit) */}
      <DepartmentDialog
        open={departmentModalOpen}
        onOpenChange={setDepartmentModalOpen}
        initialData={editingDepartment}
        onSave={handleSaveDepartment}
      />

      {/* 3. Location Modal (Add / Edit) */}
      <LocationDialog
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        initialData={editingLocation}
        citiesList={uniqueCities}
        onSave={handleSaveLocation}
      />

      {/* 4. Template Modal (Add / Edit) */}
      <TemplateDialog
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        initialData={editingTemplate}
        onSave={handleSaveTemplate}
      />

      {/* 5. Live Email Preview Modal */}
      {previewTemplate && (
        <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Mail className="h-4 w-4 text-brand-gold" />
                <span>معاينة حية لقالب البريد الإلكتروني</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                عرض تجريبي لرسالة البريد كما تظهر في صندوق الوارد لدى المستلم، مع استبدال المتغيرات بالبيانات التشغيلية الواقعية.
              </DialogDescription>
            </DialogHeader>

            {(() => {
              const preview = renderPreviewEmail(previewTemplate);
              return (
                <div className="space-y-4 text-xs mt-2">
                  {/* Subject line header */}
                  <div className="rounded-lg border border-border bg-surface/50 p-3 space-y-1">
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      المستلم المستهدف:{" "}
                      <span className="text-foreground">{previewTemplate.recipientRole}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      عنوان الرسالة:{" "}
                      <span className="font-bold text-foreground font-sans">{preview.subject}</span>
                    </p>
                  </div>

                  {/* Rendered Email Card Container */}
                  <div className="rounded-xl border border-brand-gold/30 bg-card p-5 shadow-md space-y-4">
                    {/* Email Header */}
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/wazeer-emblem.png"
                          alt="وزير الحلو"
                          className="h-10 w-auto object-contain"
                        />
                        <div>
                          <p className="font-bold text-sm text-foreground">حلواني وزير الحلو</p>
                          <p className="text-[10px] text-muted-foreground">
                            منظومة الدعم الفني والصيانة الميدانية
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {previewTemplate.code}
                      </Badge>
                    </div>

                    {/* Email Body */}
                    <div className="whitespace-pre-line text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans bg-surface/30 p-4 rounded-lg border border-border/50">
                      {preview.body}
                    </div>

                    {/* Email Footer */}
                    <div className="border-t border-border pt-3 text-center text-[10px] text-muted-foreground space-y-1">
                      <p>هذا البريد تم إرساله تلقائياً من خادم إدارة البلاغات المركزي - حلواني وزير الحلو.</p>
                      <p className="font-mono">
                        الهاتف المركزي: 19876 · البريد المعتمد: info@odooteams.com · القاهرة، مصر
                      </p>
                    </div>
                  </div>

                  {/* Copy variables quick tool */}
                  <div className="rounded-lg border border-border bg-surface/40 p-3">
                    <p className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Copy className="h-3.5 w-3.5 text-brand-gold" />
                      انقر على أي متغير لنسخه سريعاً:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {previewTemplate.variables.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`{{${v}}}`);
                            setCopiedVariable(v);
                            toast.success(`تم نسخ {{${v}}}`);
                            setTimeout(() => setCopiedVariable(null), 2000);
                          }}
                          className={cn(
                            "rounded px-2 py-0.5 text-[11px] font-mono font-bold transition-colors border",
                            copiedVariable === v
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : "bg-card hover:bg-surface text-muted-foreground hover:text-foreground border-border",
                          )}
                        >
                          {copiedVariable === v ? "✓ تم النسخ" : `{{${v}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <DialogFooter className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewModalOpen(false)}
                className="text-xs"
              >
                إغلاق المعاينة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
              <Trash2 className="h-5 w-5" />
              <span>تأكيد الحذف من الدليل</span>
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              هل أنت متأكد من رغبتك في حذف <strong>"{deleteDialog.title}"</strong> نهائياً؟ لن تتمكن من التراجع عن هذه الخطوة إلا باستعادة البيانات الافتراضية.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="text-xs font-bold"
            >
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Defaults Confirmation Dialog */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-5 w-5" />
              <span>استعادة البيانات الافتراضية للدليل</span>
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              سيتم إعادة تعيين كافة التصنيفات، الإدارات، المواقع الجغرافية، وقوالب البريد الإلكتروني إلى بيانات المصنع الافتراضية وحفظها في التخزين المحلي.
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
// SUB-DIALOG COMPONENTS (Category, Department, Location, Template)
// =========================================================================

function CategoryDialog({
  open,
  onOpenChange,
  initialData,
  departmentsList,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: CategoryItem | null;
  departmentsList: string[];
  onSave: (item: CategoryItem) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState("");
  const [slaResponseHours, setSlaResponseHours] = useState(1);
  const [slaResolveHours, setSlaResolveHours] = useState(4);
  const [defaultPriority, setDefaultPriority] = useState<"منخفضة" | "متوسطة" | "عالية" | "حرجة">("متوسطة");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"نشط" | "معطل">("نشط");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setDepartment(initialData.department);
      setSlaResponseHours(initialData.slaResponseHours);
      setSlaResolveHours(initialData.slaResolveHours);
      setDefaultPriority(initialData.defaultPriority);
      setDescription(initialData.description);
      setStatus(initialData.status);
    } else {
      setName("");
      setCode("");
      setDepartment(departmentsList[0] || "إدارة تكنولوجيا المعلومات والنظم");
      setSlaResponseHours(1);
      setSlaResolveHours(4);
      setDefaultPriority("متوسطة");
      setDescription("");
      setStatus("نشط");
    }
  }, [initialData, open, departmentsList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("يرجى ملء اسم وكود التصنيف");
      return;
    }
    const item: CategoryItem = {
      id: initialData ? initialData.id : `cat-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      department,
      slaResponseHours: Number(slaResponseHours) || 1,
      slaResolveHours: Number(slaResolveHours) || 4,
      defaultPriority,
      activeTicketsCount: initialData ? initialData.activeTicketsCount : 0,
      description: description.trim(),
      status,
    };
    onSave(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {initialData ? "تعديل تصنيف خدمة / عطل" : "إضافة تصنيف جديد للبلاغات"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            تحديد اسم التصنيف وكوده الإداري، الإدارة التابع لها ومستويات الخدمة SLA الافتراضية.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">اسم التصنيف *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أجهزة التكييف المركزي"
                className="h-8.5 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">كود التصنيف *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: HVAC-01"
                className="h-8.5 text-xs font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">الإدارة المسؤولة</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue placeholder="اختر الإدارة" />
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

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">مهلة الاستجابة (ساعات)</Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={slaResponseHours}
                onChange={(e) => setSlaResponseHours(Number(e.target.value))}
                className="h-8.5 text-xs font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">مهلة الحل (ساعات)</Label>
              <Input
                type="number"
                step="0.5"
                min="1"
                value={slaResolveHours}
                onChange={(e) => setSlaResolveHours(Number(e.target.value))}
                className="h-8.5 text-xs font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">الأولوية الافتراضية</Label>
              <Select
                value={defaultPriority}
                onValueChange={(v: "منخفضة" | "متوسطة" | "عالية" | "حرجة") => setDefaultPriority(v)}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="عالية">عالية</SelectItem>
                  <SelectItem value="حرجة">حرجة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">الوصف ونطاق الأعطال</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً مختصراً للأجهزة أو المشاكل المندرجة تحت هذا التصنيف..."
              className="resize-none text-xs min-h-[60px]"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <Label className="text-xs font-semibold">حالة التصنيف</Label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                {status === "نشط" ? "مفعل ويظهر بنموذج البلاغات" : "معطل ومخفي"}
              </span>
              <Switch
                checked={status === "نشط"}
                onCheckedChange={(c) => setStatus(c ? "نشط" : "معطل")}
              />
            </div>
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
              حفظ التصنيف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: DepartmentItem | null;
  onSave: (item: DepartmentItem) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [headName, setHeadName] = useState("");
  const [headTitle, setHeadTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [staffCount, setStaffCount] = useState(1);
  const [status, setStatus] = useState<"نشط" | "معطل">("نشط");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setHeadName(initialData.headName);
      setHeadTitle(initialData.headTitle);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setLocation(initialData.location);
      setStaffCount(initialData.staffCount);
      setStatus(initialData.status);
    } else {
      setName("");
      setCode("");
      setHeadName("");
      setHeadTitle("");
      setEmail("");
      setPhone("");
      setLocation("المقر الرئيسي - القاهرة");
      setStaffCount(5);
      setStatus("نشط");
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !headName.trim()) {
      toast.error("يرجى ملء اسم الإدارة والكود واسم المدير المسؤول");
      return;
    }
    const item: DepartmentItem = {
      id: initialData ? initialData.id : `dept-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      headName: headName.trim(),
      headTitle: headTitle.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      staffCount: Number(staffCount) || 1,
      activeTicketsCount: initialData ? initialData.activeTicketsCount : 0,
      status,
    };
    onSave(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {initialData ? "تعديل بيانات الإدارة" : "إضافة إدارة أو قسم جديد"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            إدخال المسمى الرسمي للإدارة، كود الربط، المدير المسؤول وبيانات التواصل الرسمية.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">اسم الإدارة / القسم *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: إدارة الخدمات اللوجستية"
                className="h-8.5 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">كود الإدارة *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: LOG-OPS"
                className="h-8.5 text-xs font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">المدير المسؤول *</Label>
              <Input
                value={headName}
                onChange={(e) => setHeadName(e.target.value)}
                placeholder="اسم المدير المسؤول"
                className="h-8.5 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">المسمى الوظيفي</Label>
              <Input
                value={headTitle}
                onChange={(e) => setHeadTitle(e.target.value)}
                placeholder="مدير عام اللوجستيات"
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">البريد الإلكتروني الرسمي</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dept@wazeer.demo"
                className="h-8.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">رقم الهاتف / التحويلة</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0100 000 0000"
                className="h-8.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">الموقع والمكتب</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="المقر الرئيسي - الطابق الثاني"
                className="h-8.5 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">عدد موظفي الإدارة</Label>
              <Input
                type="number"
                min="1"
                value={staffCount}
                onChange={(e) => setStaffCount(Number(e.target.value))}
                className="h-8.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <Label className="text-xs font-semibold">حالة الإدارة</Label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                {status === "نشط" ? "إدارة نشطة في النظام" : "معطلة"}
              </span>
              <Switch
                checked={status === "نشط"}
                onCheckedChange={(c) => setStatus(c ? "نشط" : "معطل")}
              />
            </div>
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
              حفظ الإدارة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LocationDialog({
  open,
  onOpenChange,
  initialData,
  citiesList,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: LocationItem | null;
  citiesList: string[];
  onSave: (item: LocationItem) => void;
}) {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [zone, setZone] = useState("");
  const [branchesCount, setBranchesCount] = useState(1);
  const [branchesListStr, setBranchesListStr] = useState("");
  const [techniciansCount, setTechniciansCount] = useState(2);
  const [supervisorName, setSupervisorName] = useState("");
  const [coverageType, setCoverageType] = useState<"تغطية 24/7" | "وردية نهارية (08 ص - 11 م)" | "تغطية طوارئ">("تغطية 24/7");
  const [status, setStatus] = useState<"نشط ومغطى" | "قيد التوسعة">("نشط ومغطى");

  useEffect(() => {
    if (initialData) {
      setCity(initialData.city);
      setDistrict(initialData.district);
      setZone(initialData.zone);
      setBranchesCount(initialData.branchesCount);
      setBranchesListStr(initialData.branchesList.join("، "));
      setTechniciansCount(initialData.techniciansCount);
      setSupervisorName(initialData.supervisorName);
      setCoverageType(initialData.coverageType);
      setStatus(initialData.status);
    } else {
      setCity(citiesList[0] || "القاهرة");
      setDistrict("");
      setZone("");
      setBranchesCount(1);
      setBranchesListStr("");
      setTechniciansCount(2);
      setSupervisorName("");
      setCoverageType("تغطية 24/7");
      setStatus("نشط ومغطى");
    }
  }, [initialData, open, citiesList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !district.trim()) {
      toast.error("يرجى ملء اسم المدينة والحي");
      return;
    }
    const bList = branchesListStr
      .split(/[,،\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const item: LocationItem = {
      id: initialData ? initialData.id : `loc-${Date.now()}`,
      city: city.trim(),
      district: district.trim(),
      zone: zone.trim() || `قطاع ${city.trim()}`,
      branchesCount: bList.length > 0 ? bList.length : Number(branchesCount) || 1,
      branchesList: bList.length > 0 ? bList : [`فرع ${district.trim()}`],
      techniciansCount: Number(techniciansCount) || 1,
      supervisorName: supervisorName.trim() || "مشرف العمليات الميدانية",
      coverageType,
      status,
    };
    onSave(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {initialData ? "تعديل بيانات الحي / المنطقة" : "إضافة حي ومنطقة جغرافية جديدة"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            إدراج النطاق الجغرافي للمدن والأحياء، تحديد الفروع الواقعة ضمنه ونظام التغطية الميدانية.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">المدينة *</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: القاهرة، الجيزة، الإسكندرية"
                className="h-8.5 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">الحي / المنطقة *</Label>
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="مثال: التجمع الخامس، الدقي"
                className="h-8.5 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">القطاع الجغرافي الميداني</Label>
            <Input
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="مثال: قطاع شرق القاهرة والقاهرة الجديدة"
              className="h-8.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">أسماء الفروع التابعة (افصل بفواصل)</Label>
            <Input
              value={branchesListStr}
              onChange={(e) => setBranchesListStr(e.target.value)}
              placeholder="فرع شارع التسعين، فرع مجمع البنوك، فرع النرجس"
              className="h-8.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">المشرف الميداني المسؤول</Label>
              <Input
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                placeholder="اسم المشرف"
                className="h-8.5 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">عدد الفنيين المخصصين</Label>
              <Input
                type="number"
                min="1"
                value={techniciansCount}
                onChange={(e) => setTechniciansCount(Number(e.target.value))}
                className="h-8.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">نظام التغطية</Label>
              <Select
                value={coverageType}
                onValueChange={(v: "تغطية 24/7" | "وردية نهارية (08 ص - 11 م)" | "تغطية طوارئ") =>
                  setCoverageType(v)
                }
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="تغطية 24/7">تغطية 24/7</SelectItem>
                  <SelectItem value="وردية نهارية (08 ص - 11 م)">وردية نهارية (08 ص - 11 م)</SelectItem>
                  <SelectItem value="تغطية طوارئ">تغطية طوارئ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">حالة المنطقة</Label>
              <Select
                value={status}
                onValueChange={(v: "نشط ومغطى" | "قيد التوسعة") => setStatus(v)}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نشط ومغطى">نشط ومغطى</SelectItem>
                  <SelectItem value="قيد التوسعة">قيد التوسعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              حفظ الموقع
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TemplateDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: EmailTemplateItem | null;
  onSave: (item: EmailTemplateItem) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"بلاغات" | "مشتريات" | "طوارئ وSLA" | "تعاميم">("بلاغات");
  const [variablesStr, setVariablesStr] = useState("");
  const [status, setStatus] = useState<"مفعل" | "معطل">("مفعل");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setTriggerEvent(initialData.triggerEvent);
      setRecipientRole(initialData.recipientRole);
      setSubject(initialData.subject);
      setBody(initialData.body);
      setCategory(initialData.category);
      setVariablesStr(initialData.variables.join(", "));
      setStatus(initialData.status);
    } else {
      setName("");
      setCode("");
      setTriggerEvent("");
      setRecipientRole("مدير الفرع ومسؤول الصيانة");
      setSubject("[حلواني وزير الحلو] ");
      setBody("عزيزنا مدير الفرع المحترم،\n\nنحيطكم علماً بأنه...");
      setCategory("بلاغات");
      setVariablesStr("ticket_id, branch_name, status");
      setStatus("مفعل");
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !subject.trim() || !body.trim()) {
      toast.error("يرجى إكمال بيانات القالب الأساسية (الاسم، الكود، العنوان، والنص)");
      return;
    }
    const vars = variablesStr
      .split(/[,،]/)
      .map((s) => s.replace(/[{}]/g, "").trim())
      .filter(Boolean);

    const item: EmailTemplateItem = {
      id: initialData ? initialData.id : `tpl-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      triggerEvent: triggerEvent.trim() || "عند تشغيل الإجراء آلياً",
      recipientRole: recipientRole.trim(),
      subject: subject.trim(),
      body: body.trim(),
      variables: vars.length > 0 ? vars : ["ticket_id", "branch_name"],
      category,
      status,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    onSave(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {initialData ? "تعديل قالب البريد الإلكتروني" : "إنشاء قالب بريد تشغيلي جديد"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            تخصيص عنوان ونص البريد الإلكتروني التلقائي والمتغيرات المدمجة مثل <code>{"{{ticket_id}}"}</code>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">اسم القالب *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: إشعار استلام قطع الغيار"
                className="h-8.5 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">كود القالب الفريد *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: SPARE_DELIVERY"
                className="h-8.5 text-xs font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">تصنيف القالب</Label>
              <Select
                value={category}
                onValueChange={(v: "بلاغات" | "مشتريات" | "طوارئ وSLA" | "تعاميم") => setCategory(v)}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="بلاغات">بلاغات</SelectItem>
                  <SelectItem value="مشتريات">مشتريات</SelectItem>
                  <SelectItem value="طوارئ وSLA">طوارئ وSLA</SelectItem>
                  <SelectItem value="تعاميم">تعاميم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">المستلم المستهدف</Label>
              <Input
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                placeholder="مدير الفرع والفني المكلف"
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">الحدث المشغل للإرسال الآلي</Label>
            <Input
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              placeholder="مثال: عند وصول شحنة قطع الغيار إلى مستودع الفرع"
              className="h-8.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">عنوان الرسالة (Subject) *</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="[حلواني وزير الحلو] تأكيد استلام الشحنة {{po_number}}"
              className="h-8.5 text-xs font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">نص الرسالة (Body) *</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              placeholder="اكتب نص البريد الإلكتروني مع استخدام المتغيرات بين أقواس {{variable_name}}..."
              className="resize-y text-xs font-mono min-h-[140px] leading-relaxed"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              قائمة المتغيرات المسموحة (افصل بفواصل دون أقواس)
            </Label>
            <Input
              value={variablesStr}
              onChange={(e) => setVariablesStr(e.target.value)}
              placeholder="ticket_id, branch_name, technician_name, status, date"
              className="h-8.5 text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <Label className="text-xs font-semibold">حالة القالب</Label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                {status === "مفعل" ? "مفعل ويرسل تلقائياً" : "معطل مؤقتاً"}
              </span>
              <Switch
                checked={status === "مفعل"}
                onCheckedChange={(c) => setStatus(c ? "مفعل" : "معطل")}
              />
            </div>
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
              حفظ القالب
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
