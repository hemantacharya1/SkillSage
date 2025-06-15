import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InterviewCard from "@/components/candidate/dashboard/InterviewCard";
import { fetchInterviews } from "@/redux/slices/interviewSlice";
import {
  Loader2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { selectUser } from "@/redux/features/user/userSlice";
import useQuery from "@/hooks/useQuery";

const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("active");
  const {
    data: interviews = [],
    loading = false,
    error = null,
  } = useQuery("/api/interviews", {
    cb: (data) => {
      return data?.data?.data;
    },
  });
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchInterviews());
  }, [dispatch]);

  const activeInterviews = interviews?.filter(
    (interview) =>
      interview.status === "SCHEDULED" || interview.status === "IN_PROGRESS"
  );

  const pastInterviews = interviews?.filter(
    (interview) =>
      interview.status === "COMPLETED" || interview.status === "EXPIRED"
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Loading your interviews...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-500">Error loading interviews: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back, {user?.name || "Candidate"}!
          </h2>
          <p className="text-blue-100 text-lg">
            Manage your technical interviews and track your progress
          </p>
        </div>
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/50 backdrop-blur-sm border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Interviews
                </p>
                <p className="text-2xl font-bold">{interviews?.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </p>
                <p className="text-2xl font-bold">{activeInterviews?.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold">{pastInterviews?.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 h-12 bg-blue-50/50">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Active Interviews
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Interview History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeInterviews?.length > 0 ? (
            activeInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))
          ) : (
            <Card className="bg-white/50 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">
                  No Active Interviews
                </CardTitle>
                <CardDescription className="text-blue-700/70">
                  You don't have any upcoming interviews. Check back later for
                  new opportunities!
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {pastInterviews?.length > 0 ? (
            pastInterviews.map((interview) => (
              <InterviewCard key={interview?.id} interview={interview} />
            ))
          ) : (
            <Card className="bg-white/50 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">
                  No Interview History
                </CardTitle>
                <CardDescription className="text-blue-700/70">
                  Your completed interviews will appear here. Keep up the good
                  work!
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateDashboard;
