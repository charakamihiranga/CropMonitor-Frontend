import { setupModal } from "./util.js";

const logOutModal = setupModal(
  "#logout-modal",
  "#logout-btn",
  "#close-logout-modal"
);

// Function to handle active button state
function setActiveButton(buttonId) {
  // Reset all buttons to inactive state
  $("button").each(function () {
    $(this).removeClass("active");
    var icon = $(this).find("img");
  });
  
  // Set the active button
  var activeButton = $("#" + buttonId + "-btn");
  
  var activeIcon = activeButton.find("img");
  
  activeButton.addClass("active"); // Add 'active' class
  
  if (activeIcon.length) {
    activeIcon.attr("src", activeIcon.data("active")); // Set the active icon
  }
  
}

export function setUserDataToHeader(userFullName, userRole) {
  localStorage.setItem("userFullName", userFullName);
  localStorage.setItem("userRole", userRole);
}

$(document).ready(function () {
  
  const userFullName = localStorage.getItem("userFullName");
  const userRole = localStorage.getItem("userRole");

  if (userFullName && userRole) {
    $("#userFullName").text(userFullName);
    $("#userRole").text(userRole);
  }

  // Load the home page by default when the page loads
  $(".frame-container").attr("src", "view/pages/HomeFrame.html");
  setActiveButton("home");

  $("#home-btn").on("click", function (event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/Home.html");
    setActiveButton("home"); 
  });
  $("#staff-btn").on("click", function (event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/StaffManagementFrame.html");
    setActiveButton("staff");
  });
  $("#vehicle-btn").on("click", function (event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/VehicleManagementFrame.html");
    setActiveButton("vehicle");
  });
  $("#field-btn").on("click", function (event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/FieldManagementFrame.html");
    setActiveButton("field");
  });
  $("#equipment-btn").on("click", function (event) {
    event.preventDefault();
    $(".frame-container").attr(
      "src",
      "view/pages/EquipmentManagementFrame.html"
    );
    setActiveButton("equipment");
  });
  $("#crop-btn").on("click", function (event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/CropManagementFrame.html");
    setActiveButton("crop");
  });
  $("#mlog-btn").on("click", function (event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/LogManagementFrame.html");
    setActiveButton("mlog");
  });
  $("#settings-btn").on("click", function (event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/SettingsFrame.html");
    setActiveButton("settings");
  });

  $("#btn-logout-confirm").on("click", function (event) {
    event.preventDefault();
    window.top.location.href = "../../login.html";
  });

  // Add more buttons if needed
  $("#home-btn").on("click", function () {
    $(".frame-container").attr("src", "view/pages/HomeFrame.html");
    setActiveButton("home"); // Set home button as active
  });

  // Sidebar Toggle on mobile
  $("#menu-toggle").on("click", function () {
    $("#sidebar").toggleClass("sidebar-hidden sidebar-visible");
  });

  // Close sidebar on mobile
  $("#close-sidebar").on("click", function () {
    $("#sidebar").toggleClass("sidebar-hidden sidebar-visible");
  });

  // Search bar input event
  $("#search-bar").on("input", function () {
    const searchQuery = $(this).val(); // Get the current value of the search input

    // Send the search query to the iframe
    $(".frame-container").each(function () {
      $(this)[0].contentWindow.postMessage(
        { type: "SEARCH_UPDATE", query: searchQuery },
        "*"
      );
    });
  });
});
