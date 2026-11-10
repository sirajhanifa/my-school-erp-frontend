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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { roleSchema, type RoleFormValues } from "../../../schemas/roleSchema";
import { FULL_ACCESS_ROLE, useRoleStore, type Role } from "../../../store/roleStore";

interface RoleCreatePageProps {
  // The role being edited; null = add a new role
  role: Role | null;
  // Called after a successful save or on Cancel, to go back to the list
  onClose: () => void;
}

// The Add / Edit Role form. Opened from RoleListPage.
const RoleCreatePage = ({ role, onClose }: RoleCreatePageProps) => {
  const createRole = useRoleStore((state) => state.createRole);
  const updateRole = useRoleStore((state) => state.updateRole);
  const allModules = useRoleStore((state) => state.allModules);
  const isModulesLoading = useRoleStore((state) => state.isModulesLoading);
  const fetchAllModules = useRoleStore((state) => state.fetchAllModules);

  // The superadmin role always has full access, so it has no module checkboxes and keeps its name
  const isFullAccessRole = role?.name === FULL_ACCESS_ROLE;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    // Edit: start with the role's values. Add: start empty.
    defaultValues: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      modules: role?.modules ?? [],
    },
  });

  // Load the school's full menu for the checkboxes
  useEffect(() => {
    fetchAllModules();
  }, [fetchAllModules]);

  // The store shows the toast and updates the list; we only close the form when it worked
  const onSubmit = async (values: RoleFormValues) => {
    // Drop codes of menus that no longer exist, so an old saved code doesn't block the save
    const menuCodes = allModules.flatMap((menu) => [menu.code, ...menu.subMenus.map((sub) => sub.code)]);
    const cleanValues = { ...values, modules: values.modules.filter((code) => menuCodes.includes(code)) };

    const success = role ? await updateRole(role.id, cleanValues) : await createRole(cleanValues);

    if (success) onClose();
  };

  return (
    // max-w-none: the form fills the content area instead of a narrow centred card
    <Card className="mx-auto w-full max-w-none gap-0 py-0">
      <CardHeader className="border-b px-4 py-5 sm:px-8">
        <CardTitle className="text-lg font-semibold">{role ? "Edit Role" : "Add Role"}</CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-6 sm:px-8">
        {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          <FieldSet className="border-t pt-8 first:border-t-0 first:pt-0">
            <FieldLegend className="font-semibold">Role Details</FieldLegend>
            <FieldDescription>Basic information about the role.</FieldDescription>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              {/* data-invalid turns the label red when there is an error */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="role-name">
                  Name
                  <span className="-ml-1.5 text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                {/* readOnly (not disabled) for superadmin, so the name is still sent with the form */}
                <Input
                  id="role-name"
                  placeholder="e.g. receptionist"
                  readOnly={isFullAccessRole}
                  aria-required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "role-name-error" : undefined}
                  {...register("name")}
                />
                {errors.name && <FieldError id="role-name-error">{errors.name.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.description} className="md:col-span-2">
                <FieldLabel htmlFor="role-description">Description</FieldLabel>
                <Textarea
                  id="role-description"
                  rows={6}
                  placeholder="Optional"
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "role-description-error" : undefined}
                  className="resize-y"
                  {...register("description")}
                />
                {errors.description && (
                  <FieldError id="role-description-error">{errors.description.message}</FieldError>
                )}
              </Field>
            </div>
          </FieldSet>

          <FieldSet className="border-t pt-8">
            <FieldLegend className="font-semibold">Module Access</FieldLegend>
            <FieldDescription>
              Employees with this role can only open the modules ticked here.
            </FieldDescription>

            {isFullAccessRole ? (
              <p className="text-sm text-muted-foreground">
                The superadmin role always has access to every module.
              </p>
            ) : isModulesLoading ? (
              <Spinner className="size-5 text-muted-foreground" />
            ) : (
              // The checkboxes are not plain inputs, so Controller connects the list to the form
              <Controller
                name="modules"
                control={control}
                render={({ field }) => {
                  // Ticking adds the code to the list, unticking removes it
                  const toggle = (code: string, checked: boolean) =>
                    field.onChange(
                      checked ? [...field.value, code] : field.value.filter((item) => item !== code),
                    );

                  return (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {allModules.map((menu) => {
                        // A link like Dashboard is one checkbox; a group lists its submenus
                        const items = menu.subMenus.length > 0 ? menu.subMenus : [menu];

                        return (
                          <div key={menu.id} className="space-y-3 rounded-lg border p-4">
                            <p className="text-sm font-semibold text-slate-900">{menu.name}</p>
                            {items.map((item) => (
                              <Field key={item.id} orientation="horizontal">
                                <Checkbox
                                  id={`module-${item.code}`}
                                  checked={field.value.includes(item.code)}
                                  onCheckedChange={(checked) => toggle(item.code, checked)}
                                />
                                <FieldLabel htmlFor={`module-${item.code}`} className="font-normal">
                                  {item.name}
                                </FieldLabel>
                              </Field>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
            )}

            {errors.modules && <FieldError>{errors.modules.message}</FieldError>}
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
              {isSubmitting ? "Please wait..." : role ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RoleCreatePage;
