import React, { useState } from "react";
import HomeView from "./HomeView";
import LogsView from "./LogsView";
import "./App.css";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "logs">("home");

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-stone-200 to-stone-400 overflow-hidden font-sans relative">
      {currentView === "home" ? <HomeView /> : <LogsView />}

      <nav className="absolute bottom-0 left-0 right-0 flex flex-row items-center w-[85%] mx-auto h-32 border-t border-black backdrop-blur-md bg-stone-400/20 pb-6 z-50">
        {" "}
        <button
          onClick={() => setCurrentView("home")}
          className={`flex-1 flex flex-col items-center justify-center gap-3 h-full transition-opacity ${currentView === "home" ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
        >
          <img
            src="/nav-home-icon.png"
            alt="Home Icon"
            className="w-12 h-12 object-contain"
          />
          <span className="text-lg font-medium tracking-widest uppercase text-black">
            Home
          </span>
        </button>
        <div className="w-[1px] h-2/5 bg-black"></div>
        <button
          onClick={() => setCurrentView("logs")}
          className={`flex-1 flex flex-col items-center justify-center gap-3 h-full transition-opacity ${currentView === "logs" ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
        >
          <img
            src="/nav-logs-icon.png"
            alt="Logs Icon"
            className="w-12 h-12 object-contain"
          />
          <span className="text-lg font-medium tracking-widest uppercase text-black">
            Logs
          </span>
        </button>
      </nav>
    </div>
  );
}
