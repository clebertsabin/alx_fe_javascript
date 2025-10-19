// Array to store quotes
let quotes = [];

// Load quotes from localStorage
if (localStorage.getItem('quotes')) {
    quotes = JSON.parse(localStorage.getItem('quotes'));
}

// Last selected category
let lastCategory = localStorage.getItem('lastCategory') || 'all';

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

// Function to save quotes
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show random quote
function showRandomQuote() {
    let filteredQuotes = filterByCategory(lastCategory);
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" - (${filteredQuotes[randomIndex].category})`;
}

// Add new quote
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    if (text && category) {
        quotes.push({ text, category });
        saveQuotes();
        populateCategories();
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('Quote added successfully!');
    } else {
        alert('Please enter both quote and category.');
    }
}

// Populate categories dynamically
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === lastCategory) option.selected = true;
        categoryFilter.appendChild(option);
    });
}

// Filter quotes by category
function filterQuotes() {
    lastCategory = categoryFilter.value;
    localStorage.setItem('lastCategory', lastCategory);
    showRandomQuote();
}

// Helper to filter quotes
function filterByCategory(category) {
    if (category === 'all') return quotes;
    return quotes.filter(q => q.category === category);
}

// Export to JSON
function exportToJson() {
    const blob = new Blob([JSON.stringify(quotes)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import from JSON
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Simulate server sync every 60 seconds
setInterval(() => {
    console.log("Simulating server sync...");
    // Example: server data overwrites local if conflicts
    // For demo, we just log here
}, 60000);

// Initial setup
populateCategories();
showRandomQuote();
newQuoteBtn.addEventListener('click', showRandomQuote);
