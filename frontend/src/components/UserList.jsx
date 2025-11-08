import { useEffect, useState } from "react";

// Exporterar komponent så att den kan användas i App.jsx
export default function UserList() {

    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const API_BASE = '/api';
        const apiUrl = `${API_BASE}/users`;
        console.log("Fetching:", apiUrl);      // <-- see the exact URL

        fetch(apiUrl)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setUsers)
            .catch((err) => {
                console.error("Fetch failed:", err); // shows CORS/Network errors
                setError(err.message);
            });
    }, []);

    // === Render-logik ===

    // Om det finns ett fel → visa ett rött felmeddelande på skärmen
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

    // Om inga användare ännu har hämtats (listan är tom och inget fel) → visa "Loading..."
    if (!users.length) return <p>Loading users...</p>;

    // Om vi kommer hit → hämtningen lyckades och "users" innehåller data
    return (
        <div style={{ padding: "1rem" }}>
            <h2>Users</h2>
            <ul>
                {/* .map() loopar igenom alla användare i listan och visar varje användare i ett <li>-element */}
                {/* Vi använder "u.id" som key (React kräver unika keys för listor) */}
                {users.map((u) => (
                    <li key={u.id}>
                        {/* Vi visar användarens namn och e-post */}
                        <strong>{u.username}</strong> ({u.email})
                    </li>
                ))}
            </ul>
        </div>
    );
}
