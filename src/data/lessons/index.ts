import { intervallen } from "./intervallen";
import { akkoordenOpbouw } from "./akkoorden-opbouw";
import { nummersystemen } from "./nummersystemen";
import { iiVI } from "./ii-v-i";
import { modi } from "./modi";
import { kwintencirkel } from "./kwintencirkel";
import { substituten } from "./substituten";
import { vanPopNaarJazz } from "./van-pop-naar-jazz";
import type { Lesson } from "@/types";

export const lessons: Lesson[] = [
  intervallen,
  akkoordenOpbouw,
  nummersystemen,
  iiVI,
  modi,
  kwintencirkel,
  substituten,
  vanPopNaarJazz,
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}
