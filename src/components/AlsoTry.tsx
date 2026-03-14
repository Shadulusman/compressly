import Link from "next/link";
import { ALL_TOOLS, getRelatedTools } from "@/lib/tools-config";
import * as Icons from "lucide-react";
import clsx from "clsx";

interface AlsoTryProps {
  currentSlug: string;
}

export default function AlsoTry({ currentSlug }: AlsoTryProps) {
  const tools = getRelatedTools(currentSlug, 4);
  return (
    <div className="mt-16 pt-10 border-t border-border">
      <h2 className="text-xl font-bold mb-6 text-center">You May Also Need</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const Icon = (Icons as any)[tool.icon] || Icons.File;
          return (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/50 transition-all duration-200 text-center group"
            >
              <div className={clsx("p-2.5 rounded-xl", tool.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
