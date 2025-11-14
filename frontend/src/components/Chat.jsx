import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMsg = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);

    const res = await axios.post("http://127.0.0.1:8000/ask", {
      question,
    });

    const botMsg = { sender: "bot", text: res.data.answer };
    setMessages((prev) => [...prev, botMsg]);

    setQuestion("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AI Personal Knowledge Assistant
      </h1>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-800 rounded-lg shadow-lg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-xl ${
              msg.sender === "user"
                ? "bg-blue-600 self-end"
                : "bg-gray-700 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 p-3 rounded-l-xl bg-gray-800 border border-gray-600"
          placeholder="Ask something from your documents..."
        />
        <button
          onClick={askQuestion}
          className="px-6 bg-green-600 rounded-r-xl hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
