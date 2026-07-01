import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-10">
      <div className="relative max-w-6xl w-full rounded-[32px] overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 opacity-90"></div>
        <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] p-10 md:p-14">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-300 ring-1 ring-violet-500/20">
              <GraduationCap className="w-4 h-4" />
              Academy LMS for modern institutes
            </div>

            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
                Build a secure, scalable LMS experience for academies.
              </h1>
              <p className="mt-5 text-slate-400 text-lg leading-8">
                Phase 1 includes login, authentication, and the Super Admin dashboard flow.
                The platform is deliberately closed to public registration and only supports seeded Super Admin access.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400"
              >
                Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-400">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="font-semibold text-slate-100">No public signup</p>
                <p className="mt-2 text-slate-500">Account creation is handled by Super Admin only.</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="font-semibold text-slate-100">Protected admin access</p>
                <p className="mt-2 text-slate-500">Only authenticated Super Admin users can reach the dashboard.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/40">
            <div className="text-slate-300 uppercase tracking-[0.3em] text-xs mb-6">
              Academy LMS Overview
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                <p className="text-slate-400 text-sm">LMS Name</p>
                <p className="mt-3 text-2xl font-semibold text-white">Academy Learning Management System</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                <p className="text-slate-400 text-sm">Phase</p>
                <p className="mt-3 text-2xl font-semibold text-white">Initial Access Flow</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                <p className="text-slate-400 text-sm">Access</p>
                <p className="mt-3 text-2xl font-semibold text-white">Super Admin Only</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
