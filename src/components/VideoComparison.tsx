import { useRef, useState } from "react";
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoComparisonProps {
  originalVideo: string;
  colorizedFrame: string;
  isProcessing: boolean;
  onFrameCapture: (frameDataUrl: string) => void;
}

export const VideoComparison = ({
  originalVideo,
  colorizedFrame,
  isProcessing,
  onFrameCapture,
}: VideoComparisonProps) => {
  const originalRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const captureCurrentFrame = () => {
    const video = originalRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    onFrameCapture(frameDataUrl);
  };

  const togglePlayPause = () => {
    const video = originalRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      // Capture and colorize the paused frame
      captureCurrentFrame();
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    const video = originalRef.current;
    if (!video) return;
    video.currentTime = 0;
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="glass-card rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Video Frame Colorization</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Pause to colorize frame
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Original Video */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Original Video</h4>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={originalRef}
                src={originalVideo}
                className="w-full h-full object-contain filter grayscale"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          </div>

          {/* Colorized Frame */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-primary">AI Colorized Frame</h4>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {colorizedFrame ? (
                <img
                  src={colorizedFrame}
                  alt="Colorized frame"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-8 h-8 animate-pulse text-primary" />
                      <p>Colorizing frame...</p>
                    </>
                  ) : (
                    <>
                      <Pause className="w-8 h-8" />
                      <p>Pause video to colorize frame</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={handleRestart}
            variant="secondary"
            size="icon"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={togglePlayPause}
            size="lg"
            className="ai-glow"
            disabled={isProcessing}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause & Colorize
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Play Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
