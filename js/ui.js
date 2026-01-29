const UI = {
  // Cache DOM elements that are used frequently
  elements: {
    hoursRange: document.getElementById("hoursRange"),
    hoursValue: document.getElementById("hoursValue"),
    subjectName: document.getElementById("subjectName"),
    examDate: document.getElementById("examDate"),
    difficulty: document.getElementById("difficulty"),
    subjectList: document.getElementById("subjectList"),
    subjectCount: document.getElementById("subjectCount"),
    startTime: document.getElementById("startTime"),
    loading: document.getElementById("loading"),
    finalTimetable: document.getElementById("finalTimetable"),
    scheduleDays: document.getElementById("scheduleDays"),
    stats: {
      days: document.getElementById("studyDays"),
      hours: document.getElementById("dailyHoursStat"),
      sessions: document.getElementById("totalSessions"),
      breaks: document.getElementById("breakTime"),
      range: document.getElementById("dateRange")
    }
  },

  init() {
    // Bind slider input to text display
    this.elements.hoursRange.addEventListener("input", (e) => {
      this.elements.hoursValue.textContent = e.target.value;
    });
  },

  getSubjectInput() {
    return {
      name: this.elements.subjectName.value.trim(),
      examDate: this.elements.examDate.value,
      difficulty: this.elements.difficulty.value
    };
  },

  getSettingsInput() {
    return {
      startTime: this.elements.startTime.value,
      dailyHours: parseInt(this.elements.hoursRange.value)
    };
  },

  clearSubjectInputs() {
    this.elements.subjectName.value = "";
    this.elements.examDate.value = "";
    this.elements.difficulty.value = "medium";
  },

  renderSubjects(subjects) {
    this.elements.subjectList.innerHTML = "";
    
    subjects.forEach((s, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${s.name} (${s.difficulty}) — Exam: ${s.examDate}`;
      this.elements.subjectList.appendChild(li);
    });

    this.elements.subjectCount.textContent = `Total subjects added: ${subjects.length}`;
  },

  showLoading(show) {
    this.elements.loading.classList.toggle("hidden", !show);
    // Hide result while loading
    if(show) this.elements.finalTimetable.classList.add("hidden");
  },

  showTimetable() {
    this.elements.finalTimetable.classList.remove("hidden");
    this.elements.scheduleDays.scrollIntoView({ behavior: 'smooth' });
  },

  clearTimetable() {
    this.elements.scheduleDays.innerHTML = "";
  },

  addDayBlock(dayElement) {
    this.elements.scheduleDays.appendChild(dayElement);
  },

  updateSummary(stats) {
    this.elements.stats.days.textContent = stats.days;
    this.elements.stats.hours.textContent = stats.dailyHours + "h";
    this.elements.stats.sessions.textContent = stats.sessions;
    this.elements.stats.breaks.textContent = stats.breaks + "m";
    this.elements.stats.range.textContent = stats.dateRange;
  }
};