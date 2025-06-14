import { useDispatch } from 'react-redux';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Mail } from "lucide-react";
import { deleteInterview } from '@/redux/slices/interviewSlice';
import { toast } from 'sonner';

const InterviewCard = ({ interview }) => {
  const dispatch = useDispatch();

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500';
      case 'IN_PROGRESS':
        return 'bg-yellow-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteInterview(interview.id)).unwrap();
      toast.success('Interview deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete interview');
    }
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
                <span>{interview.candidate?.name || 'Not assigned'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{interview.candidate?.email || interview.candidateEmail}</span>
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
            <span>{formatTime(interview.startTime)} ({interview.duration} minutes)</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Type: {interview.type}
          </div>
          {interview.description && (
            <div className="text-sm text-muted-foreground mt-2">
              {interview.description}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {interview.status === 'SCHEDULED' && (
          <>
            <Button variant="outline" size="sm">Edit</Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 hover:text-red-600"
              onClick={handleDelete}
            >
              Cancel
            </Button>
          </>
        )}
        {interview.status === 'IN_PROGRESS' && (
          <Button size="sm">View Progress</Button>
        )}
        {interview.status === 'COMPLETED' && (
          <Button variant="outline" size="sm">View Results</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InterviewCard; 