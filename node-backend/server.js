import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // In production, replace with your frontend URL
    methods: ['GET', 'POST']
  }
});

// Enable CORS for Express routes
app.use(cors());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('SkillSage WebRTC Signaling Server is running');
});

// Store active rooms and their participants
const rooms = {};

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join interview room
  socket.on('join-room', ({ interviewId, userRole }) => {
    console.log(`User ${socket.id} joining room ${interviewId} as ${userRole}`);
    
    // Create room if it doesn't exist
    if (!rooms[interviewId]) {
      rooms[interviewId] = { 
        participants: {},
        messages: [], // Store chat messages for the room
        codeUpdates: {}, // Store code updates for each question
        currentQuestionIndex: 0 // Track current question index
      };
    }
    
    // Add participant to room with their role
    rooms[interviewId].participants[socket.id] = { userRole };
    
    // Join the socket.io room
    socket.join(interviewId);
    
    // Notify others in the room
    socket.to(interviewId).emit('user-joined', {
      userId: socket.id,
      userRole
    });
    
    // Send list of existing participants to the new user
    const participants = rooms[interviewId].participants;
    socket.emit('room-users', participants);

    // Send chat history to the new user
    socket.emit('chat-history', rooms[interviewId].messages);

    // Send current code state and question index to the new user
    socket.emit('code-state', {
      codeUpdates: rooms[interviewId].codeUpdates,
      currentQuestionIndex: rooms[interviewId].currentQuestionIndex
    });
    
    console.log(`Room ${interviewId} participants:`, participants);
  });

  // Handle code updates
  socket.on('code-update', ({ interviewId, questionId, code, language, currentQuestionIndex }) => {
    console.log(`Code update from ${socket.id} in room ${interviewId} for question ${questionId}`);
    
    // Store the code update in the room
    if (rooms[interviewId]) {
      rooms[interviewId].codeUpdates[questionId] = {
        code,
        language,
        currentQuestionIndex,
        lastUpdated: new Date().toISOString(),
        updatedBy: socket.id
      };
      
      // Broadcast code update to all participants in the room
      io.in(interviewId).emit('code-update', {
        questionId,
        code,
        language,
        currentQuestionIndex,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Broadcasted code update to room ${interviewId}`);
    }
  });

  // Handle question change
  socket.on('question-change', ({ interviewId, questionId, currentQuestionIndex }) => {
    console.log(`Question change in room ${interviewId} to question ${questionId}`);
    
    if (rooms[interviewId]) {
      // Update the current question index in the room state
      rooms[interviewId].currentQuestionIndex = currentQuestionIndex;
      
      // Broadcast question change to all participants
      io.in(interviewId).emit('question-change', {
        questionId,
        currentQuestionIndex,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle language change
  socket.on('language-change', ({ interviewId, questionId, language, currentQuestionIndex }) => {
    console.log(`Language change in room ${interviewId} for question ${questionId} to ${language}`);
    
    if (rooms[interviewId]) {
      // Update the language in the room state
      if (rooms[interviewId].codeUpdates[questionId]) {
        rooms[interviewId].codeUpdates[questionId].language = language;
      }
      
      // Broadcast language change to all participants
      io.in(interviewId).emit('language-change', {
        questionId,
        language,
        currentQuestionIndex,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle chat messages
  socket.on('chat-message', ({ interviewId, content, userRole }) => {
    console.log(`Chat message from ${socket.id} in room ${interviewId}: ${content}`);
    
    const message = {
      id: Date.now(),
      content,
      timestamp: new Date().toISOString(),
      sender: userRole
    };

    // Store message in room history
    if (rooms[interviewId]) {
      rooms[interviewId].messages.push(message);
      
      // Broadcast message to all participants in the room, including sender
      io.in(interviewId).emit('chat-message', {
        ...message,
        isOwn: false // Let the client determine if it's their own message
      });
      
      console.log(`Broadcasted message to room ${interviewId}`);
    } else {
      console.log(`Room ${interviewId} not found`);
    }
  });

  // Handle WebRTC signaling
  socket.on('signal', ({ to, from, signal, type, isScreenShare }) => {
    console.log(`Signal ${type} from ${from} to ${to}${isScreenShare ? ' (screen share)' : ''}`);
    io.to(to).emit('signal', {
      from,
      signal,
      type,
      isScreenShare
    });
  });
  
  // Handle screen sharing status
  socket.on('screen-share-status', ({ interviewId, isSharing }) => {
    console.log(`User ${socket.id} screen sharing status: ${isSharing}`);
    socket.to(interviewId).emit('screen-share-status', {
      userId: socket.id,
      isSharing
    });
  });
  
  // Handle ICE candidates
  socket.on('ice-candidate', ({ to, candidate, isScreenShare }) => {
    console.log(`ICE candidate from ${socket.id} to ${to}${isScreenShare ? ' (screen share)' : ''}`);
    io.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate,
      isScreenShare
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find and remove user from all rooms
    Object.entries(rooms).forEach(([interviewId, room]) => {
      if (room.participants[socket.id]) {
        delete room.participants[socket.id];
        
        // Notify others in the room
        socket.to(interviewId).emit('user-left', {
          userId: socket.id
        });
        
        // Clean up empty rooms
        if (Object.keys(room.participants).length === 0) {
          delete rooms[interviewId];
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
