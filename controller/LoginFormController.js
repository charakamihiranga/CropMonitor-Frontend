import { setUserDataToHeader } from "../assets/js/dashboard.js";
import { saveJwtTokenToCookie } from "../model/AuthModel.js";

$("#loginForm").on("submit", async function (event) {
  event.preventDefault(); // Prevent normal form submission

  const formData = new FormData();
  formData.append("email", $("#username").val());
  formData.append("password", $("#password").val());

  try {
    const response = await fetch(
      "http://localhost:8080/cropmonitor/api/v1/auth/login",
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      const jwtToken = data.token;

      // Save token to cookie
      saveJwtTokenToCookie(jwtToken);

      // Set user data to dashboard header
      setUserDataToHeader(data.userFullName, data.role);

      // Redirect user
      window.location.href = "index.html";
    } else {
      alert("Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
});

$("#signup").on("click", function () {
  window.location.href = "signup.html";
});
