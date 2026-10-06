const cards = [
  { title: "बचपन की कहानियाँ", off: "30% OFF", img: "assets/cards/card1.jpg" },
  { title: "किशोर संग्रह",     off: "40% OFF", img: "assets/cards/card2.jpg" },
  { title: "क्लासिक साहित्य",  off: "20% OFF", img: "assets/cards/card3.jpg" },
  { title: "आरामदायक पठन",     off: "45% OFF", img: "assets/cards/card4.jpg" },
  { title: "पारिवारिक चुनाव",  off: "40% OFF", img: "assets/cards/card5.jpg" },
  { title: "विरासत लेखन",      off: "30% OFF", img: "assets/cards/card6.jpg" },
  { title: "पुस्तकालय संग्रह", off: "15% OFF", img: "assets/cards/card7.jpg" },
  { title: "युवा लेखिका सेट",  off: "30% OFF", img: "assets/cards/card8.jpg" },
  { title: "प्रेम कहानियाँ",   off: "35% OFF", img: "assets/cards/card9.jpg" },
  { title: "कविता और ग़ज़ल",    off: "25% OFF", img: "assets/cards/card5.jpg" },  // placeholder image (reused) until new artwork arrives
  { title: "यात्रा संस्मरण",     off: "30% OFF", img: "assets/cards/card8.jpg" },  // placeholder image (reused)
  { title: "बच्चों के लिए",      off: "40% OFF", img: "assets/cards/card2.jpg" },  // placeholder image (reused)
];

const grid = document.getElementById("cardGrid");

const diyaIcon = `
<svg class="diya-icon" viewBox="0 0 64 76" width="52" height="62">
  <ellipse class="diya-spark diya-spark-1" cx="14" cy="18" r="1.6"/>
  <ellipse class="diya-spark diya-spark-2" cx="48" cy="14" r="1.3"/>
  <ellipse class="diya-spark diya-spark-3" cx="34" cy="6" r="1.1"/>
  <ellipse class="diya-spark diya-spark-4" cx="22" cy="8" r="1"/>
  <g class="diya-flame-group">
    <path class="diya-flame-outer" d="M32 12C24 24 22 32 27 39C29.5 42.5 34.5 42.5 37 39C42 32 40 24 32 12Z"/>
    <path class="diya-flame-inner" d="M32 24C28 30 27.5 34 30.5 37C31.5 38 32.5 38 33.5 37C36.5 34 36 30 32 24Z"/>
  </g>
  <path class="diya-bowl" d="M6 46C6 46 16 58 32 58C48 58 58 46 58 46C58 46 52 66 32 66C12 66 6 46 6 46Z"/>
  <ellipse class="diya-rim" cx="32" cy="46" rx="26" ry="7"/>
</svg>`;

const sparkleSizes = ["sm", "md", "lg"];

cards.forEach((c, i) => {
  const card = document.createElement("div");
  card.className = "book-card";
  const tl = sparkleSizes[i % 3];
  const tr = sparkleSizes[(i + 1) % 3];
  card.innerHTML = `
    <div class="card-art">
      <img src="${c.img}" alt="${c.title}" loading="lazy">
      <span class="corner-sparkle corner-sparkle--tl corner-sparkle--${tl}">✦</span>
      <span class="corner-sparkle corner-sparkle--tr corner-sparkle--${tr}">✦</span>
    </div>
    <div class="card-body">
      <h3>${c.title}</h3>
      <span class="badge">${c.off} <span class="arrow"><i>→</i></span></span>
      <div class="diya-wrap">${diyaIcon}</div>
    </div>
  `;
  grid.appendChild(card);
});
