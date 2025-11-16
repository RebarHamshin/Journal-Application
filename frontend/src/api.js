const API_BASE = "/api"; //Nginx in docker sends all api calls to backend

export function setSession({ token, user }) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}
export function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}
export function currentUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
}
export function getToken() {
    return localStorage.getItem("token");
}

// Auth endpoints
export const AuthApi = {
    login: (username, password) =>
        fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        }).then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
            return r.json(); // { token, user: {...} }
        }),
    me: () =>
        fetch(`${API_BASE}/auth/me`, {
            headers: { "X-Auth": getToken() || "" },
        }).then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
            return r.json();
        }),
    register: (payload) =>
        fetch(`/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
            return r.json(); // { id, username, role }
        }),
};

// Helper to automatically add X-Auth
export async function authFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getToken();
    if (token) headers.set("X-Auth", token);
    return fetch(`${API_BASE}${path}`, { ...options, headers });
}

