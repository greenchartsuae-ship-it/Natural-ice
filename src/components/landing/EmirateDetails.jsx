import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function EmirateDetails({ page }) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-base font-bold text-[#005696] mb-2">{page.areasLabel}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{page.areas}</p>
      </section>
      <section>
        <h2 className="text-base font-bold text-[#005696] mb-2">{page.whyLabel}</h2>
        <ul className="space-y-2">
          {page.bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-[#1D71B8] shrink-0 mt-0.5" /> {b}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}