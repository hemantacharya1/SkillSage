import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Clock,
  Code,
  CheckCircle,
  Search,
  FileText,
} from "lucide-react";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DetectPlagiarism,
  Summary,
  TimeSpaceComplexity,
  CodeQualityCheck,
} from "./AIAnalysisComponents";

const ViewSubmission = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [editorRef, setEditorRef] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analysisType, setAnalysisType] = useState("");

  // Fetch interview details and submission
  const {
    data: interview = {},
    loading: interviewLoading,
    error: interviewError,
  } = useQuery(`/api/interviews/${interviewId}`, {
    cb: (data) => data?.data?.data,
  });

  // Fetch submission details
  const {
    data: submission = {},
    loading: submissionLoading,
    error: submissionError,
  } = useQuery(`/api/submissions/${interviewId}`, {
    cb: (data) => data?.data?.data,
  });
  
  // Get current question submission
  const currentQuestionSubmission = submission?.questionSubmissions?.[selectedQuestionIndex] || {};

  // AI analysis mutations
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

  // Handle editor mounting
  const handleEditorDidMount = (editor) => {
    setEditorRef(editor);
  };

  // Handle AI analysis request
  const handleAnalysisRequest = async (type) => {
    setAnalysisType(type);
    let endpoint = "";
    let mutation = null;
    
    const questionId = currentQuestionSubmission?.questionId;
    if (!questionId) {
      toast.error("No question selected for analysis");
      return;
    }

    switch (type) {
      case "plagiarism":
        endpoint = `/api/ai/detect-plagiarism/${interviewId}?questionId=${questionId}`;
        mutation = plagiarismMutation;
        break;
      case "summary":
        endpoint = `/api/ai/generate-summary/${interviewId}?questionId=${questionId}`;
        mutation = summaryMutation;
        break;
      case "complexity":
        endpoint = `/api/ai/generate-time-space-complexity/${interviewId}?questionId=${questionId}`;
        mutation = complexityMutation;
        break;
      case "quality":
        endpoint = `/api/ai/code-quaility-chek/${interviewId}?questionId=${questionId}`;
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
      } else {
        toast.error("Failed to analyze code");
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      toast.error("Error analyzing code");
    }
  };

  // Get analysis title based on type
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
  
  // Get analysis icon based on type
  const getAnalysisIcon = () => {
    switch (analysisType) {
      case "plagiarism":
        return <Search className="h-5 w-5 mr-2 text-blue-600" />;
      case "summary":
        return <Code className="h-5 w-5 mr-2 text-green-600" />;
      case "complexity":
        return <Clock className="h-5 w-5 mr-2 text-yellow-600" />;
      case "quality":
        return <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />;
      default:
        return null;
    }
  };

  // This function was duplicated - removed

  // Render analysis component based on type
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
        return <div className="p-4 text-center text-muted-foreground">No analysis data available</div>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate time taken
  const calculateTimeTaken = () => {
    if (!interview?.startTime || !submission?.submittedAt) return "N/A";

    const start = new Date(interview?.startTime);
    const end = new Date(submission?.submittedAt);
    const diffMs = end - start;

    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    return `${minutes} min ${seconds} sec`;
  };
  
  // Handle tab change
  const handleTabChange = (index) => {
    setSelectedQuestionIndex(parseInt(index));
  };

  if (interviewLoading || submissionLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (interviewError || submissionError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-4">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              Error loading submission details
            </h3>
            <p className="text-sm text-muted-foreground">
              {interviewError || submissionError}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Submission Review: {interview?.title || "Interview"}
          </h1>
          <p className="text-muted-foreground">
            Candidate: {interview?.candidate?.email || "Unknown"}
          </p>
        </div>
      </div>

      {/* Submission details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Submission Details</CardTitle>
            <CardDescription>
              Review the candidate's code submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submission?.questionSubmissions?.length > 0 ? (
              <Tabs 
                defaultValue="0" 
                className="w-full" 
                onValueChange={handleTabChange}
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  {submission.questionSubmissions.map((qs, index) => (
                    <TabsTrigger key={qs.questionId} value={index.toString()} className="text-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      {qs.questionTitle}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {submission.questionSubmissions.map((qs, index) => (
                  <TabsContent key={qs.questionId} value={index.toString()} className="mt-0">
                    <div className="bg-card rounded-md border mb-4">
                      <div className="flex items-center justify-between p-2 border-b">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="language-select"
                            className="text-sm font-medium"
                          >
                            Language:
                          </label>
                          <span className="border rounded px-2 py-1 text-sm bg-background capitalize">
                            {qs.language || "unknown"}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Submitted: {formatDate(qs.submittedAt)}
                        </div>
                      </div>
                      <Editor
                        height="500px"
                        language={qs.language}
                        value={qs.code || "// No code submitted"}
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        options={{
                          readOnly: true,
                          minimap: { enabled: true },
                          fontSize: 14,
                          wordWrap: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No submissions found
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Analysis Tools</CardTitle>
            <CardDescription>AI-powered code analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Submission Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Status:</div>
                <div className="font-medium">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>

                <div className="text-muted-foreground">Submitted:</div>
                <div className="font-medium">
                  {formatDate(submission?.submittedAt)}
                </div>

                <div className="text-muted-foreground">Time Taken:</div>
                <div className="font-medium">{calculateTimeTaken()}</div>

                <div className="text-muted-foreground">Language:</div>
                <div className="font-medium capitalize">
                  {currentQuestionSubmission?.language || "Unknown"}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">AI Analysis</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  onClick={() => handleAnalysisRequest("plagiarism")}
                  disabled={plagiarismMutation?.loading}
                >
                  <Search className="h-4 w-4" />
                  {plagiarismMutation?.loading && analysisType === "plagiarism"
                    ? "Checking..."
                    : "Detect Plagiarism"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  onClick={() => handleAnalysisRequest("summary")}
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
                  className="w-full flex items-center justify-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                  onClick={() => handleAnalysisRequest("complexity")}
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
                  className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                  onClick={() => handleAnalysisRequest("quality")}
                  disabled={codeQualityMutation.loading}
                >
                  <CheckCircle className="h-4 w-4" />
                  {codeQualityMutation.loading && analysisType === "quality"
                    ? "Checking..."
                    : "Code Quality Check"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Question Details</CardTitle>
          <CardDescription>
            The problem statement given to the candidate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <h3>{currentQuestionSubmission?.questionTitle || "Question Title"}</h3>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  interview?.questions?.find(q => q.id === currentQuestionSubmission?.questionId)?.description ||
                  "No description available",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analysis Dialog */}
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

export default ViewSubmission;
