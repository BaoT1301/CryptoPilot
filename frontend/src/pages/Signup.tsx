import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../lib/AuthContext";
import { signupSchema, type SignupForm } from "../lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthShell from "@/components/auth/AuthShell";

const FIELDS = [
  {
    name: "name" as const,
    label: "Name",
    type: "text",
    autoComplete: "name",
    placeholder: "Your name",
  },
  {
    name: "email" as const,
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  {
    name: "password" as const,
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "At least 8 characters",
    // Surfaced up front rather than only after a failed submit.
    hint: "Needs 8+ characters with an uppercase, a lowercase and a number.",
  },
  {
    name: "confirm" as const,
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Repeat your password",
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";
  const { signup: signupAction } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupForm) {
    const res = await signupAction(data.name, data.email, data.password);
    if (res.success) {
      const safeFrom = ["/login", "/signup"].includes(from) ? "/" : from;
      navigate(safeFrom, { replace: true });
    } else {
      setError("root", { message: res.message || "Signup failed" });
    }
  }

  return (
    <AuthShell
      title="Open an account."
      subtitle="Free, with simulated funds. No card and no identity check."
      footer={
        <>
          Already have one?{" "}
          <Link
            to="/login"
            state={{ from: (location.state as any)?.from || location.pathname }}
            className="text-foreground underline underline-offset-4 transition-colors hover:text-[var(--brand)]"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {FIELDS.map((field) => {
          const error = errors[field.name];
          return (
            <div key={field.name} className="space-y-2">
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-foreground"
              >
                {field.label}
              </label>
              <Input
                id={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                aria-invalid={!!error}
                aria-describedby={
                  error
                    ? `${field.name}-error`
                    : field.hint
                      ? `${field.name}-hint`
                      : undefined
                }
                {...register(field.name)}
              />
              {!error && field.hint && (
                <p
                  id={`${field.name}-hint`}
                  className="text-xs text-muted-foreground"
                >
                  {field.hint}
                </p>
              )}
              {error && (
                <p
                  id={`${field.name}-error`}
                  className="text-sm text-destructive"
                >
                  {error.message as string}
                </p>
              )}
            </div>
          );
        })}

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
          {isSubmitting ? "Creating account" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
