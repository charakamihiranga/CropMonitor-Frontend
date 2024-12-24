import { getAllCrops } from "../model/CropModel.js";
import { getAllFields } from "../model/FieldModel.js";
import { saveLog } from "../model/LogModel.js";
import { getStaff } from "../model/StaffModel.js";

$(document).ready(function () {


    const addLogModal = setupModal(
        "#add-log-modal",
        "#add-log-btn",
        "#close-add-log-modal"
    );

  // handle save log button click
  $("#btn-save").on("click", async function () {
    const observation = $('#observation').val();
    const observedImage = $('#log-image')[0].files[0];
    const cropCodes = [];
    $("#selected-crop span").each(function () {
      cropCodes.push($(this).attr("data-cropCode"));
    });
    const fieldCodes = [];
    $("#selected-field span").each(function () {
      fieldCodes.push($(this).attr("data-fieldCode"));
    });
    const staffIds = [];
    $("#selected-staff span").each(function () {
      staffIds.push($(this).attr("data-staffId"));
    });

    const formData = new FormData(); 
    formData.append("observation", observation);
    formData.append("observedImage", observedImage);
    staffIds.forEach((staffId) => formData.append("staffIds", staffId));
    fieldCodes.forEach((fieldCode) => formData.append("fieldCodes", fieldCode));
    cropCodes.forEach((cropCode) => formData.append("cropCodes", cropCode));
    

    try {
      
      const response = await saveLog(formData);
      if (response.status === 201) {
        alert("Log saved successfully.");
        addLogModal.close();
        clearFields();
      }

    } catch (error) {
      console.error("Error saving log:", error);
      alert("Error saving log. Please try again.");
      
    }
    
  });  

  // Load crop data into the dropdowns
  async function loadCropDataToDropdown(selectedCropIds = []) {
    try {
      const cropData = await getAllCrops();
      const dropDowns = ["#crop-dropdown", "#view-crop-dropdown"];
      dropDowns.forEach((selector) => {
        const dropDown = $(selector);
        dropDown.empty();

        cropData.forEach((crop) => {
          const selected = selectedCropIds.includes(crop.cropCode)
            ? "selected"
            : ""; 
          dropDown.append(
            `<option value="${crop.cropCode}" ${selected} data-name="${crop.cropCommonName}">${crop.cropCommonName}</option>`
          );
        });
      });
    } catch (error) {
      console.error("Error loading crop data:", error);
      alert("Error loading crop data. Please try again.");
    }
  }  

  // Load field data into the dropdowns
  async function loadFieldDataToDropdown(selectedFieldIds = []) {
    try {
      const fieldData = await getAllFields();
      const dropDowns = ["#field-dropdown", "#view-field-dropdown"];
      dropDowns.forEach((selector) => {
        const dropDown = $(selector);
        dropDown.empty();

        fieldData.forEach((field) => {
          const selected = selectedFieldIds.includes(field.fieldCode)
            ? "selected"
            : ""; 
          dropDown.append(
            `<option value="${field.fieldCode}" ${selected} data-name="${field.fieldName}">${field.fieldName}</option>`
          );
        });
      });
    } catch (error) {
      console.error("Error loading field data:", error);
      alert("Error loading field data. Please try again.");
    }
  } 

  // Load staff data into the dropdowns
  async function loadStaffDataToDropdown(selectedStaffIds = []) {
    // Accept an array of selected IDs
    try {
      const staffData = await getStaff();
      const dropDowns = ["#staff-dropdown", "#view-staff-dropdown"];
      dropDowns.forEach((selector) => {
        const dropDown = $(selector);
        dropDown.empty();

        staffData.forEach((staff) => {
          const fullName = `${staff.firstName} ${staff.lastName}`.trim();
          const selected = selectedStaffIds.includes(staff.staffId)
            ? "selected"
            : ""; // Check if ID is in the array
          dropDown.append(
            `<option value="${staff.staffId}" ${selected} data-name="${fullName}">${fullName}</option>`
          );
        });
      });
    } catch (error) {
      console.error("Error loading staff data:", error);
      alert("Error loading staff data. Please try again.");
    }
  }

  // field badge management
$("#field-dropdown").on("change", function () {
    const selectedOption = $(this).find(":selected");
    if (selectedOption.val()) {
      addFieldBadge(selectedOption.val(), selectedOption.text());
      selectedOption.remove(); // Remove selected field from the dropdown
    }
  });

  $("#field-dropdown")
    .prop("multiple", true)
    .on("change", function () {
      // Added multiple prop
      for (const option of this.selectedOptions) {
        const fieldCode = option.value;
        const fieldName = option.text;
        addFieldBadge(fieldCode, fieldName);
      }
      $(this).prop("selectedIndex", -1); // Clear selection after adding badges
    });


  // Function to add a staff badge (modified to prevent duplicates)
  function addFieldBadge(fieldCode, fieldName) {
    const existingBadge = $(
      "#selected-field span[data-staffId='" + fieldCode + "']"
    );
    if (!existingBadge.length) {
      const badge = $("<span>")
        .addClass(
          "bg-green-200 text-green-800 rounded-full px-3 py-1 text-sm flex items-center gap-2"
        )
        .attr("data-fieldCode", fieldCode)
        .html(`${fieldName} <i class="fas fa-times cursor-pointer"></i>`);

      badge.appendTo("#selected-field");

      badge.find("i").on("click", function () {
        removeFieldBadge(fieldCode, fieldName, badge);
      });
    }
  }

  // Function to remove a field badge (modified to add back to dropdown)
  function removeFieldBadge(fieldCode, fieldName, badgeElement) {
    const option = $("<option>").val(fieldCode).text(fieldName);
    $("#field-dropdown").append(option);
    $("#field-dropdown").val(""); // Ensure no option is selected after adding back
    badgeElement.remove();
  }

  // Crop badge management

  $("#crop-dropdown").on("change", function () {
    const selectedOption = $(this).find(":selected");
    if (selectedOption.val()) {
      addCropBadge(selectedOption.val(), selectedOption.text());
      selectedOption.remove(); // Remove selected field from the dropdown
    }
  });

  $("#crop-dropdown")
    .prop("multiple", true)
    .on("change", function () {
      // Added multiple prop
      for (const option of this.selectedOptions) {
        const cropCode = option.value;
        const cropName = option.text;
        addCropBadge(cropCode, cropName);
      }
      $(this).prop("selectedIndex", -1); // Clear selection after adding badges
    });


  // Function to add a staff badge (modified to prevent duplicates)
  function addCropBadge(cropCode, cropName) {
    const existingBadge = $(
      "#selected-field span[data-staffId='" + cropCode + "']"
    );
    if (!existingBadge.length) {
      const badge = $("<span>")
        .addClass(
          "bg-green-200 text-green-800 rounded-full px-3 py-1 text-sm flex items-center gap-2"
        )
        .attr("data-cropCode", cropCode)
        .html(`${cropName} <i class="fas fa-times cursor-pointer"></i>`);

      badge.appendTo("#selected-crop");

      badge.find("i").on("click", function () {
        removeCropBadge(cropCode, cropName, badge);
      });
    }
  }

  // Function to remove a field badge (modified to add back to dropdown)
  function removeCropBadge(cropCode, cropName, badgeElement) {
    const option = $("<option>").val(cropCode).text(cropName);
    $("#crop-dropdown").append(option);
    $("#crop-dropdown").val(""); // Ensure no option is selected after adding back
    badgeElement.remove();
  }



  // Staff badge management
  $("#staff-dropdown").on("change", function () {
    const selectedOption = $(this).find(":selected");
    if (selectedOption.val()) {
      addStaffBadge(selectedOption.val(), selectedOption.text());
      selectedOption.remove(); // Remove selected staff from the dropdown
    }
  });

  $("#staff-dropdown")
    .prop("multiple", true)
    .on("change", function () {
      // Added multiple prop
      for (const option of this.selectedOptions) {
        const staffId = option.value;
        const staffName = option.text;
        addStaffBadge(staffId, staffName);
      }
      $(this).prop("selectedIndex", -1); // Clear selection after adding badges
    });
  $("#view-staff-dropdown")
    .prop("multiple", true)
    .on("change", function () {
      // Added multiple prop
      for (const option of this.selectedOptions) {
        const staffId = option.value;
        const staffName = option.text;
        addStaffBadgetoView(staffId, staffName);
      }
      $(this).prop("selectedIndex", -1); // Clear selection after adding badges
    });

  // Function to add a staff badge (modified to prevent duplicates)
  function addStaffBadge(staffId, staffName) {
    const existingBadge = $(
      "#selected-staff span[data-staffId='" + staffId + "']"
    );
    if (!existingBadge.length) {
      const badge = $("<span>")
        .addClass(
          "bg-green-200 text-green-800 rounded-full px-3 py-1 text-sm flex items-center gap-2"
        )
        .attr("data-staffId", staffId)
        .html(`${staffName} <i class="fas fa-times cursor-pointer"></i>`);

      badge.appendTo("#selected-staff");

      badge.find("i").on("click", function () {
        removeStaffBadge(staffId, staffName, badge);
      });
    }
  }
  function addStaffBadgetoView(staffId, staffName) {
    const existingBadge = $(
      "#view-selected-staff span[data-staffId='" + staffId + "']"
    );
    if (!existingBadge.length) {
      const badge = $("<span>")
        .addClass(
          "bg-green-200 text-green-800 rounded-full px-3 py-1 text-sm flex items-center gap-2"
        )
        .attr("data-staffId", staffId)
        .html(`${staffName} <i class="fas fa-times cursor-pointer"></i>`);

      badge.appendTo("#view-selected-staff");

      badge.find("i").on("click", function () {
        removeStaffBadgeFromView(staffId, staffName, badge);
      });
    }
  }

  // Function to remove a staff badge (modified to add back to dropdown)
  function removeStaffBadge(staffId, staffName, badgeElement) {
    const option = $("<option>").val(staffId).text(staffName);
    $("#staff-dropdown").append(option);
    $("#staff-dropdown").val(""); // Ensure no option is selected after adding back
    badgeElement.remove();
  }
  function removeStaffBadgeFromView(staffId, staffName, badgeElement) {
    const option = $("<option>").val(staffId).text(staffName);
    $("#view-staff-dropdown").append(option);
    $("#view-staff-dropdown").val(""); // Ensure no option is selected after adding back
    badgeElement.remove();
  }

  function removeAllBadges() {
    $("#selected-staff").empty();
    $("#selected-field").empty();
    $("#selected-crop").empty();
    }

    // clear fields
    function clearFields() {
        $("#log-image").val("");
        $("#log-preview").attr("src", "").addClass("hidden");
        $("#file-upload").removeClass("hidden");
        $("#crop-preview").addClass("hidden").attr("src", "");
        $("#staff-dropdown").val("");
        $("#remarks").val("");
        removeAllBadges();
    }

    // handle file upload preview
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

    // Setup modal functionality
  function setupModal(modalSelector, triggerSelector, closeSelector) {
    const $modal = $(modalSelector);
    const $modalContent = $modal.find(".popup-modal");

    $(triggerSelector).on("click", () => {
      $modal.removeClass("hidden opacity-0");
      setTimeout(() => $modalContent.removeClass("scale-95"), 10);
      loadCropDataToDropdown();
      loadFieldDataToDropdown();
      loadStaffDataToDropdown();
    });

    $(closeSelector).on("click", () => closeModal());

    $modal.on("click", (e) => {
      if ($(e.target).is($modal)) closeModal();
    });

    function closeModal() {
      clearFields();
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

  handleFileUpload("log-image", "log-preview", "file-upload");
  loadStaffDataToDropdown();
  loadFieldDataToDropdown();
  loadCropDataToDropdown();

});