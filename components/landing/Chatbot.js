"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Lottie Robot Animation (inline JSON — no external dependency needed) ─────
// Using a simple CSS robot animation as fallback that looks great
function RobotLottie({ size = 56 }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <style>{`
        @keyframes robotBob    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes eyeBlink    { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.1)} }
        @keyframes antennaPulse{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes robotGlow   { 0%,100%{box-shadow:0 0 12px rgba(43,80,245,0.5)} 50%{box-shadow:0 0 24px rgba(124,58,237,0.8)} }
        .robot-body { animation: robotBob 2s ease-in-out infinite, robotGlow 3s ease-in-out infinite; }
        .robot-eye  { animation: eyeBlink 4s ease-in-out infinite; }
        .robot-ant  { animation: antennaPulse 1.5s ease-in-out infinite; }
      `}</style>
      <div
        className="robot-body"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Antenna */}
        <div
          style={{
            position: "absolute",
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <div
            className="robot-ant"
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#a78bfa",
            }}
          />
          <div
            style={{
              width: "2px",
              height: "7px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: "1px",
            }}
          />
        </div>
        {/* Face */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {/* Eyes */}
          <div style={{ display: "flex", gap: "7px" }}>
            <div
              className="robot-eye"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: "white",
                transformOrigin: "center",
              }}
            />
            <div
              className="robot-eye"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: "white",
                transformOrigin: "center",
                animationDelay: "0.3s",
              }}
            />
          </div>
          {/* Mouth */}
          <div
            style={{
              width: "16px",
              height: "4px",
              borderRadius: "0 0 4px 4px",
              background: "rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "rgba(43,80,245,0.8)",
              }}
            />
            <div
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "rgba(43,80,245,0.8)",
              }}
            />
            <div
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "rgba(43,80,245,0.8)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "10px 14px",
      }}
    >
      <style>{`
        @keyframes dotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
      `}</style>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#7c3aed",
            animation: `dotBounce 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message }) {
  const isBot = message.role === "assistant";
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "flex-end",
        flexDirection: isBot ? "row" : "row-reverse",
        animation: "msgIn 0.25s ease",
      }}
    >
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Avatar */}
      {isBot && (
        <div style={{ flexShrink: 0, marginBottom: "2px" }}>
          <RobotLottie size={28} />
        </div>
      )}
      {!isBot && (
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            flexShrink: 0,
            background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "700",
            color: "white",
            marginBottom: "2px",
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          borderRadius: isBot ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
          background: isBot
            ? "rgba(43,80,245,0.12)"
            : "linear-gradient(135deg,#1a3aeb,#7c3aed)",
          border: isBot ? "1px solid rgba(43,80,245,0.25)" : "none",
          color: "white",
          fontSize: "13px",
          lineHeight: "1.65",
          fontFamily: "DM Sans, sans-serif",
          fontWeight: "300",
          wordBreak: "break-word",
        }}
      >
        {message.content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </span>
        ))}
        <div
          style={{
            marginTop: "4px",
            fontSize: "10px",
            color: "rgba(255,255,255,0.4)",
            textAlign: isBot ? "left" : "right",
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Quick suggestions ────────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  { icon: "📋", label: "Fonctionnalités" },
  { icon: "💰", label: "Les tarifs" },
  { icon: "🚀", label: "Comment démarrer" },
  { icon: "📱", label: "Paiement Mobile" },
];

// ─── Main Chatbot Component ───────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Bonjour ! Je suis l'assistant SchoolFlow.\n\nJe peux répondre à toutes vos questions sur la plateforme — fonctionnalités, tarifs, inscription, paiements...\n\nComment puis-je vous aider ?",
          timestamp: Date.now(),
        },
      ]);
      setUnread(0);
      setShowPulse(false);
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Pulse after 5s to attract attention
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const content = (text || input).trim();
      if (!content || loading) return;
      setInput("");

      const userMsg = { role: "user", content, timestamp: Date.now() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Erreur");
        }

        const botMsg = {
          role: "assistant",
          content: json.data.content,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (!open) setUnread((n) => n + 1);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `❌ ${err.message}\n\nContactez-nous directement :\n💬 WhatsApp : +224 623 952 011`,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, messages, loading, open],
  );

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style>{`
        @keyframes chatIn  { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulseRing{ 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.8);opacity:0} }
        @keyframes btnFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .chat-btn-idle { animation: btnFloat 3s ease-in-out infinite; }
        .chat-btn-idle:hover { animation: none; transform: scale(1.08) !important; }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .suggestion-btn:hover { background: rgba(43,80,245,0.25) !important; border-color: rgba(43,80,245,0.5) !important; }
        .send-btn:hover { background: linear-gradient(135deg,#1530d0,#6d28d9) !important; transform: scale(1.05); }
        .close-btn:hover { background: rgba(239,68,68,0.15) !important; color: #ef4444 !important; }
      `}</style>

      {/* ── Chat Window ───────────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "96px",
            left: "24px",
            width: "380px",
            height: "560px",
            background: "#0f1623",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(43,80,245,0.2)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "chatIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background:
                "linear-gradient(135deg, rgba(26,58,235,0.3), rgba(124,58,237,0.2))",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <RobotLottie size={42} />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "white",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                Assistant SchoolFlow
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "2px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
                  En ligne · Répond instantanément
                </p>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={() => setOpen(false)}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                transition: "all 0.2s",
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            className="chat-messages"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && (
              <div
                style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}
              >
                <RobotLottie size={28} />
                <div
                  style={{
                    background: "rgba(43,80,245,0.1)",
                    border: "1px solid rgba(43,80,245,0.2)",
                    borderRadius: "4px 16px 16px 16px",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions — show only on first message */}
          {messages.length <= 1 && !loading && (
            <div
              style={{
                padding: "0 12px 12px",
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  className="suggestion-btn"
                  onClick={() => sendMessage(s.label)}
                  style={{
                    padding: "5px 10px",
                    background: "rgba(43,80,245,0.1)",
                    border: "1px solid rgba(43,80,245,0.2)",
                    borderRadius: "999px",
                    color: "#93c5fd",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "white",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: "300",
                outline: "none",
                resize: "none",
                maxHeight: "100px",
                lineHeight: "1.5",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2b50f5")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.09)")
              }
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: "40px",
                height: "40px",
                flexShrink: 0,
                background:
                  !input.trim() || loading
                    ? "rgba(43,80,245,0.3)"
                    : "linear-gradient(135deg,#1a3aeb,#7c3aed)",
                border: "none",
                borderRadius: "12px",
                cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>

          {/* Footer branding */}
          <div
            style={{
              padding: "6px",
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <p style={{ margin: 0, fontSize: "10px", color: "#334155" }}>
              Propulsé par{" "}
              <span style={{ color: "#475569", fontWeight: "600" }}>
                G-Tech Academy
              </span>{" "}
              · Gemini Flash 2.5
            </p>
          </div>
        </div>
      )}

      {/* ── Floating button ───────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 9999,
        }}
      >
        {/* Pulse ring */}
        {showPulse && !open && (
          <div
            style={{
              position: "absolute",
              inset: "-6px",
              borderRadius: "50%",
              border: "2px solid rgba(43,80,245,0.5)",
              animation: "pulseRing 2s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Unread badge */}
        {unread > 0 && !open && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "20px",
              height: "20px",
              background: "#ef4444",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "700",
              color: "white",
              border: "2px solid #0a0f1e",
              zIndex: 1,
            }}
          >
            {unread}
          </div>
        )}

        {/* Main button */}
        <button
          className={!open ? "chat-btn-idle" : ""}
          onClick={() => setOpen(!open)}
          style={{
            width: "62px",
            height: "62px",
            borderRadius: "50%",
            background: open
              ? "rgba(239,68,68,0.9)"
              : "linear-gradient(135deg,#1a3aeb,#7c3aed)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: open
              ? "0 8px 32px rgba(239,68,68,0.4)"
              : "0 8px 32px rgba(43,80,245,0.5)",
            transition: "background 0.3s, box-shadow 0.3s",
            padding: 0,
          }}
          aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
        >
          {open ? (
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <RobotLottie size={40} />
          )}
        </button>

        {/* Tooltip */}
        {!open && (
          <div
            style={{
              position: "absolute",
              left: "70px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#0f1623",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "6px 12px",
              whiteSpace: "nowrap",
              fontSize: "12px",
              fontWeight: "600",
              color: "white",
              fontFamily: "DM Sans, sans-serif",
              pointerEvents: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            className="chat-tooltip"
          >
            💬 Comment puis-je vous aider ?
          </div>
        )}
      </div>

      <style>{`
        .chat-btn-idle:hover + * .chat-tooltip,
        button:hover ~ .chat-tooltip { opacity: 1 !important; }
      `}</style>
    </>
  );
}
