// Course progress tracking and interactivity for The Veritas Method® Online Course
const Course = (function() {
  const STORAGE_KEY = 'veritas_course_progress';

  const COURSE_STRUCTURE = {
    1: { title: 'Partnership Principles', lessons: 4 },
    2: { title: 'The 6 Habits', lessons: 6 },
    3: { title: 'The VERITAS Values', lessons: 7 },
    4: { title: 'The Human-AI Bias Matrix', lessons: 3 },
    5: { title: 'Putting It All Together', lessons: 3 }
  };

  function getProgress() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch(e) {}
    return { enrolled: false, modules: {} };
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch(e) {}
  }

  function enroll() {
    const progress = getProgress();
    progress.enrolled = true;
    progress.enrolledAt = new Date().toISOString();
    saveProgress(progress);
  }

  function isEnrolled() {
    return getProgress().enrolled;
  }

  function completeLesson(moduleId, lessonId) {
    const progress = getProgress();
    if (!progress.modules[moduleId]) {
      progress.modules[moduleId] = { lessons: {} };
    }
    progress.modules[moduleId].lessons[lessonId] = true;

    const structure = COURSE_STRUCTURE[moduleId];
    if (structure) {
      let allDone = true;
      for (let i = 1; i <= structure.lessons; i++) {
        if (!progress.modules[moduleId].lessons[i]) {
          allDone = false;
          break;
        }
      }
      progress.modules[moduleId].completed = allDone;
    }

    saveProgress(progress);
    updateUI();
  }

  function uncompleteLesson(moduleId, lessonId) {
    const progress = getProgress();
    if (progress.modules[moduleId] && progress.modules[moduleId].lessons[lessonId]) {
      delete progress.modules[moduleId].lessons[lessonId];
      progress.modules[moduleId].completed = false;
      saveProgress(progress);
      updateUI();
    }
  }

  function isLessonComplete(moduleId, lessonId) {
    const progress = getProgress();
    return !!(progress.modules[moduleId] && progress.modules[moduleId].lessons[lessonId]);
  }

  function isModuleComplete(moduleId) {
    const progress = getProgress();
    return !!(progress.modules[moduleId] && progress.modules[moduleId].completed);
  }

  function getModuleProgress(moduleId) {
    const progress = getProgress();
    const structure = COURSE_STRUCTURE[moduleId];
    if (!structure || !progress.modules[moduleId]) return 0;
    let done = 0;
    for (let i = 1; i <= structure.lessons; i++) {
      if (progress.modules[moduleId].lessons[i]) done++;
    }
    return Math.round((done / structure.lessons) * 100);
  }

  function getOverallProgress() {
    let totalLessons = 0;
    let completedLessons = 0;
    const progress = getProgress();

    for (const [modId, structure] of Object.entries(COURSE_STRUCTURE)) {
      totalLessons += structure.lessons;
      if (progress.modules[modId]) {
        for (let i = 1; i <= structure.lessons; i++) {
          if (progress.modules[modId].lessons[i]) completedLessons++;
        }
      }
    }

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  }

  function getTotalLessons() {
    return Object.values(COURSE_STRUCTURE).reduce((sum, m) => sum + m.lessons, 0);
  }

  function getCompletedLessons() {
    let count = 0;
    const progress = getProgress();
    for (const [modId, structure] of Object.entries(COURSE_STRUCTURE)) {
      if (progress.modules[modId]) {
        for (let i = 1; i <= structure.lessons; i++) {
          if (progress.modules[modId].lessons[i]) count++;
        }
      }
    }
    return count;
  }

  function updateUI() {
    document.querySelectorAll('[data-progress-bar]').forEach(bar => {
      const moduleId = bar.dataset.progressBar;
      const pct = moduleId === 'overall' ? getOverallProgress() : getModuleProgress(parseInt(moduleId));
      bar.style.width = pct + '%';
      const label = bar.closest('.progress-container')?.querySelector('.progress-label');
      if (label) label.textContent = pct + '% complete';
    });

    document.querySelectorAll('[data-module-status]').forEach(badge => {
      const moduleId = parseInt(badge.dataset.moduleStatus);
      if (isModuleComplete(moduleId)) {
        badge.textContent = 'Completed';
        badge.className = 'module-status completed';
      } else if (getModuleProgress(moduleId) > 0) {
        badge.textContent = 'In Progress';
        badge.className = 'module-status in-progress';
      } else {
        badge.textContent = 'Not Started';
        badge.className = 'module-status not-started';
      }
    });

    document.querySelectorAll('[data-lesson-check]').forEach(check => {
      const parts = check.dataset.lessonCheck.split('-');
      const modId = parseInt(parts[0]);
      const lesId = parseInt(parts[1]);
      check.classList.toggle('checked', isLessonComplete(modId, lesId));
    });

    document.querySelectorAll('[data-completed-count]').forEach(el => {
      el.textContent = getCompletedLessons();
    });
    document.querySelectorAll('[data-total-count]').forEach(el => {
      el.textContent = getTotalLessons();
    });

    document.querySelectorAll('[data-overall-pct]').forEach(el => {
      el.textContent = getOverallProgress() + '%';
    });
  }

  function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    updateUI();
  }

  document.addEventListener('DOMContentLoaded', updateUI);

  return {
    enroll, isEnrolled, completeLesson, uncompleteLesson,
    isLessonComplete, isModuleComplete, getModuleProgress,
    getOverallProgress, getTotalLessons, getCompletedLessons,
    updateUI, resetProgress, COURSE_STRUCTURE
  };
})();

function toggleLesson(header) {
  const lesson = header.closest('.lesson');
  const isOpen = lesson.classList.contains('open');
  lesson.closest('.lessons-container')?.querySelectorAll('.lesson').forEach(l => l.classList.remove('open'));
  if (!isOpen) lesson.classList.add('open');
}

function toggleLessonComplete(moduleId, lessonId, btn) {
  if (Course.isLessonComplete(moduleId, lessonId)) {
    Course.uncompleteLesson(moduleId, lessonId);
    btn.textContent = 'Mark as Complete';
    btn.classList.remove('completed');
  } else {
    Course.completeLesson(moduleId, lessonId);
    btn.textContent = 'Completed ✓';
    btn.classList.add('completed');
  }
}

function checkQuiz(form, answers) {
  const result = form.querySelector('.quiz-result');
  let correct = 0;
  let total = Object.keys(answers).length;

  for (const [name, answer] of Object.entries(answers)) {
    const selected = form.querySelector('input[name="' + name + '"]:checked');
    const questionDiv = form.querySelector('[data-question="' + name + '"]');

    questionDiv.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('correct', 'incorrect');
    });

    if (selected) {
      const selectedOption = selected.closest('.quiz-option');
      if (selected.value === answer) {
        correct++;
        selectedOption.classList.add('correct');
      } else {
        selectedOption.classList.add('incorrect');
        const correctInput = questionDiv.querySelector('input[value="' + answer + '"]');
        if (correctInput) correctInput.closest('.quiz-option').classList.add('correct');
      }
    }
  }

  result.style.display = 'block';
  if (correct === total) {
    result.className = 'quiz-result perfect';
    result.innerHTML = '<strong>Perfect Score!</strong> You got ' + correct + '/' + total + ' correct. Excellent understanding!';
  } else if (correct >= total * 0.7) {
    result.className = 'quiz-result good';
    result.innerHTML = '<strong>Good job!</strong> You got ' + correct + '/' + total + ' correct. Review the ones you missed and try again.';
  } else {
    result.className = 'quiz-result retry';
    result.innerHTML = '<strong>Keep learning!</strong> You got ' + correct + '/' + total + ' correct. Review the lesson content and try again.';
  }
}

function copyPrompt(btn) {
  const text = btn.closest('.prompt-box').querySelector('.prompt-text').textContent.trim();
  navigator.clipboard.writeText(text).then(function() {
    var original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = original; }, 2000);
  });
}
