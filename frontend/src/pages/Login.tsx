import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../lib/AuthContext';
import { loginSchema, type LoginForm } from '../lib/validators';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError, FieldSet, FieldGroup } from '@/components/ui/field';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/';
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  async function onSubmit(data: LoginForm) {
    const res = await login(data.email, data.password);
    if (res.success) {
      const safeFrom = ['/login', '/signup'].includes(from) ? '/' : from;
      navigate(safeFrom, { replace: true });
    } else {
      setError('root', { message: res.message || 'Login failed' });
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Log in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register('email')}
                    />
                    {errors.email && <FieldError>{errors.email.message}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register('password')}
                    />
                    {errors.password && <FieldError>{errors.password.message}</FieldError>}
                  </Field>
                </FieldGroup>
              </FieldSet>

              {errors.root && <FieldError>{errors.root.message}</FieldError>}

              <CardFooter className="px-0 pt-0">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in…' : 'Log in'}
                </Button>
              </CardFooter>
              <div className="text-sm text-muted-foreground mt-2 text-center">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  state={{ from: (location.state as any)?.from || location.pathname }}
                  className="text-primary underline"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}