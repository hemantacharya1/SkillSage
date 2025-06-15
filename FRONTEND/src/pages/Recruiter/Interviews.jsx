import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Calendar, Clock, Mail } from "lucide-react";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import { toast } from "sonner";
import moment from "moment";
import InterviewCard from "@/components/recruiter/dashboard/InterviewCard";

const Interviews = () => {
  const navigate = useNavigate();

  const { data: interviews = [], loading, refetch } = useQuery("/api/interviews", {
    cb: (data) => data?.data?.data || [],
  });

  const deleteMutation = useMutation();

  const upcomingInterviews = interviews?.filter(
    (interview) =>
      interview.status === "SCHEDULED" || interview.status === "IN_PROGRESS"
  );

  const handleDelete = async (id) => {
    if (!id) return;

    const res = await deleteMutation.mutate({
      url: `/api/interviews/${id}`,
      method: "DELETE",
    });

    if (res.success) {
      refetch();
    }
  };

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-muted-foreground">
            Manage and schedule technical interviews
          </p>
        </div>
        <Button onClick={() => navigate("/recruiter/interviews/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      <div className="grid gap-4">
        {upcomingInterviews?.length > 0 ? (
          upcomingInterviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} create handleDelete={handleDelete}/>

          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No upcoming interviews</p>
              <Button onClick={() => navigate("/recruiter/interviews/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

   
    </div>
  );
};

export default Interviews; 