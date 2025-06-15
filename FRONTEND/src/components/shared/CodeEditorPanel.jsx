import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import { CHAT_SERVER_URL } from "@/imports/baseUrl";

export default function CodeEditorPanel({ 
  language, 
  setLanguage, 
  code, 
  setCode, 
  editorRef, 
  onSubmit, 
  submitting,
  interviewId,
  currentQuestionId,
  currentQuestionIndex,
  isRecruiter = false 
}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(CHAT_SERVER_URL);

    // Join the interview room
    socketRef.current.emit('join-room', {
      interviewId,
      userRole: isRecruiter ? 'recruiter' : 'candidate'
    });

    // Handle connection status
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to socket server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket server');
    });

    // Listen for initial code state
    socketRef.current.on('code-state', ({ codeUpdates, currentQuestionIndex: serverQuestionIndex }) => {
      console.log('Received initial code state:', codeUpdates);
      if (codeUpdates[currentQuestionId]) {
        setCode(codeUpdates[currentQuestionId].code);
        setLanguage(codeUpdates[currentQuestionId].language);
      }
    });

    // Listen for code updates
    socketRef.current.on('code-update', (update) => {
      console.log('Received code update:', update);
      if (update.questionId === currentQuestionId) {
        setCode(update.code);
        setLanguage(update.language);
      }
    });

    // Listen for question changes
    socketRef.current.on('question-change', (change) => {
      console.log('Received question change:', change);
      // The parent component will handle the question change
    });

    // Listen for language changes
    socketRef.current.on('language-change', (change) => {
      console.log('Received language change:', change);
      if (change.questionId === currentQuestionId) {
        setLanguage(change.language);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [interviewId, currentQuestionId, isRecruiter]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socketRef.current && isConnected) {
      socketRef.current.emit('code-update', {
        interviewId,
        questionId: currentQuestionId,
        code: newCode,
        language,
        currentQuestionIndex
      });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (socketRef.current && isConnected) {
      socketRef.current.emit('language-change', {
        interviewId,
        questionId: currentQuestionId,
        language: newLanguage,
        currentQuestionIndex
      });
    }
  };

  return (
    <div className="border rounded-lg p-2 bg-background">
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="language-select" className="text-sm">Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          disabled
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        {!isRecruiter && (
          <button
            className="ml-auto px-3 py-1 bg-primary text-white rounded text-sm"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Code"}
          </button>
        )}
        <div className={`ml-2 px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={handleCodeChange}
        onMount={editor => (editorRef.current = editor)}
        theme="vs-dark"
        options={{ 
          minimap: { enabled: false }, 
          fontSize: 14, 
          wordWrap: "on"
        }}
      />
    </div>
  );
}
