import {
  checkPasswordValidity,
  getJwtTokenFromCookies,
} from "../model/AuthModel.js";

$(document).ready(function () {
  $("#change-password-btn").on("click", async function (event) {
    event.preventDefault();
    const currentPassword = $("#currentPassword").val();
    const newPassword = $("#newPassword").val();
    const confirmPassword = $("#confirmPassword").val();
    const token = getJwtTokenFromCookies();
    const decodedToken = decodeJwt(token);
    const userEmail = decodedToken.sub;

    const isPasswordValid = await checkPasswordValidity(
      userEmail,
      currentPassword
    );

    if (!isPasswordValid) {
      alert("Current password is incorrect. Please try again.");
      return;
    } else {
      if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match.");
        return;
      } else {
        
      }
    }
  });
});
