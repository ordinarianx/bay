import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { email, password }
      : { email, username, password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📦 Server response:", data); // <- Add this

      if (res.ok) {
        alert(`${isLogin ? "Login" : "Signup"} successful!`);
        localStorage.setItem("username", data.username || username); 
        // console.log("✅ Stored to localStorage:", localStorage.getItem("username")); // <- Debug here
        navigate("/"); // Redirect
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error.");
    }
  };

  return (
    <div className="auth-page">
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>

      <p className="toggle-text">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button type="button" className="link-button" onClick={toggleMode}>
          {isLogin ? " Register" : " Login"}
        </button>
      </p>

      <Link to="/" className="back-link">← Back to Home</Link>
    </div>
  );
};

export default AuthPage;
