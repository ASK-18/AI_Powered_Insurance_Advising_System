import { useState } from "react";
import ChatWindow from "./ChatWindow";
import "../Chatbot.css";

function FloatingChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div className="chatbot-float-container">
      {/* Chat window */}
      {open && (
        <div className="chatbot-popover">
          <ChatWindow setIsOpen={setOpen} />
        </div>
      )}

      {/* Floating button */}
      <button
        className="chatbot-float-btn"
        onClick={() => setOpen(!open)}
        aria-label="Open chat"
      >
        💬
      </button>
    </div>
  );
}

export default FloatingChatbot;
