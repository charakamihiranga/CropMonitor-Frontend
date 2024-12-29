import {
  decodeJwt,
  generateRandomCode,
  setupModal,
} from "../assets/js/util.js";
import {
  checkPasswordValidity,
  getJwtTokenFromCookies,
} from "../model/AuthModel.js";
import { changeUserPassword } from "../model/UserModel.js";

const confirmCodeModal = setupModal(
  "#confirm-code-modal",
  "#confirm-code-btn",
  "#close-modal"
);

const emailJs_service_id = "";
const emailJs_template_id = "";
const emailJs_public_key = "";

$(document).ready(function () {
  $("#change-password-btn").on("click", async function (event) {
    event.preventDefault();

    emailjs.init(emailJs_public_key);

    const currentPassword = $("#currentPassword").val();
    const newPassword = $("#newPassword").val();
    const confirmPassword = $("#confirmPassword").val();
    const token = getJwtTokenFromCookies();
    const decodedToken = decodeJwt(token);
    const userEmail = decodedToken.sub;
    const userRole = decodedToken.role;

    const isPasswordValid = await checkPasswordValidity(
      userEmail,
      currentPassword
    );
    
    function clearFields() {
        $("#code-input").val("");
        $("#currentPassword").val("");
        $("#newPassword").val("");
        $("#confirmPassword").val("");
    }

    if (!isPasswordValid) {
      alert("Current password is incorrect. Please try again.");
      return;
    } else {
      if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match.");
        return;
      } else {
        const confirmationCode = generateRandomCode();
        try {
          await emailjs.send(emailJs_service_id, emailJs_template_id, {
            confirmation_code: confirmationCode,
            target_email: userEmail,
          });
          confirmCodeModal.open();

          $("#btn-confirm").on("click", async function (event) {
            event.preventDefault();
            const enteredCode = $("#code-input").val();
            if (enteredCode === confirmationCode) {
              const user = {
                email: userEmail,
                password: newPassword,
              };

              try {
                const response = await changeUserPassword(userEmail, user);
                if (response.status === 204) {
                  clearFields();
                  confirmCodeModal.close();
                  alert(response.message);
                }
              } catch (error) {
                console.error("Error changing password", error);
                alert("Error changing password. Please try again.");
              }
            }
          });
        } catch (error) {
          console.error("Error sending email:", error);
          alert(
            "Failed to send the confirmation email. Please try again later."
          );
        }
      }
    }
  });
});
