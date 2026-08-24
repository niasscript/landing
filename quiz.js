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

});

/* ==========================================
   INTERACTIVE ALIGNMENT QUIZ
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
  }
];

let currentQuestionIndex = 0;
let userAnswers = [];
let capturedLead = null;

function startQuiz() {
  document.getElementById('quiz-intro').classList.remove('active');
  document.getElementById('quiz-question-box').classList.add('active');
  document.getElementById('quiz-lead-capture').classList.remove('active');
  document.getElementById('quiz-result').classList.remove('active');
  
  currentQuestionIndex = 0;
  userAnswers = [];
  displayQuestion();
}

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
  document.getElementById('quiz-question-box').classList.remove('active');
  document.getElementById('quiz-lead-capture').classList.add('active');
  document.getElementById('lead-capture-form').reset();
}

function handleLeadSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('l-name').value.trim();
  const email = document.getElementById('l-email').value.trim();
  const phone = document.getElementById('l-phone').value.trim();
  
  if (name && email && phone) {
    // 1. Calculate Score
    const totalScore = userAnswers.reduce((sum, score) => sum + score, 0);
    const alignmentPercent = Math.round(((totalScore - 7) / 14) * 100);
    
    // 2. Package Lead Data
    capturedLead = {
      name: name,
      email: email,
      phone: phone,
      quizScore: alignmentPercent,
      timestamp: new Date().toISOString()
    };
    
    // 3. Save Lead locally to localStorage (as backup / CSV prep)
    saveLeadLocally(capturedLead);
    
    // 4. Call CRM Integration Hook
    pushLeadToCRM(capturedLead);
    
    // 5. Pre-populate parameters in the hidden fields of the booking checkout form
    document.getElementById('c-name').value = name;
    document.getElementById('c-email').value = email;
    document.getElementById('c-phone').value = phone;
    
    // 6. Transition to Results Section
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
   CRM INTEGRATION HOOK
   ========================================== */
function pushLeadToCRM(leadData) {
  console.log("=== Lead Successfully Captured ===");
  console.log("Name: ", leadData.name);
  console.log("Email: ", leadData.email);
  console.log("Phone: ", leadData.phone);
  console.log("UPSC Alignment Score: ", leadData.quizScore + "%");
  console.log("Timestamp: ", leadData.timestamp);
  console.log("====================================");
  
  /* 
     FUTURE CRM SETUP SKELETON:
     To push to HubSpot, Salesforce, active campaigns, etc., uncomment & configure:
     
     fetch('https://your-crm-webhook-endpoint.com/leads', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(leadData)
     })
     .then(response => response.json())
     .then(data => console.log('CRM Sync Successful:', data))
     .catch(err => console.error('CRM Sync Error:', err));
  */
}

/* ==========================================
   QUIZ RESULTS
   ========================================== */
function showResults(alignmentPercent) {
  document.getElementById('quiz-lead-capture').classList.remove('active');
  document.getElementById('quiz-result').classList.add('active');
  
  document.getElementById('score-text').innerText = `${alignmentPercent}%`;
  
  const feedbackElement = document.getElementById('result-feedback-text');
  const labelElement = document.getElementById('alignment-label');
  
  // Reset counselling booking box view
  document.getElementById('counselling-form').style.display = 'flex';
  document.getElementById('booking-success').style.display = 'none';
  document.getElementById('counselling-form').reset();
  
  if (alignmentPercent >= 80) {
    labelElement.innerText = "High Alignment";
    labelElement.style.color = "var(--color-accent-green)";
    feedbackElement.innerHTML = `
      <strong>Excellent! You show high compatibility with a Civil Services career.</strong><br><br>
      You have a strong affinity for public impact, administrative leadership, and problem-solving. You are intrinsically motivated to understand society and make decisions under pressure. 
      Because your profile matches this path exceptionally, we recommend booking a counseling slot below to align your study schedule.
    `;
  } else if (alignmentPercent >= 50) {
    labelElement.innerText = "Moderate Alignment";
    labelElement.style.color = "var(--color-accent-orange)";
    feedbackElement.innerHTML = `
      <strong>Good potential, but you should proceed with caution and reflection.</strong><br><br>
      You value leadership and want to make a difference, but you may have reservations about the intense preparation requirements, remote postings, or public scrutiny. 
      It is a good idea to book a session below to speak with an advisor about how to balance preparation with backup plans.
    `;
  } else {
    labelElement.innerText = "Low Alignment";
    labelElement.style.color = "var(--color-accent-red)";
    feedbackElement.innerHTML = `
      <strong>A conventional career path might offer a better fit for your preferences.</strong><br><br>
      You likely prefer deep specializations, corporate or customer objectives, a highly structured work environment, or quicker career returns. 
      UPSC is not right for everyone, and that is perfectly okay. Modern conventional careers in technology, management, finance, or entrepreneurship offer incredible opportunities to lead. You can talk to an advisor below to explore alternative options.
    `;
  }
}

function restartQuiz() {
  document.getElementById('quiz-result').classList.remove('active');
  document.getElementById('quiz-intro').classList.add('active');
}

/* ==========================================
   COUNSELLING BOOKING FORM SUBMISSION
   ========================================== */
function handleCounsellingSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('c-name').value;
  const email = document.getElementById('c-email').value;
  const slot = document.getElementById('c-slot').value;
  
  if (name && email && slot) {
    // Format the date/time string nicely
    let formattedSlot = slot;
    try {
      const dateObj = new Date(slot);
      if (!isNaN(dateObj)) {
        const options = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        formattedSlot = dateObj.toLocaleDateString('en-US', options) + ' IST';
      }
    } catch (e) {
      console.error(e);
    }

    // Save counselling booking request locally (augmented with leadData)
    const bookingData = {
      lead: capturedLead,
      slot: slot,
      formattedSlot: formattedSlot,
      bookedTimestamp: new Date().toISOString()
    };
    saveBookingLocally(bookingData);

    // Populate confirmation details
    document.getElementById('confirmed-slot').innerText = formattedSlot;
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
