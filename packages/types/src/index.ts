// ============================================
// ENUMS
// ============================================

export enum BotStatus {
  CREATING = 'creating',
  RUNNING = 'running',
  STOPPED = 'stopped',
  CRASHED = 'crashed',
  RESTARTING = 'restarting',
}

export enum BotRuntime {
  NODEJS = 'nodejs',
  PYTHON = 'python',
  JAVA = 'java',
  GO = 'go',
  RUST = 'rust',
}

export enum BotLibrary {
  DISCORDJS = 'discordjs',
  DISCORDPY = 'discordpy',
  PYCORD = 'pycord',
  NEXTCORD = 'nextcord',
  DISNAKE = 'disnake',
  JDA = 'jda',
  SERENITY = 'serenity',
  BLANK = 'blank',
}

export enum DeploymentType {
  INITIAL = 'initial',
  GITHUB = 'github',
  ZIP = 'zip',
  MANUAL = 'manual',
  REBUILD = 'rebuild',
}

export enum DeploymentStatus {
  PENDING = 'pending',
  BUILDING = 'building',
  DEPLOYING = 'deploying',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum NotificationType {
  BOT_STARTED = 'bot_started',
  BOT_STOPPED = 'bot_stopped',
  BOT_CRASHED = 'bot_crashed',
  BACKUP_COMPLETED = 'backup_completed',
  DEPLOYMENT_COMPLETED = 'deployment_completed',
  DEPLOYMENT_FAILED = 'deployment_failed',
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// ============================================
// DATABASE MODELS
// ============================================

export interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  isAdmin: boolean;
  isBanned: boolean;
  maxBots: number;
}

export interface Bot {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: BotStatus;
  runtime: BotRuntime;
  runtimeVersion: string;
  library: BotLibrary;
  templateId: string | null;
  containerId: string | null;
  containerName: string | null;
  port: number | null;
  envData: Record<string, string>;
  githubRepoId: string | null;
  autoDeploy: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastStartedAt: Date | null;
  lastStoppedAt: Date | null;
  uptimeSeconds: number;
  restartCount: number;
  cpuLimit: number;
  memoryLimit: number;
  diskLimit: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  runtime: BotRuntime;
  library: BotLibrary;
  version: string;
  dockerImage: string;
  buildCommand: string;
  startCommand: string;
  files: Record<string, string>;
  envVariables: Record<string, EnvVarSchema>;
  isPublic: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
}

export interface EnvVarSchema {
  required: boolean;
  description: string;
  secret: boolean;
  defaultValue?: string;
}

export interface GitHubRepo {
  id: string;
  userId: string;
  botId: string | null;
  githubRepoId: string;
  owner: string;
  name: string;
  branch: string;
  webhookSecret: string;
  lastCommitSha: string | null;
  lastDeployedAt: Date | null;
  connectedAt: Date;
  autoDeploy: boolean;
}

export interface Deployment {
  id: string;
  botId: string;
  type: DeploymentType;
  status: DeploymentStatus;
  commitSha: string | null;
  commitMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  errorMessage: string | null;
  buildLogs: string;
}

export interface Backup {
  id: string;
  botId: string;
  name: string;
  sizeBytes: number;
  storagePath: string;
  createdAt: Date;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  botId: string | null;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface EnvironmentVariable {
  id: string;
  botId: string;
  key: string;
  value: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  botId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Statistics {
  id: string;
  botId: string;
  timestamp: Date;
  cpuPercent: number;
  memoryMb: number;
  diskMb: number;
  networkRxMb: number;
  networkTxMb: number;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateBotDto {
  name: string;
  description?: string;
  runtime: BotRuntime;
  runtimeVersion: string;
  library: BotLibrary;
  templateId?: string;
}

export interface UpdateBotDto {
  name?: string;
  description?: string;
  envData?: Record<string, string>;
  autoDeploy?: boolean;
}

export interface CreateGitHubRepoDto {
  botId: string;
  owner: string;
  name: string;
  branch?: string;
  autoDeploy?: boolean;
}

export interface CreateBackupDto {
  name: string;
}

export interface CreateEnvironmentVariableDto {
  key: string;
  value: string;
  isSecret?: boolean;
}

export interface UpdateEnvironmentVariableDto {
  value: string;
  isSecret?: boolean;
}

export interface CreateTemplateDto {
  name: string;
  description: string;
  runtime: BotRuntime;
  library: BotLibrary;
  version: string;
  dockerImage: string;
  buildCommand: string;
  startCommand: string;
  files: Record<string, string>;
  envVariables: Record<string, EnvVarSchema>;
  isPublic?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  version?: string;
  dockerImage?: string;
  buildCommand?: string;
  startCommand?: string;
  files?: Record<string, string>;
  envVariables?: Record<string, EnvVarSchema>;
  isPublic?: boolean;
}

// ============================================
// WEBSOCKET EVENT TYPES
// ============================================

export interface BotStatusEvent {
  botId: string;
  status: BotStatus;
  timestamp: Date;
}

export interface BotStatsEvent {
  botId: string;
  cpuPercent: number;
  memoryMb: number;
  diskMb: number;
  networkRxMb: number;
  networkTxMb: number;
  timestamp: Date;
}

export interface ConsoleOutputEvent {
  botId: string;
  output: string;
  timestamp: Date;
}

export interface ConsoleInputEvent {
  botId: string;
  input: string;
}

export interface LogStreamEvent {
  botId: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
}

export interface NotificationEvent {
  userId: string;
  notification: Notification;
}

export interface DeploymentProgressEvent {
  botId: string;
  deploymentId: string;
  status: DeploymentStatus;
  progress: number;
  message: string;
}

export interface FileChangeEvent {
  botId: string;
  path: string;
  type: 'created' | 'modified' | 'deleted';
}

// ============================================
// FILE MANAGER TYPES
// ============================================

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedAt?: Date;
  children?: FileNode[];
}

export interface FileContent {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

export interface UploadFileDto {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

export interface MoveFileDto {
  from: string;
  to: string;
}

export interface CopyFileDto {
  from: string;
  to: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalBots: number;
  runningBots: number;
  stoppedBots: number;
  totalCpuUsage: number;
  totalMemoryUsage: number;
  totalStorageUsage: number;
  recentActivity: ActivityLog[];
  latestLogs: Array<{
    botId: string;
    botName: string;
    level: LogLevel;
    message: string;
    timestamp: Date;
  }>;
}

export interface PlatformStats {
  totalUsers: number;
  totalBots: number;
  activeBots: number;
  totalCpuUsage: number;
  totalMemoryUsage: number;
  totalStorageUsage: number;
  uptime: number;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// ERROR TYPES
// ============================================

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// CONFIG TYPES
// ============================================

export interface AppConfig {
  app: {
    name: string;
    url: string;
    port: number;
    env: 'development' | 'production' | 'test';
  };
  discord: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scopes: string[];
  };
  jwt: {
    secret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  docker: {
    socketPath: string;
    network: string;
  };
  storage: {
    type: 'local' | 's3';
    local?: {
      path: string;
    };
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  github: {
    webhookSecret: string;
    appId?: string;
    privateKey?: string;
  };
  limits: {
    maxBotsPerUser: number;
    maxCpuPerBot: number;
    maxMemoryPerBot: number;
    maxDiskPerBot: number;
  };
}

// ============================================
// UTILITIES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type OmitTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>;
