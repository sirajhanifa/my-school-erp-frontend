import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { GENDERS, studentSchema, type StudentFormValues } from "../../../schemas/studentSchema";
import { useClassStore } from "../../../store/classStore";
import { useSectionStore } from "../../../store/sectionStore";
import { useStudentStore, type Student } from "../../../store/studentStore";
import { getTodayDateString } from "../../../utils/date";
import { RequiredMark } from "@/components/ui/required-mark";

interface StudentCreatePageProps {
  // The student being edited; null = add a new student
  student: Student | null;
  // Called after a successful save or on Cancel, to go back to the list
  onClose: () => void;
}

// The Add / Edit Student form. Opened from StudentListPage.
const StudentCreatePage = ({ student, onClose }: StudentCreatePageProps) => {
  const createStudent = useStudentStore((state) => state.createStudent);
  const updateStudent = useStudentStore((state) => state.updateStudent);

  // The class and section dropdown options come from their existing stores
  const classes = useClassStore((state) => state.classes);
  const fetchClasses = useClassStore((state) => state.fetchClasses);
  const sections = useSectionStore((state) => state.sections);
  const fetchSections = useSectionStore((state) => state.fetchSections);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    // Edit: start with the student's values. Add: start empty.
    defaultValues: {
      admissionNo: student?.admissionNo ?? "",
      firstName: student?.firstName ?? "",
      lastName: student?.lastName ?? "",
      gender: student?.gender ?? "",
      dateOfBirth: student?.dateOfBirth ?? "",
      classId: student?.classId ?? "",
      sectionId: student?.sectionId ?? "",
      guardianName: student?.guardianName ?? "",
      phone: student?.phone ?? "",
      address: student?.address ?? "",
    },
  });

  // Load the dropdown options when the form opens
  useEffect(() => {
    fetchClasses();
    fetchSections();
  }, [fetchClasses, fetchSections]);

  // "items" tells each Select which label to show for the selected value
  const classItems = classes.map((cls) => ({ label: cls.name, value: cls.id }));
  const sectionItems = sections.map((section) => ({ label: section.name, value: section.id }));
  const genderItems = GENDERS.map((gender) => ({ label: gender, value: gender }));

  // The store shows the toast and updates the list; we only close the form when it worked
  const onSubmit = async (values: StudentFormValues) => {
    const success = student
      ? await updateStudent(student.id, values)
      : await createStudent(values);

    if (success) onClose();
  };

  return (
    // max-w-none: the form fills the content area instead of a narrow centred card
    <Card className="mx-auto w-full max-w-none gap-0 py-0">
      <CardHeader className="border-b px-4 py-5 sm:px-8">
        <CardTitle className="text-lg font-semibold">
          {student ? "Edit Student" : "Add Student"}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-6 sm:px-8">
        {/* noValidate: validation is handled by Zod, not the browser's built-in popups */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          {/* ---------- Student Details ---------- */}
          <FieldSet className="border-t pt-8 first:border-t-0 first:pt-0">
            <FieldLegend className="font-semibold">Student Details</FieldLegend>
            <FieldDescription>Basic information about the student.</FieldDescription>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              {/* data-invalid turns the label red when there is an error */}
              <Field data-invalid={!!errors.admissionNo}>
                <FieldLabel htmlFor="student-admission-no">
                  Admission No
                  <RequiredMark />
                </FieldLabel>
                <Input
                  id="student-admission-no"
                  placeholder="e.g. 1001"
                  aria-required
                  aria-invalid={!!errors.admissionNo}
                  {...register("admissionNo")}
                />
                {errors.admissionNo && <FieldError>{errors.admissionNo.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.gender}>
                <FieldLabel htmlFor="student-gender">
                  Gender
                  <RequiredMark />
                </FieldLabel>
                {/* Select is not a plain input, so Controller connects it to the form */}
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      items={genderItems}
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                    >
                      <SelectTrigger
                        id="student-gender"
                        aria-invalid={!!errors.gender}
                        onBlur={field.onBlur}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && <FieldError>{errors.gender.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.firstName}>
                <FieldLabel htmlFor="student-first-name">
                  First Name
                  <RequiredMark />
                </FieldLabel>
                <Input
                  id="student-first-name"
                  aria-required
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                {errors.firstName && <FieldError>{errors.firstName.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.lastName}>
                <FieldLabel htmlFor="student-last-name">Last Name</FieldLabel>
                <Input
                  id="student-last-name"
                  placeholder="Optional"
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                {errors.lastName && <FieldError>{errors.lastName.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.dateOfBirth}>
                <FieldLabel htmlFor="student-dob">
                  Date of Birth
                  <RequiredMark />
                </FieldLabel>
                {/* The browser's date picker; its value is "YYYY-MM-DD" */}
                <Input
                  id="student-dob"
                  type="date"
                  max={getTodayDateString()}
                  aria-required
                  aria-invalid={!!errors.dateOfBirth}
                  {...register("dateOfBirth")}
                />
                {errors.dateOfBirth && <FieldError>{errors.dateOfBirth.message}</FieldError>}
              </Field>
            </div>
          </FieldSet>

          {/* ---------- Class & Section ---------- */}
          <FieldSet className="border-t pt-8">
            <FieldLegend className="font-semibold">Class &amp; Section</FieldLegend>
            <FieldDescription>The class and section the student studies in.</FieldDescription>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <Field data-invalid={!!errors.classId}>
                <FieldLabel htmlFor="student-class">
                  Class
                  <RequiredMark />
                </FieldLabel>
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      items={classItems}
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                    >
                      <SelectTrigger
                        id="student-class"
                        aria-invalid={!!errors.classId}
                        onBlur={field.onBlur}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && <FieldError>{errors.classId.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.sectionId}>
                <FieldLabel htmlFor="student-section">
                  Section
                  <RequiredMark />
                </FieldLabel>
                <Controller
                  name="sectionId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      items={sectionItems}
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                    >
                      <SelectTrigger
                        id="student-section"
                        aria-invalid={!!errors.sectionId}
                        onBlur={field.onBlur}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sectionId && <FieldError>{errors.sectionId.message}</FieldError>}
              </Field>
            </div>
          </FieldSet>

          {/* ---------- Guardian & Contact ---------- */}
          <FieldSet className="border-t pt-8">
            <FieldLegend className="font-semibold">Guardian &amp; Contact</FieldLegend>
            <FieldDescription>Who to contact about the student.</FieldDescription>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <Field data-invalid={!!errors.guardianName}>
                <FieldLabel htmlFor="student-guardian">Guardian Name</FieldLabel>
                <Input
                  id="student-guardian"
                  placeholder="Optional"
                  aria-invalid={!!errors.guardianName}
                  {...register("guardianName")}
                />
                {errors.guardianName && <FieldError>{errors.guardianName.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="student-phone">Phone</FieldLabel>
                <Input
                  id="student-phone"
                  type="tel"
                  placeholder="Optional"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.address} className="md:col-span-2">
                <FieldLabel htmlFor="student-address">Address</FieldLabel>
                <Textarea
                  id="student-address"
                  rows={4}
                  placeholder="Optional"
                  aria-invalid={!!errors.address}
                  className="resize-y"
                  {...register("address")}
                />
                {errors.address && <FieldError>{errors.address.message}</FieldError>}
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
              {isSubmitting ? "Please wait..." : student ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentCreatePage;
