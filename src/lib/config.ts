import { z } from "zod";
import "dotenv/config";

const enVars = z.object({
  PORT: z.coerce.number().default(3000),
});

const _env = enVars.safeParse(process.env);

if (!_env.success) {
  console.error(
    "Invalid environment variables \n",
    "=======   Missing vars   ======= \n",
    _env.error.issues.map((issue) => issue.message).join("\n"),
  );
  throw new Error("Invalid environment variables");
}

export const config = {
  port: _env.data.PORT,
};

export type Config = typeof config;
