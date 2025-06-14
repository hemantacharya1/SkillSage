import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Building, ArrowRight, Video, FileText } from "lucide-react";

const InterviewCard = ({ interview }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'IN_PROGRESS':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'COMPLETED':
        return 'bg-green-500 hover:bg-green-600';
      case 'EXPIRED':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Calendar className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'COMPLETED':
        return <FileText className="w-4 h-4" />;
      case 'EXPIRED':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilInterview = (startTime) => {
    const now = new Date();
    const interviewTime = new Date(startTime);
    const diffTime = interviewTime - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
    } else {
      return 'Starting soon';
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200 border-blue-100 bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl text-blue-900">{interview.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-blue-700/70">
              <Building className="w-4 h-4" />
              <span>{interview.recruiter?.name || 'Company'}</span>
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(interview.status)} text-white flex items-center gap-1.5 px-3 py-1`}>
            {getStatusIcon(interview.status)}
            {interview.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-blue-700/70">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(interview.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700/70">
            <Clock className="w-4 h-4" />
            <span>{formatTime(interview.startTime)} ({interview.duration} minutes)</span>
          </div>
          {interview.description && (
            <div className="text-sm text-blue-700/70 mt-2">
              {interview.description}
            </div>
          )}
          {interview.status === 'SCHEDULED' && (
            <div className="mt-2 text-sm font-medium text-blue-600">
              {getTimeUntilInterview(interview.startTime)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t border-blue-100/50 bg-blue-50/30">
        {interview.status === 'SCHEDULED' && (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Video className="w-4 h-4 mr-2" />
            Join Interview
          </Button>
        )}
        {interview.status === 'IN_PROGRESS' && (
          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <ArrowRight className="w-4 h-4 mr-2" />
            Continue Interview
          </Button>
        )}
        {interview.status === 'COMPLETED' && (
          <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <FileText className="w-4 h-4 mr-2" />
            View Feedback
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InterviewCard; 