document.addEventListener("DOMContentLoaded", () => {
  fetch("/navbar.html")
    .then(response => {
      if (!response.ok) {
        throw new Error("Navbar fetch failed");
      }
      return response.text();
    })
    .then(data => {
      document.getElementById("navbar").innerHTML = data;
    })
    .catch(error => {
      console.error("Error loading navbar:", error);
    });
});

