import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { getUser } from "./sessions";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { prisma } from "~/utils/prisma.server";
import { EquipmentForm } from "~/components/equipment-form";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const currentUser = await getUser(request);
    if (currentUser.role !== "ADMIN") {
      return redirect("/equipments");
    }
    // const users = await prisma.user.findMany({
    //   where: {
    //     NOT: {
    //       id: currentUser.userId,
    //       role: "ADMIN",
    //     },
    //     unit: currentUser.unit,
    //   },
    // });
    return { currentUser };
  } catch (error) {
    throw new Error("Error getting current user.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const creatorId = String(formData.get("creator"));
  const name = formData.get("name");
  const unit = String(formData.get("unit"));
  const description = formData.get("description");
  const quantity = Number(formData.get("quantity"));

  if (intent !== "create") {
    throw new Error("Invalid intent");
  }

  await prisma.equipment.create({
    data: {
      name: name as string,
      description: description as string,
      unit,
      creator: {
        connect: {
          id: creatorId,
        },
      },
      quantity,
    },
  });

  return redirect("/equipments");
}

export default function AddEquipmentRoute() {
  const { currentUser } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "create";
  return (
    <Container className="max-w-3xl">
      <PageTitle title="Add Equipment" />
      <EquipmentForm
        method="post"
        action="/add-equipment"
        user={currentUser}
        submitButton={
          <Button
            name="intent"
            value="create"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        }
      />
    </Container>
  );
}
