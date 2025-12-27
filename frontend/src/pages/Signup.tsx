import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../lib/AuthContext";
import { signupSchema, type SignupForm } from "../lib/validators";
import { Link, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldGroup,
} from "@/components/ui/field";

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
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

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
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name" required>
                      Full name
                    </FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your Name"
                      {...register("name")}
                    />
                    {errors.name && (
                      <FieldError>{errors.name.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email" required>
                      Email
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <FieldError>{errors.email.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password" required>
                      Password
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    {errors.password && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirm" required>
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="••••••••"
                      {...register("confirm")}
                    />
                    {errors.confirm && (
                      <FieldError>{errors.confirm.message}</FieldError>
                    )}
                  </Field>
                </FieldGroup>
              </FieldSet>

              {errors.root && <FieldError>{errors.root.message}</FieldError>}

              <CardFooter className="px-0 pt-0">
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating…" : "Create account"}
                </Button>
              </CardFooter>
              <div className="text-sm text-muted-foreground mt-2 text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{
                    from: (location.state as any)?.from || location.pathname,
                  }}
                  className="text-primary underline"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
