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

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [user, equipments] = await Promise.all([
      getUser(request),
      prisma.equipment.findMany(),
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
    return null;
  } catch (error) {
    console.error(error);

    throw new Error("Unknown server error, please try again.");
  }
}

export default function Equipments() {
  const { equipments } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-6xl">
      <PageTitle title="Equipments" />
      <div className="flex gap-6 items-center mt-8 mb-4 ">
        <h2 className="text-lg">
          {equipments.length}{" "}
          {equipments.length > 1 ? "Equipments" : "Equipment"}
        </h2>
        <Separator orientation="vertical" />
        <Button>
          <Link to="/add-equipment">Add Equipment</Link>
        </Button>
      </div>

      <Separator />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <CardDescription>
            {equipment.description.substring(0, 100)}...
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
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
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{equipment.name}</DialogTitle>
        <DialogDescription>{equipment.description}</DialogDescription>
      </DialogHeader>
      <Separator />
      <DialogFooter>soem</DialogFooter>
    </DialogContent>
  );
}
