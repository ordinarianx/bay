import React, { useState, useEffect } from "react";
import BetCard from "../components/BetCard";
import NewBetModal from "../components/NewBetModal";
import { Link, useNavigate } from "react-router-dom";

const BetFeed = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bets, setBets] = useState([]);
  const [userData, setUserData] = useState({ username: null, name: null });
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedUsername = localStorage.getItem("username");
    
    if (storedUsername && storedUsername !== "null" && storedUsername !== "undefined") {
      setUserData({
        username: storedUsername,
        name: storedName
      });
    } else {
      setUserData({ username: null, name: null });
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
        body: JSON.stringify({ 
          ...newBet, 
          username: storedUsername 
        })
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
    localStorage.removeItem("name");
    setUserData({ username: null, name: null });
    navigate("/");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 max-w-xl mx-auto">
        {!userData.username ? (
          <Link to="/auth" className="login-button">Login / Register</Link>
        ) : (
          <>
            <span className="username-label">Hi, {userData.name}</span>
            <button onClick={handleLogout} className="logout-button">Log Out</button>
          </>
        )}
      </div>

      {/* Feed */}
      <div className="feed">
        {bets.map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>

      {/* Floating Post Button */}
      {userData.username && (
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="post-bet-button fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          + Post a Bet
        </button>
      )}

      <NewBetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewBet}
      />
    </div>
  );
};

export default BetFeed;