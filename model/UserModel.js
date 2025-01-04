import { getJwtTokenFromCookies } from "./AuthModel.js";

const API_URL = "http://localhost:8080/cropmonitor/api/v1";

export function changeUserPassword(userEmail, user) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/user/${userEmail}`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
    data:JSON.stringify(user),

  })
    .then((response) => {
      return { status: 204, message: "Password changed successfully" };
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while changing password. Please try again.";
      if (error.status === 404) {
        errorMessage = "User not found. Please check the provided useremail.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}

export function removeUser(userEmail) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/user/${userEmail}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      return { status: 204, message: "User deleted successfully" };
    })
    .catch((error) => {
      let errorMessage = "An error occurred while deleting user. Please try again.";
      if (error.status === 404) {
        errorMessage = "User not found. Please check the provided useremail.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}