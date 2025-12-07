// src/App.jsx
import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { currentUser, clearSession } from "./api.js";
import PatientNotesPage from "./pages/PatientNotes.jsx";
import PatientRecordViewer from "./components/PatientRecordViewer.jsx";
import MyJournal from "./components/MyJournal.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
// ⬇️ NY: sida för att jobba med bilder (du skapar den själv)
import ImagePage from "./pages/ImagePage.jsx";

export default function App() {
    const [me, setMe] = useState(null);
    const [mode, setMode] = useState("login");          // 'login' | 'register'
    const [view, setView] = useState("journal");        // 'journal' | 'messages' | 'images'

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

                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button
                        type="button"
                        onClick={() => setView("journal")}
                        style={{ fontWeight: view === "journal" ? "bold" : "normal" }}
                    >
                        Journal
                    </button>

                    <button
                        type="button"
                        onClick={() => setView("messages")}
                        style={{ fontWeight: view === "messages" ? "bold" : "normal" }}
                    >
                        Meddelanden
                    </button>

                    {/* ⬇️ Ny knapp för bild-vy.
                        Om du vill kan du bara visa den för läkare/personal. */}
                    <button
                        type="button"
                        onClick={() => setView("images")}
                        style={{ fontWeight: view === "images" ? "bold" : "normal" }}
                    >
                        Bilder
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            clearSession();
                            setMe(null);
                            setMode("login");
                            setView("journal");
                        }}
                    >
                        Logga ut
                    </button>
                </div>
            </header>

            {/* --- Main content beroende på vald vy --- */}
            {view === "journal" && (
                isDoctorOrStaff ? (
                    <>
                        {/* Läkare/personal: skriva noteringar/diagnoser */}
                        <PatientNotesPage />
                        {/* Läkare/personal: visa journal för valfri patient via namn */}
                        <PatientRecordViewer />
                    </>
                ) : (
                    <>
                        {/* Patient: se sin egen journal */}
                        <MyJournal />
                    </>
                )
            )}

            {view === "messages" && (
                <MessagesPage me={me} />
            )}

            {view === "images" && (
                <ImagePage me={me} />
            )}
        </div>
    );
}
