export async function startBot(botId: string, token: string) {
  const response = await fetch("/api/bots/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botId, token }),
  });
  return response.json();
}

export async function sendBroadcast(message: string, botIds: string[], delay: number = 0, targetType: string = "all") {
  const response = await fetch("/api/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, botIds, delay, targetType }),
  });
  return response.json();
}
