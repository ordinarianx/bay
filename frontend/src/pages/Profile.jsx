/**
 * Profile page.
 * 
 * - Shows user's name, username, wallet, bet history, and bookmarks.
 * - Uses BetCard for each bet/bookmark.
 * - Ensures each bet passed to BetCard includes poster's name and username.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import BetCard from "../components/BetCard";
import ChallengeBetModal from "../components/ChallengeBetModal";
import "../styles/profile.css";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bets"); 
  const [challengeModal, setChallengeModal] = useState({ open: false, bet: null });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${username}/profile`);
        const data = await res.json();
        if (res.ok) setUserData(data.user);
        else setUserData(null);
      } catch {
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    navigate("/");
  };

  const handleChallengeClick = (bet) => {
    setChallengeModal({ open: true, bet });
  };

  const handleChallengeSubmit = async (amount, odds) => {
    // Logic for submitting a challenge
    setChallengeModal({ open: false, bet: null });
    // Refetch profile to update points
    fetchProfile();
  };

  if (loading) return <div className="profile-page">Loading...</div>;
  if (!userData) return <div className="profile-page">User not found.</div>;

  // Find bets the user has challenged (where they are the challenger)
  const challengedBets = userData?.bets
    ? userData.bets.filter(
        bet =>
          bet.challenger_username === userData.username // or use id if available
      )
    : [];

  return (
    <>
      {localStorage.getItem("username") && (
        <div style={{ position: "fixed", top: 16, left: 16, zIndex: 100 }}>
          <Link
            to={`/profile/${localStorage.getItem("username")}`}
            title="Go to my profile"
          >
            <img
              src={`https://i.pravatar.cc/40?u=${encodeURIComponent(localStorage.getItem("username"))}`}
              alt="My profile"
              className="avatar"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "2px solid #eee",
                cursor: "pointer",
                background: "#222"
              }}
            />
          </Link>
        </div>
      )}

      <div className="profile-topbar">
        <button onClick={() => navigate("/")} className="home-button">
          Home
        </button>

        {/* Profile being viewed: their avatar and log out, only if userData.username exists */}
        {localStorage.getItem("username") === userData.username && (
          <div className="user-info">
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
                marginRight: "10px",
                background: "#222"
              }}
            />
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          </div>
        )}
      </div>

      <div className="profile-page max-w-xl mx-auto p-6">
        <h2 className="profile-name">{userData.name}</h2>
        <div className="profile-username">@{userData.username}</div>

        <div className="profile-wallet">
          <span className="font-semibold">Wallet:</span>{" "}
          <span className="wallet-points">{userData.points} points</span>
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "bets" ? "active" : ""}`}
            onClick={() => setActiveTab("bets")}
          >
            Bet History
          </button>
          <button
            className={`tab-button ${activeTab === "bookmarks" ? "active" : ""}`}
            onClick={() => setActiveTab("bookmarks")}
          >
            Bookmarks
          </button>
          <button
            className={`tab-button ${activeTab === "challenged" ? "active" : ""}`}
            onClick={() => setActiveTab("challenged")}
          >
            Challenged
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "bets" && (
            <div>
              {(!userData.bets || userData.bets.length === 0) && <p>No bets yet.</p>}
              {userData.bets && userData.bets.map((bet) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  currentUser={{
                    username: localStorage.getItem("username"),
                    name: localStorage.getItem("name"),
                  }}
                  onChallengeClick={() => handleChallengeClick(bet)}
                />
              ))}
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div>
              {(!userData.bookmarks || userData.bookmarks.length === 0) ? (
                <p>No bookmarks yet.</p>
              ) : (
                userData.bookmarks.map((bet) => (
                  <BetCard
                    key={bet.id}
                    bet={bet}
                    currentUser={{
                      username: localStorage.getItem("username"),
                      name: localStorage.getItem("name"),
                    }}
                    onChallengeClick={() => handleChallengeClick(bet)}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "challenged" && (
            <div>
              {(!challengedBets || challengedBets.length === 0) ? (
                <p>No challenged bets yet.</p>
              ) : (
                challengedBets.map((bet) => (
                  <BetCard
                    key={bet.id}
                    bet={bet}
                    currentUser={{
                      username: localStorage.getItem("username"),
                      name: localStorage.getItem("name"),
                    }}
                    onChallengeClick={() => handleChallengeClick(bet)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <ChallengeBetModal
        isOpen={challengeModal.open}
        onClose={() => setChallengeModal({ open: false, bet: null })}
        onSubmit={handleChallengeSubmit}
        bet={challengeModal.bet}
        minWager={challengeModal.bet ? (challengeModal.bet.challenge_amount || challengeModal.bet.wager || 1) : 1}
      />
    </>
  );
};

export default Profile;
