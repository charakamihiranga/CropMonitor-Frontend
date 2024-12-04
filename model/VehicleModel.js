import { getJwtTokenFromCookies } from "./AuthModel.js";

const API_URL = "http://localhost:8080/cropmonitor/api/v1/vehicle"

export function getAllVehicleData(){
    const token = getJwtTokenFromCookies();
    if(!token){
        console.error("JWT token not found in cookies.");
        return;
    }
    return $.ajax({
        url: `${API_URL}`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        success: function(response){
            console.log(response);
            return response;
        },
        error: function(error){
            console.error("Error fetching vehicle data:", error);
            throw error;
        },
    });
};