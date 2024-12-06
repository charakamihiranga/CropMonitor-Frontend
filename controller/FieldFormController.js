import { getStaff } from "../model/StaffModel.js";
import { saveField, getAllFields } from "../model/FieldModel.js";

$(document).ready(function () {
  const addFieldModal = setupModal(
    "#add-field-modal",
    "#add-field-btn",
    "#close-add-field-modal"
  );

    // Add Field Form Map
    let addFieldMap, addFieldMarker;

  // Initialize Leaflet Map
  const map = L.map("field-map").setView([0, 0], 2); // Neutral starting point
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);


  // Display all fields on the map
  async function setAllFields() {
    try {
      const fields = await getAllFields();
  
      if (!fields || fields.length === 0) {
        console.warn("No fields available to display on the map.");
        return;
      }
  
      // Create an array to hold all LatLng points for bounds
      const fieldLatLngs = [];
  
      fields.forEach((field) => {
        const {
          fieldName,
          fieldSize,
          fieldLocation: { x: longitude, y: latitude },
          fieldCode,
          equipments,
        } = field;
  
        // Add field coordinates to the LatLng array for bounds
        fieldLatLngs.push([latitude, longitude]);
  
        // Create a marker at the field's location
        const marker = L.marker([latitude, longitude])
          .addTo(map)
          .bindTooltip(fieldName, { permanent: true, direction: "top" }) // Display field name as tooltip
          .on("click", () => {
            console.log(field); // Log the entire field object
          });
  
        // Optional: Add a popup with additional information if needed
        marker.bindPopup(`
          <strong>${fieldName}</strong><br>
          <strong>Code:</strong> ${fieldCode}<br>
          <strong>Size:</strong> ${fieldSize} acres<br>
          <strong>Equipments:</strong> ${equipments.length ? equipments.join(", ") : "None"}<br>
          <strong>Coordinates:</strong> ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
        `);
      });
  
      // Adjust the map view to fit all fields with zoom level 12
      const bounds = L.latLngBounds(fieldLatLngs);
      map.fitBounds(bounds, { maxZoom: 12 });
  
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
    $("#field-name, #field-size, #field-location, #latitude, #longitude").val("");
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(addFieldMap);
  
      // Initialize marker at Colombo's coordinates
      addFieldMarker = L.marker([6.9271, 79.8612], { draggable: true }).addTo(addFieldMap);
  
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
  async function loadStaffDataToDropdown(selectedStaffId = null) {
    try {
      const staffData = await getStaff();
      const dropDowns = ["#staff-dropdown", "#updated-allocated-staff"];
      dropDowns.forEach((selector) => {
        const dropDown = $(selector);
        dropDown.empty();
        dropDown.append('<option value="" disabled selected>Select Staff</option>');
        staffData.forEach((staff) => {
          const fullName = `${staff.firstName} ${staff.lastName}`.trim();
          const selected = staff.staffId === selectedStaffId ? "selected" : "";
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

  // Set up modal functionality
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


    return { open: () => $modal.removeClass("hidden opacity-0").find(".popup-modal").removeClass("scale-95"), close: closeModal };
  }

  // Staff badge management
  $("#staff-dropdown").on("change", function () {
    const selectedOption = $(this).find(":selected");
    if (selectedOption.val()) {
      addStaffBadge(selectedOption.val(), selectedOption.text());
      selectedOption.remove();
    }
  });

  function addStaffBadge(value, text) {
    $("<span>")
      .addClass("bg-green-200 text-green-800 rounded-full px-3 py-1 text-sm flex items-center gap-2")
      .attr("data-staffId", value)
      .html(`${text} <i class="fas fa-times cursor-pointer"></i>`)
      .appendTo("#selected-staff")
      .on("click", function () {
        removeStaffBadge(value, text, this);
      });
  }

  function removeStaffBadge(value, text, element) {
    $("#staff-dropdown").append($("<option>").val(value).text(text));
    $(element).remove();
  }

  // File preview functionality
  $("#file, #file2").on("change", function () {
    const file = this.files[0];
    const previewId = this.id === "file" ? "#file-info1" : "#file-info2";
    if (file?.type.startsWith("image/")) {
      $(previewId).text(file.name).removeClass("hidden");
    } else {
      alert("Please select a valid image file.");
    }
  });

  // Initial setup
  loadStaffDataToDropdown();
  setAllFields();
});
