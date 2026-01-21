import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, User, Smartphone, AlertCircle, CheckCircle2, XCircle, Loader2, PlayCircle } from "lucide-react";
import { useSubmitScore, useLeaderboard } from "@/hooks/use-game";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { GameQuestion } from "@shared/schema";

type Role = "Student" | "Corporate" | "Senior" | "Shopper" | "Influencer";

export default function Game() {
  const [gameState, setGameState] = useState<"start" | "playing" | "summary">("start");
  const [selectedRole, setSelectedRole] = useState<Role>("Student");
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  
  const { data: questions, isLoading: isLoadingQuestions, refetch: refetchQuestions } = useQuery<GameQuestion[]>({
    queryKey: ["/api/game/questions", selectedRole],
    queryFn: async () => {
      const res = await fetch(`/api/game/questions?theme=${selectedRole.toLowerCase()}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return res.json();
    },
    enabled: false,
  });

  const { mutate: submitScore, isPending: isSubmitting } = useSubmitScore();
  const { data: leaderboard } = useLeaderboard();
  const { user } = useAuth();

  const handleStart = async () => {
    setScore(0);
    setCurrentScenarioIndex(0);
    setFeedback(null);
    await refetchQuestions();
    setGameState("playing");
  };

  const handleChoice = (choice: "REAL" | "FAKE") => {
    if (!questions) return;
    const scenario = questions[currentScenarioIndex];
    const isCorrect = (choice === "FAKE" && scenario.isScam) || (choice === "REAL" && !scenario.isScam);
    
    if (isCorrect) {
      setScore(s => s + 100);
      setFeedback({ correct: true, message: "Correct! " + scenario.explanation });
    } else {
      setFeedback({ correct: false, message: "Incorrect. " + scenario.explanation });
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentScenarioIndex < questions.length - 1) {
        setCurrentScenarioIndex(i => i + 1);
      } else {
        finishGame(score + (isCorrect ? 100 : 0));
      }
    }, 2500);
  };

  const finishGame = (finalScore: number) => {
    setGameState("summary");
    submitScore({
      playerName: user?.firstName || "Guest Player",
      role: selectedRole.toLowerCase(),
      score: finalScore,
      scenariosCompleted: questions?.length || 0
    });
  };

  const ROLES: Role[] = ["Student", "Corporate", "Senior", "Shopper", "Influencer"];

  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {gameState === "start" && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-12"
            >
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-heading text-white">Fraud Awareness Challenge</h1>
                <p className="text-lg text-white/60">
                  Test your ability to spot scams in realistic scenarios. 
                  Select your persona to begin.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedRole === role 
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                          : "border-white/10 hover:border-primary/50 bg-black/40"
                      }`}
                    >
                      <User className={`mb-2 h-6 w-6 ${selectedRole === role ? "text-primary" : "text-white/40"}`} />
                      <div className={`font-bold ${selectedRole === role ? "text-white" : "text-white/40"}`}>{role}</div>
                    </button>
                  ))}
                </div>

                <Button size="lg" onClick={handleStart} disabled={isLoadingQuestions} className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(183,80,255,0.3)]">
                  {isLoadingQuestions ? <Loader2 className="animate-spin" /> : "Start Game"}
                </Button>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                  <Trophy className="h-6 w-6 text-primary shadow-[0_0_10px_rgba(183,80,255,0.4)]" />
                  Global Leaderboard
                </div>
                <div className="space-y-4">
                  {leaderboard?.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg font-bold text-white/20 w-6">#{i+1}</span>
                        <div>
                          <div className="font-bold text-white">{entry.playerName}</div>
                          <div className="text-xs text-white/40 capitalize">{entry.role}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-primary">{entry.score} pts</div>
                    </div>
                  ))}
                  {!leaderboard?.length && (
                    <div className="text-center text-muted-foreground py-8">No scores yet. Be the first!</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "playing" && questions && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto"
            >
              <div className="mb-8 flex justify-between items-center text-sm font-bold text-muted-foreground">
                <span>Scenario {currentScenarioIndex + 1}/{questions.length}</span>
                <span>Score: {score}</span>
              </div>

              {/* Phone Frame */}
              <div className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-4 border-slate-800 relative overflow-hidden">
                <div className="bg-white rounded-[2.2rem] h-[750px] overflow-hidden flex flex-col relative">
                  {/* Status Bar */}
                  <div className="h-8 bg-slate-100 flex justify-between px-6 items-center text-[10px] font-bold text-slate-500 shrink-0">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-slate-300 rounded-sm"></div>
                      <div className="w-4 h-2 bg-slate-300 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar p-6">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={currentScenarioIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-center mb-6">
                          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                            {questions[currentScenarioIndex].type === "SMS" && <Smartphone className="h-8 w-8 text-slate-500" />}
                            {questions[currentScenarioIndex].type === "Call" && <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">📞</div>}
                            {questions[currentScenarioIndex].type === "Video" && <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">▶️</div>}
                          </div>
                        </div>
                        
                        {questions[currentScenarioIndex].sender && (
                          <div className="text-center text-sm font-bold text-slate-600 mb-2">
                            {questions[currentScenarioIndex].sender}
                          </div>
                        )}

                        {/* External Media Support - Moved Above Message */}
                        {questions[currentScenarioIndex].mediaUrl && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                             {questions[currentScenarioIndex].mediaType === 'image' && (
                               <img src={questions[currentScenarioIndex].mediaUrl!} alt="Evidence" className="w-full h-auto" />
                             )}
                             {questions[currentScenarioIndex].mediaType === 'video' && (
                               <video src={questions[currentScenarioIndex].mediaUrl!} controls className="w-full h-auto" />
                             )}
                             {questions[currentScenarioIndex].mediaType === 'audio' && (
                               <div className="p-4 flex flex-col items-center gap-2">
                                 <audio src={questions[currentScenarioIndex].mediaUrl!} controls className="w-full" />
                               </div>
                             )}
                          </div>
                        )}

                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm leading-relaxed text-black">
                          {questions[currentScenarioIndex].content}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Feedback Overlay - Adjusted Position */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`absolute inset-x-4 bottom-24 p-4 rounded-xl shadow-lg border-2 z-20 ${
                          feedback.correct ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {feedback.correct ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                          <p className="text-sm font-medium">{feedback.message}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Controls - Fixed to Bottom */}
                  <div className="p-4 bg-black/60 border-t border-white/10 grid grid-cols-2 gap-3 z-10 shrink-0 backdrop-blur-md rounded-b-[2.2rem]">
                    <Button 
                      variant="outline" 
                      onClick={() => handleChoice("FAKE")}
                      className="border-secondary/50 hover:bg-secondary/10 hover:text-secondary h-12 text-secondary font-bold"
                      disabled={!!feedback}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      FAKE
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleChoice("REAL")}
                      className="border-primary/50 hover:bg-primary/10 hover:text-primary h-12 text-primary font-bold"
                      disabled={!!feedback}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      GENUINE
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "summary" && (
            <motion.div 
              key="summary"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-lg mx-auto text-center space-y-8"
            >
              <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-xl border-t-8 border-secondary border-x border-b border-white/10">
                <Trophy className="h-16 w-16 text-primary mx-auto mb-6 shadow-lg shadow-primary/20" />
                <h2 className="text-3xl font-bold text-white mb-2 font-heading">Challenge Complete!</h2>
                <div className="text-5xl font-bold text-secondary mb-6">{score} <span className="text-lg text-white/40">pts</span></div>
                
                <p className="text-white/60 mb-8">
                  {score === 500 && "You are very smart and well protected against cyber crime!"}
                  {score >= 300 && score < 500 && "Great job! You have a strong awareness of digital safety."}
                  {score >= 100 && score < 300 && "Good effort, but there's more to learn about online security."}
                  {score < 100 && "Stay alert! Practice more to better protect yourself from scams."}
                </p>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setGameState("start")} variant="outline">Play Again</Button>
                  <Button onClick={() => window.location.href = "/radar"} className="bg-primary">Check Scam Radar</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
