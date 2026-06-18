import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Trash2,
  Plus,
  MessageSquare,
  ChevronLeft,
  Scale,
  Download,
  FileText,
  File,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import jsPDF from "jspdf";

const FREE_MSG_LIMIT = 3;
const API_BASE = "https://lawease-ai-bot-production.up.railway.app";
const generateId = () => Math.random().toString(36).slice(2, 10);
const GUEST_COUNT_KEY = "lawease_guest_count";

const WELCOME_MSG = {
  role: "assistant",
  content:
    "**Welcome to LawEase AI Research Assistant** ⚖️\n\nI can help you with:\n\n• Case law research\n• Relevant precedents\n• Legal arguments\n• Statutory provisions\n• Petition and notice drafting\n• Legal analysis\n\nDescribe your legal matter or enter a legal question to begin.",
};

const newChatObj = () => ({
  id: generateId(),
  title: "New Research Session",
  messages: [WELCOME_MSG],
  createdAt: Date.now(),
});

// ── FIX #1: Single initialChat — both states use same ID ──────────────────
const initialChat = newChatObj();

// ─────────────────────────────────────────────────────────────
// EXPORT HELPERS — parse simple markdown (##, **bold**, lists) into
// structured blocks, then render to .docx or .pdf
// ─────────────────────────────────────────────────────────────

// Parses markdown text into a flat list of typed line objects
const parseMarkdownBlocks = (markdown) => {
  const lines = markdown.split("\n");
  const blocks = [];

  for (let raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      blocks.push({ type: "space" });
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.replace(/^##\s*/, "") });
    } else if (line.startsWith("# ")) {
      blocks.push({ type: "title", text: line.replace(/^#\s*/, "") });
    } else if (/^[-*]\s+/.test(line)) {
      blocks.push({ type: "bullet", text: line.replace(/^[-*]\s+/, "") });
    } else if (/^\d+\.\s+/.test(line)) {
      blocks.push({ type: "numbered", text: line.replace(/^\d+\.\s+/, "") });
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }
  return blocks;
};

// Splits a line of text into { text, bold } runs based on **bold** markers
const splitBoldRuns = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return { text: part.slice(2, -2), bold: true };
    }
    return { text: part, bold: false };
  });
};

const buildFilename = (title, ext) => {
  const safe = (title || "LawEase-Research")
    .replace(/[^a-z0-9\- ]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${safe || "LawEase-Research"}.${ext}`;
};

// ── Export to Word (.docx) ─────────────────────────────────────────────
const exportToWord = async (content, chatTitle) => {
  const blocks = parseMarkdownBlocks(content);
  const children = [];

  // Document header
  children.push(
    new Paragraph({
      text: "LawEase AI — Legal Research Memo",
      heading: HeadingLevel.TITLE,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}`,
          italics: true,
          color: "666666",
          size: 20,
        }),
      ],
      spacing: { after: 300 },
    }),
  );

  for (const block of blocks) {
    if (block.type === "space") {
      children.push(new Paragraph({ text: "" }));
    } else if (block.type === "heading" || block.type === "title") {
      children.push(
        new Paragraph({
          text: block.text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
        }),
      );
    } else if (block.type === "bullet" || block.type === "numbered") {
      const runs = splitBoldRuns(block.text).map(
        (r) => new TextRun({ text: r.text, bold: r.bold }),
      );
      children.push(
        new Paragraph({
          children: runs,
          bullet: { level: 0 },
          spacing: { after: 80 },
        }),
      );
    } else {
      const runs = splitBoldRuns(block.text).map(
        (r) => new TextRun({ text: r.text, bold: r.bold }),
      );
      children.push(new Paragraph({ children: runs, spacing: { after: 120 } }));
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = buildFilename(chatTitle, "docx");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// ── Export to PDF ───────────────────────────────────────────────────────
const exportToPDF = (content, chatTitle) => {
  const blocks = parseMarkdownBlocks(content);
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (lineHeight) => {
    if (y + lineHeight > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("LawEase AI — Legal Research Memo", margin, y);
  y += 22;

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    margin,
    y,
  );
  pdf.setTextColor(0);
  y += 24;

  const writeRuns = (runs, x, fontSize, bulletPrefix = "") => {
    pdf.setFontSize(fontSize);
    let cursorX = x;
    if (bulletPrefix) {
      pdf.setFont("helvetica", "normal");
      pdf.text(bulletPrefix, x, y);
      cursorX = x + 14;
    }
    for (const run of runs) {
      pdf.setFont("helvetica", run.bold ? "bold" : "normal");
      const words = run.text.split(" ");
      for (const word of words) {
        const wordWidth = pdf.getTextWidth(word + " ");
        if (cursorX + wordWidth > margin + maxWidth) {
          y += fontSize + 6;
          ensureSpace(fontSize + 6);
          cursorX = bulletPrefix ? x + 14 : x;
        }
        pdf.text(word + " ", cursorX, y);
        cursorX += wordWidth;
      }
    }
    y += fontSize + 8;
  };

  for (const block of blocks) {
    if (block.type === "space") {
      y += 8;
      continue;
    }
    ensureSpace(20);
    if (block.type === "heading" || block.type === "title") {
      y += 8;
      ensureSpace(20);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(block.text, margin, y);
      y += 18;
    } else if (block.type === "bullet") {
      const runs = splitBoldRuns(block.text);
      writeRuns(runs, margin, 10.5, "•");
    } else if (block.type === "numbered") {
      const runs = splitBoldRuns(block.text);
      writeRuns(runs, margin, 10.5, "-");
    } else {
      const runs = splitBoldRuns(block.text);
      writeRuns(runs, margin, 10.5);
    }
  }

  pdf.save(buildFilename(chatTitle, "pdf"));
};

// ── Export dropdown button shown under each assistant message ─────────
const ExportMenu = ({ content, chatTitle }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative inline-block mt-2" ref={menuRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-[#C5A059] border border-slate-700/60 hover:border-[#C5A059]/50 rounded-lg px-2.5 py-1.5 transition-all bg-slate-900/40"
      >
        <Download size={12} />
        <span>Export</span>
        <ChevronDown size={11} className={open ? "rotate-180" : ""} />
      </button>

      {open && (
        <div className="absolute z-30 bottom-full mb-1 left-0 bg-[#1E293B] border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[150px]">
          <button
            onClick={() => {
              exportToWord(content, chatTitle);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <FileText size={14} className="text-blue-400" />
            Export as Word
          </button>
          <button
            onClick={() => {
              exportToPDF(content, chatTitle);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-800"
          >
            <File size={14} className="text-red-400" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

const ChatBot = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([initialChat]);
  const [activeChatId, setActiveChatId] = useState(initialChat.id); // ← same ID
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // ── FIX #5: Guest count persisted in localStorage ─────────────────────
  const [userMsgCount, setUserMsgCount] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem(GUEST_COUNT_KEY) || "0", 10);
    }
    return 0;
  });

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── FIX #2: Safe activeChat — never undefined ──────────────────────────
  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0];

  const updateChat = useCallback((id, updater) => {
    setChats((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }, []);

  // ── Load / reset on auth change ────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setUserMsgCount(0);
      localStorage.removeItem(GUEST_COUNT_KEY);
      loadChatHistory();
    } else {
      // User logged out — reset to a fresh single chat
      const fresh = newChatObj();
      setChats([fresh]);
      setActiveChatId(fresh.id);
      setHistoryLoaded(false);
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChatId]);

  // ── API helpers ────────────────────────────────────────────────────────
  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // ── FIX #3: loadChatHistory properly replaces initial chat ─────────────
  const loadChatHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/chat-history/load`, {
        headers: getAuthHeader(),
      });

      const savedChats = res.data.chats;
      if (savedChats && savedChats.length > 0) {
        const withWelcome = savedChats.map((c) => ({
          ...c,
          messages:
            c.messages[0]?.role === "assistant" &&
            c.messages[0]?.content === WELCOME_MSG.content
              ? c.messages
              : [WELCOME_MSG, ...c.messages],
        }));
        setChats(withWelcome);
        setActiveChatId(withWelcome[0].id);
      }
    } catch (err) {
      console.error("Chat history load failed:", err);
    } finally {
      setHistoryLoading(false);
      setHistoryLoaded(true);
    }
  };

  const saveChatHistory = async (allChats) => {
    if (!user) return;
    try {
      const toSave = allChats.map((c) => ({
        ...c,
        messages: c.messages.filter(
          (m) => !(m.role === "assistant" && m.content === WELCOME_MSG.content),
        ),
      }));
      await axios.post(
        `${API_BASE}/api/chat-history/save`,
        { chats: toSave },
        { headers: getAuthHeader() },
      );
    } catch (err) {
      console.error("Chat save failed:", err);
    }
  };

  const limitReached = !user && userMsgCount >= FREE_MSG_LIMIT;

  const createNewChat = () => {
    const chat = newChatObj();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
    setInput("");
  };

  const deleteThisChat = async (chatId, e) => {
    e?.stopPropagation();
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== chatId);
      if (remaining.length === 0) {
        const fresh = newChatObj();
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (activeChatId === chatId) setActiveChatId(remaining[0].id);
      return remaining;
    });

    if (user) {
      try {
        await axios.delete(`${API_BASE}/api/chat-history/delete`, {
          headers: getAuthHeader(),
        });
      } catch {}
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || limitReached) return;
    const text = input.trim();
    const currentChatId = activeChatId; // capture before any async

    // ── FIX #5: Persist guest count ────────────────────────────────────
    if (!user) {
      const next = userMsgCount + 1;
      setUserMsgCount(next);
      localStorage.setItem(GUEST_COUNT_KEY, String(next));
    }

    const userMsg = { role: "user", content: text };
    const isFirst = activeChat.messages.length === 1;
    const updatedMessages = [...activeChat.messages, userMsg];

    updateChat(currentChatId, (c) => ({
      ...c,
      title: isFirst ? text.slice(0, 38) : c.title,
      messages: updatedMessages,
    }));

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);

    // Only send user/assistant turns — exclude welcome assistant msg
    const history = updatedMessages
      .filter(
        (m) => !(m.role === "assistant" && m.content === WELCOME_MSG.content),
      )
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await axios.post(`${API_BASE}/api/chatbot`, {
        message: text,
        history,
      });

      const assistantMsg = { role: "assistant", content: res.data.reply };
      const finalMessages = [...updatedMessages, assistantMsg];

      const newTitle = isFirst ? text.slice(0, 38) : activeChat.title;

      updateChat(currentChatId, (c) => ({
        ...c,
        messages: finalMessages,
        title: newTitle,
      }));

      // Build the full updated chats array for saving
      const updatedChats = chats.map((c) =>
        c.id === currentChatId
          ? { ...c, messages: finalMessages, title: newTitle }
          : c,
      );
      await saveChatHistory(updatedChats);
    } catch {
      updateChat(currentChatId, (c) => ({
        ...c,
        messages: [
          ...updatedMessages,
          {
            role: "assistant",
            content:
              "**Error:** System temporarily unavailable. Please try again later.",
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen h-[calc(100vh-64px)] pt-19 bg-[#0B0F19] overflow-hidden text-slate-200 antialiased unified-panel-wrapper">
      {/* SIDEBAR */}
      <aside
        className={`bg-[#1E293B] border-r border-slate-800/80 text-slate-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.3)] ${
          sidebarOpen ? "w-64 min-w-64" : "w-0 min-w-0"
        }`}
      >
        <div className="p-4 border-b border-slate-800/60 shrink-0">
          <button
            className="w-full py-3 px-4 rounded-xl border border-slate-700/60 bg-slate-800/80 text-slate-200 hover:bg-[#7A0913] hover:border-transparent font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md tracking-wide"
            onClick={createNewChat}
          >
            <Plus size={16} /> New Research Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 chunk-scrollbar custom-sidebar-list">
          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                className={`group px-3 py-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                  isActive
                    ? "bg-[#7A0913] text-white font-medium shadow-[0_4px_12px_rgba(122,9,19,0.3)] border border-red-800/30"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <MessageSquare
                  size={16}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-slate-400"
                  }
                />
                <span className="flex-1 text-sm truncate tracking-wide">
                  {chat.title}
                </span>
                <button
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all shrink-0 ${
                    isActive
                      ? "text-red-200 hover:text-white"
                      : "text-slate-500 hover:text-red-400"
                  }`}
                  onClick={(e) => deleteThisChat(chat.id, e)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0F172A] h-full relative shadow-inner">
        {/* HEADER */}
        <div className="bg-[#1E293B] border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all shrink-0"
              onClick={() => setSidebarOpen((p) => !p)}
              title="Toggle sidebar"
            >
              {sidebarOpen ? (
                <ChevronLeft size={16} />
              ) : (
                <MessageSquare size={16} />
              )}
            </button>
            <Scale size={18} className="text-[#C5A059] shrink-0" />
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide truncate">
              {activeChat?.title || "LawEase AI Research Assistant"}
            </h2>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto pt-8 pb-8 space-y-6 chunk-scrollbar bg-radial from-[#1e293b]/20 via-transparent to-transparent">
          {/* History loading spinner */}
          {historyLoading && (
            <div className="flex justify-center pt-12">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {user && historyLoaded && activeChat?.messages.length > 1 && (
            <div className="text-center text-[11px] uppercase tracking-widest text-slate-600 font-semibold my-2">
              — Previous conversation loaded —
            </div>
          )}

          {activeChat?.messages.length === 1 && !loading && !historyLoading && (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center px-4 pt-4">
              <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-[#1E293B] to-[#111827] border border-slate-700/50 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(122,9,19,0.15)] mb-6 text-[#C5A059]">
                <Scale size={36} />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-3 tracking-wide">
                Case Law & Legal Research
              </h3>
              <p className="text-sm text-slate-400/80 leading-relaxed max-w-sm">
                Research Pakistani case law, locate precedents, analyze
                statutes, prepare legal arguments, and assist with drafting
                legal documents.
              </p>
            </div>
          )}

          {activeChat?.messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isWelcome = !isUser && msg.content === WELCOME_MSG.content;
            return (
              <div
                key={i}
                className={`flex flex-col w-full px-4 md:px-12 lg:px-24 xl:px-32 ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[78%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.25)] border ${
                    isUser
                      ? "bg-gradient-to-r from-[#1E40AF] to-[#1D4ED8] text-white font-medium rounded-tr-sm border-blue-600/40"
                      : "bg-[#1E293B] text-slate-100 border-l-4 border-l-[#7A0913] border-slate-800 rounded-tl-sm"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="mb-2 last:mb-0" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong
                          className={
                            isUser
                              ? "text-white font-bold"
                              : "text-[#C5A059] font-bold"
                          }
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc pl-5 my-2 space-y-1.5"
                          {...props}
                        />
                      ),
                      code: ({ node, ...props }) => (
                        <code
                          className="bg-slate-900 text-red-400 px-1.5 py-0.5 rounded text-xs border border-slate-800"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Export button — only on substantive assistant replies */}
                {!isUser && !isWelcome && (
                  <ExportMenu
                    content={msg.content}
                    chatTitle={activeChat?.title}
                  />
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 px-4 md:px-12 lg:px-24 xl:px-32 text-sm text-slate-500 tracking-wide">
              <span className="italic">LawEase is thinking</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A0913] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A0913] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A0913] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="bg-[#1E293B] border-t border-slate-800/80 p-4 md:px-12 lg:px-24 xl:px-32 flex flex-col gap-2 shrink-0 w-full shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
          {limitReached && (
            <p className="text-center text-xs text-red-400 font-medium mb-1">
              Free limit reached — please sign up to continue.
            </p>
          )}
          <div className="flex gap-3 items-end max-w-5xl mx-auto w-full">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              disabled={limitReached}
              placeholder={
                limitReached
                  ? "Sign up to continue chatting..."
                  : "Describe your case, legal issue, or research question..."
              }
              className="flex-1 bg-[#0F172A] border border-slate-700/80 focus:border-blue-500/80 text-slate-200 placeholder-slate-600 text-sm rounded-xl px-4 py-3.5 outline-none resize-none max-h-32 transition-all focus:ring-2 focus:ring-blue-900/30 leading-relaxed shadow-inner"
              onChange={(e) => {
                if (!limitReached) {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 128) + "px";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || limitReached || !input.trim()}
              className="w-12 h-11 bg-[#7A0913] text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-[#92141D] transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(122,9,19,0.2)]"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center font-medium tracking-wide mt-1">
            LawEase AI Research Assistant · AI-powered legal research and case
            law support. Verify authorities before professional use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
