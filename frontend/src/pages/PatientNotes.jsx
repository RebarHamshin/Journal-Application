import { useState } from "react";
import { authFetch } from "../api.js";
export default function PatientNotesPage() {
    const [patientName, setPatientName] = useState("");
    const [noteText, setNoteText] = useState("");
    const [diagCode, setDiagCode] = useState("");
    const [diagDisplay, setDiagDisplay] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function createNote(e) {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            await authFetch(`/api/patients/notes/by-name`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    patientName,
                    noteText,
                }),
            });

            setMessage("Note saved!");
            setNoteText("");
        } catch (err) {
            setError(err.message || "Failed to save note");
        }
    }

    async function createDiagnosis(e) {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            await authFetch(`/api/patients/conditions/by-name`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    patientName,
                    code: diagCode,
                    display: diagDisplay,
                    onsetDate: null, // TODO: göra till datumfält om du vill
                }),
            });

            setMessage("Diagnosis saved!");
            setDiagCode("");
            setDiagDisplay("");
        } catch (err) {
            setError(err.message || "Failed to save diagnosis");
        }
    }

    return (
        <div style={{ marginTop: 24 }}>
            <h2>Patient journal (läkare/personal)</h2>

            <div style={{ marginBottom: 12 }}>
                <label>Patient name</label>
                <input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                />
            </div>

            {error && <div style={{ color: "crimson" }}>{error}</div>}
            {message && <div style={{ color: "seagreen" }}>{message}</div>}

            <form onSubmit={createNote} style={{ marginTop: 16 }}>
                <h3>Ny notering</h3>
                <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    style={{ width: "100%" }}
                />
                <button type="submit" style={{ marginTop: 8 }}>
                    Spara notering
                </button>
            </form>

            <form onSubmit={createDiagnosis} style={{ marginTop: 24 }}>
                <h3>Ny diagnos</h3>
                <div style={{ marginBottom: 8 }}>
                    <label>Kod</label>
                    <input
                        value={diagCode}
                        onChange={(e) => setDiagCode(e.target.value)}
                        style={{ marginLeft: 8 }}
                    />
                </div>
                <div style={{ marginBottom: 8 }}>
                    <label>Text</label>
                    <input
                        value={diagDisplay}
                        onChange={(e) => setDiagDisplay(e.target.value)}
                        style={{ marginLeft: 8, width: "60%" }}
                    />
                </div>
                <button type="submit">Spara diagnos</button>
            </form>
        </div>
    );
}
