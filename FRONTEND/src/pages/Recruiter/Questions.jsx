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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import useQuery from "@/hooks/useQuery";
import useMutation from "@/hooks/useMutation";
import { toast } from "sonner";

const Questions = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
  });
  // --- AI Question Generation State ---
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const { data: questions = [], loading, error, refetch } = useQuery("/api/questions", {
    cb: (data) => data?.data?.data,
  });

  const createMutation = useMutation({
    cb: () => {
      setIsCreateModalOpen(false);
      refetch();
      toast.success("Question created successfully");
    },
  });

  const updateMutation = useMutation();

  const deleteMutation = useMutation({
    cb: () => {
      refetch();
      toast.success("Question deleted successfully");
    },
  });

  // --- AI Question Generation Mutation ---
  const aiGenerateMutation = useMutation();

  // --- AI Question Generation Handler ---
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await aiGenerateMutation.mutate({
        url: "/api/questions/generate",
        method: "POST",
        data: { prompt: aiPrompt },
      });
      const data = res.data;
      // Support both {title, description, programmingLanguage} and {programming_language}
      const language = data.programmingLanguage || data.programming_language;
      if (data && data.title && data.description && language) {
        setFormData({
          title: data.title,
          description: data.description,
          language: language.toLowerCase(),
        });
      } else {
        throw new Error("AI did not return valid question data");
      }
    } catch (err) {
      setAiError(err.error || err.message || "Failed to generate question");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
      const res = await createMutation.mutate({
        url: "/api/questions",
        method: "POST",
        data: formData,
      });
      setFormData({ title: "", description: "", language: "" });
      if(res.success){
        setIsCreateModalOpen(false);
        refetch();
        setFormData({ title: "", description: "", language: "" });
      }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
  
     const res = await updateMutation.mutate({
        url: `/api/questions/${selectedQuestion.id}`,
        method: "PUT",
        data: formData,
      });
      if(res.success){
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
        setFormData({ title: "", description: "", language: "" });
        refetch();
      }
    
  };

  const handleDelete = async (id) => {
    
      const res = await deleteMutation.mutate({
        url: `/api/questions/${id}`,
        method: "DELETE",
      });
      if(res.success){
        refetch();
      }
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      language: question.language,
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading questions...</p>
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
            <h3 className="text-lg font-semibold">Error loading questions</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground mt-1">
            Manage technical interview questions
          </p>
        </div>
          <Button className="gap-2 w-full md:w-auto" onClick={()=>setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
        <Dialog open={isCreateModalOpen} onOpenChange={()=>setIsCreateModalOpen(false)}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full md:w-auto">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent
        className="sm:max-w-[500px]"
        onClose={()=>setIsCreateModalOpen(false)}
      >
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>
                Create a new technical interview question
              </DialogDescription>
            </DialogHeader>
            {/* --- AI Question Generation Input --- */}
<form onSubmit={handleCreate}>
  <div className="space-y-4 py-4">
    <div className="space-y-2">
      <Label htmlFor="ai-prompt">Create with AI</Label>
      <div className="flex gap-2">
        <Input
          id="ai-prompt"
          placeholder="Describe the question you want (e.g., 'Create a question about binary search in Python')"
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          disabled={aiLoading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAIGenerate}
          disabled={aiLoading || !aiPrompt.trim()}
          className="shrink-0"
        >
          {aiLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Generate with AI"}
        </Button>
      </div>
      {aiError && <div className="text-xs text-red-600 mt-1">{aiError}</div>}
    </div>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="language">Programming Language</Label>
        <Select
          value={formData.language}
          onValueChange={(value) =>
            setFormData({ ...formData, language: value })
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <DialogFooter>
      <Button type="submit" disabled={createMutation.loading}>
        {createMutation.loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Question"
        )}
      </Button>
    </DialogFooter>
  </div>
</form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questions?.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{question.title}</CardTitle>
              <CardDescription>{question.language}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {question.description}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(question)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(question.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
        className="sm:max-w-[500px]"
        onClose={()=>setIsEditModalOpen(false)}
      >
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the technical interview question
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-language">Programming Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData({ ...formData, language: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.loading}>
                {updateMutation.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Question"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Questions; 