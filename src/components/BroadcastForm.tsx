import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db, auth } from "@/src/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { sendBroadcast } from "@/src/lib/api";
import { toast } from "sonner";
import { Send, Calendar as CalendarIcon } from "lucide-react";

export function BroadcastForm() {
  const [message, setMessage] = useState("");
  const [bots, setBots] = useState<any[]>([]);
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [delay, setDelay] = useState(5);
  const [targetType, setTargetType] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "bots"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const botsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBots(botsData);
      setSelectedBots(botsData.map(b => b.id));
    });

    return () => unsubscribe();
  }, []);

  const handleBroadcast = async () => {
    if (!message || selectedBots.length === 0) {
      toast.error("Please enter a message and select at least one bot");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Save to history
      await addDoc(collection(db, "broadcasts"), {
        message,
        botIds: selectedBots,
        delay,
        targetType,
        status: "sent",
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Execute broadcast
      await sendBroadcast(message, selectedBots, delay, targetType);

      toast.success("Broadcast started in background!");
      setMessage("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to start broadcast: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-[#141414] rounded-none shadow-none">
      <CardHeader className="border-b border-[#141414]/10">
        <CardTitle className="font-serif italic text-lg">Create New Broadcast</CardTitle>
        <CardDescription className="font-mono text-[10px] uppercase tracking-widest">
          Send a message to all users or groups across selected bots
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest">Target Audience</Label>
            <select 
              value={targetType} 
              onChange={(e) => setTargetType(e.target.value)}
              className="w-full p-2 border border-[#141414] rounded-none bg-white font-mono text-xs uppercase tracking-widest"
            >
              <option value="all">All (Private + Groups)</option>
              <option value="private">Private Chats Only</option>
              <option value="groups">Groups Only</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest">Delay (Seconds)</Label>
            <Input 
              type="number" 
              value={delay} 
              onChange={(e) => setDelay(Number(e.target.value))}
              min={0}
              className="rounded-none border-[#141414] bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-mono text-[10px] uppercase tracking-widest">Select Bots</Label>
          <div className="flex flex-wrap gap-2">
            {bots.map((bot) => (
              <Button
                key={bot.id}
                variant={selectedBots.includes(bot.id) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (selectedBots.includes(bot.id)) {
                    setSelectedBots(selectedBots.filter(id => id !== bot.id));
                  } else {
                    setSelectedBots([...selectedBots, bot.id]);
                  }
                }}
                className={`rounded-none font-mono text-[10px] uppercase tracking-widest ${
                  selectedBots.includes(bot.id) ? "bg-[#141414] text-[#E4E3E0]" : "border-[#141414]"
                }`}
              >
                {bot.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="font-mono text-[10px] uppercase tracking-widest">Message Content</Label>
          <Textarea
            id="message"
            placeholder="Type your broadcast message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[200px] rounded-none border-[#141414] bg-white resize-none"
          />
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleBroadcast} 
            disabled={loading}
            className="flex-1 bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/90 rounded-none font-mono text-xs uppercase tracking-widest"
          >
            <Send size={16} className="mr-2" />
            {loading ? "Starting..." : "Send Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
