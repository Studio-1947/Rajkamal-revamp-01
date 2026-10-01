const authorsData = [
  { name: "Anuradha Beniwal", category: "Contemporary", books: 12 },
  { name: "Krishna Sobti", category: "Classic", books: 24 },
  { name: "Mahadevi Verma", category: "Classic", books: 18 },
  { name: "Nirmal Verma", category: "Classic", books: 15 },
  { name: "Gulzar", category: "Poetry", books: 30 },
  { name: "Gyan Chaturvedi", category: "Satire", books: 8 },
  { name: "Mridula Garg", category: "Contemporary", books: 11 },
  { name: "Harishankar Parsai", category: "Satire", books: 22 },
  { name: "Rahul Sankrityayan", category: "Travelogue", books: 19 },
  { name: "Kanta Bharti", category: "Contemporary", books: 4 },
  { name: "Usha Priyamvada", category: "Classic", books: 9 },
  { name: "Jostein Gaarder", category: "Translated", books: 2 },
  { name: "Kailash Wankhede", category: "Contemporary", books: 3 },
  { name: "Tarun Bhatnagar", category: "Historical", books: 5 },
  { name: "Sudhir Chandra", category: "Memoirs", books: 4 },
  { name: "Surjit Patar", category: "Poetry", books: 7 }
];

let currentCat = "All";

function renderAuthors() {
  const root = document.getElementById("authors-root");
  if (!root) return;

  const categories = ["All", ...new Set(authorsData.map(a => a.category))].sort();

  const filtered = currentCat === "All" ? authorsData : authorsData.filter(a => a.category === currentCat);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const navHtml = categories.map(cat => {
    const count = cat === "All" ? authorsData.length : authorsData.filter(a => a.category === cat).length;
    const active = cat === currentCat ? 'is-on' : '';
    return `<li><button class="auth-nav ${active}" onclick="window.setCat('${cat}')">
      ${cat}
      <span class="auth-nav__count">${count}</span>
    </button></li>`;
  }).join('');

  const listHtml = filtered.map((a, i) => `
    <a href="../author/index.html?name=${encodeURIComponent(a.name)}" class="auth-card" style="animation-delay: ${i * 0.05}s">
      <div class="auth-avatar">${getInitials(a.name)}</div>
      <h3>${a.name}</h3>
      <p>${a.books} books</p>
    </a>
  `).join('');

  root.innerHTML = `
    <div class="auth-head">
      <div class="auth-hello">
        <h1>Authors</h1>
        <p>Discover our brilliant minds and their creations.</p>
      </div>
    </div>
    <div class="auth-grid">
      <aside class="auth-side">
        <ul>${navHtml}</ul>
      </aside>
      <div class="auth-main">
        <div class="auth-list">
          ${listHtml || '<div class="auth-empty">No authors found.</div>'}
        </div>
      </div>
    </div>
  `;
}

window.setCat = function(cat) {
  currentCat = cat;
  renderAuthors();
};

document.addEventListener("DOMContentLoaded", renderAuthors);
