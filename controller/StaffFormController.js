import {
  getStaff,
  addStaff,
  updateStaffMember,
  deleteStaffMember,
} from "../model/StaffModel.js";
import { formatName } from "../assets/js/util.js";

$(document).ready(() => {
  // Variables to track sorting and staff data
  let ascending = true;
  let staffData = []; // Store all staff data for filtering
  let filteredStaffData = [];

  // Setup modals for popups
  const addStaffModal = setupModal(
    "#add-staff-modal",
    "#btn-add",
    "#close-modal"
  );
  const updateStaffModal = setupModal(
    "#update-staff-modal",
    "#update-icon",
    "#close-update-modal"
  );
  const viewStaffModal = setupModal(
    "#view-staff-modal",
    "#view-icon",
    "#close-view-modal"
  );
  const deleteStaffModal = setupModal(
    "#delete-staff-modal",
    "#delete-icon",
    "#close-delete-modal"
  );

  // Handle add staff form submission
  $("#btn-save").on("click", async () => {
    const staff = {
      firstName: formatName($("#first-name").val()),
      lastName: formatName($("#last-name").val()),
      email: $("#email").val().toLowerCase(),
      designation: $("#designation").val().toUpperCase(),
      contactNo: $("#contact-number").val(),
      gender: $("#gender").val().toUpperCase(),
      dob: $("#dob").val(),
      role: $("#role").val().toUpperCase(),
      addressLine01: $("#street-address").val(),
      addressLine02: $("#address-line-2").val(),
      addressLine03: $("#city").val(),
      addressLine04: $("#province").val(),
      addressLine05: $("#country").val() + " " + $("#postal-code").val(),
      joinedDate: $("#joined-date").val(),
    };

    try {
      let response = await addStaff(staff);

      if (response.status === 201) {
        alert(response.message); // Success message
        getAllStaff(); // Refetch staff data
        addStaffModal.close();
        clearFields(); 
      } else if (response.status === 409) {
        alert(response.message); // Email already exists
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    }
  });

  async function updateStaff(staffId, updatedStaff) {
    try {
      let response = await updateStaffMember(staffId, updatedStaff);
      if (response.status === 204) {
        getAllStaff();
        updateStaffModal.close();
        alert(response.message);
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    }
  }

  // Fetch all staff data and handle sorting and filtering
  async function getAllStaff(searchTerm = "") {
    $("#loader").show(); // Show loader

    try {
      const data = await getStaff();
      staffData = data;

      // Filter staff data based on search term
      filteredStaffData = staffData.filter((staff) => {
        const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
        const email = staff.email.toLowerCase();
        const contactNo = staff.contactNo.toLowerCase();
        const designation = staff.designation.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          contactNo.includes(searchTerm.toLowerCase()) ||
          designation.includes(searchTerm.toLowerCase())
        );
      });

      // Sort filtered data based on the current sorting direction
      const sortedData = filteredStaffData.sort((a, b) => {
        $("#loader").hide();
        if (ascending) {
          return a.firstName.localeCompare(b.firstName); // Ascending (A-Z)
        } else {
          return b.firstName.localeCompare(a.firstName); // Descending (Z-A)
        }
      });

      setStaffData(sortedData); // Update the table with sorted data
    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  }

  // Dynamically set staff data into the table
  function setStaffData(filteredData) {
    const tableBody = $(".staff-table-body");
    tableBody.empty();
    filteredData.forEach((staff, index) => {
      const row = $(`
      <div class="table-row grid grid-cols-2 sm:grid-cols-6 gap-2 text-center bg-gray-100 poppins-medium text-xs sm:text-sm hover:bg-green-100 p-3 cursor-pointer rounded-lg mt-1 transition-all" data-index="${index}">
        <div class="p-2 truncate">${staff.firstName} ${staff.lastName}</div>
        <div class="p-2 truncate">${staff.designation}</div>
        <div class="p-2 hidden sm:block truncate">${staff.email}</div>
        <div class="p-2 truncate">${staff.contactNo}</div>
        <div class="p-2 truncate">${staff.gender}</div>
        <div class="p-2 flex justify-center space-x-0 sm:space-x-2 md:space-x-2 lg:space-x-6 text-[#183153]">
          <button id="view-icon" class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
            <i class="fa fa-eye text-base hover:text-green-500"></i>
          </button>
          <button id="update-icon" class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
            <i class="fa-solid fa-pen text-base hover:text-orange-500"></i>
          </button>
          <button id="delete-icon" class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
            <i class="fa-solid fa-trash text-base hover:text-red-500"></i>
          </button>
        </div>
      </div>
      `);
      tableBody.append(row);
    });
  }

  // Handle 'update-icon' button click event
  $(document).on("click", "#update-icon", function () {
    const rowIndex = $(this).closest(".table-row").data("index"); // Get row index of filtered data
    const staff = filteredStaffData[rowIndex]; // Use filtered staff data instead of unfiltered
    $("#updated-first-name").val(staff.firstName);
    $("#updated-last-name").val(staff.lastName);
    $("#updated-email").val(staff.email);
    $("#updated-designation").val(staff.designation);
    $("#updated-contact-number").val(staff.contactNo);
    $("#updated-gender").val(staff.gender);
    const formattedDob = new Date(staff.dob).toISOString().split("T")[0];
    $("#updated-dob").val(formattedDob);
    $("#updated-role").val(staff.role);
    $("#updated-street-address").val(staff.addressLine01);
    $("#updated-address-line-2").val(staff.addressLine02);
    $("#updated-city").val(staff.addressLine03);
    $("#updated-province").val(staff.addressLine04);
    const addressParts = staff.addressLine05.split(" ");
    const country = addressParts.slice(0, -1).join(" ");
    const postalCode = addressParts.slice(-1)[0];
    $("#updated-country").val(country);
    $("#updated-postal-code").val(postalCode);
    updateStaffModal.open(); // Open update modal

    $("#btn-update").on("click", () => {
      const updatedStaff = {
        firstName: formatName($("#updated-first-name").val()),
        lastName: formatName($("#updated-last-name").val()),
        email: $("#updated-email").val().toLowerCase(),
        designation: $("#updated-designation").val().toUpperCase(),
        contactNo: $("#updated-contact-number").val(),
        dob: $("#updated-dob").val(),
        role: $("#updated-role").val().toUpperCase(),
        addressLine01: $("#updated-street-address").val(),
        addressLine02: $("#updated-address-line-2").val(),
        addressLine03: $("#updated-city").val(),
        addressLine04: $("#updated-province").val(),
        addressLine05:
          $("#updated-country").val() + " " + $("#updated-postal-code").val(),
        gender: staff.gender,
        joinedDate: staff.joinedDate,
      };
      updateStaff(staff.staffId, updatedStaff);
    });
  });

  // Handle 'view-icon' button click event or row click to open the "view staff" modal
  $(document).on("click", "#view-icon", function (event) {
    // Check if the click is on the eye icon or anywhere on the row (excluding the buttons)
    const rowIndex = $(this).closest(".table-row").data("index"); // Get row index of filtered data
    const staff = filteredStaffData[rowIndex]; // Use filtered staff data instead of unfiltered

    if (
      $(event.target).closest("#view-icon").length ||
      $(event.target).closest(".table-row").length
    ) {
      // If clicked on the "view icon" or anywhere on the row
      // Populate the view staff modal with the staff's data
      $("#view-first-name").val(staff.firstName);
      $("#view-last-name").val(staff.lastName);
      $("#view-email").val(staff.email);
      $("#view-designation").val(staff.designation);
      $("#view-contact-number").val(staff.contactNo);
      $("#view-gender").val(staff.gender);
      const formattedDob = new Date(staff.dob).toISOString().split("T")[0];
      $("#view-dob").val(formattedDob);
      const joinedDate = new Date(staff.joinedDate).toISOString().split("T")[0];
      $("#view-joined-date").val(joinedDate);
      $("#view-role").val(staff.role);
      $("#view-street-address").val(staff.addressLine01);
      $("#view-address-line-2").val(staff.addressLine02);
      $("#view-city").val(staff.addressLine03);
      $("#view-province").val(staff.addressLine04);
      const addressParts = staff.addressLine05.split(" ");
      const country = addressParts.slice(0, -1).join(" ");
      const postalCode = addressParts.slice(-1)[0];
      $("#view-country").val(country);
      $("#view-postal-code").val(postalCode);

      viewStaffModal.open(); // Open the view staff modal
    }
  });

  // Handle 'delete-icon' button click event

  $(document).on("click", "#delete-icon", function (event) {
    const rowIndex = $(this).closest(".table-row").data("index");
    const staff = filteredStaffData[rowIndex];
    $("#delete-name").text(staff.firstName);
    deleteStaffModal.open();

    $("#btn-delete").on("click", async () => {
      deleteStaff(staff.staffId);
    });
  });

  async function deleteStaff(staffId) {
    try {
      let response = await deleteStaffMember(staffId);
      if (response.status === 204) {
        getAllStaff();
        deleteStaffModal.close();
        alert(response.message);
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    }
  }

  // Listen for search bar updates from parent window (dashboard)
  window.addEventListener("message", (event) => {
    if (event.data.type === "SEARCH_UPDATE") {
      const searchQuery = event.data.query;
      getAllStaff(searchQuery); // Refetch and filter data based on search term
    }
  });

  // Setup modal for adding new staff
  $("#btn-add").on("click", () => {
    addStaffModal.open(); // Open the add staff modal
  });

  // handle sorting of staff data
  $("#sort-arrow").click(() => {
    ascending = !ascending;
    $("#sort-arrow").toggleClass("fa-sort-down fa-sort-up");
    getAllStaff($("#search-bar").val()); // Refetch staff with the current search value
  });

  $("#sort-arrow-designation").click(() => {
    ascending = !ascending;
    $("#sort-arrow-designation").toggleClass("fa-sort-down fa-sort-up");
    sortByDesignation(); // Sort staff by designation
  });

  $("#sort-arrow-gender").click(() => {
    ascending = !ascending;
    $("#sort-arrow-gender").toggleClass("fa-sort-down fa-sort-up");
    sortByGender(); // Sort staff by gender
  });

  // Sort staff by Designation
  function sortByDesignation() {
    const sortedData = filteredStaffData.toSorted((a, b) => {
      if (ascending) {
        return a.designation.localeCompare(b.designation); // Ascending (A-Z)
      } else {
        return b.designation.localeCompare(a.designation); // Descending (Z-A)
      }
    });
    setStaffData(sortedData);
  }

  // Sort staff by Gender
  function sortByGender() {
    const sortedData = filteredStaffData.toSorted((a, b) => {
      if (ascending) {
        return a.gender.localeCompare(b.gender); // Ascending (A-Z)
      } else {
        return b.gender.localeCompare(a.gender); // Descending (Z-A)
      }
    });
    setStaffData(sortedData);
  }

  // Initial data fetchings
  getAllStaff();

  // Function to clear all input fields
  function clearFields() {
    $(
      "#first-name, #last-name, #email, #designation, #contact-number, #gender, #dob, #role, #street-address, #address-line-2, #city, #province, #country, #postal-code, #joined-date"
    ).val("");
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
});
