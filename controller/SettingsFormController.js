import {
  decodeJwt,
  generateRandomCode,
  setupModal,
} from "../assets/js/util.js";
import {
  checkPasswordValidity,
  getJwtTokenFromCookies,
} from "../model/AuthModel.js";
import { changeUserPassword, removeUser } from "../model/UserModel.js";

const confirmCodeModal = setupModal(
  "#confirm-code-modal",
  "#confirm-code-btn",
  "#close-modal"
);

const confirmDeleteModal = setupModal(
  "#delete-account-modal",
  "",
  "#close-delete-modal"
);


const emailJs_service_id = "";
const emailJs_template_id = "";
const emailJs_public_key = "";

function clearFields() {
  $("#code-input").val("");
  $("#currentPassword").val("");
  $("#newPassword").val("");
  $("#confirmPassword").val("");
}

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

  $("#delete-btn").on("click", async function (e) {
    e.preventDefault();
    const password = $("#deleteCurrentPassword").val();
    const token = getJwtTokenFromCookies();
    const decodedToken = decodeJwt(token);
    const userEmail = decodedToken.sub;

    const isPasswordValid = await checkPasswordValidity(userEmail, password);

    if (!isPasswordValid) {
      alert("Current password is incorrect. Please try again.");
      return;
    } else if (isPasswordValid) {
      confirmDeleteModal.open();
      $("#btn-delete-account").on("click", async function (event) {
        const response = await removeUser(userEmail);
        if (response.status === 204) {
          alert(response.message);
          window.top.location.href = "../../login.html";
        } else {
          alert(response.message);
        }
      });
    }
  });
});
