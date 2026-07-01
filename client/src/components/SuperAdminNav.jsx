import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  CalendarDays,
  Layers,
  BookOpen,
  Book,
  Settings2,
  Bell,
  MessageCircle,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

const sections = [
  {
    heading: "Overview",
    links: [{ label: "Dashboard", to: "/super-admin/dashboard", icon: Home }],
  },
  {
    heading: "User Management",
    links: [
      { label: "All Users", to: "/super-admin/users", icon: Users },
      { label: "Admins", to: "/super-admin/users/admin", icon: ShieldCheck },
      { label: "Accountants", to: "/super-admin/users/accountant", icon: ClipboardList },
      { label: "Faculty", to: "/super-admin/users/faculty", icon: BookOpen },
      { label: "Parents", to: "/super-admin/users/parent", icon: Bell },
      { label: "Students", to: "/super-admin/users/student", icon: Book },
    ],
  },
  {
    heading: "Academic",
    links: [
      { label: "Sessions", to: "/super-admin/sessions", icon: CalendarDays },
      { label: "Classes", to: "/super-admin/classes", icon: BookOpen },
      { label: "Sections", to: "/super-admin/sections", icon: Layers },
      { label: "Subjects", to: "/super-admin/subjects", icon: Book },
    ],
  },
  {
    heading: "Communication",
    links: [
      { label: "Notifications", to: "/super-admin/notifications", icon: Bell },
      { label: "Announcements", to: "/super-admin/announcements", icon: MessageCircle },
      { label: "Chat", to: "/super-admin/chat", icon: MessageCircle },
    ],
  },
  {
    heading: "System",
    links: [
      { label: "Audit Logs", to: "/super-admin/audit-logs", icon: ClipboardList },
      { label: "Profile", to: "/super-admin/profile", icon: ShieldCheck },
      { label: "Settings", to: "/super-admin/settings", icon: Settings2 },
    ],
  },
];

const SuperAdminNav = () => {
  return (
    <nav className="space-y-6">
      {sections.map((section) => (
        <div key={section.heading} className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{section.heading}</p>
          <div className="space-y-2">
            {section.links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-cyan-500/15 text-white ring-1 ring-cyan-500/30"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-cyan-300 transition duration-200 group-hover:text-white" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
};

export default SuperAdminNav;
