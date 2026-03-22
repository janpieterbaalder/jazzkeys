import Link from "next/link";
import { VOICING_CATEGORIES } from "@/data/chords/voicing-data";

export default function AkkoordenPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Akkoorden
      </h1>
      <p className="text-slate-400 mb-10">
        Jazz piano voicings — van shell voicings tot rootless voicings. Klik op
        een categorie om alle akkoorden met piano-diagrammen te bekijken.
      </p>

      <div className="grid gap-6">
        {VOICING_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/akkoorden/${cat.slug}`}
            className="group block p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-900 transition-all"
          >
            <h2 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
              {cat.title}
            </h2>
            <p className="text-sm text-slate-400 mb-3">{cat.description}</p>
            <p className="text-xs text-slate-500">
              {cat.chordTypes.length} akkoordtypen &middot; 12 toonsoorten
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
