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
import "../styles/profile.css";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bets"); 

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

  if (loading) return <div className="profile-page">Loading...</div>;
  if (!userData) return <div className="profile-page">User not found.</div>;

  return (
    <>
      <div className="profile-topbar">
        <button onClick={() => navigate("/")} className="home-button">
          Home
        </button>

        <div className="user-info">
          {!localStorage.getItem("username") ? (
            <Link to="/auth" className="login-button">
              Login / Register
            </Link>
          ) : (
            <>
              <span className="username-label">Hi, {localStorage.getItem("name")}</span>
              <button onClick={handleLogout} className="logout-button">
                Log Out
              </button>
            </>
          )}
        </div>
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
        </div>

        <div className="tab-content">
          {activeTab === "bets" && (
            <div>
              {userData.bets.length === 0 && <p>No bets yet.</p>}
              {userData.bets.map((bet) => (
                <BetCard
                  key={bet.id}
                  bet={{
                    ...bet,
                    username: userData.username,
                    name: userData.name
                  }}
                  currentUser={userData}
                />
              ))}
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div>
              {!userData.bookmarks || userData.bookmarks.length === 0 ? (
                <p>No bookmarks yet.</p>
              ) : (
                userData.bookmarks.map((bet) => (
                  <BetCard
                    key={bet.id}
                    bet={{
                      ...bet,
                      username: userData.username,
                      name: userData.name
                    }}
                    currentUser={userData}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
