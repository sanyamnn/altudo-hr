import React, { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! I'm your Altudo HR Buddy 🤖. Ask me anything about company policies!",
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

    const res = await fetch("https://altudo-hr.onrender.com/api/hr-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <div style={{ minHeight: 400, border: "1px solid #ccc", padding: 10, borderRadius: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: "8px 0", textAlign: msg.sender === "user" ? "right" : "left" }}>
            <span style={{
              backgroundColor: msg.sender === "user" ? "#e0e0e0" : "#f9f9f9",
              padding: "8px 12px",
              borderRadius: 10
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div>Thinking...</div>}
      </div>
      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          style={{ flex: 1, padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me something..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} style={{ marginLeft: 8, padding: "0 16px" }}>Ask</button>
      </div>
    </div>
  );
}
