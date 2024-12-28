import { base64ToFile } from "../assets/js/util.js";
import { getAllCrops, getCropByCode } from "../model/CropModel.js";
import { getAllFields, getFieldByCode } from "../model/FieldModel.js";
import { deleteLog, getLogByCode, getLogs, saveLog, updateLog } from "../model/LogModel.js";
import { getStaff, getStaffById } from "../model/StaffModel.js";

$(document).ready(function () {
  const addLogModal = setupModal(
    "#add-log-modal",
    "#add-log-btn",
    "#close-add-log-modal"
  );
  const viewLogModal = setupModal(
    "#view-log-modal",
    "#view-log-btn",
    "#view-log-close"
  );
  const deleteModal = setupModal(
    "#delete-log-modal",
    "#btn-delete",
    "#close-delete-modal"
  );
  async function getAllLogs() {
    try {
      const logs = (await getLogs()) || [];
      $("#logContainer").empty();

      logs.forEach((log) => {
        const card = `
        <div class="bg-white bg-green-200 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col h-96" data-log-code="${
          log.logCode
        }">
          <img src="data:image/jpeg;base64,${
            log.observedImage
          }" alt="Observation Image" class="w-full h-40 object-cover rounded-t-xl" />
          <div class="p-4 px-6 flex flex-col flex-grow">
            <p class="text-sm text-gray-500 mt-2  line-clamp-6">
              <span class="font-medium text-sm text-gray-700">${
                log.observation
              }</span>
            </p>
            <p class="text-xs text-black font-bold mt-auto">
              ${new Date(log.logDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      `;
        $("#logContainer").append(card);
      });
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Failed to load logs. Please try again later.");
    }
  }

  $("#logContainer").on("click", "div[data-log-code]", function () {
    const logCode = $(this).data("log-code");
    openViewLogModal(logCode);
  });

  async function openViewLogModal(logCode) {
    const logByCode = await getLogByCode(logCode);

    if (logByCode) {
      $("#view-log-image").attr(
        "src",
        `data:image/jpeg;base64,${logByCode.observedImage}`
      );
      $("#view-observation").val(logByCode.observation);
      logByCode.staffIds.forEach((staffId) => {
        getStaffById(staffId).then((staffMember) => {
          addStaffBadgetoView(
            staffMember.staffId,
            `${staffMember.firstName} ${staffMember.lastName}`
          );
        });
      });
      logByCode.fieldCodes.forEach((fieldCode) => {
        getFieldByCode(fieldCode)
          .then((field) => {
            addFieldBadgeToView(field.fieldCode, field.fieldName);
          })
          .catch((error) => {
            console.error("Error fetching field by code:", error);
          });
      });
      logByCode.cropCodes.forEach((cropCode) => {
        getCropByCode(cropCode).then((crop) => {
          addCropBadgetoView(crop.cropCode, crop.cropCommonName);
        });
      });
    }
    viewLogModal.open();

    $("#btn-delete-log").on("click", function () {
      handleBtnDelete(logCode);
    });

    $("#btn-update").on("click", function () {
      handleUpdateLog(logCode, logByCode.observedImage);
    });
  }

  //handle update button click
  async function handleUpdateLog(logCode, image){
    const observation = $("#view-observation").val();
    let observedImage = $("#update-log-image")[0].files[0];
    const cropCodes = [];
    $("#view-selected-crop span").each(function () {
      cropCodes.push($(this).attr("data-cropCode"));
    });
    const fieldCodes = [];
    $("#view-selected-field span").each(function () {
      fieldCodes.push($(this).attr("data-fieldCode"));
    });
    const staffIds = [];
    $("#view-selected-staff span").each(function () {
      staffIds.push($(this).attr("data-staffId"));
    }); 
    if(!observedImage){
      observedImage = base64ToFile(image);
    }
    
    const formData = new FormData();
    formData.append("observation", observation);
    formData.append("observedImage", observedImage);
    staffIds.forEach((staffId) => formData.append("staffIds", staffId));
    fieldCodes.forEach((fieldCode) => formData.append("fieldCodes", fieldCode));
    cropCodes.forEach((cropCode) => formData.append("cropCodes", cropCode));
    try {
      const response = await updateLog(logCode, formData);
      if (response.status === 200) {
        alert("Log updated successfully.");
        viewLogModal.close();
        getAllLogs();
      }
    } catch (error) {
      console.error("Error updating log:", error);
      alert("Error updating log. Please try again.");
    }

  }
  
  // handle delete button click
  async function handleBtnDelete(logCode) {
    try {
      const response = await deleteLog(logCode);
      if (response.status === 204) {
        viewLogModal.close();
        alert("Log deleted successfully.");
        deleteModal.close();
        getAllLogs();
      }
    } catch (error) {
      console.error("Error deleting log:", error);
      alert("Error deleting log. Please try again.");
    }
  }

  // handle save log button click
  $("#btn-save").on("click", async function () {
    const observation = $("#observation").val();
    const observedImage = $("#log-image")[0].files[0];
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
        getAllCrops();
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
    // Accept an array of selected ID
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

  $("#view-field-dropdown")
    .prop("multiple", true)
    .on("change", function () {
      // Added multiple prop
      for (const option of this.selectedOptions) {
        const fieldCode = option.value;
        const fieldName = option.text;
        addFieldBadgeToView(fieldCode, fieldName);
      }
      $(this).prop("selectedIndex", -1); // Clear selection after adding badges
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

  function addFieldBadgeToView(fieldCode, fieldName) {
    const existingBadge = $(
      "#view-selected-field span[data-fieldCode='" + fieldCode + "']"
    );
    if (!existingBadge.length) {
      const badge = $("<span>")
        .addClass(
          "bg-green-200 text-green-800 rounded-full px-3 py-1 text-sm flex items-center gap-2"
        )
        .attr("data-fieldCode", fieldCode)
        .html(`${fieldName} <i class="fas fa-times cursor-pointer"></i>`);

      badge.appendTo("#view-selected-field");

      badge.find("i").on("click", function () {
        removeFieldBadgeFromView(fieldCode, fieldName, badge);
      });
      $("#view-field-dropdown option[value='" + fieldCode + "']").remove();
    }
  }

  // Function to remove a field badge (modified to add back to dropdown)
  function removeFieldBadge(fieldCode, fieldName, badgeElement) {
    const option = $("<option>").val(fieldCode).text(fieldName);
    $("#field-dropdown").append(option);
    $("#field-dropdown").val(""); // Ensure no option is selected after adding back
    badgeElement.remove();
  }

  function removeFieldBadgeFromView(fieldCode, fieldName, badgeElement) {
    const option = $("<option>").val(fieldCode).text(fieldName);
    $("#view-field-dropdown").append(option);
    $("#view-field-dropdown").val(""); // Ensure no option is selected after adding back
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

  $("#view-crop-dropdown")
    .prop("multiple", true)
    .on("change", function () {
      // Added multiple prop
      for (const option of this.selectedOptions) {
        const cropCode = option.value;
        const cropName = option.text;
        addCropBadgetoView(cropCode, cropName);
      }
      $(this).prop("selectedIndex", -1); // Clear selection after adding badges
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

  function addCropBadgetoView(cropCode, cropName) {
    const existingBadge = $(
      "#view-selected-crop span[data-cropCode='" + cropCode + "']"
    );
    if (!existingBadge.length) {
      const badge = $("<span>")
        .addClass(
          "bg-green-200 text-green-800 rounded-full px-3 py-1 text-sm flex items-center gap-2"
        )
        .attr("data-cropCode", cropCode)
        .html(`${cropName} <i class="fas fa-times cursor-pointer"></i>`);

      badge.appendTo("#view-selected-crop");

      badge.find("i").on("click", function () {
        removeCropBadgeFromView(cropCode, cropName, badge);
      });
      $("#view-crop-dropdown option[value='" + cropCode + "']").remove();
    }
  }

  // Function to remove a field badge (modified to add back to dropdown)
  function removeCropBadge(cropCode, cropName, badgeElement) {
    const option = $("<option>").val(cropCode).text(cropName);
    $("#crop-dropdown").append(option);
    $("#crop-dropdown").val(""); // Ensure no option is selected after adding back
    badgeElement.remove();
  }

  function removeCropBadgeFromView(cropCode, cropName, badgeElement) {
    const option = $("<option>").val(cropCode).text(cropName);
    $("#view-crop-dropdown").append(option);
    $("#view-crop-dropdown").val(""); // Ensure no option is selected after adding back
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
      $("#view-staff-dropdown option[value='" + staffId + "']").remove();
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
    $("#view-selected-crop").empty();
    $("#view-selected-crop").empty();
    $("#view-selected-crop").empty();
  }

  // Clear fields
  function clearFields() {
    $("#log-image").val("");
    $("#log-preview").attr("src", "").addClass("hidden");
    $("#file-upload").removeClass("hidden");
    $("#update-log-image").val("");
    $("#update-log-preview").attr("src", "").addClass("hidden");
    $("#update-file-upload").removeClass("hidden");
    $("#observation").val("");
    $("#view-observation").val("");
    $("#staff-dropdown").val("");
    $("#view-staff-dropdown").val("");
    $("#field-dropdown").val("");
    $("#view-field-dropdown").val("");
    $("#crop-dropdown").val("");
    $("#view-crop-dropdown").val("");
    removeAllBadges();
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

  handleFileUpload("log-image", "log-preview", "file-upload");
  handleFileUpload(
    "update-log-image",
    "update-log-preview",
    "update-file-upload"
  );
  getAllLogs();
  loadStaffDataToDropdown();
  loadFieldDataToDropdown();
  loadCropDataToDropdown();
});
