// src/api.js
/////////////////////////////NEW///////////////////
// --- Session helpers (används i App.jsx) ---
// src/api.js

// ---- base URLs till microservices ----
const AUTH_BASE =
    import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8081";
const PATIENT_BASE =
    import.meta.env.VITE_PATIENT_BASE_URL || "http://localhost:8082";

// --- Session helpers (används i App.jsx) ---

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

// --- authFetch: gemensam helper som lägger på X-Auth-token ---

export async function authFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        ...(options.headers || {}),
    };
    if (token) {
        headers["X-Auth"] = token;
    }

    const res = await fetch(url, { ...options, headers });

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

// --- Auth API (login, register, me) ---

export const AuthApi = {
    async register(payload) {
        const res = await fetch(`${AUTH_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json(); // { id, username, role, patientId }
    },

    async login({ username, password }) {
        const res = await fetch(`${AUTH_BASE}/api/auth/login`, {
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

        const res = await fetch(`${AUTH_BASE}/api/auth/me`, {
            headers: { "X-Auth": token },
        });
        if (!res.ok) return null;
        return res.json();
    },
};

// --- Journal API (MyJournal + PatientRecordViewer) ---

export const JournalApi = {
    // Patient ser sin egen journal
    getMyRecord() {
        return authFetch(`${PATIENT_BASE}/api/patients/me`);
    },

    // Läkare/personal ser journal via patientnamn
    getRecordByName(name) {
        const encoded = encodeURIComponent(name);
        return authFetch(`${PATIENT_BASE}/api/patients/${encoded}/full`);
    },
};

// --- Meddelanden (ligger i patient-service just nu) ---

export const MessageApi = {
    getContacts() {
        return authFetch(`${PATIENT_BASE}/api/messages/contacts`);
    },

    getThread(otherId) {
        return authFetch(`${PATIENT_BASE}/api/messages/thread/${otherId}`);
    },

    send(payload) {
        return authFetch(`${PATIENT_BASE}/api/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },
};

export { AUTH_BASE, PATIENT_BASE };

/// NEW

/*export function currentUser() {
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

// --- authFetch: gemensam helper som lägger på X-Auth-token ---

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
        // kasta texten som felmeddelande
        throw new Error(await res.text());
    }

    // Försök parsa JSON, annars returnera rå text
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

// --- Auth API (register m.m.) ---

export const AuthApi = {
    async register(payload) {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res.json(); // { id, username, role, patientId }
    },

    async me() {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const res = await fetch("/api/auth/me", {
            headers: { "X-Auth": token },
        });
        if (!res.ok) return null;
        return res.json();
    },
};

// --- Journal API (MyJournal + PatientRecordViewer) ---

export const JournalApi = {
    // Patient ser sin egen journal
    getMyRecord() {
        return authFetch("/api/patients/me");
    },

    // Läkare/personal ser journal via patientnamn
    getRecordByName(name) {
        const encoded = encodeURIComponent(name);
        return authFetch(`/api/patients/${encoded}/full`);
    },
};
export const MessageApi = {
    getContacts() {
        return authFetch("/api/messages/contacts");
    },

    getThread(otherId) {
        return authFetch(`/api/messages/thread/${otherId}`);
    },

    send(payload) {
        return authFetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    },
};
*/

