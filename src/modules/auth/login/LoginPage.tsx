import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { loginSchema, type LoginFormValues } from "../../../schemas/loginSchema";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "../../../store/toastStore";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const onSubmit = async (values: LoginFormValues) => {
    const success = await login(values);
    if (success) {
      toast.success("Logged in successfully");
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(useAuthStore.getState().error ?? "Login failed");
    }
  };

  // Already logged in? Skip the login page.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">My School ERP</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>
        </div>

        <Card className="mx-auto w-full max-w-md gap-0 py-0">
          <CardHeader className="border-b px-4 py-5 sm:px-8">
            <CardTitle className="text-lg font-semibold">Login</CardTitle>
          </CardHeader>

          <CardContent className="px-4 py-6 sm:px-8">
            {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
              <div className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* data-invalid turns the label red when there is an error */}
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="login-email">
                    Email
                    <span className="-ml-1.5 text-destructive" aria-hidden="true">
                      *
                    </span>
                  </FieldLabel>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@school.com"
                    aria-required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "login-email-error" : undefined}
                    className="h-9"
                    {...register("email")}
                  />
                  {errors.email && <FieldError id="login-email-error">{errors.email.message}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="login-password">
                    Password
                    <span className="-ml-1.5 text-destructive" aria-hidden="true">
                      *
                    </span>
                  </FieldLabel>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    aria-required
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "login-password-error" : undefined}
                    className="h-9"
                    {...register("password")}
                  />
                  {errors.password && (
                    <FieldError id="login-password-error">{errors.password.message}</FieldError>
                  )}
                </Field>
              </div>

              {/* Full-width submit button; aria-busy tells screen readers the form is being submitted */}
              <div className="flex flex-col gap-3 border-t pt-6">
                <Button type="submit" size="lg" disabled={isLoading} aria-busy={isLoading} className="min-w-24">
                  {isLoading && <Spinner />}
                  {isLoading ? "Please wait..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
