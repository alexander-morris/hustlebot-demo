import React, { useState, useEffect } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const hustleBotHistory = {
  currentHustles : [
    {
      name: "coin trading",
      description: "Trade coins automatically on Koii, using the trading bots",
      otherInfo: {
        platforms : ["Ebay"],
        latestBalance : 100,
        lastTrade : "2022-01-01"
      }
    }
  ]
};

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ]
  const generationConfig = {
    stopSequences: ["red"],
    maxOutputTokens: 200,
    temperature: 0.9,
    topP: 0.1,
    topK: 16,
  };
  const model = genAI.getGenerativeModel({ model: "gemini-pro" ,safetySettings , generationConfig});
  let chat = {};

  useEffect(() => {
    // No initial message here
    startUp()//first execution

  }, []);

  const startUp = async () => {
    chat = model.startChat();
    const result = await chat.sendMessage("You are hustlebot, a chatbot designed to help you with your hustle. Please respond offering some options you can help me with. These should include deciding what side hustle I want to start, exploring how I can manage my various environment connections on Koii, and similar items.", { hustleBotHistory });
    const response = await result.response;
    const text = response.text();
    const botMessage = { text: text, sender: 'bot' };
    setMessages(prevMessages => [...prevMessages, botMessage]);
  }

  const handleMessageSend = async () => {
    if (input.trim() !== '') {
      const newMessage = { text: input, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInput('');

      // Send user's message to the bot and get response
      try {
        const result = await chat.sendMessage(input);
        const response = await result.response;
        const text = response.text();
        const botMessage = { text: text, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Error sending message to bot:", error);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.sender === 'bot' ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleMessageSend();
            }
          }}
        />
        <button onClick={handleMessageSend}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
