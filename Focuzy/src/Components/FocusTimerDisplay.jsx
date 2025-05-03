import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { musicOptions } from '../utils/musicOptions';

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
  audioRef,
  selectedMusic,
  setSelectedMusic,
  todoInput,
  setTodoInput,
  todos,
  handleAddTodo,
  handleToggleTodo,
  handleDeleteTodo
}) => {
  return (
    <div className="focus-wrapper">
      <div className="focus-container">
        {/* Logo Container - Moved to top */}
        <div className="logo-container">
          <img src={logo} alt="Focuzy Logo" className="app-logo" />
          <h2 className="app-title">Focuzy</h2>
        </div>

        {/* Todo List Section */}
        <div className="todo-container">
          <h3>📝 Study Tasks</h3>
          <div className="todo-input-container">
            <input
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              placeholder="Add a new task..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              className="todo-input"
            />
            <button onClick={handleAddTodo} className="add-todo-btn">➕</button>
          </div>
          <div className="todo-list">
            {todos.map((todo) => (
              <div key={todo.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                  {todo.text}
                </span>
                <button 
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="delete-todo-btn"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <div className="timer-box">
          <div className="timer-content">
            <p className="timer-text">
              {isStudyTime ? "📖 Study Time" : "☕ Break Time"} 
              <p className="timer-count">⏱️ {formatTime(seconds)}</p>
            </p>
            <p>Cycle: {currentCycle} / {totalCycles}</p>
          </div>
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

        {/* Music Controls */}
        <div className="music-controls">
          <div className="music-selection">
            <select
              value={selectedMusic}
              onChange={(e) => setSelectedMusic(e.target.value)}
              disabled={active}
            >
              <option value="">Select Music</option>
              {musicOptions.map((music) => (
                <option key={music.id} value={music.src}>
                  🎵 {music.name}
                </option>
              ))}
            </select>
          </div>
          <label className="music-toggle">
            <input
              type="checkbox"
              checked={playMusic}
              onChange={(e) => setPlayMusic(e.target.checked)}
              disabled={!selectedMusic}
            />
            Enable Music
          </label>
        </div>

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
          <Link to="/history">
            <button className="history-btn">📚 View Session History</button>
          </Link>
        </div>

        <audio ref={audioRef} loop src={selectedMusic} />
      </div>
    </div>
  );
};

export default FocusTimerDisplay;