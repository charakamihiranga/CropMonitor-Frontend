import { getStaff } from "../model/StaffModel.js";

// Variable to track the sorting direction (default is ascending)
let ascending = true;

// Function to set the staff data dynamically
function setStaffData(staffData) {
  const tableBody = $(".staff-table-body");
  tableBody.empty();
  staffData.forEach((staff) => {
    const row = $(`
    <div class="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center bg-gray-100 poppins-medium text-xs sm:text-sm hover:bg-green-100 p-3 cursor-pointer rounded-lg mt-1 transition-all">
    <div class="p-2 truncate">${staff.firstName} ${staff.lastName}</div>
    <div class="p-2 truncate">${staff.designation}</div>
    <div class="p-2 hidden sm:block truncate">${staff.email}</div>
    <div class="p-2 truncate">${staff.contactNo}</div>
    <div class="p-2 truncate">${staff.gender}</div>
    
    <div class="p-2 flex justify-center space-x-0 sm:space-x-2 md:space-x-2 lg:space-x-6 text-[#183153]">
        <button class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
        <i class="fa fa-eye hover:text-green-500"></i>
        </button>
        <button class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
        <i class="fa-solid fa-pen hover:text-green-500"></i>
        </button>
        <button class="px-4 sm:px-2 text-gray-500 rounded-lg transition-all">
        <i class="fa-solid fa-trash hover:text-green-500"></i>
        </button>
    </div>
    </div>
    `);
    tableBody.append(row);
  });
}

// Function to fetch all staff data and handle sorting
async function getAllStaff() {
  // Show the loader before starting to fetch data
  $("#loader").show(); // Show loader


  try {
    const data = await getStaff(); // Await the promise from getStaff

    // Sort data based on the current sorting direction
    const sortedData = [...data].sort((a, b) => {
      $("#loader").hide(); 
      if (ascending) {
        return a.firstName.localeCompare(b.firstName); // Ascending (A-Z)
      } else {
        return b.firstName.localeCompare(a.firstName); // Descending (Z-A)
      }
    });

    setStaffData(sortedData);


  } catch (error) {
    console.error("Error fetching staff data:", error);
  }
}


$(document).ready(() => {
  // Load staff data initially with ascending sort order (default)
  getAllStaff();

  // Handle sort button click event
  $("#sort-arrow").click(() => {
    ascending = !ascending; // Toggle sorting direction

    // Update the icon based on the sorting direction
    if (!ascending) {
      $("#sort-arrow").removeClass("fa-sort-down").addClass("fa-sort-up");
    } else {
      $("#sort-arrow").removeClass("fa-sort-up").addClass("fa-sort-down");
    }

    // Refetch and sort data after toggling the direction
    getAllStaff();
  });
});
