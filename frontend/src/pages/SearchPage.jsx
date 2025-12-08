import { useState } from "react";
import { searchPatients, searchByCondition } from "../api.js";

export default function SearchPage() {
    const [name, setName] = useState("");
    const [condition, setCondition] = useState("");
    const [results, setResults] = useState([]);

    async function doSearchByName() {
        const list = await searchPatients(name);
        setResults(list);
    }

    async function doSearchByCondition() {
        const list = await searchByCondition(condition);
        setResults(list);
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>Patientsökning</h2>

            <div style={{ display: "flex", gap: 8 }}>
                <input
                    placeholder="Sök namn..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button onClick={doSearchByName}>Sök namn</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                    placeholder="Sök diagnos..."
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                />
                <button onClick={doSearchByCondition}>Sök diagnos</button>
            </div>

            <h3>Resultat</h3>

            {results.length === 0 && <p>Inga resultat...</p>}

            <ul>
                {results.map((p) => (
                    <li key={p.id}>
                        <strong>{p.name}</strong> ({p.personnummer})
                    </li>
                ))}
            </ul>
        </div>
    );
}
