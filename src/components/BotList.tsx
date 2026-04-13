import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db, auth } from "@/src/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Activity, Power, Trash2 } from "lucide-react";

export function BotList() {
  const [bots, setBots] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "bots"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const botsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBots(botsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="bg-white border-[#141414] rounded-none shadow-none">
      <CardHeader className="border-b border-[#141414]/10">
        <CardTitle className="font-serif italic text-lg">Managed Bot Instances</CardTitle>
        <CardDescription className="font-mono text-[10px] uppercase tracking-widest">Active and inactive bots under your control</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#141414]/10">
                <th className="p-4 font-mono text-[10px] uppercase tracking-widest opacity-50">Bot Name</th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-widest opacity-50">Status</th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-widest opacity-50">Created</th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-widest opacity-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/10">
              {bots.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center font-mono text-[10px] uppercase tracking-widest opacity-50 italic">
                    No bots found. Add your first bot to get started.
                  </td>
                </tr>
              ) : (
                bots.map((bot) => (
                  <tr key={bot.id} className="hover:bg-[#141414]/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#141414] text-[#E4E3E0] p-1 rounded">
                          <Activity size={12} />
                        </div>
                        <span className="font-medium italic font-serif">{bot.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${bot.status === 'active' ? 'bg-green-500' : 'bg-red-500'} text-white rounded-none font-mono text-[8px] uppercase tracking-widest`}>
                        {bot.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-xs opacity-50">
                      {bot.createdAt?.toDate ? bot.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-[#141414] hover:text-[#E4E3E0]">
                        <Power size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-red-500 hover:text-white">
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
