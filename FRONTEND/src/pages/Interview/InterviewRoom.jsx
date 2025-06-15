import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import CandidateInterviewPanel from "@/components/candidate/CandidateInterviewPanel";
import RecruiterInterviewPanel from "@/components/recruiter/RecruiterInterviewPanel";

const DAILY_ROOM_URL = "https://skillsage.daily.co/2";

export default function InterviewRoom() {
  const { interviewId } = useParams();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Determine user role from path or localStorage
    const role = location.pathname.includes("/recruiter/")
      ? "RECRUITER"
      : "CANDIDATE";

    setUserRole(role);
  }, [location.pathname]);

  return (
    <div className="h-screen w-full bg-background">
      {userRole === "RECRUITER" ? (
        <RecruiterInterviewPanel
          interviewId={interviewId}
          dailyRoomUrl={DAILY_ROOM_URL}
        />
      ) : (
        <CandidateInterviewPanel
          interviewId={interviewId}
          dailyRoomUrl={DAILY_ROOM_URL}
        />
      )}
    </div>
  );
}
