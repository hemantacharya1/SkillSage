import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import InterviewCard from "@/components/recruiter/dashboard/InterviewCard";
import CreateInterviewModal from "@/components/recruiter/dashboard/CreateInterviewModal";
import {
  fetchInterviews,
  createInterview,
} from "@/redux/slices/interviewSlice";
import { toast } from "sonner";
import useQuery from "@/hooks/useQuery";
import { useNavigate } from "react-router-dom";

const RecruiterDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    data: interviews = [],
    loading = false,
    error = null,
  } = useQuery("/api/interviews", {
    cb: (data) => {
      return data?.data?.data;
    },
  });
  console.log(interviews, "interviews");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // useEffect(() => {
  //   const loadInterviews = async () => {
  //     try {
  //       await dispatch(fetchInterviews()).unwrap();
  //     } catch (error) {
  //       toast.error('Failed to load interviews');
  //     }
  //   };
  //   loadInterviews();
  // }, [dispatch]);

  const handleCreateInterview = async (newInterview) => {
    try {
      const res = await dispatch(createInterview(newInterview)).unwrap();
      if (res?.data) {
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to create interview");
    }
  };

  const upcomingInterviews = Array.isArray(interviews)
    ? interviews.filter(
        (interview) =>
          interview.status === "SCHEDULED" || interview.status === "IN_PROGRESS"
      )
    : [];

  const pastInterviews = Array.isArray(interviews)
    ? interviews.filter(
        (interview) =>
          interview.status === "COMPLETED" || interview.status === "CANCELLED"
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading interviews...</p>
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
            <h3 className="text-lg font-semibold">Error loading interviews</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button onClick={() => dispatch(fetchInterviews())}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interview Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and schedule technical interviews
          </p>
        </div>
        <Button
          className="gap-2 w-full md:w-auto"
          onClick={() => navigate("/recruiter/interviews/create")}
        >
          <Plus className="h-4 w-4" />
          Schedule New Interview
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interviews
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews?.length}</div>
            <p className="text-xs text-muted-foreground">All time interviews</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingInterviews.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled interviews
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastInterviews.length}</div>
            <p className="text-xs text-muted-foreground">Past interviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Interviews Section */}
      <div className="space-y-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
            <TabsTrigger value="past">Past Interviews</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingInterviews.length > 0 ? (
              <div className="grid gap-4">
                {upcomingInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            ) : (
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>No Upcoming Interviews</CardTitle>
                  <CardDescription>
                    Schedule a new interview to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => navigate("/recruiter/interviews/create")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Schedule Interview
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastInterviews.length > 0 ? (
              <div className="grid gap-4">
                {pastInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            ) : (
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>No Past Interviews</CardTitle>
                  <CardDescription>
                    Completed interviews will appear here
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateInterviewModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInterview}
      />
    </div>
  );
};

export default RecruiterDashboard;
