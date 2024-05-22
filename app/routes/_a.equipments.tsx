import { Link, useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { prisma } from "~/utils/prisma.server";

export async function loader() {
  try {
    const equipments = await prisma.equipment.findMany();
    return { equipments };
  } catch (error) {
    throw new Error("Unknown server error, please try again.");
  }
}

export default function Equipments() {
  const { equipments } = useLoaderData<typeof loader>();
  return (
    <Container>
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

      {equipments?.length ? (
        equipments.map((equipment) => (
          <div key={equipment.id}>
            <p>{equipment.name}</p>
            <p>{equipment.description}</p>
            <p>{equipment.quantity}</p>
            <Link to={`/edit-equipment/${equipment.id}`}>Edit</Link>
          </div>
        ))
      ) : (
        <p className="text-xl text-center">No equipments at the moment</p>
      )}
    </Container>
  );
}
