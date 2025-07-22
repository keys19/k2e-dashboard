// File: Sidebar.jsx
// Description: Sidebar component for the teacher dashboard, featuring navigation links and user information.
// File: Sidebar.jsx
// Description: Sidebar component for the teacher dashboard, featuring navigation links and user information.

import { NavLink } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import {
  ChevronRight, ScanLine, ChevronLeft, BarChart2,
  CalendarDays, BookOpen, ClipboardList, LineChart,
  Users, Layers
} from 'lucide-react';

import logoFull from '../assets/k2e-logo2.png';
import logoCompact from '../assets/k2e-logo3.png';
import { ADMIN_EMAILS } from '../adminList'; 

const Sidebar = () => {
  const { user, isLoaded } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  if (!isLoaded) return null;

  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = ADMIN_EMAILS.includes(email);

  const navItems = [
    { to: "/teacher/dashboard", icon: <BarChart2 size={18} />, label: "Dashboard" },
    { to: "/teacher/attendance", icon: <CalendarDays size={18} />, label: "Attendance" },
    { to: "/teacher/lesson-plans", icon: <BookOpen size={18} />, label: "Lesson Plans" },
    { to: "/teacher/assessments", icon: <ClipboardList size={18} />, label: "Assessments" },
    { to: "/teacher/reports", icon: <LineChart size={18} />, label: "Reports" },
    { to: "/teacher/students", icon: <Users size={18} />, label: "Student Groups" },
    ...(isAdmin
      ? [{ to: "/teacher/teachers", icon: <Users size={18} />, label: "Teachers" }]
      : []),
    { to: "/teacher/auto-grade", icon: <ScanLine size={18} />, label: "Auto Grader" },
    { to: "/teacher/quizzes", icon: <Layers size={18} />, label: "Quizzes" },
  ];

  return (
    <div className={`min-h-screen ${collapsed ? 'w-20' : 'w-64'} bg-[#0072e5] text-white flex flex-col py-6 shadow-lg z-50 pl-2 pr-1 transition-all duration-300`}>
      {/* Logo */}
      <div className="flex justify-between items-center px-4">
        <img
          src={collapsed ? logoCompact : logoFull}
          alt="Key2Enable"
          className={`object-contain transition-all duration-300 ${
            collapsed ? 'w-10 mx-auto mb-4' : 'w-[120px] mx-auto mb-8'
          }`}
        />
        <button onClick={() => setCollapsed(!collapsed)} className="text-white mb-2">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Clerk User Info */}
      <div className={`flex flex-col items-center ${collapsed ? 'mb-4' : 'mb-6'} transition-all`}>
        <UserButton afterSignOutUrl="/dashboard" />
        {!collapsed && user && (
          <>
            <p className="mt-2 font-semibold text-sm text-center">{user.fullName}</p>
            <p className="text-xs text-center">{email}</p>
          </>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-4 w-full px-2">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2 px-4 rounded text-sm font-medium transition-colors duration-200 ${
                isActive ? 'bg-orange-500' : 'hover:bg-blue-500'
              }`
            }
          >
            {icon}
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;


// import { NavLink } from 'react-router-dom';
// import { UserButton, useUser } from '@clerk/clerk-react';
// import { useEffect, useState } from 'react';
// import {ChevronRight, ScanLine, ChevronLeft, BarChart2, CalendarDays, BookOpen, ClipboardList, LineChart, Users, Menu, X, Layers } from 'lucide-react';
// import logoFull from '../assets/k2e-logo2.png';
// import logoCompact from '../assets/k2e-logo3.png';

// const Sidebar = () => {
//   const { user, isLoaded } = useUser();
//   const [collapsed, setCollapsed] = useState(false);

//   useEffect(() => {
//     console.log('User:', user);
//     console.log('isLoaded:', isLoaded);
//   }, [user, isLoaded]);

//   const navItems = [
//     { to: "/teacher/dashboard", icon: <BarChart2 size={18} />, label: "Dashboard" },
//     { to: "/teacher/attendance", icon: <CalendarDays size={18} />, label: "Attendance" },
//     { to: "/teacher/lesson-plans", icon: <BookOpen size={18} />, label: "Lesson Plans" },
//     { to: "/teacher/assessments", icon: <ClipboardList size={18} />, label: "Assessments" },
//     { to: "/teacher/reports", icon: <LineChart size={18} />, label: "Reports" },
//     { to: "/teacher/students", icon: <Users size={18} />, label: "Student Groups" },
//     { to: "/teacher/teachers", icon: <Users size={18} />, label: "Teachers" },
//      { to: "/teacher/auto-grade", icon: <ScanLine size={18} />, label: "Auto Grader" },
//      { to: "/teacher/quizzes",     icon: <Layers   size={18} />, label: "Quizzes" },
//   ];

//   return (
//     <div className={`min-h-screen ${collapsed ? 'w-20' : 'w-64'} bg-[#0072e5] text-white flex flex-col py-6 shadow-lg z-50 pl-2 pr-1 transition-all duration-300`}>
//     {/* <div className={`min-h-screen ${collapsed ? 'w-16' : 'w-64'} bg-[#0072e5] text-white flex flex-col py-6 shadow-lg transition-all duration-300`}> */}
//       {/* Logo */}
//       <div className="flex justify-between items-center px-4">
//         <img
//           src={collapsed ? logoCompact : logoFull}
//           alt="Key2Enable"
//           className={`object-contain transition-all duration-300 ${
//             collapsed ? 'w-10 mx-auto mb-4' : 'w-[120px] mx-auto mb-8'
//           }`}
//         />
//         <button onClick={() => setCollapsed(!collapsed)} className="text-white mb-2">
//           {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>

//       {/* Clerk User – always show avatar, expand text if not collapsed */}
//       <div className={`flex flex-col items-center ${collapsed ? 'mb-4' : 'mb-6'} transition-all`}>
//         <UserButton afterSignOutUrl="/dashboard" />
//         {!collapsed && user && (
//           <>
//             <p className="mt-2 font-semibold text-sm text-center">{user.fullName}</p>
//             <p className="text-xs text-center">{user.primaryEmailAddress?.emailAddress}</p>
//           </>
//         )}
//       </div>


//       {/* Nav Links */}
//       <nav className="flex flex-col gap-4 w-full px-2">
//         {navItems.map(({ to, icon, label }) => (
//           <NavLink
//             key={label}
//             to={to}
//             className={({ isActive }) =>
//               `flex items-center gap-3 py-2 px-4 rounded text-sm font-medium transition-colors duration-200 ${
//                 isActive ? 'bg-orange-500' : 'hover:bg-blue-500'
//               }`
//             }
//           >
//             {icon}
//             {!collapsed && label}
//           </NavLink>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;
