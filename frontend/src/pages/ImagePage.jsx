import { useEffect, useRef, useState } from "react";
import { ImageApi, JournalApi } from "../api.js";

export default function ImagesPage({ me }) {
    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // patient-val
    const [patientName, setPatientName] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientLookupError, setPatientLookupError] = useState("");

    const [selected, setSelected] = useState(null); // valt image-objekt
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [drawColor, setDrawColor] = useState("#ff0000");
    const [text, setText] = useState("");

    const isStaff = me?.role === "STAFF" || me?.role === "DOCTOR";

    useEffect(() => {
        loadImages();
    }, []);

    async function loadImages() {
        setError("");
        try {
            const list = await ImageApi.list();
            setImages(list);
        } catch (e) {
            setError(e.message || "Kunde inte hämta bilder");
        }
    }

    // slå upp patient utifrån namn/användarnamn
    async function handleFindPatient(e) {
        e.preventDefault();
        setPatientLookupError("");
        setSelectedPatient(null);

        if (!patientName.trim()) {
            setPatientLookupError("Skriv in ett namn/användarnamn.");
            return;
        }

        try {
            const record = await JournalApi.getRecordByName(patientName.trim());
            // Anpassa dessa fält efter hur ditt API ser ut
            const patient = {
                id: record.patient.id,
                name: record.patient.name,
            };
            setSelectedPatient(patient);
        } catch (err) {
            console.error("Kunde inte hitta patient:", err);
            setPatientLookupError("Hittade ingen patient med det namnet.");
        }
    }

    async function handleUpload(e) {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!file) {
            setError("Välj en bild först.");
            return;
        }
        if (!selectedPatient) {
            setError("Välj en patient först.");
            return;
        }

        try {
            const uploaded = await ImageApi.upload(file, selectedPatient.id);
            setMessage("Bild uppladdad!");
            setFile(null);
            setImages((prev) => [uploaded, ...prev]);
        } catch (e) {
            setError(e.message || "Kunde inte ladda upp bild");
        }
    }

    function handleSelectImage(img) {
        setSelected(img);
        setMessage("");
        setError("");
        setText("");
        setTimeout(() => {
            const imgEl = imgRef.current;
            const canvas = canvasRef.current;
            if (!imgEl || !canvas) return;

            const ctx = canvas.getContext("2d");
            canvas.width = imgEl.naturalWidth;
            canvas.height = imgEl.naturalHeight;
            ctx.drawImage(imgEl, 0, 0);
        }, 50);
    }

    function handleCanvasMouseDown(e) {
        if (!selected) return;
        setDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        const { offsetX, offsetY } = e.nativeEvent;
        ctx.moveTo(offsetX, offsetY);
    }

    function handleCanvasMouseMove(e) {
        if (!drawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const { offsetX, offsetY } = e.nativeEvent;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    }

    function handleCanvasMouseUp() {
        setDrawing(false);
    }

    function handleCanvasMouseLeave() {
        if (drawing) setDrawing(false);
    }

    function handleAddText() {
        if (!selected || !text.trim()) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.font = "32px sans-serif";
        ctx.fillStyle = drawColor;
        ctx.fillText(text, 20, 40);
    }

    async function handleSaveAnnotated() {
        if (!selected) return;
        setError("");
        setMessage("");

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setError("Kunde inte skapa annoterad bild");
                return;
            }
            try {
                const filename = (selected.filename || "image") + "-annotated.png";
                const fileFromCanvas = new File([blob], filename, {
                    type: "image/png",
                });

                // spara annoterad bild mot samma patient
                const patientIdForSave =
                    selected.patient_id || selectedPatient?.id || null;

                const uploaded = await ImageApi.upload(
                    fileFromCanvas,
                    patientIdForSave
                );
                setMessage("Annoterad bild sparad!");
                setImages((prev) => [uploaded, ...prev]);
            } catch (e) {
                setError(e.message || "Kunde inte spara annoterad bild");
            }
        }, "image/png");
    }

    return (
        <div style={{ marginTop: 24, display: "flex", gap: 24 }}>
            {/* Vänster: patientval + uppladdning + lista */}
            <div style={{ width: 260 }}>
                <h2>Bilder</h2>
                <p style={{ fontSize: 12, opacity: 0.7 }}>
                    {me?.role === "PATIENT"
                        ? "Din läkare kan ladda upp och annotera bilder."
                        : "Du kan ladda upp och annotera bilder för patienter."}
                </p>

                {isStaff && (
                    <>
                        <form onSubmit={handleFindPatient} style={{ marginBottom: 8 }}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Patientnamn / användarnamn"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    style={{ marginRight: 8, width: "100%" }}
                                />
                            </div>
                            <button type="submit" style={{ marginTop: 4 }}>
                                Välj patient
                            </button>
                        </form>

                        {patientLookupError && (
                            <div
                                style={{
                                    color: "crimson",
                                    marginBottom: 4,
                                    fontSize: 12,
                                }}
                            >
                                {patientLookupError}
                            </div>
                        )}

                        {selectedPatient && (
                            <div
                                style={{
                                    marginBottom: 8,
                                    fontSize: 12,
                                    opacity: 0.8,
                                }}
                            >
                                Vald patient:{" "}
                                <strong>{selectedPatient.name}</strong> (id:
                                {selectedPatient.id})
                            </div>
                        )}

                        <form onSubmit={handleUpload} style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFile(e.target.files?.[0] || null)
                                    }
                                />
                            </div>
                            <button type="submit">Ladda upp</button>
                        </form>
                    </>
                )}

                {error && (
                    <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>
                )}
                {message && (
                    <div style={{ color: "seagreen", marginBottom: 8 }}>{message}</div>
                )}

                <h3>Bildlista</h3>
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        maxHeight: 300,
                        overflowY: "auto",
                    }}
                >
                    {images.map((img) => (
                        <li key={img.id} style={{ marginBottom: 8 }}>
                            <button
                                onClick={() => handleSelectImage(img)}
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "4px 6px",
                                    borderRadius: 4,
                                    border:
                                        selected && selected.id === img.id
                                            ? "1px solid #4caf50"
                                            : "1px solid #444",
                                    background:
                                        selected && selected.id === img.id
                                            ? "#1b5e20"
                                            : "#222",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                {img.filename || `Bild #${img.id}`}
                                <div style={{ fontSize: 11, opacity: 0.7 }}>
                                    {img.created_at}
                                </div>
                            </button>
                        </li>
                    ))}
                    {images.length === 0 && <li>Inga bilder uppladdade ännu.</li>}
                </ul>
            </div>

            {/* Höger: preview + canvas */}
            <div style={{ flex: 1 }}>
                {!selected ? (
                    <p>Välj en bild till vänster för att annotera.</p>
                ) : (
                    <>
                        <h3>Annoterar: {selected.filename || `Bild #${selected.id}`}</h3>
                        <img
                            ref={imgRef}
                            src={ImageApi.getImageUrl(selected.id)}
                            alt=""
                            style={{ display: "none" }}
                            onLoad={() => handleSelectImage(selected)}
                        />

                        {isStaff && (
                            <>
                                <div style={{ marginBottom: 8 }}>
                                    <label style={{ marginRight: 8 }}>
                                        Färg{" "}
                                        <input
                                            type="color"
                                            value={drawColor}
                                            onChange={(e) =>
                                                setDrawColor(e.target.value)
                                            }
                                        />
                                    </label>
                                    <label>
                                        Text att lägga till:{" "}
                                        <input
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            style={{ width: 240, marginLeft: 4 }}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddText}
                                        style={{ marginLeft: 8 }}
                                    >
                                        Lägg text på bild
                                    </button>
                                </div>

                                <div style={{ marginTop: 8, marginBottom: 8 }}>
                                    <button
                                        type="button"
                                        onClick={handleSaveAnnotated}
                                    >
                                        Spara annoterad bild
                                    </button>
                                </div>
                            </>
                        )}

                        <div
                            style={{
                                border: "1px solid #444",
                                display: "inline-block",
                                maxWidth: "100%",
                                overflow: "auto",
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseLeave}
                                style={{
                                    cursor: "crosshair",
                                    maxWidth: "100%",
                                    background: "#000",
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
