import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { X } from "lucide-react";
import { Button } from "../components/ui/button";

// ✅ Connect to Socket.IO server
const socket = io("http://localhost:5000", {
  transports: ["websocket"], // Force WebSockets
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 2000000, // Reduce timeout
});

function ChatBox({ onClose, currentUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // ✅ Handle Socket Connection
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket server:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Register User on Socket
  useEffect(() => {
    if (currentUser?._id) {
      console.log("🔹 Registering user on socket:", currentUser._id);
      socket.emit("registerUser", currentUser._id);
    }
  }, [currentUser]);

  // ✅ Fetch Users from API
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Users received:", data);
        setUsers(data);
      })
      .catch((error) => console.error("❌ Error fetching users:", error));
  }, []);

  // ✅ Fetch Chat Messages when `selectedUser` changes
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    fetch(`http://localhost:5000/api/chats/${currentUser._id}/${selectedUser._id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Messages received:", data);
        setMessages(data);
      })
      .catch((error) => console.error("❌ Error fetching chat messages:", error));
  }, [selectedUser, currentUser]);

  // ✅ Handle Incoming Messages
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log("📩 New message received:", data);

      if (
        (data.senderId === currentUser?._id && data.receiverId === selectedUser?._id) ||
        (data.senderId === selectedUser?._id && data.receiverId === currentUser?._id)
      ) {
        setMessages((prev) => [...prev, data]);
      } else {
        console.warn("⚠️ Message does not belong to the current chat:", data);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser, currentUser]);

  // ✅ Send Message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser?._id || !currentUser?._id) {
      console.error("❌ Error: Missing sender or receiver details!");
      return;
    }

    const newMessage = { senderId: currentUser._id, receiverId: selectedUser._id, message };

    console.log("🚀 Sending message:", newMessage);
    socket.emit("sendMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]); // Optimistic update
    setMessage(""); // Clear input
  };

  return (
    <div className="flex h-full p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
      {/* ✅ User List */}
      <div className="w-1/3 border-r p-2">
        <h2 className="text-lg font-bold">Users</h2>
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`p-2 cursor-pointer ${selectedUser?._id === user._id ? "bg-gray-300" : ""}`}
          >
            {user.userName}
          </div>
        ))}
      </div>

      {/* ✅ Chat Window */}
      <div className="w-2/3 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Chat</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* ✅ Chat Messages */}
        <div className="flex-1 overflow-y-auto border p-2 rounded-lg">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-1 rounded-lg max-w-xs ${
                msg.senderId === currentUser._id ? "bg-blue-200 self-end ml-auto" : "bg-gray-200"
              }`}
            >
              {msg.message}
            </div>
          ))}
        </div>

        {/* ✅ Message Input */}
        <div className="flex items-center mt-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-lg"
          />
          <Button onClick={sendMessage} className="rounded-r-lg">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
