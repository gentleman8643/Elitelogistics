import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { SERVICES } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Services — Freight, Logistics & Supply Chain Solutions',
  description:
    'Explore our comprehensive logistics services including air freight, ocean freight, road transportation, express delivery, warehousing, cargo handling, last-mile delivery, and international shipping.',
};

export default function ServicesPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-slate-900 py-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/2231744/pexels-photo-2231744.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Cargo port at sunset"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/70" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold text-white sm:text-5xl">Our Logistics Services</h1>
          <p className="mt-4 text-lg text-slate-300">
            Comprehensive freight and supply chain solutions designed to keep your business moving.
            From single packages to full container loads, we handle it all.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
          {SERVICES.map((service, index) => (
            <div
              key={service.type}
              id={service.type}
              className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div className="relative h-64 overflow-hidden rounded-2xl sm:h-80">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{service.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-6">
                  <Link href="/contact">
                    Get a Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold text-white">Need a Custom Solution?</h2>
          <p className="mt-3 text-lg text-primary-foreground/90">
            Our logistics experts will work with you to design a shipping strategy that fits your business.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link href="/contact">
              Contact Our Team
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
