import { Navbar } from "@/components/Navbar";
import { useAnalyzeMedia, useDetectionHistory } from "@/hooks/use-detection";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Upload, FileVideo, FileAudio, FileImage, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";

export default function Detection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: analyze, isPending, data: result } = useAnalyzeMedia();
  const { data: history } = useDetectionHistory();
  const { isAuthenticated } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image")) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    analyze(formData, {
      onSuccess: async (data: any) => {
        if (data.isDeepfake !== undefined) {
          try {
            await apiRequest("POST", "/api/detection/history", {
              mediaType: file.type.startsWith('image/') ? 'image' : 'video',
              fileName: file.name,
              isDeepfake: data.isDeepfake,
              confidenceScore: data.confidence || 0,
            });
            queryClient.invalidateQueries({ queryKey: [api.detection.history.path] });
          } catch (err) {
            console.error("Failed to save history:", err);
          }
        }
      }
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score > 80) return "text-secondary";
    if (score > 50) return "text-yellow-500";
    return "text-primary";
  };

  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Panel: Upload Tool */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold font-heading text-white">Deepfake Detector</h1>
              <p className="text-white/60 text-lg">
                Upload images, audio, or video files. Our AI ensemble will analyze them for manipulation traces.
              </p>
            </div>

            <Card className="p-8 border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors bg-black/40 rounded-2xl">
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                  {file ? (
                    file.type.startsWith("image") ? <FileImage className="h-10 w-10 text-primary" /> :
                    file.type.startsWith("video") ? <FileVideo className="h-10 w-10 text-primary" /> :
                    <FileAudio className="h-10 w-10 text-primary" />
                  ) : (
                    <Upload className="h-10 w-10 text-white/40" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{file ? file.name : "Drag & drop or click to upload"}</h3>
                  <p className="text-sm text-muted-foreground">Supported: JPG, PNG, MP3, MP4, WAV (Max 10MB)</p>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,video/*,audio/*"
                />
                
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Select File
                  </Button>
                  {file && (
                    <Button onClick={handleAnalyze} disabled={isPending} className="bg-secondary hover:bg-secondary/90">
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isPending ? "Scanning..." : "Analyze Media"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <AnimatePresence>
              {isPending && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-black rounded-2xl p-12 shadow-xl border border-white/10 flex flex-col items-center justify-center space-y-4"
                >
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-primary">Analyzing Media</h3>
                    <p className="text-white/40">Running ensemble models for deepfake detection...</p>
                  </div>
                </motion.div>
              )}

              {result && !isPending && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black rounded-2xl shadow-xl overflow-hidden border border-white/10"
                >
                  <div className={`p-6 ${result.isDeepfake ? "bg-red-950/20" : "bg-green-950/20"} border-b border-white/10`}>
                    <div className="flex items-center gap-4">
                      {result.isDeepfake 
                        ? <ShieldAlert className="h-12 w-12 text-secondary" />
                        : <CheckCircle className="h-12 w-12 text-primary" />
                      }
                      <div>
                        <h2 className="text-2xl font-bold font-heading text-white">
                          {result.isDeepfake ? "Deepfake Detected" : "Likely Authentic"}
                        </h2>
                        <p className="text-white/60 font-medium">
                          Confidence Score: <span className={result.isDeepfake ? "text-secondary" : "text-primary"}>{result.confidence}%</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium text-white/80">
                        <span>Manipulation Probability</span>
                        <span>{result.confidence}%</span>
                      </div>
                      <Progress value={result.confidence} className={`h-2 ${result.isDeepfake ? "bg-red-950" : "bg-green-950"}`} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: Recent History (Auth Protected) */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-heading text-white">Recent Scans</h2>
            {!isAuthenticated ? (
              <Card className="p-8 text-center bg-white/5 border-none shadow-inner backdrop-blur-md">
                <p className="text-white/40 mb-4">Log in to view your scan history.</p>
                <Button onClick={() => window.location.href = "/api/login"} variant="outline">Login</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {history?.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/5 p-4 rounded-xl shadow-sm border border-white/10 flex items-center justify-between backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        {item.mediaType === "image" && <FileImage className="h-5 w-5 text-white/40" />}
                        {item.mediaType === "video" && <FileVideo className="h-5 w-5 text-white/40" />}
                        {item.mediaType === "audio" && <FileAudio className="h-5 w-5 text-white/40" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm truncate max-w-[150px] text-white">{item.fileName}</div>
                        <div className="text-xs text-white/40">{new Date(item.createdAt || "").toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.isDeepfake ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
                    }`}>
                      {item.isDeepfake ? "FAKE" : "REAL"}
                    </div>
                  </motion.div>
                ))}
                {!history?.length && <p className="text-white/40">No history found.</p>}
              </div>
            )}
            
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 mt-8 border border-white/10 shadow-[0_0_15px_rgba(183,80,255,0.05)]">
              <h3 className="font-bold text-primary mb-2">How it works</h3>
              <p className="text-sm text-white/60 mb-4">
                Our ensemble model analyzes:
              </p>
              <ul className="text-sm text-white/40 space-y-2 list-disc pl-4">
                <li>Visual artifacts in frequency domain</li>
                <li>Inconsistent lighting and shadows</li>
                <li>Unnatural eye blinking patterns</li>
                <li>Audio-visual synchronization errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
