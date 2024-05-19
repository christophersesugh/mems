import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { TaskForm } from "~/components/task-form";
import { getUser } from "./sessions";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { prisma } from "~/utils/prisma.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const currentUser = await getUser(request);
    if (currentUser.role !== "ADMIN") {
      return redirect("/dashboard");
    }
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: currentUser.userId,
          role: "ADMIN",
        },
        unit: currentUser.unit,
      },
    });
    return { currentUser, users };
  } catch (error) {
    throw new Error("Error getting user.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const assigner = String(formData.get("assigner"));
  const title = formData.get("title");
  const unit = String(formData.get("unit"));
  const description = formData.get("description");
  const date = new Date(formData.get("date") as string);
  const assignees = String(formData.get("assignees"))
    .split(",")
    .filter(Boolean);

  if (intent !== "create") {
    throw new Error("Invalid intent");
  }

  await prisma.task.create({
    data: {
      title: title as string,
      description: description as string,
      unit,
      date,
      assigner: {
        create: {
          user: { connect: { id: assigner } },
        },
      },
      assignees: {
        create: assignees.map((assignee) => ({
          user: { connect: { id: assignee } },
        })),
      },
    },
  });

  return redirect("/dashboard");
}

export default function CreateTaskRoute() {
  const { users, currentUser } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "create";
  return (
    <Container className="max-w-3xl">
      <PageTitle title="Create task" />
      <TaskForm
        method="post"
        action="/create"
        user={currentUser}
        users={users}
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
