"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const items = [
  {
    question: "Does FlowBook take commission on bookings?",
    answer:
      "No. FlowBook is subscription-only. You keep 100% of your booking revenue.",
  },
  {
    question: "How do payouts work?",
    answer:
      "All customer payments are collected securely and paid out weekly every Friday.",
  },
  {
    question: "What happens after my subscription expires?",
    answer:
      "You receive a 7-day grace period. After that, booking pages are temporarily disabled until renewal.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel your subscription at any time from your dashboard.",
  },
];

export default function FaqAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="w-full space-y-4">
      {items.map((item, index) => (
        <Accordion.Item
          key={index}
          value={`item-${index}`}
          className="border border-border dark:border-darkBorder rounded-lg overflow-hidden bg-surface dark:bg-darkSurface"
        >
          <Accordion.Header>
            <Accordion.Trigger
              className={clsx(
                "group w-full flex items-center justify-between px-6 py-5 text-left text-base font-medium transition-colors",
                "hover:bg-muted dark:hover:bg-darkSurface/60",
              )}
            >
              {item.question}
              <ChevronDown
                size={18}
                className="transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content asChild>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-6 pt-4 pb-6 text-sm text-secondaryText leading-relaxed border-t border-border dark:border-darkBorder"
            >
              {item.answer}
            </motion.div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
