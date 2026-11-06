import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { RequiredMark } from "@/components/ui/required-mark";
import { employeeSchema, type EmployeeFormValues } from "../../../schemas/employeeSchema";
import { useEmployeeStore, type Employee } from "../../../store/employeeStore";

interface EmployeeCreatePageProps {
  // The employee being edited; null = add a new employee
  employee: Employee | null;
  // Called after a successful save or on Cancel, to go back to the list
  onClose: () => void;
}

// The Add / Edit Employee form. Opened from EmployeeListPage.
const EmployeeCreatePage = ({ employee, onClose }: EmployeeCreatePageProps) => {
  const createEmployee = useEmployeeStore((state) => state.createEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const roles = useEmployeeStore((state) => state.roles);
  const fetchRoles = useEmployeeStore((state) => state.fetchRoles);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    // Edit: start with the employee's values. Add: start empty and active.
    defaultValues: {
      name: employee?.name ?? "",
      email: employee?.email ?? "",
      roleId: employee?.roleId ?? "",
      isActive: employee?.isActive ?? true,
    },
  });

  // Load the role dropdown options when the form opens
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // "items" tells the Select which label to show for the selected value
  const roleItems = roles.map((role) => ({ label: role.name, value: role.id }));

  // The store shows the toast and updates the list; we only close the form when it worked
  const onSubmit = async (values: EmployeeFormValues) => {
    const success = employee
      ? await updateEmployee(employee.id, values)
      : await createEmployee(values);

    if (success) onClose();
  };

  return (
    // max-w-none: the form fills the content area instead of a narrow centred card
    <Card className="mx-auto w-full max-w-none gap-0 py-0">
      <CardHeader className="border-b px-4 py-5 sm:px-8">
        <CardTitle className="text-lg font-semibold">
          {employee ? "Edit Employee" : "Add Employee"}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-6 sm:px-8">
        {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          {/* ---------- Employee Details ---------- */}
          <FieldSet>
            <FieldLegend className="font-semibold">Employee Details</FieldLegend>
            <FieldDescription>
              {employee
                ? "The employee's login details and role."
                : "New employees log in with the school's default password."}
            </FieldDescription>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              {/* data-invalid turns the label red when there is an error */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="employee-name">
                  Name
                  <RequiredMark />
                </FieldLabel>
                <Input
                  id="employee-name"
                  aria-required
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="employee-email">
                  Email
                  <RequiredMark />
                </FieldLabel>
                <Input
                  id="employee-email"
                  type="email"
                  placeholder="e.g. name@school.com"
                  aria-required
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.roleId}>
                <FieldLabel htmlFor="employee-role">
                  Role
                  <RequiredMark />
                </FieldLabel>
                {/* Select is not a plain input, so Controller connects it to the form */}
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      items={roleItems}
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                    >
                      <SelectTrigger
                        id="employee-role"
                        aria-invalid={!!errors.roleId}
                        onBlur={field.onBlur}
                        className="w-full capitalize"
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleItems.map((item) => (
                          <SelectItem key={item.value} value={item.value} className="capitalize">
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.roleId && <FieldError>{errors.roleId.message}</FieldError>}
              </Field>

              {/* Checkbox is not a plain input either, so it also uses Controller */}
              <Field orientation="horizontal" className="md:self-end md:pb-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="employee-active"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  )}
                />
                <FieldLabel htmlFor="employee-active">Active (can log in)</FieldLabel>
              </Field>
            </div>
          </FieldSet>

          {/* Phones: full-width buttons stacked with the submit on top. From "sm" up: one row on the right. */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-w-24"
            >
              Cancel
            </Button>
            {/* aria-busy tells screen readers the form is being submitted */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Please wait..." : employee ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeCreatePage;
