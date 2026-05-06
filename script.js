const TEACHER_PASSWORD = 'admin123';

let currentStudent = '';
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let answered = false;

// ─── Utility ────────────────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack(screenId) {
  showScreen(screenId);
}

function restartApp() {
  currentStudent = '';
  currentQuiz = null;
  currentQuestionIndex = 0;
  score = 0;
  answered = false;
  document.getElementById('student-name').value = '';
  document.getElementById('teacher-password').value = '';
  document.getElementById('student-login-error').textContent = '';
  document.getElementById('teacher-login-error').textContent = '';
  showScreen('screen-role');
}

// ─── Role Selection ──────────────────────────────────────────────────────────

function selectRole(role) {
  if (role === 'student') showScreen('screen-student-login');
  else showScreen('screen-teacher-login');
}

// ─── Student Flow ────────────────────────────────────────────────────────────

function studentLogin() {
  const name = document.getElementById('student-name').value.trim();
  const err = document.getElementById('student-login-error');

  if (!name) {
    err.textContent = 'Please enter your name.';
    return;
  }

  const quiz = getSavedQuiz();
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    err.textContent = 'No quiz available yet. Please ask your teacher.';
    return;
  }

  err.textContent = '';
  currentStudent = name;
  currentQuiz = quiz;
  currentQuestionIndex = 0;
  score = 0;
  startQuiz();
}

function startQuiz() {
  document.getElementById('quiz-title-display').textContent = currentQuiz.title;
  showScreen('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = currentQuiz.questions[currentQuestionIndex];
  const total = currentQuiz.questions.length;

  document.getElementById('quiz-progress').textContent =
    `Question ${currentQuestionIndex + 1} of ${total}`;
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-feedback').className = 'feedback-msg';
  document.getElementById('next-btn').style.display = 'none';
  answered = false;

  const optionsList = document.getElementById('options-list');
  optionsList.innerHTML = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectOption(i);
    optionsList.appendChild(btn);
  });
}

function selectOption(index) {
  if (answered) return;
  answered = true;

  const q = currentQuiz.questions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.option-btn');
  const feedbackEl = document.getElementById('quiz-feedback');

  buttons.forEach(btn => btn.disabled = true);

  if (index === q.correct) {
    buttons[index].classList.add('correct');
    feedbackEl.textContent = '✓ Correct!';
    feedbackEl.className = 'feedback-msg correct';
    score++;
  } else {
    buttons[index].classList.add('wrong');
    buttons[q.correct].classList.add('correct');
    feedbackEl.textContent = '✗ Incorrect — the correct answer is highlighted.';
    feedbackEl.className = 'feedback-msg wrong';
  }

  const isLast = currentQuestionIndex === currentQuiz.questions.length - 1;
  const nextBtn = document.getElementById('next-btn');
  nextBtn.textContent = isLast ? 'Finish Quiz' : 'Next →';
  nextBtn.style.display = 'block';
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuiz.questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const total = currentQuiz.questions.length;
  const pct = Math.round((score / total) * 100);

  document.getElementById('result-student-name').textContent =
    `Student: ${currentStudent}`;
  document.getElementById('result-score').textContent = `${score}/${total}`;

  let msg, icon;
  if (pct >= 80) {
    msg = 'Excellent work! Keep it up!';
    icon = '🏆';
    document.querySelector('.score-circle').style.background =
      'linear-gradient(135deg, #16a34a, #4ade80)';
  } else if (pct >= 50) {
    msg = 'Good effort! Review the missed questions.';
    icon = '👍';
    document.querySelector('.score-circle').style.background =
      'linear-gradient(135deg, #d97706, #fbbf24)';
  } else {
    msg = 'Keep practicing — you\'ll get there!';
    icon = '📚';
    document.querySelector('.score-circle').style.background =
      'linear-gradient(135deg, #dc2626, #f87171)';
  }

  document.getElementById('result-icon').textContent = icon;
  document.getElementById('result-message').textContent = msg;

  saveResult(currentStudent, score, total);
  showScreen('screen-result');
}

// ─── Teacher Flow ────────────────────────────────────────────────────────────

function teacherLogin() {
  const pass = document.getElementById('teacher-password').value;
  const err = document.getElementById('teacher-login-error');

  if (pass !== TEACHER_PASSWORD) {
    err.textContent = 'Incorrect password. Try "admin123".';
    return;
  }

  err.textContent = '';
  document.getElementById('teacher-password').value = '';
  showScreen('screen-teacher');
  switchTab('create');
  loadQuizIntoEditor();
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`tab-content-${tab}`).classList.add('active');

  if (tab === 'results') renderResults();
}

// ─── Quiz Editor ─────────────────────────────────────────────────────────────

let questionCount = 0;

function loadQuizIntoEditor() {
  const quiz = getSavedQuiz();
  document.getElementById('questions-container').innerHTML = '';
  document.getElementById('save-msg').textContent = '';
  questionCount = 0;

  if (quiz && quiz.title) {
    document.getElementById('quiz-title-input').value = quiz.title;
    quiz.questions.forEach(q => addQuestion(q));
  } else {
    document.getElementById('quiz-title-input').value = '';
    addQuestion();
  }
}

function addQuestion(data = null) {
  questionCount++;
  const qNum = questionCount;
  const container = document.getElementById('questions-container');

  const block = document.createElement('div');
  block.className = 'question-block';
  block.dataset.qid = qNum;

  const options = data
    ? data.options
    : ['', '', '', ''];
  const correctIdx = data ? data.correct : 0;
  const questionText = data ? data.question : '';

  let optionRowsHTML = options.map((opt, i) => `
    <div class="option-row">
      <input type="radio" name="correct-${qNum}" value="${i}"
        ${i === correctIdx ? 'checked' : ''} title="Mark as correct answer" />
      <span class="option-label">Opt ${i + 1}</span>
      <input type="text" class="opt-input" data-opt="${i}"
        placeholder="Option ${i + 1}" value="${escapeHtml(opt)}" />
    </div>
  `).join('');

  block.innerHTML = `
    <div class="question-block-header">
      <span>Question ${qNum}</span>
      <button class="remove-q-btn" onclick="removeQuestion(this)" title="Remove question">✕</button>
    </div>
    <input type="text" class="q-input" placeholder="Enter question here…" value="${escapeHtml(questionText)}" />
    <div class="options-builder">
      <p style="font-size:0.82rem;color:#6b7280;margin-bottom:4px;">
        Fill in options — select the radio button next to the correct answer
      </p>
      ${optionRowsHTML}
    </div>
  `;

  container.appendChild(block);
}

function removeQuestion(btn) {
  const block = btn.closest('.question-block');
  block.remove();
  renumberQuestions();
}

function renumberQuestions() {
  const blocks = document.querySelectorAll('.question-block');
  questionCount = blocks.length;
  blocks.forEach((block, i) => {
    block.querySelector('.question-block-header span').textContent = `Question ${i + 1}`;
  });
}

function saveQuiz() {
  const title = document.getElementById('quiz-title-input').value.trim();
  const saveMsg = document.getElementById('save-msg');

  if (!title) {
    saveMsg.style.color = '#dc2626';
    saveMsg.textContent = 'Please enter a quiz title.';
    return;
  }

  const blocks = document.querySelectorAll('.question-block');
  if (blocks.length === 0) {
    saveMsg.style.color = '#dc2626';
    saveMsg.textContent = 'Add at least one question.';
    return;
  }

  const questions = [];
  let hasError = false;

  blocks.forEach((block, i) => {
    const qText = block.querySelector('.q-input').value.trim();
    const optInputs = block.querySelectorAll('.opt-input');
    const opts = Array.from(optInputs).map(inp => inp.value.trim());
    const checkedRadio = block.querySelector('input[type="radio"]:checked');
    const correctIdx = checkedRadio ? parseInt(checkedRadio.value) : 0;

    if (!qText) {
      saveMsg.style.color = '#dc2626';
      saveMsg.textContent = `Question ${i + 1} is missing its text.`;
      hasError = true;
      return;
    }
    if (opts.some(o => !o)) {
      saveMsg.style.color = '#dc2626';
      saveMsg.textContent = `Question ${i + 1} has empty option(s).`;
      hasError = true;
      return;
    }

    questions.push({ question: qText, options: opts, correct: correctIdx });
  });

  if (hasError) return;

  const quiz = { title, questions };
  localStorage.setItem('quiz', JSON.stringify(quiz));

  saveMsg.style.color = '#16a34a';
  saveMsg.textContent = `✓ Quiz "${title}" saved with ${questions.length} question(s)!`;
}

// ─── Results ──────────────────────────────────────────────────────────────────

function renderResults() {
  const results = getSavedResults();
  const quiz = getSavedQuiz();
  const container = document.getElementById('results-list');

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size:2.5rem;">📋</div>
        <p>No students have taken the quiz yet.</p>
      </div>`;
    return;
  }

  const total = quiz ? quiz.questions.length : '?';

  let rows = results.map((r, i) => {
    const pct = total !== '?' ? Math.round((r.score / total) * 100) : null;
    let badgeClass = 'badge-yellow';
    if (pct !== null) {
      if (pct >= 80) badgeClass = 'badge-green';
      else if (pct < 50) badgeClass = 'badge-red';
    }
    const pctLabel = pct !== null ? `${pct}%` : '';

    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${escapeHtml(r.name)}</strong></td>
        <td>${r.score} / ${r.total}</td>
        <td><span class="badge ${badgeClass}">${pctLabel}</span></td>
        <td style="color:#9ca3af;font-size:0.85rem;">${r.date}</td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <p style="color:#6b7280;font-size:0.9rem;">${results.length} student(s) completed the quiz</p>
      <button class="btn outline small" onclick="clearResults()">Clear All</button>
    </div>
    <div style="overflow-x:auto;">
      <table class="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student Name</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function clearResults() {
  if (confirm('Clear all student results?')) {
    localStorage.removeItem('quiz_results');
    renderResults();
  }
}

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────

function getSavedQuiz() {
  try { return JSON.parse(localStorage.getItem('quiz')); } catch { return null; }
}

function getSavedResults() {
  try { return JSON.parse(localStorage.getItem('quiz_results')) || []; } catch { return []; }
}

function saveResult(name, score, total) {
  const results = getSavedResults();
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  results.push({ name, score, total, date });
  localStorage.setItem('quiz_results', JSON.stringify(results));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Enter key shortcuts
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('student-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') studentLogin();
  });
  document.getElementById('teacher-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') teacherLogin();
  });
});
