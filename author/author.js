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

// Mock books based on author name length for variety
const generateMockBooks = (authorName) => {
    const seed = authorName.length;
    const count = (seed % 4) + 3; // 3 to 6 books
    const books = [];
    for(let i = 1; i <= count; i++) {
        // Just use random valid book cover numbers to avoid missing images if possible
        const imgNum = (seed + i) % 17 + 1; // Assuming we have b1 to b17 in home-data.js 
        books.push({
            title: `${authorName.split(' ')[0]}'s Work Part ${i}`,
            category: "Literature",
            price: 299 - (i * 10),
            mrp: 399 - (i * 10),
            img: `../img/banners/b${imgNum}.jpg` 
        });
    }
    return books;
};

function renderAuthor() {
    const root = document.getElementById("author-root");
    if (!root) return;

    // Get author name from URL query param, e.g. ?name=Gulzar
    const urlParams = new URLSearchParams(window.location.search);
    const authorName = urlParams.get('name') || "Anuradha Beniwal"; // fallback
    const author = authorsData.find(a => a.name === authorName) || authorsData[0];
    
    // Set page title dynamically
    document.title = `${author.name} | Rajkamal Prakashan Samuh`;

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const books = generateMockBooks(author.name);
    
    // We link the book to the product page
    const booksHtml = books.map((b, i) => `
        <a href="../books/product/index.html" class="ap-book" style="animation-delay: ${(i * 0.05) + 0.2}s">
            <!-- For fallback if img doesn't exist, we use a simple inline style fallback -->
            <img src="${b.img}" alt="${b.title}" loading="lazy" onerror="this.onerror=null; this.src='../kt/assets/logo/rkp-favicon.svg'; this.style.padding='20px'; this.style.background='#efe3d3';">
            <div class="ap-book__info">
                <span class="ap-book__cat">${b.category}</span>
                <h3 class="ap-book__title">${b.title}</h3>
                <div class="ap-book__price">
                    <strong>₹${b.price}</strong>
                    <s>₹${b.mrp}</s>
                </div>
            </div>
        </a>
    `).join('');

    root.innerHTML = `
        <div class="author-profile">
            <nav class="ap-breadcrumb" aria-label="Breadcrumb">
                <a href="../home/">Home</a> <span>/</span> 
                <a href="../authors/">Authors</a> <span>/</span> 
                <strong>${author.name}</strong>
            </nav>
            <div class="ap-head">
                <div class="ap-avatar">${getInitials(author.name)}</div>
                <div class="ap-info">
                    <span class="ap-tag">${author.category}</span>
                    <h1>${author.name}</h1>
                    <p>
                        ${author.name} is a celebrated author in the world of Hindi literature. 
                        Their works have deeply influenced modern thought and continue to inspire generations. 
                        With a collection of over ${author.books} critically acclaimed publications, 
                        they are a cornerstone of the Rajkamal Prakashan family.
                    </p>
                </div>
            </div>
            
            <div class="ap-body">
                <h2 class="ap-section-title">Books by ${author.name.split(' ')[0]}</h2>
                <div class="ap-books">
                    ${booksHtml}
                </div>
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", renderAuthor);
