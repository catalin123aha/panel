import axios, { AxiosInstance, AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import type {
  Bot,
  Template,
  GitHubRepo,
  Deployment,
  Backup,
  EnvironmentVariable,
  Notification,
  Statistics,
  DashboardStats,
  CreateBotDto,
  UpdateBotDto,
  CreateGitHubRepoDto,
  CreateBackupDto,
  CreateEnvironmentVariableDto,
  UpdateEnvironmentVariableDto,
  PaginatedResponse,
  PaginationOptions,
  BotStatusEvent,
  BotStatsEvent,
  ConsoleOutputEvent,
  NotificationEvent,
  DeploymentProgressEvent,
  ApiError,
} from '@bot-hosting/types';

// ============================================
// SDK CONFIGURATION
// ============================================

export interface SdkConfig {
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
  accessToken?: string;
  timeout?: number;
}

// ============================================
// API CLIENT
// ============================================

export class BotHostingSDK {
  private client: AxiosInstance;
  private socket: Socket | null = null;
  private config: SdkConfig;

  constructor(config: SdkConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      if (this.config.apiKey) {
        config.headers['X-API-Key'] = this.config.apiKey;
      }
      if (this.config.accessToken) {
        config.headers['Authorization'] = `Bearer ${this.config.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.data) {
          throw new SdkError(
            error.response.data.message || 'Request failed',
            error.response.status,
            error.response.data.error,
            error.response.data.details,
          );
        }
        throw new SdkError(error.message || 'Request failed', error.response?.status || 500);
      },
    );
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  setAccessToken(accessToken: string): void {
    this.config.accessToken = accessToken;
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async getDiscordAuthUrl(): Promise<string> {
    const response = await this.client.get<{ url: string }>('/api/auth/discord/login');
    return response.data.url;
  }

  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    const response = await this.client.post('/api/auth/discord/callback', { code });
    return response.data;
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const response = await this.client.post('/api/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/auth/logout');
    this.config.accessToken = undefined;
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // ============================================
  // BOTS
  // ============================================

  async listBots(options?: PaginationOptions): Promise<PaginatedResponse<Bot>> {
    const response = await this.client.get('/api/bots', { params: options });
    return response.data;
  }

  async getBot(id: string): Promise<Bot> {
    const response = await this.client.get(`/api/bots/${id}`);
    return response.data;
  }

  async createBot(data: CreateBotDto): Promise<Bot> {
    const response = await this.client.post('/api/bots', data);
    return response.data;
  }

  async updateBot(id: string, data: UpdateBotDto): Promise<Bot> {
    const response = await this.client.put(`/api/bots/${id}`, data);
    return response.data;
  }

  async deleteBot(id: string): Promise<void> {
    await this.client.delete(`/api/bots/${id}`);
  }

  async startBot(id: string): Promise<void> {
    await this.client.post(`/api/bots/${id}/start`);
  }

  async stopBot(id: string): Promise<void> {
    await this.client.post(`/api/bots/${id}/stop`);
  }

  async restartBot(id: string): Promise<void> {
    await this.client.post(`/api/bots/${id}/restart`);
  }

  async killBot(id: string): Promise<void> {
    await this.client.post(`/api/bots/${id}/kill`);
  }

  async reinstallBot(id: string): Promise<void> {
    await this.client.post(`/api/bots/${id}/reinstall`);
  }

  async rebuildBot(id: string): Promise<void> {
    await this.client.post(`/api/bots/${id}/rebuild`);
  }

  async cloneBot(id: string, name: string): Promise<Bot> {
    const response = await this.client.post(`/api/bots/${id}/clone`, { name });
    return response.data;
  }

  async getBotStats(id: string): Promise<Statistics[]> {
    const response = await this.client.get(`/api/bots/${id}/stats`);
    return response.data;
  }

  async getBotLogs(id: string, limit?: number): Promise<string[]> {
    const response = await this.client.get(`/api/bots/${id}/logs`, { params: { limit } });
    return response.data;
  }

  // ============================================
  // FILES
  // ============================================

  async listFiles(botId: string, path: string = '/'): Promise<any[]> {
    const response = await this.client.get(`/api/bots/${botId}/files`, { params: { path } });
    return response.data;
  }

  async readFile(botId: string, path: string): Promise<{ content: string; encoding: string }> {
    const response = await this.client.get(`/api/bots/${botId}/files/${encodeURIComponent(path)}`);
    return response.data;
  }

  async writeFile(botId: string, path: string, content: string, encoding?: string): Promise<void> {
    await this.client.put(`/api/bots/${botId}/files/${encodeURIComponent(path)}`, {
      content,
      encoding,
    });
  }

  async createFile(botId: string, path: string, type: 'file' | 'directory'): Promise<void> {
    await this.client.post(`/api/bots/${botId}/files`, { path, type });
  }

  async deleteFile(botId: string, path: string): Promise<void> {
    await this.client.delete(`/api/bots/${botId}/files/${encodeURIComponent(path)}`);
  }

  async moveFile(botId: string, from: string, to: string): Promise<void> {
    await this.client.post(`/api/bots/${botId}/files/move`, { from, to });
  }

  async copyFile(botId: string, from: string, to: string): Promise<void> {
    await this.client.post(`/api/bots/${botId}/files/copy`, { from, to });
  }

  async uploadFile(botId: string, path: string, content: string): Promise<void> {
    await this.client.post(`/api/bots/${botId}/files/upload`, { path, content });
  }

  async downloadFile(botId: string, path: string): Promise<Blob> {
    const response = await this.client.get(`/api/bots/${botId}/files/download/${encodeURIComponent(path)}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async uploadZip(botId: string, zipData: string): Promise<void> {
    await this.client.post(`/api/bots/${botId}/files/zip`, { zipData });
  }

  // ============================================
  // ENVIRONMENT VARIABLES
  // ============================================

  async listEnvVars(botId: string): Promise<EnvironmentVariable[]> {
    const response = await this.client.get(`/api/bots/${botId}/env`);
    return response.data;
  }

  async createEnvVar(botId: string, data: CreateEnvironmentVariableDto): Promise<EnvironmentVariable> {
    const response = await this.client.post(`/api/bots/${botId}/env`, data);
    return response.data;
  }

  async updateEnvVar(botId: string, key: string, data: UpdateEnvironmentVariableDto): Promise<EnvironmentVariable> {
    const response = await this.client.put(`/api/bots/${botId}/env/${key}`, data);
    return response.data;
  }

  async deleteEnvVar(botId: string, key: string): Promise<void> {
    await this.client.delete(`/api/bots/${botId}/env/${key}`);
  }

  // ============================================
  // GITHUB
  // ============================================

  async connectGitHub(data: CreateGitHubRepoDto): Promise<GitHubRepo> {
    const response = await this.client.post('/api/github/connect', data);
    return response.data;
  }

  async listGitHubRepos(): Promise<GitHubRepo[]> {
    const response = await this.client.get('/api/github/repos');
    return response.data;
  }

  async disconnectGitHub(id: string): Promise<void> {
    await this.client.delete(`/api/github/${id}`);
  }

  async pullGitHub(id: string): Promise<Deployment> {
    const response = await this.client.post(`/api/github/${id}/pull`);
    return response.data;
  }

  async listDeployments(botId: string): Promise<Deployment[]> {
    const response = await this.client.get(`/api/github/${botId}/deployments`);
    return response.data;
  }

  // ============================================
  // TEMPLATES
  // ============================================

  async listTemplates(runtime?: string, library?: string): Promise<Template[]> {
    const response = await this.client.get('/api/templates', {
      params: { runtime, library },
    });
    return response.data;
  }

  async getTemplate(id: string): Promise<Template> {
    const response = await this.client.get(`/api/templates/${id}`);
    return response.data;
  }

  // ============================================
  // BACKUPS
  // ============================================

  async listBackups(botId: string): Promise<Backup[]> {
    const response = await this.client.get(`/api/bots/${botId}/backups`);
    return response.data;
  }

  async createBackup(botId: string, data: CreateBackupDto): Promise<Backup> {
    const response = await this.client.post(`/api/bots/${botId}/backups`, data);
    return response.data;
  }

  async restoreBackup(botId: string, backupId: string): Promise<void> {
    await this.client.post(`/api/bots/${botId}/backups/${backupId}/restore`);
  }

  async deleteBackup(botId: string, backupId: string): Promise<void> {
    await this.client.delete(`/api/bots/${botId}/backups/${backupId}`);
  }

  async downloadBackup(botId: string, backupId: string): Promise<Blob> {
    const response = await this.client.get(`/api/bots/${botId}/backups/${backupId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ============================================
  // STATISTICS
  // ============================================

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get('/api/stats/dashboard');
    return response.data;
  }

  async getBotHistoricalStats(botId: string, from?: Date, to?: Date): Promise<Statistics[]> {
    const response = await this.client.get(`/api/stats/bots/${botId}`, {
      params: { from, to },
    });
    return response.data;
  }

  async getPlatformStats(): Promise<any> {
    const response = await this.client.get('/api/stats/usage');
    return response.data;
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async listNotifications(): Promise<Notification[]> {
    const response = await this.client.get('/api/notifications');
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.client.put(`/api/notifications/${id}/read`);
  }

  async deleteNotification(id: string): Promise<void> {
    await this.client.delete(`/api/notifications/${id}`);
  }

  // ============================================
  // WEBSOCKET
  // ============================================

  connectWebSocket(): Socket {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(this.config.wsUrl, {
      auth: {
        apiKey: this.config.apiKey,
        accessToken: this.config.accessToken,
      },
    });

    return this.socket;
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onBotStatus(callback: (event: BotStatusEvent) => void): void {
    const socket = this.connectWebSocket();
    socket.on('bot:status', callback);
  }

  onBotStats(callback: (event: BotStatsEvent) => void): void {
    const socket = this.connectWebSocket();
    socket.on('bot:stats', callback);
  }

  onConsoleOutput(callback: (event: ConsoleOutputEvent) => void): void {
    const socket = this.connectWebSocket();
    socket.on('console:output', callback);
  }

  onNotification(callback: (event: NotificationEvent) => void): void {
    const socket = this.connectWebSocket();
    socket.on('notification:new', callback);
  }

  onDeploymentProgress(callback: (event: DeploymentProgressEvent) => void): void {
    const socket = this.connectWebSocket();
    socket.on('deployment:progress', callback);
  }

  sendConsoleInput(botId: string, input: string): void {
    const socket = this.connectWebSocket();
    socket.emit('console:input', { botId, input });
  }

  // ============================================
  // ADMIN
  // ============================================

  async listAdminUsers(options?: PaginationOptions): Promise<PaginatedResponse<any>> {
    const response = await this.client.get('/api/admin/users', { params: options });
    return response.data;
  }

  async getAdminUser(id: string): Promise<any> {
    const response = await this.client.get(`/api/admin/users/${id}`);
    return response.data;
  }

  async banUser(id: string): Promise<void> {
    await this.client.put(`/api/admin/users/${id}/ban`);
  }

  async unbanUser(id: string): Promise<void> {
    await this.client.put(`/api/admin/users/${id}/unban`);
  }

  async listAdminBots(options?: PaginationOptions): Promise<PaginatedResponse<Bot>> {
    const response = await this.client.get('/api/admin/bots', { params: options });
    return response.data;
  }

  async deleteAdminBot(id: string): Promise<void> {
    await this.client.delete(`/api/admin/bots/${id}`);
  }

  async getAdminStats(): Promise<any> {
    const response = await this.client.get('/api/admin/stats');
    return response.data;
  }

  async getActivityLogs(options?: PaginationOptions): Promise<PaginatedResponse<any>> {
    const response = await this.client.get('/api/admin/activity-logs', { params: options });
    return response.data;
  }
}

// ============================================
// SDK ERROR
// ============================================

export class SdkError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'SdkError';
  }
}

// ============================================
// EXPORTS
// ============================================

export default BotHostingSDK;
