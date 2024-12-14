import { getStaff } from "../model/StaffModel.js";
import {
  saveField,
  getAllFields,
  deleteFieldByCode,
} from "../model/FieldModel.js";

$(document).ready(function () {
  const addFieldModal = setupModal(
    "#add-field-modal",
    "#add-field-btn",
    "#close-add-field-modal"
  );

  const viewFieldModel = setupModal(
    "#view-field-modal",
    "#btn-update",
    "#close-view-field-modal"
  );

  const delelteFieldModel = setupModal(
    "#delete-field-modal",
    "#btn-delete",
    "#close-delete-modal"
  );
  // Add Field Form Map
  let addFieldMap, addFieldMarker;

  const markers = []; 

  // Initialize Leaflet Map
  const map = L.map("field-map").setView([0, 0], 2); // Neutral starting point
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Handle view field
  function handleViewField(fieldData) {
    console.log(fieldData);

    // Set modal content with field data using jQuery
    $("#view-field-name").val(fieldData.fieldName);
    $("#view-field-size").val(fieldData.fieldSize);

    const staffDropdown = $("#view-staff-dropdown");
    fieldData.staff.forEach(function (staffMember) {
      // Add the staff as a badge
      addStaffBadgetoView(
        staffMember.staffId,
        `${staffMember.firstName} ${staffMember.lastName}`
      );
    });

    viewFieldModel.open();

    // Show the modal (this function should be implemented elsewhere)
    // $("#view-field-modal").removeClass("hidden opacity-0").addClass("opacity-100");

    // Attach update functionality
    $("#btn-update")
      .off("click")
      .on("click", function () {
        updateField(fieldData.fieldCode);
      });

    $("#btn-delete")
      .off("click")
      .on("click", function () {
        deleteField(fieldData.fieldCode, fieldData.fieldName);
      });
  }

  function updateField(fieldId) {
    alert("Update field with ID: " + fieldId);
  }

  async function deleteField(fieldCode, fieldName) {
    viewFieldModel.close();
    $("#delete-field-name").text(fieldName);
    delelteFieldModel.open();
    $("#btn-delete-field").on("click", async function () {
      let response = await deleteFieldByCode(fieldCode);
      try {
        if (response.status === 204) {
          alert(response.message);
          setAllFields();
          delelteFieldModel.close();
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert("An unexpected error occurred. Please try again.");
      }
    });
  }

  // Load all fields and display them on the map

  async function setAllFields() {
    try {
      // Remove existing markers from the map
      markers.forEach((marker) => map.removeLayer(marker));
      markers.length = 0; // Clear the markers array
  
      const fields = await getAllFields();
  
      if (!fields || fields.length === 0) {
        console.warn("No fields available to display on the map.");
        return;
      }
  
      const fieldLatLngs = []; // Array for map bounds adjustment
  
      fields.forEach((field) => {
        const {
          fieldName,
          fieldSize,
          fieldLocation: { x: longitude, y: latitude },
          fieldCode,
          equipments,
        } = field;
  
        if (!latitude || !longitude) {
          console.warn(`Field "${fieldName}" has invalid coordinates.`);
          return; // Skip fields with missing coordinates
        }
  
        // Add field coordinates to the LatLng array for bounds
        fieldLatLngs.push([latitude, longitude]);
  
        // Create a marker at the field's location
        const marker = L.marker([latitude, longitude]).addTo(map);
  
        // Store marker reference in the global array
        markers.push(marker);
  
        // Always show field name as a permanent tooltip
        marker.bindTooltip(fieldName, {
          permanent: true,
          direction: "top",
          className: "field-tooltip", // Optional: Custom CSS for tooltips
        });
  
        // Add a popup for detailed field information
        marker.bindPopup(`
          <strong>${fieldName}</strong><br>
          <strong>Code:</strong> ${fieldCode}<br>
          <strong>Size:</strong> ${fieldSize} acres<br>
          <strong>Coordinates:</strong> ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
        `);
  
        // Open popup on hover and close it when mouse leaves
        marker.on("mouseover", function () {
          this.openPopup();
        });
  
        marker.on("mouseout", function () {
          this.closePopup();
        });
  
        // Optional: Handle marker click for additional actions
        marker.on("click", () => {
          handleViewField(field); // Example: Show field details in a modal
        });
      });
  
      // Adjust map bounds to fit all fields
      if (fieldLatLngs.length > 0) {
        const bounds = L.latLngBounds(fieldLatLngs);
        map.fitBounds(bounds, { maxZoom: 12 });
      } else {
        console.warn("No valid fields to display on the map.");
      }
    } catch (error) {
      console.error("Error loading fields:", error);
      alert("Failed to load fields. Please try again.");
    }
  }
  
  // Handle save field
  $("#btn-save").on("click", async function () {
    const fieldName = $("#field-name").val();
    const fieldSize = parseFloat($("#field-size").val());
    const latitude = parseFloat($("#latitude").val());
    const longitude = parseFloat($("#longitude").val());
    const staffIds = [];
    $("#selected-staff span").each(function () {
      staffIds.push($(this).data("staffid"));
    });

    const file1 = $("#file")[0].files[0];
    const file2 = $("#file2")[0].files[0];
    let field = new FormData();
    field.append("fieldName", fieldName);
    field.append("latitude", latitude);
    field.append("longitude", longitude);
    field.append("fieldSize", fieldSize);
    field.append("fieldImage1", file1);
    field.append("fieldImage2", file2);
    staffIds.forEach((id) => field.append("staffIds", id));

    try {
      let response = await saveField(field);
      if (response.status === 201) {
        alert(response.message);
        addFieldModal.close();
        clearFields();
        setAllFields();
      }
    } catch (error) {
      console.error("Error saving field:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  });

  // Clear the field form
  function clearFields() {
    $("#field-name, #field-size, #field-location, #latitude, #longitude").val(
      ""
    );
    $("#staff-dropdown").prop("selectedIndex", 0);
    $("#file, #file2").val("");
    $("#file-info1, #file-info2").addClass("hidden").text("");
  }

  //load map to add field form

  $("#add-field-btn").on("click", function () {
    if (!addFieldMap) {
      // Initialize map centered on Colombo with appropriate zoom level
      addFieldMap = L.map("map").setView([6.9271, 79.8612], 14); // Zoom to Colombo

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(addFieldMap);

      // Initialize marker at Colombo's coordinates
      addFieldMarker = L.marker([6.9271, 79.8612], { draggable: true }).addTo(
        addFieldMap
      );

      // Update inputs when marker is dragged
      addFieldMarker.on("move", function (e) {
        const { lat, lng } = e.latlng;
        updateLocationInputs(lat, lng);
      });

      // Update inputs and move marker on map click
      addFieldMap.on("click", function (e) {
        const { lat, lng } = e.latlng;
        addFieldMarker.setLatLng(e.latlng);
        updateLocationInputs(lat, lng);
      });
    } else {
      // If map already exists, fly to Colombo with zoom animation
      addFieldMap.flyTo([6.9271, 79.8612], 14);
    }
  });

  // Function to update hidden inputs with coordinates
  function updateLocationInputs(lat, lng) {
    $("#latitude").val(lat.toFixed(6));
    $("#longitude").val(lng.toFixed(6));
    $("#field-location").val(`${lat.toFixed(6)},${lng.toFixed(6)}`);
  }

  // Load staff data into the dropdowns
  async function loadStaffDataToDropdown(selectedStaffIds = []) { // Accept an array of selected IDs
    try {
        const staffData = await getStaff();
        const dropDowns = ["#staff-dropdown", "#view-staff-dropdown"];
        dropDowns.forEach((selector) => {
            const dropDown = $(selector);
            dropDown.empty();
       

            staffData.forEach((staff) => {
                const fullName = `${staff.firstName} ${staff.lastName}`.trim();
                const selected = selectedStaffIds.includes(staff.staffId) ? "selected" : ""; // Check if ID is in the array
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

  // Staff badge management
  $("#staff-dropdown").on("change", function () {
    const selectedOption = $(this).find(":selected");
    if (selectedOption.val()) {
      addStaffBadge(selectedOption.val(), selectedOption.text());
      selectedOption.remove(); // Remove selected staff from the dropdown
    }
  });
  // Staff badge management
  $("#staff-dropdown").prop("multiple", true).on("change", function () { // Added multiple prop
    for (const option of this.selectedOptions) {
        const staffId = option.value;
        const staffName = option.text;
        addStaffBadge(staffId, staffName);
    }
    $(this).prop('selectedIndex', -1); // Clear selection after adding badges
});
    $("#view-staff-dropdown").prop("multiple", true).on("change", function () { // Added multiple prop
    for (const option of this.selectedOptions) {
        const staffId = option.value;
        const staffName = option.text;
        addStaffBadgetoView(staffId, staffName);
    }
    $(this).prop('selectedIndex', -1); // Clear selection after adding badges
});

// Function to add a staff badge (modified to prevent duplicates)
function addStaffBadge(staffId, staffName) {
    const existingBadge = $("#selected-staff span[data-staffId='" + staffId + "']");
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
    const existingBadge = $("#view-selected-staff span[data-staffId='" + staffId + "']");
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

  // Initial setup
  loadStaffDataToDropdown();
  setAllFields();
});
