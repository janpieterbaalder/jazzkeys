import { notFound } from "next/navigation";
import Link from "next/link";
import { lessons, getLessonBySlug } from "@/data/lessons";
import LessonContent from "@/components/lessen/LessonContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const currentIndex = lessons.findIndex((l) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div>
      <Link
        href="/lessen"
        className="text-sm text-slate-500 hover:text-blue-400 transition-colors mb-6 inline-block"
      >
        &larr; Lessen
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
          {lesson.order}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          {lesson.title}
        </h1>
      </div>
      <p className="text-slate-400 mb-10 ml-11">{lesson.description}</p>

      <LessonContent lesson={lesson} />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-800">
        {prevLesson ? (
          <Link
            href={`/lessen/${prevLesson.slug}`}
            className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
          >
            &larr; {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/lessen/${nextLesson.slug}`}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {nextLesson.title} &rarr;
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
