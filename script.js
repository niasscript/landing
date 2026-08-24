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

    // Override active highlights if user is scrolling Fold 2 (explorer)
    if (current === 'explorer') {
      const activePanel = document.querySelector('.explorer-panel.active');
      if (activePanel) {
        const id = activePanel.getAttribute('id');
        if (id === 'reasons-pane') current = 'reasons';
        else if (id === 'services-pane') current = 'services';
        else if (id === 'comparison-pane') current = 'comparison';
      }
    }

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

  /* ==========================================
     MASTER EXPLORER TAB MECHANISM
     ========================================== */
  const masterTabButtons = document.querySelectorAll('.master-tab-btn');
  const explorerPanels = document.querySelectorAll('.explorer-panel');

  function switchMasterTab(targetId) {
    masterTabButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-target') === targetId) {
        btn.classList.add('active');
      }
    });

    explorerPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.getAttribute('id') === targetId) {
        panel.classList.add('active');
        
        // Trigger reveal entrance animations for elements inside the active pane
        const revealsInPane = panel.querySelectorAll('.reason-card, .tab-link, .comparison-card');
        revealsInPane.forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      }
    });
  }

  masterTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchMasterTab(target);
    });
  });

  // Override clicks on desktop/mobile nav links to hook into master tabs
  const allNavLinks = document.querySelectorAll('.desktop-nav a, .mobile-bottom-nav a, .cta-buttons a, .result-actions a, .hero-actions a');
  allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      const targetHash = href.substring(1);
      let paneId = '';
      
      if (targetHash === 'reasons') paneId = 'reasons-pane';
      else if (targetHash === 'services') paneId = 'services-pane';
      else if (targetHash === 'comparison') paneId = 'comparison-pane';
      
      if (paneId) {
        e.preventDefault();
        switchMasterTab(paneId);
        
        // Scroll to explorer section
        const explorerSection = document.getElementById('explorer');
        if (explorerSection) {
          const topOffset = explorerSection.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({
            top: topOffset,
            behavior: 'smooth'
          });
        }
      }
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


