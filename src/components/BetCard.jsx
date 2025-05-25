import React from "react";
import "../styles/main.css";

const BetCard = ({ bet }) => {
  return (
    <div className="bet-card">
      <img
        src="https://i.pravatar.cc/40"
        alt="avatar"
        className="avatar"
      />
      <div className="card-content">
        <div className="card-header">
          <span className="name">John Doe</span> @johndoe · 2h
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

        <div className="card-actions">
          <button>⚔️ Challenge</button>
          <button>❤️ Like</button>
          <button>🔖 Bookmark</button>
        </div>
      </div>
    </div>
  );
};

export default BetCard;
