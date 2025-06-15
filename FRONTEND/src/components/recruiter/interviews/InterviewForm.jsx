import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Calendar, Clock, Mail, FileText, Tag, CheckCircle2 } from "lucide-react";
import DateTimePicker from "@/components/ui/dateTimePicker";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import { toast } from "sonner";
import moment from "moment";

const InterviewForm = ({ interviewId }) => {
  const navigate = useNavigate();
  const isEditMode = !!interviewId;

  const { data: questions = [], loading: questionsLoading } = useQuery(
    "/api/questions",
    {
      cb: (data) => data?.data?.data || [],
    }
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    candidateEmail: "",
    startTime: new Date(),
    duration: 30,
    type: "TECHNICAL",
    questionIds: [],
  });

  const { data: interview, loading: loadingInterview } = useQuery(
    interviewId ? `/api/interviews/${interviewId}` : null,
    {
      cb: (data) => data?.data?.data,
    }
  );

  const createMutation = useMutation();

  const updateMutation = useMutation();

  useEffect(() => {
    if (interview) {
      setFormData({
        title: interview.title,
        description: interview.description,
        candidateEmail: interview.candidate.email,
        startTime: new Date(interview.startTime),
        duration: interview.duration,
        type: interview.type,
        questionIds: interview.questions?.map(q => q.id) || [],
      });
    }
  }, [interview]);

  const handleQuestionSelect = (questionId) => {
    setFormData((prev) => {
      const currentQuestions = prev.questionIds;
      if (currentQuestions.includes(questionId)) {
        return {
          ...prev,
          questionIds: currentQuestions.filter((id) => id !== questionId),
        };
      } else if (currentQuestions.length < 3) {
        return {
          ...prev,
          questionIds: [...currentQuestions, questionId],
        };
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
      const submitData = {
        ...formData,
        startTime: moment(formData.startTime).format('YYYY-MM-DDTHH:mm:ss'),
        duration: parseInt(formData.duration),
      };

      if (isEditMode) {
        const res = await updateMutation.mutate({
          url: `/api/interviews/${interviewId}`,
          method: "PUT",
          data: submitData,
        });
        if(res.success){
            navigate("/recruiter/interviews")
        }
      } else {
        const res = await createMutation.mutate({
          url: "/api/interviews",
          method: "POST",
          data: submitData,
        });
        if(res.success){
            navigate("/recruiter/interviews")
        }
      }
    
  };

  if (isEditMode && loadingInterview) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading interview details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Interview" : "Schedule Interview"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update the interview details"
              : "Fill in the details to schedule a new interview"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Interview Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Frontend Developer Interview"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the interview"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="candidateEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Candidate Email
                  </Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={formData.candidateEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, candidateEmail: e.target.value })
                    }
                    placeholder="candidate@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Time
                  </Label>
                  <DateTimePicker
                    date={formData.startTime}
                    setDate={(date) =>
                      setFormData({ ...formData, startTime: date })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="120"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Interview Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Technical Interview</SelectItem>
                      <SelectItem value="BEHAVIORAL">Behavioral Interview</SelectItem>
                      <SelectItem value="CODING">Coding Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column - Question Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">
                    Select Questions (Max 3)
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    {formData.questionIds.length}/3 selected
                  </div>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  {questionsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {questions?.map((question) => (
                        <Card
                          key={question.id}
                          className={`p-4 transition-all hover:shadow-md ${
                            formData.questionIds.includes(question.id)
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={`question-${question.id}`}
                              checked={formData.questionIds.includes(question.id)}
                              onCheckedChange={() => handleQuestionSelect(question.id)}
                              disabled={
                                !formData.questionIds.includes(question.id) &&
                                formData.questionIds.length >= 3
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-1">
                              <Label
                                htmlFor={`question-${question.id}`}
                                className="text-base font-medium cursor-pointer"
                              >
                                {question.title}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {question.description}
                              </p>
                            </div>
                            {formData.questionIds.includes(question.id) && (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/recruiter/interviews")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formData.questionIds.length === 0 || createMutation.loading || updateMutation.loading}
                className="gap-2"
              >
                {(createMutation.loading || updateMutation.loading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Scheduling..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {isEditMode ? "Update Interview" : "Schedule Interview"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewForm; 