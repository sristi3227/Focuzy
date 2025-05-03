import React, { useEffect, useState } from 'react';
import { db } from '../Firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../assets/focuzy.css';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const q = query(collection(db, 'focus_sessions'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSessions(data);
      } catch (error) {
        console.error('Error fetching session history:', error);
      }
    };

    fetchSessions();
  }, []);

  const getSessionRemark = (focusScore, totalCycles, plannedCycles) => {
    if (focusScore >= 80) return 'Excellent focus!';
    if (focusScore >= 60) return 'Good job!';
    if (focusScore >= 40) return 'Keep improving!';
    return 'Needs more focus!';
  };

  return (
    <div className="focus-container">
      <div className="header-container">
        <Link to="/" className="back-btn">← Back to Timer</Link>
        <h2>📚 Session History</h2>
      </div>
      <div className="session-history-container">
        <table className="session-table">
          <thead>
            <tr>
              <th>Duration</th>
              <th>Cycles</th>
              <th>Distractions</th>
              <th>Focus Score</th>
              <th>Remarks</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const focusScore = session.focusScore || 0;
              const distractions = session.distractions || 0;
              const scoreClass = 
                focusScore >= 80 ? 'excellent-score' :
                focusScore >= 60 ? 'good-score' :
                focusScore >= 40 ? 'average-score' : 'needs-improvement-score';
              
              return (
                <tr key={session.id}>
                  <td>{Math.floor(session.duration / 60)}m {session.duration % 60}s</td>
                  <td>{session.totalCycles}/{session.plannedCycles}</td>
                  <td className={`distraction-cell ${distractions > 5 ? 'high-distractions' : ''}`}>
                    {distractions} {distractions > 5 ? '⚠️' : '🎯'}
                  </td>
                  <td className={scoreClass}>
                    {focusScore}% {focusScore >= 80 ? '🌟' : focusScore >= 60 ? '⭐' : '✨'}
                  </td>
                  <td className="feedback-cell">
                    {getSessionRemark(focusScore, session.totalCycles, session.plannedCycles)}
                  </td>
                  <td>{session.timestamp?.toDate().toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionHistory;