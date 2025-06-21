/**
 * NewBetModal component.
 * 
 * - Modal form for creating a new bet.
 * - Calls onSubmit with bet data on submit.
 */

import React, { useState } from "react";
import "../styles/NewBetModal.css";

const NewBetModal = ({ isOpen, onClose, onSubmit, userPoints }) => {
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const body = e.target.body.value;
    const evidence = e.target.evidence.value;
    const wager = Number(e.target.wager.value);

    if (wager > userPoints) {
      setError("You don't have enough points for this wager.");
      return;
    }

    onSubmit({ title, body, evidence, wager });
    setError("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">New Bet</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            name="title"
            placeholder='Bet title (e.g. "I bet I can run 5km daily")'
            required
          />
          <textarea
            name="body"
            placeholder="Explain your bet..."
            rows="4"
          />
          <textarea
            name="evidence"
            placeholder="What will be considered acceptable evidence?"
            rows={3}
            required
          />
          <input
            type="number"
            name="wager"
            placeholder="Enter wager amount"
            min="1"
            max={userPoints}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" className="submit-button">Post Bet</button>
        </form>
      </div>
    </div>
  );
};

export default NewBetModal;
