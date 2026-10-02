'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { COMPANY, getWhatsAppUrl, getTelUrl, hasSignal } from '@/lib/company';

function SignalIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8 2 5 5 5 9v6c0 2 1 4 3 5l1-1v-8H7V9c0-3 2-5 5-5s5 2 5 5v2h-2v8l1 1c2-1 3-3 3-5V9c0-4-3-7-7-7z" />
    </svg>
  );
}

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success('Your message has been sent. We will get back to you shortly.');
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold text-white sm:text-5xl">Contact Us</h1>
          <p className="mt-4 text-lg text-slate-300">
            Have a question about your shipment or need a custom logistics solution? Our team is here to help.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{COMPANY.name}</h2>
              <p className="mt-2 text-muted-foreground">
                Reach out through any of the channels below, and our team will respond promptly.
              </p>

              {/* Quick Contact Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={getTelUrl()}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-4 py-3 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Call</span>
                    <span className="text-xs text-muted-foreground">{COMPANY.displayPhone}</span>
                  </div>
                </a>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-4 py-3 transition-all hover:border-green-400/40 hover:shadow-md"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-foreground">WhatsApp</span>
                </a>
                {hasSignal() && (
                  <a
                    href={COMPANY.signalContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-4 py-3 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <SignalIcon className="h-5 w-5 text-slate-700" />
                    <span className="text-sm font-semibold text-foreground">Signal</span>
                  </a>
                )}
              </div>

              <div className="mt-8 space-y-6">
                <ContactInfoRow icon={Phone} label="Phone" value={COMPANY.displayPhone} />
                <ContactInfoRow icon={Mail} label="Email" value={COMPANY.email} />
                <ContactInfoRow icon={MapPin} label="Address" value={COMPANY.address} />
                <ContactInfoRow icon={Clock} label="Business Hours" value="Monday - Friday: 8:00 AM - 6:00 PM (PST)" />
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-border/60">
                <iframe
                  title="Elite Logistics location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-118.215%2C33.755%2C-118.175%2C33.775&layer=mapnik&marker=33.765%2C-118.195"
                  className="h-64 w-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-border/60">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-foreground">Send a Message</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Fill out the form below and we will get back to you as soon as possible.
                  </p>
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" value={form.name} onChange={handleChange} required className="mt-1.5" placeholder="John Smith" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1.5" placeholder="john@company.com" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" value={form.subject} onChange={handleChange} required className="mt-1.5" placeholder="How can we help?" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" value={form.message} onChange={handleChange} required className="mt-1.5" rows={5} placeholder="Tell us about your inquiry..." />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span className="ml-2">{loading ? 'Sending...' : 'Send Message'}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactInfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium uppercase text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
