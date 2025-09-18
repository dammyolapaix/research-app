import { z } from "zod";
import { getFormData } from "./utils";

/**
 * The following code is a middleware that validates the user input for a form in a server action.
 * It is used to ensure that the user input is valid before the action is executed.
 */

type FormState<State> = {
  errors?: {
    [Key in keyof State]?: string[];
  };
  error?: string;
  success?: string;
  state?: State;
};

type ValidatedActionFunction<State> = (
  state: State,
  formData: FormData
) => Promise<FormState<State>>;

/**
 * This function is used to validate the user input for a form in a server action. (For uncontrolled forms (FormData))
 *
 * @param schema - The schema to validate the user input against.
 * @param action - The action to execute after the user input is validated.
 * @returns The result of the action.
 *
 */
export function validatedAction<Schema extends z.ZodType<State>, State>(
  schema: Schema,
  action: ValidatedActionFunction<State>
) {
  return async (
    prevState: FormState<State>,
    formData: FormData
  ): Promise<FormState<State>> => {
    // Get the form data from the form data object
    const state = getFormData(formData) as State;

    // Validate the state
    const result = schema.safeParse(state);

    // If the state is invalid, return the errors
    if (!result.success) {
      console.log("result", result.error.flatten().fieldErrors);
      return {
        state,
        errors: result.error.flatten()
          .fieldErrors as FormState<State>["errors"],
      };
    }

    // If the state is valid, execute the action
    return action(result.data, formData);
  };
}
