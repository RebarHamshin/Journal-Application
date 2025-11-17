import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { currentUser, clearSession } from "./api.js";
import PatientNotesPage from "./pages/PatientNotes.jsx";
import PatientRecordViewer from "./components/PatientRecordViewer.jsx";
import MyJournal from "./components/MyJournal.jsx";

export default function App() {
    const [me, setMe] = useState(null);
    const [mode, setMode] = useState("login"); // 'login' | 'register'

    useEffect(() => {
        setMe(currentUser());
    }, []);

    // Om ej inloggad -> visa login eller register
    if (!me) {
        return mode === "register"
            ? <Register onDone={() => setMode("login")} />
            : <Login onLogin={setMe} onShowRegister={() => setMode("register")} />;
    }

    const isDoctorOrStaff = ["DOCTOR", "STAFF"].includes(me.role);

    return (
        <div style={{ fontFamily: "system-ui", padding: 16 }}>
            <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h1>Journal System Demo</h1>
                <span style={{ opacity: 0.7 }}>
                    Inloggad som: {me.username} ({me.role})
                </span>

                <button
                    onClick={() => { clearSession(); setMe(null); setMode("login"); }}
                    style={{ marginLeft: "auto" }}
                >
                    Logga ut
                </button>
            </header>

            {isDoctorOrStaff ? (
                <>
                    {/* Läkare/personal: skriva noteringar/diagnoser */}
                    <PatientNotesPage />

                    {/* Läkare/personal: visa journal för godtycklig patient */}
                    <PatientRecordViewer />
                </>
            ) : (
                <>
                    {/* Patient: se sin egen journal */}
                    <MyJournal />
                </>
            )}
        </div>
    );
}
