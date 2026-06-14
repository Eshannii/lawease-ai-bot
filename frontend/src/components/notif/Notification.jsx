import React, { useEffect, useState } from "react";
import { useNotifications } from "../../components/notif/NotificationContext";
import axios from "axios";

// ── Golden color tokens ──────────────────────────────
const G = {
  50: "#FAEEDA",
  100: "#FAC775",
  200: "#EF9F27",
  400: "#BA7517",
  600: "#854F0B",
  800: "#633806",
  900: "#412402",
};

// ── Helpers ──────────────────────────────────────────
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

const TAG_STYLES = {
  client: { background: "#E1F5EE", color: "#085041" },
  general: { background: G[50], color: G[800] },
  case: { background: "#FAECE7", color: "#712B13" },
};

const AVATAR_STYLES = [
  { background: G[50], color: G[800] },
  { background: "#E1F5EE", color: "#085041" },
  { background: "#FAECE7", color: "#712B13" },
  { background: "#FBEAF0", color: "#72243E" },
];

function getAvatar(name = "") {
  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const style = AVATAR_STYLES[name.charCodeAt(0) % AVATAR_STYLES.length];
  return { initials: initials || "?", style };
}

// ── Bell Icon ─────────────────────────────────────────
function BellIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CloseIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// ── Notification Item ─────────────────────────────────
function NotifItem({ n }) {
  const { initials, style: avStyle } = getAvatar(
    typeof n.message === "string"
      ? n.message.replace(/^(New client registered:|Welcome)/i, "").trim()
      : "",
  );
  const tagStyle = TAG_STYLES[n.type] || TAG_STYLES.general;

  return (
    <li
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 10,
        border: n.isRead ? "0.5px solid #e5e7eb" : `0.5px solid ${G[100]}`,
        borderLeft: n.isRead ? undefined : `2.5px solid ${G[200]}`,
        background: n.isRead ? "#fff" : G[50] + "44",
        cursor: "default",
        transition: "background 0.15s",
        listStyle: "none",
      }}
    >
      {/* Dot */}
      <div style={{ paddingTop: 4, flexShrink: 0 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: n.isRead ? "#d1d5db" : G[200],
          }}
        />
      </div>

      {/* Avatar */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
          ...avStyle,
        }}
      >
        {initials}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            color: "#111827",
            lineHeight: 1.5,
            margin: "0 0 4px",
          }}
        >
          {n.message}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {timeAgo(n.createdAt)}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              padding: "2px 7px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              ...tagStyle,
            }}
          >
            {n.type}
          </span>
        </div>
      </div>
    </li>
  );
}

// ── Main Component ────────────────────────────────────
const Notification = ({ isOpen, onClose }) => {
  const { notifications, setNotifications, markAllRead } = useNotifications();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isOpen) markAllRead();
  }, [isOpen]);

  const clearNotifications = async () => {
    try {
      await axios.delete("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.18)",
          zIndex: 998,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
          animation: "slideIn 0.25s ease",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `0.5px solid ${G[50]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: G[50],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BellIcon color={G[400]} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#111827",
                  fontFamily: "Georgia, serif",
                }}
              >
                Notifications
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                Activity &amp; alerts
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {unreadCount > 0 && (
              <span
                style={{
                  background: G[400],
                  color: G[50],
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "2px 10px",
                  borderRadius: 20,
                }}
              >
                {unreadCount} new
              </span>
            )}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "0.5px solid #e5e7eb",
                borderRadius: 8,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div
          style={{
            padding: "10px 24px",
            borderBottom: "0.5px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "unread", "read"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: filter === tab ? G[50] : "transparent",
                  color: filter === tab ? G[800] : "#6b7280",
                  textTransform: "capitalize",
                  transition: "all 0.15s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={markAllRead}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: G[600],
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              Mark all read
            </button>
            <button
              onClick={clearNotifications}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#ef4444",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              Clear all
            </button>
          </div>
        </div>

        {/* ── List ── */}
        <ul
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            margin: 0,
          }}
        >
          {filtered.length === 0 ? (
            <li
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 40,
                listStyle: "none",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BellIcon size={22} color="#d1d5db" />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                All caught up
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                No notifications here
              </p>
            </li>
          ) : (
            filtered.map((n) => <NotifItem key={n._id} n={n} />)
          )}
        </ul>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: `0.5px solid ${G[50]}`,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
            Showing last 100 notifications
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Notification;
