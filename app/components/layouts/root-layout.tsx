import React from "react";
import { Link, Outlet } from "@remix-run/react";
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

export function RootLayout() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  return (
    <Dialog>
      <NavBar
        menuItems={menuItems}
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
  { label: "about", href: "about" },
];
