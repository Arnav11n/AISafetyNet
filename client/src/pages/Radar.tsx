import { Navbar } from "@/components/Navbar";
import { useRadarStats, useSubmitScamReport } from "@/hooks/use-radar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, AlertTriangle, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#003366", "#007BA7", "#EF4444", "#F59E0B", "#10B981"];

export default function Radar() {
  const { data: stats } = useRadarStats();
  const { mutate: submitReport, isPending } = useSubmitScamReport();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    scamType: "",
    description: "",
    location: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(form, {
      onSuccess: () => {
        setIsOpen(false);
        setForm({ scamType: "", description: "", location: "" });
        toast({ title: "Report Submitted", description: "Thank you for helping keep the community safe." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to submit report. Please try again.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold font-heading text-white">Live Scam Radar</h1>
            <p className="text-white/60 mt-2">Real-time reporting and analytics of fraud activities.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/25 neon-border">
                <Plus className="mr-2 h-5 w-5" /> Report a Scam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-black/95 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Report an Incident</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-2 text-white">
                  <Label className="text-white/60">Scam Type</Label>
                  <Select onValueChange={(val) => setForm({...form, scamType: val})} required>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent className="bg-black border-white/10 text-white">
                      <SelectItem value="upi">UPI / Payment Fraud</SelectItem>
                      <SelectItem value="deepfake">Deepfake / AI Impersonation</SelectItem>
                      <SelectItem value="job">Job / Employment Scam</SelectItem>
                      <SelectItem value="impersonation">Official Impersonation</SelectItem>
                      <SelectItem value="phishing">Phishing Link</SelectItem>
                      <SelectItem value="bullying">Cyber Bullying</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60">Location (City/Region)</Label>
                  <Input 
                    placeholder="e.g. New Delhi" 
                    value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60">Description</Label>
                  <Textarea 
                    placeholder="Describe what happened..." 
                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/20"
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Card */}
          <Card className="lg:col-span-2 p-6 shadow-md border-white/10 bg-black/40 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-6 font-heading text-white">Scam Types Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.scamTypes || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="type"
                  >
                    {(stats?.scamTypes || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recent Reports Feed */}
          <Card className="p-6 shadow-md border-white/10 bg-black/40 backdrop-blur-xl h-[400px] flex flex-col">
            <h3 className="text-xl font-bold mb-4 font-heading text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-secondary" /> 
              Recent Reports
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {stats?.recentReports.map((report) => (
                <div key={report.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 capitalize">
                      {report.scamType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {report.dateReported ? new Date(report.dateReported).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2 mb-2">{report.description}</p>
                  {report.location && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" /> {report.location}
                    </div>
                  )}
                </div>
              ))}
              {!stats?.recentReports.length && (
                <div className="text-center text-muted-foreground py-8">No reports yet.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Heatmap Section */}
        <Card className="mt-8 p-6 shadow-md border-white/10 bg-black/40 backdrop-blur-xl">
          <h3 className="text-xl font-bold mb-6 font-heading text-white">Regional Report Density</h3>
          <div className="bg-white/5 rounded-xl h-[400px] flex items-center justify-center relative overflow-hidden border border-white/10">
             {/* Simple Map Visualization */}
             <div className="absolute inset-0 opacity-10 pointer-events-none text-white">
               <svg viewBox="0 0 800 600" className="w-full h-full">
                 <path d="M150,150 Q200,100 250,150 T350,150 T450,250 T550,150 T650,250" fill="none" stroke="currentColor" strokeWidth="2" />
                 <path d="M100,300 Q200,400 300,300 T500,300 T700,400" fill="none" stroke="currentColor" strokeWidth="2" />
               </svg>
             </div>
             <div className="relative z-10 w-full h-full p-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {(() => {
                   const locations = stats?.recentReports.reduce((acc: Record<string, number>, r) => {
                     if (r.location) acc[r.location] = (acc[r.location] || 0) + 1;
                     return acc;
                   }, {});
                   return Object.entries(locations || {}).map(([loc, count], i) => (
                     <div key={loc} className="bg-black/60 p-4 rounded-lg shadow-sm border border-white/10 flex flex-col items-center backdrop-blur-md">
                       <MapPin className="h-5 w-5 text-primary mb-2" />
                       <span className="font-bold text-sm text-white">{loc}</span>
                       <span className="text-xs text-white/40">{count} {count === 1 ? 'Report' : 'Reports'}</span>
                       <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
                         <div 
                           className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(183,80,255,0.6)]" 
                           style={{ width: `${Math.min(count * 20, 100)}%` }}
                         />
                       </div>
                     </div>
                   ));
                 })()}
                 {(!stats?.recentReports.some(r => r.location)) && (
                   <div className="col-span-full text-center text-muted-foreground">No location data available yet.</div>
                 )}
               </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
