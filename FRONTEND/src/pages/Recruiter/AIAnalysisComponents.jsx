import { 
  ShieldAlert, 
  CheckCircle2, 
  Brain, 
  Clock, 
  Database, 
  Sparkles,
  AlertTriangle,
  Star,
  Code2,
  Zap
} from 'lucide-react';

export const DetectPlagiarism = ({ analysis }) => {
  // Handle the plagiarism response format as an array
  if (!Array.isArray(analysis) || analysis.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        No plagiarism data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analysis.map((item, index) => (
        <div key={index} className="space-y-3 border-b pb-4 last:border-b-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-500" />
              {item.questionName
                ? `Question: ${item.questionName}`
                : `Submission ${index + 1}`}
            </h3>
            <div className="flex items-center">
              <span className="text-sm mr-2">Plagiarism:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                  item.plagiarismChance > 70
                    ? "bg-gradient-to-r from-red-100 to-red-50 text-red-800"
                    : item.plagiarismChance > 30
                    ? "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800"
                    : "bg-gradient-to-r from-green-100 to-green-50 text-green-800"
                }`}
              >
                {item.plagiarismChance > 70 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : item.plagiarismChance > 30 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {item.plagiarismChance}%
              </span>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl backdrop-blur-sm ${
              item.plagraised
                ? "bg-gradient-to-br from-red-50/80 to-red-100/80 border border-red-200"
                : "bg-gradient-to-br from-green-50/80 to-green-100/80 border border-green-200"
            }`}
          >
            <p className="text-sm">{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Summary = ({ analysis }) => {
  // Helper function to get color based on rating
  const getRatingColor = (rating) => {
    if (!rating) return "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800";

    // Handle star ratings (e.g., "5 star")
    if (typeof rating === "string" && rating.includes("star")) {
      const stars = parseInt(rating);
      if (!isNaN(stars)) {
        if (stars >= 4) return "bg-gradient-to-r from-green-100 to-green-50 text-green-800";
        if (stars >= 3) return "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800";
        if (stars >= 2) return "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800";
        return "bg-gradient-to-r from-red-100 to-red-50 text-red-800";
      }
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum)) {
      // Handle text ratings
      if (rating.toLowerCase().includes("excellent"))
        return "bg-gradient-to-r from-green-100 to-green-50 text-green-800";
      if (rating.toLowerCase().includes("good"))
        return "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800";
      if (rating.toLowerCase().includes("average"))
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800";
      if (rating.toLowerCase().includes("poor"))
        return "bg-gradient-to-r from-red-100 to-red-50 text-red-800";
      return "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800";
    } else {
      // Handle numeric ratings
      if (ratingNum >= 8) return "bg-gradient-to-r from-green-100 to-green-50 text-green-800";
      if (ratingNum >= 6) return "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800";
      if (ratingNum >= 4) return "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800";
      return "bg-gradient-to-r from-red-100 to-red-50 text-red-800";
    }
  };

  // Handle non-array response format: {content: "good code", rating: "5 star"}
  if (!Array.isArray(analysis)) {
    if (analysis && analysis.content) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Code Summary
            </h3>
            {analysis.rating && (
              <div className="flex items-center">
                <span className="text-sm mr-2">Rating:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getRatingColor(
                    analysis.rating
                  )}`}
                >
                  <Star className="w-4 h-4" />
                  {analysis.rating}
                </span>
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/80 border border-blue-200 backdrop-blur-sm">
            <p className="text-sm whitespace-pre-line">
              {analysis.content || "No content available"}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="p-6 text-center text-muted-foreground bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        No summary analysis available
      </div>
    );
  }

  // Handle array format (multiple summaries)
  if (analysis.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        No summary analysis available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analysis.map((item, index) => (
        <div key={index} className="space-y-3 border-b pb-4 last:border-b-0">
          <div className="flex items-center justify-between">
            {item.rating && (
              <div className="flex items-center">
                <span className="text-sm mr-2">Rating:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getRatingColor(
                    item.rating
                  )}`}
                >
                  <Star className="w-4 h-4" />
                  {item.rating}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/80 border border-blue-200 backdrop-blur-sm">
            <p className="text-sm whitespace-pre-line">
              {item.content || "No content available"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TimeSpaceComplexity = ({ analysis }) => {
  if (!Array.isArray(analysis) || analysis.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <Zap className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        No complexity analysis available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analysis.map((item, index) => (
        <div key={index} className="space-y-3 border-b pb-4 last:border-b-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              {item.questionName
                ? `Question: ${item.questionName}`
                : `Submission ${index + 1}`}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50/80 to-yellow-100/80 border border-yellow-200 backdrop-blur-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Time Complexity
              </h4>
              <p className="text-sm">
                {item.timeComplexity || "Not specified"}
              </p>
              {item.timeExplanation && (
                <p className="text-xs text-muted-foreground mt-2">
                  {item.timeExplanation}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/80 border border-blue-200 backdrop-blur-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Space Complexity
              </h4>
              <p className="text-sm">
                {item.spaceComplexity || "Not specified"}
              </p>
              {item.spaceExplanation && (
                <p className="text-xs text-muted-foreground mt-2">
                  {item.spaceExplanation}
                </p>
              )}
            </div>
          </div>

          {item.optimizationTips && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/80 to-green-100/80 border border-green-200 backdrop-blur-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                Optimization Tips
              </h4>
              <p className="text-sm whitespace-pre-line">
                {item.optimizationTips}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const CodeQualityCheck = ({ analysis }) => {
  // Normalize the analysis to an array for consistent rendering
  const data = Array.isArray(analysis)
    ? analysis
    : analysis
    ? [analysis]
    : [];

  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <Code2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        No code quality data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-3 border-b pb-4 last:border-b-0">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">
              {item.questionName || 'Unnamed Question'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/80 to-green-100/80 border border-green-200 backdrop-blur-sm text-sm">
            {item.content || 'No details available'}
          </div>
        </div>
      ))}
    </div>
  );
};
