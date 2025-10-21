// ========================
// Dynamic Quote Generator
// ========================

// Initial quotes
let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Load quotes from localStorage
if (localStorage.getItem("quotes")) quotes = JSON.parse(localStorage.getItem("quotes"));

// Load last selected category
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// ========================
// Utility Functions
// ========================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveSelectedCategory() {
  localStorage.setItem("selectedCategory", selectedCategory);
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.background = "#4caf50";
  notification.style.color = "#fff";
  notification.style.padding = "10px 20px";
  notification.style.borderRadius = "5px";
  notification.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  notification.style.zIndex = "1000";
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ========================
// Display Random Quote
// ========================
function showRandomQuote() {
  const filtered = selectedCategory === "all" 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" - (${randomQuote.category})`;
}
window.showRandomQuote = showRandomQuote;

// ========================
// Add Quote Logic
// ========================
async function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();
  showNotification("Quote added successfully!");

  // Post to server (simulation)
  await postQuoteToServer(newQuote);

  newQuoteText.value = "";
  newQuoteCategory.value = "";
}
window.addQuote = addQuote;

// ========================
// Populate Categories & Filter
// ========================
function populateCategories() {
  if (!categoryFilter) return;
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}
window.populateCategories = populateCategories;

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  saveSelectedCategory();
  showRandomQuote();
}
window.filterQuotes = filterQuotes;

// ========================
// JSON Import & Export
// ========================
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}
window.exportToJson = exportToJson;

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showNotification("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
window.importFromJsonFile = importFromJsonFile;

// ========================
// Server Sync
// ========================
async function syncQuotes() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    const data = await res.json();

    const serverQuotes = data.map(item => ({ text: item.title, category: "Server" }));
    let added = 0;
    serverQuotes.forEach(sq => {
      if (!quotes.some(q => q.text === sq.text)) {
        quotes.push(sq);
        added++;
      }
    });

    if (added > 0) {
      saveQuotes();
      populateCategories();
      showNotification(`${added} new quote(s) synced from server!`);
    }
  } catch {
    showNotification("Error syncing quotes from server.");
  }
}
window.syncQuotes = syncQuotes;

// Post quote to server simulation
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (err) {
    console.error("Error posting quote:", err);
  }
}

// ========================
// Periodic Sync
// ========================
setInterval(syncQuotes, 60000);

// ========================
// Initialize App
// ========================
populateCategories();
showRandomQuote();

if (newQuoteBtn) newQuoteBtn.addEventListener("click", showRandomQuote);
if (categoryFilter) categoryFilter.addEventListener("change", filterQuotes);
