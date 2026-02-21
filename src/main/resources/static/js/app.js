/* ============================================
   Iron Palace Podcast — SPA Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile Nav Toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ---- Active Nav Highlight on Scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === '#' + id) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // ---- Waveform Visualization ----
  const waveform = document.getElementById('waveform');
  if (waveform) {
    const barCount = 80;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'waveform-bar';
      const h = Math.random() * 24 + 4;
      bar.style.height = h + 'px';
      waveform.appendChild(bar);
    }
  }

  // ---- Crew Member Info Card ----
  const crewMembers = document.querySelectorAll('.crew-member');
  const crewCard = document.getElementById('crewInfoCard');
  const crewNameEl = document.getElementById('crewName');
  const crewDescEl = document.getElementById('crewDesc');

  crewMembers.forEach(member => {
    member.addEventListener('click', () => {
      crewMembers.forEach(m => m.classList.remove('active'));
      member.classList.add('active');

      const name = member.dataset.name;
      const role = member.dataset.role;
      const desc = member.dataset.desc;

      crewNameEl.textContent = name + ' - ' + role;
      crewDescEl.textContent = desc;

      if (crewCard) {
        crewCard.style.opacity = '0';
        setTimeout(() => {
          crewCard.style.opacity = '1';
        }, 150);
      }
    });
  });

  // ---- Scroll-Triggered Fade Animations ----
  const fadeTargets = [
    '.merch-grid',
    '.episodes-grid',
    '.crew-grid',
    '.contact-section h2'
  ];

  fadeTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('fade-in');
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });

  // ---- Navbar Background on Scroll ----
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
      navbar.style.background = 'rgba(0, 0, 0, 0.92)';
    }
  });

  // ---- Smooth scroll offset for fixed navbar ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 72;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
});
