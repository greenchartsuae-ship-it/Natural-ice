// Emirate landing pages (rendered by LandingPage)
const NAMES = ['Block Ice', 'Tube Ice', 'Crushed Ice', 'Dry Ice'];
const page = (title, description, h1, short, intro, areasLabel, areas, whyLabel, bullets, faqs) => ({
  title, description, h1, short, intro, areasLabel, areas, whyLabel, bullets, faqs, names: NAMES, sections: [],
});

export const EMIRATE_PAGES = {
  '/ice-delivery-abu-dhabi': page(
    'Ice Delivery Abu Dhabi – Cubes, Blocks, Dry Ice | Natural Ice',
    'Ice cubes, ice blocks and dry ice delivered across Abu Dhabi, Musaffah, Khalifa City and Yas Island. Certified factory, order 24/7.',
    'Ice Delivery in Abu Dhabi', 'Abu Dhabi',
    'Natural Ice delivers food-grade ice across Abu Dhabi from our certified factory in Dubai, which produces up to 1,000 tonnes of ice per day. Hotels, restaurants, construction sites and households in the capital order ice cubes, tube ice, crushed ice, 25 kg ice blocks and dry ice from us, delivered in our own refrigerated trucks.',
    'Areas we serve in Abu Dhabi', 'Musaffah, Khalifa City, Mohammed Bin Zayed City, Al Reem Island, Yas Island, Saadiyat Island, Al Raha, Abu Dhabi city centre and Al Shamkha.',
    'Why Abu Dhabi businesses choose Natural Ice',
    ['ISO 22000 and HACCP certified, with the Emirates Quality Mark on our tube ice', 'Large capacity, so supply does not stop in summer peaks', 'Scheduled daily delivery for hotels, restaurants and catering', 'Block ice for construction and concrete cooling in Musaffah and industrial areas'],
    [
      { q: 'Do you deliver ice to Abu Dhabi every day?', a: 'Yes. Businesses can book fixed daily delivery, and homes can order online or on WhatsApp.' },
      { q: 'Can I order dry ice in Abu Dhabi?', a: 'Yes, we deliver dry ice pellets and blocks with safe packing.' },
      { q: 'What is the minimum order for Abu Dhabi?', a: 'Contact us on WhatsApp and we will confirm the minimum order for your area.' },
    ],
  ),
  '/ice-delivery-sharjah': page(
    'Ice Delivery Sharjah – Ice Cubes & Ice Blocks | Natural Ice',
    'Fast ice delivery in Sharjah: ice cubes, crushed ice, tube ice and 25 kg ice blocks for homes, restaurants and industry. Order 24/7.',
    'Ice Delivery in Sharjah', 'Sharjah',
    'Sharjah is minutes from our factory in Dubai, so Natural Ice can deliver ice quickly to homes and businesses across the emirate. We supply purified ice cubes for parties and restaurants, crushed ice for fish markets and juice shops, and 25 kg ice blocks for industrial areas and construction sites.',
    'Areas we serve in Sharjah', 'Sharjah Industrial Areas 1–18, Al Nahda, Al Majaz, Al Khan, Al Qasimia, Muwaileh, University City, Al Taawun and Al Hamriyah.',
    'Why Sharjah customers choose Natural Ice',
    ['Short distance from our Dubai factory means faster delivery', 'Certified food-grade ice (ISO 22000, HACCP, Emirates Quality Mark)', 'Wholesale supply for supermarkets, cafeterias and restaurants', 'Ice blocks and crushed ice for factories, fisheries and workshops'],
    [
      { q: 'How fast can you deliver ice in Sharjah?', a: 'Most Sharjah orders are delivered the same day. Order early for large quantities.' },
      { q: 'Do you supply restaurants and supermarkets in Sharjah?', a: 'Yes, with scheduled daily or weekly delivery and tax invoices.' },
      { q: 'Do you deliver ice blocks to Sharjah industrial areas?', a: 'Yes, 25 kg ice blocks in any quantity.' },
    ],
  ),
  '/ice-delivery-ajman': page(
    'Ice Delivery Ajman – Ice Cubes & Blocks | Natural Ice',
    'Ice cubes, crushed ice and ice blocks delivered in Ajman for homes, restaurants and businesses. Certified ice factory, order 24/7.',
    'Ice Delivery in Ajman', 'Ajman',
    'Natural Ice delivers certified food-grade ice to Ajman for homes, restaurants, cafeterias, events and industry. Order bags of ice cubes for a party, tube ice for your café, or 25 kg ice blocks for workshops and construction.',
    'Areas we serve in Ajman', 'Al Jurf, Al Nuaimiya, Al Rashidiya, Al Rawda, Al Mowaihat, Al Zahra, Ajman Industrial Areas and Ajman Free Zone.',
    'Why Ajman customers choose Natural Ice',
    ['Full range: cubes, tube, crushed, block and dry ice from one supplier', 'Purified water and ISO 22000 / HACCP certified production', 'Easy online and WhatsApp ordering, 24/7', 'Wholesale prices for regular business orders'],
    [
      { q: 'Do you deliver ice to Ajman at night?', a: 'Yes, we are open 24/7. Contact us on WhatsApp for late orders.' },
      { q: 'Can I get regular ice supply for my cafeteria in Ajman?', a: 'Yes, we set up fixed delivery days and times.' },
      { q: 'Do you sell party ice in Ajman?', a: 'Yes, ice cubes, ice balls and crushed ice for parties and events.' },
    ],
  ),
  '/ice-delivery-umm-al-quwain': page(
    'Ice Delivery Umm Al Quwain – Cubes & Blocks | Natural Ice',
    'Ice cubes, crushed ice and ice blocks delivered in Umm Al Quwain for homes, fishermen, hotels and events. Order 24/7.',
    'Ice Delivery in Umm Al Quwain', 'Umm Al Quwain',
    'Natural Ice supplies Umm Al Quwain with certified food-grade ice for homes, hotels, restaurants, fishermen and events. Fishing boats and fish shops use our crushed ice and 25 kg ice blocks to keep the catch fresh, while families and venues order ice cubes and tube ice for drinks.',
    'Areas we serve in Umm Al Quwain', 'Al Salamah, Al Raas, Al Ramlah, Al Maidan, Umm Al Quwain Industrial Area and the Umm Al Quwain marina and fishing areas.',
    'Why Umm Al Quwain customers choose Natural Ice',
    ['Crushed ice and ice blocks for fisheries', 'Certified, purified ice for drinks and food', 'Delivery in our own refrigerated trucks', 'Simple ordering on WhatsApp'],
    [
      { q: 'Do you supply ice for fishing boats in Umm Al Quwain?', a: 'Yes, crushed ice and 25 kg ice blocks in bulk.' },
      { q: 'Can I order ice cubes for a party in Umm Al Quwain?', a: 'Yes, order online or on WhatsApp.' },
      { q: 'Do you deliver every day?', a: 'Contact us to book a fixed delivery schedule for your area.' },
    ],
  ),
  '/ice-delivery-ras-al-khaimah': page(
    'Ice Delivery Ras Al Khaimah – Cubes & Blocks | Natural Ice',
    'Ice cubes, crushed ice and ice blocks for Ras Al Khaimah hotels, restaurants, fisheries and events. Certified ice, order 24/7.',
    'Ice Delivery in Ras Al Khaimah', 'Ras Al Khaimah',
    'Natural Ice delivers certified ice to Ras Al Khaimah for resorts, restaurants, events, fisheries and homes. Our factory produces up to 1,000 tonnes of ice per day, so we can supply large orders for hotels and events in RAK without delays.',
    'Areas we serve in Ras Al Khaimah', 'Al Hamra, Al Marjan Island, Al Nakheel, Al Dhait, Al Mamourah, Julphar, Khuzam, Al Jazirah Al Hamra and RAK industrial areas.',
    'Why Ras Al Khaimah customers choose Natural Ice',
    ['Reliable supply for resorts and large events on Al Marjan Island and Al Hamra', 'Crushed ice and block ice for fish markets and fisheries', 'ISO 22000, HACCP and Emirates Quality Mark certified', 'Scheduled deliveries for businesses'],
    [
      { q: 'Do you deliver to hotels on Al Marjan Island?', a: 'Yes, with scheduled deliveries for hotels and resorts.' },
      { q: 'Can I order dry ice in Ras Al Khaimah?', a: 'Yes, dry ice pellets and blocks are available.' },
      { q: 'How do I order?', a: 'Order online at naturalice.ae or on WhatsApp.' },
    ],
  ),
  '/ice-delivery-fujairah': page(
    'Ice Delivery Fujairah, Dibba & Khor Fakkan | Natural Ice',
    'Ice supply for Fujairah, Dibba, Kalba and Khor Fakkan: ice blocks for fishing, ice cubes for hotels and events. Order 24/7.',
    'Ice Delivery in Fujairah and the East Coast', 'Fujairah',
    'Natural Ice serves the UAE East Coast with certified ice for fisheries, hotels, restaurants and events. Fishing communities in Fujairah, Dibba and Kalba use our crushed ice and 25 kg ice blocks, and beach resorts order ice cubes and tube ice for their bars and restaurants.',
    'Areas we serve on the East Coast', 'Fujairah city, Fujairah Industrial Area, Dibba Al Fujairah, Al Aqah, Kalba and Khor Fakkan.',
    'Why East Coast customers choose Natural Ice',
    ['Bulk crushed ice and ice blocks for fishermen and fish markets', 'Large capacity for resorts and events', 'Certified food-grade ice from purified water', 'Easy ordering on WhatsApp'],
    [
      { q: 'Do you deliver ice to Dibba and Khor Fakkan?', a: 'Yes, contact us on WhatsApp to arrange delivery.' },
      { q: 'Do you supply ice for fishing boats?', a: 'Yes, crushed ice and 25 kg ice blocks in bulk.' },
      { q: 'Do you deliver to beach resorts in Al Aqah?', a: 'Yes, with scheduled deliveries.' },
    ],
  ),
  '/ice-delivery-al-ain': page(
    'Ice Delivery Al Ain – Ice Cubes & Blocks | Natural Ice',
    'Ice cubes and ice blocks delivered in Al Ain for homes, farms, events and businesses. Certified ice factory, order 24/7.',
    'Ice Delivery in Al Ain', 'Al Ain',
    'Natural Ice delivers certified ice to Al Ain for homes, farms, restaurants, events and businesses. Summers in Al Ain are among the hottest in the UAE, so customers rely on our ice blocks for farms and livestock, and ice cubes and crushed ice for weddings, gatherings and restaurants.',
    'Areas we serve in Al Ain', 'Al Jimi, Al Muwaiji, Hili, Al Towayya, Al Khabisi, Zakher, Al Ain Industrial Area (Sanaiya) and surrounding farms.',
    'Why Al Ain customers choose Natural Ice',
    ['Ice blocks for farms, livestock and outdoor work', 'Ice cubes and crushed ice for weddings and family events', 'ISO 22000 and HACCP certified production', 'Delivery in refrigerated trucks so ice arrives frozen'],
    [
      { q: 'Do you deliver ice to farms in Al Ain?', a: 'Yes, contact us on WhatsApp with your location.' },
      { q: 'Can I order ice for a wedding in Al Ain?', a: 'Yes, tell us the guest count and we will size the order.' },
      { q: 'Do you deliver dry ice to Al Ain?', a: 'Yes, dry ice is available on request.' },
    ],
  ),
};