import React from "react";
import BetCard from "../components/BetCard";
import { Link } from "react-router-dom";
import { bets } from "../data/mockBets";
import "../styles/feed.css";

const BetFeed = () => {
  return (
    <div className="feed-container">
      <header className="top-nav justify-end">
        <Link to="/auth" className="login-button">Login / Signup</Link>
      </header>

      <main className="feed-content">
        {bets.map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </main>
    </div>
  );
};

export default BetFeed;
