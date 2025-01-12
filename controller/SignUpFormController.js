import { setUserDataToHeader } from "../assets/js/dashboard.js";
import { saveJwtTokenToCookie } from "../model/AuthModel.js";

$("#btn-back").click(function () {
  window.location.href = "login.html";
});

$("#btn-signup").click(async function () {
  const email = $("#email").val();
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();

  if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  } else {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    try {
      const response = await fetch(
        "http://localhost:8080/cropmonitor/api/v1/auth/register",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jwtToken = data.token;
        saveJwtTokenToCookie(jwtToken);
        setUserDataToHeader(data.userFullName, data.role);
        window.location.href = "index.html";
      } else {
        alert("Sign up failed. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
      console.error("Error:", error);
    }
  }
});
