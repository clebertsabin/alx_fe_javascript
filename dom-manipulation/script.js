// script.js
// Dynamic Quote Generator with DOM manipulation, Web Storage, JSON handling, and simulated server sync

// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryFilter = document.getElementById('categoryFilter');
const importFile = document.getElementById('importFile');
const exportBtn = document.getElementById('exportBtn');

let quotes = []; // array of quote objects { text, category }

// --- Utility functions ---

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes array from localStorage
function loadQuotes() {
  const storedQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
  if (Array.isArray(storedQuotes)) {
    quotes = storedQuotes;
  }
}

// Display a quote
function showRandomQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `${filteredQuotes[randomIndex].text} [${filteredQuotes[randomIndex].category}]`;
}

// Populate category filter dropdown dynamically
function populateCategories() {
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem('lastCategory') || 'all';
  categoryFilter.value = lastFilter;
}

// Filter quotes based on selected category
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('lastCategory', selected);
  if (selected === 'all') {
    showRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selected);
    showRandomQuote(filtered);
  }
}

// Add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim() || 'General';
  if (!text) {
    alert("Quote text cannot be empty.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showRandomQuote();
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

// Export quotes to JSON file
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON file.');
      }
    } catch (err) {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Simulated server sync ---
function simulateServerSync() {
  // Mock fetch: simulate server returning new quotes
  const serverQuotes = [
    { text: "Server-synced quote 1", category: "Server" },
    { text: "Server-synced quote 2", category: "Server" }
  ];

  let updated = false;
  serverQuotes.forEach(sq => {
    // Add only if not already in local quotes (simple conflict resolution)
    if (!quotes.some(q => q.text === sq.text && q.category === sq.category)) {
      quotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    showRandomQuote();
    console.log("Quotes synced with server.");
  }
}

// --- Event listeners ---
newQuoteBtn.addEventListener('click', () => showRandomQuote());
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', filterQuotes);
importFile.addEventListener('change', importFromJsonFile);
exportBtn.addEventListener('click', exportQuotes);

// --- Initialization ---
loadQuotes();
populateCategories();
filterQuotes(); // show quote based on last filter

// Start server sync every 60 seconds
setInterval(simulateServerSync, 60000);
