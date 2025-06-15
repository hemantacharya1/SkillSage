import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { CHAT_SERVER_URL } from "@/imports/baseUrl";

// Use window.location.hostname to make it work across different networks
const SIGNALING_SERVER_URL = CHAT_SERVER_URL

console.log(SIGNALING_SERVER_URL, "ppppppppppp");
/**
 * Custom hook for WebRTC functionality
 * @param {string} interviewId - The ID of the interview
 * @param {string} userRole - The role of the user ('recruiter' or 'candidate')
 * @returns {Object} WebRTC state and functions
 */
export const useWebRTC = (interviewId, userRole) => {
  const [isConnected, setIsConnected] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState({});
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});

  // Determine if this user is the initiator (recruiter initiates the call)
  const isInitiator = userRole === "recruiter";

  // Initialize socket connection
  useEffect(() => {
    if (!interviewId) return;

    console.log(
      `Connecting to signaling server as ${userRole} for interview ${interviewId}`
    );

    // Connect to signaling server
    socketRef.current = io(SIGNALING_SERVER_URL);

    // Handle connection events
    socketRef.current.on("connect", () => {
      console.log("Connected to signaling server");

      // Join interview room
      socketRef.current.emit("join-room", {
        interviewId,
        userRole,
      });
    });

    // Handle existing room users
    socketRef.current.on("room-users", (users) => {
      console.log("Room users:", users);
      setParticipants(users);

      // If we're not the initiator and there's a recruiter in the room, we should start the connection
      if (!isInitiator) {
        const recruiters = Object.entries(users).filter(
          ([id, user]) =>
            user.userRole === "recruiter" && id !== socketRef.current.id
        );

        if (recruiters.length > 0) {
          console.log("Recruiter is in the room, waiting for their offer");
          // The non-initiator (candidate) waits for the offer from the recruiter
        }
      }
    });

    // Handle new user joining
    socketRef.current.on("user-joined", ({ userId, userRole }) => {
      console.log(`User joined: ${userId} as ${userRole}`);
      setParticipants((prev) => ({
        ...prev,
        [userId]: { userRole },
      }));

      // If we're the initiator (recruiter), create offer for the new user
      if (isInitiator && localStreamRef.current) {
        createPeerConnection(userId);
      }
    });

    // Handle user leaving
    socketRef.current.on("user-left", ({ userId }) => {
      console.log(`User left: ${userId}`);

      // Remove regular peer connection
      if (peerConnectionsRef.current[userId]) {
        peerConnectionsRef.current[userId].close();
        delete peerConnectionsRef.current[userId];
      }

      // Remove screen share peer connection
      const screenShareId = `${userId}-screen`;
      if (peerConnectionsRef.current[screenShareId]) {
        peerConnectionsRef.current[screenShareId].close();
        delete peerConnectionsRef.current[screenShareId];
      }

      // Remove remote streams (both regular and screen share)
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        delete newStreams[screenShareId];
        return newStreams;
      });

      // Remove from participants
      setParticipants((prev) => {
        const newParticipants = { ...prev };
        delete newParticipants[userId];
        return newParticipants;
      });
    });

    // Handle signaling messages
    socketRef.current.on("signal", async ({ from, signal, type, isScreenShare }) => {
      console.log(`Received ${type} from ${from}`, signal, isScreenShare ? '(screen share)' : '');
      if (isScreenShare) {
        console.log('SIGNAL HANDLER: This is a screen share offer/answer.');
      }

      try {
        // Determine the connection ID based on whether this is a screen share signal
        const connectionId = isScreenShare ? `${from}-screen` : from;
        let pc = peerConnectionsRef.current[connectionId];

        if (type === "offer") {
          console.log(`Processing ${isScreenShare ? 'screen share ' : ''}offer from ${from}`);

          // Auto-start local stream for non-initiator (candidate) when receiving an offer
          if (!isInitiator && !localStreamRef.current && !isScreenShare) {
            console.log(
              "Auto-starting local stream as non-initiator on offer receipt"
            );
            await startLocalStream();
          }

          // If we receive an offer, we need to create a peer connection if it doesn't exist
          if (!pc) {
            console.log(
              `Creating new peer connection for ${connectionId} after receiving offer`
            );
            pc = await createPeerConnection(connectionId);
          }

          // Reset the connection if it's in an incompatible state
          if (
            pc.signalingState !== "stable" &&
            pc.signalingState !== "have-local-offer"
          ) {
            console.log(`Resetting connection in state: ${pc.signalingState}`);
            await pc.close();
            pc = await createPeerConnection(connectionId);
          }

          // Check if the connection is closed before setting remote description
          if (pc.signalingState === "closed") {
            console.warn("Tried to setRemoteDescription on a closed connection, skipping.");
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(signal));

          // Process any pending ICE candidates
          if (pc._pendingIceCandidates && pc._pendingIceCandidates.length > 0) {
            console.log(
              `Processing ${pc._pendingIceCandidates.length} pending ICE candidates for ${from}`
            );

            // Wait a short time to ensure remote description is fully processed
            await new Promise((resolve) => setTimeout(resolve, 100));

            const pendingCandidates = [...pc._pendingIceCandidates];
            pc._pendingIceCandidates = [];

            for (const candidate of pendingCandidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                console.log(
                  `Successfully added pending ICE candidate for ${from}`
                );
              } catch (err) {
                console.error(
                  `Error adding pending ICE candidate: ${err.message}, connection state: ${pc.connectionState}, signaling state: ${pc.signalingState}`
                );
                // If still failing, re-queue for next attempt
                if (
                  err.message.includes("Failed to execute 'addIceCandidate'")
                ) {
                  console.log(
                    "Re-queueing problematic ICE candidate for later attempt"
                  );
                  pc._pendingIceCandidates.push(candidate);
                }
              }
            }
          }

          // Create answer
          console.log(`Creating ${isScreenShare ? 'screen share ' : ''}answer for ${from}`);
          const answer = await pc.createAnswer();
          console.log(`Setting local description (answer) for ${from}`);
          await pc.setLocalDescription(answer);

          // Send answer to the peer
          console.log(`Sending ${isScreenShare ? 'screen share ' : ''}answer to ${from}`);
          socketRef.current.emit("signal", {
            to: from,
            from: socketRef.current.id,
            signal: answer,
            type: "answer",
            isScreenShare: isScreenShare, // Preserve the screen share flag
          });
        } else if (type === "answer") {
          console.log(`Processing ${isScreenShare ? 'screen share ' : ''}answer from ${from}`);

          if (!pc) {
            console.error(
              `No peer connection found for ${connectionId} when processing answer`
            );
            return;
          }

          // Only set remote description if we're in the correct state and not closed
          if (pc.signalingState === "closed") {
            console.warn("Tried to setRemoteDescription on a closed connection, skipping.");
            return;
          }
          if (pc.signalingState === "have-local-offer") {
            console.log(`Setting remote description (${isScreenShare ? 'screen share ' : ''}answer) for ${from}`);
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            console.log(`${isScreenShare ? 'Screen share c' : 'C'}onnection setup complete with ${from}`);

            // Process any pending ICE candidates after setting remote description
            if (
              pc._pendingIceCandidates &&
              pc._pendingIceCandidates.length > 0
            ) {
              console.log(
                `Processing ${pc._pendingIceCandidates.length} pending ICE candidates for ${from} after setting answer`
              );

              // Wait a short time to ensure remote description is fully processed
              await new Promise((resolve) => setTimeout(resolve, 100));

              const pendingCandidates = [...pc._pendingIceCandidates];
              pc._pendingIceCandidates = [];

              for (const candidate of pendingCandidates) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  console.log(
                    `Successfully added pending ICE candidate for ${from} after answer`
                  );
                } catch (err) {
                  console.error(
                    `Error adding pending ICE candidate after answer: ${err.message}, connection state: ${pc.connectionState}, signaling state: ${pc.signalingState}`
                  );
                }
              }
            }
          } else {
            console.warn(
              `Cannot set remote answer in current signaling state: ${pc.signalingState}. Ignoring answer.`
            );
          }
        }
      } catch (err) {
        console.error("Error handling signal:", err);
        setError(`Signal handling error: ${err.message}`);
      }
    });

    // Handle ICE candidates
    socketRef.current.on("ice-candidate", async ({ from, candidate, isScreenShare }) => {
      console.log(`Received ICE candidate from ${from}:`, candidate, isScreenShare ? '(screen share)' : '');
      try {
        // Determine the connection ID based on whether this is a screen share candidate
        const connectionId = isScreenShare ? `${from}-screen` : from;
        let pc = peerConnectionsRef.current[connectionId];

        // If we don't have a peer connection yet, create one and queue the candidate
        if (!pc) {
          console.log(
            `No peer connection for ${connectionId} yet, creating one and queueing candidate`
          );
          pc = await createPeerConnection(connectionId);
          if (!pc._pendingIceCandidates) {
            pc._pendingIceCandidates = [];
          }
          pc._pendingIceCandidates.push(candidate);
          return;
        }

        // Check if the connection is in a state where it can accept ICE candidates
        if (pc.remoteDescription && pc.remoteDescription.type) {
          console.log(
            `Adding ICE candidate from ${from}, connection state: ${pc.connectionState}, signaling state: ${pc.signalingState}`
          );
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (icErr) {
            console.warn(
              `Failed to add ICE candidate immediately, queueing instead: ${icErr.message}`
            );
            // If adding fails, queue it anyway
            if (!pc._pendingIceCandidates) {
              pc._pendingIceCandidates = [];
            }
            pc._pendingIceCandidates.push(candidate);
          }
        } else {
          // If we receive ICE candidates before setting the remote description,
          // we need to queue them and add them later
          console.log(
            `Queueing ICE candidate from ${from} - remote description not set yet. Signaling state: ${pc.signalingState}`
          );
          // Store the candidate to add later
          if (!pc._pendingIceCandidates) {
            pc._pendingIceCandidates = [];
          }
          pc._pendingIceCandidates.push(candidate);
        }
      } catch (err) {
        console.error(`Error handling ICE candidate from ${from}:`, err);
        setError(`ICE candidate error: ${err.message}`);
      }
    });

    // Handle screen share status
    socketRef.current.on("screen-share-status", ({ userId, isSharing }) => {
      console.log(`User ${userId} screen sharing status: ${isSharing}`);
      // Update UI or state as needed
    });

    // Clean up on unmount
    return () => {
      stopLocalStream();
      stopScreenShare();

      // Close all peer connections
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [interviewId, userRole, isInitiator]);

  // Debug function to log peer connection state changes
  const logPeerConnectionStateChange = (userId, pc) => {
    const logConnectionState = () =>
      console.log(`Connection state with ${userId}: ${pc.connectionState}`);
    const logIceConnectionState = () =>
      console.log(
        `ICE connection state with ${userId}: ${pc.iceConnectionState}`
      );
    const logSignalingState = () =>
      console.log(`Signaling state with ${userId}: ${pc.signalingState}`);

    pc.onconnectionstatechange = () => {
      logConnectionState();
      if (pc.connectionState === "connected") {
        setIsConnected(true);
        console.log(`Successfully connected to ${userId}`);
      } else if (
        ["disconnected", "failed", "closed"].includes(pc.connectionState)
      ) {
        setIsConnected(false);
        console.log(`Connection to ${userId} changed to ${pc.connectionState}`);
      }
    };

    pc.oniceconnectionstatechange = logIceConnectionState;
    pc.onsignalingstatechange = logSignalingState;

    // Initial log
    logConnectionState();
    logIceConnectionState();
    logSignalingState();
  };

  // Create a peer connection with a specific user
  const createPeerConnection = async (userId) => {
    try {
      // If the connection already exists, return it (do not re-add tracks)
      if (peerConnectionsRef.current[userId]) {
        console.log(`Peer connection with ${userId} already exists, reusing.`);
        return peerConnectionsRef.current[userId];
      }

      console.log(`Creating peer connection with ${userId}`);

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      });

      // Store the peer connection
      peerConnectionsRef.current[userId] = pc;

      // Set up enhanced logging for connection state changes
      logPeerConnectionStateChange(userId, pc);

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Sending ICE candidate to ${userId}:`, event.candidate);
          
          // Determine if this is a screen share connection
          const isScreenShare = userId.includes('-screen');
          const targetUserId = isScreenShare ? userId.replace('-screen', '') : userId;
          
          socketRef.current.emit("ice-candidate", {
            to: targetUserId,
            candidate: event.candidate,
            isScreenShare: isScreenShare,
          });
        } else {
          console.log(`Finished collecting ICE candidates for ${userId}`);
        }
      };

      // Handle ICE connection failures
      pc.onicecandidateerror = (event) => {
        console.error(`ICE candidate error with ${userId}:`, event);
      };

      // Handle remote tracks - this is critical for seeing the other person's video
      pc.ontrack = (event) => {
        console.log(`Received remote track from ${userId}:`, event.track.kind, 'isScreenShare:', userId.includes('-screen'));

        // Make sure we have a valid stream
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];

          // Log track information
          remoteStream.getTracks().forEach((track) => {
            console.log(
              `Remote track: ${track.kind}, enabled: ${track.enabled}, muted: ${track.muted}`
            );
          });

          // Update remote streams state
          setRemoteStreams((prev) => {
            console.log(`Setting remote stream for ${userId}`);
            return {
              ...prev,
              [userId]: remoteStream,
            };
          });

          // Add ended event listener to tracks
          remoteStream.getTracks().forEach((track) => {
            track.onended = () =>
              console.log(`Remote track ${track.kind} ended from ${userId}`);
            track.onmute = () =>
              console.log(`Remote track ${track.kind} muted from ${userId}`);
            track.onunmute = () =>
              console.log(`Remote track ${track.kind} unmuted from ${userId}`);
          });
        } else {
          console.error(
            `Received track from ${userId} but no stream available`
          );
        }
      };

      // Only add camera tracks if this is a new (non-screen) connection
      if (localStreamRef.current && !userId.includes('-screen')) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (pc.signalingState !== 'closed') {
            pc.addTrack(track, localStreamRef.current);
          } else {
            console.warn('Tried to addTrack on a closed connection, skipping.');
          }
        });
      }

      // Only add screen sharing tracks if this is a new -screen connection
      if (screenStreamRef.current && userId.includes('-screen')) {
        screenStreamRef.current.getTracks().forEach((track) => {
          if (pc.signalingState !== 'closed') {
            pc.addTrack(track, screenStreamRef.current);
          } else {
            console.warn('Tried to addTrack on a closed connection, skipping.');
          }
        });
      }

      // If we're the initiator (recruiter), create and send offer
      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        console.log(`Sending offer to ${userId}`);
        socketRef.current.emit("signal", {
          to: userId,
          from: socketRef.current.id,
          signal: offer,
          type: "offer",
        });
      }

      return pc;
    } catch (err) {
      console.error("Error creating peer connection:", err);
      setError(`Peer connection error: ${err.message}`);
      return null;
    }
  };

  // Start local video stream
  const startLocalStream = useCallback(async () => {
    try {
      console.log("Starting local stream");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // If there was a previous stream, stop its tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      localStreamRef.current = stream;

      // Remove old tracks and add new ones to existing peer connections
      Object.entries(peerConnectionsRef.current).forEach(([userId, pc]) => {
        // Skip screen share connections
        if (userId.includes('-screen')) return;

        // Remove old tracks
        const senders = pc.getSenders();
        senders.forEach(sender => {
          if (sender.track && sender.track.kind === 'video') {
            // Only remove track if signalingState is not 'closed'
            if (pc.signalingState !== 'closed') {
              pc.removeTrack(sender);
            }
          }
        });

        // Add new tracks
        stream.getTracks().forEach((track) => {
          if (pc.signalingState !== 'closed') {
            pc.addTrack(track, stream);
          } else {
            console.warn('Tried to addTrack on a closed connection, skipping.');
          }
        });

        // If we're the initiator, renegotiate the connection
        if (isInitiator && pc.signalingState === 'stable') {
          pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => {
              socketRef.current.emit("signal", {
                to: userId,
                from: socketRef.current.id,
                signal: pc.localDescription,
                type: "offer",
              });
            })
            .catch(err => console.error("Error renegotiating connection:", err));
        }
      });

      // If we're the initiator and there are participants, create offers for new connections
      if (isInitiator) {
        Object.keys(participants).forEach((userId) => {
          if (
            userId !== socketRef.current.id &&
            !peerConnectionsRef.current[userId]
          ) {
            createPeerConnection(userId);
          }
        });
      }

      return stream;
    } catch (err) {
      console.error("Error starting local stream:", err);
      setError(`Media error: ${err.message}`);
      return null;
    }
  }, [participants, isInitiator]);

  // Stop local video stream
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      if (screenStreamRef.current) {
        return screenStreamRef.current;
      }

      console.log("Starting screen share");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Log screen share tracks
      console.log(
        "Screen share tracks:",
        stream.getTracks().map((track) => ({
          kind: track.kind,
          label: track.label,
          id: track.id,
          enabled: track.enabled,
        }))
      );

      // Add a special property to identify this as a screen share stream
      // This will be preserved when the stream is sent over WebRTC
      stream.isScreenShare = true;

      screenStreamRef.current = stream;
      setIsScreenSharing(true);

      // IMPORTANT: Do NOT stop or remove the camera stream from the original connection.
      // The camera stream will continue to be sent on the original connection.
      // Only add the screen share to the new -screen connection.

      // Notify others about screen sharing
      socketRef.current.emit("screen-share-status", {
        interviewId,
        isSharing: true,
      });

      // Add screen tracks to all peer connections and renegotiate
      const peerEntries = Object.entries(peerConnectionsRef.current);
      console.log(
        `Creating screen share connections for ${peerEntries.length} peers`
      );

      for (const [userId, pc] of peerEntries) {
        // Skip if this is already a screen share connection
        if (userId.includes('-screen')) continue;
        
        console.log(`Creating screen share connection for peer: ${userId}`);

        try {
          // Create a separate peer connection for screen sharing
          const screenShareId = `${userId}-screen`;
          const screenPeerConnection = await createPeerConnection(screenShareId);

          // Add all tracks from the screen share stream to the new connection
          stream.getTracks().forEach((track) => {
            console.log(
              `Adding ${track.kind} track (${track.label}) to screen peer ${userId}`
            );
            // CLONE the track before adding to avoid InvalidAccessError
            const clonedTrack = track.clone();
            if (screenPeerConnection.signalingState !== 'closed') {
              screenPeerConnection.addTrack(clonedTrack, stream);
            } else {
              console.warn('Tried to addTrack on a closed screenPeerConnection, skipping.');
            }
            // Handle track ending (user stops sharing)
            clonedTrack.onended = () => {
              console.log(`Screen share track ended: ${track.kind}`);
              stopScreenShare();
            };
          });

          // Create and send offer for screen sharing
          console.log(`Creating screen share offer for ${userId}`);
          const offer = await screenPeerConnection.createOffer();
          await screenPeerConnection.setLocalDescription(offer);

          console.log(`Sending screen share offer to ${userId}`);
          socketRef.current.emit("signal", {
            to: userId,
            from: socketRef.current.id,
            signal: offer,
            type: "offer",
            isScreenShare: true, // Mark this as a screen share signal
          });
        } catch (err) {
          console.error(
            `Error setting up screen share connection with ${userId}:`,
            err
          );
        }
      }

      return stream;
    } catch (err) {
      console.error("Error starting screen share:", err);
      setError(`Screen share error: ${err.message}`);
      return null;
    }
  }, [interviewId]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);

      // Close all screen share peer connections
      Object.keys(peerConnectionsRef.current).forEach((connectionId) => {
        if (connectionId.includes('-screen')) {
          console.log(`Closing screen share connection: ${connectionId}`);
          peerConnectionsRef.current[connectionId].close();
          delete peerConnectionsRef.current[connectionId];
        }
      });

      // Remove screen share streams from remote streams
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        Object.keys(newStreams).forEach((streamId) => {
          if (streamId.includes('-screen')) {
            delete newStreams[streamId];
          }
        });
        return newStreams;
      });

      // Notify others
      if (socketRef.current) {
        socketRef.current.emit("screen-share-status", {
          interviewId,
          isSharing: false,
        });
      }
    }
  }, [interviewId]);

  return {
    isConnected,
    remoteStreams,
    isScreenSharing,
    participants,
    error,
    startLocalStream,
    stopLocalStream,
    startScreenShare,
    stopScreenShare,
    // Return the refs for direct access if needed
    localStreamRef,
    screenStreamRef,
  };
};
