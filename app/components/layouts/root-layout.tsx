import React from "react";
import { Link, Outlet, useMatches } from "@remix-run/react";
import { Footer } from "../footer";
import { NavBar } from "../navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { MdAddTask } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaTools, FaUserCircle } from "react-icons/fa";
import { GoTasklist } from "react-icons/go";

export function RootLayout() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  const matches = useMatches();

  const authApp = matches.some((match) => match.id.includes("_a"));

  return (
    <Dialog>
      <NavBar
        menuItems={authApp ? authMenuItems : menuItems}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
      />
      <Outlet />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In as</DialogTitle>
        </DialogHeader>
        <div className="w-full mx-auto flex flex-col gap-6">
          <DialogClose asChild>
            <Link to="/admin-signin">
              <Button className="w-full text-lg">Admin</Button>
            </Link>
          </DialogClose>
          <DialogClose asChild>
            <Link to="/user-signin">
              <Button className="w-full text-lg">Maintainer</Button>
            </Link>
          </DialogClose>
        </div>
      </DialogContent>
      <Footer />
    </Dialog>
  );
}

export const menuItems = [
  { label: "home", href: "/" },
  { label: "about", href: "/#about" },
];

export const authMenuItems = [
  {
    icon: <FaTools size={30} />,
    label: "equipments",
    href: "equipments",
  },
  {
    icon: <GoTasklist size={30} />,
    label: "tasks",
    href: "tasks",
  },
  {
    icon: <IoIosAddCircleOutline size={30} />,
    label: "add equipment",
    href: "add-equipment",
  },

  {
    icon: <MdAddTask size={30} />,
    label: "assign task",
    href: "add-task",
  },
  {
    icon: <FaUserCircle size={30} />,
    label: "profile",
    href: "profile",
  },
];
