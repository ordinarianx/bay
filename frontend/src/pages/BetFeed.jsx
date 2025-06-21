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
import "../styles/betfeed.css";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Challenged", value: "challenged" },
  { label: "Resolved", value: "resolved" }
];

const BetFeed = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bets, setBets] = useState([]);
  const [userData, setUserData] = useState({ username: null, name: null });
  const [challengeModal, setChallengeModal] = useState({ open: false, bet: null });
  const [statusFilter, setStatusFilter] = useState("all");
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
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/bets`);
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
      
      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        try {
          data = await res.json();
        } catch {
          const text = await res.text();
          throw new Error(text || "Unknown error");
        }
      }

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

  // Filter bets based on status
  let filteredBets = statusFilter === "all"
    ? bets
    : bets.filter(bet => bet.status === statusFilter);

  // Sort bets by likes in descending order for leaderboard
  filteredBets = [...filteredBets].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117" }}>
      {/* Filter Column */}
      <aside
        style={{
          width: 180,
          background: "#181a1b",
          padding: "2rem 1rem 1rem 1rem",
          borderRight: "1px solid #222",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start"
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 16, color: "#fff", fontSize: "1.1em" }}>
          Filter Bets
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                background: statusFilter === opt.value ? "#1da1f2" : "transparent",
                color: statusFilter === opt.value ? "#fff" : "#aaa",
                border: "none",
                borderRadius: 6,
                padding: "8px 12px",
                fontWeight: statusFilter === opt.value ? 700 : 400,
                cursor: "pointer",
                marginBottom: 2,
                transition: "background 0.15s",
                width: "100%",
                textAlign: "left"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 px-4 py-4 max-w-5xl mx-auto">
          {!userData.username ? (
            <Link to="/auth" className="login-button">Login / Register</Link>
          ) : (
            <>
              <Link
                to={`/profile/${userData.username}`}
                style={{ display: "inline-block", marginRight: "10px" }}
                title="Go to my profile"
              >
                <img
                  src={`https://i.pravatar.cc/40?u=${encodeURIComponent(userData.username)}`}
                  alt="profile"
                  className="avatar"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    verticalAlign: "middle",
                    border: "2px solid #eee",
                    cursor: "pointer",
                    marginBottom: "8px"
                  }}
                />
              </Link>
              <button onClick={handleLogout} className="logout-button">Log Out</button>
            </>
          )}
        </div>

        {/* Responsive Feed */}
        <div className="feed grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto">
          {filteredBets.map((bet) => (
            <BetCard
              key={bet.id}
              bet={bet}
              currentUser={userData}
              onChallengeClick={() => handleChallengeClick(bet)}
            />
          ))}
        </div>
      </main>

      {/* Floating Post Button */}
      {userData.username && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="post-bet-button fixed bottom-8 right-8 z-50"
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