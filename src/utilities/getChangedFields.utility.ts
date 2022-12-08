import { updatedDiff } from "deep-object-diff";

export const getChangedFields = <T>(formValues: T, initialValues: T) =>
  updatedDiff(initialValues as any, formValues as any);
