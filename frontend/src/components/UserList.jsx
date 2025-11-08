import { useEffect, useState } from "react";
import { authFetch } from "../api.js";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        authFetch("/users")
            .then(async (r) => {
                if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
                return r.json();
            })
            .then(setUsers)
            .catch((e) => setError(e.message));
    }, []);

    if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;

    return (
        <ul>
            {users.map((u) => (
                <li key={u.id}>
                    <strong>{u.username}</strong> ({u.role ?? "N/A"})
                </li>
            ))}
            {users.length === 0 && <li>Inga användare ännu.</li>}
        </ul>
    );
}
