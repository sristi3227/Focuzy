import React from 'react';
import logo from '../assets/logo.png';

const FocusTimerDisplay = ({
  badges,
  seconds,
  isStudyTime,
  currentCycle,
  totalCycles,
  customTime,
  customBreakTime,
  playMusic,
  active,
  sessions,
  setCustomTime,
  setCustomBreakTime,
  setTotalCycles,
  setPlayMusic,
  setPreset,
  handleCustomTimeSet,
  startFocusSession,
  stopFocusSession,
  formatTime,
  audioRef
}) => {
  return (
    <div className="focus-container">
      <div className="logo-container">
        <img src={logo} alt="Focuzy Logo" className="app-logo" />
        <h2 className="app-title">🌸 Pomodoro Timer</h2>
      </div>

      <div className="gif-box">
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2t4bWk5NXJvMjc5ZmQ0MGJlNmNndG0zZndybjc1OWJuODY2YXI4dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/rF0FQyoIW9GXiJVJwo/giphy.gif"
          alt="Cute Studying Cat"
          className="cat-gif"
        />
      </div>

      <div className="badges-container">
        <h3>🏅 Badges Earned This Session</h3>
        <p>Complete a session to earn a badge and view your score</p>
        <div className="badges-list">
          {badges.map((badge, index) => (
            <span key={index} className="badge">{badge}</span>
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <div className="timer-box">
        <p className="timer-text">
          {isStudyTime ? "📖 Study Time" : "☕ Break Time"} 
          <p className="timer-count">⏱️ {formatTime(seconds)}</p>
        </p>
        <p>Cycle: {currentCycle} / {totalCycles}</p>
      </div>

      {/* Controls */}
      <div className="preset-buttons">
        <button onClick={() => setPreset(25, 5)}>🍅 25m Study / 5m Break</button>
        <button onClick={() => setPreset(50, 10)}>📚 50m Study / 10m Break</button>
      </div>

      {/* Custom Timer Settings */}
      <div className="custom-timer">
        <input
          type="number"
          placeholder="Custom Study Min"
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
        />
        <input
          type="number"
          placeholder="Custom Break Min"
          value={customBreakTime}
          onChange={(e) => setCustomBreakTime(e.target.value)}
        />
        <button onClick={handleCustomTimeSet}>Set Custom Timer</button>
      </div>

      {/* Cycle Settings */}
      <div className="custom-cycles">
        <input
          type="number"
          placeholder="Cycles"
          value={totalCycles}
          onChange={(e) => setTotalCycles(parseInt(e.target.value) || 1)}
        />
      </div>

      {/* Music Toggle */}
      <label className="music-toggle">
        <input
          type="checkbox"
          checked={playMusic}
          onChange={(e) => setPlayMusic(e.target.checked)}
        />
        🎵 Light Study Music
      </label>

      {/* Control Buttons */}
      <div className="button-group">
        <button 
          className="start-btn" 
          onClick={startFocusSession} 
          disabled={active || seconds === 0}
        >
          ▶️ Start
        </button>
        <button 
          className="stop-btn" 
          onClick={stopFocusSession}
          disabled={!active}
        >
          ⏹️ Stop
        </button>
      </div>

      <audio ref={audioRef} loop src="/study_music.mp3" />

      {/* Session History */}
      <h3>📚 Session History</h3>
      <div className="session-history-container">
        <table className="session-table">
          <thead>
            <tr>
              <th>Duration</th>
              <th>Cycles</th>
              <th>Focus Score</th>
              <th>Distractions</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{Math.floor(session.duration / 60)}m {session.duration % 60}s</td>
                <td>{session.totalCycles}/{session.plannedCycles}</td>
                <td>
                  {session.focusScore >= 90 ? "🏆" : 
                   session.focusScore >= 70 ? "🌟" : 
                   session.focusScore >= 50 ? "⭐" : "💪"} 
                  {session.focusScore}%
                </td>
                <td>{session.distractions} {session.distractions === 1 ? "distraction" : "distractions"}</td>
                <td>{session.timestamp?.toDate().toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FocusTimerDisplay;