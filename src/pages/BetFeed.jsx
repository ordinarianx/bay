import React, { useState, useEffect } from "react";
import BetCard from "../components/BetCard";
import NewBetModal from "../components/NewBetModal";
import { Link, useNavigate } from "react-router-dom";

const BetFeed = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bets, setBets] = useState([]);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername !== "null" && storedUsername !== "undefined") {
      setUsername(storedUsername);
    } else {
      setUsername(null);
      navigate("/"); // Redirect logged out users
    }

    // Fetch real bets from backend
    const fetchBets = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bets");
        const data = await res.json();
        setBets(data.bets || []);
      } catch (err) {
        console.error("Failed to fetch bets:", err);
      }
    };

    fetchBets();
  }, [navigate]);

  const handleNewBet = async (newBet) => {
    const storedUsername = localStorage.getItem("username");

    try {
      const res = await fetch("http://localhost:5000/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBet, username: storedUsername })
      });

      const data = await res.json();

      if (res.ok) {
        setBets([data.bet, ...bets]); // Add to top
      } else {
        alert(data.message || "Failed to post bet.");
      }
    } catch (err) {
      console.error("Error posting bet:", err);
      alert("Server error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 max-w-xl mx-auto">
        {!username ? (
          <Link to="/auth" className="login-button">Login / Register</Link>
        ) : (
          <>
            <span className="username-label">Hi, {username}</span>
            <button onClick={handleLogout} className="logout-button">Log Out</button>
          </>
        )}

        {username && (
          <button onClick={() => setIsModalOpen(true)} className="login-button">
            + Post a Bet
          </button>
        )}
      </div>

      {bets.map((bet) => (
        <BetCard key={bet.id} bet={bet} />
      ))}

      <NewBetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewBet}
      />
    </div>
  );
};

export default BetFeed;
