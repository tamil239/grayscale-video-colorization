import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { VideoComparison } from "@/components/VideoComparison";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

type ProcessingStatusType = "idle" | "uploading" | "colorizing" | "complete";

const Index = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatusType>("idle");
  const [progress, setProgress] = useState(0);
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string>("");
  const [colorizedFrame, setColorizedFrame] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVideoSelect = async (file: File) => {
    try {
      setStatus("uploading");
      setColorizedFrame("");

      const videoUrl = URL.createObjectURL(file);
      setOriginalVideoUrl(videoUrl);

      setStatus("idle");
      
      toast({
        title: "Video Uploaded",
        description: "Pause the video at any frame to colorize it!",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred during video upload.",
        variant: "destructive",
      });
      setStatus("idle");
    }
  };

  const handleFrameCapture = async (frameDataUrl: string) => {
    try {
      setIsProcessing(true);
      setStatus("colorizing");
      setProgress(0);

      const { data, error } = await supabase.functions.invoke("colorize-frame", {
        body: { frame: frameDataUrl },
      });

      if (error) {
        console.error("Colorization error:", error);
        toast({
          title: "Colorization Error",
          description: "Failed to colorize frame. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        setStatus("idle");
        return;
      }

      setColorizedFrame(data.colorizedFrame);
      setStatus("complete");
      setProgress(100);

      toast({
        title: "Success!",
        description: "Frame colorized successfully",
      });
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing Failed",
        description: "An error occurred during colorization.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-ai-secondary bg-clip-text text-transparent">
              AI Video Colorization
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a video and pause at any frame to colorize it with AI
          </p>
        </div>

        {/* Upload Section */}
        {!originalVideoUrl && (
          <VideoUpload onVideoSelect={handleVideoSelect} isProcessing={false} />
        )}

        {/* Processing Status */}
        {status === "colorizing" && (
          <ProcessingStatus
            status={status}
            progress={progress}
          />
        )}

        {/* Video Comparison */}
        {originalVideoUrl && (
          <VideoComparison
            originalVideo={originalVideoUrl}
            colorizedFrame={colorizedFrame}
            isProcessing={isProcessing}
            onFrameCapture={handleFrameCapture}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
