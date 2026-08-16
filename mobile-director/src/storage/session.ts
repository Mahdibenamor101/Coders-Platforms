import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "director_token";
const BASE_URL_KEY = "director_api_base_url";
const USER_KEY = "director_user";

export type StoredUser = { name: string; email: string; role: string; companyName: string };
export type Session = { token: string; baseUrl: string; user: StoredUser };

export async function saveSession(session: Session): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, session.token),
    SecureStore.setItemAsync(BASE_URL_KEY, session.baseUrl),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function getSession(): Promise<Session | null> {
  const [token, baseUrl, userJson] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(BASE_URL_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);
  if (!token || !baseUrl || !userJson) return null;
  try {
    return { token, baseUrl, user: JSON.parse(userJson) as StoredUser };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(BASE_URL_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
