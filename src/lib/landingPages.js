import { EMIRATE_PAGES } from '@/lib/emiratePages';
import { FAQS } from '@/components/shared/FAQSection';

const withFaq = (q, a) => [{ q, a }, ...FAQS];

// SEO landing pages: copy, meta and which catalog categories/products to show
export const LANDING_PAGES = {
  '/ice-cubes-dubai': {
    title: 'Ice Cubes Delivery Dubai – Buy Ice Cubes 24/7 | Natural Ice',
    description: 'Crystal-clear purified ice cubes delivered in Dubai 24/7. Bags and packs for home, parties and restaurants.',
    h1: 'Ice Cubes Delivery in Dubai',
    intro: 'Crystal-clear purified ice cubes delivered in Dubai 24/7. Order ice cubes in Dubai by the bag: every bag of ice is made from purified water in our Dubai factory.',
    faqs: withFaq('Where can I buy a bag of ice in Dubai?', 'Order online or on WhatsApp from Natural Ice. We deliver bags of ice cubes across Dubai 24/7.'),
    categories: ['ice_cube', 'tube_ice'],
    sections: [
      ['Purified ice cubes, made in Dubai', 'Natural Ice produces crystal-clear ice cubes every day at our factory in Al Quoz Industrial Area 3, Dubai. Every cube starts as purified, filtered water and is frozen under strict food-safety standards, so it is clean, odourless and tasteless. That means your drinks taste exactly as they should, whether it is a glass of water at home, a soft drink at a family gathering or a signature cocktail at a busy restaurant.'],
      ['Order ice cubes 24/7', 'Our factory and delivery team work 24 hours a day, 7 days a week. You can order online in a few taps, or message us on WhatsApp, and we deliver straight to your door anywhere in Dubai, including Downtown, Dubai Marina, JLT, Jumeirah, Business Bay, Al Barsha, Deira and Dubai Silicon Oasis. Same-day delivery is available across Dubai, and we deliver quickly to the other emirates too.'],
      ['Sizes for every occasion', 'Choose small packs of premium cubes for a dinner at home, 1 kg and 2 kg bags for a small party, or 10 kg bags for restaurants, cafés, catering and large events. Our tube ice is a popular choice for cooling drinks fast because its hollow centre gives it more surface area. For bars and hotels we also offer premium cocktail cubes that melt slowly and look beautiful in the glass.'],
      ['Why customers choose Natural Ice', 'We are a factory, not a reseller, so you get factory prices and fresh ice that has not been sitting in a shop freezer. Our own refrigerated fleet keeps the ice frozen until it reaches you. Businesses can open an account for fixed pricing, scheduled deliveries and tax invoices, while home customers can order as guests and track their order with just a phone number.'],
      ['How much ice do you need?', 'A simple rule is about 1 kg of ice per guest for drinks, plus extra if you are cooling bottles and cans in a tub. For a party of 30 people, three 10 kg bags is a comfortable amount. Not sure? Send us your guest count on WhatsApp and we will size the order for you.'],
    ],
  },
  '/ice-block-dubai': {
    title: 'Ice Block Delivery Dubai – 25 kg Ice Blocks | Natural Ice',
    description: '25 kg ice blocks for construction, fisheries, pools and events. Factory price, same-day delivery across Dubai and UAE.',
    h1: 'Ice Blocks Supplier in Dubai',
    intro: 'Need an ice block in Dubai? We supply 25 kg ice blocks for pools, construction and concrete cooling, fisheries and events, at factory price with same-day delivery across Dubai and the UAE.',
    faqs: withFaq('How many ice blocks do I need to cool a swimming pool?', 'It depends on the pool size and how much you want to cool it. Send us the pool size on WhatsApp and we will tell you how many blocks you need.'),
    names: ['Block Ice', 'Pool Block', 'Solid Ice'],
    sections: [
      ['Heavy-duty ice blocks from our Dubai factory', 'Natural Ice manufactures solid 25 kg ice blocks at our factory in Al Quoz, Dubai. Ice blocks melt far more slowly than cubes because they have less surface area, which makes them the most cost-effective way to keep things cold for many hours in the UAE heat. Every block is frozen from purified water and handled under food-safety standards.'],
      ['Who uses ice blocks?', 'Construction companies use our blocks to cool concrete mixes during hot summer pours and to keep drinking water cold for site workers. Fisheries and fish markets use them to keep the daily catch fresh. Pool owners and villas use pool block ice to bring water temperature down in summer. Event organisers, caterers and food trucks use blocks inside cool boxes to keep drinks and food chilled through the whole day.'],
      ['Factory price and same-day delivery', 'Because you buy directly from the factory, you pay factory prices with no middleman. Our refrigerated trucks deliver blocks across Dubai the same day, and we supply Sharjah, Abu Dhabi, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah and Al Ain on a fast schedule. We can deliver a few blocks for a weekend pool party or hundreds of blocks for a construction project.'],
      ['Scheduled supply for businesses', 'For construction sites, fisheries and industrial customers we set up daily or weekly delivery schedules at fixed times, with fixed pricing and monthly tax invoices. Our team operates 24/7, so night pours and early-morning markets are no problem. Contact us on WhatsApp with your daily quantity and location and we will prepare a quote.'],
      ['Handling tips', 'Keep blocks in the shade or covered with an insulated sheet to make them last longer. Use gloves when handling, as a 25 kg block is heavy and very cold. For pools, add blocks in the evening for the best cooling effect the next morning.'],
    ],
  },
  '/tube-crushed-ice': {
    title: 'Tube Ice & Crushed Ice Supplier UAE | Natural Ice',
    description: 'Food-grade tube and crushed ice for bars, fish displays and catering. Daily supply contracts across the UAE.',
    h1: 'Tube Ice and Crushed Ice Supplier',
    categories: ['tube_ice', 'crushed_ice'],
    names: ['Flake Ice'],
    sections: [
      ['Tube ice: the workhorse of every bar', 'Tube ice is a cylinder of ice with a small hollow centre. It cools drinks quickly, stacks neatly in a glass and does not stick together in the bag, which makes it the first choice for restaurants, cafés, juice shops and catering companies across the UAE. Natural Ice produces tube ice daily in Dubai from purified water, in 1 kg, 2 kg and 10 kg bags.'],
      ['Crushed and flake ice for displays and cocktails', 'Crushed ice is perfect for mojitos, frozen cocktails, slushies and smoothies. Flake ice is soft and mouldable, so supermarkets, fishmongers and hotel buffets use it to build fish and seafood displays that keep produce fresh and look great. Both are food-grade and made to the same hygiene standards as all our ice.'],
      ['Daily supply contracts across the UAE', 'We supply hotels, restaurants, supermarkets, fish markets and caterers every day with fixed delivery times. Our own refrigerated fleet delivers across Dubai, Sharjah, Abu Dhabi, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah and Al Ain. Business customers get fixed prices, a dedicated account and monthly tax invoices, and can order online or through WhatsApp at any time of day or night.'],
      ['Why buy from a factory?', 'Buying from Natural Ice means fresher ice, factory prices and a supplier that can scale with you. When you have a big weekend or a large event, we can increase your delivery the same day. Our factory runs 24/7, so supply does not stop on public holidays or during the busy summer season.'],
      ['Getting started', 'Order a single bag online to try our quality, or send us your daily volume on WhatsApp for a wholesale quote. We usually respond within minutes and can start supply the next day.'],
    ],
  },
  '/dry-ice-dubai': {
    title: 'Dry Ice Dubai – Pellets & Blocks Delivery | Natural Ice',
    description: 'Dry ice pellets and blocks in Dubai for shipping, events and smoke effects. Safe packing and fast delivery.',
    h1: 'Dry Ice in Dubai – Fast Delivery',
    intro: 'Natural Ice is a dry ice supplier in Dubai and the UAE. If you are searching for dry ice near me, we deliver pellets and blocks the same day in Dubai, for shipping, events and smoke effects, with safe packing.',
    faqs: withFaq('Where can I buy dry ice in Dubai?', 'From Natural Ice in Al Quoz, Dubai. Minimum order 5 kg, delivered with safe packing.'),
    categories: ['dry_ice'],
    sections: [
      ['What is dry ice?', 'Dry ice is frozen carbon dioxide at about minus 78 °C. Unlike normal ice it does not melt into water; it turns straight into gas. That makes it ideal when you need very cold temperatures without any mess. Natural Ice supplies dry ice in Dubai and delivers across the UAE, sold by the kilogram.'],
      ['Uses for dry ice', 'Dry ice is used to ship frozen food, seafood, medical samples and pharmaceuticals, keeping them frozen for longer than regular ice. Restaurants and bars use it for dramatic smoking cocktails and desserts. Event and wedding planners use it to create low-lying fog for first dances, stage shows and photo moments. It is also used for industrial cleaning and for cooling during equipment repairs.'],
      ['Safe packing and fast delivery', 'We pack dry ice in insulated containers to reduce loss in transit and deliver it quickly so you get the most out of every kilogram. Same-day delivery is available in Dubai, with fast delivery to the other emirates. Order online or tell us on WhatsApp how much you need and when.'],
      ['Safety first', 'Never touch dry ice with bare hands; always use gloves or tongs. Use it in well-ventilated spaces because it releases carbon dioxide gas. Do not store it in an airtight container or a closed car, and never swallow it. In drinks, only use food-grade dry ice and wait until it has fully dissolved before drinking. Our team is happy to advise on safe use for your event.'],
      ['How much dry ice do you need?', 'Dry ice slowly sublimates, so plan for some loss over time. For a short fog effect a few kilograms is usually enough; for shipping, plan roughly 2 to 5 kg per 24 hours depending on the box. Send us your use case and we will recommend a quantity.'],
    ],
  },
  '/clear-ice': {
    title: 'Clear Ice Cubes & Ice Balls for Cocktails | Natural Ice',
    description: 'Slow-melting crystal-clear cubes, spheres and flavoured ice balls for bars, hotels and home cocktails in Dubai.',
    h1: 'Clear Cocktail Ice and Ice Balls',
    intro: 'Clear ice in Dubai for bars, hotels and home: crystal-clear ice balls for whiskey, large cubes and cocktail ice that melts slowly. We also make flavoured ice balls.',
    faqs: withFaq('What is the best ice for whiskey?', 'A large clear ice ball or cube. It melts slowly, so the drink stays cold without getting watered down.'),
    categories: ['ice_ball', 'luxury_ice', 'long_ice_cube', 'diamond_ice'],
    sections: [
      ['Crystal-clear ice that makes the drink', 'Clear ice is made by freezing purified water slowly and in one direction, which pushes out the air bubbles and minerals that make normal ice cloudy. The result is ice that is as clear as glass, melts slowly and keeps your drink cold without watering it down. Natural Ice makes clear cubes, long Collins cubes, diamond ice and spheres in Dubai.'],
      ['Ice balls and flavoured spheres', 'Our ice balls are a favourite for whisky, negronis and premium soft drinks. A large sphere has the smallest surface area for its size, so it melts the slowest of any ice shape. We also make flavoured and decorated ice balls with real fruit, mint, lavender, flowers, strawberry, orange and lemon, and luxury gold and silver finishes for special occasions.'],
      ['For bars, hotels and home cocktails', 'Bars and hotel lounges across Dubai use our clear ice to serve a better drink and lift presentation without investing in their own clear-ice machines. At home, a pack of clear cubes or spheres turns any drink into a cocktail-bar experience for guests. Packs come in 3, 6, 12, 20 and 24 pieces.'],
      ['Delivered frozen, 24/7', 'Clear ice is delivered in insulated packaging by our own fleet so it arrives perfect. Order online or on WhatsApp at any hour, with same-day delivery in Dubai. For venues we offer regular scheduled supply and fixed pricing.'],
      ['Custom clear ice', 'Want your logo or initials inside the ice? See our custom ice page for branded logo cubes and personalised spheres for events, launches and weddings.'],
    ],
  },
  '/ice-for-events': {
    title: 'Ice for Parties, Events & Pools Dubai | Natural Ice',
    description: 'Party ice, pool cooling ice blocks and event ice with on-time delivery. Tell us your guest count and we size the order.',
    h1: 'Ice for Parties, Events and Pools',
    intro: 'Ice for parties in Dubai, weddings, corporate events and pool parties, delivered on time to your venue. Tell us your guest count and we size the order.',
    faqs: withFaq('How much ice do I need for a wedding?', 'Plan about 1 kg of ice per guest for drinks, plus extra for cooling bottles. Tell us your guest count and we will size the order.'),
    names: ['Tube Ice - 10 kg', 'Crushed Ice - 10 kg', 'Pool Block Ice', 'Block Ice - 25 kg', 'Dry Ice'],
    sections: [
      ['Ice for every celebration', 'From birthday parties and BBQs to weddings, corporate dinners and festivals, Natural Ice supplies all the ice your event needs in Dubai and across the UAE. Choose tube ice for drinks, crushed ice for cocktails and buffets, ice blocks for cool boxes, and dry ice for fog effects.'],
      ['Pool cooling in summer', 'UAE pools can get uncomfortably warm in summer. Our pool block ice is designed to bring water temperature down so you and your guests can enjoy a refreshing swim. Add blocks in the evening and the pool will feel noticeably cooler the next day. We deliver to villas and compounds across Dubai.'],
      ['Tell us your guest count, we size the order', 'Planning ice is easy with our rule of thumb: about 1 kg of ice per guest for drinks, plus extra to chill bottles and cans. For a 50-guest party that is roughly five 10 kg bags, plus a block or two for cool boxes. Send us your guest count, event date and venue on WhatsApp, and we will recommend the right mix.'],
      ['On-time delivery, day or night', 'Events cannot wait for late ice. Our team runs 24/7 and delivers with our own refrigerated trucks at the time you choose. We can schedule several drops during a long event so the ice is always fresh, and our drivers can unload to your bar or kitchen area.'],
      ['Make it memorable', 'Add custom logo ice, flavoured ice balls or an ice sculpture for a showpiece. Visit our custom ice page or ask our team for ideas that fit your theme and budget.'],
    ],
  },
  '/best-ice-factory-uae': {
    title: 'Best Ice Factory in the UAE – Why Choose Natural Ice',
    description: 'Factory-direct food-grade ice, open 24/7, delivering to all 7 emirates. See our capacity and why customers choose us.',
    h1: 'Why Natural Ice Is a Leading Ice Factory in the UAE',
    faqs: withFaq('What is the best ice factory in Dubai?', 'Choose a certified factory with large capacity, 24/7 production and its own fleet. Natural Ice is certified, produces up to 1,000 tonnes per day, runs 24/7 and delivers to all 7 emirates.'),
    names: ['Tube Ice - 10 kg', 'Block Ice - 25 kg', 'Crushed Ice - 10 kg', 'Dry Ice'],
    sections: [
      ['What makes a great ice factory?', 'If you are looking for the best ice factory in Dubai or the best ice factory in the UAE, these are the things to compare. When you choose an ice supplier, look for three things: food-grade production from purified water, round-the-clock production so supply never stops, and an in-house delivery fleet so ice arrives frozen and on time. Natural Ice Industry LLC delivers all three from our factory in Al Quoz Industrial Area 3, Dubai.'],
      ['Food-grade, purified ice', 'Every product we make starts with purified, filtered water and is frozen and packed under strict hygiene standards. That means ice that is safe to put in drinks and food, with no taste or odour. We produce cube, tube, crushed, flake, block, clear, dry and custom ice, so customers can source everything from one supplier.'],
      ['Open 24/7, all year', 'Our factory operates 24 hours a day, 7 days a week, including weekends and public holidays. Restaurants running late service, construction sites pouring concrete at night and events finishing in the early morning can all rely on us. You can order online or on WhatsApp any time.'],
      ['Our own fleet, all 7 emirates', 'We deliver with our own refrigerated trucks to Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah and Fujairah, including Al Ain. Same-day delivery is available in Dubai, and businesses can book fixed daily delivery windows.'],
      ['Trusted by homes and businesses', 'Hotels, restaurants, supermarkets, caterers, fisheries, construction companies and thousands of households order from Natural Ice. Business customers get fixed pricing, scheduled supply and tax invoices; home customers get factory prices and simple online ordering with live order tracking.'],
    ],
  },
  ...EMIRATE_PAGES,
};