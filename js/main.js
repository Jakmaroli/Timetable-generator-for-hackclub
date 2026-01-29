document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI (listeners for sliders, etc.)
  UI.init();

  // Event: Add Subject
  document.getElementById("addSubjectBtn").addEventListener("click", () => {
    const input = UI.getSubjectInput();
    
    if (!input.name || !input.examDate) {
      alert("Please enter subject name and exam date");
      return;
    }

    State.addSubject(input);
    UI.renderSubjects(State.getSubjects());
    UI.clearSubjectInputs();
  });

  // Event: Generate Timetable
  document.getElementById("generateBtn").addEventListener("click", () => {
    // Update settings from UI before generating
    const settings = UI.getSettingsInput();
    State.updateSettings(settings.startTime, settings.dailyHours);

    if (State.getSubjects().length === 0) {
      alert("Add at least one subject!");
      return;
    }

    UI.showLoading(true);
    
    // Slight delay to simulate AI processing/UX
    setTimeout(() => {
      UI.showLoading(false);
      Timetable.generate();
    }, 1200);
  });

  // Event: Download ICS
  document.getElementById("downloadBtn").addEventListener("click", () => {
    Utils.downloadICS(State.getGeneratedEvents());
  });
});