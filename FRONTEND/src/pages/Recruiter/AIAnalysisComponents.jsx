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

// Global style injection for modern AI palette and glassmorphism
const aiPaletteStyle = `
  :root {
    --ai-primary: #0061ff;
    --ai-accent: #6840ff;
    --ai-background: #f9f9fc;
    --ai-muted: #e3e8f0;
    --ai-text: #22223b;
    --ai-card: #fff;
    --ai-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
    --ai-glass: rgba(255,255,255,0.6);
    --ai-glass-border: rgba(104,64,255,0.12);
    --ai-gradient: linear-gradient(135deg, #f9f9fc 0%, #e3e8f0 100%);
  }
  .ai-glass-card {
    background: var(--ai-glass);
    border-radius: 18px;
    box-shadow: var(--ai-shadow);
    border: 1.5px solid var(--ai-glass-border);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 1.5rem;
  }
  .ai-badge {
    background: linear-gradient(90deg, var(--ai-primary) 60%, var(--ai-accent) 100%);
    color: #fff;
    border-radius: 999px;
    padding: 0.25rem 1rem;
    font-weight: 600;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    box-shadow: 0 2px 8px 0 rgba(104,64,255,0.08);
  }
  .ai-badge-red {
    background: linear-gradient(90deg, #ff4d4f 60%, #ff6f91 100%);
    color: #fff;
    border-radius: 999px;
    padding: 0.25rem 1rem;
    font-weight: 600;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    box-shadow: 0 2px 8px 0 rgba(255,77,79,0.10);
  }
  .ai-section-title {
    color: var(--ai-primary);
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
  .ai-muted {
    color: #6c6f80;
  }
  .ai-progress-bar {
    background: var(--ai-muted);
    border-radius: 999px;
    height: 0.5rem;
    overflow: hidden;
    margin-top: 0.5rem;
  }
  .ai-progress {
    background: linear-gradient(90deg, var(--ai-primary) 60%, var(--ai-accent) 100%);
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s cubic-bezier(.4,0,.2,1);
  }
`;
if (typeof window !== "undefined" && !document.getElementById("ai-palette-style")) {
  const style = document.createElement("style");
  style.id = "ai-palette-style";
  style.innerHTML = aiPaletteStyle;
  document.head.appendChild(style);
}

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
                // Badge turns red if any common spelling of 'plagiarised' is true
                className={
                  `px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ` +
                  ((item.plagraised || item.plagiarised || item.plagiarized) ? "ai-badge-red" : "ai-badge")
                }
              >
                <Brain className="w-4 h-4" style={{ color: 'var(--ai-accent)' }} />
                {item.plagiarismChance}%
              </span>
            </div>
          </div>

          <div className="ai-glass-card">
            <p className="text-sm" style={{ color: 'var(--ai-text)' }}>{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Summary = ({ analysis }) => {
  // Helper function to get color based on rating
  const getRatingColor = (rating) => {
    // All ratings use the ai-badge style for consistency
    return "ai-badge";
  };

  if (!Array.isArray(analysis)) {
    if (analysis && analysis.content) {
      return (
        <div className="space-y-3">
          <div className="ai-section-title" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
              <Brain className="w-5 h-5" style={{ color: 'var(--ai-accent)' }} />
              Code Summary
            </span>
            {analysis.rating && (
              <span className={getRatingColor(analysis.rating)}>
                <Star className="w-4 h-4" />
                {analysis.rating}
              </span>
            )}
          </div>
          <div className="ai-glass-card">
            <p className="text-sm whitespace-pre-line" style={{ color: 'var(--ai-text)' }}>
              {analysis.content || "No content available"}
            </p>
          </div>
        </div>
      );
    }
    return null;
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
            <h3 className="ai-section-title">
              <Zap className="w-5 h-5" style={{ color: 'var(--ai-accent)' }} />
              {item.questionName
                ? `Question: ${item.questionName}`
                : `Submission ${index + 1}`}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="ai-glass-card">
              <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--ai-primary)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--ai-primary)' }} />
                Time Complexity
              </h4>
              <p className="text-sm" style={{ color: 'var(--ai-text)' }}>
                {item.timeComplexity || "Not specified"}
              </p>
              {item.timeExplanation && (
                <p className="text-xs ai-muted mt-2">
                  {item.timeExplanation}
                </p>
              )}
            </div>

            <div className="ai-glass-card">
              <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--ai-accent)' }}>
                <Database className="w-4 h-4" style={{ color: 'var(--ai-accent)' }} />
                Space Complexity
              </h4>
              <p className="text-sm" style={{ color: 'var(--ai-text)' }}>
                {item.spaceComplexity || "Not specified"}
              </p>
              {item.spaceExplanation && (
                <p className="text-xs ai-muted mt-2">
                  {item.spaceExplanation}
                </p>
              )}
            </div>
          </div>

          {item.optimizationTips && (
            <div className="ai-glass-card">
              <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--ai-accent)' }}>
                <Sparkles className="w-4 h-4" style={{ color: 'var(--ai-accent)' }} />
                Optimization Tips
              </h4>
              <p className="text-sm whitespace-pre-line" style={{ color: 'var(--ai-text)' }}>
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
          <div className="ai-section-title">
            <Code2 className="w-5 h-5" style={{ color: 'var(--ai-primary)' }} />
            <span>
              {item.questionName || 'Unnamed Question'}
            </span>
          </div>
          <div className="ai-glass-card text-sm" style={{ color: 'var(--ai-text)' }}>
            {item.content || 'No details available'}
          </div>
        </div>
      ))}
    </div>
  );
};
