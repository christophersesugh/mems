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

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const taskId = params.taskId;
    if (!taskId) {
      throw new Error("Task ID is required.");
    }
    const currentUser = await getUser(request);
    if (currentUser.role !== "ADMIN") {
      return redirect("/tasks");
    }

    const [users, task, equipments] = await Promise.all([
      prisma.user.findMany({
        where: {
          NOT: {
            id: currentUser.userId,
            role: "ADMIN",
          },
          unit: currentUser.unit,
        },
      }),
      prisma.task.findUnique({
        where: {
          id: taskId,
          assigner: {
            userId: currentUser.userId,
          },
        },
        include: {
          assignees: {
            include: {
              user: true,
            },
          },
          assigner: {
            include: {
              user: true,
            },
          },
        },
      }),
      prisma.equipment.findMany(),
    ]);

    return { currentUser, users, task, equipments };
  } catch (error) {
    throw new Error("Error getting user.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const title = formData.get("title");
  const unit = String(formData.get("unit"));
  const description = formData.get("description");
  const date = new Date(formData.get("date") as string) ?? new Date();
  const assignees = String(formData.get("assignees"))
    .split(",")
    .filter(Boolean);

  if (intent !== "edit") {
    throw new Error("Invalid intent");
  }
  const taskId = String(formData.get("taskId"));

  await prisma.assignee.deleteMany({
    where: {
      taskId: taskId,
    },
  });

  const assignee = assignees
    .map((assignee) => ({
      user: { connect: { id: assignee } },
    }))
    .filter(Boolean);

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      title: title as string,
      description: description as string,
      unit,
      date,
      assignees: {
        create: assignee,
      },
    },
  });

  return redirect("/dashboard");
}

export default function EditTaskRoute() {
  const { users, currentUser, task, equipments } =
    useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const isEditing = navigation.formData?.get("intent") === "edit";

  return (
    <Container className="max-w-3xl">
      <PageTitle title="Edit task" />
      <TaskForm
        method="post"
        action={`/edit-task/${task?.id}`}
        equipments={equipments}
        user={currentUser}
        users={users}
        task={task}
        submitButton={
          <Button name="intent" value="edit" type="submit" disabled={isEditing}>
            {isEditing ? "Editing..." : "Submit"}
          </Button>
        }
      />
    </Container>
  );
}
