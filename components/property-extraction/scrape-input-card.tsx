"use client";

import { Card, CardContent } from "../ui/card";
import { ScrapeInputHeader } from "./scrape-input/scrape-input-header";
import { UrlInputRow } from "./scrape-input/url-input-row";
import { ActionButtons } from "./scrape-input/action-buttons";
import { useForm, useFieldArray } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ScrapeInputCardProps {
  urls: string[];
  isLoading: boolean;
  onScrape: (activeUrls: string[]) => void;
  setFocusedUrl: (url: string | null) => void;
}

const schema = z.object({
  urls: z
    .array(
      z.object({
        value: z
          .string()
          .min(1, "URL is required")
          .url("Please enter a valid URL"),
      }),
    )
    .min(1),
});

type FormValues = z.infer<typeof schema>;

function ScrapeInputCard({
  urls: initialUrls,
  isLoading,
  onScrape,
  setFocusedUrl,
}: ScrapeInputCardProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      urls: initialUrls.map((u) => ({ value: u })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "urls",
  });

  const watchedUrls = form.watch("urls");

  const handleSubmit = (data: FormValues) => {
    const activeUrls = data.urls
      .map((u) => u.value)
      .filter((v) => v.trim() !== "");
    if (activeUrls.length > 0) {
      onScrape(activeUrls);
    }
  };

  return (
    <Card className="rounded-xl border-border bg-card shadow-none">
      <ScrapeInputHeader />
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <UrlInputRow
                key={field.id}
                index={index}
                control={form.control as any}
                canDelete={fields.length > 1}
                onDelete={() => remove(index)}
                onFocus={() => setFocusedUrl(watchedUrls[index]?.value || null)}
              />
            ))}
          </div>

          <ActionButtons
            isLoading={isLoading}
            isExecuteDisabled={
              isLoading || watchedUrls.every((u) => !u.value.trim())
            }
            onAddTarget={() => append({ value: "" })}
            onExecute={form.handleSubmit(handleSubmit)}
          />
        </form>
      </CardContent>
    </Card>
  );
}

export default ScrapeInputCard;
