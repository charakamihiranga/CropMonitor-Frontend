import {
  getAllVehicleData,
  addVehicle,
  updateVehicle,
} from "../model/VehicleModel.js";
import { getStaff } from "../model/StaffModel.js";
$(document).ready(() => {
  let ascending = true;
  let vehicleData = [];
  let filteredVehicleData = [];

  const addVehicleModal = setupModal(
    "#add-vehicle-modal",
    "#save-btn",
    "#close-modal"
  );

  const updateVehicleModal = setupModal(
    "#update-vehicle-modal",
    "#update-btn",
    "#close-update-modal"
  );

  // Add vehicle form submit event
  $("#btn-save").on("click", async () => {
    const vehicle = {
      vehicleCategory: $("#vehicle-category").val(),
      licensePlateNumber: $("#license-plate-number").val(),
      fuelType: $("#fuel-type").val(),
      status: $("#status").val().toLowerCase(),
      staffId:
        $("#allocated-staff").val() === "" ? null : $("#allocated-staff").val(),
      remarks: $("#remarks").val(),
    };

    try {
      let response = await addVehicle(vehicle);
      if (response.status === 201) {
        alert(response.message);
        getAllVehicles();
        addVehicleModal.close();
        clearFields();
      }
    } catch (error) {
      alert("An error occurred while adding vehicle. Please try again.");
    }
  });

  // Add vehicle button click event
  $("#add-vehicle-btn").on("click", () => {
    loadStaffDataToDropdown();
    addVehicleModal.open();
  });

  async function loadStaffDataToDropdown(selectedStaffId = null) {

    try {
      const staffData = await getStaff();

      const dropDowns = ["#allocated-staff", "#updated-allocated-staff"];
      dropDowns.forEach((dropDownSelector) => {
        const dropDown = $(dropDownSelector);
        dropDown.empty();
        dropDown.append(
          '<option value="" disabled selected>Select Staff</option>'
        );

        staffData.forEach((staff) => {
          const fullName = `${staff.firstName || ""} ${
            staff.lastName || ""
          }`.trim();
          const selected = staff.staffId === selectedStaffId ? "selected" : "";
          dropDown.append(
            `<option value="${staff.staffId}" ${selected}>${fullName}</option>`
          );
        });
      });
    } catch (error) {
      alert("Error loading staff data. Please try again.");
    }
  }
  // Update vehicle button click event
  $(document).on("click", "#update-icon", function () {
    const rowIndex = $(this).closest(".table-row").data("index");
    const vehicle = filteredVehicleData[rowIndex];

    // Populate modal fields with vehicle data
    $("#updated-vehicle-category").val(vehicle.vehicleCategory);
    $("#updated-license-plate-number").val(vehicle.licensePlateNumber);
    $("#updated-fuel-type").val(vehicle.fuelType);
    $("#updated-status").val(vehicle.status);
    $("#updated-remarks").val(vehicle.remarks);

    // Populate staff dropdown
    const selectedStaffId = vehicle.staff ? vehicle.staff.staffId : null;
    loadStaffDataToDropdown(selectedStaffId);

    // Open update modal
    updateVehicleModal.open();

    // Update vehicle on save
    $("#btn-update").on("click", async () => {
      const updatedVehicle = {
        vehicleCategory: $("#updated-vehicle-category").val(),
        licensePlateNumber: $("#updated-license-plate-number").val(),
        fuelType: $("#updated-fuel-type").val(),
        status: $("#updated-status").val().toLowerCase(),
        staffId: $("#updated-allocated-staff").val() || null,
        remarks: $("#updated-remarks").val(),
      };

      try {
        const response = await updateVehicle(vehicle.vehicleCode, updatedVehicle);

        if (response.status === 204) {
          getAllVehicles();
          alert(response.message);
          updateVehicleModal.close();
        }
      } catch (error) {
        alert(
          "An error occurred while updating the vehicle. Please try again."
        );
      }
    });
  });

  // Fetch all vehicle data and handle sorting and filtering
  async function getAllVehicles(searchTerm = "") {
    $("#loader").show(); // Show loader
    try {
      const data = await getAllVehicleData();
      vehicleData = data;

      // Filter vehicle data based on search term
      filteredVehicleData = vehicleData.filter((vehicle) => {
        const category = vehicle.vehicleCategory?.toLowerCase() || "";
        const licensePlate = vehicle.licensePlateNumber?.toLowerCase() || "";
        const fuelType = vehicle.fuelType?.toLowerCase() || "";
        const status = vehicle.status?.toLowerCase() || "";

        // Handle staff name more safely, ensure "N/A" is lowercased only once
        const staffName = vehicle.staff
          ? `${vehicle.staff.firstName || ""} ${
              vehicle.staff.lastName || ""
            }`.toLowerCase()
          : "n/a";

        return (
          category.includes(searchTerm.toLowerCase()) ||
          licensePlate.includes(searchTerm.toLowerCase()) ||
          fuelType.includes(searchTerm.toLowerCase()) ||
          status.includes(searchTerm.toLowerCase()) ||
          staffName.includes(searchTerm.toLowerCase())
        );
      });

      const sortedData = filteredVehicleData.sort((a, b) => {
        $("#loader").hide();
        if (ascending) {
          return a.vehicleCategory.localeCompare(b.vehicleCategory);
        } else {
          return b.vehicleCategory.localeCompare(a.vehicleCategory);
        }
      });
      setVehicleData(sortedData); // Update the table
    } catch (error) {
      console.log("dk");
      console.error("Error fetching vehicle data:", error);
    }
  }

  // set vehicle data into the table
  function setVehicleData(filteredData) {
    const tableBody = $(".vehicle-table-body");
    tableBody.empty();

    filteredData.forEach((vehicle, index) => {
      const staffName = vehicle.staff
        ? `${vehicle.staff.firstName || ""} ${vehicle.staff.lastName || ""}`
        : "N/A";
      const row = $(`
        <div class="table-row grid grid-cols-2 sm:grid-cols-6 gap-2 text-center bg-gray-100 poppins-medium text-xs sm:text-sm hover:bg-green-100 p-3 cursor-pointer rounded-lg mt-1 transition-all" data-index="${index}">
          <div class="p-2 truncate">${vehicle.vehicleCategory}</div>
          <div class="p-2 truncate">${vehicle.licensePlateNumber}</div>
          <div class="p-2 hidden sm:block truncate">${vehicle.fuelType}</div>
          <div class="p-2 truncate">${vehicle.status}</div>
          <div class="p-2 hidden sm:block truncate">${staffName}</div>
          <div class="p-2 flex justify-center space-x-0 sm:space-x-2 md:space-x-2 lg:space-x-6 text-[#183153]">
            <button id="view-icon" class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
              <i class="fa fa-eye text-base hover:text-green-500"></i>
            </button>
            <button id="update-icon" class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
              <i class="fa-solid text-base fa-pen hover:text-orange-500"></i>
            </button>
            <button id="delete-icon" class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
              <i class="fa-solid text-base fa-trash hover:text-red-500"></i>
            </button>
          </div>
        </div>
      `);
      tableBody.append(row);
    });
  }

  // Sorting function
  function sortVehicles(criteria) {
    const sortedData = filteredVehicleData.toSorted((a, b) => {
      let valueA = a[criteria].toLowerCase();
      let valueB = b[criteria].toLowerCase();
      return ascending
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    setVehicleData(sortedData);
  }

  // Event Listeners for Sorting Headers
  $("#sort-category").on("click", () => {
    ascending = !ascending;
    $("#sort-category").toggleClass("fa-sort-down fa-sort-up");
    sortVehicles("vehicleCategory");
  });

  $("#sort-status").on("click", () => {
    ascending = !ascending;
    $("#sort-status").toggleClass("fa-sort-down fa-sort-up");
    sortVehicles("status");
  });

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

  function clearFields() {
    $(
      "#vehicle-category, #license-plate-number, #fuel-type, #status, #allocated-staff, #remarks"
    ).val("");
  }

  // Listen for search bar updates from parent window (dashboard)
  window.addEventListener("message", (event) => {
    if (event.data.type === "SEARCH_UPDATE") {
      const searchQuery = event.data.query;
      getAllVehicles(searchQuery); // Refetch and filter data based on search term
    }
  });

  // initial function call
  getAllVehicles();
});
