const hoursRange = document.getElementById("hoursRange");
const hoursValue = document.getElementById("hoursValue");

hoursRange.oninput = () => {
  hoursValue.textContent = hoursRange.value;
};

function clearSubjectInputs() {
  document.getElementById("subjectName").value = "";
  document.getElementById("examDate").value = "";
  document.getElementById("difficulty").value = "medium";
}

function renderSubjects() {
  const list = document.getElementById("subjectList");
  const count = document.getElementById("subjectCount");

  list.innerHTML = "";

  subjects.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${s.name} (${s.difficulty}) — Exam: ${s.examDate}`;
    list.appendChild(li);
  });

  count.textContent = `Total subjects added: ${subjects.length}`;
}

function showLoading(show) {
  document.getElementById("loading")
    .classList.toggle("hidden", !show);
}

function showTimetable() {
  document.getElementById("finalTimetable")
    .classList.remove("hidden");
}