import { getAllFields } from "../model/FieldModel.js";
import { saveCrop, getAllCrops, updateCropByCode, deleteCropByCode } from "../model/CropModel.js";
$(document).ready(function () {
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
    const cropCommonName = $("#common-name").val();
    const cropScientificName = $("#scientific-name").val();
    const category = $("#category").val();
    const cropSeason = $("#crop-season").val();
    const fieldCode = $("#field-dropdown").val();
    const cropImage = $("#crop-image")[0].files[0];

    const crop = new FormData();
    crop.append("cropCommonName", cropCommonName);
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
        alert(response.message);
      }
    } catch (error) {
      console.error("Error saving crop data:", error);
      alert("Error saving crop data. Please try again.");
    }
  });

  async function loadAllCrops() {
    try {
      const crops = await getAllCrops();

      const $cropCardsContainer = $("#crop-cards");
      $cropCardsContainer.empty(); // Clear the container before adding new data

      crops.forEach(function (crop) {
        const $card = $("<div>")
          .addClass(
            "bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          )
          .on("click", function () {
            openViewCropModal(crop);
          });

        // Crop Image
        const $cropImage = $("<img>")
          .attr(
            "src",
            crop.cropImage
              ? `data:image/png;base64,${crop.cropImage}`
              : "https://via.placeholder.com/300"
          )
          .attr("alt", "Crop Image")
          .addClass("w-full h-48 object-cover");

        // Card Content
        const $cardContent = $("<div>").addClass("p-4");

        const $cropCommonName = $("<h2>")
          .addClass("text-lg font-semibold text-gray-800 truncate")
          .text(crop.cropCommonName);

        const $cropScientificName = $("<p>")
          .addClass("text-sm text-gray-500 truncate")
          .html(
            `Scientific Name: <span class="font-medium">${crop.cropScientificName}</span>`
          );

        const $cropCategory = $("<p>")
          .addClass("text-sm text-gray-500 truncate")
          .html(`Category: <span class="font-medium">${crop.category}</span>`);

        const $cropSeason = $("<p>")
          .addClass("text-sm text-gray-500 truncate")
          .html(`Season: <span class="font-medium">${crop.cropSeason}</span>`);

        const $cropCode = $("<p>")
          .addClass("text-sm text-gray-500 truncate")
          .html(`Code: <span class="font-medium">${crop.cropCode}</span>`);

        // Append all elements to cardContent
        $cardContent.append(
          $cropCommonName,
          $cropScientificName,
          $cropCategory,
          $cropSeason,
          $cropCode
        );

        // Append image and content to the card
        $card.append($cropImage, $cardContent);

        // Append the card to the container
        $cropCardsContainer.append($card);
      });
    } catch (error) {
      console.error("Error loading crop data:", error);
      alert("Error loading crop data. Please try again.");
    }
  }

  // codes for opening view crop modal
  function openViewCropModal(crop) {

    $("#view-common-name").val(crop.cropCommonName);
    $("#view-scientific-name").val(crop.cropScientificName);
    $("#view-category").val(crop.category);
    $("#view-crop-season").val(crop.cropSeason);
    $("#view-code").val(crop.cropCode);
    $("#view-crop-image").attr(
      "src",
      crop.cropImage
        ? `data:image/png;base64,${crop.cropImage}`
        : "https://via.placeholder.com/300"
    );
    viewCrop.open();

    $("#btn-delete").on("click", function () {
      $("delete-crop-name").text(crop.cropCommonName);
      viewCrop.close();
      deletecrop.open();
      $("#btn-delete-crop").on("click", function () {
        deleteCrop(crop.cropCode);
      });
    });

    $("#btn-update").on("click", function () {
        updateCrop(crop.cropCode);
    });
  }

    // Update crop button
    async function updateCrop(cropCode) {
        
        const cropCommonName = $("#view-common-name").val();
        const cropScientificName = $("#view-scientific-name").val();
        const category = $("#view-category").val();
        const cropSeason = $("#view-crop-season").val();
        const fieldCode = $("#view-field-dropdown").val();
    
        const crop = new FormData();
        crop.append("commonName", cropCommonName);
        crop.append("scientificName", cropScientificName);
        crop.append("category", category);
        crop.append("season", cropSeason);
        crop.append("fieldCode", fieldCode);
        try {
          const response = await updateCropByCode(cropCode, crop);
          if (response.status === 204) {
            viewCrop.close();
            clearFields();
            loadAllCrops
            alert(response.message);
          }
        } catch (error) {
          console.error("Error saving crop data:", error);
          alert("Error saving crop data. Please try again.");
        }
    }

  // Delete crop button
  async function deleteCrop(cropCode) {
    try{
        let response = await deleteCropByCode(cropCode);
    if (response.status === 204) {
      alert(response.message);
      deletecrop.close();
      loadAllCrops();
    } else {
      alert(response.message);
    }
    } catch (error) {
      console.error("Error deleting crop data:", error);
      alert("Error deleting crop data. Please try again.");
    }
  }

  function clearFields() {
    $("#common-name").val("");
    $("#scientific-name").val("");
    $("#category").val("");
    $("#crop-season").val("");
    $("#field-dropdown").val("");
    $("#crop-image").val("");
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
      alert("Error loading field data. Please try again.");
    }
  }

  // Setup modal functionality
  function setupModal(modalSelector, triggerSelector, closeSelector) {
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

  // File preview functionality
  $("#crop-image").on("change", function () {
    const file = this.files[0];
    const previewId = "#file-info"; // Assuming you have an element with id 'file-info' to display the file name
    if (file?.type.startsWith("image/")) {
      $(previewId).text(file.name).removeClass("hidden");
    } else {
      alert("Please select a valid image file.");
    }
  });

  // initial setup
  loadFieldDataToDropDown();
  loadAllCrops();
});
