/* Offers. Campaign copy and dates are taken from each campaign's own banner text: Kitab Teras (kt/, kt3 hero alt text),
   Hindi Pakhwara (hp/ banner alt text) and Azadi (the live rajkamalprakashan.com/offers banner). Status (live / soon / ended) is
   worked out from today's date. The store-wide order discount is as listed on the live product pages. */
window.RK_OFFERS = {
  campaigns: [
    { id: "kitab-teras", title: "किताब तेरस", en: "Kitab Teras — book sale", start: "2026-10-10", end: "2026-10-20",
      text: "सभी किताबों पर 40% तक की छूट + मुफ़्त डिलीवरी", textEn: "Up to 40% off on all books, with free delivery.",
      img: "img/kitab-teras.jpg", href: "../kt/", cta: "Explore Kitab Teras",
      tiers: [[2000, 5, ["संविधान थैला", "बुकमार्क", "Notepad"]], [5000, 7, ["संविधान थैला", "बुकमार्क + Box Calendar", "पेंसिल"]],
              [10000, 7, ["आकर्षक थैला (स्त्री वर्ष वाला)", "Box Calendar + Pen + Notepad", "One Year Pustak Mitra Yojana Membership Benefits"]]] },
    { id: "hindi-pakhwada", title: "हिंदी पखवाड़ा", en: "Hindi Pakhwara — साथ जुड़ें, साथ पढ़ें", start: "2026-09-15", end: "2026-09-30",
      text: "10% छूट और मुफ़्त डिलीवरी। ₹2000 पर 5%, ₹5000 और ₹10000 पर 7% अतिरिक्त छूट।", textEn: "10% off and free delivery, plus 5–7% extra on bigger orders.",
      img: "img/hindi-pakhwada.jpg", href: "../hp/", cta: "See the Hindi Pakhwara picks" },
    { id: "azadi", title: "आज़ादी के रंग, किताबों के संग", en: "Independence Day sale", start: "2026-08-08", end: "2026-08-23",
      text: "", textEn: "25–40% off on all books, with free delivery over ₹1200 and extra discounts and gifts on larger orders.",
      img: "img/azadi-2026.jpg" }
  ],
  /* every order, every day (live product pages: "5% off orders above ₹2,000; 7% off above ₹5,000; 10% off above ₹10,000") */
  orderTiers: [[2000, 5], [5000, 7], [10000, 10]]
};
