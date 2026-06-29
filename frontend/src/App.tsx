import React, { useState, useRef, useEffect } from "react";
import "./App.css";

export default function StoneAgeUploader() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImageLoading(true);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setProgress(0); // Reset slider on new image
    }
  };

  const handleDragStart = () => setIsDragging(true);

  useEffect(() => {
    const handleDragMove = (clientX: number) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;

      // Calculate percentage and clamp between 0 and 100
      let newProgress = (x / rect.width) * 100;
      newProgress = Math.max(0, Math.min(newProgress, 100));
      setProgress(newProgress);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      if (progress < 100) {
        setProgress(0);
      } else {
        console.log("Vision etched! Submitting...");
        // Optional: Reset after submission
        // setProgress(0);
      }
    };

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX);
    const onMouseUp = () => handleDragEnd();
    const onTouchEnd = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, progress]);

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-stone-200 to-stone-400 overflow-hidden font-sans">
      <header className="flex items-center w-full px-6 pt-12 pb-4">
        <h1 className="text-sm font-light tracking-[0.2em] text-black uppercase">
          Etch Your Vision
        </h1>
        <div className="flex-1 border-t border-black ml-4"></div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-square flex flex-col items-center justify-center -mt-32 z-20">
          <label
            htmlFor="camera-input"
            className="absolute inset-0 z-0 flex flex-col items-center justify-center cursor-pointer group"
          >
            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
            />

            {imagePreview ? (
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-stone-300"
                style={{
                  WebkitMaskImage: `url('/hide-outline.svg')`,
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskImage: `url('/hide-outline.svg')`,
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              >
                {isImageLoading && (
                  <div className="absolute z-30 animate-spin rounded-full h-16 w-16 border-4 border-stone-800 border-t-transparent"></div>
                )}

                <img
                  src={imagePreview}
                  alt="Captured Vision"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading ? "opacity-0" : "opacity-100"}`}
                  onLoad={() => setIsImageLoading(false)}
                />
              </div>
            ) : (
              <>
                <img
                  src="/hide-outline.svg"
                  alt="Dropzone Outline"
                  className="absolute inset-0 w-full h-full object-contain group-hover:opacity-60 transition-opacity pointer-events-none"
                />
                <img
                  src="/sun-graphic.png"
                  alt="Sun Art"
                  className="w-48 h-48 object-contain -mt-8 z-10 pointer-events-none"
                />
              </>
            )}
          </label>

          {/* Context Input Slab */}
          <div className="absolute bottom-0 left-0 w-full flex items-center justify-center translate-y-[60%] z-20">
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

        <div
          className={`relative w-full max-w-sm mt-32 px-6 transition-all duration-700 ease-in-out ${
            imagePreview
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          <div
            className={`absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 text-stone-600 transition-opacity duration-500 ${progress > 10 ? "opacity-0" : "opacity-100 animate-pulse"}`}
          >
            <span className="text-sm tracking-widest uppercase font-semibold">
              Slide to etch
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>

          <div ref={trackRef} className="relative w-full h-16 flex items-end">
            <img
              src="/trail.png"
              alt="Dirt Trail"
              className="absolute bottom-0 left-0 w-full h-auto object-contain pointer-events-none"
            />

            <img
              src="/trail.png"
              alt="Highlighted Dirt Trail"
              className="absolute bottom-0 left-0 w-full h-auto object-contain brightness-200 grayscale-[0.2] pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
            />

            <div
              className={`absolute bottom-0 flex justify-center items-end cursor-grab active:cursor-grabbing z-30 touch-none -translate-x-1/2 ${!isDragging && progress < 100 ? "transition-all duration-300 ease-out" : ""}`}
              style={{ left: `${progress}%` }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <img
                src="/stick.png"
                alt="Wooden Stick"
                className="w-20 max-w-none shrink-0 -mb-3 h-auto object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>
      </main>

      <nav className="flex flex-row items-center w-[85%] mx-auto h-36 border-t border-black bg-transparent pb-6 z-30">
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
