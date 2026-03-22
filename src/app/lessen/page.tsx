import Link from "next/link";
import { lessons } from "@/data/lessons";

export default function LessenPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Lessen
      </h1>
      <p className="text-slate-400 mb-10">
        Muziektheorie voor jazz piano — van intervallen tot reharmonisatie. Volg
        de lessen in volgorde voor het beste resultaat.
      </p>

      <div className="grid gap-4">
        {lessons.map((lesson, i) => (
          <Link
            key={lesson.slug}
            href={`/lessen/${lesson.slug}`}
            className="group flex items-start gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-900 transition-all"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
              {i + 1}
            </div>
            <div>
              <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                {lesson.title}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {lesson.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
