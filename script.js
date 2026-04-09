// Elements
// Save references to the HTML inputs, buttons, displays, and other UI elements.
// These variables are used throughout the script to read user input and update the page.
const salaryInput          = document.getElementById("salary")
const expenseNameInput     = document.getElementById("expenseName")
const expenseAmountInput   = document.getElementById("expenseAmount")
const setSalaryBtn         = document.getElementById("setSalaryBtn")
const addExpenseBtn        = document.getElementById("addExpenseBtn")
const displaySalary        = document.getElementById("displaySalary")
const displayTotalExpenses = document.getElementById("displayTotalExpenses")
const displayBalance       = document.getElementById("displayBalance")
const expenseList          = document.getElementById("expenseList")
const budgetAlert          = document.getElementById("budgetAlert")
const currencySelects      = document.querySelectorAll("[data-currency-select]")
const downloadBtn          = document.getElementById("downloadBtn")
const convertingMsg        = document.getElementById("convertingMsg")

// Data
// Track the current salary, list of expenses, and display settings inside the app.
let salary          = 0
let expenses        = []
let chartInstance   = null
let exchangeRate    = 1
let currentCurrency = "INR"
let currencySymbol  = "₹"

// Currency symbols used for display when switching currencies.
const symbols = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£"
}

// ── Storage ──────────────────────────────────────────
// saveToStorage: Persist the salary and expense list in browser localStorage.
// This allows the user data to survive page refreshes and browser restarts.
function saveToStorage() {
  localStorage.setItem("salary",   JSON.stringify(salary))
  localStorage.setItem("expenses", JSON.stringify(expenses))
}

// loadFromStorage: Read saved data back from localStorage and restore the UI.
// If no data exists yet, the app starts with the default values.
function loadFromStorage() {
  let savedSalary   = localStorage.getItem("salary")
  let savedExpenses = localStorage.getItem("expenses")
  if (savedSalary)   salary   = JSON.parse(savedSalary)
  if (savedExpenses) expenses = JSON.parse(savedExpenses)
  renderExpenses()
  updateBalance()
  updateChart()
}

// ── Balance ───────────────────────────────────────────
// updateBalance: Recalculate totals and refresh the salary, expenses, and balance display.
// Also shows a warning message if the remaining balance falls below 10% of salary.
function updateBalance() {
  let totalExpenses = 0
  for (let i = 0; i < expenses.length; i++) totalExpenses += expenses[i].amount // calculate total expenses

  let balance = salary - totalExpenses // remaining balance 

  // convert for display only
  let displaySal  = (salary * exchangeRate).toFixed(2) // toFixed - formats the number to 2 decimal places and returns a string
  let displayExp  = (totalExpenses * exchangeRate).toFixed(2)
  let displayBal  = (balance * exchangeRate).toFixed(2)

  displaySalary.textContent        = currencySymbol + displaySal // eg $1000.00
  displayTotalExpenses.textContent = currencySymbol + displayExp
  displayBalance.textContent       = currencySymbol + displayBal

  // budget alert: show when balance is less than 10% of salary
  if (salary > 0 && balance < salary * 0.1) { // if true show alert make it red else hide alert and reset color
    budgetAlert.style.display  = "block"
    displayBalance.style.color = "var(--red)"
  } else {
    budgetAlert.style.display  = "none"
    displayBalance.style.color = ""
  }
}

// ── Chart ─────────────────────────────────────────────
// updateChart: Draws or refreshes the pie chart that shows remaining salary vs expenses.
// It destroys the previous chart instance first so the new values render cleanly.
function updateChart() {
  let totalExpenses = 0
  for (let i = 0; i < expenses.length; i++) totalExpenses += expenses[i].amount
  let remaining = salary - totalExpenses

  if (chartInstance) chartInstance.destroy()

  let ctx = document.getElementById("expenseChart").getContext("2d")
  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Remaining", "Expenses"],
      datasets: [{
        data: [
          Math.max((salary - totalExpenses) * exchangeRate, 0),
          totalExpenses * exchangeRate
        ],
        backgroundColor: ["#3d7a5a", "#e07070"],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "DM Sans", size: 12 },
            padding: 16,
            usePointStyle: true
          }
        }
      }
    }
  })
}

// ── Render list ───────────────────────────────────────
// renderExpenses: Build the expense list UI from the current expenses array.
// If there are no expenses, show a friendly empty message instead.
function renderExpenses() {
  expenseList.innerHTML = ""

  if (expenses.length === 0) {
    let empty = document.createElement("li")
    empty.className   = "empty"
    empty.textContent = "No expenses added yet"
    expenseList.appendChild(empty)
    return
  }

  for (let i = 0; i < expenses.length; i++) {
    let li   = document.createElement("li")
    let info = document.createElement("div") // creates new <div>

    info.className = "expense-info"

    // we use div when you want a "box" or a new section; use span when you just want to style text inline
    let name = document.createElement("span")
    name.className   = "expense-name"
    name.textContent = expenses[i].name

    let amt = document.createElement("span")
    amt.className   = "expense-amt"
    amt.textContent = currencySymbol + (expenses[i].amount * exchangeRate).toFixed(2)

    let deleteBtn = document.createElement("button") // creates button tag
    deleteBtn.className   = "delete-btn"
    deleteBtn.textContent = "✕"
    deleteBtn.addEventListener("click", function() { deleteExpense(i) })

    info.appendChild(name)
    info.appendChild(amt)
    li.appendChild(info)
    li.appendChild(deleteBtn)
    expenseList.appendChild(li)
  }
}

// ── Delete ────────────────────────────────────────────
// deleteExpense: Remove a selected expense and refresh the app state.
// This updates storage, the expense list, the balance display, and the chart.
function deleteExpense(index) {
  expenses.splice(index, 1)
  saveToStorage()
  renderExpenses()
  updateBalance()
  updateChart()
}

// renderExpenses() and deleteExpense() come under state management
// change the State (the expenses array) and then trigger a UI Update so the user sees the change immediately.

// ── Currency Converter ────────────────────────────────
// convertCurrency: Switch the displayed currency and fetch conversion rates when needed.
// If the user selects INR, no API call is required because INR is the base currency.
const API = "https://api.frankfurter.dev";

function convertCurrency(toCurrency) {
  if (toCurrency === "INR") {
    exchangeRate = 1
    currentCurrency = "INR"
    currencySymbol = "₹"
    updateUI()
    return
  }

  const path = `/v2/rates?base=INR&quotes=${toCurrency}`

  fetch(API + path)
    .then((response) => response.json())
    .then((data) => {
      if (data && data[0]) {
        exchangeRate = data[0].rate  
        currentCurrency = toCurrency
        currencySymbol = symbols[toCurrency]
        updateUI()
      }
    })
    .catch((err) => {
      console.error("Currency fetch error:", err)
      alert("Could not fetch exchange rate.")
    })
}

// Helper function: updates entire UI in one call (balance, chart, list)
function updateUI() {
  updateBalance()
  updateChart()
  renderExpenses()
}

// ── PDF Export ────────────────────────────────────────
// downloadPDF: Generate a downloadable PDF summary of salary, expenses, and totals.
// Uses jsPDF to build a simple report document on the client side.
function downloadPDF() {
  const jsPDF = window.jspdf?.jsPDF || window.jsPDF

  if (!jsPDF) {
    alert("PDF library not loaded. Check your internet connection.")
    return
  }

  const doc = new jsPDF()
  doc.setCharSpace(0)

  // use Rs. for INR since ₹ is unsupported by jsPDF fonts
  let pdfSymbol = currentCurrency === "INR" ? "Rs." : currencySymbol

  let totalExpenses = 0
  for (let i = 0; i < expenses.length; i++) totalExpenses += expenses[i].amount
  let balance = salary - totalExpenses

  // Title
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("Cash Flow Report", 20, 24)

  // Date + currency
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(140)
  doc.text("Generated: " + new Date().toLocaleDateString(), 20, 33)
  doc.text("Currency: " + currentCurrency, 20, 39)

  // Divider
  doc.setDrawColor(220)
  doc.line(20, 44, 190, 44)

  // Salary
  doc.setFontSize(13)
  doc.setTextColor(0)
  doc.setFont("helvetica", "bold")
  doc.text("Salary", 20, 55)
  doc.setFont("helvetica", "normal")
  doc.text(pdfSymbol + (salary * exchangeRate).toFixed(2), 100, 55)

  // Expenses heading
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100)
  doc.text("EXPENSES", 20, 70)

  // Each expense
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0)
  let y = 80

  if (expenses.length === 0) {
    doc.setTextColor(160)
    doc.text("No expenses added.", 25, y)
    y += 10
  } else {
    for (let i = 0; i < expenses.length; i++) {
      doc.setTextColor(40)
      doc.text(expenses[i].name, 25, y)
      doc.setTextColor(0)
      doc.text(pdfSymbol + (expenses[i].amount * exchangeRate).toFixed(2), 100, y)
      y += 10
      if (y > 270) { doc.addPage(); y = 20 }
    }
  }

  // Totals
  y += 4
  doc.setDrawColor(200)
  doc.line(20, y, 190, y)
  y += 12

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(180, 60, 60)
  doc.text("Total Expenses", 20, y)
  doc.text(pdfSymbol + (totalExpenses * exchangeRate).toFixed(2), 100, y)
  y += 10

  doc.setTextColor(61, 122, 90)
  doc.text("Remaining Balance", 20, y)
  doc.text(pdfSymbol + (balance * exchangeRate).toFixed(2), 100, y)

  doc.save("cashflow-report.pdf")
}

// ── Event Listeners ───────────────────────────────────
// Attach event handlers for the UI buttons and currency selector.
// These listeners respond to user input and keep the page in sync.

setSalaryBtn.addEventListener("click", function() {
  salary = parseFloat(salaryInput.value)
  if (isNaN(salary) || salary <= 0) { alert("Please enter a valid salary"); return }
  salaryInput.value = ""
  saveToStorage()
  updateBalance()
  updateChart()
})

// Handle adding a new expense: validate input, store it, and update UI
addExpenseBtn.addEventListener("click", function() {
  let name   = expenseNameInput.value.trim()
  let amount = parseFloat(expenseAmountInput.value)
  if (name === "" || isNaN(amount) || amount <= 0) { alert("Please enter a valid expense name and amount"); return }
  expenses.push({ name, amount })
  expenseNameInput.value   = ""
  expenseAmountInput.value = ""
  saveToStorage()
  renderExpenses()
  updateBalance()
  updateChart()
})

// Handle currency changes across multiple dropdowns
currencySelects.forEach(select => {
  select.addEventListener("change", function() {
    convertCurrency(this.value)
  })
})

// Handle PDF download
downloadBtn.addEventListener("click", downloadPDF)

// ── Init ──────────────────────────────────────────────
// Start the app by restoring saved data and rendering the initial state.
loadFromStorage()