import React from "react";

type LogEvent = {
  id: string;
  title: string;
  summary: string;
  link: string;
};

// Dummy data for testing the UI
const mockLogs: LogEvent[] = [
  {
    id: "1",
    title: "SABERTOOTH HUNT",
    summary: "ALMOST GOT EATEN. NEED BIGGER STICK. FWEH!",
    link: "https://calendar.google.com",
  },
  {
    id: "2",
    title: "FIRE DISCOVERY",
    summary: "RUBBED TWO ROCKS TOGETHER. IT IS WARM. SLATT.",
    link: "https://calendar.google.com",
  },
];

const LogEntry = ({ log }: { log: LogEvent }) => (
  <div className="relative w-full aspect-[1.8/1] mb-8 flex items-center justify-center group hover:scale-[1.02] transition-transform">
    <img
      src="/log-slab.png"
      alt="Stone Log Slab"
      className="absolute inset-0 w-full h-full object-fill drop-shadow-xl pointer-events-none"
    />

    <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 md:p-8 text-stone-700 font-sans">
      <div>
        <h3 className="text-xl font-bold tracking-widest uppercase mb-2">
          {log.title}
        </h3>
        <p className="text-sm font-medium tracking-wide uppercase leading-snug opacity-80">
          {log.summary}
        </p>
      </div>

      <a
        href={log.link}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-bold tracking-[0.2em] uppercase underline underline-offset-4 self-start mt-2 hover:opacity-70 transition-opacity"
      >
        VIEW MEMORY
      </a>
    </div>
  </div>
);

export default function LogsView() {
  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden">
      <header className="flex items-center w-full px-6 pt-12 pb-4 shrink-0">
        <h1 className="text-sm font-light tracking-[0.2em] text-black uppercase">
          Recent Etchings
        </h1>
        <div className="flex-1 border-t border-black ml-4"></div>
      </header>

      <div className="flex-1 w-full overflow-y-auto px-6 pb-32 pt-4 flex flex-col items-center hide-scrollbar">
        <div className="w-full max-w-md">
          {mockLogs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
          
          {/* End of Etchings Marker */}
          <div className="w-full flex justify-center mt-6 mb-8 opacity-60">
            <span className="text-xs font-light tracking-[0.2em] text-black uppercase text-center">
              - end of recent etchings -
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}