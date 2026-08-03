"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { uz, fmtUZS } from "@/lib/i18n/uz";

export type SpendBook = {
  id: string;
  title: string;
  brand: "falaq_nashr" | "falaq_kids";
  spendUZS: number;
  burnPct: number | null;
};

function burnBadge(p: number | null): string {
  if (p == null) return "bg-muted";
  if (p > 100) return "bg-rose-500/10";
  if (p >= 80) return "bg-orange-400/10";
  return "bg-teal-400/10";
}
const initials = (t: string) =>
  t.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const SalesByCountryWidget = ({ books }: { books: SpendBook[] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <Card className="h-full py-6 gap-6">
      <CardHeader className="flex items-center justify-between px-6">
        <CardTitle className="text-lg font-medium text-foreground">
          {uz.byBook.title}
        </CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <Icon
                  icon="solar:menu-dots-bold"
                  width={22}
                  height={22}
                  className="rotate-90"
                />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="font-normal cursor-pointer"
                render={<Link href="/dashboard/byudjetlar" />}
              >
                {uz.byBook.viewBudgets}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <motion.div
          ref={ref}
          className="flex flex-col gap-3"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          }}
        >
          {books.map((item, index) => (
            <React.Fragment key={item.id}>
              <motion.div
                className="flex gap-3 items-center px-6"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex justify-center items-center text-xs font-semibold",
                    item.brand === "falaq_kids"
                      ? "bg-violet-500/15 text-violet-600"
                      : "bg-blue-500/15 text-blue-600",
                  )}
                >
                  {initials(item.title)}
                </div>
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <h5 className="text-base font-medium text-foreground">
                      {fmtUZS(item.spendUZS)}
                    </h5>
                    <p className="text-sm font-normal tracking-wide text-muted-foreground">
                      {item.title}
                    </p>
                  </div>
                  <Badge
                    className={cn(burnBadge(item.burnPct), "text-muted-foreground")}
                  >
                    {item.burnPct == null ? "—" : `${Math.round(item.burnPct)}%`}
                  </Badge>
                </div>
              </motion.div>
              {index < books.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default SalesByCountryWidget;
