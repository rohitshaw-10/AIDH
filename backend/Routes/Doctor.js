const express = require("express");
const router = express.Router();
const { User, Doctor, Admin, Contact,Request } = require("../models/User");

// Route to get all doctors
router.get("/viewdoctor", async (req, res) => {
    
  try {
    const doctors = await Doctor.find(); // Fetch all doctors from the database
    //console.log(doctors);
    res.status(200).json(doctors); // Send doctors as a JSON response
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Error fetching doctors" });
  }
});


router.post("/submitRequest", async (req, res) => {
  try {
    const { doctorId, userId, userName, gender, age, symptoms, phone } = req.body;

    // Validate required fields
    if (!doctorId || !userId || !userName || !gender || !age || !symptoms || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate phone number format
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
    }

    // Find the request record for the doctor
    let requestRecord = await Request.findOne({ doctorId });

    if (!requestRecord) {
      // Create a new record if none exists for the doctor
      requestRecord = new Request({
        doctorId,
        requests: [
          { userId, userName, gender, age, symptoms, phone, createdAt: new Date() },
        ],
      });
    } else {
      // Append the new request to the existing record
      requestRecord.requests.push({
        userId,
        userName,
        gender,
        age,
        symptoms,
        phone,
        createdAt: new Date(),
      });
    }

    // Save the request record
    await requestRecord.save();

    res.status(201).json({ message: "Request submitted successfully!" });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/requests/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const requestRecord = await Request.findOne({ doctorId }).populate("requests.userId", "name email");

    if (!requestRecord || requestRecord.requests.length === 0) {
      return res.status(404).json({ message: "No requests found for this doctor." });
    }

    res.status(200).json({ requests: requestRecord.requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error." });
  }
});


module.exports = router;
