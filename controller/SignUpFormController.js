import { setUserDataToHeader } from "../assets/js/dashboard.js";
import { saveJwtTokenToCookie } from "../model/AuthModel.js";

$(document).ready(function () {
  const notyf = new Notyf({
    duration: 3000,
    position: { x: "right", y: "top" },
  });
});

$("#btn-back").click(function () {
  window.location.href = "login.html";
});

$("#btn-signup").click(async function () {
  const email = $("#email").val();
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();

  if (password !== confirmPassword) {
    notyf.error("Passwords do not match. Please try again.");
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
        notyf.error("Sign up failed. Please try again.");
      }
    } catch (error) {
      notyf.error("An error occurred. Please try again.");
      console.error("Error:", error);
    }
  }
});
