import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Target, Eye, Award, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'About Us — Global Logistics Partner',
  description:
    'Learn about Elite Logistics, a global logistics and freight forwarding company connecting businesses worldwide.'
};

const VALUES = [
  { icon: Target, title: 'Our Mission', description: 'To deliver logistics excellence through innovation, reliability, and a customer-first approach that empowers businesses to thrive in global markets.' },
  { icon: Eye, title: 'Our Vision', description: 'To be the world\'s most trusted logistics partner, setting the standard for transparency, efficiency, and sustainable supply chain solutions.' },
  { icon: Award, title: 'Excellence', description: 'We pursue the highest standards in everything we do, from shipment handling to customer service, with continuous improvement at our core.' },
  { icon: Leaf, title: 'Sustainability', description: 'We are committed to reducing our environmental impact through optimized routing, eco-friendly packaging, and green logistics initiatives.' },
];

const MILESTONES = [
  { year: '2003', title: 'Founded', description: 'Elite Logistics established with a single warehouse and a vision for global shipping.' },
  { year: '2008', title: 'International Expansion', description: 'Opened first international offices in Europe and Asia, expanding our global network.' },
  { year: '2015', title: 'Technology Platform', description: 'Launched our proprietary shipment tracking platform with real-time visibility.' },
  { year: '2020', title: 'Sustainability Initiative', description: 'Committed to carbon-neutral shipping options and green logistics practices.' },
  { year: '2024', title: 'AI-Powered Logistics', description: 'Integrated predictive analytics for smarter routing and delivery optimization.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/3182784/pexels-photo-3182784.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Logistics business team"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/60" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold text-white sm:text-5xl">About Elite Logistics</h1>
          <p className="mt-4 text-lg text-slate-300">
            We connect businesses to the world through reliable, transparent, and
            innovative logistics solutions.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative h-[400px] overflow-hidden rounded-2xl">
              <Image
                src="https://images.pexels.com/photos/7792841/pexels-photo-7792841.jpeg?auto=compress&cs=tinysrgb&w=1260"
                alt="Business handshake"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Our Story</p>
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Logistics Excellence, Worldwide
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Founded in 2003, Elite Logistics began as a regional freight forwarder with a
                simple mission: to make global shipping reliable, transparent, and accessible for
                businesses of all sizes.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Today, we operate a worldwide network with strategic hubs on every major
                trade route. Our integrated platform combines air, ocean, and ground
                transportation with state-of-the-art warehousing and real-time tracking technology.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                What sets us apart is our unwavering commitment to visibility. Every shipment we
                handle is tracked end-to-end, giving our clients complete confidence in their supply
                chain at every stage of the journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Our Values</p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              What Drives Us Forward
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <Card key={value.title} className="border-border/60">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Our Journey</p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">Milestones</h2>
          </div>
          <div className="mt-12 space-y-8">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                    {m.year}
                  </div>
                  {i < MILESTONES.length - 1 && <div className="mt-2 w-0.5 flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <h3 className="text-lg font-semibold text-foreground">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold text-white">Partner with Elite Logistics</h2>
          <p className="mt-3 text-lg text-slate-300">
            Partner with us for reliable, transparent, and efficient global shipping.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/contact">
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
