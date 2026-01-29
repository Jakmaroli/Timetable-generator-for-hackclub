const State = {
  data: {
    subjects: [],
    generatedEvents: [],
    settings: {
      studyMinutes: 45,
      breakMinutes: 15,
      startTimeMinutes: 9 * 60, // Default 09:00
      dailyHours: 4
    }
  },

  addSubject(subject) {
    this.data.subjects.push(subject);
  },

  getSubjects() {
    return this.data.subjects;
  },

  updateSettings(timeString, hours) {
    if (timeString) {
      const [h, m] = timeString.split(":").map(Number);
      this.data.settings.startTimeMinutes = (h * 60) + m;
    }
    this.data.settings.dailyHours = hours;
  },

  getSettings() {
    return this.data.settings;
  },

  // Event storage for ICS export
  setGeneratedEvents(events) {
    this.data.generatedEvents = events;
  },

  getGeneratedEvents() {
    return this.data.generatedEvents;
  }
};