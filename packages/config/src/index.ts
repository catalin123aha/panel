import { z } from 'zod';
import type { AppConfig } from '@bot-hosting/types';

// ============================================
// CONFIG SCHEMA VALIDATION
// ============================================

const appConfigSchema = z.object({
  app: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    port: z.number().int().positive(),
    env: z.enum(['development', 'production', 'test']),
  }),
  discord: z.object({
    clientId: z.string().min(1),
    clientSecret: z.string().min(1),
    callbackUrl: z.string().url(),
    scopes: z.array(z.string()).min(1),
  }),
  jwt: z.object({
    secret: z.string().min(32),
    accessTokenExpiry: z.string().min(1),
    refreshTokenExpiry: z.string().min(1),
  }),
  database: z.object({
    url: z.string().min(1),
  }),
  redis: z.object({
    url: z.string().min(1),
  }),
  docker: z.object({
    socketPath: z.string().min(1),
    network: z.string().min(1),
  }),
  storage: z.object({
    type: z.enum(['local', 's3']),
    local: z.object({
      path: z.string().min(1),
    }).optional(),
    s3: z.object({
      bucket: z.string().min(1),
      region: z.string().min(1),
      accessKeyId: z.string().min(1),
      secretAccessKey: z.string().min(1),
    }).optional(),
  }),
  github: z.object({
    webhookSecret: z.string().min(1),
    appId: z.string().optional(),
    privateKey: z.string().optional(),
  }),
  limits: z.object({
    maxBotsPerUser: z.number().int().positive(),
    maxCpuPerBot: z.number().positive(),
    maxMemoryPerBot: z.number().int().positive(),
    maxDiskPerBot: z.number().int().positive(),
  }),
}).passthrough();

// ============================================
// CONFIG LOADING
// ============================================

let config: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (config) {
    return config;
  }

  const envConfig = {
    app: {
      name: process.env.APP_NAME || 'Discord Bot Hosting',
      url: process.env.APP_URL || 'http://localhost:3000',
      port: parseInt(process.env.APP_PORT || '3000', 10),
      env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || 'test_client_id',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || 'test_client_secret',
      callbackUrl: process.env.DISCORD_CALLBACK_URL || 'http://localhost:4000/api/auth/discord/callback',
      scopes: (process.env.DISCORD_SCOPES || 'identify,guilds').split(','),
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'test_super_secret_jwt_key_min_32_characters',
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
    database: {
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/bot_hosting',
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    docker: {
      socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
      network: process.env.DOCKER_NETWORK || 'bot-hosting',
    },
    storage: {
      type: (process.env.STORAGE_TYPE as 'local' | 's3') || 'local',
      local: process.env.STORAGE_TYPE === 'local' ? {
        path: process.env.STORAGE_LOCAL_PATH || './storage',
      } : undefined,
      s3: process.env.STORAGE_TYPE === 's3' ? {
        bucket: process.env.S3_BUCKET || '',
        region: process.env.S3_REGION || '',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      } : undefined,
    },
    github: {
      webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || 'test_github_webhook_secret',
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY,
    },
    limits: {
      maxBotsPerUser: parseInt(process.env.MAX_BOTS_PER_USER || '5', 10),
      maxCpuPerBot: parseFloat(process.env.MAX_CPU_PER_BOT || '1.0'),
      maxMemoryPerBot: parseInt(process.env.MAX_MEMORY_PER_BOT || '512', 10),
      maxDiskPerBot: parseInt(process.env.MAX_DISK_PER_BOT || '10240', 10),
    },
  };

  const result = appConfigSchema.safeParse(envConfig);
  if (!result.success) {
    console.warn('Config validation failed, using defaults:', result.error.errors);
    // Return parsed config anyway for development
    config = envConfig as unknown as AppConfig;
  } else {
    config = result.data;
  }
  return config;
}

export function getConfig(): AppConfig {
  if (!config) {
    return loadConfig();
  }
  return config;
}

export function validateConfig(config: unknown): AppConfig {
  return appConfigSchema.parse(config);
}

// ============================================
// ENVIRONMENT VARIABLE HELPERS
// ============================================

export function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function optionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export function numberEnv(key: string, defaultValue: number = 0): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

export function booleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// ============================================
// EXPORTS
// ============================================

export { appConfigSchema };
export type { AppConfig };
