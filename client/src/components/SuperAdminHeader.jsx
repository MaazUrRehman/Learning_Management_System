import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const pages = [
  {
    path: "/super-admin/dashboard",
    title: "Dashboard",
    description: "Live KPI cards, recent trends, and quick access to the academy control center.",
  },
  {
    path: "/super-admin/users",
    title: "Users",
    description: "Manage learners, faculty, parents, accountants, and admin accounts from one place.",
  },
  {
    path: "/super-admin/sessions",
    title: "Academic Sessions",
    description: "Create, activate, and archive academic years across your academy.",
  },
  {
    path: "/super-admin/classes",
    title: "Classes",
    description: "Define the curriculum structure and class roster settings for the academy.",
  },
  {
    path: "/super-admin/sections",
    title: "Sections",
    description: "Organize class sections, assign teachers, and keep the timetable structure neat.",
  },
  {
    path: "/super-admin/subjects",
    title: "Subjects",
    description: "Create subjects, assign them to classes, and keep the academic catalog updated.",
  },
  {
    path: "/super-admin/settings",
    title: "Settings",
    description: "Configure academy-wide settings and system controls for the LMS.",
  },
];

const SuperAdminHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const current = useMemo(
    () => pages.find((page) => location.pathname.startsWith(page.path)) || pages[0],
    [location.pathname]
  );

  return (
    <div className="mb-8 rounded-[32px] border border-slate-800 bg-slate-950/90 p-6 shadow-sm shadow-slate-950/20">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">{current.title}</p>
          <h1 className="text-4xl font-semibold text-white">{current.title}</h1>
          <p className="text-slate-400">{current.description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_auto]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-slate-400">
            <p className="text-sm">Use the section controls below to search, sort, and page table data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminHeader;
