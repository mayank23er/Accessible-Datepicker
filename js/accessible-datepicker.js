// accessible-datepicker.js
// Supports: date-only, date-time, date-range, time-only

class AccessibleDatePicker {
  constructor(input, type = 'date', showValidation = false) {
    this.input = input;
    this.type = type;
    this.showValidation = showValidation; 
    this.dialog = null;
    this.startDate = null;
    this.endDate = null;
    this.today = new Date();
    this.startMonthDate = new Date();
    this.endMonthDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
    this.init();
  }

init() {
    this.createDialog();
    this.input.addEventListener('click', () => {
		 if (this.justClosed) return; // Prevent reopen if just closed
      document.querySelectorAll('.datepicker-dialog').forEach(dialog => {
        if (dialog !== this.dialog) dialog.style.display = 'none';
      });
      this.openDialog();
    });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openDialog(); // Open dialog on Enter/Space
      } else if (e.key === 'Escape') {
        this.closeDialog();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDialog();
      }
    });
	// outside-click logic
  document.addEventListener('pointerdown', (event) => {
  if (
    this.dialog.style.display === 'block' &&
    !this.dialog.contains(event.target) &&
    event.target !== this.input
  ) {
    this.closeDialog();
  }
});
  }

 createDialog() {
    this.dialog = document.createElement('div');
    this.dialog.className = 'datepicker-dialog';
	if (this.type === 'daterange') {
  this.dialog.classList.add('dual');
}
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('aria-modal', 'true');

    const isTime = this.type === 'time';
    const isRange = this.type === 'daterange';
    const isDateTime = this.type === 'datetime';

    const singleCalendarControls = `
      <div class="controls">
        <button class="prev-month" data-target="start" aria-label="Previous Month">←</button>
        <select class="month-select-start" aria-label="Month"></select>
        <select class="year-select-start" aria-label="Year"></select>
        <button class="next-month" data-target="start" aria-label="Next Month">→</button>
      </div>
      <div class="calendar calendar-single" role="grid"></div>`;

    const timeMarkup = isTime || isDateTime ? `
      <div class="time-controls">
        <label>Hour: <select class="hour">${[...Array(12).keys()].map(i => `<option>${String(i + 1).padStart(2, '0')}</option>`).join('')}</select></label>
        <label>Minute: <select class="minute"><option>00</option><option>15</option><option>30</option><option>45</option></select></label>
        <label>AM/PM: <select class="ampm"><option>AM</option><option>PM</option></select></label>
      </div>` : '';

    const calendarMarkup = isTime ? '' : isRange ? `
      <div class="dual-calendar">
        <div class="calendar-section">
		 <h3 class="calendar-heading">From</h3>
          <div class="controls">
            <button class="prev-month" data-target="start" aria-label="Previous Month">←</button>
            <select class="month-select-start" aria-label="Month"></select>
            <select class="year-select-start" aria-label="Year"></select>
            <button class="next-month" data-target="start" aria-label="Next Month">→</button>
          </div>
          <div class="calendar calendar-start" role="grid"></div>
        </div>
        <div class="calendar-section">
		 <h3 class="calendar-heading">To</h3>
          <div class="controls">
            <button class="prev-month" data-target="end" aria-label="Previous Month">←</button>
            <select class="month-select-end" aria-label="Month"></select>
            <select class="year-select-end" aria-label="Year"></select>
            <button class="next-month" data-target="end" aria-label="Next Month">→</button>
          </div>
          <div class="calendar calendar-end" role="grid"></div>
        </div>
      </div>` : `
      <div class="calendar-section">
        ${singleCalendarControls}
      </div>`;

    const validationMessage = this.showValidation ? `<div class="validation-message" role="alert" aria-live="polite" style="color: red; margin-top: 0.5rem; display: none;">Please select a valid ${this.type.replace('datetime', 'date & time')}.</div>` : '';

    this.dialog.innerHTML = `
      <div class="picker-header">Choose ${this.type}</div>
      ${calendarMarkup}
      ${timeMarkup}
      <div class="action-buttons">
        <button class="confirm">Confirm</button>
        <button class="cancel">Cancel</button>
      </div>
      ${validationMessage}
    `;

    document.body.appendChild(this.dialog);
    this.populateMonthYearSelects();
    this.attachEvents();
    this.dialog.style.display = 'none';
  }

  attachEvents() {
    const confirmBtn = this.dialog.querySelector('.confirm');
    const cancelBtn = this.dialog.querySelector('.cancel');
    if (confirmBtn) confirmBtn.onclick = () => this.confirmSelection();
    if (cancelBtn) cancelBtn.onclick = () => this.closeDialog();

    this.dialog.querySelectorAll('.prev-month').forEach(btn => {
      btn.onclick = () => {
        const target = btn.dataset.target;
        if (target === 'start') this.startMonthDate.setMonth(this.startMonthDate.getMonth() - 1);
        else this.endMonthDate.setMonth(this.endMonthDate.getMonth() - 1);
        this.renderAllCalendars();
      };
    });


      this.dialog.querySelectorAll('.next-month').forEach(btn => {
      btn.onclick = () => {
        const target = btn.dataset.target;
        if (target === 'start') this.startMonthDate.setMonth(this.startMonthDate.getMonth() + 1);
        else this.endMonthDate.setMonth(this.endMonthDate.getMonth() + 1);
        this.renderAllCalendars();
      };
    });

  this.dialog.querySelectorAll('select[class^="month-select"], select[class^="year-select"]').forEach(select => {
      select.onchange = () => {
        const isStart = select.classList.contains('month-select-start') || select.classList.contains('year-select-start');
        const monthSelect = this.dialog.querySelector(isStart ? '.month-select-start' : '.month-select-end');
        const yearSelect = this.dialog.querySelector(isStart ? '.year-select-start' : '.year-select-end');
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        const date = new Date(year, month);

        if (isStart) {
          this.startMonthDate = date;
        } else {
          this.endMonthDate = date;
        }

        this.renderAllCalendars();
      };
    });


    if (!this.type.includes('time')) {
      this.populateMonthYearSelects();
      this.renderAllCalendars();
    }
  }

  populateMonthYearSelects() {
    const months = [...Array(12).keys()].map(m => new Date(0, m).toLocaleString('default', { month: 'long' }));
    const years = [...Array(66).keys()].map(i => 1970 + i);

    this.dialog.querySelectorAll('select[class^="month-select"]').forEach(select => {
      select.innerHTML = months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    });
    this.dialog.querySelectorAll('select[class^="year-select"]').forEach(select => {
      select.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    });

    const monthStart = this.dialog.querySelector('.month-select-start');
    const yearStart = this.dialog.querySelector('.year-select-start');
    if (monthStart && yearStart) {
      monthStart.value = this.startMonthDate.getMonth();
      yearStart.value = this.startMonthDate.getFullYear();
    }

    const monthEnd = this.dialog.querySelector('.month-select-end');
    const yearEnd = this.dialog.querySelector('.year-select-end');
    if (monthEnd && yearEnd) {
      monthEnd.value = this.endMonthDate.getMonth();
      yearEnd.value = this.endMonthDate.getFullYear();
    }
  }

 renderAllCalendars() {
	 // Ensure dropdowns always reflect the current month/year
		this.populateMonthYearSelects();
    if (this.type === 'daterange') {
      this.renderCalendar(this.dialog.querySelector('.calendar-start'), this.startMonthDate);
      this.renderCalendar(this.dialog.querySelector('.calendar-end'), this.endMonthDate);
    } else {
      this.renderCalendar(this.dialog.querySelector('.calendar-single'), this.startMonthDate);
    }
  }

  renderCalendar(container, refDate) {
    if (!container) return;

    container.innerHTML = '';
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = day;
      container.appendChild(label);
    });

    for (let i = 0; i < firstDay; i++) container.appendChild(document.createElement('div'));

    for (let d = 1; d <= daysInMonth; d++) {
      const btn = document.createElement('button');
      btn.textContent = d;
      btn.setAttribute('tabindex', '0');
      const date = new Date(year, month, d);
	  const weekday = date.getDay();
      if (weekday === 0 || weekday === 6) {
         btn.classList.add('weekend'); // Highlight weekends
      }


      if (this.isToday(date)) btn.setAttribute('aria-current', 'date');
      if (this.startDate && date.toDateString() === this.startDate.toDateString()) btn.classList.add('range-start');
      if (this.endDate && date.toDateString() === this.endDate.toDateString()) btn.classList.add('range-end');
      if (this.startDate && this.endDate && date > this.startDate && date < this.endDate) btn.classList.add('range-between');

      btn.onclick = () => {
  if (this.type === 'daterange') {
    const statusEl = this.dialog.querySelector('.range-status');

    // If no startDate or both dates already selected, begin a new selection
    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = date;
      this.endDate = null;
      this.renderAllCalendars();

      // Optional: Update ARIA status message
      if (statusEl) {
        statusEl.textContent = 'Now select the end date.';
      }

      // Move focus to the "To" calendar for accessibility
      setTimeout(() => {
        this.dialog.querySelector('.calendar-end')?.querySelector('button')?.focus();
      }, 10);
    } else {
      // Second click - determine proper range
      if (date >= this.startDate) {
        this.endDate = date;
      } else {
        // User selected an earlier date for "To" — swap
        this.endDate = this.startDate;
        this.startDate = date;
      }

      this.renderAllCalendars();

      // Optional: Clear ARIA status message
      if (statusEl) {
        statusEl.textContent = '';
      }

      // Confirm only when both dates are selected
      this.confirmSelection();
    }
  } else {
    // For non-daterange types (date, datetime, time)
    this.startDate = date;
    this.confirmSelection();
  }
};


      btn.onkeydown = (e) => this.handleArrowNav(e, date, container, refDate);
      container.appendChild(btn);
    }
    setTimeout(() => {
  const todayBtn = [...container.querySelectorAll('button')].find(
    b => b.getAttribute('aria-current') === 'date'
  );
  const fallbackBtn = [...container.querySelectorAll('button')].find(
    b => !isNaN(parseInt(b.textContent))
  );
  if (todayBtn) {
    todayBtn.focus();
  } else if (fallbackBtn) {
    fallbackBtn.focus();
  }
}, 0);
  }

  isToday(date) {
    return date.toDateString() === this.today.toDateString();
  }

  handleArrowNav(e, date, container, refDate) {
    let newDate = new Date(date);
    if (e.key === 'ArrowRight') newDate.setDate(date.getDate() + 1);
    else if (e.key === 'ArrowLeft') newDate.setDate(date.getDate() - 1);
    else if (e.key === 'ArrowDown') newDate.setDate(date.getDate() + 7);
    else if (e.key === 'ArrowUp') newDate.setDate(date.getDate() - 7);
    else return;

    refDate.setFullYear(newDate.getFullYear());
    refDate.setMonth(newDate.getMonth());
    this.renderAllCalendars();

    setTimeout(() => {
      const allBtns = container.closest('.calendar').querySelectorAll('button');
      [...allBtns].find(b => parseInt(b.textContent) === newDate.getDate())?.focus();
    }, 10);
    e.preventDefault();
  }

  confirmSelection() {
    let result = '';
    const validationEl = this.dialog.querySelector('.validation-message');

    //accept single date in the date range
    // if (this.type === 'daterange' && this.startDate && this.endDate) {
    //   result = `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
    // } else if (this.startDate) {
    //   result = this.startDate.toLocaleDateString();
    // }
 // Handle daterange: require both start and end dates
    if (this.type === 'daterange') {
      if (this.startDate && this.endDate) {
        result = `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
      } else {
        if (this.showValidation && validationEl) validationEl.style.display = 'block';
        return;
      }
    } // Handle date and datetime: date must be selected
  else if (this.type === 'date' || this.type === 'datetime') {
    if (!this.startDate) {
      if (this.showValidation && validationEl) validationEl.style.display = 'block';
      return;
    }
    result = this.startDate.toLocaleDateString();
  }

    if (this.type.includes('time')) {
      const hour = parseInt(this.dialog.querySelector('.hour').value);
      const minute = parseInt(this.dialog.querySelector('.minute').value);
      const ampm = this.dialog.querySelector('.ampm').value;
      const hr24 = ampm === 'PM' ? (hour % 12) + 12 : hour % 12;
      const now = new Date();
      now.setHours(hr24);
      now.setMinutes(minute);
      now.setSeconds(0);
      now.setMilliseconds(0);
      this.startDate = now;

      result = this.type === 'time'
        ? this.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : result + ' ' + this.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (!result) {
      if (this.showValidation && validationEl) {
        validationEl.style.display = 'block';
      }
      return;
    }

    this.input.value = result;
    if (validationEl) validationEl.style.display = 'none';
    this.closeDialog();
  }

   closeDialog() {
    this.dialog.style.display = 'none';
    this.input.setAttribute('aria-expanded', 'false');
	
  //  Prevent immediate reopen
	this.justClosed = true;
	setTimeout(() => {
    this.justClosed = false;
  }, 200); // 200ms is enough
  }

  openDialog() {
    const rect = this.input.getBoundingClientRect();
    const dialogHeight = this.dialog.offsetHeight || 360;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.dialog.classList.remove('above');
    const shouldShowAbove = spaceAbove > dialogHeight && spaceBelow < dialogHeight;

    this.dialog.style.display = 'block';
    this.dialog.style.position = 'absolute';
    this.dialog.style.left = `${rect.left + window.pageXOffset}px`;

    if (shouldShowAbove) {
      this.dialog.style.top = 'auto';
      this.dialog.style.bottom = `${window.innerHeight - rect.top + window.pageYOffset}px`;
      this.dialog.classList.add('above');
    } else {
      this.dialog.style.top = `${rect.bottom + window.pageYOffset}px`;
      this.dialog.style.bottom = 'auto';
    }

    this.renderAllCalendars();

    if (this.type === 'daterange') {
      setTimeout(() => {
        const firstBtn = this.dialog.querySelector('.calendar-start button');
        if (firstBtn) firstBtn.focus();
      }, 0);
    }
  }
}

['dateOnly', 'dateTime', 'dateRange', 'timeOnly'].forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    const type = id === 'dateOnly' ? 'date' :
                 id === 'dateTime' ? 'datetime' :
                 id === 'timeOnly' ? 'time' : 'daterange';
    new AccessibleDatePicker(input, type, true);
  }
});