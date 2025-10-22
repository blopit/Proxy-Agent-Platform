import { Lightbulb, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InspirationItem {
  id: number;
  title: string;
  description: string;
  category: string;
}

interface InspirationSectionProps {
  items: InspirationItem[];
}

export default function InspirationSection({ items }: InspirationSectionProps) {
  return (
    <div className="mb-6" data-oid="eg-g.6e">
      <div className="flex items-center mb-2" data-oid="qi_d6od">
        <Lightbulb
          className="h-4 w-4 text-amber-500 dark:text-amber-400 mr-1"
          data-oid="lr1nj6h"
        />

        <h3
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          data-oid="jmyz-8r"
        >
          For You
        </h3>
      </div>

      <div className="space-y-2" data-oid="dmqnq93">
        {items.map((item) => (
          <div
            key={item.id}
            className="transition-transform duration-200 ease-out hover:scale-[1.01] h-full"
            data-oid="w75w4:9"
          >
            <Card
              className={cn(
                "backdrop-blur-[8px] bg-white/85 dark:bg-slate-900/85 border-amber-200 dark:border-amber-800/50",
                "hover:bg-white/90 dark:hover:bg-slate-900/90 cursor-pointer",
                "transition-all duration-300",
                "shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]",
                "h-full"
              )}
              data-oid="qi4cclc"
            >
              <div className="p-3 h-full flex flex-col" data-oid="7.j2uw.">
                <div
                  className="flex justify-between items-start mb-1"
                  data-oid="8509-u1"
                >
                  <div
                    className="text-sm font-medium text-slate-800 dark:text-slate-200"
                    data-oid="_o063lc"
                  >
                    {item.title}
                  </div>
                  <Badge
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs"
                    data-oid="o7s:4i."
                  >
                    {item.category}
                  </Badge>
                </div>

                <div
                  className="text-xs text-slate-600 dark:text-slate-400 mb-2"
                  data-oid="9qrogty"
                >
                  {item.description}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:hover:text-amber-300 mt-auto"
                  data-oid=".mdllpq"
                >
                  <span className="mr-1" data-oid="1w207pn">
                    Explore
                  </span>
                  <ArrowRight className="h-3 w-3" data-oid="y_pao7v" />
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
