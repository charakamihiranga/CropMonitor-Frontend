import { getAllFields, getFieldByCode } from "../model/FieldModel.js";
import {
  saveCrop,
  getAllCrops,
  updateCropByCode,
  deleteCropByCode,
  getCropByCode,
} from "../model/CropModel.js";
import { base64ToFile, setupModal } from "../assets/js/util.js";
$(document).ready(function () {
  const notyf = new Notyf({
    duration: 3000,  
    position: { x: 'right', y: 'top' },  
  });
  let ascending = true;
  let filteredCrops = [];
  const addCrop = setupModal(
    "#add-crop-modal",
    "#add-crop-btn",
    "#close-add-crop-modal"
  );
  const viewCrop = setupModal(
    "#view-crop-modal",
    "#btn-update",
    "#view-crop-close"
  );
  const deletecrop = setupModal(
    "#delete-crop-modal",
    "#btn-delete",
    "#close-delete-modal"
  );

  // save crop button
  $("#btn-save").on("click", async function () {
    if(!validateForm()) {
      return;
    }
    const cropCommonName = $("#common-name").val();
    const cropScientificName = $("#scientific-name").val();
    const category = $("#category").val();
    const cropSeason = $("#crop-season").val();
    const fieldCode = $("#field-dropdown").val();
    const cropImage = $("#crop-image")[0].files[0];

    const crop = new FormData();
    crop.append("commonName", cropCommonName);
    crop.append("scientificName", cropScientificName);
    crop.append("category", category);
    crop.append("season", cropSeason);
    crop.append("fieldCode", fieldCode);
    crop.append("cropImage", cropImage);

    try {
      const response = await saveCrop(crop);
      if (response.status === 201) {
        addCrop.close();
        clearFields();
        loadAllCrops();
        notyf.success(response.message);
      }
    } catch (error) {
      console.error("Error saving crop data:", error);
      notyf.error("Error saving crop data. Please try again.");
    }
  });

  async function loadAllCrops(searchTerm = "") {
    $("#loader").show(); // Show loader
    try {
      const crops = await getAllCrops();
      filteredCrops = crops;

      // Filter crops based on search term
      if (searchTerm) {
        filteredCrops = crops.filter((crop) => {
          const commonName = crop.cropCommonName?.toLowerCase() || "";
          const scientificName = crop.cropScientificName?.toLowerCase() || "";
          const category = crop.category?.toLowerCase() || "";
          const cropSeason = crop.cropSeason?.toLowerCase() || "";

          return (
            commonName.includes(searchTerm.toLowerCase()) ||
            scientificName.includes(searchTerm.toLowerCase()) ||
            category.includes(searchTerm.toLowerCase()) ||
            cropSeason.includes(searchTerm.toLowerCase())
          );
        });
      }

      sortCrops(); // Apply sorting after filtering
      setCropData(filteredCrops); // Populate the table
    } catch (error) {
      console.error("Error loading crop data:", error);
      notyf.error("Error loading crop data. Please try again.");
    } finally {
      $("#loader").hide(); // Hide loader after operation
    }
  }

  // Sorting function for crops
  function sortCrops() {
    filteredCrops.sort((a, b) => {
      const valueA = a.cropCommonName?.toLowerCase() || "";
      const valueB = b.cropCommonName?.toLowerCase() || "";

      return ascending
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  }

  // Populate the crops table with the filtered data
  function setCropData(crops) {
    const tableBody = $(".vehicle-table-body");
    tableBody.empty();

    let row;

    crops.forEach((crop, index) => {
      row = $(`
        <div class="table-row grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-gray-100 poppins-medium text-xs sm:text-sm hover:bg-green-100 p-3 cursor-pointer rounded-lg mt-1 transition-all" data-index="${index}">
            <div class="p-2 truncate">${crop.cropCommonName || "N/A"}</div>
            <div class="p-2 truncate">${crop.cropScientificName || "N/A"}</div>
            <div class="p-2 hidden sm:block truncate">${
              crop.category || "N/A"
            }</div>
            <div class="p-2 truncate">${crop.cropSeason || "N/A"}</div>
        </div>
      `);

      tableBody.append(row);
      row.on("click", function () {
        // Return the selected crop object
        const selectedCrop = crops[index];
        openViewCropModal(selectedCrop.cropCode);
      });
    });
  }

  // Event listeners for sorting headers
  $("#sort-category").on("click", () => {
    ascending = !ascending;
    $("#sort-category").toggleClass("fa-sort-down fa-sort-up");
    sortCrops(); // Reapply sorting after clicking on the column
    setCropData(filteredCrops); // Re-render the sorted table data
  });

  // codes for opening view crop modal
  async function openViewCropModal(cropCode) {
    // Load the specific crop data by cropCode
    const cropByCropCode = await getCropByCode(cropCode);

    // Populate modal with crop details
    $("#view-common-name").val(cropByCropCode.cropCommonName);
    $("#view-scientific-name").val(cropByCropCode.cropScientificName);
    $("#view-category").val(cropByCropCode.category);
    $("#view-crop-season").val(cropByCropCode.cropSeason);
    $("#view-code").val(cropByCropCode.cropCode);
    $("#view-crop-image").attr(
      "src",
      cropByCropCode.cropImage
        ? `data:image/png;base64,${cropByCropCode.cropImage}`
        : "https://via.placeholder.com/300"
    );

    // Load field dropdown data
    const fieldByFieldCode = await getFieldByCode(cropByCropCode.fieldCode);
    loadFieldDataToDropDown(fieldByFieldCode.fieldCode);

    // Open modal
    viewCrop.open();

    // Handle the update button click
    $("#btn-update")
      .off("click")
      .on("click", async function () {
        await updateCrop(cropByCropCode.cropCode,cropByCropCode.cropImage); // Pass the specific cropCode to the update function
      });

    // Handle delete functionality
    $("#btn-delete")
      .off("click")
      .on("click", function () {
        $("delete-crop-name").text(cropByCropCode.cropCommonName);
        viewCrop.close();
        deletecrop.open();
        $("#btn-delete-crop").on("click", function () {
          deleteCrop(cropByCropCode.cropCode);
        });
      });
  }

  async function updateCrop(cropCode,cropImage) {
    const cropCommonName = $("#view-common-name").val();
    const cropScientificName = $("#view-scientific-name").val();
    const category = $("#view-category").val();
    const cropSeason = $("#view-crop-season").val();
    const fieldCode = $("#view-field-dropdown").val();
    let updateCropImage = $("#update-crop-image")[0].files[0];

    if (!updateCropImage) {
      updateCropImage = base64ToFile(cropImage, "image.jpg");
    }

    const crop = new FormData();
    crop.append("commonName", cropCommonName);
    crop.append("scientificName", cropScientificName);
    crop.append("category", category);
    crop.append("season", cropSeason);
    crop.append("fieldCode", fieldCode);
    crop.append("cropImage", updateCropImage);

    try {
      const response = await updateCropByCode(cropCode, crop);
      if (response.status === 204) {
        viewCrop.close();
        clearFields();
        loadAllCrops(); // Reload the crops after update, but ensure this is only done after the specific crop update
        notyf.success(response.message);
      }
    } catch (error) {
      console.error("Error saving crop data:", error);
      notyf.error("Error saving crop data. Please try again.");
    }
  }

  // Delete crop button
  async function deleteCrop(cropCode) {
    try {
      let response = await deleteCropByCode(cropCode);
      if (response.status === 204) {
        notyf.success(response.message);
        deletecrop.close();
        loadAllCrops();
      } else {
        notyf.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting crop data:", error);
      notyf.error("Error deleting crop data. Please try again.");
    }
  }

  function clearFields() {
    $("#common-name").val("");
    $("#scientific-name").val("");
    $("#category").val("");
    $("#crop-season").val("");
    $("#field-dropdown").val("");
    $("#crop-image").val("");
    $("#update-crop-image").val("");
  }

  // Load staff data into the dropdowns
  async function loadFieldDataToDropDown(selectedFieldCode = null) {
    try {
      const fieldData = await getAllFields();
      const dropDowns = ["#field-dropdown", "#view-field-dropdown"];
      dropDowns.forEach((selector) => {
        const dropDown = $(selector);
        dropDown.empty();
        dropDown.append(
          '<option value="" disabled selected>Select Field</option>'
        );
        fieldData.forEach((field) => {
          const fieldName = `${field.fieldName}`.trim();
          const selected =
            field.fieldCode === selectedFieldCode ? "selected" : "";
          dropDown.append(
            `<option value="${field.fieldCode}" ${selected} data-name="${fieldName}">${fieldName}</option>`
          );
        });
      });
    } catch (error) {
      console.error("Error loading field data:", error);
      notyf.error("Error loading field data. Please try again.");
    }
  }

  // File preview functionality
  function handleFileUpload(inputId, previewId, containerId) {
    $("#" + inputId).on("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          $("#" + previewId).attr("src", e.target.result); // Set the image preview
          $("#" + previewId).removeClass("hidden");
          $("#" + containerId).addClass("hidden"); // Hide the file upload div
        };
        reader.readAsDataURL(file);
      }
    });
  }

  handleFileUpload("crop-image", "crop-preview", "file-upload");
  handleFileUpload("update-crop-image", "update-crop-preview", "update-file-upload");

  // Listen for search bar updates from parent window (dashboard)
  window.addEventListener("message", (event) => {
    if (event.data.type === "SEARCH_UPDATE") {
      const searchQuery = event.data.query;
      loadAllCrops(searchQuery); // Refetch and filter data based on search term
    }
  });

  function validateForm() {
    const cropCommonName = $("#common-name").val();
    const cropScientificName = $("#scientific-name").val();
    const category = $("#category").val();
    const cropSeason = $("#crop-season").val();
    const fieldCode = $("#field-dropdown").val();
    const cropImage = $("#crop-image")[0].files[0];
  
    let isValid = true;
    const errorMessages = [];
  
    // Check if required fields are empty
    if (!cropCommonName.trim()) {
      isValid = false;
      errorMessages.push("Crop common name is required.");
    }
    if (!cropScientificName.trim()) {
      isValid = false;
      errorMessages.push("Crop scientific name is required.");
    }
    if (!category.trim()) {
      isValid = false;
      errorMessages.push("Category is required.");
    }
    if (!cropSeason.trim()) {
      isValid = false;
      errorMessages.push("Crop season is required.");
    }
    if (!fieldCode) {
      isValid = false;
      errorMessages.push("Field selection is required.");
    }
    
    // Check if image is uploaded and valid
    if (!cropImage) {
      isValid = false;
      errorMessages.push("Crop image is required.");
    } else if (!cropImage.type.startsWith("image/")) {
      isValid = false;
      errorMessages.push("Uploaded file must be an image.");
    }
  
    // Display all errors if validation fails
    if (!isValid) {
      errorMessages.forEach((message) => {
        notyf.error(message);  // Use Notyf or any other method to show each error message
      });
    }
  
    return isValid;
  }
  

  // initial setup
  loadFieldDataToDropDown();
  loadAllCrops();
});
