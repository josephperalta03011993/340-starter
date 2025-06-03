const navItems = document.querySelectorAll('#navList li');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove 'active' from all
      navItems.forEach(el => el.classList.remove('active'));

      // Add 'active' to the clicked one
      item.classList.add('active');
    });
  });