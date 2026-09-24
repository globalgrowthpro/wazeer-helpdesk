import { useEffect, useState } from "react";

export type Role = "admin" | "branch" | "technician";
export type DemoUser = { email: string; password: string; name: string; role: Role; roleLabel: string; branchId?: string; technicianId?: string };

export const demoAccounts: DemoUser[] = [
  { email: "admin@wazeer.demo", password: "123456", name: "حافظ رحيم", role: "admin", roleLabel: "مدير النظام" },
  { email: "branch@wazeer.demo", password: "123456", name: "كريم محمود", role: "branch", roleLabel: "مدير فرع التجمع", branchId: "branch-04" },
  { email: "branch2@wazeer.demo", password: "123456", name: "نور أحمد", role: "branch", roleLabel: "مدير فرع مدينة نصر", branchId: "branch-12" },
  { email: "tech@wazeer.demo", password: "123456", name: "أحمد سامي", role: "technician", roleLabel: "فني كاميرات مراقبة", technicianId: "ahmed-samy" },
  { email: "tech2@wazeer.demo", password: "123456", name: "محمود عادل", role: "technician", roleLabel: "فني شبكات", technicianId: "mahmoud-adel" },
];

export const roleHome = { admin: "/", branch: "/branch-panel", technician: "/tech-panel" } as const;

const KEY = "wazeer-demo-session";
const listeners = new Set<() => void>();

export function login(email: string, password: string): DemoUser | null {
  const user = demoAccounts.find((a) => a.email === email.trim().toLowerCase() && a.password === password);
  if (user) { localStorage.setItem(KEY, user.email); listeners.forEach((l) => l()); }
  return user ?? null;
}

export function logout() { localStorage.removeItem(KEY); listeners.forEach((l) => l()); }

function read(): DemoUser | null {
  const email = localStorage.getItem(KEY);
  return demoAccounts.find((a) => a.email === email) ?? null;
}

export function useSession() {
  const [state, setState] = useState<{ ready: boolean; user: DemoUser | null }>({ ready: false, user: null });
  useEffect(() => {
    const sync = () => setState({ ready: true, user: read() });
    sync();
    listeners.add(sync);
    return () => { listeners.delete(sync); };
  }, []);
  return state;
}
