import BotHostingSDK from '@bot-hosting/sdk';

const sdk = new BotHostingSDK({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
});

export async function getDiscordAuthUrl() {
  const response = await sdk.getDiscordAuthUrl();
  return response.url;
}

export async function exchangeCodeForTokens(code: string, state: string) {
  return sdk.exchangeCodeForTokens(code, state);
}

export async function refreshAccessToken(refreshToken: string) {
  return sdk.refreshTokens(refreshToken);
}

export async function logout(accessToken: string) {
  sdk.setAccessToken(accessToken);
  return sdk.logout();
}

export async function getCurrentUser(accessToken: string) {
  sdk.setAccessToken(accessToken);
  return sdk.getCurrentUser();
}

export default sdk;
