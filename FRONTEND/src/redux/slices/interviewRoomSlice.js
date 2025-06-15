import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connectionStatus: 'disconnected', // disconnected, connecting, connected
  messages: [],
  timer: {
    remainingTime: 0,
    status: 'STOPPED', // 'RUNNING', 'PAUSED', 'STOPPED'
    lastUpdated: null
  },
  participants: [],
  currentQuestion: null,
  code: '',
  error: null,
  sharedNotes: '',
  interviewStatus: {
    status: 'NOT_STARTED', // 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'
    lastUpdated: null
  }
};

const interviewRoomSlice = createSlice({
  name: 'interviewRoom',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTimer: (state, action) => {
      state.timer = {
        ...state.timer,
        ...action.payload,
        lastUpdated: new Date().toISOString()
      };
    },
    updateParticipants: (state, action) => {
      state.participants = action.payload;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    updateCode: (state, action) => {
      state.code = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateInterviewStatus: (state, action) => {
      state.interviewStatus = {
        ...state.interviewStatus,
        ...action.payload,
        lastUpdated: new Date().toISOString()
      };
    },
    setSharedNotes: (state, action) => {
      state.sharedNotes = action.payload;
    },
    resetRoom: (state) => {
      return initialState;
    }
  }
});

export const {
  setConnectionStatus,
  addMessage,
  setTimer,
  updateParticipants,
  setCurrentQuestion,
  updateCode,
  setError,
  updateInterviewStatus,
  setSharedNotes,
  resetRoom
} = interviewRoomSlice.actions;

export default interviewRoomSlice.reducer; 