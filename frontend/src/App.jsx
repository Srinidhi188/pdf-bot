
import { useState, useEffect, useRef } from "react";

export default function App() {
  // Chat states
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  // Upload states
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // Theme
  const [dark, setDark] = useState(true);

  // Speech recognition
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // scroll to bottom
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = true; // live interim text
    recog.maxAlternatives = 1;

    recog.onresult = (event) => {
      // build interim/final transcript
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      // show interim if present (don't overwrite user-typed text permanently)
      setInput((prev) => {
        // If user was typing manually, don't stomp; but for simplicity we prefer speech
        return (final || interim) ? (prev ? "" : "") + final + interim : prev;
      });

      // If final text detected, we keep it in input (user can stop to send)
    };

    recog.onerror = (e) => {
      console.error("Speech recognition error:", e);
      // stop listening if error
      try {
        recog.stop();
      } catch {}
      setListening(false);
    };

    recog.onend = () => {
      // recognition ended (maybe because stopped)
      setListening(false);
    };

    recognitionRef.current = recog;
    setSpeechSupported(true);

    return () => {
      try {
        recog.onresult = null;
        recog.onerror = null;
        recog.onend = null;
      } catch {}
    };
  }, []);

  // Typing simulation (same approach as your original)
  const simulateTyping = async (text) => {
    setTyping(true);
    // ensure there's at least one AI message to update
    setMessages((prev) => [...prev, { sender: "ai", text: "" }]);

    let index = 0;
    while (index <= text.length) {
      // small delay to simulate typing
      await new Promise((res) => setTimeout(res, 12));
      setMessages((prev) => {
        // find last AI message
        const lastIdx = prev.map((m) => m.sender).lastIndexOf("ai");
        if (lastIdx === -1) return prev;
        const newArr = [...prev];
        newArr[lastIdx] = { ...newArr[lastIdx], text: text.slice(0, index) };
        return newArr;
      });
      index++;
    }
    setTyping(false);
  };

  // Upload PDF
  const uploadPDF = async () => {
    if (!pdfFile) return alert("Select a PDF first!");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        setUploaded(true);
        alert("PDF uploaded successfully!");
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      alert("Error uploading PDF: " + err);
    }
    setUploading(false);
  };

  // sendMessage can be used directly or called from speech stop
  const sendMessage = async (overrideInput = null) => {
    const messageText = overrideInput !== null ? overrideInput : input.trim();
    if (!uploaded) return alert("Upload a PDF first!");
    if (!messageText) return;

    // add user message
    setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText }),
      });

      if (!res.ok) {
        const errTxt = await res.text();
        throw new Error(errTxt || "Server error");
      }

      const data = await res.json();
      // simulate typing the AI answer
      await simulateTyping(data.answer || data?.text || "No answer.");
    } catch (err) {
      alert("Error: " + err.message);
      // push an error message from bot
      setMessages((prev) => [...prev, { sender: "ai", text: "Sorry, something went wrong." }]);
    }

    setLoading(false);
  };

  // speech button toggle (Option 3 behavior)
  const toggleListening = () => {
    if (!speechSupported) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    const recog = recognitionRef.current;
    if (!recog) return;

    if (!listening) {
      try {
        recog.start();
        setListening(true);
        // show feedback by clearing input (or you can keep user text)
        setInput("");
      } catch (e) {
        console.error("Failed to start recognition:", e);
        alert("Could not start listening: " + e.message);
      }
    } else {
      // stop recognition and then send the message automatically
      try {
        // 'onresult' handler will have updated `input` with final/interim text
        recog.stop();
      } catch (e) {
        console.warn("stop error", e);
      }
      // small delay to ensure recognition.onresult final events processed
      setTimeout(() => {
        const captured = input.trim();
        if (captured) sendMessage(captured); // send automatically per Option 3
      }, 300);
    }
  };

  // Theme toggle helper
  useEffect(() => {
    // apply body class for background when theme toggles (useful globally)
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // UI render
  return (
    <div className={`${dark ? "bg-[#0e1525] text-white" : "bg-white text-slate-900"} w-full min-h-screen flex flex-col items-center py-6 transition-colors duration-300`}>
      {/* Header */}
      <div className="w-[70%] flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Personal Knowledge Assistant</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark((d) => !d)}
            className="px-3 py-2 rounded-full border hover:opacity-90"
            title="Toggle theme"
          >
            {dark ? "🌙 Dark" : "☀️ Light"}
          </button>
          {/* mic help */}
          <div className="text-sm text-gray-400">{speechSupported ? (listening ? "Listening…" : "Mic ready") : "Mic not supported"}</div>
        </div>
      </div>

      {/* PDF Upload Box */}
      <div className={`${dark ? "bg-[#111827]" : "bg-gray-100"} w-[70%] p-6 rounded-xl shadow-xl mb-6 transition-colors`}>
        <h2 className={`text-xl font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Upload Your PDF</h2>

        <div className="mt-3 flex items-center gap-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="text-sm"
          />

          <button
            onClick={uploadPDF}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
            disabled={uploading}
          >
            {uploading ? "Processing..." : "Upload PDF"}
          </button>

          {uploaded && (
            <p className="text-green-400 font-semibold">✔ PDF Uploaded! You can now chat.</p>
          )}
        </div>

        {pdfFile && <p className="mt-2 text-sm text-gray-300">Selected: {pdfFile.name}</p>}
      </div>

      {/* Chat Box */}
      <div className={`${dark ? "bg-[#111827]" : "bg-gray-50"} w-[70%] h-[55vh] rounded-xl shadow-xl p-6 overflow-y-auto transition-colors`}>

        {messages.map((msg, i) => (
          <div key={i} className={`my-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-5 py-3 max-w-[70%] rounded-2xl text-sm shadow-md break-words ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
                  : `${dark ? "bg-gray-700 text-gray-50" : "bg-white text-slate-900"} rounded-bl-none`
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start my-2">
            <div className={`${dark ? "bg-gray-700 text-gray-50" : "bg-gray-100 text-slate-900"} px-4 py-2 rounded-xl animate-pulse`}>Typing...</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input + Mic + Send */}
      <div className="w-[70%] mt-4 flex items-center">
        <div className={`flex-1 relative`}>
          <input
            className={`${dark ? "bg-[#1f2937] text-white" : "bg-white text-slate-900"} w-full px-5 py-3 rounded-l-2xl outline-none`}
            placeholder="Ask something from your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          {/* mic inside input (right side) */}
          <button
            onClick={toggleListening}
            className={`absolute right-28 top-1/2 -translate-y-1/2 p-2 rounded-full border ${listening ? "bg-red-500 text-white" : "bg-white/5"}`}
            title={listening ? "Stop & send" : "Start listening"}
          >
            {listening ? "🔴" : "🎙️"}
          </button>
        </div>

        <button
          className="px-6 py-3 bg-green-600 rounded-r-2xl hover:bg-green-700 text-white"
          onClick={() => sendMessage()}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* small footer */}
      <div className="w-[70%] mt-3 text-xs text-gray-400 flex justify-between">
        <div>Mic: {speechSupported ? "Web Speech API" : "Not supported"}</div>
        <div>Theme: {dark ? "Dark" : "Light"}</div>
      </div>
    </div>
  );
}



