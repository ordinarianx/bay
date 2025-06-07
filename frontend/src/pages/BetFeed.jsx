/**
 * BetFeed page.
 * 
 * - Fetches and displays all bets from the backend.
 * - Allows logged-in users to post new bets and challenge others' bets.
 * - Uses BetCard for each bet.
 */

import React, { useState, useEffect } from "react";
import BetCard from "../components/BetCard";
import ChallengeBetModal from "../components/ChallengeBetModal";
import NewBetModal from "../components/NewBetModal";
import { Link, useNavigate } from "react-router-dom";

const BetFeed = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bets, setBets] = useState([]);
  const [userData, setUserData] = useState({ username: null, name: null });
  const [challengeModal, setChallengeModal] = useState({ open: false, bet: null });
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername !== "null" && storedUsername !== "undefined") {
      setUserData({ username: storedUsername, name: storedName });
    } else {
      setUserData({ username: null, name: null });
    }

    const fetchBets = async () => {
      try {
        const res = await fetch("/api/bets");
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
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBet, username: storedUsername })
      });
      const data = await res.json();
      if (res.ok) setBets([data.bet, ...bets]);
      else alert(data.message || "Failed to post bet.");
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

  const handleChallengeClick = (bet) => {
    setChallengeModal({ open: true, bet });
  };

  const handleChallengeSubmit = async (wager, setError, resetInput) => {
    const { bet } = challengeModal;
    try {
      const res = await fetch(`/api/bets/${bet.id}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wager, username: userData.username }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Challenge failed");
      } else {
        setChallengeModal({ open: false, bet: null });
        setBets(bets => bets.map(b => b.id === bet.id ? data.bet : b));
        resetInput(bet.challenge_amount || bet.wager || 1);
      }
    } catch {
      setError("Server error.");
    }
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
          <BetCard
            key={bet.id}
            bet={bet}
            currentUser={userData}
            onChallengeClick={() => handleChallengeClick(bet)}
          />
        ))}
      </div>

      {/* Floating Post Button */}
      {userData.username && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="post-bet-button"
        >
          + Post a Bet
        </button>
      )}

      <NewBetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewBet}
      />

      {/* Challenge Modal */}
      <ChallengeBetModal
        isOpen={challengeModal.open}
        onClose={() => setChallengeModal({ open: false, bet: null })}
        onSubmit={handleChallengeSubmit}
        bet={challengeModal.bet}
        minWager={challengeModal.bet ? (challengeModal.bet.challenge_amount || challengeModal.bet.wager || 1) : 1}
      />
    </div>
  );
};

export default BetFeed;
// This component renders the main bet feed page, allowing users to view, post, and challenge bets.
// It includes modals for posting new bets and challenging existing ones, and handles user authentication state.