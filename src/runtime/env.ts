/**
 * Check if the specified environment variable is set and is not empty.
 *
 * @param envVarName the name of the environment variable
 * @return true if the environment variable is set and not empty
 */
export function envExists(envVarName: string) {
  return (Deno.env.get(envVarName) ?? "").trim() !== "";
}

/**
 * Check if the specified environment variable is unset or is empty.
 *
 * @param envVarName the name of the environment variable
 * @return true if the environment variable is unset or is empty
 */
export function envMissing(envVarName: string) {
  return (Deno.env.get(envVarName) ?? "").trim() === "";
}
