import { getJwtTokenFromCookies } from "./AuthModel.js";

const API_URL = "http://localhost:8080/cropmonitor/api/v1/equipment"; // Change to equipment endpoint

export function getAllEquipmentData() {
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
      console.error("Error fetching equipment data:", error);
      throw error;
    },
  });
}

export function addEquipment(equipmentData) {
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
    data: JSON.stringify(equipmentData),
  })
    .then((response) => {
      return { status: 201, message: "Equipment added successfully" };
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while adding equipment. Please try again.";
      if (error.status === 409) {
        errorMessage =
          "Equipment already exists. Please use a different equipment ID.";
      } else if (error.status === 403) {
        errorMessage = "You do not have permission to add equipment.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}

export function updateEquipment(equipmentId, equipmentObj) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return Promise.reject("JWT token not found.");
  }
  return $.ajax({
    url: `${API_URL}/${equipmentId}`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(equipmentObj),
  })
    .then((response, textStatus, jqXHR) => {
      if (jqXHR.status === 204) {
        return { status: 204, message: "Equipment updated successfully" };
      }
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while updating equipment. Please try again.";

      if (error.status === 404) {
        errorMessage = "Equipment not found.";
      } else if (error.status === 403) {
        errorMessage = "You do not have permission to add equipment.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }

      return { status: error.status, message: errorMessage };
    });
}

export function getEquipmentById(equipmentId) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/${equipmentId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      return response;
    },
    error: function (error) {
      console.error("Error fetching equipment data:", error);
      throw error;
    },
  });
}

export function deleteEquipmentById(equipmentId) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/${equipmentId}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      return { status: 204, message: "Equipment deleted successfully" };
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while deleting equipment. Please try again.";
      if (error.status === 404) {
        errorMessage = "Equipment not found.";
      } else if (error.status === 403) {
        errorMessage = "You do not have permission to delete equipment.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}
