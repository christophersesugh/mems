import { Link, NavLink } from "@remix-run/react";
import { GiHamburgerMenu as Menu } from "react-icons/gi";
import { Button } from "~/components/ui/button";
import { cn } from "~/shadcn";

type MainNavProps = {
  menuItems?: { label: string; href: string }[];
  isOpen: boolean;
  authApp: boolean;
  handleNavToggle: () => void;
};

type ItemProps = {
  label: string;
  href: string;
};

export function MainNav({
  // isOpen,
  menuItems,
  authApp,
  handleNavToggle,
}: MainNavProps) {
  // const matches = useMatches();
  // const dashboard = matches.some(
  //   (match) =>
  //     match.id.includes("dashboard") ||
  //     match.id.includes("create-task") ||
  //     match.id.includes("edit-task") ||
  //     match.id.includes("profile")
  // );
  return (
    <nav
      className={cn(
        "bg-blue-950 text-slate-300",
        authApp ? "lg:hidden block" : ""
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between py-8 px-4 xl:px-0 max-w-6xl mx-auto",
          {
            "p-4": authApp,
          }
        )}
      >
        {/* if a user is authenticated, show the drowpdown menu for mobile nav before the logo */}
        <div className={cn("flex", authApp ? "gap-2" : "")}>
          {/* {authApp ? (
            <Button
              onClick={handleNavToggle}
              size="icon"
              variant="ghost"
              aria-label="toggle navigation"
              className="lg:hidden"
              id="navbar"
              asChild
            >
              <Menu className="h-4 w-4 font-black" />
            </Button>
          ) : null} */}
          <Button variant="ghost" className="text-2xl" asChild>
            <Link to={authApp ? "/dashboard" : "/"}>
              {/* <img
                src={`https://cdn.casbytes.com/assets/${
                  authApp ? "icon.png" : "logo.png"
                }`}
                alt="CASBytes"
                width={authApp ? 40 : 200}
                height={authApp ? 40 : 200}
              /> */}
              MEMs
            </Link>
          </Button>
        </div>

        <div className="hidden lg:flex gap-4">
          <div className="flex gap-4 items-center">
            <ul className="flex gap-4">
              {menuItems && menuItems?.length > 0
                ? menuItems?.map((item: ItemProps, index: number) => (
                    <li key={`${item}-${index}`}>
                      <NavLink
                        key={`${item.href}-${index}`}
                        to={item.href}
                        aria-label={item.label}
                        className={({ isActive }) =>
                          isActive ? "text-blue-600 rounded-md" : ""
                        }
                      >
                        <Button
                          variant="link"
                          className="text-lg capitalize text-slate-200"
                        >
                          {item.label}
                        </Button>
                      </NavLink>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        {/* if a user is authenticated, show the side content drawer icon else show the drowpdown menu for mobile nav */}
        <div>
          <Button
            onClick={handleNavToggle}
            size="icon"
            variant="ghost"
            aria-label="toggle navigation"
            className="lg:hidden"
            id="navbar"
            asChild
          >
            <Menu className="h-4 w-4 font-black" />
          </Button>

          <div className="lg:flex gap-4 hidden items-center">
            <Button
              aria-label="sign in"
              className="capitalize text-lg bg-orange-600"
              asChild
            >
              <Link to="/signin">Sign in</Link>
            </Button>
            <Button
              aria-label="sign in"
              className="capitalize text-lg"
              asChild
              variant="secondary"
            >
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
