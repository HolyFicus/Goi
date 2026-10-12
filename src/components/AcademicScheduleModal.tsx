import React from 'react';
import { SEMESTER_WEEKS, AcademicWeekInfo } from '../utils/academicCalendar';
import { pipAudio } from '../utils/audio';
import { Calendar, X, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface AcademicScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: AcademicWeekInfo | null;
  timeStr: string;
  dateStr: string;
}

export const AcademicScheduleModal: React.FC<AcademicScheduleModalProps> = ({
  isOpen,
  onClose,
  currentWeek,
  timeStr,
  dateStr
}) => {
  if (!isOpen) return null;

  const oddWeeks = SEMESTER_WEEKS.filter((w) => w.type === 'upper');
  const evenWeeks = SEMESTER_WEEKS.filter((w) => w.type === 'lower');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-3xl bg-[#071309] border-2 border-[var(--crt-phosphor)] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] overflow-hidden font-mono text-[var(--crt-phosphor)]">
        {/* Header */}
        <div className="bg-[#0f1f12] border-b border-[var(--crt-phosphor-dim)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar size={18} className="text-[var(--crt-phosphor-bright)]" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-[var(--crt-phosphor-bright)]">
                ГРАФИК УЧЕБНЫХ НЕДЕЛЬ (ОСЕННИЙ СЕМЕСТР 2026)
              </h3>
              <p className="text-[11px] opacity-75">
                Система чередования верхних (нечетных) и нижних (четных) недель
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              pipAudio.playClick();
              onClose();
            }}
            className="p-1.5 hover:bg-[var(--crt-phosphor)]/20 border border-[var(--crt-phosphor-dim)] rounded text-[var(--crt-phosphor)] cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current status banner */}
        <div className="bg-[#0a180c] border-b border-[#1c2e1f] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-400" />
            <span>ТЕКУЩЕЕ ВРЕМЯ (МСК): <strong className="text-[var(--crt-phosphor-bright)]">{timeStr}</strong></span>
            <span className="opacity-60">|</span>
            <span>{dateStr}</span>
          </div>

          {currentWeek && (
            <div className="flex items-center gap-2 bg-[#122415] px-2.5 py-1 rounded border border-[var(--crt-phosphor)]/40 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[var(--crt-phosphor)] animate-pulse" />
              <span>
                СЕЙЧАС ИДЕТ: <strong>{currentWeek.num}-Я НЕДЕЛЯ ({currentWeek.typeName.toUpperCase()})</strong>
              </span>
            </div>
          )}
        </div>

        {/* Two column table: Upper weeks vs Lower weeks */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upper Weeks Column */}
            <div className="border border-[var(--crt-phosphor-dim)]/60 rounded-lg p-3 bg-[#050e06]/70">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--crt-phosphor-dim)]/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <ArrowUpRight size={14} />
                  <span>ВЕРХНИЕ НЕДЕЛИ (НЕЧЕТНЫЕ)</span>
                </div>
                <span className="text-[10px] opacity-60">9 НЕДЕЛЬ</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {oddWeeks.map((week) => {
                  const isCurrent = currentWeek?.num === week.num;
                  return (
                    <div
                      key={week.num}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-all ${
                        isCurrent
                          ? 'bg-[var(--crt-phosphor)] text-black font-extrabold shadow-[0_0_12px_var(--crt-phosphor)]'
                          : 'bg-[#0a160b] hover:bg-[#102213] border border-[#1b2f1e]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 text-center font-bold ${isCurrent ? 'text-black' : 'text-emerald-400'}`}>
                          {week.num}
                        </span>
                        <span className="text-[11px]">{week.label}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] bg-black text-[var(--crt-phosphor)] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          ТЕКУЩАЯ
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lower Weeks Column */}
            <div className="border border-[var(--crt-phosphor-dim)]/60 rounded-lg p-3 bg-[#050e06]/70">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--crt-phosphor-dim)]/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <ArrowDownRight size={14} />
                  <span>НИЖНИЕ НЕДЕЛИ (ЧЕТНЫЕ)</span>
                </div>
                <span className="text-[10px] opacity-60">9 НЕДЕЛЬ</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {evenWeeks.map((week) => {
                  const isCurrent = currentWeek?.num === week.num;
                  return (
                    <div
                      key={week.num}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-all ${
                        isCurrent
                          ? 'bg-[var(--crt-phosphor)] text-black font-extrabold shadow-[0_0_12px_var(--crt-phosphor)]'
                          : 'bg-[#0a160b] hover:bg-[#102213] border border-[#1b2f1e]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 text-center font-bold ${isCurrent ? 'text-black' : 'text-amber-400'}`}>
                          {week.num}
                        </span>
                        <span className="text-[11px]">{week.label}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] bg-black text-[var(--crt-phosphor)] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          ТЕКУЩАЯ
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#09150b] border border-[#1a2d1d] rounded text-[11px] opacity-75 text-center">
            Чередование недель используется для разделения пар в расписании семинаров, лекций и лабораторных работ.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0f1f12] border-t border-[var(--crt-phosphor-dim)] px-4 py-2.5 flex justify-end">
          <button
            onClick={() => {
              pipAudio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-[var(--crt-phosphor)] text-black font-bold text-xs rounded hover:brightness-110 cursor-pointer"
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
