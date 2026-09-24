export type Ticket = {
  id: string;
  title: string;
  branch: string;
  branchId: string;
  category: string;
  sla: string;
  status: string;
  priority: string;
  technician: string;
  technicianId: string;
  description: string;
};

export const tickets: Ticket[] = [
  { id: "HD-2026-000452", title: "كاميرا 08 لا تعرض صورة", branch: "فرع التجمع", branchId: "branch-04", category: "كاميرات مراقبة", sla: "02:45", status: "قيد التنفيذ", priority: "عالية", technician: "أحمد سامي", technicianId: "ahmed-samy", description: "توقفت الكاميرا المثبتة أعلى منطقة الاستلام عن عرض الصورة منذ بداية الوردية الصباحية." },
  { id: "HD-2026-000451", title: "توقف نقطة شبكة في الكاشير", branch: "فرع مدينة نصر", branchId: "branch-12", category: "شبكات", sla: "00:36", status: "حرج", priority: "حرجة", technician: "محمود عادل", technicianId: "mahmoud-adel", description: "نقطة الشبكة الخاصة بجهاز الكاشير الثاني لا تستجيب وتؤثر على سرعة الخدمة." },
  { id: "HD-2026-000449", title: "طلب قارئ دخول بديل", branch: "فرع المعادي", branchId: "branch-02", category: "تحكم دخول", sla: "18:20", status: "بانتظار شراء", priority: "متوسطة", technician: "سارة وليد", technicianId: "sara-waleed", description: "قارئ الدخول الخلفي يعيد التشغيل بصورة متكررة ويحتاج إلى قطعة بديلة." },
];

export const technicians = [
  { id: "ahmed-samy", name: "أحمد سامي", skill: "كاميرات مراقبة", load: 4, completed: 28, phone: "0100 234 8812", zone: "شرق القاهرة", status: "في مهمة" },
  { id: "mahmoud-adel", name: "محمود عادل", skill: "شبكات", load: 6, completed: 34, phone: "0101 782 3014", zone: "مدينة نصر", status: "متاح" },
  { id: "sara-waleed", name: "سارة وليد", skill: "دعم تقني", load: 2, completed: 19, phone: "0112 490 7740", zone: "جنوب القاهرة", status: "متاحة" },
];

export const branches = [
  { id: "branch-04", name: "فرع التجمع", manager: "كريم محمود", open: 3, closed: 48, satisfaction: "4.9", phone: "02 2618 4401", address: "التجمع الخامس، القاهرة الجديدة" },
  { id: "branch-12", name: "فرع مدينة نصر", manager: "نور أحمد", open: 5, closed: 61, satisfaction: "4.7", phone: "02 2271 9024", address: "عباس العقاد، مدينة نصر" },
  { id: "branch-02", name: "فرع المعادي", manager: "عمر حسن", open: 2, closed: 39, satisfaction: "4.8", phone: "02 2520 1187", address: "شارع النصر، المعادي" },
];

export const ticketEvents = [
  { time: "09:20", title: "إنشاء البلاغ", text: "أرسل الفرع البلاغ وأرفق صورة للمعدة." },
  { time: "09:35", title: "مراجعة الإدارة", text: "تم تأكيد التصنيف والأولوية ومستوى الخدمة." },
  { time: "09:40", title: "إسناد الفني", text: "تم إسناد المهمة إلى الفني المناسب." },
  { time: "10:05", title: "بدء العمل", text: "وصل الفني وبدأ فحص مصدر الكهرباء والاتصال." },
];