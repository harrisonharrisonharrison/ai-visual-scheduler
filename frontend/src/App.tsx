import React from 'react';
import './App.css';

export default function StoneAgeUploader() {
  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-stone-200 to-stone-400 overflow-hidden font-sans">
      
      <header className="flex items-center w-full px-6 pt-12 pb-4">
        <h1 className="text-sm font-light tracking-[0.2em] text-black uppercase">
          Etch Your Vision
        </h1>
        <div className="flex-1 border-t border-black ml-4"></div>
      </header>

      <main className="flex-1 relative flex items-center justify-center px-4">  
        <div className="relative w-full max-w-sm aspect-square flex flex-col items-center justify-center -mt-20">
          
          <img 
            src="/hide-outline.svg" 
            alt="Dropzone Outline" 
            className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-4xl" 
          />

          <div className="relative z-10 flex flex-col items-center justify-center -mt-8">
            <img 
              src="/sun-graphic.png" 
              alt="Sun Art" 
              className="w-48 h-48 object-contain" 
            />
          </div>

          <div className="absolute bottom-0 left-0 w-full flex items-center justify-center translate-y-1/2 z-20">
            <div className="relative w-[140%] max-w-md flex items-center justify-center">
              <img 
                src="/flint.png" 
                alt="Flint Arrowhead" 
                className="absolute bottom-12 -right-4 w-32 z-10 object-contain drop-shadow-lg" 
              />
              <img 
                src="/stone-slab.png" 
                alt="Stone Slab Input Background" 
                className="w-full h-auto object-contain drop-shadow-2xl pointer-events-none" 
              />
              <input
                type="text"
                placeholder="Add any context?"
                className="absolute w-3/4 h-1/2 pb-12 bg-transparent text-center text-stone-950 font-serif text-xl placeholder:text-gray-600 focus:outline-none z-20"
              />
            </div>
          </div>

        </div>
      </main>

      <nav className="flex flex-row items-center w-[85%] mx-auto h-36 border-t border-black bg-transparent pb-6">
        
        <button className="flex-1 flex flex-col items-center justify-center gap-3 h-full hover:opacity-70 transition-opacity">
          <img 
            src="/nav-home-icon.png" 
            alt="Home Icon" 
            className="w-14 h-14 object-contain" 
          />
          <span className="text-xl font-medium tracking-widest uppercase text-black">
            Home
          </span>
        </button>

        <div className="w-[1px] h-3/5 bg-black"></div>

        <button className="flex-1 flex flex-col items-center justify-center gap-3 h-full hover:opacity-70 transition-opacity">
          <img 
            src="/nav-logs-icon.png" 
            alt="Logs Icon" 
            className="w-14 h-14 object-contain" 
          />
          <span className="text-xl font-medium tracking-widest uppercase text-black">
            Logs
          </span>
        </button>

      </nav>
      
    </div>
  );
}