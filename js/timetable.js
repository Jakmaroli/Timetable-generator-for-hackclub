function generateTimetable() {
  if (subjects.length === 0) {
    alert("Add at least one subject!");
    return;
  }

  showLoading(true);
  document.getElementById("scheduleDays").innerHTML = "";

  setTimeout(() => {
    showLoading(false);
    buildFinalTimetable();
  }, 1200);
}

function getSubjectWeight(difficulty) {
  switch (difficulty) {
    case 'hard': return 3;
    case 'medium': return 2;
    case 'easy': return 1;
    default: return 2;
  }
}

function buildFinalTimetable() {
  const container = document.getElementById("scheduleDays");
  showTimetable();

  const dailyHours = Number(hoursRange.value);
  // Calculate how many full study blocks fit in the day
  const sessionsPerDay = Math.floor((dailyHours * 60) / (STUDY_MINUTES + (BREAK_MINUTES / 2)));

  let stats = { days: 0, sessions: 0, breaks: 0 };
  const today = normalizeDate(new Date());
  
  // Find the last exam date
  const examDates = subjects.map(s => normalizeDate(s.examDate));
  const lastStudyDay = new Date(Math.max(...examDates));
  lastStudyDay.setDate(lastStudyDay.getDate() - 1); // Study until the day before the last exam

  let poolIndex = 0;

  // Loop through every day from Today to Last Exam
  for (let day = new Date(today); day <= lastStudyDay; day.setDate(day.getDate() + 1)) {
    
    // 1. Filter: Only subjects that have not had their exam yet
    let activeSubjects = subjects.filter(s => normalizeDate(s.examDate) > day);
    
    if (activeSubjects.length === 0) continue;

    // 2. AI ALGORITHM: Urgency Sort
    // Sort subjects by priority: Closer Date + Higher Difficulty = Higher Priority
    activeSubjects.sort((a, b) => {
      // Days remaining
      const daysA = (normalizeDate(a.examDate) - day) / (1000 * 60 * 60 * 24);
      const daysB = (normalizeDate(b.examDate) - day) / (1000 * 60 * 60 * 24);
      
      // Calculate Score: (Difficulty Weight * 10) - Days Remaining
      // This means a 'Hard' subject (30 pts) with 5 days left = 25 score
      // An 'Easy' subject (10 pts) with 2 days left = 8 score
      const scoreA = (getSubjectWeight(a.difficulty) * 10) - daysA;
      const scoreB = (getSubjectWeight(b.difficulty) * 10) - daysB;
      
      return scoreB - scoreA; // Descending sort (Highest score first)
    });

    // 3. Create a weighted pool for the day based on the sorted list
    // We take the top 3 most urgent subjects and rotate them
    let dayPool = [];
    if (activeSubjects.length === 1) {
      dayPool = [activeSubjects[0]];
    } else if (activeSubjects.length === 2) {
      dayPool = [activeSubjects[0], activeSubjects[1], activeSubjects[0]]; // Bias to #1
    } else {
      // Mix the top 3, but give #1 two slots
      dayPool = [activeSubjects[0], activeSubjects[1], activeSubjects[0], activeSubjects[2]];
    }

    // Render the day
    createDayScheduleMulti(dayPool, day, sessionsPerDay, container, poolIndex);
    
    // Rotate index slightly to prevent monotony
    poolIndex = (poolIndex + 1) % dayPool.length;

    stats.days++;
    stats.sessions += sessionsPerDay;
    stats.breaks += (sessionsPerDay - 1) * BREAK_MINUTES;
  }

  updateSummary(stats, dailyHours, examDates);
}

// --- MISSING FUNCTION ADDED HERE ---
function createDayScheduleMulti(activePool, dayDate, sessionsPerDay, container, startIndex) {
  const dayBlock = document.createElement("div");
  dayBlock.className = "day";

  // Header: "Mon, Oct 12"
  const dateTitle = document.createElement("div");
  dateTitle.className = "day-header";
  dateTitle.textContent = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  dayBlock.appendChild(dateTitle);

  // Use the global start time set by the user
  let currentMinutes = START_TIME_MINUTES;

  for (let i = 0; i < sessionsPerDay; i++) {
    // Pick subject from pool
    const subject = activePool[(startIndex + i) % activePool.length];

    // Add Session
    dayBlock.appendChild(createSession(subject.name, currentMinutes));
    currentMinutes += STUDY_MINUTES;

    // Add Break (if not the last session)
    if (i < sessionsPerDay - 1) {
      dayBlock.appendChild(createBreak(currentMinutes));
      currentMinutes += BREAK_MINUTES;
    }
  }

  container.appendChild(dayBlock);
}

function createSession(title, start) {
  const div = document.createElement("div");
  div.className = "session";
  // Determine color border based on subject name (simple hash)
  div.style.borderLeft = "4px solid #6366f1"; 
  
  div.innerHTML = `
    <span>${title}</span>
    <span>45 min</span>
    <span>${formatTime(start)}</span>
  `;
  return div;
}

function createBreak(start) {
  const div = document.createElement("div");
  div.className = "session break";
  div.innerHTML = `
    <span>Break</span>
    <span>15 min</span>
    <span>${formatTime(start)}</span>
  `;
  return div;
}

function updateSummary(stats, dailyHours, examDates) {
  document.getElementById("studyDays").textContent = stats.days;
  document.getElementById("dailyHoursStat").textContent = dailyHours + "h";
  document.getElementById("totalSessions").textContent = stats.sessions;
  document.getElementById("breakTime").textContent = stats.breaks + "m";

  const earliest = new Date(Math.min(...examDates));
  const latest = new Date(Math.max(...examDates));

  if (stats.days > 0) {
      document.getElementById("dateRange").textContent =
        earliest.toDateString().slice(4, 10) +
        " - " +
        latest.toDateString().slice(4, 10) +
        ", " +
        latest.getFullYear();
  } else {
      document.getElementById("dateRange").textContent = "No study days required";
  }
}