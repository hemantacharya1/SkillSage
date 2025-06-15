import { useDispatch } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Video,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { deleteInterview } from "@/redux/slices/interviewSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const InterviewCard = ({ interview, create, handleDelete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{interview.title}</CardTitle>
            <CardDescription className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{interview.candidate?.name || "Not assigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>
                  {interview.candidate?.email || interview.candidateEmail}
                </span>
              </div>
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(interview.status)} text-white`}>
            {interview.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(interview.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {formatTime(interview.startTime)} ({interview.duration} minutes)
            </span>
          </div>

          {interview.description && (
            <div className="text-sm text-muted-foreground mt-2">
              {interview.description}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <div>
          {(interview.status === "SCHEDULED" ||
            interview.status === "IN_PROGRESS") && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
              onClick={() => navigate(`/recruiter/interview/${interview.id}`)}
            >
              <Video className="w-4 h-4" />
              Join Interview
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {interview.status === "SCHEDULED" && create && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  navigate(`/recruiter/interviews/${interview.id}/edit`)
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(interview.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          {interview.status === "IN_PROGRESS" && (
            <Button variant="outline" size="sm">
              View Progress
            </Button>
          )}
          {interview.status === "COMPLETED" && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => navigate(`/recruiter/past-interview/view/${interview.id}`)}
            >
              <FileText className="h-4 w-4" />
              View Submission
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
