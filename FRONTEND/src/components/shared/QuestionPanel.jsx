import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const QuestionPanel = ({
  questions,
  currentQuestionIndex,
  onNext,
  onPrev,
  showNavigation = true,
}) => {
  const currentQuestion = questions?.[currentQuestionIndex] || null;

  return (
    <div className="bg-card border-b p-4 max-h-48 overflow-y-auto">
      {questions && questions.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-foreground">
              {currentQuestion?.title || "Coding Challenge"}
            </h2>
            {showNavigation && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrev}
                  disabled={currentQuestionIndex === 0}
                  className={`p-1 rounded ${
                    currentQuestionIndex === 0
                      ? "text-gray-400"
                      : "text-primary hover:bg-primary-50"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-muted-foreground">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
                <button
                  onClick={onNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className={`p-1 rounded ${
                    currentQuestionIndex === questions.length - 1
                      ? "text-gray-400"
                      : "text-primary hover:bg-primary-50"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {currentQuestion?.description || "No description available"}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Language:</span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              {currentQuestion?.language || "Not specified"}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No questions available for this interview
        </div>
      )}
    </div>
  );
};

export default QuestionPanel; 