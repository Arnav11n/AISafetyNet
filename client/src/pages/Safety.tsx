import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Phone, CheckSquare, Shield, Lock, AlertOctagon, Heart, Brain, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SafetyEffect, RealStory } from "@shared/schema";

export default function Safety() {
  const { data: effects } = useQuery<SafetyEffect[]>({
    queryKey: ["/api/safety/effects"],
  });

  const { data: stories } = useQuery<RealStory[]>({
    queryKey: ["/api/safety/stories"],
  });

  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      
      <div className="container max-w-5xl mx-auto px-4 py-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold font-heading text-white mb-4">Safety Resource Center</h1>
          <p className="text-xl text-white/60">Essential guides, helplines, and checklists to secure your digital life.</p>
        </div>

        {/* 1) Helpline Numbers */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 bg-black/40 shadow-lg border-l-4 border-l-primary">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white">Emergency Helplines</h2>
            </div>
            <ul className="space-y-4">
              <li className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <div className="font-bold text-white">National Cyber Crime</div>
                  <div className="text-sm text-white/40">Report financial fraud immediately</div>
                </div>
                <div className="text-2xl font-bold text-primary font-mono">1930</div>
              </li>
              <li className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <div className="font-bold text-white">Police Emergency</div>
                  <div className="text-sm text-white/40">General emergency response</div>
                </div>
                <div className="text-2xl font-bold text-primary font-mono">112</div>
              </li>
            </ul>
          </Card>

          <Card className="p-8 bg-black/40 shadow-lg border-l-4 border-l-secondary">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <AlertOctagon className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-white">Red Flags to Watch</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Urgency: 'Act now or lose your account'",
                "Unusual Payment Methods: Gift cards, Crypto",
                "Requests for OTP or Password sharing",
                "Grammar and Spelling errors in official mails",
                "Unexpected attachments from unknown senders"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/60">
                  <div className="h-2 w-2 rounded-full bg-secondary mt-2 shadow-[0_0_8px_rgba(244,41,126,0.6)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* 2) Checklist */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center text-white font-heading uppercase tracking-widest">Digital Hygiene Checklist</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: "Enable 2FA", text: "Turn on Two-Factor Authentication for all banking and social apps." },
              { icon: Shield, title: "Update Software", text: "Keep your OS and antivirus updated to patch security holes." },
              { icon: CheckSquare, title: "Verify Requests", text: "Call the supposed sender on a known number before transferring money." },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 hover:shadow-[0_0_20px_rgba(183,80,255,0.15)] transition-all">
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                <p className="text-white/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3) Effects of Cyber Crime */}
        <section>
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Heart className="h-6 w-6 text-secondary animate-pulse" />
            <h2 className="text-3xl font-bold text-white font-heading">Effects of Cyber Crime</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {effects?.map((effect) => (
              <Card key={effect.id} className="p-6 overflow-hidden flex flex-col bg-black/40 border-white/10 hover:border-primary/50 transition-all">
                {effect.imageUrl ? (
                  <div className="h-48 w-full bg-white/5 mb-6 rounded-lg overflow-hidden">
                    <img src={effect.imageUrl} alt={effect.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-white/5 mb-6 rounded-lg flex items-center justify-center border-2 border-dashed border-white/10">
                    <Brain className="h-12 w-12 text-white/20" />
                  </div>
                )}
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                  <span className={`w-2 h-2 rounded-full ${effect.type === 'mental' ? 'bg-primary' : 'bg-accent'}`} />
                  {effect.title}
                </h3>
                <p className="text-white/60 leading-relaxed">{effect.description}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs uppercase tracking-wider font-bold text-white/20">
                  <span>Category</span>
                  <span className={effect.type === 'mental' ? 'text-primary' : 'text-accent'}>{effect.type} Impact</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 4) Real Stories */}
        <section className="bg-white/5 backdrop-blur-xl -mx-4 px-4 py-16 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-2 mb-12 justify-center">
            <Quote className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-white font-heading">Real Stories, Real Lessons</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {stories?.map((story) => (
              <Card key={story.id} className="p-8 bg-black/60 shadow-xl relative flex flex-col h-full border-white/10 hover:border-primary/50">
                {story.imageUrl ? (
                  <div className="h-40 w-full bg-white/5 mb-6 rounded-xl overflow-hidden shrink-0">
                    <img src={story.imageUrl} alt="Story" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-white/5 mb-6 rounded-xl flex items-center justify-center border-2 border-dashed border-white/10 shrink-0">
                    <Shield className="h-10 w-10 text-white/10" />
                  </div>
                )}
                <div className="flex-grow italic text-white/60 leading-relaxed mb-6">
                  "{story.story}"
                </div>
                <div className="text-right font-bold text-primary">
                  — {story.author}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
