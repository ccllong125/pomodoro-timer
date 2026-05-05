document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const timeDisplay = document.getElementById('time-display');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const btnModeWork = document.getElementById('btn-mode-work');
  const btnModeBreak = document.getElementById('btn-mode-break');
  const inputWork = document.getElementById('input-work');
  const inputBreak = document.getElementById('input-break');
  const progressCircle = document.querySelector('.progress-ring__circle');

  // Configuration & State
  let workDuration = parseInt(inputWork.value, 10) * 60;
  let breakDuration = parseInt(inputBreak.value, 10) * 60;

  let currentMode = 'work'; // 'work' or 'break'
  let timeLeft = workDuration;
  let totalTime = workDuration;
  let timerInterval = null;
  let isRunning = false;

  const circleCircumference = 2 * Math.PI * 110; // 691.15

  // Initialize UI
  progressCircle.style.strokeDasharray = circleCircumference;
  document.body.classList.add('mode-work');
  updateDisplay();

  // Mode Switching
  function switchMode(mode) {
    if (isRunning) {
      pauseTimer();
    }

    currentMode = mode;

    if (mode === 'work') {
      document.body.classList.replace('mode-break', 'mode-work');
      btnModeWork.classList.add('active');
      btnModeBreak.classList.remove('active');
      totalTime = parseInt(inputWork.value, 10) * 60;
    } else {
      document.body.classList.replace('mode-work', 'mode-break');
      btnModeBreak.classList.add('active');
      btnModeWork.classList.remove('active');
      totalTime = parseInt(inputBreak.value, 10) * 60;
    }

    timeLeft = totalTime;
    updateDisplay();
  }

  // Timer Controls
  function startTimer() {
    if (isRunning) return;

    isRunning = true;
    btnStart.classList.add('hidden');
    btnPause.classList.remove('hidden');
    inputWork.disabled = true;
    inputBreak.disabled = true;

    const expectedEndTime = Date.now() + timeLeft * 1000;

    timerInterval = setInterval(() => {
      timeLeft = Math.ceil((expectedEndTime - Date.now()) / 1000);
      if (timeLeft < 0) timeLeft = 0;

      updateDisplay();

      if (timeLeft <= 0) {
        handleTimerComplete();
      }
    }, 200);
  }

  function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(timerInterval);
    btnPause.classList.add('hidden');
    btnStart.classList.remove('hidden');
    inputWork.disabled = false;
    inputBreak.disabled = false;
  }

  function resetTimer() {
    pauseTimer();
    timeLeft = currentMode === 'work' ? parseInt(inputWork.value, 10) * 60 : parseInt(inputBreak.value, 10) * 60;
    totalTime = timeLeft;
    updateDisplay();
  }

  function handleTimerComplete() {
    pauseTimer();

    // Play a gentle sound (Optional, omitting for now to keep it calm, can add a subtle bell)

    // Auto-switch mode
    if (currentMode === 'work') {
      switchMode('break');
    } else {
      switchMode('work');
    }
    // Optionally auto-start next mode:
    // startTimer(); 
  }

  // UI Updates
  function updateDisplay() {
    // Format Time
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    timeDisplay.textContent = timeString;
    document.title = `${timeString} - ${currentMode === 'work' ? '工作' : '休息'} | 莫蘭迪番茄鐘`;

    // Update Progress Ring
    const progress = timeLeft / totalTime;
    const dashoffset = circleCircumference - (progress * circleCircumference);
    progressCircle.style.strokeDashoffset = dashoffset;
  }

  // Event Listeners
  btnStart.addEventListener('click', startTimer);
  btnPause.addEventListener('click', pauseTimer);
  btnReset.addEventListener('click', resetTimer);

  btnModeWork.addEventListener('click', () => switchMode('work'));
  btnModeBreak.addEventListener('click', () => switchMode('break'));

  // Settings Listeners
  inputWork.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 90) val = 90;
    e.target.value = val;

    if (currentMode === 'work') {
      totalTime = val * 60;
      if (!isRunning) {
        timeLeft = totalTime;
        updateDisplay();
      }
    }
  });

  inputBreak.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 30) val = 30;
    e.target.value = val;

    if (currentMode === 'break') {
      totalTime = val * 60;
      if (!isRunning) {
        timeLeft = totalTime;
        updateDisplay();
      }
    }
  });
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
