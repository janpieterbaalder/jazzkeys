import Link from "next/link";

const features = [
  {
    href: "/akkoorden",
    title: "Akkoorden",
    description: "Shell voicings, rootless voicings en meer — met piano-diagrammen",
    icon: "♫",
  },
  {
    href: "/lessen",
    title: "Lessen",
    description: "Muziektheorie, intervallen, modi en de ii-V-I progressie",
    icon: "📖",
  },
  {
    href: "/oefenschema",
    title: "Oefenschema",
    description: "Gestructureerde oefenplannen van beginner tot gevorderd",
    icon: "📋",
  },
  {
    href: "/analyse",
    title: "Analyse",
    description: "Upload bladmuziek en leer stap voor stap noten lezen",
    icon: "🎵",
  },
];

export default function Home() {
  return (
    <div className="py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          JazzKeys
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Leer jazz piano spelen — van akkoorden en theorie tot improvisatie en
          notenlezen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group block p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-900 transition-all"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
              {feature.title}
            </h2>
            <p className="text-sm text-slate-400">{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
