import React from "react";
import { Outlet } from "@remix-run/react";
import { cn } from "~/shadcn";
import { FaHistory, FaUserCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { NavBar, SideBar } from "../navigation";

export function AuthAppLayout() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  return (
    <>
      <NavBar
        menuItems={menuItems}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
      />
      <SideBar
        menuItems={menuItems}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
      />
      <div
        className={cn(
          "duration-300",
          isNavOpen ? "ml-0 lg:ml-52" : "ml-0 lg:ml-16"
        )}
      >
        <Outlet />
      </div>
    </>
  );
}

const menuItems = [
  {
    icon: <MdDashboard size={30} />,
    label: "dashboard",
    href: "dashboard",
  },
  {
    icon: <IoMdAddCircleOutline size={30} />,
    label: "create task",
    href: "create_task",
  },

  {
    icon: <FaHistory size={30} />,
    label: "history",
    href: "history",
  },

  {
    icon: <FaUserCircle size={30} />,
    label: "profile",
    href: "profile",
  },
];
