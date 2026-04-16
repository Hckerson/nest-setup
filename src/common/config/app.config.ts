import * as z from "zod";
const envSchema = z.object({
  PORT: z.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment variables \n",
    "=======   Missing vars   ======= \n",
    result.error.issues.map((issue) => issue.message).join("\n"),
  );
  throw new Error("Invalid environment variables");
}

export const appConfig = {
  port: result.data.PORT,
  nodeEnv: result.data.NODE_ENV,
  isDevelopment: result.data.NODE_ENV === "development",
  isProduction: result.data.NODE_ENV === "production",
};

export type Config = typeof appConfig;
