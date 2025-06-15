import React, { useState, useEffect, useRef } from "react";
import { useWebRTC } from "../../hooks/useWebRTC";
import { getWebSocketInstance } from "../../services/websocket.instance";
import CodeEditorPanel from "../shared/CodeEditorPanel";
import ChatPanel from "../shared/ChatPanel";
import QuestionPanel from "../shared/QuestionPanel";
import useQuery from "../../hooks/useQuery";
import useMutation from "../../hooks/useMutation";
import {
  isWithinInterviewTime,
  getTimeRemaining,
  formatTimeRemaining,
} from "@/utils/timeUtils";
import {
  Clock,
  Users,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/utils/toast";

function CandidateInterviewPanel({ interviewId }) {
  const {
    isConnected,
    remoteStreams,
    participants,
    error,
    isScreenSharing,
    startLocalStream,
    stopLocalStream,
    startScreenShare,
    stopScreenShare,
    localStreamRef,
    screenStreamRef,
  } = useWebRTC(interviewId, "candidate");

  // State for code editor
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);

  // State for question navigation and answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [savedAnswers, setSavedAnswers] = useState({});

  // State for video
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  // WebSocket instance for chat
  const websocketService = getWebSocketInstance();

  // Fetch interview details
  const {
    data: interviewData,
    loading: interviewLoading,
    error: interviewError,
  } = useQuery(`/api/interviews/${interviewId}`, {
    cb: (response) => response.data?.data || response.data,
  });
  console.log(interviewData, "ppppppppppppppp");

  // Submit answers mutation
  const { mutate: submitAnswers, loading: submittingAnswers } = useMutation();

  // Current question
  const currentQuestion =
    interviewData?.questions?.[currentQuestionIndex] || null;

  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);

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
        navigate("/candidate/dashboard");
        return;
      }

      if (isAfterEnd) {
        showToast.warn("Interview has ended.");
        navigate("/candidate/dashboard");
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
          handleAutoSubmit();
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
  }, [interviewData]);

  // Auto submit when time expires
  const handleAutoSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      navigate("/candidate/dashboard");
      return;
    }

    const submissionData = {
      interviewId,
      submissions: Object.entries(answers).map(([questionId, code]) => {
        const question = interviewData.questions.find(
          (q) => q.id == questionId
        );
        return {
          questionId,
          code,
          language: question?.language?.toLowerCase() || "javascript",
        };
      }),
    };

    try {
      const res = await submitAnswers({
        url: "/api/submissions",
        method: "POST",
        data: submissionData,
      });

      if (res.success) {
        showToast.success(
          "Interview completed! Your answers have been submitted."
        );
        navigate("/candidate/dashboard");
      }
    } catch (error) {
      showToast.error(
        "Failed to submit answers automatically. Please contact support."
      );
      navigate("/candidate/dashboard");
    }
  };

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
      if (isScreenSharing) {
        stopScreenShare();
      }
    };
  }, [startLocalStream, stopLocalStream, stopScreenShare, isScreenSharing]);

  // Set local video stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStream, localStreamRef]);

  // Set screen share stream to video element
  useEffect(() => {
    if (screenVideoRef.current && screenStreamRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [screenStream, screenStreamRef]);

  // Set initial code from interview data or saved answer
  useEffect(() => {
    if (currentQuestion?.language) {
      setLanguage(currentQuestion.language.toLowerCase());
    }

    // Load saved answer if exists
    if (answers[currentQuestion?.id]) {
      setCode(answers[currentQuestion.id]);
    } else {
      setCode("");
    }
  }, [currentQuestion, answers]);

  // Handle screen sharing
  const handleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      setScreenStream(null);
    } else {
      const stream = await startScreenShare();
      if (stream) {
        setScreenStream(stream);

        // Add event listener for when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
        };
      }
    }
  };

  // Handle question navigation
  const nextQuestion = () => {
    if (
      interviewData?.questions &&
      currentQuestionIndex < interviewData.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Save current answer
  const saveAnswer = () => {
    if (!code.trim()) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: code,
    }));
    nextQuestion();
    showToast.success("Answer saved!");
  };

  // Submit all answers
  const handleSubmitAll = async () => {
    if (!currentQuestion) return;

    const submissionData = {
      interviewId,
      submissions: Object.entries(answers).map(([questionId, code]) => {
        const question = interviewData.questions.find(
          (q) => q.id == questionId
        );
        console.log(question, interviewData, questionId, "question");
        return {
          questionId,
          code,
          language: question?.language?.toLowerCase() || "javascript",
          messages: messages.map((msg) => ({
            sender: msg.sender,
            content: msg.content,
          })),
        };
      }),
    };

    const res = await submitAnswers({
      url: "/api/submissions",
      method: "POST",
      data: submissionData,
    });
    if (res.success) {
      navigate("/candidate/dashboard");
    }
  };

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
    <div className="flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {interviewData?.title || "Interview Session"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Interview ID: {interviewId} • Role: Candidate
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question and Code Editor */}
        <div className="flex-1 flex flex-col border-r">
          {/* Question Panel */}
          <QuestionPanel
            questions={interviewData?.questions}
            currentQuestionIndex={currentQuestionIndex}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            showNavigation={true}
          />

          {/* Code Editor */}
          <div className="flex-1 p-4">
            <CodeEditorPanel
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCode={setCode}
              editorRef={editorRef}
              onSubmit={saveAnswer}
              submitting={submitting}
              interviewId={interviewId}
              currentQuestionId={currentQuestion?.id}
              currentQuestionIndex={currentQuestionIndex}
              isRecruiter={false}
            />
          </div>

          {/* Answer Actions */}
          <div className="p-4 border-t flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={saveAnswer}
                disabled={!code.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Answer
              </Button>
              {savedAnswers[currentQuestion?.id] && (
                <span className="text-sm text-green-600 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Saved
                </span>
              )}
            </div>
            <Button
              onClick={handleSubmitAll}
              disabled={submittingAnswers || Object.keys(answers).length === 0}
            >
              {submittingAnswers ? "Submitting..." : "Submit All Answers"}
            </Button>
          </div>
        </div>

        {/* Right Panel - Video and Chat */}
        <div className="w-96 flex flex-col">
          {/* Video Section */}
          <div className="bg-card border-b">
            <div className="flex w-full">
              {/* Local Video */}
              <div className="p-3 border-b w-1/2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground">
                    Your Video
                  </h3>
                  <div className="flex gap-1">
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
                    <button
                      onClick={handleScreenShare}
                      className={`p-1 rounded ${
                        isScreenSharing
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      disabled={!localStream}
                      title={
                        isScreenSharing ? "Stop Screen Share" : "Share Screen"
                      }
                    >
                      {isScreenSharing ? (
                        <MonitorOff className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="aspect-video bg-black rounded overflow-hidden relative">
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

              {/* Recruiter Video */}
              <div className="p-3 border-b w-1/2">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Recruiter Video
                </h3>
                <div className="aspect-video bg-black rounded overflow-hidden relative">
                  {Object.entries(remoteStreams).map(([userId, stream]) => {
                    const participant = participants[userId];
                    if (participant?.userRole === "recruiter") {
                      return (
                        <RemoteVideo
                          key={userId}
                          userId={userId}
                          stream={stream}
                        />
                      );
                    }
                    return null;
                  })}
                  {Object.values(remoteStreams).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                      {isConnected
                        ? "Waiting for recruiter..."
                        : "Not connected"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Screen Share Display */}
          </div>

          {/* Chat Panel */}
          <div className="flex-1 min-h-5 max-h-[60vh] mt-2">
            <ChatPanel
              interviewId={interviewId}
              userRole="candidate"
              messages={messages}
              setMessages={setMessages}
            />
          </div>
          <div className="bg-card border-b mt-2">
            {screenStream && (
              <div className="p-3 border-b">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Your Screen Share
                </h3>
                <div className="aspect-video bg-black rounded overflow-hidden">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateInterviewPanel;
