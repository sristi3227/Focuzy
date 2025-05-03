// FocusTimer.jsx

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../Firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import FocusTimerDisplay from './FocusTimerDisplay';
import '../assets/focuzy.css';

const FocusTimer = () => {
  const [studyDuration, setStudyDuration] = useState(1500); // 25 minutes default
  const [breakDuration, setBreakDuration] = useState(300);  // 5 minutes default
  const [seconds, setSeconds] = useState(1500);
  const [isStudyTime, setIsStudyTime] = useState(true);
  const [active, setActive] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [customTime, setCustomTime] = useState('');
  const [customBreakTime, setCustomBreakTime] = useState('');
  const [totalCycles, setTotalCycles] = useState(2);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [alertCount, setAlertCount] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const audioRef = useRef(null);

  const [badges, setBadges] = useState([]);
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState('');
   
  const generateBadge = (score) => {
    if (score >= 90) return '🌟 Focus Master';
    if (score >= 75) return '🔥 On Fire';
    if (score >= 50) return '💪 Staying Strong';
    if (score > 0) return '🧠 Trying Hard';
    return '💤 Try Again';
  };
  

  const focusSessionsCollection = collection(db, 'focus_sessions');

  const sendAlert = async (message) => {
    try {
      await fetch('http://127.0.0.1:5000/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (message.includes("distracted")) {
        setAlertCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error sending alert:', err);
    }
    // Optional: Also announce in browser for instant feedback
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utter);
    }
  };

  const startDetection = async () => {
    try {
      await fetch('http://127.0.0.1:5000/start-detection');
    } catch (error) {
      console.error('Error starting detection:', error);
    }
  };

  const stopDetection = async () => {
    try {
      await fetch('http://127.0.0.1:5000/stop-detection');
    } catch (error) {
      console.error('Error stopping detection:', error);
    }
  };

  const pauseDetection = async () => {
    try {
      await fetch('http://127.0.0.1:5000/pause-detection');
    } catch (error) {
      console.error('Error pausing detection:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const q = query(focusSessionsCollection, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    let timer = null;

    if (active && seconds > 0) {
      timer = setInterval(() => setSeconds(prev => prev - 1), 1000);

      if (playMusic && audioRef.current) {
        audioRef.current.play().catch(err => console.warn("Autoplay blocked:", err));
      }
    } else if (seconds === 0 && active) {
      clearInterval(timer);
      handleSessionSwitch();
    } else {
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => clearInterval(timer);
  }, [active, seconds, playMusic]);

  useEffect(() => {
    let distractionChecker;
    
    const checkDistractions = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/check-distracted');
        const data = await response.json();
        if (data.distracted) {
          setDistractions(prev => prev + 1);
          await sendAlert("You seem distracted! Let's focus!");
        }
      } catch (error) {
        console.error('Error checking distractions:', error);
      }
    };

    if (active && isStudyTime) {
      distractionChecker = setInterval(checkDistractions, 1000);
    }

    return () => clearInterval(distractionChecker);
  }, [active, isStudyTime]);

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const setPreset = (studyMin, breakMin) => {
    setStudyDuration(studyMin * 60);
    setBreakDuration(breakMin * 60);
    setSeconds(studyMin * 60);
    setIsStudyTime(true);
    setActive(false);
    setCurrentCycle(1);
  };

  const handleSessionSwitch = async () => {
    if (isStudyTime) {
        if (breakDuration > 0) {
            await sendAlert("Study session completed. Break time started.");
            await pauseDetection();
            setIsStudyTime(false);
            setSeconds(breakDuration);
        } else {
            if (currentCycle < totalCycles) {
                setCurrentCycle(prev => prev + 1);
                setSeconds(studyDuration);
                await sendAlert("New study session starting.");
                await startDetection();
            } else {
                await endFocusSession(); // Natural completion
            }
        }
    } else {
        if (currentCycle < totalCycles) {
            setCurrentCycle(prev => prev + 1);
            setIsStudyTime(true);
            setSeconds(studyDuration);
            await sendAlert("Break over. Study session starting.");
            await startDetection();
        } else {
            await endFocusSession(); // Natural completion
        }
    }
  };

  const startFocusSession = async () => {
    setActive(true);
    setIsStudyTime(true);
    setSeconds(studyDuration);
    setCurrentCycle(1);
    setDistractions(0);
    setSessionStartTime(Date.now());
    await startDetection(); // Start detection for study time
    await sendAlert("Session started, let's focus!");
  };

  const stopFocusSession = async () => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    setActive(false);
    await stopDetection();
    await sendAlert("Session stopped manually - no badge earned");

    try {
        await addDoc(focusSessionsCollection, {
            duration: sessionDuration,
            musicPlayed: playMusic,
            totalCycles: currentCycle,
            plannedCycles: totalCycles,
            distractions: distractions,
            focusScore: 0,
            isCompleted: false,
            timestamp: serverTimestamp(),
        });
        await fetchSessions();
    } catch (error) {
        console.error('Error saving session:', error);
    }

    setDistractions(0);
    setSessionStartTime(null);
    setCurrentCycle(1);
    setIsStudyTime(true);
  };

  const endFocusSession = async () => {
    const focusScore = calculateFocusScore();

    const badge = generateBadge(focusScore);
    setBadges(prev => [...prev, badge]);

    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

    setActive(false);
    setCurrentCycle(1);
    setIsStudyTime(true);
    await stopDetection();
    await sendAlert(`Session ended with score: ${focusScore}%!`);

    try {
      await addDoc(focusSessionsCollection, {
        duration: sessionDuration,
        musicPlayed: playMusic,
        totalCycles: currentCycle,
        plannedCycles: totalCycles,
        distractions: distractions,
        focusScore: focusScore,
        timestamp: serverTimestamp(),
      });
      await fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
    }

    setDistractions(0);
    setSessionStartTime(null);
  };

  const handleCustomTimeSet = () => {
    const studyMinutes = parseInt(customTime, 10);
    const breakMinutes = parseInt(customBreakTime, 10);

    if (!isNaN(studyMinutes) && studyMinutes > 0 && !isNaN(breakMinutes) && breakMinutes >= 0) {
      setStudyDuration(studyMinutes * 60);
      setBreakDuration(breakMinutes * 60);
      setSeconds(studyMinutes * 60);
      setIsStudyTime(true);
      setActive(false);
      setCustomTime('');
      setCustomBreakTime('');
      setCurrentCycle(1);
    }
  };

  const calculateFocusScore = () => {
    // Base score starts at 100
    let score = 100;
  
    // Deduct 5 points per distraction, no cap
    score -= distractions * 5;
  
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const handleAddTodo = () => {
    if (todoInput.trim()) {
      const newTodo = {
        id: Date.now(),
        text: todoInput.trim(),
        completed: false
      };
      setTodos([...todos, newTodo]);
      setTodoInput('');
    }
  };

  const handleToggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <FocusTimerDisplay
      badges={badges}
      seconds={seconds}
      isStudyTime={isStudyTime}
      currentCycle={currentCycle}
      totalCycles={totalCycles}
      customTime={customTime}
      customBreakTime={customBreakTime}
      playMusic={playMusic}
      active={active}
      sessions={sessions}
      todos={todos}
      todoInput={todoInput}
      setCustomTime={setCustomTime}
      setCustomBreakTime={setCustomBreakTime}
      setTotalCycles={setTotalCycles}
      setPlayMusic={setPlayMusic}
      setTodoInput={setTodoInput}
      handleAddTodo={handleAddTodo}
      handleToggleTodo={handleToggleTodo}
      handleDeleteTodo={handleDeleteTodo}
      setPreset={setPreset}
      handleCustomTimeSet={handleCustomTimeSet}
      startFocusSession={startFocusSession}
      stopFocusSession={stopFocusSession}
      formatTime={formatTime}
      audioRef={audioRef}
    />
  );
};

export default FocusTimer;