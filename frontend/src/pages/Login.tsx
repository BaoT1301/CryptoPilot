import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginForm } from "../lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../lib/AuthContext";
import AuthShell from "@/components/auth/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    const res = await login(data.email, data.password);
    if (res.success) {
      const safeFrom = ["/login", "/signup"].includes(from) ? "/" : from;
      navigate(safeFrom, { replace: true });
    } else {
      setError("root", { message: res.message || "Login failed" });
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to reach your positions, open orders and history."
      footer={
        <>
          No account yet?{" "}
          <Link
            to="/signup"
            state={{ from: (location.state as any)?.from || location.pathname }}
            className="text-foreground underline underline-offset-4 transition-colors hover:text-[var(--brand)]"
          >
            Create one
          </Link>
        </>
      }
    >
      {/* Labels sit above inputs, errors below them, and the placeholder is a
          hint rather than the label. */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p
            role="alert"
            className="rounded-[10px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Signing in" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
