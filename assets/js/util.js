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

export function decodeJwt(token){
    const base64Url = token.split('.')[1];  
    const base64 = base64Url.replace('-', '+').replace('_', '/');  
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload)
}


  // Setup modal functionality
 export function setupModal(modalSelector, triggerSelector, closeSelector) {
    const $modal = $(modalSelector);
    const $modalContent = $modal.find(".popup-modal");

    $(triggerSelector).on("click", () => {
      $modal.removeClass("hidden opacity-0");
      setTimeout(() => $modalContent.removeClass("scale-95"), 10);
    });

    $(closeSelector).on("click", () => closeModal());

    $modal.on("click", (e) => {
      if ($(e.target).is($modal)) closeModal();
    });

    function closeModal() {
      $modal.addClass("opacity-0");
      $modalContent.addClass("scale-95");
      setTimeout(() => $modal.addClass("hidden"), 300);
    }

    return {
      open: () => {
        $modal.removeClass("hidden opacity-0");
        setTimeout(() => $modalContent.removeClass("scale-95"), 10);
      },
      close: closeModal,
    };
  }

export function generateRandomCode(length = 6){
    return Math.random().toString(36).substring(2,2 + length).toUpperCase();
}