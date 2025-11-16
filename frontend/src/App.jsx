import { useEffect, useState } from "react";
import UserList from "./components/UserList";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { currentUser, clearSession } from "./api.js";

export default function App() {
    const [me, setMe] = useState(null);
    const [mode, setMode] = useState("login"); // 'login' | 'register'

    useEffect(() => {
        setMe(currentUser());
    }, []);

    if (!me) {
        return mode === "register"
            ? <Register onDone={() => setMode("login")} />
            : <Login onLogin={setMe} onShowRegister={() => setMode("register")} />;
    }

    return (
        <div style={{ fontFamily: "system-ui", padding: 16 }}>
            <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h1>Journal System Demo</h1>
                <span style={{ opacity: 0.7 }}>Inloggad som: {me.username} ({me.role})</span>
                <button onClick={() => { clearSession(); setMe(null); setMode("login"); }} style={{ marginLeft: "auto" }}>
                    Logga ut
                </button>
            </header>

            <UserList />
        </div>
    );
}
