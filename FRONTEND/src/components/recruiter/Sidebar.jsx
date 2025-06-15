import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  History,
  HelpCircle,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/recruiter/dashboard",
    },
    {
      label: "Interviews",
      icon: Calendar,
      href: "/recruiter/interviews",
    },
    {
      label: "Past Interviews",
      icon: History,
      href: "/recruiter/past-interviews",
    },
    {
      label: "Questions",
      icon: HelpCircle,
      href: "/recruiter/questions",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f9fafc] text-gray-800 border-r border-gray-200 shadow-sm">
      {/* Logo/Brand section */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-bold tracking-tight text-[#0061ff]">SkillSage</h2>
      </div>
      
      {/* Navigation section */}
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {routes.map((route) => {
            const isActive = location.pathname === route.href;
            return (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all",
                  isActive 
                    ? "bg-[#0061ff] text-white" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#0061ff]"
                )}
              >
                <route.icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-white" : "text-gray-500"
                )} />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;