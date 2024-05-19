/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Outlet } from "@remix-run/react";
import { cn } from "~/shadcn";
import { SideBar } from "../navigation";
import { authMenuItems } from "./root-layout";

export function AuthAppLayout({ user }: any) {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  return (
    <>
      <SideBar
        user={user}
        menuItems={authMenuItems}
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
