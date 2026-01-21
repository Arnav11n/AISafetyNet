import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Image as ImageIcon,
  ShieldAlert,
  Sparkles,
  Scale,
} from "lucide-react";

declare global {
  interface Window {
    puter: any;
  }
}

export default function DeepfakeDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      toast({
        title: "Image Required",
        description: "Please upload a photo to see the simulation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGeneratedImage(null);
    setActiveModel("google/imagen-4.0-ultra");

    try {
      if (!window.puter || !window.puter.ai) {
        throw new Error("Simulation service unavailable.");
      }

      // -----------------------------------------------------------------------
      // FIX: Explicitly handle Puter Authentication
      // This ensures the popup opens and CLOSE automatically after login.
      // -----------------------------------------------------------------------
      if (window.puter.auth && !window.puter.auth.isSignedIn()) {
        console.log("User not signed in. Opening Puter login window...");

        // This function handles the popup lifecycle:
        // 1. Opens the login window
        // 2. Waits for user to login/signup
        // 3. Closes the window automatically upon success
        await window.puter.auth.signIn();

        // Double-check if login was successful
        if (!window.puter.auth.isSignedIn()) {
          throw new Error("Authentication was not completed.");
        }
      }

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64String = (reader.result as string).split(",")[1];
          resolve(base64String);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      const prompt =
        "Place this person in a realistic courtroom setting. MAINTAIN EXACT FACIAL FEATURES, EXPRESSION, AND IDENTITY. The face must remain identical to the source image. Change only the clothing to formal attire and the background to a professional courtroom.";

      console.log(`Attempting simulation with model: google/imagen-4.0-ultra`);

      const response = await window.puter.ai.txt2img(prompt, {
        model: "google/imagen-4.0-ultra",
        input_image: base64Data,
        input_image_mime_type: file.type,
        image_guidance_scale: 15.0,
        negative_prompt:
          "deformed face, changed features, different person, blurry face, caricature",
      });

      console.log(`Response from google/imagen-4.0-ultra:`, response);

      let imageSrc = null;
      if (typeof response === "string") {
        imageSrc = response;
      } else if (response && response.src) {
        imageSrc = response.src;
      } else if (response && response.blob) {
        imageSrc = URL.createObjectURL(response.blob);
      }

      if (imageSrc) {
        setGeneratedImage(imageSrc);
        toast({
          title: "Simulation Complete",
          description: `Visual evidence generated using google/imagen-4.0-ultra`,
        });
      } else {
        throw new Error("Simulation model failed to respond.");
      }
    } catch (error: any) {
      console.error("Simulation Error:", error);
      toast({
        title: "Simulation Error",
        description: error.message || "Processing failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 font-heading flex items-center justify-center gap-2">
            <Scale className="h-8 w-8 text-primary animate-pulse" />
            Legal Evidence Simulation
          </h1>
          <p className="text-xl text-white/60">
            Understand how AI can manipulate environments to create misleading
            legal scenarios.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover-elevate shadow-xl border-t-4 border-t-primary bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ImageIcon className="h-5 w-5 text-primary" />
                Step 1: Upload Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white/60 leading-relaxed">
                Upload a portrait. The simulation will contextualize the subject
                in a courtroom setting while strictly preserving facial
                identity.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-white/40">
                  Source Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs font-bold text-white/40 uppercase mb-2">
                  Simulation Mode:
                </p>
                <p className="text-sm font-medium text-white/80">
                  Ultra-High Fidelity Preservation
                </p>
                <p className="text-[10px] text-white/40 mt-1">
                  Model: google/imagen-4.0-ultra
                </p>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 shadow-lg"
                disabled={loading || !file}
                onClick={handleGenerate}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing with Ultra Engine...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Courtroom Scene</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate shadow-xl border-t-4 border-t-destructive bg-black/40 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                Simulated Result
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center justify-center relative overflow-hidden group">
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl ${generatedImage ? "border-transparent" : "border-white/10"} bg-white/5 transition-all duration-300 ${generatedImage ? "w-full h-auto" : "w-[90%] aspect-square max-h-[350px]"}`}
              >
                {generatedImage ? (
                  <div className="w-full relative">
                    <img
                      src={generatedImage}
                      alt="Simulated Evidence"
                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                        <ShieldAlert className="h-3 w-3 text-destructive" />
                        SIMULATED MEDIA
                      </div>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="text-center space-y-6 p-8">
                    <div className="relative">
                      <Loader2 className="h-16 w-12 animate-spin text-primary mx-auto" />
                      <Sparkles className="h-6 w-6 text-secondary absolute top-0 right-1/4 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-white">
                        Synthesizing environment...
                      </p>
                      <p className="text-xs text-white/40">
                        Model: google/imagen-4.0-ultra
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-8 w-8 text-white/20" />
                    </div>
                    <p className="text-white/40 text-sm italic">
                      Upload a photo to see how AI can create misleading visual
                      context.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-8 bg-black/40 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert className="h-32 w-32 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-white font-heading border-b border-white/10 pb-4">
            The Danger of Environmental Deepfakes
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-white/60 leading-relaxed">
            <div className="space-y-4">
              <p>
                <strong className="text-white">Context Manipulation:</strong>{" "}
                Modern AI doesn't just swap faces; it can convincingly change
                the entire context of a photo.
              </p>
              <p>
                In this simulation, a regular portrait is placed in a courtroom.
                In the wrong hands, this technique can be used to create fake
                evidence, discredit individuals, or spread misinformation about
                ongoing legal proceedings.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-secondary" />
                Vigilance Guide
              </h3>
              <ul className="text-sm space-y-2">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Look for lighting inconsistencies between the subject and the
                  background.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Check for "ghosting" or blurriness where the subject meets new
                  objects.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Always cross-reference sensational images with trusted
                  official sources.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
