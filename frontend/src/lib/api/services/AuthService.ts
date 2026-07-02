import { hybridCall } from "../hybrid";
import { apiRequest } from "../httpClient";

export type Role = "recruiter" | "candidate" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

const TOKEN_KEY = "tfai_access_token";
const SESSION_KEY = "tfai_mock_session";

function mockLogin(email: string, role: Role): AuthSession {
  const session: AuthSession = {
    user: { id: "mock-user-1", name: email.split("@")[0] || "User", email, role },
    accessToken: "mock-jwt-token",
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  return session;
}

export const AuthService = {
  async login(email: string, password: string, role: Role = "recruiter"): Promise<AuthSession> {
    return hybridCall(
      () => apiRequest<AuthSession>("/api/auth/login/", { method: "POST", body: JSON.stringify({ email, password }) }),
      () => mockLogin(email, role)
    );
  },

  async logout(): Promise<void> {
    return hybridCall(
      () => apiRequest<void>("/api/auth/logout/", { method: "POST" }),
      () => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    );
  },

  async restoreSession(): Promise<AuthSession | null> {
    return hybridCall(
      () => apiRequest<AuthSession>("/api/auth/session/"),
      () => {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as AuthSession) : null;
      }
    );
  },
};
