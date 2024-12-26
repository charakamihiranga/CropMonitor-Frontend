export function formatName(name){
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function base64ToFile(base64String, fileName = 'image.jpg') {
    // Extract the Base64 content after the comma (if the Base64 string has a data URL prefix)
    
    // Decode the Base64 string into binary data
    const byteCharacters = atob(base64String);
    
    // Convert byte characters into an array of bytes
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset++) {
        const byte = byteCharacters.charCodeAt(offset);
        byteArrays.push(byte);
    }
    
    // Create a Uint8Array from the byte array
    const byteArray = new Uint8Array(byteArrays);
    
    // Create and return a File object (inherits from Blob)
    return new File([byteArray], fileName, { type: 'image/jpeg' }); // Adjust MIME type if needed
}


