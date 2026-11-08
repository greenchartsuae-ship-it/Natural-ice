import React, { useEffect } from 'react';

export const FAQS = [
  { q: 'Where can I buy ice in Dubai?', a: 'Order from Natural Ice online or on WhatsApp, open 24/7, with delivery to your door anywhere in Dubai.' },
  { q: 'What is the best ice factory in the UAE?', a: 'Look for a factory with food-grade certification, 24/7 production and its own delivery fleet. Natural Ice produces purified ice in Dubai and delivers to all 7 emirates.' },
  { q: 'Do you deliver ice the same day?', a: 'Yes, same-day delivery in Dubai and fast delivery to the other emirates.' },
  { q: 'How much ice do I need for a party?', a: 'About 1 kg of ice per guest for drinks, plus extra for cooling bottles.' },
  { q: 'Do you supply hotels and restaurants?', a: 'Yes, daily wholesale supply with fixed delivery times.' },
];

export default function FAQSection({ faqs = FAQS, heading = 'Frequently Asked Questions' }) {
  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'naturalice-faq-schema';
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
    document.head.appendChild(el);
    return () => el.remove();
  }, [faqs]);

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-lg font-bold text-[#005696] mb-4">{heading}</h2>
      <div className="space-y-3">
        {faqs.map(({ q, a }) => (
          <div key={q} className="rounded-xl border border-slate-100 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-800">{q}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}