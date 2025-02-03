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
      } else if (error.status === 403) {
        errorMessage = "You are not authorized to add a vehicle.";
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
      } else if (error.status === 403) {
        errorMessage = "You are not authorized to update this vehicle.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }

      return { status: error.status, message: errorMessage };
    });
}

export function getVehicleById(vehicleCode) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/${vehicleCode}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while fetching vehicle. Please try again.";
      if (error.status === 404) {
        errorMessage = "Vehicle not found.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}

export function deleteVehicleById(vehicleCode) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/${vehicleCode}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      return { status: 204, message: "Vehicle deleted successfully" };
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while deleting vehicle. Please try again.";
      if (error.status === 404) {
        errorMessage = "Vehicle not found.";
      } else if (error.status === 403) {
        errorMessage = "You are not authorized to delete this vehicle.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}

export function getVehicleAvailabilityCount() {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/getAvailabilityCount`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      return response;
    },
    error: function (error) {
      console.error("Error fetching vehicle availability data:", error);
      throw error;
    },
  });
}
