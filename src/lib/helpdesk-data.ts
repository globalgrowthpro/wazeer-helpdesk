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
  location?: string;
  branchPhone?: string;
  createdISO?: string;
  estimatedHours?: string;
};

export type Technician = {
  id: string;
  name: string;
  skill: string;
  load: number;
  completed: number;
  phone: string;
  avatar?: string;
  zone: string;
  status: string;
  email?: string;
  employeeId?: string;
  rating?: string;
  reviewsCount?: number;
  slaCompliance?: string;
  avgResponseTime?: string;
  avgResolutionTime?: string;
  shift?: string;
  vehicle?: string;
  supervisor?: string;
  certifications?: string[];
  skillsList?: Array<{ name: string; level: number }>;
  bio?: string;
};

export const tickets: Ticket[] = [
  {
    id: "HD-2026-000452",
    title: "كاميرا 08 لا تعرض صورة",
    branch: "فرع التجمع",
    branchId: "branch-04",
    category: "كاميرات مراقبة",
    sla: "02:45",
    status: "قيد التنفيذ",
    priority: "عالية",
    technician: "أحمد سامي",
    technicianId: "ahmed-samy",
    description: "توقفت الكاميرا المثبتة أعلى منطقة الاستلام عن عرض الصورة منذ بداية الوردية الصباحية، يرجى فحص توصيلات الكابل ومصدر الطاقة PoE.",
    location: "منطقة الاستلام والتسليم - الصالة الرئيسية",
    branchPhone: "02 2618 4401",
    createdISO: "2026-09-25",
    estimatedHours: "01:30",
  },
  {
    id: "HD-2026-000451",
    title: "توقف نقطة شبكة في الكاشير",
    branch: "فرع مدينة نصر",
    branchId: "branch-12",
    category: "شبكات",
    sla: "00:36",
    status: "حرج",
    priority: "حرجة",
    technician: "محمود عادل",
    technicianId: "mahmoud-adel",
    description: "نقطة الشبكة الخاصة بجهاز الكاشير الثاني لا تستجيب وتؤثر على سرعة الخدمة.",
    location: "كاشير رقم 2 - قسم الحلويات الشرقية",
    branchPhone: "02 2271 9024",
    createdISO: "2026-09-25",
    estimatedHours: "00:45",
  },
  {
    id: "HD-2026-000449",
    title: "طلب بطاقة دخول بديل",
    branch: "فرع المعادي",
    branchId: "branch-02",
    category: "تحكم دخول",
    sla: "18:20",
    status: "بانتظار شراء",
    priority: "متوسطة",
    technician: "سارة وليد",
    technicianId: "sara-waleed",
    description: "بطاقة الدخول الخلفي يعيد التشغيل بصورة متكررة ويحتاج إلى قطعة بديلة.",
    location: "بوابة الموظفين الخلفية",
    branchPhone: "02 2520 1187",
    createdISO: "2026-09-24",
    estimatedHours: "02:00",
  },
  {
    id: "HD-2026-000448",
    title: "عطل محول الطاقة لجهاز التسجيل NVR",
    branch: "فرع التجمع",
    branchId: "branch-04",
    category: "كاميرات مراقبة",
    sla: "04:15",
    status: "مسندة",
    priority: "حرجة",
    technician: "أحمد سامي",
    technicianId: "ahmed-samy",
    description: "ارتفاع في حرارة جهاز التسجيل NVR وانطفاء متكرر يؤدي لتوقف تسجيل الكاميرات الخارجية للفرع.",
    location: "غرفة الخوادم والتحكم - الطابق الأول",
    branchPhone: "02 2618 4401",
    createdISO: "2026-09-25",
    estimatedHours: "02:15",
  },
  {
    id: "HD-2026-000446",
    title: "تشويش متكرر في كاميرا مدخل السيارات",
    branch: "فرع المعادي",
    branchId: "branch-02",
    category: "كاميرات مراقبة",
    sla: "06:50",
    status: "بانتظار قطعة",
    priority: "متوسطة",
    technician: "أحمد سامي",
    technicianId: "ahmed-samy",
    description: "خطوط بيضاء تظهر على شاشة المراقبة الخاصة ببوابة دخول سيارات التوريد، تم فحص الكابل ويحتاج موصل BNC ومحول مقاوم للماء.",
    location: "بوابة السيارات الخارجية",
    branchPhone: "02 2520 1187",
    createdISO: "2026-09-24",
    estimatedHours: "01:00",
  },
  {
    id: "HD-2026-000443",
    title: "فحص وبرمجة كاميرات العرض للواجهة الزجاجية",
    branch: "فرع مدينة نصر",
    branchId: "branch-12",
    category: "كاميرات مراقبة",
    sla: "12:00",
    status: "بانتظار مراجعة الإدارة",
    priority: "منخفضة",
    technician: "أحمد سامي",
    technicianId: "ahmed-samy",
    description: "تم تعديل زاوية الرؤية وضبط التركيز التلقائي لكاميرا الواجهة، بانتظار اعتماد مدير العمليات لإغلاق البلاغ.",
    location: "الواجهة الرئيسية - شارع عباس العقاد",
    branchPhone: "02 2271 9024",
    createdISO: "2026-09-23",
    estimatedHours: "01:15",
  },
  {
    id: "HD-2026-000438",
    title: "صيانة وإعادة تثبيت كاميرا منطقة التجهيز",
    branch: "فرع التجمع",
    branchId: "branch-04",
    category: "كاميرات مراقبة",
    sla: "مكتمل",
    status: "مغلق",
    priority: "متوسطة",
    technician: "أحمد سامي",
    technicianId: "ahmed-samy",
    description: "تم تثبيت الحامل الجديد لكاميرا منطقة التجهيز واختبار البث بجودة 4K والتأكد من التخزين السحابي.",
    location: "مطبخ التجهيز المركزي - قسم الشوكولاتة",
    branchPhone: "02 2618 4401",
    createdISO: "2026-09-22",
    estimatedHours: "01:45",
  },
  {
    id: "HD-2026-000435",
    title: "توقف طابعة الفواتير الحرارية في كاشير 1",
    branch: "فرع المعادي",
    branchId: "branch-02",
    category: "طابعات فواتير",
    sla: "01:15",
    status: "قيد التنفيذ",
    priority: "عالية",
    technician: "سارة وليد",
    technicianId: "sara-waleed",
    description: "طابعة الإيصالات الحرارية تصدر صوتاً مرتفعاً ولا تسحب رول الورق أثناء إصدار فواتير البيع.",
    location: "كاشير الاستقبال الرئيسي",
    branchPhone: "02 2520 1187",
    createdISO: "2026-09-25",
    estimatedHours: "00:45",
  },
  {
    id: "HD-2026-000432",
    title: "شاشة اللمس لنقطة البيع POS لا تستجيب",
    branch: "فرع مدينة نصر",
    branchId: "branch-12",
    category: "نقاط البيع والكاشير",
    sla: "02:30",
    status: "مسندة",
    priority: "حرجة",
    technician: "محمود عادل",
    technicianId: "mahmoud-adel",
    description: "شاشة اللمس في جهاز نقطة البيع رقم 3 تعلق باستمرار وتتطلب إعادة تشغيل الجهاز بالكامل.",
    location: "قسم التيك أواي والحلويات الغربية",
    branchPhone: "02 2271 9024",
    createdISO: "2026-09-25",
    estimatedHours: "01:00",
  },
  {
    id: "HD-2026-000429",
    title: "تذبذب التيار في لوحة قواطع غرفة التحكم",
    branch: "فرع التجمع",
    branchId: "branch-04",
    category: "كهرباء وطاقة",
    sla: "05:00",
    status: "بانتظار شراء",
    priority: "متوسطة",
    technician: "أحمد سامي",
    technicianId: "ahmed-samy",
    description: "تذبذب ملحوظ في قاطع تغذية أجهزة المراقبة وUPS، يحتاج استبدال فيوز ومرحل حماية فازات.",
    location: "غرفة التحكم والكهرباء الرئيسية",
    branchPhone: "02 2618 4401",
    createdISO: "2026-09-24",
    estimatedHours: "02:30",
  },
];

export const ticketCategories = [
  "كاميرات مراقبة",
  "شبكات",
  "تحكم دخول",
  "نقاط البيع والكاشير",
  "طابعات فواتير",
  "كهرباء وطاقة",
] as const;

export const technicians: Technician[] = [
  {
    id: "ahmed-samy",
    name: "أحمد سامي",
    skill: "كاميرات مراقبة وأنظمة أمنية",
    avatar: "/staff/tech-ahmed.jpg",
    load: 4,
    completed: 28,
    phone: "0100 234 8812",
    zone: "شرق القاهرة والتجمع",
    status: "في مهمة",
    email: "a.samy@wazeer.demo",
    employeeId: "TECH-2026-08",
    rating: "4.9",
    reviewsCount: 142,
    slaCompliance: "96.4%",
    avgResponseTime: "18 دقيقة",
    avgResolutionTime: "1.8 ساعة",
    shift: "الوردية الصباحية (09:00 ص - 05:00 م)",
    vehicle: "شاحنة خدمة فان كود T-14",
    supervisor: "م. طارق الحسيني (رئيس قسم الدعم الميداني)",
    bio: "فني متخصص في تركيب وصيانة منظومات كاميرات المراقبة الرقمية (IP/NVR) والأنظمة الأمنية بخبرة تتجاوز 7 سنوات في فروع التجزئة والأغذية.",
    certifications: [
      "شهادة معتمدة من داهوا Dahua DH-VMS Specialist",
      "شهادة هيكفيجن Hikvision HCSA-Security Professional",
      "شهادة تمديدات الألياف الضوئية Fiber Optics Installer",
      "شهادة السلامة والصحة المهنية OSHA",
    ],
    skillsList: [
      { name: "كاميرات المراقبة IP و NVR", level: 98 },
      { name: "تحليل وتتبع أعطال الطاقة وتغذية PoE", level: 94 },
      { name: "صيانة وتمديد كابلات Cat6 والألياف", level: 91 },
      { name: "أنظمة التحكم بالدخول والبوابات الذكية", level: 86 },
    ],
  },
  {
    id: "mahmoud-adel",
    name: "محمود عادل",
    skill: "شبكات وخوادم داخلية",
    avatar: "/staff/tech-mahmoud.jpg",
    load: 6,
    completed: 34,
    phone: "0101 782 3014",
    zone: "مدينة نصر ومصر الجديدة",
    status: "متاح",
    email: "m.adel@wazeer.demo",
    employeeId: "TECH-2026-14",
    rating: "4.8",
    reviewsCount: 118,
    slaCompliance: "94.2%",
    avgResponseTime: "22 دقيقة",
    avgResolutionTime: "2.1 ساعة",
    shift: "الوردية النهارية (10:00 ص - 06:00 م)",
    vehicle: "سيارة خدمة كود T-09",
    supervisor: "م. طارق الحسيني",
    bio: "متخصص في البنية التحتية للشبكات والراوترات السلكية واللاسلكية وسيرفرات نقاط البيع والكاشير.",
    certifications: [
      "شهادة سيسكو Cisco CCNA Routing & Switching",
      "شهادة ميكروتيك MTCNA Network Associate",
    ],
    skillsList: [
      { name: "شبكات LAN / VLAN والراوترات", level: 96 },
      { name: "خوادم نقاط البيع POS Terminals", level: 92 },
      { name: "أمن الشبكات والجدران النارية", level: 88 },
    ],
  },
  {
    id: "sara-waleed",
    name: "سارة وليد",
    skill: "دعم تقني وأنظمة الدخول",
    avatar: "/staff/tech-sara.jpg",
    load: 2,
    completed: 19,
    phone: "0112 490 7740",
    zone: "جنوب القاهرة والمعادي",
    status: "متاحة",
    email: "s.waleed@wazeer.demo",
    employeeId: "TECH-2026-21",
    rating: "4.9",
    reviewsCount: 89,
    slaCompliance: "98.1%",
    avgResponseTime: "15 دقيقة",
    avgResolutionTime: "1.4 ساعة",
    shift: "الوردية الصباحية (08:30 ص - 04:30 م)",
    vehicle: "سيارة خدمة كود T-03",
    supervisor: "م. طارق الحسيني",
    bio: "أخصائية دعم فني لأنظمة البصمة والتحكم بالدخول الإلكتروني وطابعات الفواتير وأجهزة وزن المنتجات.",
    certifications: [
      "شهادة ZKTeco Biometric Security Specialist",
      "شهادة CompTIA A+ IT Technician",
    ],
    skillsList: [
      { name: "أنظمة البصمة والتحكم بالدخول", level: 97 },
      { name: "طابعات الفواتير والباركود", level: 93 },
      { name: "برمجيات نقاط البيع والدعم السريع", level: 90 },
    ],
  },
];

export type Branch = {
  id: string;
  name: string;
  manager: string;
  open: number;
  closed: number;
  satisfaction: string;
  phone: string;
  address: string;
  region?: string;
  status?: "نشط" | "تحت التجهيز" | "صيانة شاملة";
  devicesCount?: number;
};

export const branches: Branch[] = [
  { id: "branch-04", name: "فرع التجمع", manager: "كريم محمود", open: 3, closed: 48, satisfaction: "4.9", phone: "02 2618 4401", address: "التجمع الخامس، القاهرة الجديدة", region: "القاهرة الجديدة", status: "نشط", devicesCount: 24 },
  { id: "branch-12", name: "فرع مدينة نصر", manager: "نور أحمد", open: 5, closed: 61, satisfaction: "4.7", phone: "02 2271 9024", address: "شارع عباس العقاد، مدينة نصر", region: "شرق القاهرة", status: "نشط", devicesCount: 32 },
  { id: "branch-02", name: "فرع المعادي", manager: "عمر حسن", open: 2, closed: 39, satisfaction: "4.8", phone: "02 2520 1187", address: "شارع النصر، المعادي", region: "جنوب القاهرة", status: "نشط", devicesCount: 19 },
  { id: "branch-07", name: "فرع الشيخ زايد", manager: "إبراهيم خليل", open: 1, closed: 27, satisfaction: "4.9", phone: "02 3850 1422", address: "محور 26 يوليو، هايبر وان، الشيخ زايد", region: "الجيزة", status: "نشط", devicesCount: 22 },
  { id: "branch-09", name: "فرع المهندسين", manager: "ياسر سامي", open: 4, closed: 52, satisfaction: "4.6", phone: "02 3748 9910", address: "شارع جامعة الدول العربية، المهندسين", region: "الجيزة", status: "نشط", devicesCount: 28 },
  { id: "branch-15", name: "فرع مصر الجديدة", manager: "هشام طلعت", open: 0, closed: 44, satisfaction: "4.9", phone: "02 2415 6320", address: "شارع الأهرام، الكوربة، مصر الجديدة", region: "شرق القاهرة", status: "نشط", devicesCount: 25 },
];

export const ticketEvents = [
  { time: "09:20", title: "إنشاء البلاغ", text: "أرسل الفرع البلاغ وأرفق صورة للمعدة." },
  { time: "09:35", title: "مراجعة الإدارة", text: "تم تأكيد التصنيف والأولوية ومستوى الخدمة." },
  { time: "09:40", title: "إسناد الفني", text: "تم إسناد المهمة إلى الفني المناسب." },
  { time: "10:05", title: "بدء العمل", text: "وصل الفني وبدأ فحص مصدر الكهرباء والاتصال." },
];

export const getStoredTickets = (): Ticket[] => {
  if (typeof window === "undefined") return tickets;
  const raw = localStorage.getItem("wazeer-tickets");
  if (!raw) {
    localStorage.setItem("wazeer-tickets", JSON.stringify(tickets));
    return tickets;
  }
  try {
    const sanitized = raw.includes("قارئ") || raw.includes("بطاقة  ")
      ? raw.replaceAll("قارئ", "بطاقة").replaceAll("بطاقة  ", "بطاقة ")
      : raw;
    if (sanitized !== raw) {
      localStorage.setItem("wazeer-tickets", sanitized);
    }
    const parsed = JSON.parse(sanitized);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : tickets;
  } catch {
    return tickets;
  }
};

export const saveStoredTickets = (next: Ticket[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("wazeer-tickets", JSON.stringify(next));
    window.dispatchEvent(new Event("wazeer-tickets-updated"));
  }
};

export const getStoredTasks = (): Ticket[] => {
  if (typeof window === "undefined") return tickets;
  const raw = localStorage.getItem("wazeer-tasks");
  if (!raw) {
    localStorage.setItem("wazeer-tasks", JSON.stringify(tickets));
    return tickets;
  }
  try {
    const sanitized = raw.includes("قارئ") || raw.includes("بطاقة  ")
      ? raw.replaceAll("قارئ", "بطاقة").replaceAll("بطاقة  ", "بطاقة ")
      : raw;
    if (sanitized !== raw) {
      localStorage.setItem("wazeer-tasks", sanitized);
    }
    const parsed = JSON.parse(sanitized);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : tickets;
  } catch {
    return tickets;
  }
};

export const saveStoredTasks = (next: Ticket[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("wazeer-tasks", JSON.stringify(next));
    window.dispatchEvent(new Event("wazeer-tasks-updated"));
  }
};

export const getStoredBranches = (): Branch[] => {
  if (typeof window === "undefined") return branches;
  const raw = localStorage.getItem("wazeer-branches");
  if (!raw) {
    localStorage.setItem("wazeer-branches", JSON.stringify(branches));
    return branches;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : branches;
  } catch {
    return branches;
  }
};

export const saveStoredBranches = (next: Branch[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("wazeer-branches", JSON.stringify(next));
    window.dispatchEvent(new Event("wazeer-branches-updated"));
  }
};