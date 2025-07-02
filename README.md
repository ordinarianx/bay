# 🧠 BAY – A Self-Improvement Betting Platform

BAY is a full-stack platform that gamifies personal growth. Users post and challenge real-life bets to commit to their goals—risking points to stay accountable.

---

## 🧩 Problem

Self-improvement often falters due to lack of accountability and structure. Traditional habit trackers are passive and easy to ignore. Users need an engaging way to commit to goals and maintain momentum—especially when motivation fades.

---

## 💡 Solution

BAY introduces a challenge-based gamified system where users stake points on personal commitments. Others can challenge their bets, creating a social contract that encourages follow-through. It’s self-improvement with skin in the game.

---

## ✨ Features

- 🔐 **Authentication** – Secure user signup and login with session persistence  
  _Implemented: signup/login forms with backend integration, session management_

- 🎯 **Bet Submission** – Modal-based form to create and post personal bets  
  _Implemented: overlay modal for posting bets, validation, point wager required_

- 💬 **Challenge Mechanism** – Other users can challenge bets, enforcing accountability  
  _Implemented: Challenge modal with wager validation, challenge amount stats_

- 📈 **Point System** – Users start with 10 points and wager them on goals  
  _Implemented: points assigned on signup, wager system integrated_

- 🗂 **Backend Optimization** – Efficient routing and modular logic for scalability  
  _Partially implemented: modular Express routes, PostgreSQL backend_

- 🪄 **Gamified Flow** – Commitment becomes a game with real stakes and progress tracking  
  _Partially implemented: bet statuses, challenge flows; win/loss and point transfer pending_

- 👤 **User Profiles** – Public profile pages with bet history and bookmarks  
  _Implemented: profile UI with tabs for bet history and bookmarks, routing_

- 📊 **Stats Display** – Display challenge amount, likes, bookmarks counts beside buttons  
  _Implemented: BetCard UI updated to show stats even when logged out_

- 🔒 **Session-based Logout Button** – Logout button visible on all pages when logged in  
  _Implemented: logout UI and logic on BetFeed and Profile pages_

- 🧪 **Testing with Vitest** – Backend API tests migrated from Jest to Vitest for simplicity  
  _Implemented: basic API tests running with Vitest_

---

## Screenshots
-----------------

### Homepage
![image](https://github.com/user-attachments/assets/84a99bc9-e8d9-4639-9bbc-9df119e324a6)

### Profile page
![image](https://github.com/user-attachments/assets/40af3619-cfa1-446e-86d6-d3b1813e1d3d)

### New bet overlay
![image](https://github.com/user-attachments/assets/7b1e4c9d-6b42-42ab-aba1-eb8e12c6f649)


