import React, { useState, useEffect, useRef } from "react";
import { useWebRTC } from "../../hooks/useWebRTC";
import { getWebSocketInstance } from "../../services/websocket.instance";
import CodeEditorPanel from "../shared/CodeEditorPanel";
import ChatPanel from "../shared/ChatPanel";
import QuestionPanel from "../shared/QuestionPanel";
import useQuery from "../../hooks/useQuery";
import {
  isWithinInterviewTime,
  getTimeRemaining,
  formatTimeRemaining,
} from "@/utils/timeUtils";
import { Clock, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/utils/toast";
import { LampDesk } from "lucide-react";
import { io } from "socket.io-client";

function RecruiterInterviewPanel({ interviewId }) {
  const {
    isConnected,
    remoteStreams,
    participants,
    error,
    startLocalStream,
    stopLocalStream,
    localStreamRef,
  } = useWebRTC(interviewId, "recruiter");

  // Track if any remote stream contains screen share
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [candidateStream, setCandidateStream] = useState(null);
  const [messages, setMessages] = useState([]);

  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);

  // State for question navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const socketRef = useRef(null);

  // WebSocket instance for chat
  const websocketService = getWebSocketInstance();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);

  // Fetch interview details
  const {
    data: interviewData,
    loading: interviewLoading,
    error: interviewError,
  } = useQuery(`/api/interviews/${interviewId}`, {
    cb: (response) => response.data?.data || response.data,
  });

  const navigate = useNavigate();

  // Add state for code editor (per-question mapping)
  const [questionCodeMap, setQuestionCodeMap] = useState({}); // { [questionId]: { code, language } }
  const editorRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  // Helper to get current question id
  const currentQuestionId =
    interviewData?.questions?.[currentQuestionIndex]?.id;

  // Get code/language for current question
  const code = questionCodeMap[currentQuestionId]?.code || "";
  // const language = questionCodeMap[currentQuestionId]?.language || "javascript";
  const language =
    interviewData?.questions?.[currentQuestionIndex]?.language || "javascript";
  const setCode = (newCode) => {
    setQuestionCodeMap((prev) => ({
      ...prev,
      [currentQuestionId]: {
        ...(prev[currentQuestionId] || {}),
        code: newCode,
        // language: prev[currentQuestionId]?.language || language,
      },
    }));
  };
  const setLanguage = (newLang) => {
    setQuestionCodeMap((prev) => ({
      ...prev,
      [currentQuestionId]: {
        ...(prev[currentQuestionId] || {}),
        code: prev[currentQuestionId]?.code || code,
        // language: newLang,
      },
    }));
  };

  // Check if interview is within scheduled time
  useEffect(() => {
    if (interviewData) {
      const { isBeforeStart, isAfterEnd } = getTimeRemaining(
        interviewData.startTime,
        interviewData.duration
      );

      if (isBeforeStart) {
        showToast.warn(
          "Interview hasn't started yet. Please wait until the scheduled time."
        );
        navigate("/recruiter/dashboard");
        return;
      }

      if (isAfterEnd) {
        showToast.warn("Interview has ended.");
        navigate("/recruiter/dashboard");
        return;
      }
    }
  }, [interviewData, navigate]);

  // Setup timer for countdown
  useEffect(() => {
    if (interviewData) {
      const updateTimer = () => {
        const { remaining, isAfterEnd } = getTimeRemaining(
          interviewData.startTime,
          interviewData.duration
        );

        if (isAfterEnd) {
          clearInterval(timerRef.current);
          navigate("/recruiter/dashboard");
          return;
        }

        setTimeRemaining(formatTimeRemaining(remaining));
      };

      // Initial update
      updateTimer();

      // Update every second
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [interviewData, navigate]);

  // Start local stream when component mounts
  useEffect(() => {
    const initializeStream = async () => {
      const stream = await startLocalStream();
      if (stream) {
        setLocalStream(stream);
      }
    };

    initializeStream();

    return () => {
      stopLocalStream();
    };
  }, [startLocalStream, stopLocalStream]);

  // Set local video stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStream, localStreamRef]);

  // Initialize socket connection and handle code/language updates
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    // Join the interview room
    socketRef.current.emit("join-room", {
      interviewId,
      userRole: "recruiter",
    });

    // Listen for question changes from other participants
    socketRef.current.on("question-change", (change) => {
      setCurrentQuestionIndex(change.currentQuestionIndex);
    });

    // Listen for initial code state
    socketRef.current.on("code-state", ({ codeUpdates }) => {
      setQuestionCodeMap(codeUpdates || {});
    });

    // Listen for code updates
    socketRef.current.on("code-update", (update) => {
      setQuestionCodeMap((prev) => ({
        ...prev,
        [update.questionId]: {
          code: update.code,
          language: update.language,
        },
      }));
    });

    // Listen for language changes
    socketRef.current.on("language-change", (change) => {
      setQuestionCodeMap((prev) => ({
        ...prev,
        [change.questionId]: {
          code: prev[change.questionId]?.code || "",
          language: change.language,
        },
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [interviewId]);

  // Handle question navigation
  const nextQuestion = () => {
    if (
      interviewData?.questions &&
      currentQuestionIndex < interviewData.questions.length - 1
    ) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);

      // Emit question change to socket server
      if (socketRef.current) {
        socketRef.current.emit("question-change", {
          interviewId,
          questionId: interviewData.questions[newIndex].id,
          currentQuestionIndex: newIndex,
        });
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);

      // Emit question change to socket server
      if (socketRef.current) {
        socketRef.current.emit("question-change", {
          interviewId,
          questionId: interviewData.questions[newIndex].id,
          currentQuestionIndex: newIndex,
        });
      }
    }
  };

  // Detect screen sharing streams from candidates
  useEffect(() => {
    let foundScreenShare = false;
    let foundCameraStream = false;
    let screenShare = null;
    let cameraStream = null;

    // Find candidate userId
    const candidateEntry = Object.entries(participants).find(
      ([, p]) => p.userRole === "candidate"
    );
    const candidateId = candidateEntry ? candidateEntry[0] : null;

    // Look for screen share stream (key: candidateId-screen)
    if (candidateId && remoteStreams[`${candidateId}-screen`]) {
      screenShare = remoteStreams[`${candidateId}-screen`];
      foundScreenShare = true;
    }

    // Look for camera stream (key: candidateId)
    if (candidateId && remoteStreams[candidateId]) {
      cameraStream = remoteStreams[candidateId];
      foundCameraStream = true;
    }

    setScreenShareStream(foundScreenShare ? screenShare : null);
    setCandidateStream(foundCameraStream ? cameraStream : null);
  }, [remoteStreams, participants]);

  // Component to render remote video with proper srcObject handling
  const RemoteVideo = ({ userId, stream }) => {
    const remoteVideoRef = useRef(null);

    useEffect(() => {
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <video
        key={userId}
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        onLoadedMetadata={() => console.log("Video loaded for", userId)}
        onError={(e) => console.error("Video error:", e)}
      />
    );
  };

  // Special component for screen share with better handling
  const ScreenShareVideo = ({ stream }) => {
    const screenVideoRef = useRef(null);

    useEffect(() => {
      if (screenVideoRef.current && stream) {
        console.log("Setting screen share stream to video element");
        screenVideoRef.current.srcObject = stream;

        // Log when video starts playing
        const handlePlaying = () => {
          console.log("Screen share video is now playing");
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            console.log("Screen share video track:", {
              enabled: videoTrack.enabled,
              muted: videoTrack.muted,
              readyState: videoTrack.readyState,
              label: videoTrack.label,
            });
          }
        };

        const handleLoadedMetadata = () => {
          console.log("Screen share video metadata loaded");
          // Force play the video
          screenVideoRef.current.play().catch((err) => {
            console.error("Error playing screen share video:", err);
          });
        };

        screenVideoRef.current.addEventListener("playing", handlePlaying);
        screenVideoRef.current.addEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );

        return () => {
          if (screenVideoRef.current) {
            screenVideoRef.current.removeEventListener(
              "playing",
              handlePlaying
            );
            screenVideoRef.current.removeEventListener(
              "loadedmetadata",
              handleLoadedMetadata
            );
          }
        };
      }
    }, [stream]);

    return (
      <video
        ref={screenVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        onLoadedMetadata={() => console.log("Screen share video loaded")}
        onError={(e) => console.error("Screen share video error:", e)}
      />
    );
  };

  if (interviewLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (interviewError) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading interview</p>
          <p className="text-muted-foreground">{interviewError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col  bg-background">
      {/* Header */}
      <div className="bg-card border-b p-4 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {interviewData?.title || "Interview Session"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Interview ID: {interviewId} • Role: Recruiter
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span
                className={timeRemaining?.hours === 0 ? "text-red-500" : ""}
              >
                {timeRemaining?.formatted || "00:00:00"}
              </span>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Connection Error: {error}
          </div>
        )}
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex gap-4 pt-4 overflow-hidden">
        {/* Left Section: Question Panel */}

        {/* Center Section: Code Editor + Videos */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Video Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4 overflow-auto flex-shrink-0 col-span-2">
              <QuestionPanel
                questions={interviewData?.questions}
                currentQuestionIndex={currentQuestionIndex}
                onNext={nextQuestion}
                onPrev={prevQuestion}
                showNavigation={true}
              />
            </div>
            {/* Your Video */}
            <div className="bg-card border rounded-lg overflow-hidden shadow-sm flex flex-col col-span-1">
              <div className="bg-muted p-2 flex justify-between items-center flex-shrink-0">
                <h3 className="font-medium text-foreground text-sm">
                  Your Video
                </h3>
                <button
                  onClick={async () => {
                    if (localStream) {
                      stopLocalStream();
                      setLocalStream(null);
                    } else {
                      const stream = await startLocalStream();
                      if (stream) {
                        setLocalStream(stream);
                      }
                    }
                  }}
                  className={`p-1 rounded ${
                    localStream
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                  title={localStream ? "Stop Camera" : "Start Camera"}
                >
                  {localStream ? (
                    <VideoOff className="w-4 h-4" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="bg-black relative flex-1">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!localStream && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                    Camera Off
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Video */}
            <div className="bg-card border rounded-lg overflow-hidden shadow-sm flex flex-col col-span-1">
              <div className="bg-muted p-2 text-foreground flex-shrink-0">
                <h3 className="font-medium text-sm">Candidate Video</h3>
              </div>
              <div className="bg-black relative flex-1">
                <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-xs text-white p-1 z-10">
                  Connected: {isConnected ? "Yes" : "No"} | Streams:{" "}
                  {Object.keys(remoteStreams).length}
                </div>
                {candidateStream && (
                  <RemoteVideo
                    userId="candidate-video"
                    stream={candidateStream}
                  />
                )}
                {!candidateStream && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs text-center p-2">
                    {isConnected ? (
                      <p>Waiting for candidate to join and start camera...</p>
                    ) : (
                      <p>Not connected to any candidates</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Candidate Screen Share (if available) */}

          {/* Code Editor */}
          <div className="bg-card border rounded-lg flex-1 overflow-hidden flex flex-col">
            <CodeEditorPanel
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCode={setCode}
              editorRef={editorRef}
              onSubmit={() => {}}
              submitting={submitting}
              interviewId={interviewId}
              currentQuestionId={currentQuestionId}
              currentQuestionIndex={currentQuestionIndex}
              isRecruiter={true}
            />
          </div>
        </div>

        {/* Right Section: Interview Details + Chat */}
        <div className="w-80 flex flex-col gap-4 flex-shrink-0">
          {/* Interview Details */}
          <div className="bg-card border rounded-lg p-4 flex-shrink-0">
            <h3 className="font-medium text-foreground mb-3 text-sm">
              Interview Details
            </h3>
            {interviewData ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Candidate:</span>{" "}
                  <span className="font-medium">
                    {interviewData.candidate?.firstName || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">
                    {interviewData.candidate?.email || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium">
                    {interviewData.duration || 60} minutes
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Questions:</span>{" "}
                  <span className="font-medium">
                    {interviewData.questions?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs ml-1 font-medium">
                    {interviewData.status || "Active"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No interview details available
              </p>
            )}
          </div>

          {/* Chat Panel */}
          <div className="bg-card border rounded-lg flex-1 overflow-hidden flex flex-col min-h-0 max-h-[60vh]">
            <ChatPanel
              interviewId={interviewId}
              userRole="recruiter"
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        {screenShareStream && (
          <div className="bg-card border rounded-lg overflow-hidden shadow-sm flex flex-col">
            <div className="bg-muted p-2 text-foreground flex justify-between items-center flex-shrink-0">
              <h3 className="font-medium flex items-center text-sm">
                <LampDesk className="mr-2 h-4 w-4" /> Candidate Screen Share
              </h3>
              <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">
                LIVE
              </span>
            </div>
            <div className="bg-black relative flex-1">
              <ScreenShareVideo stream={screenShareStream} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterInterviewPanel;
