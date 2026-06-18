import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Trash2,
  Plus,
  MessageSquare,
  ChevronLeft,
  PanelLeft,
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
    "**Welcome to LawEase AI Research Assistant**\n\nI can help you with:\n\n• Case law research\n• Relevant precedents\n• Legal arguments\n• Statutory provisions\n• Petition and notice drafting\n• Legal analysis\n\nDescribe your legal matter or enter a legal question to begin.",
};

const newChatObj = () => ({
  id: generateId(),
  title: "New Research Session",
  messages: [WELCOME_MSG],
  createdAt: Date.now(),
});

const initialChat = newChatObj();

// ─────────────────────────────────────────────────────────────
// EXPORT HELPERS — parse simple markdown into structured blocks
// ─────────────────────────────────────────────────────────────
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

const exportToWord = async (content, chatTitle) => {
  const blocks = parseMarkdownBlocks(content);
  const children = [];

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
    <div className="relative inline-block mt-2.5" ref={menuRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B6914] hover:text-[#7A0913] border border-[#C5A059]/35 hover:border-[#7A0913]/30 rounded-md px-2.5 py-1.5 transition-colors duration-150 bg-[#FBF9F4]"
      >
        <Download size={11} strokeWidth={2.25} />
        <span className="tracking-wide">Export Brief</span>
        <ChevronDown
          size={11}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 bottom-full mb-1.5 left-0 bg-white border border-slate-200 rounded-lg shadow-[0_12px_28px_rgba(15,27,61,0.12)] overflow-hidden min-w-[168px]">
          <button
            onClick={() => {
              exportToWord(content, chatTitle);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <FileText size={14} className="text-blue-700" />
            Export as Word
          </button>
          <button
            onClick={() => {
              exportToPDF(content, chatTitle);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
          >
            <File size={14} className="text-[#7A0913]" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

const ChatBot = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768; // open by default on desktop, closed on mobile
    }
    return true;
  });
  const [chats, setChats] = useState([initialChat]);
  const [activeChatId, setActiveChatId] = useState(initialChat.id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [userMsgCount, setUserMsgCount] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem(GUEST_COUNT_KEY) || "0", 10);
    }
    return 0;
  });

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0];

  const updateChat = useCallback((id, updater) => {
    setChats((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }, []);

  useEffect(() => {
    if (user) {
      setUserMsgCount(0);
      localStorage.removeItem(GUEST_COUNT_KEY);
      loadChatHistory();
    } else {
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

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

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
    const currentChatId = activeChatId;

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
    <div className="flex w-full min-h-screen h-[calc(100vh-64px)] pt-16 bg-[#F8FAFC] overflow-hidden text-slate-700 font-sans antialiased relative">
      {/* Ambient backdrop washes — quiet, not decorative noise */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/25 to-indigo-50/35 rounded-full blur-[130px] opacity-70" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#7A0913]/[0.04] to-amber-50/25 rounded-full blur-[110px] opacity-50" />
      </div>

      {/* SIDEBAR BACKDROP — mobile only, closes drawer on tap outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR — overlay drawer on mobile, inline column on desktop */}
      <aside
        className={`bg-white border-r border-slate-200/70 flex flex-col overflow-hidden shadow-[6px_0_28px_rgba(15,27,61,0.02)]
          fixed md:static inset-y-0 left-0 z-30 h-full
          transition-transform md:transition-[width] duration-300 ease-in-out
          w-72 md:w-64 md:min-w-64
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${sidebarOpen ? "md:w-64" : "md:w-0 md:min-w-0"}
        `}
      >
        <div className="p-4 border-b border-slate-100 shrink-0 flex items-center gap-2">
          <button
            className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-[#7A0913] hover:text-white hover:border-transparent font-semibold text-[11px] uppercase tracking-[0.08em] flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
            onClick={() => {
              createNewChat();
              setSidebarOpen(false);
            }}
          >
            <Plus size={14} strokeWidth={2.5} /> New Research Session
          </button>
          <button
            className="md:hidden p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                className={`group px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-2.5 transition-colors duration-150 ${
                  isActive
                    ? "bg-[#7A0913] text-white font-semibold shadow-[0_4px_14px_rgba(122,9,19,0.18)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setSidebarOpen(false);
                }}
              >
                <MessageSquare
                  size={14}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                />
                <span className="flex-1 text-xs truncate tracking-wide">
                  {chat.title}
                </span>
                <button
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-colors shrink-0 ${
                    isActive
                      ? "text-red-200 hover:text-white"
                      : "text-slate-400 hover:text-red-600"
                  }`}
                  onClick={(e) => deleteThisChat(chat.id, e)}
                  title="Delete session"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN CHAT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent h-full relative z-10">
        {/* HEADER */}
        <div className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-3.5 md:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-[0_1px_0_rgba(15,27,61,0.02)]">
          <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
            <button
              className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
              onClick={() => setSidebarOpen((p) => !p)}
              title="Toggle sidebar"
            >
              {sidebarOpen ? (
                <ChevronLeft size={15} />
              ) : (
                <PanelLeft size={15} />
              )}
            </button>
            <Scale
              size={16}
              className="text-[#C5A059] shrink-0 hidden sm:block"
            />
            <h2 className="text-[13px] font-bold text-slate-800 tracking-wide truncate font-serif">
              {activeChat?.title || "LawEase AI Research Assistant"}
            </h2>
          </div>
          <button
            className="md:hidden p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#7A0913] hover:bg-slate-100 transition-colors shrink-0"
            onClick={() => {
              createNewChat();
            }}
            title="New research session"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* MESSAGE FEED */}
        <div className="flex-1 overflow-y-auto pt-6 pb-6 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {historyLoading && (
            <div className="flex justify-center pt-8">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7A0913]/40 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#7A0913]/40 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#7A0913]/40 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {user && historyLoaded && activeChat?.messages.length > 1 && (
            <div className="text-center text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold my-2">
              Previous Conversation Loaded
            </div>
          )}

          {activeChat?.messages.length === 1 && !loading && !historyLoading && (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center px-4 pt-12">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-md mb-5 text-[#C5A059] relative">
                <Scale size={30} strokeWidth={1.75} />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#7A0913] border-2 border-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight font-serif">
                Case Law &amp; Legal Research
              </h3>
              <p className="text-[13px] text-slate-400 font-light leading-relaxed">
                Search verified Pakistani case law, locate precedents, and draft
                research memos ready for export.
              </p>
            </div>
          )}

          {activeChat?.messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isWelcome = !isUser && msg.content === WELCOME_MSG.content;
            return (
              <div
                key={i}
                className={`flex flex-col w-full px-3 sm:px-4 md:px-12 lg:px-20 xl:px-32 ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] px-4.5 py-3.5 rounded-2xl text-[13.5px] leading-relaxed shadow-[0_2px_10px_rgba(15,27,61,0.03)] border ${
                    isUser
                      ? "bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white font-medium rounded-tr-sm border-blue-700/20"
                      : "bg-white text-slate-800 border-l-[3px] border-l-[#C5A059] border-slate-200/70 rounded-tl-sm"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      h2: ({ node, ...props }) => (
                        <h2
                          className={`font-serif text-[15px] font-bold mt-3 mb-1.5 first:mt-0 ${
                            isUser ? "text-white" : "text-[#0F1B3D]"
                          }`}
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-1.5 last:mb-0" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong
                          className={
                            isUser
                              ? "text-white font-bold"
                              : "text-[#7A0913] font-bold"
                          }
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc pl-5 my-1.5 space-y-1"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal pl-5 my-1.5 space-y-1"
                          {...props}
                        />
                      ),
                      code: ({ node, ...props }) => (
                        <code
                          className="bg-slate-50 text-[#7A0913] px-1.5 py-0.5 rounded text-xs border border-slate-200 font-mono"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

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
            <div className="flex items-center gap-2 px-4 md:px-12 lg:px-20 xl:px-32 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="italic font-light text-slate-400 normal-case font-serif text-[13px]">
                Assembling analysis
              </span>
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
        <div className="bg-white border-t border-slate-200 px-3 py-3 sm:p-4 md:px-12 lg:px-20 xl:px-32 flex flex-col shrink-0 w-full shadow-[0_-6px_24px_rgba(15,27,61,0.02)]">
          {limitReached && (
            <p className="text-center text-xs text-[#7A0913] font-bold mb-2 uppercase tracking-wide">
              Free trial exhausted — please register to continue
            </p>
          )}
          <div className="flex gap-2.5 sm:gap-3 items-end max-w-4xl mx-auto w-full">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              disabled={limitReached}
              placeholder={
                limitReached
                  ? "Register to continue..."
                  : "Describe your legal question..."
              }
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-400 text-slate-800 placeholder-slate-400 text-sm rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 outline-none resize-none max-h-28 sm:max-h-32 transition-colors focus:bg-white focus:ring-4 focus:ring-blue-500/5 leading-relaxed shadow-inner"
              onChange={(e) => {
                if (!limitReached) {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 112) + "px";
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
              className="w-11 h-[42px] sm:w-12 sm:h-[46px] bg-[#7A0913] text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-[#94121E] active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-md"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 text-center font-medium tracking-wide mt-2 sm:mt-2.5 px-2">
            LawEase AI · Verify all citations before professional use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
