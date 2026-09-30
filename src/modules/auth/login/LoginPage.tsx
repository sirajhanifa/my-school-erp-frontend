import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router";
import FormContainer from "../../../components/form/FormContainer";
import FormInput from "../../../components/form/FormInput";
import FormCheckbox from "../../../components/form/FormCheckbox";
import FormActions from "../../../components/form/FormActions";
import { loginSchema, type LoginFormValues } from "../../../schemas/loginSchema";
import { useAuthStore } from "../../../store/authStore";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const onSubmit = async (values: LoginFormValues) => {
    const success = await login(values);
    if (success) {
      navigate("/dashboard", { replace: true });
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

        <FormContainer title="Login" size="sm" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            {error && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <FormInput
              name="email"
              label="Email"
              type="email"
              placeholder="you@school.com"
              register={register}
              required
              error={errors.email?.message}
            />

            <FormInput
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              register={register}
              required
              error={errors.password?.message}
            />

            <FormCheckbox name="rememberMe" label="Remember me" register={register} />
          </div>

          <FormActions submitLabel="Sign in" isSubmitting={isLoading} />
        </FormContainer>
      </div>
    </div>
  );
};

export default LoginPage;
