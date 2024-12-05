import { getJwtTokenFromCookies } from "./AuthModel.js";

const API_URL = "http://localhost:8080/cropmonitor/api/v1/vehicle";

export function getAllVehicleData() {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      return response;
    },
    error: function (error) {
      console.error("Error fetching vehicle data:", error);
      throw error;
    },
  });
}

export function addVehicle(vehicleData) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(vehicleData),
  })
    .then((response) => {
      return { status: 201, message: "Vehicle added successfully" };
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while adding vehicle. Please try again.";
      if (error.status === 409) {
        errorMessage =
          "Vehicle already exists. Please use a different license plate number.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}

export function updateVehicle(vehicleId, vehicleObj) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return Promise.reject("JWT token not found.");
  }
  return $.ajax({
    url: `${API_URL}/${vehicleId}`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(vehicleObj),
  })
    .then((response, textStatus, jqXHR) => {
      if (jqXHR.status === 204) {
        return { status: 204, message: "vehicle updated successfully" };
      }
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while updating vehicle. Please try again.";

      if (error.status === 404) {
        errorMessage = "vehicle not found.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }

      return { status: error.status, message: errorMessage };
    });
}
