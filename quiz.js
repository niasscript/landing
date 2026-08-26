// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     LIGHT/DARK THEME TOGGLER (SYNCED)
     ========================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  if (themeToggleBtn) {
    // Check local storage for theme settings
    const savedTheme = localStorage.getItem('theme');
    const isLightMode = savedTheme === 'light';
    
    if (isLightMode) {
      document.body.classList.add('light-theme');
      updateThemeIcon(true);
    } else {
      document.body.classList.remove('light-theme');
      updateThemeIcon(false);
    }

    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const lightActive = document.body.classList.contains('light-theme');
      
      // Save setting
      localStorage.setItem('theme', lightActive ? 'light' : 'dark');
      updateThemeIcon(lightActive);
    });
  }

  function updateThemeIcon(isLight) {
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      if (isLight) {
        icon.className = 'fa-solid fa-sun';
      } else {
        icon.className = 'fa-solid fa-moon';
      }
    }
  }

  // Bind option selection interactions on quiz buttons
  const optionButtons = document.querySelectorAll('.option-btn');
  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectOption(parseInt(btn.getAttribute('data-value')));
    });
  });

  // Initialize the first question directly
  displayQuestion();

  // Start the countdown timer immediately on load
  startTimer();

});

/* ==========================================
   INTERACTIVE ALIGNMENT QUIZ QUESTIONS
   ========================================== */
const quizQuestions = [
  {
    text: "How interested are you in understanding society, governance, politics, economy, and global events?",
    category: "curiosity"
  },
  {
    text: "Do you enjoy analyzing complex systemic problems and finding practical, structured solutions?",
    category: "problem-solving"
  },
  {
    text: "Are you comfortable bearing responsibility for high-stakes decisions that directly impact millions?",
    category: "responsibility"
  },
  {
    text: "How much do you value working in close cooperation with diverse teams, government systems, and local communities?",
    category: "team-player"
  },
  {
    text: "Are you willing to dedicate 1–2 years of intensive, daily study for a highly competitive examination with no guarantee of selection?",
    category: "long-term"
  },
  {
    text: "Would you rather have public-welfare impact in your career over organizational profitability or corporate growth?",
    category: "public-impact"
  },
  {
    text: "Is your motivation for UPSC driven by a genuine passion for administrative work rather than social status or peer expectations?",
    category: "intrinsic-motivation"
  },
  {
    text: "Are you comfortable working in remote or underdeveloped regions with basic infrastructure for the first decade of your career?",
    category: "location-realities"
  },
  {
    text: "How do you handle setbacks, high-stress environments, and situations where hard work does not lead to immediate rewards?",
    category: "resilience"
  },
  {
    text: "Are you confident in maintaining strict political neutrality and personal integrity under external political or bureaucratic pressure?",
    category: "integrity"
  }
];

let currentQuestionIndex = 0;
let userAnswers = [];
let capturedLead = null;
let timeLeft = 600; // 10 minutes in seconds
let timerInterval = null;

/* ==========================================
   QUIZ COUNTDOWN TIMER LOGIC
   ========================================== */
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      timeLeft = 0;
      clearInterval(timerInterval);
      autoSubmitOnTimeUp();
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  
  const timerText = document.getElementById('timer-text');
  const timerCapsule = document.getElementById('timer-capsule');
  
  if (timerText) {
    timerText.innerText = `${formattedMinutes}:${formattedSeconds}`;
  }
  
  if (timerCapsule) {
    if (timeLeft < 60) {
      timerCapsule.classList.add('timer-low');
    } else {
      timerCapsule.classList.remove('timer-low');
    }
  }
}

function autoSubmitOnTimeUp() {
  // If we are already on results page or lead capture form, ignore
  if (document.getElementById('quiz-result').classList.contains('active') || 
      document.getElementById('quiz-lead-capture').classList.contains('active')) {
    return;
  }
  
  // Fill userAnswers with 1s (unanswered questions penalty) to prevent math issues
  const missingAnswersCount = quizQuestions.length - userAnswers.length;
  for (let i = 0; i < missingAnswersCount; i++) {
    userAnswers.push(1);
  }
  
  // Set warning title in lead generation form
  const leadHeaderPara = document.querySelector('#quiz-lead-capture .result-header p');
  if (leadHeaderPara) {
    leadHeaderPara.innerHTML = `<strong style="color: var(--color-accent-red); font-size: 1.1rem; display: block; margin-bottom: 0.5rem;"><i class="fa-solid fa-triangle-exclamation"></i> Time has expired!</strong> Enter your details below to generate your UPSC compatibility score based on the questions completed.`;
  }
  
  showLeadForm();
}

/* ==========================================
   QUIZ TRANSITIONS & QUESTION PROGRESS
   ========================================== */
function displayQuestion() {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex) / quizQuestions.length) * 100;
  
  document.getElementById('quiz-progress').style.width = `${progressPercent === 0 ? 5 : progressPercent}%`;
  document.getElementById('question-counter').innerText = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  document.getElementById('question-text').innerText = currentQuestion.text;
}

function selectOption(value) {
  userAnswers.push(value);
  
  if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    document.getElementById('quiz-progress').style.width = '100%';
    setTimeout(showLeadForm, 300);
  }
}

/* ==========================================
   LEAD GENERATION STEP
   ========================================== */
function showLeadForm() {
  if (timerInterval) clearInterval(timerInterval); // Stop timer immediately
  document.getElementById('quiz-question-box').classList.remove('active');
  document.getElementById('quiz-lead-capture').classList.add('active');
  document.getElementById('lead-capture-form').reset();

  // Anti-Rush Warning banner (nudge warning only - do not lock submit button)
  const revealBtn = document.getElementById('reveal-results-btn');
  const rushedWarning = document.getElementById('rushed-warning');
  const elapsedSpan = document.getElementById('rushed-elapsed');
  
  if (revealBtn && rushedWarning) {
    const secondsElapsed = 600 - timeLeft;
    
    if (secondsElapsed < 60) {
      rushedWarning.style.display = 'block';
      if (elapsedSpan) elapsedSpan.innerText = secondsElapsed;
    } else {
      rushedWarning.style.display = 'none';
    }
    revealBtn.disabled = false; // Never locked
  }
}

function handleLeadSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('l-name').value.trim();
  const email = document.getElementById('l-email').value.trim();
  const phone = document.getElementById('l-phone').value.trim();
  
  // Strict Email Validation Regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Strict 10-Digit Mobile Number Validation Regex
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  const fullPhone = `+91 ${phone}`;
  
  if (name && email && phone) {
    if (timerInterval) clearInterval(timerInterval); // Double-safety
    
    // Calculate Score (10 questions: max score = 30, min score = 10)
    const totalScore = userAnswers.reduce((sum, score) => sum + score, 0);
    const alignmentPercent = Math.round(((totalScore - 10) / 20) * 100);
    
    // Package Lead Data
    capturedLead = {
      name: name,
      email: email,
      phone: fullPhone,
      quizScore: alignmentPercent,
      timestamp: new Date().toISOString()
    };
    
    // Save Lead locally to localStorage
    saveLeadLocally(capturedLead);
    
    // Call CRM Integration Hook
    pushLeadToCRM(capturedLead);
    
    // Pre-populate parameters in the hidden fields of the booking checkout form
    document.getElementById('c-name').value = name;
    document.getElementById('c-email').value = email;
    document.getElementById('c-phone').value = fullPhone;
    
    // Transition to Results Section
    showResults(alignmentPercent);
  }
}

function saveLeadLocally(leadData) {
  try {
    let existingLeads = JSON.parse(localStorage.getItem('upsc_leads')) || [];
    existingLeads.push(leadData);
    localStorage.setItem('upsc_leads', JSON.stringify(existingLeads));
  } catch (e) {
    console.error("Failed to write lead to localStorage:", e);
  }
}

/* ==========================================
   CRM INTEGRATION HOOK (DIRECT CLIENT-SIDE PUSH)
   ========================================== */
function pushLeadToCRM(leadData) {
  console.log("=== Lead Captured (Initiating Direct CRM Sync) ===");
  console.log("Name: ", leadData.name);
  console.log("Email: ", leadData.email);
  console.log("Phone: ", leadData.phone);
  console.log("Score: ", leadData.quizScore + "%");
  
  // Track time taken for exam
  const totalSecondsTaken = 600 - timeLeft;
  const takenMinutes = Math.floor(totalSecondsTaken / 60);
  const takenSeconds = totalSecondsTaken % 60;
  let timeTakenStr = "";
  if (takenMinutes > 0) {
    timeTakenStr = `${takenMinutes}m ${takenSeconds}s`;
  } else {
    timeTakenStr = `${takenSeconds}s`;
  }
  leadData.timeTaken = timeTakenStr;

  // Map parameters into Frappe CRM CRM Lead schema
  const payload = {
    "first_name": leadData.name,
    "email": leadData.email,
    "mobile_no": leadData.phone,
    "source": "Website Lead",
    "description": `UPSC Compatibility Assessment Result: ${leadData.quizScore}% Compatibility. Time Taken: ${timeTakenStr}`
  };

  // Direct fetch call to crm.upsccoaching.in (Bypasses local PHP server dependency)
  fetch('https://crm.upsccoaching.in/api/resource/CRM%20Lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'token 03afbb36be363d9:502e552c427bf28'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        console.error("Frappe CRM API Error Details:", errData);
        throw new Error(`HTTP error! status: ${response.status}. Details: ${JSON.stringify(errData)}`);
      }).catch(() => {
        throw new Error(`HTTP error! status: ${response.status}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Frappe CRM Direct Sync Success:', data);
  })
  .catch(err => {
    console.error('Frappe CRM Direct Sync Error:', err);
  });
}

/* ==========================================
   QUIZ RESULTS (DYNAMIC SVGs & COUNTERS)
   ========================================== */
function showResults(alignmentPercent) {
  document.getElementById('quiz-lead-capture').classList.remove('active');
  document.getElementById('quiz-result').classList.add('active');
  
  // Calculate and display total time taken
  const totalSecondsTaken = 600 - timeLeft;
  const takenMinutes = Math.floor(totalSecondsTaken / 60);
  const takenSeconds = totalSecondsTaken % 60;
  let timeTakenStr = "";
  if (takenMinutes > 0) {
    timeTakenStr = `${takenMinutes} ${takenMinutes === 1 ? 'minute' : 'minutes'} ${takenSeconds} ${takenSeconds === 1 ? 'second' : 'seconds'}`;
  } else {
    timeTakenStr = `${takenSeconds} ${takenSeconds === 1 ? 'second' : 'seconds'}`;
  }
  const timeTakenElement = document.getElementById('time-taken-text');
  if (timeTakenElement) {
    timeTakenElement.innerText = timeTakenStr;
  }
  
  const feedbackElement = document.getElementById('result-feedback-text');
  const labelElement = document.getElementById('alignment-label');
  
  if (feedbackElement) {
    feedbackElement.classList.remove('match-high', 'match-moderate', 'match-low');
  }
  
  // Reset counselling booking box view and CTA button
  document.getElementById('booking-cta-container').style.display = 'block';
  document.getElementById('counselling-booking-box').style.display = 'none';
  document.getElementById('counselling-form').style.display = 'flex';
  document.getElementById('booking-success').style.display = 'none';
  document.getElementById('counselling-form').reset();
  
  // Set text labels based on score thresholds
  let labelText = "";
  let labelColor = "";
  if (alignmentPercent >= 80) {
    if (feedbackElement) feedbackElement.classList.add('match-high');
    labelText = "High Compatibility";
    labelColor = "var(--color-accent-green)";
    feedbackElement.innerHTML = `
      <strong>Excellent! You show high compatibility with a Civil Services career.</strong><br><br>
      You have a strong affinity for public impact, administrative leadership, and problem-solving. You are intrinsically motivated to understand society and make decisions under pressure. 
      Because your profile matches this path exceptionally, we recommend booking a counseling session below to plan your study schedule and strategy.
    `;
  } else if (alignmentPercent >= 50) {
    if (feedbackElement) feedbackElement.classList.add('match-moderate');
    labelText = "Moderate Compatibility";
    labelColor = "var(--color-accent-orange)";
    feedbackElement.innerHTML = `
      <strong>Good potential, but you should proceed with caution and reflection.</strong><br><br>
      You value leadership and want to make a difference, but you may have reservations about the intense preparation requirements, remote postings, or public scrutiny. 
      It is a good idea to book a session below to speak with an advisor about how to balance preparation with backup plans.
    `;
  } else {
    if (feedbackElement) feedbackElement.classList.add('match-low');
    labelText = "Low Compatibility";
    labelColor = "var(--color-accent-red)";
    feedbackElement.innerHTML = `
      <strong>A conventional career path might offer a better fit for your preferences.</strong><br><br>
      You likely prefer deep specializations, corporate or customer objectives, a highly structured work environment, or quicker career returns. 
      UPSC is not right for everyone, and that is perfectly okay. Modern conventional careers in technology, management, finance, or entrepreneurship offer incredible opportunities to lead. You can talk to an advisor below to explore alternative options.
    `;
  }
  
  // Trigger SVG stroke fill animation
  const circle = document.getElementById('score-fill-circle');
  if (circle) {
    // stroke-dasharray = 314.16. Offset = 314.16 - (314.16 * percentage / 100)
    const offset = 314.16 - (314.16 * alignmentPercent / 100);
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = labelColor;
  }
  
  // Trigger count-up text animation
  let currentScore = 0;
  const scoreTextElement = document.getElementById('score-text');
  if (scoreTextElement) {
    scoreTextElement.innerText = "0%";
    labelElement.innerText = labelText;
    labelElement.style.color = labelColor;
    
    const countInterval = setInterval(() => {
      if (currentScore >= alignmentPercent) {
        scoreTextElement.innerText = `${alignmentPercent}%`;
        clearInterval(countInterval);
      } else {
        currentScore += Math.ceil(alignmentPercent / 25) || 1;
        if (currentScore > alignmentPercent) currentScore = alignmentPercent;
        scoreTextElement.innerText = `${currentScore}%`;
      }
    }, 30);
  }

  // Calculate component-level scores:
  // Each component is comprised of 2 specific questions.
  // Questions values are 1, 2, or 3. Min points = 2, max = 6.
  // Component score = Math.round(((pts - 2) / 4) * 100).
  const comp1Points = userAnswers[0] + userAnswers[1];
  const comp2Points = userAnswers[4] + userAnswers[8];
  const comp3Points = userAnswers[2] + userAnswers[3];
  const comp4Points = userAnswers[5] + userAnswers[6];
  const comp5Points = userAnswers[7] + userAnswers[9];

  const compScores = [
    Math.round(((comp1Points - 2) / 4) * 100),
    Math.round(((comp2Points - 2) / 4) * 100),
    Math.round(((comp3Points - 2) / 4) * 100),
    Math.round(((comp4Points - 2) / 4) * 100),
    Math.round(((comp5Points - 2) / 4) * 100)
  ];

  // Set values and colors for each component progress bar
  compScores.forEach((score, index) => {
    const barFill = document.getElementById(`comp-bar-${index + 1}`);
    const scoreText = document.getElementById(`comp-score-${index + 1}`);
    
    if (barFill && scoreText) {
      // Reset width first
      barFill.style.width = '0%';
      
      // Set width trigger with timeout
      setTimeout(() => {
        barFill.style.width = `${score}%`;
      }, 100);
      
      // Color-code the bar fill based on thresholds
      if (score >= 80) {
        barFill.style.backgroundColor = "var(--color-accent-green)";
      } else if (score >= 50) {
        barFill.style.backgroundColor = "var(--color-accent-orange)";
      } else {
        barFill.style.backgroundColor = "var(--color-accent-red)";
      }
      
      // Count-up text animation
      let currentCompScore = 0;
      const compInterval = setInterval(() => {
        if (currentCompScore >= score) {
          scoreText.innerText = `${score}%`;
          clearInterval(compInterval);
        } else {
          currentCompScore += 5;
          if (currentCompScore > score) currentCompScore = score;
          scoreText.innerText = `${currentCompScore}%`;
        }
      }, 25);
    }
  });
}

function restartQuiz() {
  if (timerInterval) clearInterval(timerInterval);
  if (window.reflectionInterval) clearInterval(window.reflectionInterval);
  
  const revealBtn = document.getElementById('reveal-results-btn');
  const rushedWarning = document.getElementById('rushed-warning');
  if (revealBtn) revealBtn.disabled = false;
  if (rushedWarning) rushedWarning.style.display = 'none';

  document.getElementById('quiz-result').classList.remove('active');
  document.getElementById('quiz-question-box').classList.add('active');
  
  // Reset lead capture sub-heading note
  const leadHeaderPara = document.querySelector('#quiz-lead-capture .result-header p');
  if (leadHeaderPara) {
    leadHeaderPara.innerText = "Enter your details below to generate your personalized UPSC compatibility rating and receive a customized strategy guide.";
  }
  
  currentQuestionIndex = 0;
  userAnswers = [];
  timeLeft = 600; // Reset 10 minutes
  
  // Reset timer capsule colors
  const timerCapsule = document.getElementById('timer-capsule');
  if (timerCapsule) timerCapsule.classList.remove('timer-low');
  
  updateTimerDisplay();
  displayQuestion();
  startTimer();
}

function revealBookingForm() {
  document.getElementById('booking-cta-container').style.display = 'none';
  const bookingBox = document.getElementById('counselling-booking-box');
  bookingBox.style.display = 'block';
  bookingBox.style.animation = 'fadeIn 0.4s ease forwards';
  
  // Scroll smoothly to the booking form
  setTimeout(() => {
    bookingBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
}

/* ==========================================
   COUNSELLING BOOKING FORM SUBMISSION
   ========================================== */
function handleCounsellingSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('c-name').value;
  const email = document.getElementById('c-email').value;
  const phone = document.getElementById('c-phone').value;
  
  if (name && email) {
    // Save counselling booking request locally (augmented with leadData)
    const bookingData = {
      lead: capturedLead,
      bookedTimestamp: new Date().toISOString()
    };
    saveBookingLocally(bookingData);

    // Populate confirmation details
    document.getElementById('confirmed-email').innerText = email;
    
    // Hide form and show success banner
    document.getElementById('counselling-form').style.display = 'none';
    const successMsg = document.getElementById('booking-success');
    successMsg.style.display = 'flex';
    successMsg.style.animation = 'fadeIn 0.4s ease forwards';
  }
}

function saveBookingLocally(bookingData) {
  try {
    let existingBookings = JSON.parse(localStorage.getItem('upsc_bookings')) || [];
    existingBookings.push(bookingData);
    localStorage.setItem('upsc_bookings', JSON.stringify(existingBookings));
  } catch (e) {
    console.error("Failed to write booking to localStorage:", e);
  }
}
