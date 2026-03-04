import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  MessageSquare,
  Clock,
  CheckCheck,
  Hash,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";

export default function StudentMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch Inboxes on Mount
  useEffect(() => {
    const fetchInboxes = async () => {
      try {
        const res = await api.get("/messages/listconversations");
        const convs = Array.isArray(res.data) ? res.data : [];
        setConversations(convs);

        // Auto-select if passed in state
        const targetId = location.state?.conversation_id;
        if (targetId && convs.length > 0) {
          const target = convs.find(c => (c.conversation_id || c.ConversationID) === targetId);
          if (target) setActiveConv(target);
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || "Failed to load inboxes";
        setError(errMsg);
      }
    };
    fetchInboxes();
  }, [location.state]);

  // WebSocket Connection & History Fetching
  useEffect(() => {
    if (!activeConv) return;
    let isMounted = true;

    const connectToChat = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(
          `/messages/${activeConv.conversation_id || activeConv.ConversationID}/messages`,
        );
        if (isMounted) setMessages(Array.isArray(res.data) ? res.data : []);

        const baseURL = api.defaults.baseURL || "https://levelup-hub-backend.onrender.com/api";
        const wsBase = baseURL.replace(/^http/, "ws");
        const wsUrl = `${wsBase}/messages/ws/${activeConv.conversation_id || activeConv.ConversationID}`;

        if (socketRef.current) socketRef.current.close();

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const incoming = JSON.parse(event.data);
            if (incoming.content || incoming.Content) {
              setMessages((prev) => [...prev, incoming]);
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        };

        ws.onclose = (e) => {
          if (e.code === 1006 && isMounted)
            setError("Session expired. Please refresh.");
        };

        ws.onerror = (err) => console.error("WS Error:", err);
      } catch (err) {
        if (isMounted) {
          const errMsg =
            err.response?.data?.message || "Unable to sync messages";
          setError(errMsg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    connectToChat();
    return () => {
      isMounted = false;
      if (socketRef.current) socketRef.current.close();
    };
  }, [activeConv]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;
    const payload = { content: newMessage };

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      const optimisticMsg = {
        content: newMessage,
        sender_id: user?.id || user?.ID || 1,
        CreatedAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      setNewMessage("");
    } else {
      toast.error("Connecting to server...");
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.other_user_name || c.OtherUserName)?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[32px] md:rounded-[48px] border border-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.04)] h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent -z-10" />

      {/* Sidebar: Inboxes */}
      <aside className="w-20 sm:w-80 md:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 sm:p-8 pb-4">
          <div className="hidden sm:flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#262626] tracking-tight">Messages</h2>
              <p className="text-[10px] font-black text-[#FF9500] uppercase tracking-[0.2em] mt-1">Intelligent Hub</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#FF9500]">
              <MessageSquare size={20} />
            </div>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] sm:text-xs font-bold outline-none focus:border-[#FF9500] focus:ring-4 focus:ring-[#FF9500]/5 transition-all shadow-sm placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 custom-scrollbar">
          {filteredConversations.map((conv) => {
            const currentCId = conv.conversation_id || conv.ConversationID;
            const isActive = (activeConv?.conversation_id || activeConv?.ConversationID) === currentCId;
            const otherName = conv.other_user_name || conv.OtherUserName;
            const otherPic = conv.other_profile_pic || conv.OtherProfilePic;
            const lastMsg = conv.last_message || conv.LastMessage;
            const lastTime = conv.last_time || conv.LastTime;

            return (
              <button
                key={currentCId}
                onClick={() => setActiveConv(conv)}
                className={`w-full text-left group flex items-center gap-4 p-3 sm:p-4 rounded-[20px] sm:rounded-[28px] transition-all relative ${isActive
                  ? "bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100"
                  : "hover:bg-white/80"
                  }`}
              >
                {/* Profile Pic Logic */}
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[22px] overflow-hidden ${!otherPic ? (isActive ? "bg-[#FF9500]" : "bg-gray-200") : ""
                    }`}>
                    {otherPic ? (
                      <img
                        src={otherPic}
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                        alt={otherName}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-sm sm:text-lg text-white">
                        {otherName?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                <div className="hidden sm:block flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-black text-sm truncate tracking-tight ${isActive ? "text-[#FF9500]" : "text-[#262626]"}`}>
                      {otherName}
                    </span>
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">
                      {lastTime ? new Date(lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 truncate leading-tight opacity-80">
                    {lastMsg || "Start learning today"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Chat View */}
      <main className="flex-1 flex flex-col bg-white/40">
        {activeConv ? (
          <>
            <header className="px-6 sm:px-10 py-4 sm:py-6 border-b border-white/50 flex justify-between items-center bg-white/60 backdrop-blur-2xl z-20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#262626] rounded-[18px] sm:rounded-[22px] flex items-center justify-center overflow-hidden shadow-lg shadow-black/5 ring-1 ring-white/20">
                  {(activeConv.other_profile_pic || activeConv.OtherProfilePic) ? (
                    <img src={activeConv.other_profile_pic || activeConv.OtherProfilePic} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-[#FF9500] font-black text-lg sm:text-xl">{(activeConv.other_user_name || activeConv.OtherUserName)?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-[#262626] text-base sm:text-xl tracking-tight leading-none mb-1.5">{(activeConv.other_user_name || activeConv.OtherUserName)}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                    <span className="text-[9px] font-black text-[#FF9500] uppercase tracking-[0.15em]">Live Specialist</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="hidden sm:flex w-12 h-12 bg-white rounded-2xl items-center justify-center text-gray-400 hover:text-[#FF9500] hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all border border-gray-100">
                  <Clock size={20} />
                </button>
                <button className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#FF9500] transition-all border border-gray-100">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </header>

            <div className="flex-1 p-4 sm:p-10 overflow-y-auto space-y-6 sm:space-y-10 custom-scrollbar relative">
              <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/double-bubble-outline.png')] opacity-[0.03] pointer-events-none" />

              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-5">
                  <div className="relative">
                    <div className="w-12 h-12 border-[3px] border-[#FF9500]/10 border-t-[#FF9500] rounded-full animate-spin" />
                    <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF9500] animate-pulse" size={16} />
                  </div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] animate-pulse">Syncing Protocols</p>
                </div>
              ) : (
                <div className="relative z-10 space-y-8">
                  <div className="flex justify-center mb-10">
                    <div className="bg-[#262626] text-white px-6 py-2.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-black/10 flex items-center gap-3 ring-1 ring-white/10">
                      <div className="w-1 h-1 bg-green-500 rounded-full" /> Initial Communication link Established
                    </div>
                  </div>

                  {messages.map((msg, i) => {
                    const currentUId = user?.id || user?.ID;
                    const isMe = msg.isMe || msg.sender_id === currentUId || msg.SenderID === currentUId;
                    return (
                      <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                        <div className={`max-w-[85%] sm:max-w-[65%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-2`}>
                          <div className={`px-5 py-3.5 sm:px-7 sm:py-5 rounded-[24px] sm:rounded-[32px] text-xs sm:text-[15px] font-bold shadow-sm leading-relaxed tracking-tight ${isMe
                            ? "bg-gradient-to-br from-[#FF9500] to-[#FF7A00] text-white rounded-tr-none shadow-xl shadow-[#FF9500]/20"
                            : "bg-white text-[#262626] border border-gray-100 rounded-tl-none shadow-xl shadow-gray-100/30"
                            }`}>
                            {msg.content || msg.Content}
                          </div>
                          <div className={`flex items-center gap-2 px-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">
                              {new Date(msg.CreatedAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCheck size={12} className="text-[#FF9500]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <footer className="p-4 sm:p-8 bg-white/60 backdrop-blur-2xl border-t border-white/50">
              <div className="max-w-5xl mx-auto flex items-center gap-3 sm:gap-5">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={`Write a message...`}
                    className="w-full pl-6 sm:pl-8 pr-16 py-4 sm:py-6 bg-white border border-gray-100 rounded-[24px] sm:rounded-[32px] outline-none text-xs sm:text-sm font-bold focus:border-[#FF9500] focus:ring-8 focus:ring-[#FF9500]/5 transition-all shadow-xl shadow-gray-200/20 placeholder:text-gray-300"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4 text-gray-300">
                    <button className="hover:text-[#FF9500] transition-colors"><AlertCircle size={20} /></button>
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 sm:w-20 sm:h-20 bg-[#262626] text-[#FF9500] rounded-[24px] sm:rounded-[32px] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-[#FF9500] hover:text-white hover:scale-105 active:scale-95 transition-all duration-500 disabled:opacity-20 disabled:hover:scale-100 disabled:hover:bg-[#262626] disabled:hover:text-[#FF9500]"
                >
                  <Send size={screen.width < 640 ? 20 : 28} />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 sm:p-20 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF9500]/5 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-[32px] sm:rounded-[48px] flex items-center justify-center mb-8 shadow-2xl shadow-gray-200 ring-1 ring-gray-50 group transition-all duration-700 hover:rotate-6">
              <MessageSquare size={48} className="text-[#FF9500] group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#262626] mb-4 tracking-tight">Your Digital Workspace</h3>
            <p className="text-gray-400 font-bold text-xs sm:text-sm max-w-sm leading-relaxed opacity-80">
              Select an ongoing specialization from the left to synchronize with your mentor and accelerate progress.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
