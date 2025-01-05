import { getJwtTokenFromCookies } from "./AuthModel.js";

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
      Authorization: `Bearer ${token}`, // Include JWT token in the Authorization header
    },
    success: function (response) {
      return response;
    },
    error: function (error) {
      console.error("Error fetching staff data:", error);
      throw error;
    },
  });
}

export function addStaff(staffData) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }

  return $.ajax({
    url: `${API_URL}/staff`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(staffData),
  })
    .then((response) => {
      // Success handler - return a success message
      return { status: 201, message: "Staff added successfully" };
    })
    .catch((error) => {
      // Error handler - catch and handle error
      let errorMessage =
        "An error occurred while adding staff. Please try again.";
      if (error.status === 409) {
        errorMessage = "Email already exists. Please use a different email.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}

export function getStaffById(staffId) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/staff/${staffId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      return response;
    },
    error: function (error) {
      console.error("Error fetching staff data:", error);
      throw error;
    },
  });
}

export function updateStaffMember(staffId, updatedStaffObj) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }

  return $.ajax({
    url: `${API_URL}/staff/${staffId}`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(updatedStaffObj),
  })
    .then((response, textStatus, jqXHR) => {
      if (jqXHR.status === 204) {
        return { status: 204, message: "Staff updated successfully" };
      }
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while updating staff. Please try again.";

      if (error.status === 404) {
        errorMessage = "Staff member not found.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }

      return { status: error.status, message: errorMessage };
    });
}

export function deleteStaffMember(staffId) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return { status: 401, message: "Unauthorized: JWT token not found." };
  }

  return $.ajax({
    url: `${API_URL}/staff/${staffId}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response, textStatus, jqXHR) => {
      if (jqXHR.status === 204) {
        return { status: 204, message: "Staff deleted successfully." };
      }
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while deleting staff. Please try again.";

      if (error.status === 404) {
        errorMessage = "Staff member not found.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }

      return { status: error.status, message: errorMessage };
    });
}

export function getStaffCountByRoles() {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/staff/countByRoles`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("Error fetching staff data:", error);
      throw error;
    });
}
