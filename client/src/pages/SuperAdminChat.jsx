import { useEffect, useState } from "react";
import api from "../lib/api.js";

const SuperAdminChat = () => {
  const [rooms, setRooms] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);

  const fetchChatRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await api.get("/super-admin/chat/rooms");
      setRooms(response.data.data || []);
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Unable to load chat rooms." });
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await api.get("/super-admin/users");
      setContacts(response.data.data || []);
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Unable to load contacts." });
    }
  };

  const fetchMessages = async (roomId) => {
    setLoadingMessages(true);
    try {
      const response = await api.get(`/super-admin/chat/rooms/${roomId}/messages`);
      setMessages(response.data.data || []);
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Unable to load messages." });
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom._id);
    }
  }, [selectedRoom]);

  const handleCreateChatRoom = async (participantId) => {
    setStatus(null);
    setCreatingRoom(true);
    try {
      const response = await api.post("/super-admin/chat/rooms", { participantId });
      const room = response.data.data;
      setRooms((prev) => [room, ...prev.filter((r) => r._id !== room._id)]);
      setSelectedRoom(room);
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Unable to create chat room." });
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!selectedRoom || !messageText.trim()) return;

    setStatus(null);
    try {
      await api.post(`/super-admin/chat/rooms/${selectedRoom._id}/messages`, {
        messageText,
      });
      setMessageText("");
      await fetchMessages(selectedRoom._id);
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Unable to send message." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Communication</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Chat System</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              One-to-one messaging is connected to backend chat rooms and message storage.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Contacts</p>
          <div className="mt-6 space-y-3">
            {contacts.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-slate-400">
                No contacts available.
              </div>
            ) : (
              contacts.slice(0, 6).map((contact) => (
                <button
                  key={contact._id}
                  type="button"
                  onClick={() => handleCreateChatRoom(contact._id)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-left text-slate-200 transition hover:border-cyan-400"
                >
                  <div className="text-sm font-semibold">{contact.firstName} {contact.lastName}</div>
                  <div className="text-xs text-slate-500">{contact.role}</div>
                </button>
              ))
            )}
          </div>

          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active rooms</p>
            <div className="mt-4 space-y-3">
              {loadingRooms ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-slate-400">Loading rooms…</div>
              ) : rooms.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-slate-400">No active chats yet.</div>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room._id}
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
                      selectedRoom?._id === room._id ? "border-cyan-500 bg-slate-900/90" : "border-slate-800 bg-slate-900/80"
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-100">
                      {room.participants.map((p) => p.firstName).join(", ")}
                    </div>
                    <div className="text-xs text-slate-500">{room.type}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{selectedRoom ? "Chat room" : "Select a chat"}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {selectedRoom ? "Send a message to this chat room." : "Create or select a room to begin messaging."}
              </p>
            </div>
          </div>

          <div className="mt-6 h-[420px] rounded-3xl border border-slate-800 bg-slate-900/90 p-6 overflow-y-auto text-slate-300">
            {selectedRoom ? (
              loadingMessages ? (
                <p className="text-slate-500">Loading messages…</p>
              ) : messages.length === 0 ? (
                <p className="text-slate-500">No messages yet. Send the first one.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message._id} className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {message.senderId.firstName} {message.senderId.lastName}
                      </div>
                      <div className="rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-200">
                        <p>{message.messageText}</p>
                        <div className="mt-2 text-[11px] text-slate-500">{new Date(message.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-slate-500">Choose a contact or room to view chat history.</p>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="mt-6 grid gap-4">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={selectedRoom ? "Type your message..." : "Select a room first."}
              disabled={!selectedRoom}
              className="min-h-[120px] w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {status && (
                <p className={`text-sm ${status.type === "success" ? "text-emerald-300" : "text-rose-400"}`}>{status.message}</p>
              )}
              <button
                type="submit"
                disabled={!selectedRoom || !messageText.trim()}
                className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send message
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SuperAdminChat;
