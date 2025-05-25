import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <div className="auth-page">
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form className="auth-form">
        {!isLogin && (
          <input type="text" placeholder="Username" required />
        )}
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>

      <p className="toggle-text">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button type="button" className="link-button" onClick={toggleMode}>
          {isLogin ? " Sign Up" : " Login"}
        </button>
      </p>

      <Link to="/" className="back-link">← Back to Home</Link>
    </div>
  );
};

export default AuthPage;
