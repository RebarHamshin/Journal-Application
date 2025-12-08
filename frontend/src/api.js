// src/api.js

// Ingen localhost här – bara relativa vägar
const API_BASE = "/api";


// --- Session helpers ---

export function currentUser() {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
}

// --- authFetch: lägger på X-Auth-token ---

export async function authFetch(path, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        ...(options.headers || {}),
    };
    if (token) {
        headers["X-Auth"] = token;
    }

    const res = await fetch(path, { ...options, headers });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

// --- Auth API ---

export const AuthApi = {
    async register(payload) {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    async login({ username, password }) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json(); // { token, user: {...} }
    },

    async me() {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { "X-Auth": token },
        });
        if (!res.ok) return null;
        return res.json();
    },
};

// --- Journal API ---

export const JournalApi = {
    getMyRecord() {
        return authFetch(`${API_BASE}/patients/me`);
    },

    getRecordByName(name) {
        const encoded = encodeURIComponent(name);
        return authFetch(`${API_BASE}/patients/${encoded}/full`);
    },
};

// --- Message API ---

export const MessageApi = {
    getContacts() {
        return authFetch(`${API_BASE}/messages/contacts`);
    },

    getThread(otherId) {
        return authFetch(`${API_BASE}/messages/thread/${otherId}`);
    },

    send(payload) {
        return authFetch(`${API_BASE}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },
};
export const ImageApi = {
    async list() {
        return authFetch("/api/images");
    },

    async upload(file, patientId) {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);
        if (patientId) {
            formData.append("patientId", patientId);
        }

        const headers = {};
        if (token) {
            headers["X-Auth"] = token;
        }

        const res = await fetch("/api/images", {
            method: "POST",
            headers,
            body: formData,
        });

        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json();
    },

    getImageUrl(id) {
        const token = localStorage.getItem("token");
        if (!token) {
            return `/api/images/${id}`;
        }
        return `/api/images/${id}?token=${encodeURIComponent(token)}`;
    },
};
export async function searchPatients(name) {
    const token = localStorage.getItem("token");  // Changed from sessionStorage
    const res = await fetch(`/api/search/patients?name=${encodeURIComponent(name)}`, {
        headers: { "X-Auth": token },
    });
    if (!res.ok) {
        throw new Error("Failed to search patients");
    }
    return res.json();
}

export async function searchByCondition(condition) {
    const token = localStorage.getItem("token");  // Changed from sessionStorage
    const res = await fetch(`/api/search/patients/by-diagnosis?condition=${encodeURIComponent(condition)}`, {
        headers: { "X-Auth": token },
    });
    if (!res.ok) {
        throw new Error("Failed to search diagnosis");
    }
    return res.json();
}

