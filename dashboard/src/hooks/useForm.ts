import { useState } from "react";
import type { ChangeEvent } from "react";

export function useForm<T>(
  initialValues: T,
  validators: Partial<Record<keyof T, (value: string) => string | null>>,
) {
  const [values, setValues] = useState<T>(initialValues);

  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const validator = validators[name as keyof T];
    const error = validator ? validator(value) : null;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: error ?? undefined,
    }));
  };

  const isValid =
    Object.values(errors).every((e) => !e) &&
    Object.keys(validators).every((key) => {
      const val = values[key as keyof T];
      const validate = validators[key as keyof T];
      return validate ? !validate(String(val ?? "")) : true;
    });

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };
  return {
    values,
    errors,
    handleChange,
    isValid,
    reset,
  };
}
