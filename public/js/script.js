const navItems = document.querySelectorAll('#navList li');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove 'active' from all
      navItems.forEach(el => el.classList.remove('active'));

      // Add 'active' to the clicked one
      item.classList.add('active');
    });
  });

// Toggle password visibility for Login View
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("userPassword");

togglePassword.addEventListener("change", function () {
  passwordField.type = this.checked ? "text" : "password";
});