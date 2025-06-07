import React from "react";
import { Link } from "react-router-dom";
import "../styles/main.css";

/**
 * BetCard component.
 *
 * - Displays a single bet's details.
 * - Shows challenge, like, and bookmark actions.
 * - Receives bet (with username and name) and currentUser as props.
 */

const BetCard = ({ bet, currentUser, onChallengeClick }) => {
  const username = bet.username;
  const name = bet.name;
  const isLoggedIn = !!(currentUser && currentUser.username);
  const isOwner = currentUser && currentUser.username === bet.username;

  return (
    <div className="bet-card">
      <img
        src={`https://i.pravatar.cc/40?u=${encodeURIComponent(username || bet.id)}`}
        alt="avatar"
        className="avatar"
      />
      <div className="card-content">
        <div className="card-header">
          <Link
            to={`/profile/${username}`}
            className="name-link"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <span className="name">{name}</span> @{username}
          </Link>{" "}
          · 2h
        </div>
        <div className="card-title">{bet.title}</div>
        <div className="card-body">{bet.body}</div>
        {bet.evidence && (
          <div className="card-evidence">
            <strong>Evidence:</strong> {bet.evidence}
          </div>
        )}
        {bet.wager && (
          <div className="card-wager">
            <strong>Wager:</strong> {bet.wager}
          </div>
        )}
        <div className="card-actions" style={{ gap: "20px" }}>
          {/* Challenge */}
          <div>
            <span className="stat">⚔️{bet.challenge_amount || 0}</span>
            {isLoggedIn && !isOwner && (
              <button onClick={onChallengeClick}> Challenge</button>
            )}
          </div>

          {/* Likes */}
          <div>
            <span className="stat">❤️{bet.likes_count || 0}</span>
            {isLoggedIn && <button> Like</button>}
          </div>

          {/* Bookmarks */}
          <div>
            <span className="stat">🔖{bet.bookmarks_count || 0}</span>
            {isLoggedIn && <button> Bookmark</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetCard;
