import React from 'react';

const SECTIONS = [
  ['Logo ice for brands and events', 'Logo ice is crystal-clear ice with your logo, name or monogram set inside or engraved on the surface. We make it as large cubes, long cubes for highball glasses and round ice balls, so every drink served at your launch, wedding, corporate dinner or bar carries your brand. Our clear ice is frozen slowly from purified water, which removes air bubbles and keeps the design sharp and readable. Send us your logo as a PNG, PDF or vector file and our team prepares a preview before production.'],
  ['Flavoured ice balls', 'Our flavoured ice balls add colour and taste as they melt. Choose from strawberry, orange, mint and lavender, made with purified water and natural flavours. Strawberry and orange suit juices, mocktails and summer drinks, mint works well with lemonades and cocktails, and lavender brings a calm floral note to tea, tonic and signature drinks. Each ball melts slowly, so drinks stay cold without becoming watery too fast.'],
  ['Custom shapes and ice sculptures', 'Beyond cubes and balls, we produce custom shapes such as hearts, diamonds, stars, numbers and letters, as well as full ice sculptures, seafood display towers and ice bars. These pieces are popular for weddings, New Year parties, hotel buffets, product launches and photo moments. Tell us the idea, size and event date, and we will advise on the best design.'],
  ['Minimum order and lead time', 'Logo ice and flavoured ice balls start from a minimum of 100 pieces per design. Sculptures, ice bars and display pieces are made individually, from one piece. Please order at least 3 to 5 working days before your event for logo ice and ice balls, and around 7 days for large sculptures and ice bars. For urgent requests, contact us and we will check what is possible.'],
  ['How to order on WhatsApp', 'Ordering is simple. Message us on WhatsApp with your event date, delivery location, the type of ice you want, the quantity and your logo file if needed. Our team replies with a design preview, price and delivery time. Once you confirm, we produce your ice in our Dubai factory and deliver it frozen, in insulated packaging, anywhere in the UAE.'],
];

export default function CustomIceDetails() {
  return (
    <div className="space-y-5 mb-6">
      {SECTIONS.map(([h, text]) => (
        <section key={h}>
          <h2 className="text-base font-bold text-[#005696] mb-2">{h}</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
        </section>
      ))}
    </div>
  );
}