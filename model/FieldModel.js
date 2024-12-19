import { getJwtTokenFromCookies } from "./AuthModel.js";

const API_URL = "http://localhost:8080/cropmonitor/api/v1";

export function saveField(field) {
    
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/field`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: field,
    processData: false, 
    contentType: false,
  })
    .then((response) => {
      return { status: 201, message: "Field saved successfully" };
    })
    .catch((error) => {
      let errorMessage =
        "An error occurred while saving the field. Please try again.";
      if (error.status === 400) {
        errorMessage = "Bad request. Please check the provided data.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      return { status: error.status, message: errorMessage };
    });
}

export function getAllFields(){
    const token = getJwtTokenFromCookies();
    if (!token) {
        console.error("JWT token not found in cookies.");
        return;
    }
    return $.ajax({
        url: `${API_URL}/field`,
        method: "GET",
        headers: {
        Authorization: `Bearer ${token}`,
        },
        success: function (response) {
        return response;
        },
        error: function (error) {
        console.error("Error fetching field data:", error);
        throw error;
        },
    });
}

export function getFieldByCode(fieldCode){
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/field/${fieldCode}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (response) {
      return response;
    },
    error: function (error) {
      console.error("Error fetching field data:", error);
      throw error;
    },
  });
}

export function deleteFieldByCode(fieldCode){
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/field/${fieldCode}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response, textStatus, jqXHR) => {
    if (jqXHR.status === 204) {
      return { status: 204, message: "Field deleted successfully." };
    }
  })
  .catch((error) => {
    let errorMessage =
      "An error occurred while deleting Field. Please try again.";

    if (error.status === 404) {
      errorMessage = "Field not found.";
    } else if (error.responseJSON && error.responseJSON.message) {
      errorMessage = error.responseJSON.message;
    }

    return { status: error.status, message: errorMessage };
  });
}

export function updateFieldByCode(fieldCode, fieldData){
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return;
  }
  return $.ajax({
    url: `${API_URL}/field/${fieldCode}`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: fieldData,
    processData: false, 
    contentType: false,
  })
  .then((response, textStatus, jqXHR) => {
    if (jqXHR.status === 204) {
      return { status: 204, message: "Field updated successfully." };
    }
  })
  .catch((error) => {
    let errorMessage =
      "An error occurred while updating Field. Please try again.";

    if (error.status === 404) {
      errorMessage = "Field not found for update.";
    } else if (error.responseJSON && error.responseJSON.message) {
      errorMessage = error.responseJSON.message;
    }

    return { status: error.status, message: errorMessage };
  });
}
