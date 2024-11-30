
  $(document).ready(function () {
    // Toggle sidebar visibility on mobile
    $('#menu-toggle').on('click', function () {
      $('#sidebar').toggleClass('sidebar-hidden sidebar-visible');
    });

    // Close sidebar on mobile
    $('#close-sidebar').on('click', function () {
      $('#sidebar').toggleClass('sidebar-hidden sidebar-visible');
    });
  });
