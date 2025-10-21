// ========================
// Dynamic Quote Generator
// ========================

let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Load quotes and selected category from localStorage
if (localStorage.getItem("quotes")) quotes = JSON.parse(localStorage.getItem("quotes"));
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

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
function displayRandomQuote() {
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

// ========================
// Add Quote Form & Logic
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

  form.append(textInput, categoryInput, addButton);
  document.body.appendChild(form);
}

async function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);            // Add to array
  saveQuotes();                      // Update localStorage
  populateCategories();              // Update category dropdown
  displayRandomQuote();              // Update DOM
  showNotification("Quote added successfully!");

  // Post new quote to server
  await postQuoteToServer(newQuote);

  document.getElementById("quoteText").value = "";
  document.getElementById("quoteCategory").value = "";
}

// ========================
// Populate Categories
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

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  saveSelectedCategory();
  displayRandomQuote();
}

// ========================
// Server Sync Functions
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
  } catch (err) {
    console.error("Error syncing quotes:", err);
    showNotification("Error syncing quotes from server.");
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote posted to server:", quote);
  } catch (err) {
    console.error("Error posting quote:", err);
  }
}

// ========================
// Periodic Sync
// ========================
setInterval(syncQuotes, 60000); // Sync every 60 seconds

// ========================
// Initialize App
// ========================
createAddQuoteForm();
populateCategories();
displayRandomQuote();

if (newQuoteBtn) newQuoteBtn.addEventListener("click", displayRandomQuote);
if (categoryFilter) categoryFilter.addEventListener("change", filterQuotes);
