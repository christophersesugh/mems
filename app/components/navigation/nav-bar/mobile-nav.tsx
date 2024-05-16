import { Link } from "@remix-run/react";
import { SignOutButton } from "~/components/signout-form";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/shadcn";

type MobileNavProps = {
  isOpen: boolean;
  authApp: boolean;
  handleNavToggle: () => void;
  className?: string;
  menuItems: { label: string; href: string }[];
};

export function MobileNav({
  isOpen,
  menuItems,
  authApp,
  className,
  handleNavToggle,
  ...props
}: MobileNavProps) {
  return (
    <nav
      className={cn(
        isOpen ? "flex lg:hidden" : "hidden",
        "flex-col lg:hidden duration-300 ease-in-out absolute  divide-y-2 bg-sky-700 text-white z-10 w-full border-b-2 drop-shadow-lg",
        className
      )}
      id="nav"
      {...props}
    >
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li key={`items-${index}`} aria-label={item.label}>
            <Button
              variant="link"
              onClick={handleNavToggle}
              className="text-lg capitalize"
              asChild
            >
              <Link to={item.href}>{item.label}</Link>
            </Button>
          </li>
        ))}
        <Separator className="text-white" />
        <li>
          {authApp ? (
            <SignOutButton isOpen={isOpen} />
          ) : (
            <div>
              <Button
                variant="ghost"
                onClick={handleNavToggle}
                className="self-center text-lg"
              >
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={handleNavToggle}
                className="self-center text-lg"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
