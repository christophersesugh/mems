import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Container } from "~/components/container";
import { EquipmentForm } from "~/components/equipment-form";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { getUser } from "./sessions";
import { prisma } from "~/utils/prisma.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const equipmentId = params.equipmentId;
    if (!equipmentId) {
      throw new Error("Equipment ID is required.");
    }
    const currentUser = await getUser(request);

    if (currentUser.role !== "ADMIN") {
      return redirect("/equipments");
    }

    const [users, equipment] = await Promise.all([
      prisma.user.findMany({
        where: {
          NOT: {
            id: currentUser.userId,
            role: "ADMIN",
          },
          unit: currentUser.unit,
        },
      }),
      prisma.equipment.findUnique({
        where: {
          id: equipmentId,
          creatorId: currentUser.userId,
        },
      }),
    ]);

    return { currentUser, users, equipment };
  } catch (error) {
    console.error(error);

    throw new Error("Error getting user.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const name = formData.get("name");
  const unit = String(formData.get("unit"));
  const description = formData.get("description");
  const quantity = Number(formData.get("quantity"));
  const creatorId = String(formData.get("creator"));

  if (intent !== "edit") {
    throw new Error("Invalid intent");
  }
  const equipmentId = String(formData.get("equipmentId"));
  const status = String(formData.get("status") || "AVAILABLE");

  await prisma.equipment.update({
    where: {
      id: equipmentId,
    },
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
      status,
    },
  });

  return redirect("/equipments");
}

export default function EditEquipmentRoute() {
  const { currentUser, equipment } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "edit";
  return (
    <Container className="max-w-3xl">
      <PageTitle title="Edit Equipment" />
      <EquipmentForm
        method="post"
        action={`/edit-equipment/${equipment?.id}`}
        equipment={equipment}
        user={currentUser}
        submitButton={
          <Button
            name="intent"
            value="edit"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Editing..." : "Edit"}
          </Button>
        }
      />
    </Container>
  );
}
