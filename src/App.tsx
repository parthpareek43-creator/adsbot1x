import { useState, useEffect } from "react";
import { Bot, Settings, Activity, Users, MessageSquare, LogIn, Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/src/firebase";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { AddBotDialog } from "@/src/components/AddBotDialog";
import { BotList } from "@/src/components/BotList";
import { BroadcastForm } from "@/src/components/BroadcastForm";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Initializing System...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white border-[#141414] rounded-none shadow-none">
          <CardHeader className="text-center border-b border-[#141414]/10">
            <div className="mx-auto bg-[#141414] text-[#E4E3E0] p-3 rounded w-fit mb-4">
              <Bot size={32} />
            </div>
            <CardTitle className="font-serif italic text-2xl">AdsAppBot Manager</CardTitle>
            <CardDescription className="font-mono text-[10px] uppercase tracking-widest">Secure Access Required</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <p className="text-sm text-center opacity-70">
              Welcome to the advanced Telegram bot management system. Please sign in to access your dashboard.
            </p>
            <Button 
              onClick={handleLogin}
              className="w-full bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/90 rounded-none font-mono text-xs uppercase tracking-widest py-6"
            >
              <LogIn size={18} className="mr-2" />
              Enter Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-[#141414] text-[#E4E3E0] p-1.5 rounded">
            <Bot size={20} />
          </div>
          <h1 className="font-serif italic text-xl font-medium tracking-tight">AdsAppBot Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="font-mono text-[10px] border-[#141414] uppercase tracking-widest">
            System Online
          </Badge>
          <Button variant="outline" size="sm" className="border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors">
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-between items-end border-b border-[#141414]/20 pb-4">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#141414] rounded-none px-0 pb-2 font-mono text-xs uppercase tracking-widest"
              >
                01. Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="bots" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#141414] rounded-none px-0 pb-2 font-mono text-xs uppercase tracking-widest"
              >
                02. Managed Bots
              </TabsTrigger>
              <TabsTrigger 
                value="broadcast" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#141414] rounded-none px-0 pb-2 font-mono text-xs uppercase tracking-widest"
              >
                03. Broadcast
              </TabsTrigger>
              <TabsTrigger 
                value="schedules" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#141414] rounded-none px-0 pb-2 font-mono text-xs uppercase tracking-widest"
              >
                04. Schedules
              </TabsTrigger>
            </TabsList>
            
            <AddBotDialog />
          </div>

          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Active Bots", value: "12", icon: Bot, trend: "+2" },
                { label: "Total Users", value: "1,284", icon: Users, trend: "+124" },
                { label: "Messages Sent", value: "45.2k", icon: MessageSquare, trend: "+1.2k" },
                { label: "Uptime", value: "99.9%", icon: Activity, trend: "Stable" },
              ].map((stat, i) => (
                <Card key={i} className="bg-white border-[#141414] rounded-none shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                      {stat.label}
                    </CardTitle>
                    <stat.icon size={14} className="opacity-50" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif italic font-medium">{stat.value}</div>
                    <p className="text-[10px] font-mono mt-1 opacity-50 uppercase tracking-tighter">
                      {stat.trend} from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-white border-[#141414] rounded-none shadow-none">
                <CardHeader className="border-b border-[#141414]/10">
                  <CardTitle className="font-serif italic text-lg">System Activity</CardTitle>
                  <CardDescription className="font-mono text-[10px] uppercase tracking-widest">Real-time log of bot interactions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#141414]/10">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div>
                            <p className="font-medium text-sm">New User Interaction</p>
                            <p className="font-mono text-[10px] opacity-50 uppercase tracking-widest group-hover:opacity-100">Bot: @AdsAppMainBot • User: @john_doe</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] opacity-50 group-hover:opacity-100">12:45 PM</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#141414] rounded-none shadow-none">
                <CardHeader className="border-b border-[#141414]/10">
                  <CardTitle className="font-serif italic text-lg">Quick Actions</CardTitle>
                  <CardDescription className="font-mono text-[10px] uppercase tracking-widest">Common management tasks</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("broadcast")}
                    className="w-full justify-start border-[#141414] rounded-none font-mono text-[10px] uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0]"
                  >
                    <Send size={14} className="mr-2" />
                    New Broadcast
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("schedules")}
                    className="w-full justify-start border-[#141414] rounded-none font-mono text-[10px] uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0]"
                  >
                    <Calendar size={14} className="mr-2" />
                    Schedule Post
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bots" className="animate-in fade-in duration-500">
             <BotList />
          </TabsContent>

          <TabsContent value="broadcast" className="animate-in fade-in duration-500 max-w-2xl mx-auto">
             <BroadcastForm />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}


