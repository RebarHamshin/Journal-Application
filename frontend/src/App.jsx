import { useEffect, useState } from "react";
import UserList from "./components/UserList";
import Login from "./pages/Login.jsx";
import { currentUser, clearSession } from "./api.js";

function App() {
    const [me, setMe] = useState(null);

    useEffect(() => {
        setMe(currentUser()); // Sets me as currentUser (api.js)
    }, []); // Empty dependencyList - run this once

    if (!me) { // Checks if logged in or not
        return <Login onLogin={setMe} />; //If not gives the login page
    }

    // Gives this if logged in (if me==true)
    return (
        <div style={{ fontFamily: "system-ui", padding: 16 }}>
            <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h1>Journal System Demo</h1>
                <span style={{ opacity: 0.7 }}>Inloggad som: {me.username} ({me.role})</span>
                <button
                    onClick={() => { clearSession(); setMe(null); }}
                    style={{ marginLeft: "auto" }}
                >
                    Logga ut
                </button>
            </header>

            <UserList />
        </div>
    );
}

export default App;
