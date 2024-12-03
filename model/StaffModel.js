import {getJwtTokenFromCookies} from "./AuthModel.js";

const API_URL = "http://localhost:8080/cropmonitor/api/v1";

export function getStaff() {
  const token = getJwtTokenFromCookies(); // Get the JWT token from cookies

  if (!token) {
      console.error("JWT token not found in cookies.");
      return;
  }

  // Return the jQuery AJAX GET request
  return $.ajax({
      url: `${API_URL}/staff`,
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`, // Include JWT token in the Authorization header
      },
      success: function(response) {
          console.log("Staff data fetched successfully:", response);
          return response;
      },
      error: function(error) {
          console.error('Error fetching staff data:', error);
          throw error;
      }
  });
}
