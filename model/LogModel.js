import { getJwtTokenFromCookies } from "./AuthModel.js";

const API_URL = "http://localhost:8080/cropmonitor/api/v1";

export async function saveLog(log) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return { status: 401, message: "Unauthorized: JWT token missing." };
  }

  try {
    const response = await $.ajax({
      url: `${API_URL}/monitoringlog`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: log,
      processData: false,
      contentType: false,
    });

    return { status: 201, message: "Log saved successfully", data: response };
  } catch (error) {
    let errorMessage =
      "An error occurred while saving the log. Please try again.";
    if (error.status === 400) {
      errorMessage = "Bad request. Please check the provided data.";
    } else if (error.status === 403) {
      errorMessage = "You are not authorized to perform this action.";
    } else if (error.responseJSON?.message) {
      errorMessage = error.responseJSON.message;
    }
    console.error("Error:", error);
    return { status: error.status, message: errorMessage };
  }
}

export async function deleteLog(logCode) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return { status: 401, message: "Unauthorized: JWT token missing." };
  }

  try {
    await $.ajax({
      url: `${API_URL}/monitoringlog/${logCode}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { status: 204, message: "Log deleted successfully" };
  } catch (error) {
    if (error.status === 403) {
      return {
        status: error.status,
        message: "You are not authorized to perform this action.",
      };
    }
    return { status: error.status, message: "Error deleting log" };
  }
}

export async function updateLog(logCode, log) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return { status: 401, message: "Unauthorized: JWT token missing." };
  }

  try {
    const response = await $.ajax({
      url: `${API_URL}/monitoringlog/${logCode}`,
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: log,
      processData: false,
      contentType: false,
    });

    return { status: 200, message: "Log updated successfully", data: response };
  } catch (error) {
    let errorMessage =
      "An error occurred while updating the log. Please try again.";
    if (error.status === 400) {
      errorMessage = "Bad request. Please check the provided data.";
    } else if (error.status === 403) {
      errorMessage = "You are not authorized to perform this action.";
    } else if (error.responseJSON?.message) {
      errorMessage = error.responseJSON.message;
    }
    console.error("Error:", error);
    return { status: error.status, message: errorMessage };
  }
}

export async function getLogByCode(logCode) {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return { status: 401, message: "Unauthorized: JWT token missing." };
  }

  try {
    const response = await $.ajax({
      url: `${API_URL}/monitoringlog/${logCode}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching log data:", error);
    return { status: error.status, message: "Error fetching log data" };
  }
}

export async function getLogs() {
  const token = getJwtTokenFromCookies();
  if (!token) {
    console.error("JWT token not found in cookies.");
    return { status: 401, message: "Unauthorized: JWT token missing." };
  }

  try {
    const response = await $.ajax({
      url: `${API_URL}/monitoringlog`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching log data:", error);
    return { status: error.status, message: "Error fetching log data" };
  }
}
