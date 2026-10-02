import { FAQS } from '@/lib/constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description:
    'Find answers to common questions about shipment tracking, delivery times, delays, and how to contact our support team.',
};

export default function FAQPage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold text-white sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-slate-300">
            Everything you need to know about tracking your shipments and our logistics services.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-lg border border-border/60 px-4"
              >
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 rounded-2xl bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-bold text-foreground">Still Have Questions?</h2>
            <p className="mt-2 text-muted-foreground">
              Our support team is ready to help with any shipment-related inquiries.
            </p>
            <Button asChild className="mt-4">
              <Link href="/contact">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
