import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
  isProcessing: boolean;
}

export const VideoUpload = ({ onVideoSelect, isProcessing }: VideoUploadProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    },
    []
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelectFile(file);
    },
    []
  );

  const validateAndSelectFile = (file: File) => {
    if (!file) return;

    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP4, WEBM, MOV, or AVI video file.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 100MB.",
        variant: "destructive",
      });
      return;
    }

    onVideoSelect(file);
  };

  return (
    <div
      className={`glass-card rounded-lg p-12 border-2 border-dashed transition-all ${
        isProcessing ? "opacity-50 pointer-events-none" : "hover:border-primary"
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Upload Video</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your grayscale video here
          </p>
          <label htmlFor="video-upload">
            <div className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors ai-glow">
              Select Video
            </div>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground">
          Supports MP4, WEBM, MOV, AVI (Max 100MB)
        </p>
      </div>
    </div>
  );
};
