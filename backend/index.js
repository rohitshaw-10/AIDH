// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const bcrypt = require("bcryptjs");
const { User, Doctor, Admin, Contact } = require("./models/User");

const FileStore = require("session-file-store")(session);
require("dotenv").config();

const adminRoutes = require("./Routes/Admin");
const doctorRoutes = require("./Routes/Doctor");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests only from the React app
    credentials: true, // Allow cookies and credentials to be sent with requests
  })
);

// MongoDB connection
const mongoURL = "mongodb://localhost:27017/integrate";

mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    //useCreateIndex:true,
    //useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

const store = new MongoDBSession({
  uri: mongoURL,
  collection: "mysessions",
});

//handle session
app.use(
  session({
    store: store, // Use file store to persist sessions
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      sameSite: "lax",
      maxAge: 3600000, // 1 hour expiration
    },
  })
);

// const createAdmin = async () => {
//   try {
//     const email = "admin123@gmail.com";
//     const plainPassword = "123";

//     // Check if an admin already exists
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       console.log("Admin with this email already exists.");
//       return;
//     }

// //     // Hash the password
//     const hashedPassword = await bcrypt.hash(plainPassword, 10);

//     // Create new admin
//     const admin = new Admin({
//       username: "Admin",
//       email,
//       password: hashedPassword,
//     });

//     // Save admin to the database
//     await admin.save();
//     console.log("Admin created successfully:", admin);
//   } catch (error) {
//     console.error("Error creating admin:", error);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// // Execute the script
// createAdmin();

app.use("/admin", adminRoutes);
app.use("/doctor", doctorRoutes);

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Save user data in session
    req.session.userId = newUser._id;

    // Respond with user information, role, and userId (like login response)
    res.status(201).json({
      message: "Signup successful",
      user: {
        username: newUser.username,
        email: newUser.email,
        role: "User",
        userId: newUser._id, // Include userId in the response
      },
      isUser: true,
      isDoctor: false,
      isAdmin: false,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Compare the provided password with the hashed password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Save user data in session
//     req.session.userId = user._id;

//     console.log("Login - Session ID:", req.sessionID);
//     console.log("Login - Session Data:", req.session);

//     // Respond with user information
//     res.json({
//       message: "Login successful",
//       user: {
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   const { email, password, isUser, isDoctor, isAdmin } = req.body;

//   try {
//     let user = null;
//     let role = "";

//     // Check the role and find the user in the corresponding collection
//     if (isUser) {
//       user = await User.findOne({ email });
//       role = "User";
//     } else if (isDoctor) {
//       user = await Doctor.findOne({ email });
//       role = "Doctor";
//     } else if (isAdmin) {
//       user = await Admin.findOne({ email });
//       role = "Admin";
//     } else {
//       return res.status(400).json({ message: "Invalid role selected" });
//     }

//     // If no user is found
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Compare the provided password with the hashed password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Save user data in session
//     req.session.userId = user._id;

//     console.log("Login - Session ID:", req.sessionID);
//     console.log("Login - Session Data:", req.session);

//     // Respond with user information and role
//     res.json({
//       message: "Login successful",
//       user: {
//         username: user.username,
//         email: user.email,
//         role: role,
//       },
//       isUser: !!isUser,
//       isDoctor: !!isDoctor,
//       isAdmin: !!isAdmin,
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

app.post("/api/login", async (req, res) => {
  const { email, password, isUser, isDoctor, isAdmin } = req.body;

  try {
    let user = null;
    let role = "";

    // Check the role and find the user in the corresponding collection
    if (isUser) {
      user = await User.findOne({ email });
      role = "User";
    } else if (isDoctor) {
      user = await Doctor.findOne({ email });
      role = "Doctor";
    } else if (isAdmin) {
      user = await Admin.findOne({ email });
      role = "Admin";
    } else {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // If no user is found
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Save user data in session
    req.session.userId = user._id;

    console.log("Login - Session ID:", req.sessionID);
    console.log("Login - Session Data:", req.session);

    // Respond with user information, role, and userId
    res.json({
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
        role: role,
        userId: user._id, // Include userId in the response
      },
      isUser: !!isUser,
      isDoctor: !!isDoctor,
      isAdmin: !!isAdmin,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/validate-session", (req, res) => {
  //console.log("Session ID:", req.sessionID); // Log session ID
  //console.log("Session Data:", req.session); // Log session data
  if (req.session && req.session.userId) {
    //console.log("Session valid:", req.session.userId);
    return res.json({ valid: true });
  } else {
    console.log("Session invalid");
    return res.json({ valid: false });
  }
});

// app.post("/api/logout", (req, res) => {
//   console.log("Logout endpoint hit");
//   req.session.destroy((err) => {
//     if (err) {
//       console.error("Error destroying session:", err);
//       return res.status(500).json({ message: "Logout failed" });
//     }
//     console.log("Session destroyed");
//     res.clearCookie("connect.sid", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     });
//     res.status(200).json({ message: "Logged out successfully" });
//   });
// });
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});

//contact api

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// app.post("/api/general", async (req, res) => {
//   const { symptoms } = req.body;

//   try {
//     // Forwarding the symptoms data to Flask server
//     const flaskResponse = await axios.post("http://localhost:5001/predict", {
//       symptoms,
//     });
//     console.log(flaskResponse.data);
//     // Return the processed result back to the React frontend
//     res.json(flaskResponse.data);
//   } catch (error) {
//     console.error("Error in communication with Flask server", error);
//     res.status(500).send("Internal server error");
//   }
// });
// app.post("/api/general", async (req, res) => {
//   const { symptoms } = req.body;

//   try {
//     // Forwarding the symptoms data to Flask server
//     const flaskResponse = await axios.post("http://localhost:5001/predict", {
//       symptoms,
//     });

//     console.log('Flask Response:', flaskResponse.data); // Log the data structure for debugging

//     // Function to safely parse stringified arrays
//     const parseArray = (data) => {
//       try {
//         // Attempt to parse the stringified array, if it's not valid, return it as is
//         return Array.isArray(data) ? data : JSON.parse(data);
//       } catch (e) {
//         return Array.isArray(data) ? data : [];
//       }
//     };

//     // Normalize the response
//     let normalizedData = [];

//     if (Array.isArray(flaskResponse.data)) {
//       normalizedData = flaskResponse.data.map((item) => ({
//         description: item.description || 'No description available',
//         diets: parseArray(item.diets) || ['No diet information available'],
//         disease: item.disease || 'No disease information available',
//         medications: parseArray(item.medications) || ['No medications available'],
//         precautions: Array.isArray(item.precautions) ? item.precautions : ['No precautions available'],
//         probability: item.probability || 0.0,
//         workout: Array.isArray(item.workout) ? item.workout : ['No workout information available'],
//       }));
//     } else {
//       // Handle single response case
//       normalizedData = [{
//         description: flaskResponse.data.description || 'No description available',
//         diets: parseArray(flaskResponse.data.diets) || ['No diet information available'],
//         disease: flaskResponse.data.disease || 'No disease information available',
//         medications: parseArray(flaskResponse.data.medications) || ['No medications available'],
//         precautions: Array.isArray(flaskResponse.data.precautions) ? flaskResponse.data.precautions : ['No precautions available'],
//         probability: flaskResponse.data.probability || 0.0,
//         workout: Array.isArray(flaskResponse.data.workout) ? flaskResponse.data.workout : ['No workout information available'],
//       }];
//     }

//     // Return the normalized data to the frontend
//     res.json(normalizedData);
//   } catch (error) {
//     console.error("Error in communication with Flask server", error);
//     res.status(500).send("Internal server error");
//   }
// });

app.post("/api/general", async (req, res) => {
  const { symptoms } = req.body;

  try {
    // Forward the symptoms data to the Flask server
    const flaskResponse = await axios.post("http://localhost:5001/predict", {
      symptoms,
    });

    //console.log("Flask Response:", flaskResponse.data); // Debugging

    // Normalize the response data
    const normalizedData = (
      Array.isArray(flaskResponse.data)
        ? flaskResponse.data
        : [flaskResponse.data]
    ).map((item) => ({
      description: item.description || "No description available",
      diets: Array.isArray(item.diets)
        ? item.diets
        : ["No diet information available"],
      disease: item.disease || "No disease information available",
      medications: Array.isArray(item.medications)
        ? item.medications
        : ["No medications available"],
      precautions: Array.isArray(item.precautions)
        ? item.precautions.filter((prec) => prec) // Filter out null or NaN values
        : ["No precautions available"],
      probability: item.probability || 0.0,
      workout: Array.isArray(item.workout)
        ? item.workout
        : ["No workout information available"],
    }));

    // Send the normalized data to the frontend
    res.json(normalizedData);
  } catch (error) {
    console.error("Error in communication with Flask server", error.message);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/:disease", async (req, res) => {
  const { disease } = req.params; // Get the disease from the URL
  const symptoms = req.body; // Extract symptoms from the request body

  // Convert the symptoms array from strings to numbers
  const formattedSymptoms = symptoms.map(Number); // Convert all elements to numbers

  let flaskUrl; // Declare a variable to hold the Flask URL

  // Determine the appropriate Flask URL based on the disease type
  switch (disease) {
    case "parkinsonsdisease":
      flaskUrl = "http://localhost:5001/predict_parkinsons";
      break;
    case "heartdisease":
      flaskUrl = "http://localhost:5001/predict_heart_disease";
      break;
    case "diabetes":
      flaskUrl = "http://localhost:5001/predict_diabetes";
      break;
    default:
      return res.status(400).send("Invalid disease type");
  }

  try {
    //Forwarding the symptoms data to the appropriate Flask server endpoint
    const flaskResponse = await axios.post(flaskUrl, formattedSymptoms);

    // Simplify the response
    const predictionKey = `${disease}_prediction`; // e.g., "diabetes_prediction"
    const predictionMessage =
      flaskResponse.data[predictionKey] || "No prediction available";

    // Send a simplified response back to the frontend
    res.json({ prediction: predictionMessage });
  } catch (error) {
    console.error("Error in communication with Flask server", error);
    res.status(500).send("Internal server error");
  }
});

// Proxy route to Flask
app.get("/get", async (req, res) => {
  try {
    const flaskResponse = await axios.get("http://localhost:5002/get", {
      params: req.query, // Forward query params
      withCredentials: true, // Include cookies in the request
      headers: {
        Cookie: req.headers.cookie, // Forward cookies
      },
    });

    // Send Flask's response back to React
    res.setHeader("Set-Cookie", flaskResponse.headers["set-cookie"] || []);
    res.json(flaskResponse.data);
  } catch (error) {
    console.error("Error communicating with Flask:", error);
    res.status(500).send("Error communicating with Flask");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
