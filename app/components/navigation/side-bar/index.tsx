import { SideBarContainer } from "./side-bar-container";
import { SideBarProvider, type SideBarProps } from "./side-bar-context";
import { SideBarContent } from "./side-bar-content";
import { Link } from "@remix-run/react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { Button } from "~/components/ui/button";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export function SideBar({
  menuItems,
  isOpen,
  setIsOpen,
  user,
  ...props
}: SideBarProps) {
  function admin(href: string, role: string) {
    return href.includes("create") && role === "USER";
  }
  return (
    <SideBarProvider
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      menuItems={menuItems}
      user={user}
      {...props}
    >
      <SideBarContainer>
        <TooltipProvider>
          <SideBarContent>
            {menuItems.map((item, index) => (
              <Tooltip key={`item-${index}`}>
                <TooltipContent className="text-lg">
                  {item.label}
                </TooltipContent>
                <TooltipTrigger>
                  <Button
                    variant="link"
                    className="text-slate-200 hover:text-white"
                    // asChild
                    disabled={admin(item.href, user.role)}
                  >
                    <Link
                      to={item.label}
                      className="flex gap-4 capitalize text-xl w-full items-center"
                    >
                      {item.icon}
                      {isOpen && item.label}
                    </Link>
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            ))}
          </SideBarContent>
        </TooltipProvider>
      </SideBarContainer>
    </SideBarProvider>
  );
}
