import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Flame,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  ShieldCheck,
  Star,
  Timer,
  Trash2,
  Truck,
  Upload,
  UserCheck,
  UserCog,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/helpdesk/app-shell";
import { TechNavTabs } from "@/components/helpdesk/tech-nav-tabs";
import { Panel, Stat } from "@/components/helpdesk/ui";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import { technicians, tickets } from "@/lib/helpdesk-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tech-profile")({
  head: () => ({
    meta: [
      { title: "الملف الشخصي والأداء | وزير الحلو" },
      { name: "description", content: "الملف المهني للفني، مؤشرات الأداء، تقييم الجودة، والشهادات والمهارات." },
      { property: "og:title", content: "الملف الشخصي والأداء | وزير الحلو" },
      { property: "og:description", content: "الملف المهني للفني، مؤشرات الأداء، تقييم الجودة، والشهادات والمهارات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell title="الملف الشخصي والأداء" role="technician">
      <TechProfilePage />
    </AppShell>
  ),
});

function TechProfilePage() {
  const { user } = useSession();
  const techBase = technicians.find((t) => t.id === user?.technicianId) ?? technicians[0]!;

  // Technician availability status
  const [techStatus, setTechStatus] = useState<string>(() => {
    return localStorage.getItem("wazeer-tech-status") || techBase.status || "متاح للعمل";
  });
  const updateTechStatus = (s: string) => {
    setTechStatus(s);
    localStorage.setItem("wazeer-tech-status", s);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  interface TechProfileData {
    phone: string;
    email: string;
    bio: string;
    zone: string;
    shift: string;
    vehicle: string;
    supervisor: string;
    avatar: string;
  }

  // Editable Profile
  const [profile, setProfile] = useState<TechProfileData>(() => {
    const saved = localStorage.getItem(`wazeer-tech-profile-${techBase.id}`);
    const savedAvatar = localStorage.getItem(`wazeer-tech-avatar-${techBase.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          avatar: savedAvatar || parsed.avatar || techBase.avatar || "",
        };
      } catch {
        /* ignore */
      }
    }
    return {
      phone: techBase.phone,
      email: techBase.email || "a.samy@wazeer.demo",
      bio: techBase.bio || "فني متخصص في صيانة وبرمجة كاميرات المراقبة IP والشبكات السلكية واللاسلكية وسيرفرات الفروع.",
      zone: techBase.zone,
      shift: techBase.shift || "الوردية الصباحية (09:00 ص - 05:00 م)",
      vehicle: techBase.vehicle || "سيارة خدمة كود T-05",
      supervisor: techBase.supervisor || "م. طارق الحسيني",
      avatar: savedAvatar || techBase.avatar || "",
    };
  });

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [tempProfile, setTempProfile] = useState<TechProfileData>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenEdit = () => {
    setTempProfile(profile);
    setEditProfileOpen(true);
  };

  const handleAvatarFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setProfile((prev: TechProfileData) => {
          const updated = { ...prev, avatar: dataUrl };
          localStorage.setItem(`wazeer-tech-profile-${techBase.id}`, JSON.stringify(updated));
          return updated;
        });
        setTempProfile((prev: TechProfileData) => ({ ...prev, avatar: dataUrl }));
        localStorage.setItem(`wazeer-tech-avatar-${techBase.id}`, dataUrl);
        localStorage.setItem(`wazeer-user-avatar-${user?.email || techBase.id}`, dataUrl);
        window.dispatchEvent(new Event("avatar-updated"));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfile((prev: TechProfileData) => {
      const updated = { ...prev, avatar: "" };
      localStorage.setItem(`wazeer-tech-profile-${techBase.id}`, JSON.stringify(updated));
      return updated;
    });
    setTempProfile((prev: TechProfileData) => ({ ...prev, avatar: "" }));
    localStorage.removeItem(`wazeer-tech-avatar-${techBase.id}`);
    localStorage.removeItem(`wazeer-user-avatar-${user?.email || techBase.id}`);
    window.dispatchEvent(new Event("avatar-updated"));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(tempProfile);
    localStorage.setItem(`wazeer-tech-profile-${techBase.id}`, JSON.stringify(tempProfile));
    if (tempProfile.avatar) {
      localStorage.setItem(`wazeer-tech-avatar-${techBase.id}`, tempProfile.avatar);
      localStorage.setItem(`wazeer-user-avatar-${user?.email || techBase.id}`, tempProfile.avatar);
      window.dispatchEvent(new Event("avatar-updated"));
    }
    setEditProfileOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Tasks counts
  const myTickets = tickets.filter((t) => t.technicianId === techBase.id);
  const completedTickets = myTickets.filter((t) => t.status === "مغلق").length;

  return (
    <div className="space-y-6">
      <TechNavTabs active="profile" />

      {/* Hidden File Input for Avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAvatarFile(file);
          e.target.value = "";
        }}
      />

      {/* Toast Notification */}
      {saveSuccess && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>تم تحديث الملف المهني والصورة الشخصية بنجاح!</span>
          </div>
          <button onClick={() => setSaveSuccess(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ================= HERO PROFILE HEADER ================= */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar with Upload Hover & Mobile Camera Button */}
          <div className="relative group">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl border-2 border-border shadow-md bg-brand-ink text-primary-foreground">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={techBase.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl sm:text-3xl font-bold">
                  {techBase.name[0]}
                </div>
              )}

              {/* Desktop Hover Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="تغيير الصورة الشخصية"
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[1px] cursor-pointer"
              >
                <Camera className="h-5 w-5" />
                <span className="text-[10px] font-bold mt-0.5">تغيير</span>
              </button>
            </div>

            {/* Mobile Touch Camera Action Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="رفع صورة شخصية"
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-brand-ink text-white border-2 border-card shadow-sm hover:bg-brand-ink/90 sm:hidden cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>

            {/* Availability Dot */}
            <span
              className={cn(
                "absolute -bottom-1 -left-1 h-5 w-5 rounded-full border-2 border-card",
                techStatus === "متاح للعمل" && "bg-brand-green",
                techStatus === "في مهمة" && "bg-[var(--kpi-amber)]",
                techStatus === "في استراحة" && "bg-[var(--kpi-apricot)]",
                techStatus === "غير متاح" && "bg-muted-foreground",
              )}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{techBase.name}</h1>
              <Badge variant="outline" className="font-mono text-xs">
                {techBase.employeeId || "TECH-2026-08"}
              </Badge>
              <Badge
                className={cn(
                  "text-xs font-bold",
                  techStatus === "متاح للعمل" && "bg-brand-green text-primary-foreground",
                  techStatus === "في مهمة" && "bg-[var(--kpi-amber)] text-brand-ink",
                  techStatus === "في استراحة" && "bg-[var(--kpi-apricot)] text-brand-ink",
                  techStatus === "غير متاح" && "bg-muted text-muted-foreground",
                )}
              >
                ● {techStatus}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              التخصص الفني: <strong className="text-foreground">{techBase.skill}</strong> · النطاق: <strong className="text-foreground">{profile.zone}</strong>
            </p>
            <p className="mt-2 text-xs sm:text-sm text-foreground/90 max-w-xl leading-relaxed">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select value={techStatus} onValueChange={updateTechStatus}>
            <SelectTrigger className="h-9 flex-1 sm:w-40 text-xs font-semibold">
              <SelectValue placeholder="حالة الفني" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="متاح للعمل">🟢 متاح للعمل</SelectItem>
              <SelectItem value="في مهمة">🟡 في مهمة ميدانية</SelectItem>
              <SelectItem value="في استراحة">☕ في استراحة</SelectItem>
              <SelectItem value="غير متاح">⚪ غير متاح</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleOpenEdit} size="sm" variant="outline" className="gap-1.5 flex-1 sm:flex-initial">
            <Edit3 className="h-4 w-4" />
            تعديل الملف
          </Button>

          <Link to="/tech-chat" className="flex-1 sm:flex-initial">
            <Button size="sm" className="gap-1.5 w-full">
              <MessageSquare className="h-4 w-4" />
              محادثة العمليات
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= KPI CARDS (Responsive: 2 cols on mobile, 4 on desktop) ================= */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <Stat
          label="تقييم الجودة ورضا الفروع"
          value={`${techBase.rating || "4.9"} / 5.0`}
          tone="sand"
          icon={Star}
          note={`بناءً على ${techBase.reviewsCount || 142} تقييماً`}
        />
        <Stat
          label="الالتزام بالـ SLA"
          value={techBase.slaCompliance || "96.4%"}
          tone="forest"
          icon={ShieldCheck}
          note="ضمن النطاق المستهدف"
        />
        <Stat
          label="متوسط زمن الاستجابة"
          value={techBase.avgResponseTime || "18 دقيقة"}
          tone="navy"
          icon={Timer}
          note="من وقت الإسناد للوصول"
        />
        <Stat
          label="المهام المكتملة"
          value={String(techBase.completed || 48)}
          tone="flame"
          icon={CheckCircle2}
          note="خلال الشهر الحالي"
        />
      </section>

      {/* ================= DETAILS GRID ================= */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols on desktop) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Skills Breakdown */}
          <Panel title="المهارات الفنية ومستويات الإتقان" icon={Wrench}>
            <div className="space-y-4 p-4 sm:p-5">
              {(
                techBase.skillsList || [
                  { name: "كاميرات المراقبة IP و NVR", level: 98 },
                  { name: "تحليل وتتبع أعطال الطاقة وتغذية PoE", level: 94 },
                  { name: "صيانة وتمديد كابلات Cat6 والألياف", level: 91 },
                  { name: "أنظمة التحكم بالدخول والبوابات الذكية", level: 86 },
                  { name: "طابعات الفواتير وأجهزة نقاط البيع POS", level: 82 },
                ]
              ).map((skill) => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-foreground">{skill.name}</span>
                    <span className="font-mono font-bold text-primary">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Certifications & Badges */}
          <Panel title="الشهادات والاعتمادات المهنية" icon={Award}>
            <div className="grid gap-3 p-4 sm:p-5 sm:grid-cols-2">
              {(
                techBase.certifications || [
                  "شهادة هيكفيجن المعتمدة HCSA-CCTV",
                  "شهادة سيسكو للشبكات Cisco CCNA Certified",
                  "شهادة السلامة والصحة المهنية OSHA",
                  "شهادة ZKTeco لأنظمة الدخول الذكي",
                ]
              ).map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{cert}</p>
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      شهادة معتمدة وسارية
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right Column: Operational Contact Info */}
        <div className="space-y-6">
          <Panel title="بيانات الاتصال والتشغيل الميداني" icon={Briefcase}>
            <div className="space-y-3.5 p-4 sm:p-5 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">رقم الهاتف للتواصل الميداني</p>
                  <a href={`tel:${profile.phone}`} className="font-bold font-mono text-foreground hover:underline" dir="ltr">
                    {profile.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">البريد الإلكتروني للعمل</p>
                  <a href={`mailto:${profile.email}`} className="font-bold font-mono text-foreground hover:underline" dir="ltr">
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">ساعات الوردية الرسمية</p>
                  <p className="font-bold text-foreground">{profile.shift}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">النطاق الجغرافي للفروع</p>
                  <p className="font-bold text-foreground">{profile.zone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">مركبة الصيانة المسندة</p>
                  <p className="font-bold text-foreground">{profile.vehicle}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">المشرف المباشر</p>
                  <p className="font-bold text-foreground">{profile.supervisor}</p>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleOpenEdit} variant="outline" size="sm" className="w-full gap-2">
                  <Edit3 className="h-3.5 w-3.5" />
                  تحديث البيانات
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-md" dir="rtl">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                <UserCog className="h-5 w-5 text-primary" />
                تعديل الملف المهني للفني
              </DialogTitle>
              <DialogDescription>
                تحديث رقم الهاتف للتواصل، النبذة التعريفية، ومواعيد الوردية.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4">
              {/* Avatar Field */}
              <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface/60 p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-brand-ink text-primary-foreground shadow-xs">
                  {tempProfile.avatar ? (
                    <img
                      src={tempProfile.avatar}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xl font-bold">
                      {techBase.name[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-bold text-foreground">الصورة الشخصية (Avatar)</p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-bold gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 text-brand-ink" />
                      <span>اختيار صورة جديدة</span>
                    </Button>
                    {tempProfile.avatar && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-bold gap-1 text-brand-red hover:bg-brand-red/10"
                        onClick={handleRemoveAvatar}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>إزالة</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">صيغة JPG أو PNG بحد أقصى 5MB</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">رقم الهاتف للتواصل</label>
                <Input
                  required
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                  dir="ltr"
                  className="text-left font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">البريد الإلكتروني</label>
                <Input
                  required
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                  dir="ltr"
                  className="text-left font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">الوردية ومواعيد العمل</label>
                <Input
                  value={tempProfile.shift}
                  onChange={(e) => setTempProfile({ ...tempProfile, shift: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">النطاق الجغرافي المسند</label>
                <Input
                  value={tempProfile.zone}
                  onChange={(e) => setTempProfile({ ...tempProfile, zone: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">النبذة المهنية والخبرات</label>
                <Textarea
                  value={tempProfile.bio}
                  onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                  className="min-h-[80px] text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start">
              <Button type="submit" className="gap-2 font-bold flex-1 sm:flex-initial">
                <Save className="h-4 w-4" />
                حفظ التعديلات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditProfileOpen(false)}
                className="flex-1 sm:flex-initial"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
