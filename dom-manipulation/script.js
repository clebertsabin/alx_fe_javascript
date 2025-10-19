// ===== Quotes Array =====
let quotes = [
  { text: "Believe in yourself.", category: "Motivation" },
  { text: "Work hard, stay humble.", category: "Success" },
];

// ===== Local Storage =====
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) quotes = JSON.parse(stored);
}

// ===== Display Random Quote =====
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById('quoteDisplay').textContent = "No quotes available!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById('quoteDisplay').textContent = `"${quote.text}" — (${quote.category})`;
}

// ===== Add New Quote =====
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert('Please fill both fields');
    return;
  }

  quotes.push({ text, category });
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  saveQuotes();
  populateCategories();
  filterQuotes();
}

// ===== Category Filter =====
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const dropdown = document.getElementById('categoryFilter');
  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });
}

function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);

  const display = document.getElementById('quoteDisplay');
  display.innerHTML = filtered.map(q => `"${q.text}" — (${q.category})`).join('<br>');

  // Save last selected category
  localStorage.setItem('lastFilter', selected);
}

// ===== JSON Export/Import =====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(event.target.files[0]);
}

// ===== Simulated Server Sync =====
async function syncQuotesWithServer() {
  try {
    const serverQuotes = await fetch('https://jsonplaceholder.typicode.com/posts')
      .then(res => res.json());
    const newQuotes = serverQuotes.map(q => ({ text: q.title, category: "Server" }));
    quotes = [...quotes, ...newQuotes];
    saveQuotes();
    populateCategories();
    filterQuotes();
    console.log("Synced with server");
  } catch (err) {
    console.error("Server sync failed:", err);
  }
}
setInterval(syncQuotesWithServer, 60000); // every 60 seconds

// ===== Event Listeners =====
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// ===== Initialization =====
window.onload = () => {
  loadQuotes();
  populateCategories();
  const lastFilter = localStorage.getItem('lastFilter') || 'all';
  document.getElementById('categoryFilter').value = lastFilter;
  filterQuotes();
};
