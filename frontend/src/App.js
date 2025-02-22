
import react, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([])
  const sendMessage = async () => {
    if (!message.trim()) return;
    const newChat = [...chat, { sender: "you", text: message }];
    setChat(newChat);
    try {
      const response = await axios.post("https://chat-bot-6t4s.onrender.com/chat", { message })
      setChat([...newChat, { sender: "bot", text: response.data.reply }]);
      setMessage("")
    } catch (err) {
      console.error("error:", err)
      setChat([...newChat, { sender: "bot", text: "error: unable to get response" }])
    }
  }
  return (
 <div className="app">
     <div className="chat-container">
       < div className="nav">
           <div className="logo">BOT</div>
       </div>
      <div className="chat-box">
        {chat.map((c,index)=>(
          <p key={index} className={c.sender === "you" ? "user-message" : "bot-message"}>
            <strong>{c.sender}:</strong>{c.text}

          </p>
        ))}
      </div>
      <div className="send-container">
        <input
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          value={message} />
        <button onClick={sendMessage}>send</button>
      </div>
    </div>
 </div>
  );
}

export default App;
