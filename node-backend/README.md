# SkillSage WebRTC Signaling Server

This is a WebRTC signaling server for the SkillSage coding interview platform. It enables video calling and screen sharing between recruiters and candidates during interview sessions.

## Features

- Real-time video calling between recruiters and candidates
- Screen sharing from candidate side
- Room-based connections using interview IDs
- Open API without authentication
- WebSocket-based signaling using Socket.IO

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```bash
# Install dependencies
npm install
```

### Running the Server

```bash
# Start the server
npm start

# For development with auto-reload
npm run dev
```

The server will run on port 5000 by default. You can change this by setting the `PORT` environment variable.

## API Documentation

### WebSocket Events

#### Client to Server

- `join-room`: Join an interview room
  ```javascript
  socket.emit('join-room', {
    interviewId: 'interview-123',
    userRole: 'recruiter' // or 'candidate'
  });
  ```

- `signal`: Send WebRTC signaling data
  ```javascript
  socket.emit('signal', {
    to: 'recipient-socket-id',
    from: 'sender-socket-id',
    signal: {}, // RTCSessionDescription (offer/answer)
    type: 'offer' // or 'answer'
  });
  ```

- `ice-candidate`: Send ICE candidates
  ```javascript
  socket.emit('ice-candidate', {
    to: 'recipient-socket-id',
    candidate: {} // RTCIceCandidate
  });
  ```

- `screen-share-status`: Update screen sharing status
  ```javascript
  socket.emit('screen-share-status', {
    interviewId: 'interview-123',
    isSharing: true // or false
  });
  ```

#### Server to Client

- `user-joined`: Notifies when a user joins the room
- `room-users`: Provides list of users in the room
- `signal`: Forwards WebRTC signaling data
- `ice-candidate`: Forwards ICE candidates
- `user-left`: Notifies when a user leaves the room
- `screen-share-status`: Updates on screen sharing status changes

## Frontend Integration

The server works with the provided React hooks (`useWebRTC.js`) to handle WebRTC connections. The hook manages:

1. Connecting to the signaling server
2. Joining interview rooms
3. Establishing peer connections
4. Handling video and screen sharing streams
5. Managing connection state

## License

This project is licensed under the ISC License.
