import {
  getAllEquipmentData,
  addEquipment,
  updateEquipment,
  deleteEquipmentById,
  getEquipmentById,
} from "../model/EquipmentModel.js";
import { getStaff, getStaffById } from "../model/StaffModel.js";
import { getAllFields, getFieldByCode } from "../model/FieldModel.js";
import { formatName, setupModal } from "../assets/js/util.js";
$(document).ready(() => {
  const notyf = new Notyf({
    duration: 3000,  
    position: { x: 'right', y: 'top' },  
  });
  let ascending = true;
  let equipmentData = [];
  let filteredEquipmentData = [];

  const addEquipmentModal = setupModal(
    "#add-equipment-modal",
    "#save-btn",
    "#close-modal"
  );

  const updateEquipmentModal = setupModal(
    "#update-equipment-modal",
    "#update-icon",
    "#close-update-modal"
  );

  const viewEquipmentModal = setupModal(
    "#view-equipment-modal",
    "#view-icon",
    "#close-view-modal"
  );

  const deleteEquipmentModal = setupModal(
    "#delete-equipment-modal",
    "#delete-icon",
    "#close-delete-modal"
  );

  // handle delete equipment
  $(document).on("click", "#delete-icon", function (event) {
    const rowIndex = $(this).closest(".table-row").data("index");
    const equipment = filteredEquipmentData[rowIndex];
    $("#delete-name").text(equipment.equipmentId);
    deleteEquipmentModal.open();
    $("#btn-delete").on("click", async () => {
      deleteEquipment(equipment.equipmentId);
    });
  });

  async function deleteEquipment(equipmentId) {
    try {
      let response = await deleteEquipmentById(equipmentId);
      if (response.status === 204) {
        getAllEquipment();
        deleteEquipmentModal.close();
        notyf.success(response.message);
      }
    } catch (error) {
      notyf.error("An unexpected error occurred. Please try again.");
    }
  }

  // view Equipment Modal
  async function setViewData(equipmentId) {
    const equipment = await getEquipmentById(equipmentId);

    $("#view-eq-name").val(equipment.name || "N/A");
    $("#view-eq-id").val(equipment.equipmentId || "N/A");
    $("#view-status").html(
      `<option value="" disabled selected>${equipment.status}</option>`
    );
    $("#view-eq-type").html(
      `<option value="" disabled selected>${equipment.type}</option>`
    );

    $("#view-eq-status").html(
      `<option value="" disabled selected>${equipment.status}</option>`
    );

    // Handling allocated staff display

    const staffById = await getStaffById(equipment.staffId);

    const staffName = staffById
      ? `${staffById.firstName || ""} ${staffById.lastName || ""}`.trim()
      : "Not Allocated";

    const fieldByCode = await getFieldByCode(equipment.fieldCode);

    const fieldName = fieldByCode
      ? `${fieldByCode.fieldName}`.trim()
      : "Not Allocated";

    $("#view-allocated-staff").html(
      `<option value="" disabled selected>${staffName}</option>`
    );

    $("#view-allocated-field").html(
      `<option value="" disabled selected>${fieldName}</option>`
    );
  }

  $(document).on("click", "#view-icon", function () {
    const rowIndex = $(this).closest(".table-row").data("index");
    const equipment = filteredEquipmentData[rowIndex];

    setViewData(equipment.equipmentId); // Set data in the view modal
    viewEquipmentModal.open();
  });

  // Add equipment form submit event

  $("#btn-save").on("click", async () => {
    const equipment = {
      name: formatName($("#eq-name").val()),
      type: $("#eq-type").val(),
      status: $("#eq-status").val(),
      staffId:
        $("#allocated-staff").val() === "" ? null : $("#allocated-staff").val(),
      fieldCode: $("#allocated-field").val(),
    };

    try {
      let response = await addEquipment(equipment);
      if (response.status === 201) {
        notyf.success(response.message);
        getAllEquipment();
        addEquipmentModal.close();
        clearFields();
      }
    } catch (error) {
      notyf.error("An error occurred while adding equipment. Please try again.");
    }
  });

  // Add equipment button click event
  $("#add-equipment-btn").on("click", () => {
    loadStaffDataToDropdown();
    loadFieldDataToDropdown();
    addEquipmentModal.open();
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
      notyf.error("Error loading staff data. Please try again.");
    }
  }

  async function loadFieldDataToDropdown(selectedFieldCode = null) {
    try {
      const fieldData = await getAllFields(); // Assume getAllFields is your API call to fetch fields data

      const dropDowns = ["#allocated-field", "#updated-allocated-field"];
      dropDowns.forEach((dropDownSelector) => {
        const dropDown = $(dropDownSelector);
        dropDown.empty();
        dropDown.append(
          '<option value="" disabled selected>Select Field</option>'
        );

        fieldData.forEach((field) => {
          const fieldName = field.fieldName.trim();
          const selected =
            field.fieldCode === selectedFieldCode ? "selected" : ""; // Ensure you're comparing against fieldCode
          dropDown.append(
            `<option value="${field.fieldCode}" ${selected}>${fieldName}</option>`
          );
        });
      });
    } catch (error) {
      notyf.error("Error loading field data. Please try again.");
    }
  }

  // Update equipment button click event
  $(document).on("click", "#update-icon", function () {
    const rowIndex = $(this).closest(".table-row").data("index");
    const equipment = filteredEquipmentData[rowIndex];

    // Populate modal fields with equipment data
    $("#updated-eq-name").val(equipment.name);
    $("#updated-eq-type").val(equipment.type);
    $("#updated-eq-status").val(equipment.status);
    $("#updated-allocated-staff").val(
      equipment.staff
        ? `${equipment.staff.firstName} ${equipment.staff.lastName}`
        : "N/A"
    );
    $("#updated-allocated-field").val(
      equipment.field ? equipment.field.fieldName : "N/A"
    );

    // Populate staff dropdown
    const selectedStaffId = equipment.staff ? equipment.staff.staffId : null;
    const selectedFieldCode = equipment.field
      ? equipment.field.fieldCode
      : null;
    loadStaffDataToDropdown(selectedStaffId);
    loadFieldDataToDropdown(selectedFieldCode);

    // Open update modal
    updateEquipmentModal.open();

    // Update equipment on save
    $("#btn-update").on("click", async () => {
      const updatedEquipment = {
        name: formatName($("#updated-eq-name").val()),
        type: $("#updated-eq-type").val(),
        status: $("#updated-eq-status").val(),
        staffId: $("#updated-allocated-staff").val() || null,
        fieldCode: $("#updated-allocated-field").val(),
      };

      try {
        const response = await updateEquipment(
          equipment.equipmentId,
          updatedEquipment
        );

        if (response.status === 204) {
          getAllEquipment();
          notyf.success(response.message);
          updateEquipmentModal.close();
        }
      } catch (error) {
        notyf.error(
          "An error occurred while updating the equipment. Please try again."
        );
      }
    });
  });

  // Fetch all equipment data and handle sorting and filtering
  async function getAllEquipment(searchTerm = "") {
    $("#loader").show(); // Show loader
    try {
      const data = await getAllEquipmentData();
      equipmentData = data;

      // Filter equipment data based on search term
      filteredEquipmentData = equipmentData.filter((equipment) => {
        const name = equipment.name?.toLowerCase() || "";
        const equipmentId = equipment.equipmentId?.toLowerCase() || "";
        const status = equipment.status?.toLowerCase() || "";

        // Handle staff name more safely, ensure "N/A" is lowercased only once
        const staffName = equipment.staff
          ? `${equipment.staff.firstName || ""} ${
              equipment.staff.lastName || ""
            }`.toLowerCase()
          : "n/a";

        return (
          name.includes(searchTerm.toLowerCase()) ||
          equipmentId.includes(searchTerm.toLowerCase()) ||
          status.includes(searchTerm.toLowerCase()) ||
          staffName.includes(searchTerm.toLowerCase())
        );
      });

      const sortedData = filteredEquipmentData.sort((a, b) => {
        // Ensure the name is properly handled if it's undefined or null
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();

        if (ascending) {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });

      setEquipmentData(sortedData);
    } catch (error) {
      console.error("Error fetching equipment data:", error);
    }
  }

  // set equipment data into the table
  function setEquipmentData(filteredData) {
    const tableBody = $(".equipment-table-body");
    tableBody.empty();

    filteredData.forEach((equipment, index) => {
      const staffName = equipment.staff
        ? `${equipment.staff.firstName || ""} ${equipment.staff.lastName || ""}`
        : "N/A";
      const fieldName =
        equipment.field && equipment.field.fieldName
          ? equipment.field.fieldName
          : "N/A";
      const row = $(`  
          <div class="table-row grid grid-cols-2 sm:grid-cols-6 gap-2 text-center bg-gray-100 poppins-medium text-xs sm:text-sm hover:bg-green-100 p-3 cursor-pointer rounded-lg mt-1 transition-all" data-index="${index}">
            <div class="p-2 truncate">${equipment.name}</div>
            <div class="p-2 truncate">${equipment.type}</div>
            <div class="p-2 hidden sm:block truncate">${equipment.status}</div>
            <div class="p-2 hidden sm:block truncate">${staffName}</div>
            <div class="p-2 hidden sm:block truncate">${fieldName}</div>
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
  function sortEquipment(criteria) {
    const sortedData = filteredEquipmentData.toSorted((a, b) => {
      let valueA = a[criteria].toLowerCase();
      let valueB = b[criteria].toLowerCase();
      return ascending
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    setEquipmentData(sortedData);
  }

  // Event Listeners for Sorting Headers
  $("#sort-category").on("click", () => {
    ascending = !ascending;
    $("#sort-category").toggleClass("fa-sort-down fa-sort-up");
    sortEquipment("equipmentCategory");
  });

  $("#sort-status").on("click", () => {
    ascending = !ascending;
    $("#sort-status").toggleClass("fa-sort-down fa-sort-up");
    sortEquipment("status");
  });


  function clearFields() {
    $(
      "#equipment-category, #equipment-id, #status, #allocated-staff, #remarks"
    ).val("");
  }

  // Listen for search bar updates from parent window (dashboard)
  window.addEventListener("message", (event) => {
    if (event.data.type === "SEARCH_UPDATE") {
      const searchQuery = event.data.query;
      getAllEquipment(searchQuery); // Refetch and filter data based on search term
    }
  });

  // initial function call
  getAllEquipment();
});
