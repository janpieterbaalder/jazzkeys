"use client";

import type { Lesson } from "@/types";
import PianoKeyboard from "@/components/piano/PianoKeyboard";
import CircleOfFifths from "@/components/lessen/CircleOfFifths";

interface LessonContentProps {
  lesson: Lesson;
}

export default function LessonContent({ lesson }: LessonContentProps) {
  return (
    <div className="space-y-10">
      {lesson.useCircleOfFifths && (
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-sm">
            <CircleOfFifths />
          </div>
        </div>
      )}

      {lesson.sections.map((section, i) => (
        <section key={i}>
          <h2 className="text-xl font-semibold text-white mb-3">
            {section.heading}
          </h2>

          <div className="text-slate-300 leading-relaxed whitespace-pre-line">
            {section.content}
          </div>

          {section.tip && (
            <div className="mt-4 p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
              <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
                Jazz Tip
              </div>
              <div className="text-sm text-slate-300">{section.tip}</div>
            </div>
          )}

          {section.pianoExamples && section.pianoExamples.length > 0 && (
            <div className="mt-4 space-y-4">
              {section.pianoExamples.map((example, j) => (
                <div
                  key={j}
                  className="p-4 rounded-lg border border-slate-800 bg-slate-900/50"
                >
                  <div className="text-sm font-medium text-white mb-2">
                    {example.label}
                  </div>
                  <PianoKeyboard
                    startOctave={3}
                    octaves={2}
                    highlightedNotes={example.notes}
                    size="sm"
                  />
                  <div className="text-xs text-slate-500 mt-2">
                    {example.caption}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
