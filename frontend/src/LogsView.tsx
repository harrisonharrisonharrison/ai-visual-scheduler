import { useState, useEffect } from "react";

type LogEvent = {
  id: string;
  title: string;
  summary: string;
  link: string;
};

const API_BASE_URL = "https://8zm8rfep3k.execute-api.us-west-2.amazonaws.com/Prod";

const LogEntry = ({ log }: { log: LogEvent }) => (
  <div className="relative w-full aspect-[1.8/1] mb-8 flex items-center justify-center group hover:scale-[1.02] transition-transform">
    <img
      src="/log-slab.png"
      alt="Stone Log Slab"
      className="absolute inset-0 w-full h-full object-fill drop-shadow-xl pointer-events-none"
    />

    <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 md:p-8 text-stone-700 font-sans">
      <div>
        <h3 className="text-xl font-bold tracking-widest uppercase mb-2 line-clamp-1">
          {log.title}
        </h3>
        <p className="text-sm font-medium tracking-wide uppercase leading-snug opacity-80 line-clamp-3">
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
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/logs`);
        if (!res.ok) throw new Error("Failed to load logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

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
          
          {loading ? (
            <div className="text-center text-stone-600 tracking-widest uppercase mt-12 animate-pulse">
              Consulting the Elders...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-stone-600 tracking-widest uppercase mt-12">
              No visions etched yet.
            </div>
          ) : (
            logs.map((log) => <LogEntry key={log.id} log={log} />)
          )}

          {!loading && (
            <div className="w-full flex justify-center mt-6 mb-8 opacity-60">
              <span className="text-xs font-light tracking-[0.2em] text-black uppercase text-center">
                - end of recent etchings -
              </span>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}