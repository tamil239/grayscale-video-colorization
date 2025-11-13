import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { VideoComparison } from "@/components/VideoComparison";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

type ProcessingStatus = "idle" | "uploading" | "extracting" | "colorizing" | "complete";

const Index = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string>("");
  const [colorizedFrames, setColorizedFrames] = useState<string[]>([]);
  const [framesProcessed, setFramesProcessed] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);

  const extractFrames = async (videoFile: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const frames: string[] = [];

      video.src = URL.createObjectURL(videoFile);
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const duration = video.duration;
        const frameInterval = 0.5; // Extract frame every 0.5 seconds
        const totalFrameCount = Math.floor(duration / frameInterval);
        setTotalFrames(totalFrameCount);

        let currentTime = 0;
        const captureFrame = () => {
          if (currentTime > duration) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }

          video.currentTime = currentTime;
          video.onseeked = () => {
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL("image/jpeg", 0.8));
            currentTime += frameInterval;
            setProgress(Math.floor((frames.length / totalFrameCount) * 30)); // 30% for extraction
            captureFrame();
          };
        };

        captureFrame();
      };
    });
  };

  const colorizeFrames = async (frames: string[]) => {
    const colorized: string[] = [];
    setStatus("colorizing");

    for (let i = 0; i < frames.length; i++) {
      try {
        const { data, error } = await supabase.functions.invoke("colorize-frame", {
          body: { frame: frames[i] },
        });

        if (error) {
          console.error("Colorization error:", error);
          toast({
            title: "Colorization Error",
            description: "Failed to colorize frame. Using original frame.",
            variant: "destructive",
          });
          colorized.push(frames[i]);
        } else {
          colorized.push(data.colorizedFrame);
        }

        setFramesProcessed(i + 1);
        setProgress(30 + Math.floor(((i + 1) / frames.length) * 70)); // 70% for colorization
        setColorizedFrames([...colorized]);
      } catch (error) {
        console.error("Frame processing error:", error);
        colorized.push(frames[i]);
      }
    }

    return colorized;
  };

  const handleVideoSelect = async (file: File) => {
    try {
      setStatus("uploading");
      setProgress(0);
      setColorizedFrames([]);

      const videoUrl = URL.createObjectURL(file);
      setOriginalVideoUrl(videoUrl);

      setStatus("extracting");
      const frames = await extractFrames(file);

      const colorized = await colorizeFrames(frames);

      setStatus("complete");
      setProgress(100);

      toast({
        title: "Success!",
        description: `Successfully colorized ${colorized.length} frames`,
      });
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing Failed",
        description: "An error occurred during video processing.",
        variant: "destructive",
      });
      setStatus("idle");
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
            Transform your grayscale videos into vibrant color using advanced neural networks
            and deep learning algorithms
          </p>
        </div>

        {/* Upload Section */}
        {status === "idle" && (
          <VideoUpload onVideoSelect={handleVideoSelect} isProcessing={false} />
        )}

        {/* Processing Status */}
        {status !== "idle" && status !== "complete" && (
          <ProcessingStatus
            status={status}
            progress={progress}
            framesProcessed={framesProcessed}
            totalFrames={totalFrames}
          />
        )}

        {/* Video Comparison */}
        {originalVideoUrl && (
          <VideoComparison
            originalVideo={originalVideoUrl}
            colorizedFrames={colorizedFrames}
            isProcessing={status !== "complete"}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
