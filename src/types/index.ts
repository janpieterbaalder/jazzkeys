import type { ChordType, VoicingType } from "@/lib/piano-utils";

export interface ChordVoicingData {
  root: string;
  chordType: ChordType;
  voicingType: VoicingType;
  notes: string[];
  labels: string[];
}

export interface Lesson {
  slug: string;
  title: string;
  description: string;
  order: number;
  sections: LessonSection[];
}

export interface LessonSection {
  heading: string;
  content: string;
  pianoExamples?: PianoExample[];
  tip?: string;
}

export interface PianoExample {
  label: string;
  notes: { note: string; color: string; label?: string }[];
  caption: string;
}

export interface PracticePhase {
  phase: number;
  title: string;
  period: string;
  focus: string;
  weeks: PracticeWeek[];
}

export interface PracticeWeek {
  week: number;
  dailyTasks: PracticeTask[];
}

export interface PracticeTask {
  title: string;
  duration: string;
  description: string;
}
