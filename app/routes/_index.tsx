import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "MEMS" },
    { name: "description", content: "Welcome to MEMS" },
  ];
};

export default function Index() {
  return (
    <>
      <div className="bg-[url('/memsbg.jpeg')] bg-cover bg-center text-slate-200 min-h-screen">
        <div className="max-md flex flex-col gap-8 p-12 md:pt-24">
          <h1 className="text-6xl font-black text-center">MEMS</h1>
          <p className="text-3xl text-center font-bold">
            Military equipment management system
          </p>
          <Button
            size="lg"
            className="text-lg self-center bg-orange-700 uppercase font-bold duration-300"
            asChild
          >
            <Link to="/signup">get started</Link>
          </Button>
        </div>
      </div>
      <div className="text-slate-300 py-8 px-4 bg-blue-950">
        <h1 className="uppercase font-bold underline underline-offset-2 text-center text-4xl ">
          About
        </h1>
      </div>
    </>
  );
}

export const menuItems = [
  { label: "home", href: "/" },
  { label: "about", href: "about" },
];
