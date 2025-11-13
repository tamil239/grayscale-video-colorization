import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoComparisonProps {
  originalVideo: string;
  colorizedFrames: string[];
  isProcessing: boolean;
}

export const VideoComparison = ({
  originalVideo,
  colorizedFrames,
  isProcessing,
}: VideoComparisonProps) => {
  const originalRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  useEffect(() => {
    const video = originalRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (colorizedFrames.length === 0) return;
      const progress = video.currentTime / video.duration;
      const frameIndex = Math.floor(progress * colorizedFrames.length);
      setCurrentFrameIndex(Math.min(frameIndex, colorizedFrames.length - 1));
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [colorizedFrames]);

  const togglePlayPause = () => {
    const video = originalRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    const video = originalRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentFrameIndex(0);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original Video */}
        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Original (Grayscale)</h3>
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

        {/* Colorized Output */}
        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-sm text-primary">AI Colorized</h3>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {colorizedFrames.length > 0 ? (
              <img
                src={colorizedFrames[currentFrameIndex]}
                alt="Colorized frame"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                {isProcessing ? "Processing..." : "Awaiting colorization"}
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
          disabled={!colorizedFrames.length}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={togglePlayPause}
          size="lg"
          disabled={!colorizedFrames.length}
          className="ai-glow"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Play
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
