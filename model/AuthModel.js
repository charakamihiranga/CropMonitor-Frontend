import { decodeJwt } from "../assets/js/util.js";

// Get JWT Token from Cookies
function getJwtTokenFromCookies() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === 'JWT') {
            return value;
        }
    }
    return null; // Return null if token not found
}

// Save JWT Token in Cookies
function saveJwtTokenToCookie(token) {
    document.cookie = `JWT=${token}; path=/; max-age=3600; secure; SameSite=Strict`; 
    // `max-age=3600` means the token will expire in 1 hour.
}

async function checkPasswordValidity(userEmail, userPassword){

    
    const formData = new FormData();
    formData.append("email", userEmail);
    formData.append("password", userPassword);

    // Check if the password is correct
    return new Promise((resolve) => {
        $.ajax({
            url: "http://localhost:8080/cropmonitor/api/v1/auth/login",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                resolve(true);
            },
            error: function () {
                resolve(false);
            },
        });
    });
}



export{ getJwtTokenFromCookies, saveJwtTokenToCookie, checkPasswordValidity }
