const Timetable = {
  generate() {
    const subjects = State.getSubjects();
    const settings = State.getSettings();
    const container = document.getElementById("scheduleDays"); // Keeping direct access for performance or use UI helper

    UI.clearTimetable();
    UI.showTimetable();

    // Reset export events
    const newEvents = []; 

    // Calculation constants
    const sessionsPerDay = Math.floor((settings.dailyHours * 60) / (settings.studyMinutes + (settings.breakMinutes / 2)));
    let stats = { days: 0, sessions: 0, breaks: 0 };
    
    // Date Setup
    const today = Utils.normalizeDate(new Date());
    const examDates = subjects.map(s => Utils.normalizeDate(s.examDate));
    const lastStudyDay = new Date(Math.max(...examDates));
    lastStudyDay.setDate(lastStudyDay.getDate() - 1);

    let poolIndex = 0;

    // --- MAIN LOOP ---
    for (let day = new Date(today); day <= lastStudyDay; day.setDate(day.getDate() + 1)) {
      
      // Filter subjects with exams AFTER current day
      let activeSubjects = subjects.filter(s => Utils.normalizeDate(s.examDate) > day);
      if (activeSubjects.length === 0) continue;

      // AI Logic: Sort by Urgency
      activeSubjects.sort((a, b) => {
        const daysA = (Utils.normalizeDate(a.examDate) - day) / (1000 * 60 * 60 * 24);
        const daysB = (Utils.normalizeDate(b.examDate) - day) / (1000 * 60 * 60 * 24);
        const scoreA = (this.getWeight(a.difficulty) * 10) - daysA;
        const scoreB = (this.getWeight(b.difficulty) * 10) - daysB;
        return scoreB - scoreA;
      });

      // Create Day Pool
      let dayPool = this.createPool(activeSubjects);

      // Render Day & Collect Events
      const dayEvents = this.renderDay(dayPool, new Date(day), sessionsPerDay, poolIndex, settings);
      newEvents.push(...dayEvents);
      
      poolIndex = (poolIndex + 1) % dayPool.length;

      // Update Stats
      stats.days++;
      stats.sessions += sessionsPerDay;
      stats.breaks += (sessionsPerDay - 1) * settings.breakMinutes;
    }

    State.setGeneratedEvents(newEvents);
    
    // Final Summary Update
    const earliest = new Date(Math.min(...examDates));
    const latest = new Date(Math.max(...examDates));
    const dateRangeStr = stats.days > 0 
      ? `${earliest.toDateString().slice(4, 10)} - ${latest.toDateString().slice(4, 10)}, ${latest.getFullYear()}`
      : "No study days required";

    UI.updateSummary({
      ...stats,
      dailyHours: settings.dailyHours,
      dateRange: dateRangeStr
    });
  },

  getWeight(difficulty) {
    switch (difficulty) {
      case 'hard': return 3;
      case 'medium': return 2;
      case 'easy': return 1;
      default: return 2;
    }
  },

  createPool(subjects) {
    if (subjects.length === 1) return [subjects[0]];
    if (subjects.length === 2) return [subjects[0], subjects[1], subjects[0]];
    return [subjects[0], subjects[1], subjects[0], subjects[2]];
  },

  renderDay(pool, date, sessionCount, startIndex, settings) {
    const dayBlock = document.createElement("div");
    dayBlock.className = "day";
    
    const header = document.createElement("div");
    header.className = "day-header";
    header.textContent = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    dayBlock.appendChild(header);

    let currentMinutes = settings.startTimeMinutes;
    let dayEvents = [];

    for (let i = 0; i < sessionCount; i++) {
      const subject = pool[(startIndex + i) % pool.length];
      
      // Render Session
      dayBlock.appendChild(this.createSessionHTML(subject.name, currentMinutes));
      
      // Store Event Data
      const startObj = new Date(date);
      startObj.setHours(Math.floor(currentMinutes/60), currentMinutes%60);
      
      const endMinutes = currentMinutes + settings.studyMinutes;
      const endObj = new Date(date);
      endObj.setHours(Math.floor(endMinutes/60), endMinutes%60);

      dayEvents.push({ subject: subject.name, start: startObj, end: endObj });

      currentMinutes += settings.studyMinutes;

      // Render Break
      if (i < sessionCount - 1) {
        dayBlock.appendChild(this.createBreakHTML(currentMinutes));
        currentMinutes += settings.breakMinutes;
      }
    }

    UI.addDayBlock(dayBlock);
    return dayEvents;
  },

  createSessionHTML(title, start) {
    const div = document.createElement("div");
    div.className = "session";
    div.style.borderLeft = "4px solid #6366f1"; 
    div.innerHTML = `<span>${title}</span><span>45 min</span><span>${Utils.formatTime(start)}</span>`;
    return div;
  },

  createBreakHTML(start) {
    const div = document.createElement("div");
    div.className = "session break";
    div.innerHTML = `<span>Break</span><span>15 min</span><span>${Utils.formatTime(start)}</span>`;
    return div;
  }
};