/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { prisma } from "~/utils/prisma.server";
import { getUser } from "./sessions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/shadcn";
import { format } from "date-fns";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [user, equipments] = await Promise.all([
      getUser(request),
      prisma.equipment.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          creator: {
            select: {
              name: true,
            },
          },
          signIns: {
            include: {
              user: true,
            },
          },
          signOuts: {
            include: {
              user: true,
            },
          },
        },
      }),
    ]);

    return { equipments, user };
  } catch (error) {
    throw new Error("Unknown server error, please try again.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const equipmentId = String(formData.get("equipmentId"));
  try {
    if (intent === "delete") {
      await prisma.equipment.delete({
        where: {
          id: equipmentId,
        },
      });
    }

    if (intent === "signin") {
      const userId = String(formData.get("userId"));
      const userName = String(formData.get("userName"));
      await prisma.equipment.update({
        where: {
          id: equipmentId,
        },
        data: {
          signIns: {
            create: {
              userId,
            },
          },
          lastSignInDate: new Date(Date.now()).toISOString(),
          lastUserSignIn: userName,
        },
      });
    }

    if (intent === "signout") {
      const userId = String(formData.get("userId"));
      const userName = String(formData.get("userName"));
      await Promise.all([
        prisma.equipment.update({
          where: {
            id: equipmentId,
          },
          data: {
            signOuts: {
              create: {
                userId,
              },
            },
            lastSignOutDate: new Date(Date.now()).toISOString(),
            lastUserSignOut: userName,
          },
        }),
        prisma.equipment.update({
          where: {
            id: equipmentId,
          },
          data: {
            signIns: {
              deleteMany: {
                userId,
              },
            },
          },
        }),
      ]);
    }
    return null;
  } catch (error) {
    throw new Error("Unknown server error, please try again.");
  }
}

export default function Equipments() {
  const { equipments, user } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-6xl">
      <PageTitle title="Equipments" />
      <div className="flex gap-6 items-center mt-8 mb-4 ">
        <h2 className="text-lg">
          {equipments.length}{" "}
          {equipments.length > 1 ? "Equipments" : "Equipment"}
        </h2>
        <Separator orientation="vertical" />
        <Button disabled={user.role !== "ADMIN"}>
          <Link to="/add-equipment">Add Equipment</Link>
        </Button>
      </div>

      <Separator />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {equipments?.length ? (
          equipments.map((equipment) => (
            <EquipmentCard equipment={equipment} key={equipment.id} />
          ))
        ) : (
          <p className="text-xl text-center">No equipments at the moment</p>
        )}
      </div>
    </Container>
  );
}

function EquipmentCard({ equipment }: any) {
  const { user } = useLoaderData<typeof loader>();
  const eq = useFetcher();
  const isD = eq.formData?.get("intent") === "delete";

  return (
    <Dialog>
      <Card>
        <CardHeader>
          <CardTitle>{equipment.name}</CardTitle>
          <CardDescription className="h-16">
            {equipment.description.substring(0, 100)}...
          </CardDescription>
          <Separator />
          <div className="text-xs flex flex-col gap-2">
            <div>
              <span className="text-slate-500">Status:</span>{" "}
              <span
                className={cn(
                  "py-1 px-2 rounded-md text-xs",
                  equipment.status === "AVAILABLE"
                    ? "bg-green-100 text-green-800"
                    : equipment.status === "IN_USE"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {equipment.status}
              </span>
            </div>
            <p>
              <span className="text-slate-500">Creator:</span>{" "}
              {equipment.creator.name}
            </p>
            <p>
              <span className="text-slate-500">Unit:</span> {equipment.unit}
            </p>
            <p>
              <span className="text-slate-500">Quantity:</span>{" "}
              {equipment.quantity}
            </p>
            <p>
              <span className="text-slate-500">Sign Ins:</span>{" "}
              {equipment.signIns?.length}
            </p>
            <p>
              <span className="text-slate-500">Sign Outs:</span>{" "}
              {equipment.signOuts?.length}
            </p>
          </div>
        </CardHeader>
        <Separator />
        <CardFooter className="flex flex-col gap-2 pt-2">
          <div className="w-full flex justify-between gap-2">
            <DialogTrigger asChild>
              <Button size={"sm"} variant={"secondary"} className="w-1/2">
                View
              </Button>
            </DialogTrigger>
            <Button
              size={"sm"}
              variant={"outline"}
              className="w-1/2"
              disabled={user.role !== "ADMIN"}
            >
              <Link to={`/edit-equipment/${equipment.id}`}>Edit</Link>
            </Button>
          </div>
          <eq.Form method="post" className="w-full">
            <input type="hidden" name="equipmentId" value={equipment.id} />
            <Button
              name="intent"
              value="delete"
              size={"sm"}
              variant={"destructive"}
              className="w-full"
              disabled={isD || user.role !== "ADMIN"}
            >
              {isD ? "Deleting..." : "Delete"}
            </Button>
          </eq.Form>
        </CardFooter>
        <EquipmentDialog equipment={equipment} />
      </Card>
    </Dialog>
  );
}

function EquipmentDialog({ equipment }: any) {
  const { user } = useLoaderData<typeof loader>();
  const eq = useFetcher();
  const isUserSignedIn = equipment.signIns.some(
    (s: any) => s.userId === user.userId
  );
  const eqStatus =
    equipment.status === "IN_USE" || equipment.status === "MAINTENANCE";

  const isSigningOut = eq.formData?.get("intent") === "signout";
  const isSigningIn = eq.formData?.get("intent") === "signin";
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{equipment.name}</DialogTitle>
        <DialogDescription>{equipment.description}</DialogDescription>
        <Separator />
        <div className="text-sm flex flex-col gap-2">
          <div>
            <span className="text-slate-500">Status:</span>{" "}
            <span
              className={cn(
                "py-1 px-2 rounded-md text-xs",
                equipment.status === "AVAILABLE"
                  ? "bg-green-100 text-green-800"
                  : equipment.status === "IN_USE"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {equipment.status}
            </span>
          </div>
          <p>
            <span className="text-slate-500">Creator:</span>{" "}
            {equipment.creator.name}
          </p>
          <p>
            <span className="text-slate-500">Unit:</span> {equipment.unit}
          </p>
          <p>
            <span className="text-slate-500">Quantity:</span>{" "}
            {equipment.quantity}
          </p>
          <p>
            <span className="text-slate-500">Last maintained on:</span>{" "}
            {format(new Date(equipment?.lastMaintenance), "do MMMM, yyyy") ??
              "Not maintained yet"}
          </p>

          <p>
            <span className="text-slate-500">Last Signed by:</span>{" "}
            {equipment?.lastUserSignIn ?? "Not signed yet"}
          </p>
          <p>
            <span className="text-slate-500">Last Signed Out by:</span>{" "}
            {equipment?.lastUserSignOut ?? "Not signed out yet"}
          </p>
          <p>
            <span className="text-slate-500">Last Signed on:</span>{" "}
            {format(new Date(equipment?.lastSignInDate), "do MMMM, yyyy") ??
              "Not signed yet"}
          </p>

          <p>
            <span className="text-slate-500">Last Signed Out on:</span>{" "}
            {format(new Date(equipment?.lastSignOutDate), "do MMMM, yyyy") ??
              "Not signed out yet"}
          </p>
          <div className="flex flex-wrap justify-between">
            {equipment.signIns?.length ? (
              <div>
                <span className="text-slate-500 mb-2">Sign Ins:</span>
                <ol className="list-decimal">
                  {equipment?.signIns.map((s: any) => (
                    <li key={s.id}>{s.user.name}</li>
                  ))}
                </ol>
              </div>
            ) : null}
            {equipment.signOuts?.length ? (
              <div>
                <span className="text-slate-500">Sign Outs:</span>
                <ol className="list-decimal">
                  {equipment?.signOuts.map((s: any) => (
                    <li key={s.id}>{s.user.name}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        </div>
      </DialogHeader>
      <Separator />
      <DialogFooter>
        <eq.Form method="post" className="flex gap-4 flex-wrap">
          <input type="hidden" name="userId" value={user.userId} />
          <input type="hidden" name="userName" value={user.name} />
          <input type="hidden" name="equipmentId" value={equipment.id} />
          {isUserSignedIn ? (
            <Button
              name="intent"
              value="signout"
              size={"sm"}
              variant={"destructive"}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing Out" : "Sign Out"}
            </Button>
          ) : null}
          <Button
            name="intent"
            value="signin"
            size={"sm"}
            disabled={eqStatus || isUserSignedIn || isSigningIn}
          >
            {isUserSignedIn
              ? "Signed In"
              : isSigningIn
              ? "Signing In"
              : "Sign Equipment"}
          </Button>
        </eq.Form>
      </DialogFooter>
      {equipment.status == "IN_USE" || equipment.status == "MAINTENANCE" ? (
        <p className="text-sm text-center text-red-500">
          You cannot sign weapons or equipments under maintenance or in-use.
        </p>
      ) : null}
    </DialogContent>
  );
}
