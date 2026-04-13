import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { db, auth } from "@/src/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { startBot } from "@/src/lib/api";
import { toast } from "sonner";

export function AddBotDialog() {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAddBot = async () => {
    if (!token || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const docRef = await addDoc(collection(db, "bots"), {
        token,
        name,
        ownerId: user.uid,
        status: "active",
        createdAt: serverTimestamp(),
      });

      // Start the bot on the server
      await startBot(docRef.id, token);

      toast.success("Bot added and started successfully!");
      setOpen(false);
      setToken("");
      setName("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add bot: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/90 rounded-none font-mono text-xs uppercase tracking-widest px-6">
          <Plus size={16} className="mr-2" />
          Add New Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none border-[#141414] bg-[#E4E3E0]">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl">Add Managed Bot</DialogTitle>
          <DialogDescription className="font-mono text-[10px] uppercase tracking-widest">
            Enter the bot token from @BotFather to start managing it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-mono text-[10px] uppercase tracking-widest">Bot Name</Label>
            <Input
              id="name"
              placeholder="e.g. Main Ads Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-none border-[#141414] bg-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="token" className="font-mono text-[10px] uppercase tracking-widest">Bot Token</Label>
            <Input
              id="token"
              placeholder="123456789:ABCdef..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="rounded-none border-[#141414] bg-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleAddBot} 
            disabled={loading}
            className="bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/90 rounded-none font-mono text-xs uppercase tracking-widest w-full"
          >
            {loading ? "Starting Bot..." : "Initialize Bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
