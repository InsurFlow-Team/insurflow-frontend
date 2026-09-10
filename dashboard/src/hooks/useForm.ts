import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";

export function useForm<T>(
  initialValues: T,
  validators: Partial<Record<keyof T, (value: string) => string | null>>,
) {
  const [values, setValues] = useState<T>(initialValues);

  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // Both callbacks are memoized so consuming effects that depend on them (e.g.
  // resetting a form when a modal closes) never re-run purely because the hook
  // re-rendered — otherwise a closed modal spins in a "Maximum update depth
  // exceeded" loop. Callers should pass referentially stable initialValues and
  // validators (module-level constants) so these stay stable too.
  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      const { name, value } = e.target;
      const validator = validators[name as keyof T];
      const error = validator ? validator(value) : null;

      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      setErrors((prev) => {
        const next = { ...prev };

        if (error) {
          next[name as keyof T] = error;
        } else {
          delete next[name as keyof T];
        }

        return next;
      });
    },
    [validators],
  );

  const isValid =
    Object.values(errors).every((e) => !e) &&
    Object.keys(validators).every((key) => {
      const val = values[key as keyof T];
      const validate = validators[key as keyof T];
      return validate ? !validate(String(val ?? "")) : true;
    });

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    handleChange,
    isValid,
    reset,
  };
}
