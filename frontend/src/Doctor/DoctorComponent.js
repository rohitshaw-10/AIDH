import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../pages/UserContext.js"; // Ensure this provides user data
import axios from "axios";

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#007bff",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  sidebarButton: {
    backgroundColor: "transparent",
    color: "white",
    border: "none",
    marginBottom: "10px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
  },
  sidebarButtonActive: {
    backgroundColor: "#0056b3",
  },
  content: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#f7f7f7",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userDetails, logout } = useUser(); // Assuming useUser handles user details
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const storedUserDetails = JSON.parse(localStorage.getItem("userDetails"));

    

    const fetchRequests = async () => {
      try {
        const doctorId = userDetails?.user.userId || storedUserDetails?.user.userId;
        const response = await axios.get(`http://localhost:5000/doctor/requests/${doctorId}`);
        setRequests(response.data.requests || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
        alert("Failed to load requests. Please try again.");
      }
    };

    fetchRequests();
  }, [isLoggedIn, userDetails, navigate]);

  const handleLogout = async () => {
    try {
      await logout(); // Use logout function from UserContext
      localStorage.removeItem("userDetails"); // Clear localStorage
      alert("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2>Doctor Dashboard</h2>
        <button
          style={{
            ...styles.sidebarButton,
            ...(activeTab === "requests" ? styles.sidebarButtonActive : {}),
          }}
          onClick={() => setActiveTab("requests")}
        >
          User Requests
        </button>
        <button style={styles.sidebarButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {activeTab === "requests" && (
          <div>
            <h1>User Requests</h1>
            {requests.length > 0 ? (
              requests.map((req, index) => (
                <div key={index} style={styles.card}>
                  <p>
                    <strong>Name:</strong> {req.userName}
                  </p>
                  <p>
                    <strong>Gender:</strong> {req.gender}
                  </p>
                  <p>
                    <strong>Age:</strong> {req.age}
                  </p>
                  <p>
                    <strong>Symptoms:</strong> {req.symptoms}
                  </p>
                  <p>
                    <strong>Phone:</strong> {req.phone}
                  </p>
                  <p>
                    <strong>Requested At:</strong>{" "}
                    {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No user requests found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
