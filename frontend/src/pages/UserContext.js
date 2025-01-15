// import React, { createContext, useContext, useState, useEffect } from 'react';

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userEmail, setUserEmail] = useState('');

//   // Effect to check local storage on initial render
//   useEffect(() => {
//     const storedEmail = localStorage.getItem('userEmail');
//     if (storedEmail) {
//       setIsLoggedIn(true);
//       setUserEmail(storedEmail);
//     }
//   }, []);

//   const login = (email) => {
//     setIsLoggedIn(true);
//     setUserEmail(email);
//     localStorage.setItem('userEmail', email); // Save email to local storage
//   };

//   const logout = () => {
//     setIsLoggedIn(false);
//     setUserEmail('');
//     localStorage.removeItem('userEmail'); // Remove email from local storage
//   };

//   return (
//     <UserContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userEmail, setUserEmail] = useState('');

//   // Validate session on initial render
//   useEffect(() => {
//     const validateSession = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/validate-session', {
//           withCredentials: true,
//         });
//         if (response.data.valid) {
//           const storedEmail = localStorage.getItem('userEmail');
//           if (storedEmail) {
//             setIsLoggedIn(true);
//             setUserEmail(storedEmail);
//           }
//         } else {
//           logout(); // Clear state if session is invalid
//         }
//       } catch (error) {
//         console.error('Error validating session:', error);
//         logout();
//       }
//     };
  
//     validateSession();
//   }, []);
  

//   const login = (email) => {
//     setIsLoggedIn(true);
//     setUserEmail(email);
//     localStorage.setItem('userEmail', email); // Save email to local storage
//   };

  

//   const logout = async () => {
//     try {
//       console.log("Sending logout request to server...");
//       const response = await axios.post(
//         "http://localhost:5000/api/logout",
//         {},
//         { withCredentials: true }
//       );
//       console.log("Logout response:", response.data);
//       setIsLoggedIn(false);
//         setUserEmail('');
//     localStorage.removeItem('userEmail'); // Remove email from local storage
//     } catch (error) {
//       console.error("Error during logout:", error.response || error.message);
//     }
//   };
  

//   return (
//     <UserContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userDetails, setUserDetails] = useState(null);

  // Validate session on initial render
  // In UserContext.js (Frontend)

useEffect(() => {
  const validateSession = async () => {
   
    try {
      const response = await axios.get('http://localhost:5000/api/validate-session', {
        withCredentials: true, // Send cookies with the request
      });
      console.log("hello");
      if (response.data.valid) {
        const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
        if (storedUserDetails) {
          setIsLoggedIn(true);
          setUserEmail(storedUserDetails.user.email);
          setUserDetails(storedUserDetails);
        }
      } else {
        logout(); // If the session is invalid, log out the user
        
      }
    } catch (error) {
      console.error('Error validating session:', error);
      logout(); // Log out if validation fails
    }
  };

  validateSession(); // Run on mount
}, []);


  const login = (data) => {
    setIsLoggedIn(true);
    setUserDetails(data);
    setUserEmail(data.user.email);
    localStorage.setItem('userEmail', data.user.email); // Save email to local storage
    localStorage.setItem('userDetails', JSON.stringify(data)); // Save full user details
  };

  const logout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { withCredentials: true } // Send cookies with logout request
      );
      console.log("Logout response:", response.data);

      // Clear state and local storage
      setIsLoggedIn(false);
      setUserDetails(null);
      setUserEmail('');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userDetails');

       
      
    } catch (error) {
      console.error("Error during logout:", error.response || error.message);
    }
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, userEmail, userDetails, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);




