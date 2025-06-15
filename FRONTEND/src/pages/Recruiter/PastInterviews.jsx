import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Code,
  Search,
  Clock,
  CheckCircle,
} from "lucide-react";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import InterviewCard from "@/components/recruiter/dashboard/InterviewCard";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CodeQualityCheck,
  DetectPlagiarism,
  Summary,
  TimeSpaceComplexity,
} from "./AIAnalysisComponents";

const PastInterviews = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analysisType, setAnalysisType] = useState("");

  const {
    data: interviews = [],
    loading,
    error,
    refetch,
  } = useQuery("/api/interviews", {
    cb: (data) => data?.data?.data,
  });

  const plagiarismMutation = useMutation({
    cb: (response) => response?.data?.data,
  });

  const summaryMutation = useMutation({
    cb: (response) => response?.data?.data,
  });

  const complexityMutation = useMutation({
    cb: (response) => response?.data?.data,
  });

  const codeQualityMutation = useMutation({
    cb: (response) => response?.data?.data,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading past interviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-4">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              Error loading past interviews
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const pastInterviews = interviews?.filter(
    (interview) =>
      interview.status === "COMPLETED" || interview.status === "CANCELLED"
  );

  const handleAnalysisRequest = async (interviewId, type) => {
    setAnalysisType(type);
    let endpoint = "";
    let mutation = null;

    switch (type) {
      case "plagiarism":
        endpoint = `/api/ai/detect-plagiarism/${interviewId}`;
        mutation = plagiarismMutation;
        break;
      case "summary":
        endpoint = `/api/ai/generate-summary/${interviewId}`;
        mutation = summaryMutation;
        break;
      case "complexity":
        endpoint = `/api/ai/generate-time-space-complexity/${interviewId}`;
        mutation = complexityMutation;
        break;
      case "quality":
        endpoint = `/api/ai/code-quaility-chek/${interviewId}`;
        mutation = codeQualityMutation;
        break;
      default:
        return;
    }

    try {
      const response = await mutation.mutate({ url: endpoint, method: "GET" });
      if (response.success) {
        setSelectedAnalysis(response?.data?.data);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    }
  };

  const getAnalysisTitle = () => {
    switch (analysisType) {
      case "plagiarism":
        return "Plagiarism Detection Results";
      case "summary":
        return "Code Summary Analysis";
      case "complexity":
        return "Time & Space Complexity Analysis";
      case "quality":
        return "Code Quality Assessment";
      default:
        return "Analysis Results";
    }
  };

  const getAnalysisIcon = () => {
    switch (analysisType) {
      case "plagiarism":
        return <Search className="h-5 w-5 text-blue-500 mr-2" />;
      case "summary":
        return <Code className="h-5 w-5 text-green-500 mr-2" />;
      case "complexity":
        return <Clock className="h-5 w-5 text-yellow-500 mr-2" />;
      case "quality":
        return <CheckCircle className="h-5 w-5 text-purple-500 mr-2" />;
      default:
        return null;
    }
  };

  const renderAnalysisComponent = () => {
    switch (analysisType) {
      case "plagiarism":
        return <DetectPlagiarism analysis={selectedAnalysis} />;
      case "summary":
        return <Summary analysis={selectedAnalysis} />;
      case "complexity":
        return <TimeSpaceComplexity analysis={selectedAnalysis} />;
      case "quality":
        return <CodeQualityCheck analysis={selectedAnalysis} />;
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            No analysis data available
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Past Interviews</h1>
          <p className="text-muted-foreground mt-1">
            View completed and cancelled interviews
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {pastInterviews?.length > 0 ? (
          pastInterviews.map((interview) => (
            <div key={interview.id} className="space-y-2 bg-card p-4 rounded">
              <InterviewCard interview={interview} />
              {interview.status === "COMPLETED" && (
                <div className="flex flex-wrap gap-2 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    onClick={() =>
                      handleAnalysisRequest(interview.id, "plagiarism")
                    }
                    disabled={plagiarismMutation.loading}
                  >
                    <Search className="h-4 w-4" />
                    {plagiarismMutation.loading && analysisType === "plagiarism"
                      ? "Checking..."
                      : "Detect Plagiarism"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    onClick={() =>
                      handleAnalysisRequest(interview.id, "summary")
                    }
                    disabled={summaryMutation.loading}
                  >
                    <Code className="h-4 w-4" />
                    {summaryMutation.loading && analysisType === "summary"
                      ? "Generating..."
                      : "Generate Summary"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                    onClick={() =>
                      handleAnalysisRequest(interview.id, "complexity")
                    }
                    disabled={complexityMutation.loading}
                  >
                    <Clock className="h-4 w-4" />
                    {complexityMutation.loading && analysisType === "complexity"
                      ? "Analyzing..."
                      : "Time-Space Analysis"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    onClick={() =>
                      handleAnalysisRequest(interview.id, "quality")
                    }
                    disabled={codeQualityMutation.loading}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {codeQualityMutation.loading && analysisType === "quality"
                      ? "Checking..."
                      : "Code Quality Check"}
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>No Past Interviews</CardTitle>
              <CardDescription>
                Completed and cancelled interviews will appear here
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          onClose={() => setDialogOpen(false)}
          className="max-w-3xl max-h-[80vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {getAnalysisIcon()}
              {getAnalysisTitle()}
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis of the candidate's code submission
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedAnalysis ? (
              renderAnalysisComponent()
            ) : (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PastInterviews;
