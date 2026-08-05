import BotHostingSDK from '@bot-hosting/sdk';

export const sdk = new BotHostingSDK({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
});

export async function getDiscordAuthUrl() {
  try {
    const response = await sdk.getDiscordAuthUrl();
    return response.url;
  } catch (error) {
    console.error('getDiscordAuthUrl error:', error);
    throw error;
  }
}

export async function exchangeCodeForTokens(code: string, state: string) {
  try {
    return await sdk.exchangeCodeForTokens(code);
  } catch (error) {
    console.error('exchangeCodeForTokens error:', error);
    throw error;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    return await sdk.refreshTokens(refreshToken);
  } catch (error) {
    console.error('refreshAccessToken error:', error);
    throw error;
  }
}

export async function logout(accessToken: string) {
  try {
    sdk.setAccessToken(accessToken);
    return await sdk.logout();
  } catch (error) {
    console.error('logout error:', error);
    throw error;
  }
}

export async function getCurrentUser(accessToken: string) {
  try {
    sdk.setAccessToken(accessToken);
    return await sdk.getCurrentUser();
  } catch (error) {
    console.error('getCurrentUser error:', error);
    throw error;
  }
}
