
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AltudoHRChatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! I'm your Altudo HR Buddy 🤖. Ask me anything about company policies — from onboarding to promotions, I'm here to help!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/hr-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen flex flex-col justify-between">
      <Card className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-2xl p-3 shadow-md w-fit max-w-[85%] ${
              msg.sender === "user" ? "bg-gray-100 self-end" : "bg-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="rounded-2xl p-3 shadow-md w-fit max-w-[85%] bg-white animate-pulse">
            Thinking...
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <CardContent className="p-4 flex gap-2">
          <Input
            placeholder="Ask me about performance reviews, onboarding, PIPs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} disabled={loading}>
            <Sparkles className="w-4 h-4 mr-1" /> Ask
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
