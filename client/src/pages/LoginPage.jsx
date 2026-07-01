import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/super-admin/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleMap = {
        SUPER_ADMIN: "/super-admin/dashboard",
        ADMIN: "/admin",
        ACCOUNTANT: "/accountant",
        FACULTY: "/faculty",
        PARENT: "/parent",
        STUDENT: "/student",
      };
      navigate(location.state?.from?.pathname || roleMap[user.role] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const onSubmit = async (values) => {
    setErrorMessage("");
    try {
      const authResult = await login(values);

      if (authResult?.forcePasswordChange) {
        const roleMap = {
          SUPER_ADMIN: "/super-admin/dashboard",
          ADMIN: "/admin",
          ACCOUNTANT: "/accountant",
          FACULTY: "/faculty",
          PARENT: "/parent",
          STUDENT: "/student",
        };

        const targetRoute = location.state?.from?.pathname || roleMap[authResult.role] || "/";

        navigate(targetRoute, {
          replace: true,
          state: {
            forcePasswordChange: true,
            role: authResult.role,
            message: authResult.message,
            from: targetRoute,
          },
        });
        return;
      }

      const roleMap = {
        SUPER_ADMIN: "/super-admin/dashboard",
        ADMIN: "/admin",
        ACCOUNTANT: "/accountant",
        FACULTY: "/faculty",
        PARENT: "/parent",
        STUDENT: "/student",
      };

      const targetRoute = roleMap[authResult?.user?.role];
      if (!targetRoute) {
        setErrorMessage("Invalid user role assigned.");
        return;
      }
      navigate(targetRoute, { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Login failed. Please try again.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Super Admin Login</p>
            <h1 className="mt-4 text-3xl font-semibold text-white">Sign in to Academy LMS</h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-300" />
              <p className="text-sm leading-6">{errorMessage}</p>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email or Username</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                autoComplete="username"
                {...register("identifier", {
                  required: "Email or username is required",
                  minLength: {
                    value: 2,
                    message: "Enter at least 2 characters",
                  },
                })}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 py-4 pl-12 pr-4 text-slate-100 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            {errors.identifier && (
              <p className="text-sm text-red-400">{errors.identifier.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 py-4 pl-12 pr-4 text-slate-100 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-violet-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-500/60"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-sm text-slate-500">
          Only Super Admin access is available in this phase. No public registration is supported.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
