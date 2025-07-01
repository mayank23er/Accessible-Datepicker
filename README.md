# Accessible Datepicker

A custom JavaScript Accessible Datepicker component that supports four input types:
- 📅 **Date only**
- 🕒 **Time only**
- 📅🕒 **Date and Time**
- 🔁 **Date range** selection (start and end)

This component is built with **keyboard accessibility** and **WCAG 2.2 AA** compliance in mind. It is lightweight, extendable, and has zero dependencies.

---

## 🚀 Features

- Supports multiple modes: `date`, `datetime`, `time`, and `daterange`
- Fully accessible keyboard navigation
- WCAG 2.2 AA compliant
- Built-in validation (optional)
- Lightweight and dependency-free

---

## 📦 Installation

Include the CSS and JS in your HTML:

```html
<link rel="stylesheet" href="accessible-datepicker.css">
<script src="accessible-datepicker.js"></script>
```

Add input elements with the following IDs:

```html
<label for="dateOnly">Date Only</label>
<input id="dateOnly" type="text" readonly>

<label for="dateTime">Date & Time Picker</label>
<input id="dateTime" type="text" readonly>

<label for="dateRange">Date Range Picker</label>
<input id="dateRange" type="text" readonly>

<label for="timeOnly">Time Only</label>
<input id="timeOnly" type="text" readonly>
```

---

## 🧠 Usage

The script automatically instantiates the pickers on page load for inputs with the following IDs:

- `dateOnly` → `"date"`
- `dateTime` → `"datetime"`
- `dateRange` → `"daterange"`
- `timeOnly` → `"time"`

If you want to manually initialize a picker (e.g., for dynamically injected inputs):

```js
new AccessibleDatePicker(document.getElementById('myInput'), 'datetime', true);
```

The third parameter (`true`) enables validation message if selection is incomplete.

---

## ♿ Accessibility

- Full keyboard navigation using arrow keys, Tab, Enter, and Escape
- ARIA roles and attributes included for screen reader compatibility
- Visually accessible styles and focus states

---

## 📁 File Structure

- `accessible-datepicker.js` — Main logic
- `accessible-datepicker.css` — Optional styling (not included here)
- `index.html` — Sample usage

---

## 📜 License

MIT © 2025 — Accessible UI Team