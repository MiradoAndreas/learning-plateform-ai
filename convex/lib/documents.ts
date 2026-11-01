import { v, type Validator } from "convex/values";
import type { Doc, TableNames } from "../_generated/dataModel";
import schema from "../schema";

/** Build response validators from the table definition, including system fields. */
export function documentValidator<T extends TableNames>(
  table: T,
): Validator<Doc<T>> {
  return v.object({
    ...schema.tables[table].validator.fields,
    _id: v.id(table),
    _creationTime: v.number(),
  }) as unknown as Validator<Doc<T>>;
}
