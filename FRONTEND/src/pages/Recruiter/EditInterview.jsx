import { useParams } from "react-router-dom";
import InterviewForm from "@/components/recruiter/interviews/InterviewForm";

const EditInterview = () => {
  const { id } = useParams();
  return <InterviewForm interviewId={id} />;
};

export default EditInterview; 