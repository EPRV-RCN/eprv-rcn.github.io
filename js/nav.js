  // Load the nav bar
  fetch('/navbar.html')
    .then(response => response.text())
    .then(data => {
      const navbar = document.getElementById('navbar');
      if (!navbar) return;
      navbar.innerHTML = data;

      adjustBodyPadding();
      setupMobileSubmenu();
    });

  // Load shared announcements into any page that provides a slot
  function loadAnnouncements() {
    const announcementsSlot = document.getElementById('announcements');
    if (!announcementsSlot) return;

    fetch('/announcements.html')
      .then(response => response.text())
      .then(data => {
        announcementsSlot.innerHTML = data;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAnnouncements);
  } else {
    loadAnnouncements();
  }

  function adjustBodyPadding() {
    const nav = document.getElementById('mainNav');
    if (nav) {
      document.body.style.paddingTop = nav.offsetHeight + 'px';
    }
  }

  function setupMobileSubmenu() {
    const submenuLinks = document.querySelectorAll('.has-submenu > a');

    submenuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const parentLi = link.parentElement;

          // Close others
          document.querySelectorAll('.has-submenu.open').forEach(item => {
            if (item !== parentLi) {
              item.classList.remove('open');
            }
          });

          parentLi.classList.toggle('open');
          adjustBodyPadding();
        }
      });
    });
  }

  window.addEventListener('resize', adjustBodyPadding);

