
// Function to handle active button state
function setActiveButton(buttonId) {
  // Reset all buttons to inactive state
  $('button').each(function() {
    $(this).removeClass('active');
    var icon = $(this).find('img');
    
  });

  // Set the active button
  var activeButton = $('#' + buttonId + '-btn');
  var activeIcon = activeButton.find('img');
  activeButton.addClass('active'); // Add 'active' class
  if (activeIcon.length) {
    activeIcon.attr('src', activeIcon.data('active')); // Set the active icon
  }
}



$(document).ready(function() {
  // Button click event for Staff Management
  $("#staff-btn").on("click", function(event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/StaffManagementFrame.html");
    setActiveButton("staff"); // Set staff button as active
  });
  $("#vehicle-btn").on("click", function(event) {
    event.preventDefault();
    $(".frame-container").attr("src", "view/pages/VehicleManagementFrame.html");
    setActiveButton("vehicle"); 
  });



  // Add more buttons if needed
  $("#home-btn").on("click", function() {
    $(".frame-container").attr("src", "view/pages/HomeFrame.html");
    setActiveButton("home"); // Set home button as active
  });

  // Sidebar Toggle on mobile
  $('#menu-toggle').on('click', function() {
    $('#sidebar').toggleClass('sidebar-hidden sidebar-visible');
  });

  // Close sidebar on mobile
  $('#close-sidebar').on('click', function() {
    $('#sidebar').toggleClass('sidebar-hidden sidebar-visible');
  });

   // Search bar input event
   $("#search-bar").on("input", function() {
    const searchQuery = $(this).val(); // Get the current value of the search input

    // Send the search query to the iframe
    $(".frame-container").each(function() {
      $(this)[0].contentWindow.postMessage({ type: 'SEARCH_UPDATE', query: searchQuery }, '*');
    });
  });

});


