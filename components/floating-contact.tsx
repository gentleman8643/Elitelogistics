'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, X, ChevronUp } from 'lucide-react';
import { COMPANY, getWhatsAppUrl, getTelUrl, hasSignal } from '@/lib/company';

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-50 no-print"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {open && (
        <div className="mb-3 flex flex-col items-end gap-2 animate-fade-in">
          {hasSignal() && (
            <a
              href={COMPANY.signalContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-full bg-white py-2.5 pl-4 pr-5 shadow-lg ring-1 ring-border transition-all hover:shadow-xl hover:ring-primary/30"
            >
              <SignalIcon className="h-5 w-5 text-slate-700" />
              <span className="text-sm font-medium text-foreground">Signal</span>
            </a>
          )}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-full bg-white py-2.5 pl-4 pr-5 shadow-lg ring-1 ring-border transition-all hover:shadow-xl hover:ring-green-400/40"
          >
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-foreground">WhatsApp</span>
          </a>
          <a
            href={getTelUrl()}
            className="flex items-center gap-3 rounded-full bg-white py-2.5 pl-4 pr-5 shadow-lg ring-1 ring-border transition-all hover:shadow-xl hover:ring-primary/30"
          >
            <Phone className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight text-foreground">Call</span>
              <span className="text-xs leading-tight text-muted-foreground">{COMPANY.displayPhone}</span>
            </div>
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-white shadow-xl transition-all hover:bg-primary/90 hover:shadow-2xl active:scale-95"
        aria-label={open ? 'Close contact menu' : 'Contact us'}
        aria-expanded={open}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">Contact Us</span>
          </>
        )}
      </button>

      {visible && !open && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-lg ring-1 ring-border transition-all hover:shadow-xl hover:text-primary"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function SignalIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8 2 5 5 5 9v6c0 2 1 4 3 5l1-1v-8H7V9c0-3 2-5 5-5s5 2 5 5v2h-2v8l1 1c2-1 3-3 3-5V9c0-4-3-7-7-7z" />
    </svg>
  );
}
