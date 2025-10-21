// ========================
// Dynamic Quote Generator
// ========================

// Initialize quotes
let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Load quotes from localStorage
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
}

// Load last selected category or default to 'all'
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// ========================
// Utility functions
// ========================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveSelectedCategory() {
  localStorage.setItem("selectedCategory", selectedCategory);
}

// ========================
// Display & Filtering Logic
// ========================
function displayRandomQuote() {
  if (!quoteDisplay) return;
  
  const filteredQuotes = selectedCategory === "all" 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  
  // Save last viewed quote to session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
  
  quoteDisplay.textContent = `"${quote.text}" - (${quote.category})`;
}

// ========================
// Add New Quote Form
// ========================
function createAddQuoteForm() {
  const form = document.createElement("form");
  form.id = "addQuoteForm";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "quoteText";
  textInput.placeholder = "Enter quote text";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "quoteCategory";
  categoryInput.placeholder = "Enter category";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);

  document.body.appendChild(form);
}

// ========================
// Add Quote Function
// ========================
async function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };

    // Add locally
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    displayRandomQuote();

    // Post to server
    await postQuoteToServer(newQuote);

    document.getElementById("quoteText").value = "";
    document.getElementById("quoteCategory").value = "";
    showNotification("Quote added successfully!");
  } else {
    alert("Please fill in both fields.");
  }
}

// ========================
// Populate Categories
// ========================
function populateCategories() {
  if (!categoryFilter) return;
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = "";

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// ========================
// Filter Quotes Function
// ========================
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  saveSelectedCategory();
  displayRandomQuote();
}

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

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      
      // Validate imported data structure
      if (!Array.isArray(importedQuotes) || !importedQuotes.every(q => q.text && q.category)) {
        throw new Error('Invalid quote format in imported file');
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showNotification("Quotes imported successfully!");
    } catch (error) {
      showNotification("Error importing quotes: " + error.message, "error");
    }
  };
  fileReader.onerror = () => showNotification("Error reading file", "error");
  fileReader.readAsText(event.target.files[0]);
}

// ========================
// Server Interaction
// ========================
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    if (!response.ok) throw new Error('Server response was not ok');
    const data = await response.json();

    const serverQuotes = data.map((item) => ({
      text: item.title,
      category: "Server"
    }));

    // Enhanced conflict resolution
    let newQuotesCount = 0;
    for (const sq of serverQuotes) {
      const existingQuote = quotes.find(q => q.text === sq.text);
      if (existingQuote) {
        const resolvedQuote = await resolveConflict(sq, existingQuote);
        if (resolvedQuote !== existingQuote) {
          Object.assign(existingQuote, resolvedQuote);
          newQuotesCount++;
        }
      } else {
        quotes.push(sq);
        newQuotesCount++;
      }
    }

    if (newQuotesCount > 0) {
      saveQuotes();
      populateCategories();
      showNotification(`${newQuotesCount} quote(s) synced from server!`);
    }
  } catch (error) {
    console.error("Error syncing with server:", error);
    showNotification("Error syncing with server: " + error.message, "error");
  }
}

// Post new quote to mock server
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote posted to server:", quote);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// ========================
// UI Notification
// ========================
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.padding = "10px 20px";
  notification.style.borderRadius = "5px";
  notification.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  notification.style.zIndex = "1000";
  
  // Color based on type
  notification.style.background = type === "success" ? "#4caf50" : "#f44336";
  notification.style.color = "#fff";

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ========================
// Periodic Sync
// ========================
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    
    // Compare and merge quotes
    for (const serverQuote of serverQuotes) {
      const localQuote = quotes.find(q => q.text === serverQuote.text);
      if (localQuote) {
        // Handle conflict
        const resolved = await resolveConflict(serverQuote, localQuote);
        Object.assign(localQuote, resolved);
      } else {
        quotes.push(serverQuote);
      }
    }
    
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced successfully!");
  } catch (error) {
    showNotification("Error syncing quotes: " + error.message, "error");
  }
}

// ========================
// Initialize App
// ========================
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  populateCategories();
  displayRandomQuote();

  // Add event listeners
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", displayRandomQuote);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterQuotes);
  }

  // Start periodic sync
  setInterval(syncQuotes, 60000); // Sync every minute
});
