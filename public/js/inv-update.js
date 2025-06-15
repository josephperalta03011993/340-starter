document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#updateForm");
    const updateBtn = document.querySelector("#submitBtn");

    form.addEventListener("change", function () {
      updateBtn.removeAttribute("disabled");
    });
});