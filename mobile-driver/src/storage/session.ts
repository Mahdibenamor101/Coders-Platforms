import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "driver_token";
const BASE_URL_KEY = "api_base_url";

export type Session = { token: string; baseUrl: string };

export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, session.token);
  await SecureStore.setItemAsync(BASE_URL_KEY, session.baseUrl);
}

export async function getSession(): Promise<Session | null> {
  const [token, baseUrl] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(BASE_URL_KEY),
  ]);
  if (!token || !baseUrl) return null;
  return { token, baseUrl };
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(BASE_URL_KEY),
  ]);
}
