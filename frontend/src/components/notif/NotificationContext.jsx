import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../../context/authContext";

const NotificationContext = createContext();

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const NotificationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  const userId = user?._id || user?.id; // ✅ dono handle

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
      );
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error("Fetch notif error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch("http://localhost:5000/api/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (!userId) {
      // ✅ _id ya id dono check
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      return;
    }

    console.log("🚀 User mila, socket connect kar raha hoon:", userId);

    const socket = io("http://localhost:5000", { autoConnect: false });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("register", { userId, role: user.role }); // ✅
    });

    socket.connect();
    fetchNotifications();

    socket.on("newNotification", (notification) => {
      const myId = userId?.toString(); // ✅
      const notifUserId = notification.userId?.toString();
      const isForMe =
        (notifUserId && notifUserId === myId) ||
        (!notifUserId && notification.role === user.role);

      if (isForMe) {
        setNotifications((prev) => {
          const exists = prev.some((n) => n._id === notification._id);
          if (exists) return prev;
          return [notification, ...prev];
        });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("newNotification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, loading]); // ✅

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, setNotifications, markAllRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
