import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  async function handleRegisterUser(event) {
    event.preventDefault();

    if (!signUpFormData.role) {
      alert("Please select a role (Student or Instructor).");
      return;
    }

    // Ensure eSewa number is provided for instructors
    if (signUpFormData.role === "instructor" && !signUpFormData.esewaNumber) {
      alert("Please enter your eSewa number.");
      return;
    }

    try {
      const response = await registerService(signUpFormData);
      if (response.success) {
        alert("Registration successful! Please log in.");
        setSignUpFormData(initialSignUpFormData);
      } else {
        alert(response.message || "Registration failed. Try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();

    try {
      const data = await loginService(signInFormData);
      if (data.success) {
        sessionStorage.setItem("accessToken", JSON.stringify(data.data.accessToken));
        sessionStorage.setItem("userRole", data.data.user.role); // Store role in session
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        alert("Invalid credentials. Please try again.");
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Please try again.");
      setAuth({
        authenticate: false,
        user: null,
      });
    }
  }

  async function checkAuthUser() {
    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.log("Auth Check Error:", error);
      setAuth({
        authenticate: false,
        user: null,
      });
    } finally {
      setLoading(false);
    }
  }

  function resetCredentials() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userRole");
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
