import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { GraduationCap } from "lucide-react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
  } = useContext(AuthContext);

  function handleTabChange(value) {
    setActiveTab(value);
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== "" &&
      signUpFormData.role !== "" &&
      (signUpFormData.role !== "instructor" || signUpFormData.esewaNumber !== "") // Ensure esewaNumber if role is instructor
    );
  }

  function handleRoleChange(event) {
    const selectedRole = event.target.value;
    setSignUpFormData({ 
      ...signUpFormData, 
      role: selectedRole, 
      esewaNumber: selectedRole === "instructor" ? "" : null // Reset esewaNumber if not an instructor
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link to={"/"} className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-4" />
          <span className="font-extrabold text-xl">LMS LEARN</span>
        </Link>
      </header>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Tabs
          value={activeTab}
          defaultValue="signin"
          onValueChange={handleTabChange}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signInFormControls}
                  buttonText={"Sign In"}
                  formData={signInFormData}
                  setFormData={setSignInFormData}
                  isButtonDisabled={!checkIfSignInFormIsValid()}
                  handleSubmit={handleLoginUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>Create a new account</CardTitle>
                <CardDescription>
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
            <CommonForm
              formControls={signUpFormControls}
              buttonText={"Sign Up"}
              formData={signUpFormData}
              setFormData={setSignUpFormData}
              isButtonDisabled={!checkIfSignUpFormIsValid()}
              handleSubmit={handleRegisterUser}
            />

            {/* Role Selection Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Role</label>
              <select
                value={signUpFormData.role || ""}
                onChange={handleRoleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose Role</option>
                <option value="user">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            {/* Esewa Number Input (Visible only if Instructor is selected) */}
            {signUpFormData.role === "instructor" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Esewa Number</label>
                <input
                  type="text"
                  placeholder="Enter your eSewa Number"
                  value={signUpFormData.esewaNumber || ""}
                  onChange={(e) => setSignUpFormData({ ...signUpFormData, esewaNumber: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}
</CardContent>

            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AuthPage;