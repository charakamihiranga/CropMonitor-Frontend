// API URL for the GET request
const API_URL = "http://localhost:8080/cropmonitor/api/v1";

// Define the function that gets staff data from the API
export function getStaff() {
  // Return the axios GET request
  return axios.get(`${API_URL}/staff`)
    .then(response => {
      // Handle the response from the server
      return response.data; // Returns the staff data
    })
    .catch(error => {
      // Handle any error that occurs during the request
      console.error('Error fetching staff data:', error);
      throw error; // Throw the error to handle it in the controller
    });
}
