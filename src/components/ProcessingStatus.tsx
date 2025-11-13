import { Loader2, CheckCircle2, Image } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingStatusProps {
  status: "idle" | "uploading" | "colorizing" | "complete";
  progress: number;
}

export const ProcessingStatus = ({
  status,
  progress,
}: ProcessingStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "uploading":
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-primary" />,
          title: "Uploading Video",
          description: "Preparing video for processing...",
        };
      case "colorizing":
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-primary" />,
          title: "AI Colorization in Progress",
          description: "Processing frame with neural networks...",
        };
      case "complete":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          title: "Colorization Complete",
          description: "Frame colorized successfully!",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className="glass-card rounded-lg p-6 space-y-4">
      <div className="flex items-start space-x-3">
        <div className="mt-1">{config.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{config.title}</h4>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-right text-muted-foreground">{progress}%</p>
      </div>
    </div>
  );
};
