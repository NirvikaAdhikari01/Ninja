import { GraduationCap, TvMinimalPlay, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import ChatBox from "@/chat/ChatBox.jsx"; // ✅ Import ChatBox Component

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { auth, resetCredentials } = useContext(AuthContext); // ✅ Extract `auth`
  const { user } = auth; // ✅ Extract `user`
  const [showChat, setShowChat] = useState(false);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
    navigate("/auth"); // ✅ Redirect to login after logout
  }

  return (
    <header className="flex items-center justify-between p-4 border-b relative">
      <div className="flex items-center space-x-4">
        <Link to="/home" className="flex items-center hover:text-black">
          <GraduationCap className="h-8 w-8 mr-4" />
          <span className="font-extrabold md:text-xl text-[14px]">
            LMS LEARN
          </span>
        </Link>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => {
              if (!location.pathname.includes("/courses")) {
                navigate("/courses");
              }
            }}
            className="text-[14px] md:text-[16px] font-medium"
          >
            Explore Courses
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex gap-4 items-center">
          <div onClick={() => navigate("/student-courses")} className="flex cursor-pointer items-center gap-3">
            <span className="font-extrabold md:text-xl text-[14px]">
              My Courses
            </span>
            <TvMinimalPlay className="w-8 h-8 cursor-pointer" />
          </div>

          {/* ✅ Chat Button */}
          <Button onClick={() => setShowChat(!showChat)} className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat
          </Button>

          <Button onClick={handleLogout}>Sign Out</Button>
        </div>
      </div>

      {/* ✅ Chat Box Component - Only if User Exists */}
      {showChat && user && (
        <div className="fixed bottom-5 right-5 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ChatBox onClose={() => setShowChat(false)} currentUser={user} /> 
        </div>
      )}
    </header>
  );
}

export default StudentViewCommonHeader;
