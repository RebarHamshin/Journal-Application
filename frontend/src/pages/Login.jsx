import { useState } from "react";
import "../css-styles/Login.css";
/**
 * The Login component:
 *  - Displays a simple login form
 *  - Collects username and password input
 *  - Sends a login request to the backend API
 *  - Stores the user's token and info in localStorage on success
 *  - Displays an error message if login fails
 *
 * @component
 * @param {Object} props - Component properties
 * @param {Function} props.onLogin - Callback triggered after successful login.
 *                                   Receives the `user` object from the API response.
 */
export default function Login({ onLogin }) {
    /**
     * @state username - stores the value of the username input.
     * setU is used to update the value.
     */
    const [username, setU] = useState("");

    /**
     * @state password - stores the value of the password input.
     * setP is used to update the value.
     */
    const [password, setP] = useState("");

    /**
     * @state error - stores any error message to display to the user.
     */
    const [error, setError] = useState("");

    /**
     * Handles form submission.
     * - Prevents the default form reload
     * - Sends a POST request to `/api/auth/login`
     * - Parses the response and saves the token + user info to localStorage
     * - Calls the `onLogin` callback if login succeeds
     * - Displays an error message if something goes wrong
     *
     * @async
     * @param {Event} e - The form submit event
     */
    async function handleSubmit(e) {
        e.preventDefault();   // Prevents full page reload on form submission
        setError("");         // Clears any previous error messages

        try {
            // Send login request to backend API
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            // If the response is not successful (e.g. 401, 500), throw an error
            if (!res.ok) throw new Error(await res.text());

            // Parse JSON response: expected format { token, user: {...} }
            const data = await res.json();

            // Save token and user data locally in the browser
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Trigger callback if provided
            onLogin?.(data.user);

        } catch (err) {
            // Display error message in the UI
            setError(err.message || "Login failed");
        }
    }

    /**
     * Renders the login form.
     * Includes two input fields (username and password),
     * an optional error message, and a login button.
     */
    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <input
                value={username}
                onChange={(e) => setU(e.target.value)}
                placeholder="username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setP(e.target.value)}
                placeholder="password"
            />
            {error && <div style={{ color: "crimson" }}>{error}</div>}
            <button type="submit">Log in</button>
        </form>
    );
}
