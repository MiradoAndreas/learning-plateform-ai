"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FAQItemData = {
  question: string;
  answer: string;
};

export type FAQCategories = Record<string, string>;
export type FAQData = Record<string, FAQItemData[]>;

export type FAQProps = {
  title?: string;
  subtitle?: string;
  categories: FAQCategories;
  faqData: FAQData;
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

export const FAQ = ({
  title = "FAQs",
  subtitle = "Frequently Asked Questions",
  categories,
  faqData,
  className,
  ...props
}: FAQProps) => {
  const categoryKeys = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(categoryKeys[0]);

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-background px-4 py-12 text-foreground",
        className,
      )}
      {...props}
    >
      <FAQHeader title={title} subtitle={subtitle} />
      <FAQTabs
        categories={categories}
        selected={selectedCategory}
        setSelected={setSelectedCategory}
      />
      <FAQList faqData={faqData} selected={selectedCategory} />
    </section>
  );
};

type FAQHeaderProps = {
  title: string;
  subtitle: string;
};

const FAQHeader = ({ title, subtitle }: FAQHeaderProps) => (
  <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
    {/* <span className="mb-8 bg-clip-text font-medium text-transparent">
      {subtitle}
    </span>
    <h2 className="mb-8 text-center text-3xl font-bold sm:text-5xl">{title}</h2> */}

    <p className="text-sm font-medium text-primary">Question fréquent</p>
    <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
    <p className="mt-3 text-sm text-muted-foreground sm:text-base">
      {subtitle}
    </p>
  </div>
);

type FAQTabsProps = {
  categories: FAQCategories;
  selected: string;
  setSelected: (key: string) => void;
};

const FAQTabs = ({ categories, selected, setSelected }: FAQTabsProps) => (
  <div className="relative z-10 my-10 flex flex-wrap items-center justify-center gap-4 md:my-15">
    {Object.entries(categories).map(([key, label]) => (
      <button
        key={key}
        type="button"
        onClick={() => setSelected(key)}
        className={cn(
          "relative overflow-hidden rounded-md border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-500",
          selected === key
            ? "border-primary text-background"
            : "border-border bg-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="relative z-10">{label}</span>
        <AnimatePresence>
          {selected === key && (
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: "backIn" }}
              className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary/80"
            />
          )}
        </AnimatePresence>
      </button>
    ))}
  </div>
);

type FAQListProps = {
  faqData: FAQData;
  selected: string;
};

const FAQList = ({ faqData, selected }: FAQListProps) => (
  <div className="mx-auto mt-12 max-w-3xl">
    <AnimatePresence mode="wait">
      {Object.entries(faqData).map(([category, questions]) => {
        if (selected === category) {
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "backIn" }}
              className="space-y-4"
            >
              {questions.map((faq, index) => (
                <FAQItem key={index} {...faq} />
              ))}
            </motion.div>
          );
        }
        return null;
      })}
    </AnimatePresence>
  </div>
);

const FAQItem = ({ question, answer }: FAQItemData) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      animate={isOpen ? "open" : "closed"}
      className={cn(
        "rounded-xl border transition-colors",
        isOpen ? "bg-muted/50" : "bg-card",
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <span
          className={cn(
            "text-base font-medium transition-colors sm:text-lg",
            isOpen ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {question}
        </span>
        <motion.span
          variants={{
            open: { rotate: "45deg" },
            closed: { rotate: "0deg" },
          }}
          transition={{ duration: 0.2 }}
        >
          <Plus
            className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isOpen ? "text-foreground" : "text-muted-foreground",
            )}
          />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : "0px",
          marginBottom: isOpen ? "16px" : "0px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden px-4"
      >
        <p className="text-sm text-muted-foreground sm:text-base">{answer}</p>
      </motion.div>
    </motion.div>
  );
};
