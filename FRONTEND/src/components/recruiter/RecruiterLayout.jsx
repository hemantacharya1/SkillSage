import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/userSlice";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from "./Sidebar";

const RecruiterLayout = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { logout } = useAuth();

  useEffect(() => {
    if (user?.role !== "RECRUITER") {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar - fixed position */}
      <div className="hidden md:block md:w-72 h-full">
        <div className="fixed h-full w-72 z-20">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex h-16 items-center px-6">
            <div className="flex flex-1 items-center justify-between">
              <div className="md:hidden flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">SkillSage</h1>
              </div>
              <div className="flex items-center gap-4 w-full justify-end">
                <span className="text-sm text-gray-600 hidden md:block">
                  {user?.firstName} {user?.lastName}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9 border border-gray-200">
                        <AvatarFallback className="bg-[#0061ff] text-white">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto py-6 px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
