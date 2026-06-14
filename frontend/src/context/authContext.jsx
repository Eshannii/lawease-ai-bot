import React, { useState, createContext, useContext, useEffect } from "react";
import axios from "axios";
const userContext = createContext();
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");

        // 👉 IMPORTANT: No token? No need to call API
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "https://lawease-ai-bot-production.up.railway.app/api/auth/verify",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.log("Verification failed:", error.message);
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        // 👉 JISKA PROBLEM THA — yeh always true hona chahiye
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = (user) => {
    setUser(user);
    setLoading(false);
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };
  return (
    <userContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </userContext.Provider>
  );
}
export const useAuth = () => useContext(userContext);
export default AuthProvider;
