function addSubject() {
  const name = document.getElementById("subjectName").value.trim();
  const examDate = document.getElementById("examDate").value;
  const difficulty = document.getElementById("difficulty").value;

  if (!name || !examDate) {
    alert("Please enter subject name and exam date");
    return;
  }

  subjects.push({ name, examDate, difficulty });
  renderSubjects();
  clearSubjectInputs();
}

// NEW: Helper to update start time from UI
function updateSettings() {
  const timeInput = document.getElementById("startTime").value;
  if (timeInput) {
    const [h, m] = timeInput.split(":").map(Number);
    START_TIME_MINUTES = (h * 60) + m;
  }
}

// Wrapper to update settings before generating
function handleGenerate() {
  updateSettings();
  generateTimetable();
}

// expose functions to HTML
window.addSubject = addSubject;
window.generate = handleGenerate;