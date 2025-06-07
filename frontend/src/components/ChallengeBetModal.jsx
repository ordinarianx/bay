/**
 * ChallengeBetModal component.
 * 
 * - Modal form for challenging a bet.
 * - Validates wager and calls onSubmit.
 */

import React, { useState, useEffect } from "react";
import "../styles/main.css";

const ChallengeBetModal = ({
  isOpen,
  onClose,
  onSubmit,
  bet,
  minWager
}) => {
  const [wagerInput, setWagerInput] = useState(minWager);
  const [error, setError] = useState("");

  useEffect(() => {
    setWagerInput(minWager);
    setError("");
  }, [isOpen, minWager]);

  if (!isOpen || !bet) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (wagerInput < minWager) {
      setError(`Wager must be at least ${minWager}`);
      return;
    }
    setError("");
    onSubmit(wagerInput, setError, setWagerInput);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Challenge Bet</h3>
        <div style={{ marginBottom: 16 }}>
          <div>
            <b>{bet.title}</b>{" "}
            <span style={{ fontSize: 14, color: "#888" }}>by @{bet.username}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Wager (min {minWager}):
            <input
              type="number"
              min={minWager}
              value={wagerInput}
              onChange={e => setWagerInput(Number(e.target.value))}
              required
            />
          </label>
          {error && <div className="error">{error}</div>}
          <div className="modal-actions">
            <button type="submit">Challenge</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeBetModal;
// This component is used to challenge a bet by submitting a wager.
// It includes input validation and displays an error message if the wager is below the minimum required amount.