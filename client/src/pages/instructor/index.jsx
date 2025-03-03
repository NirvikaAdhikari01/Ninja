import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Book, LogOut } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";
import { saveInstructorIntroService } from "@/services";

function InstructorDashboardpage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, resetCredentials } = useContext(AuthContext);
  const { auth } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } = useContext(InstructorContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    introduction: "",
    profilePhoto: null,
    introVideo: null,
    availableSlots: "",
  });

  const fetchAllCourses = useCallback(async () => {
    if (!user || user.role !== "instructor") {
      console.warn("User is not an instructor or not available");
      return;
    }

    try {
      const instructorId = user?._id?.toString();
      console.log("Fetching courses for Instructor ID:", instructorId);
      const response = await fetchInstructorCourseListService(instructorId);

      if (response?.success) {
        setInstructorCoursesList(response.data);
        console.log("Updated instructorCoursesList:", response.data);
      } else {
        console.error("Failed to fetch courses:", response?.message);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, [user, setInstructorCoursesList]);

  useEffect(() => {
    if (user) fetchAllCourses();
  }, [user, fetchAllCourses]);

  const handleLogout = () => {
    resetCredentials();
    sessionStorage.clear();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  // Correct way to access user data

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!auth?.user?._id) {
      console.error("User ID not found");
      return;
    }
  
    const { introduction, availableSlots, profilePhoto, introVideo } = formData;
  
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("instructorId", auth.user._id);
    formDataToSubmit.append("name", auth.user.userName); // assuming you have the username stored in auth.user.username
    formDataToSubmit.append("introduction", introduction);
    formDataToSubmit.append("availableSlots", availableSlots);
  
    if (profilePhoto) formDataToSubmit.append("profilePhoto", profilePhoto);
    if (introVideo) formDataToSubmit.append("introVideo", introVideo);
  
    try {
      const response = await saveInstructorIntroService(formDataToSubmit);
      if (response.success) {
        console.log("✅ Instructor details saved successfully:", response);
        setIsModalOpen(false);
      } else {
        console.error("❌ Error saving instructor details:", response.message);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
    }
  };
  
  


  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
  ];

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Instructor View</h2>
          <nav>
            {menuItems.map(({ icon: Icon, label, value }) => (
              <Button
                key={value}
                className="w-full justify-start mb-2"
                variant={activeTab === value ? "secondary" : "ghost"}
                onClick={value === "logout" ? handleLogout : () => setActiveTab(value)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {/* Personal Training Button */}
          <Button onClick={() => setIsModalOpen(true)} className="mb-6">
            Do Personal Training
          </Button>

          {/* Personal Training Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Personal Training Details</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Introduction</label>
                  <Textarea
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleInputChange}
                    placeholder="Write a short introduction..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Profile Photo</label>
                  <Input type="file" name="profilePhoto" accept="image/*" onChange={handleFileChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium">Introduction Video</label>
                  <Input type="file" name="introVideo" accept="video/*" onChange={handleFileChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium">Available Time Slots</label>
                  <Input
                    type="text"
                    name="availableSlots"
                    value={formData.availableSlots}
                    onChange={handleInputChange}
                    placeholder="e.g., Monday 2PM-4PM, Wednesday 3PM-5PM"
                    required
                  />
                </div>

                <Button type="submit">Submit</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dashboard Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map(({ value, component }) => (
              <TabsContent key={value} value={value}>
                {component}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardpage;