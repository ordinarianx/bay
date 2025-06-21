import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/betcard.css";

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

  // Local state for likes/bookmarks
  const [likesCount, setLikesCount] = useState(bet.likes_count || 0);
  const [bookmarksCount, setBookmarksCount] = useState(bet.bookmarks_count || 0);
  const [liked, setLiked] = useState(bet.liked_by_user || false);
  const [bookmarked, setBookmarked] = useState(bet.bookmarked_by_user || false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Like handler
  const handleLike = async () => {
    if (!isLoggedIn || likeLoading) return;
    setLikeLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/bets/${bet.id}/like`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(!liked);
        setLikesCount(Number(data.likesCount));
      }
    } catch (e) {
      // Optionally show error
    }
    setLikeLoading(false);
  };

  // Bookmark handler
  const handleBookmark = async () => {
    if (!isLoggedIn || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const method = bookmarked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/bets/${bet.id}/bookmark`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(!bookmarked);
        setBookmarksCount(Number(data.bookmarksCount));
      }
    } catch (e) {
      // Optionally show error
    }
    setBookmarkLoading(false);
  };

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
            {(name && username) && (
              <span className="name">{name}</span>
            )}
            {(name && username) && ` @${username}`}
          </Link>{" "}
        </div>
        <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {bet.title}
          {bet.status === "challenged" && bet.challenger_username ? (
            <button
              className={`bet-status-badge status-challenged`}
              style={{
                padding: "2px 10px",
                borderRadius: "12px",
                fontSize: "0.85em",
                fontWeight: 600,
                background: "#f39c12",
                color: "#fff",
                marginLeft: "8px",
                textTransform: "capitalize",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => window.open(`/profile/${bet.challenger_username}`, "_self")}
              title={`View challenger: @${bet.challenger_username}`}
            >
              Challenged
            </button>
          ) : (
            bet.status && (
              <span
                className={`bet-status-badge status-${bet.status}`}
                style={{
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontSize: "0.85em",
                  fontWeight: 600,
                  background:
                    bet.status === "open"
                      ? "#1da1f2"
                      : bet.status === "resolved"
                      ? "#27ae60"
                      : "#888",
                  color: "#fff",
                  marginLeft: "8px",
                  textTransform: "capitalize",
                }}
              >
                {bet.status}
              </span>
            )
          )}
        </div>
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
        <div className="card-actions" style={{ gap: "20px", display: "flex" }}>
          {/* Challenge */}
          <div>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: isLoggedIn && !isOwner ? "pointer" : "default",
                fontSize: "1.2em",
                opacity: isLoggedIn && !isOwner ? 1 : 0.5,
                padding: 0,
              }}
              onClick={isLoggedIn && !isOwner ? onChallengeClick : undefined}
              disabled={!isLoggedIn || isOwner}
              title="Challenge"
            >
              ⚔️
            </button>
            <span className="stat" style={{ marginLeft: 6, fontWeight: 500, fontSize: "1em", verticalAlign: "middle", color: "inherit", minWidth: 18, display: "inline-block", textAlign: "center" }}>{bet.challenge_amount || 0}</span>
          </div>

          {/* Likes */}
          <div>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: isLoggedIn ? "pointer" : "default",
                color: liked ? "red" : "#888", // Red when liked, gray otherwise
                fontSize: "1.2em",
                padding: 0,
                transition: "color 0.2s",
                outline: "none",
              }}
              onClick={isLoggedIn && !likeLoading ? handleLike : undefined}
              disabled={!isLoggedIn || likeLoading}
              title={liked ? "Unlike" : "Like"}
              aria-pressed={liked}
            >
              ❤️
            </button>
            <span className="stat" style={{ marginLeft: 6, fontWeight: 500, fontSize: "1em", verticalAlign: "middle", color: "inherit", minWidth: 18, display: "inline-block", textAlign: "center" }}>{Number(likesCount)}</span>
          </div>

          {/* Bookmarks */}
          <div>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: isLoggedIn ? "pointer" : "default",
                color: bookmarked ? "#007bff" : undefined,
                fontSize: "1.2em",
                padding: 0,
              }}
              onClick={isLoggedIn ? handleBookmark : undefined}
              disabled={!isLoggedIn || bookmarkLoading}
              title={bookmarked ? "Unbookmark" : "Bookmark"}
            >
              🔖
            </button>
            <span className="stat" style={{ marginLeft: 6, fontWeight: 500, fontSize: "1em", verticalAlign: "middle", color: "inherit", minWidth: 18, display: "inline-block", textAlign: "center" }}>{Number(bookmarksCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetCard;
