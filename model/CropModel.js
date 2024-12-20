import { getJwtTokenFromCookies } from "./AuthModel.js";

const API_URL = "http://localhost:8080/cropmonitor/api/v1";

export function saveCrop(crop){
    const token = getJwtTokenFromCookies();
    if (!token) {
        console.error("JWT token not found in cookies.");
        return;
    }
    return $.ajax({
        url: `${API_URL}/crop`,
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        },
        data: crop,
        processData: false, 
        contentType: false,
    })
    .then((response) => {
        return { status: 201, message: "Crop saved successfully" };
    })
    .catch((error) => {
        let errorMessage =
            "An error occurred while saving the crop. Please try again.";
        if (error.status === 400) {
            errorMessage = "Bad request. Please check the provided data.";
        } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message;
        }
        return { status: error.status, message: errorMessage };
    });
}

export function getAllCrops(){
    const token = getJwtTokenFromCookies();
    if (!token) {
        console.error("JWT token not found in cookies.");
        return;
    }
    return $.ajax({
        url: `${API_URL}/crop`,
        method: "GET",
        headers: {
        Authorization: `Bearer ${token}`,
        },
        success: function (response) {
        return response;
        },
        error: function (error) {
        console.error("Error fetching crop data:", error);
        throw error;
        },
    });
}

export function getCropByCode(cropCode){
    const token = getJwtTokenFromCookies();
    if (!token) {
        console.error("JWT token not found in cookies.");
        return;
    }
    return $.ajax({
        url: `${API_URL}/crop/${cropCode}`,
        method: "GET",
        headers: {
        Authorization: `Bearer ${token}`,
        },
        success: function (response) {
        return response;
        },
        error: function (error) {
        console.error("Error fetching crop data:", error);
        throw error;
        },
    });
}

export function deleteCropByCode(cropCode){
    const token = getJwtTokenFromCookies();
    if (!token) {
        console.error("JWT token not found in cookies.");
        return;
    }
    return $.ajax({
        url: `${API_URL}/crop/${cropCode}`,
        method: "DELETE",
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })
    .then((response) => {
        return { status: 204, message: "Crop deleted successfully" };
    })
    .catch((error) => {
        let errorMessage =
            "An error occurred while deleting the crop. Please try again.";
        if (error.status === 404) {
            errorMessage = "Crop not found. Please check the provided crop code.";
        } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message;
        }
        return { status: error.status, message: errorMessage };
    });
}

export function updateCropByCode(cropCode, crop){

    const token = getJwtTokenFromCookies();
    if (!token) {
        console.error("JWT token not found in cookies.");
        return;
    }
    return $.ajax({
        url: `${API_URL}/crop/${cropCode}`,
        method: "PATCH",
        headers: {
        Authorization: `Bearer ${token}`,
        },
        data: crop,
        processData: false, 
        contentType: false,
    })
    .then((response) => {
        return { status: 204, message: "Crop updated successfully" };
    })
    .catch((error) => {
        let errorMessage =
            "An error occurred while updating the crop. Please try again.";
        if (error.status === 404) {
            errorMessage = "Crop not found. Please check the provided crop code.";
        } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message;
        }
        return { status: error.status, message: errorMessage };
    });
}

