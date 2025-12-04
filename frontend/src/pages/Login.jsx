import { useState } from "react";
import "../css-styles/Login.css";
import { AuthApi } from "../api.js";

export default function Login({ onLogin, onShowRegister }) {
    const [username, setU] = useState("");
    const [password, setP] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await AuthApi.login({ username, password });

            // spara i localStorage som tidigare
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            onLogin(data.user);     // talar om för App.jsx att vi är inloggade
            navigate("/");
        } catch (err) {
            setError(err.message || "Inloggning misslyckades");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div style={{ maxWidth: 360, margin: "4rem auto", fontFamily: "system-ui" }}>
            <h2>Logga in</h2>
            <form onSubmit={handleSubmit}>
                <label>Användarnamn</label>
                <input
                    value={username}
                    onChange={(e) => setU(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                <label>Lösenord</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setP(e.target.value)}
                    style={{ width: "100%", marginBottom: 8 }}
                />
                {error && (
                    <div style={{ color: "crimson", marginBottom: 8 }}>
                        {error}
                    </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit">Logga in</button>
                    <button
                        type="button"
                        onClick={() => onShowRegister?.()}
                    >
                        Create account
                    </button>
                </div>
            </form>
        </div>
    );
}
