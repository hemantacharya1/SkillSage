import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateTimePicker from "@/components/ui/dateTimePicker";
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchQuestions } from '@/redux/slices/questionSlice';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Loader2, Calendar, Clock, Mail, FileText, Tag, CheckCircle2 } from 'lucide-react';

const CreateInterviewModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const { questions = [], loading: questionsLoading = false } = useSelector((state) => state.question || {});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    candidateEmail: '',
    startTime: new Date(),
    duration: 30,
    type: 'TECHNICAL',
    questionIds: []
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionSelect = (questionId) => {
    setFormData(prev => {
      const currentQuestions = prev.questionIds;
      if (currentQuestions.includes(questionId)) {
        return {
          ...prev,
          questionIds: currentQuestions.filter(id => id !== questionId)
        };
      } else if (currentQuestions.length < 3) {
        return {
          ...prev,
          questionIds: [...currentQuestions, questionId]
        };
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...formData,
        startTime: formData.startTime.toISOString(),
        duration: parseInt(formData.duration)
      });
    } catch (error) {
      toast.error(error.message || 'Failed to create interview');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-2xl">Create New Interview</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
            <div className="grid grid-cols-2 h-full">
              {/* Left Column - Basic Details */}
              <ScrollArea className="h-[calc(80vh-8rem)]">
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Interview Title
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Frontend Developer Interview"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of the interview"
                        required
                        className="w-full"
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
                        name="candidateEmail"
                        value={formData.candidateEmail}
                        onChange={handleInputChange}
                        placeholder="candidate@example.com"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Start Time
                      </Label>
                      <DateTimePicker
                        date={formData.startTime}
                        setDate={(date) => setFormData({ ...formData, startTime: date })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="15"
                        max="120"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Interview Type
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
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
                </div>
              </ScrollArea>

              {/* Right Column - Question Selection */}
              <ScrollArea className="h-[calc(80vh-8rem)]">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Select Questions (Max 3)</Label>
                    <div className="text-sm text-muted-foreground">
                      {formData.questionIds.length}/3 selected
                    </div>
                  </div>

                  {questionsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {questions.map((question) => (
                        <Card 
                          key={question.id}
                          className={`p-4 transition-all hover:shadow-md ${
                            formData.questionIds.includes(question.id) 
                              ? 'border-primary bg-primary/5' 
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={`question-${question.id}`}
                              checked={formData.questionIds.includes(question.id)}
                              onCheckedChange={() => handleQuestionSelect(question.id)}
                              disabled={!formData.questionIds.includes(question.id) && formData.questionIds.length >= 3}
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
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formData.questionIds.length === 0}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Create Interview
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInterviewModal; 