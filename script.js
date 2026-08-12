// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     LIGHT/DARK THEME TOGGLER
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

  /* ==========================================
     MOBILE NAVIGATION ACTIVE SYNC
     ========================================== */
  const sections = document.querySelectorAll('section');
  const desktopLinks = document.querySelectorAll('.desktop-nav a');
  const mobileLinks = document.querySelectorAll('.mobile-bottom-nav a');

  // Handle active states on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    // Update Desktop Nav
    desktopLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.slice(1) === current) {
        link.classList.add('active');
      }
    });

    // Update Mobile Bottom Nav
    mobileLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.slice(1) === current) {
        link.classList.add('active');
      }
    });
  });

  // Smooth click visual feedback for mobile nav links
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  /* ==========================================
     HEADER SCROLL EFFECT (DESKTOP ONLY)
     ========================================== */
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.padding = '0.2rem 0';
      header.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
      header.style.background = 'var(--color-bg-deep)';
    } else {
      header.style.padding = '0';
      header.style.boxShadow = 'none';
      header.style.background = 'var(--color-bg-deep)';
    }
  });

  /* ==========================================
     14 KEY REASONS FILTERING
     ========================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const reasonCards = document.querySelectorAll('.reason-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      reasonCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight; // Trigger reflow
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ==========================================
     SCROLL ENTRANCE ANIMATIONS
     ========================================== */
  const revealElements = document.querySelectorAll('.reason-card, .tab-link, .comparison-card, .reality-card, .cta-container');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      el.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      revealObserver.observe(el);
    });
  }

});

/* ==========================================
   SERVICES SHOWCASE TABS
   ========================================== */
function openService(evt, serviceId) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
  });

  const tabLinks = document.querySelectorAll('.tab-link');
  tabLinks.forEach(link => {
    link.classList.remove('active');
  });

  document.getElementById(serviceId).classList.add('active');
  evt.currentTarget.classList.add('active');
  
  // Center scrolled pill inside horizontal list on mobile
  if (window.innerWidth <= 768) {
    const activeTab = evt.currentTarget;
    const parentContainer = activeTab.parentNode;
    const offsetLeft = activeTab.offsetLeft;
    const clientWidth = activeTab.clientWidth;
    const containerWidth = parentContainer.clientWidth;
    
    parentContainer.scrollTo({
      left: offsetLeft - (containerWidth / 2) + (clientWidth / 2),
      behavior: 'smooth'
    });
  }
}

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

function startQuiz() {
  document.getElementById('quiz-intro').classList.remove('active');
  document.getElementById('quiz-question-box').classList.add('active');
  
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
  
  const optionButtons = document.querySelectorAll('.option-btn');
  optionButtons.forEach((btn) => {
    btn.onclick = () => selectOption(parseInt(btn.getAttribute('data-value')));
  });
}

function selectOption(value) {
  userAnswers.push(value);
  
  if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    document.getElementById('quiz-progress').style.width = '100%';
    setTimeout(showResults, 300);
  }
}

function showResults() {
  document.getElementById('quiz-question-box').classList.remove('active');
  document.getElementById('quiz-result').classList.add('active');
  
  const totalScore = userAnswers.reduce((sum, score) => sum + score, 0);
  const alignmentPercent = Math.round(((totalScore - 7) / 14) * 100);
  
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
    // Populate details
    document.getElementById('confirmed-slot').innerText = slot;
    document.getElementById('confirmed-email').innerText = email;
    
    // Hide form and show success banner
    document.getElementById('counselling-form').style.display = 'none';
    const successMsg = document.getElementById('booking-success');
    successMsg.style.display = 'flex';
    successMsg.style.animation = 'fadeIn 0.4s ease forwards';
  }
}
