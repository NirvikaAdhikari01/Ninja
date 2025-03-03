import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { BarChart, Book, LogOut } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";

function InstructorDashboardpage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, resetCredentials } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } = useContext(InstructorContext);

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
