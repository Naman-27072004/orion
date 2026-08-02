import React from 'react';
import { TimelineEvent } from '../types/orion';
import { Clock } from 'lucide-react';

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Event Timeline Stream
        </h2>
        <p className="text-xs text-gray-400">Chronological history of system boots, battery cycles, driver updates, and thermal milestones</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="relative border-l-2 border-blue-500/30 ml-4 space-y-6">
          {timeline.map((item) => (
            <div key={item.id} className="relative pl-6 space-y-1">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-200">{item.title}</span>
                <span className="text-gray-400 font-mono">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs text-gray-300">{item.description}</p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 uppercase tracking-wider">
                {item.event_type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
