import z from 'zod';
import { EnvironmentConfig } from './config.types';

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const port = (defaultValue?: number) => {
  const schema = z.coerce.number().int().min(1).max(65_535);

  return defaultValue === undefined ? schema : schema.default(defaultValue);
};

const environmentSchema = z.object({
  APP_VERSION: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, { error: 'APP_VERSION must be in the format major.minor.patch (e.g. 1.0.0)' })
    .default('0.0.0'),

  TORI_GCORE: z.string().trim().min(1),
  TORI_GCORE_RAMEN: z.string().trim().min(1),
  TORI_GCORE_PROJECT: z.string().trim().min(1),

  TORI_SERVER_PORT: port(3000),

  TORI_DB_HOST: z.string().trim().min(1),
  TORI_DB_PASSWORD: z.string().min(1),
  TORI_DB_PORT: port(),
  TORI_DB_USER: z.string().trim().min(1),
  TORI_DB_SCHEME: z.enum(['neo4j', 'neo4j+s', 'bolt', 'bolt+s']),
  TORI_DB_NAME: z.string().trim().min(1).default('neo4j'),

  TORI_CAMI_HOST: optionalString.pipe(z.url().optional()),
});

export function configuration(): EnvironmentConfig {
  const result = environmentSchema.safeParse(process.env);

  if (!result.success) {
    const errors = z.prettifyError(result.error);

    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  const env = result.data;

  return {
    gcore: {
      default: env.TORI_GCORE,
      ramen: env.TORI_GCORE_RAMEN,
      project: env.TORI_GCORE_PROJECT,
    },

    server: {
      port: env.TORI_SERVER_PORT,
      version: env.APP_VERSION,
    },

    database: {
      host: env.TORI_DB_HOST,
      password: env.TORI_DB_PASSWORD,
      port: env.TORI_DB_PORT,
      username: env.TORI_DB_USER,
      scheme: env.TORI_DB_SCHEME,
      database: env.TORI_DB_NAME,
    },

    cami: {
      host: env.TORI_CAMI_HOST,
    },
  };
}
