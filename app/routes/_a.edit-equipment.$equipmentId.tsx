import { LoaderFunctionArgs, redirect } from "@remix-run/node";
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

    throw new Error(error);
  }
}

export default function EditEquipmentRoute() {
  const { currentUser, equipment } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "create";
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
            value="create"
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
