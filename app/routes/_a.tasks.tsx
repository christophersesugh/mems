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

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getUser(request);
    const tasks = await prisma.task.findMany({
      where: {
        ...(user.role === "ADMIN"
          ? { assigner: { userId: user.userId } }
          : { assignees: { some: { userId: user.userId } } }),
      },
      orderBy: {
        createdAt: "desc",
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
        comments: {
          include: {
            user: true,
          },
        },
        equipment: true,
      },
    });

    console.log(tasks);

    return { tasks, user };
  } catch (error) {
    console.error(error);
    throw new Error("Unknown server error, please try again.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const taskId = String(formData.get("taskId"));
  try {
    if (intent === "delete") {
      await prisma.task.delete({
        where: {
          id: taskId,
        },
      });
    }
    return null;
  } catch (error) {
    console.error(error);
    throw new Error("Unknown server error, please try again.");
  }
}

export default function Tasks() {
  const { tasks, user } = useLoaderData<typeof loader>();
  return (
    <Container className="max-w-6xl">
      <PageTitle title="tasks" />
      <div className="flex gap-6 items-center mt-8 mb-4 ">
        <h2 className="text-lg">
          {tasks.length} {tasks.length > 1 ? "tasks" : "task"}
        </h2>
        <Separator orientation="vertical" />
        <Button disabled={user.role !== "ADMIN"}>
          <Link to="/add-task">Add task</Link>
        </Button>
      </div>

      <Separator />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-6">
        {tasks?.length ? (
          tasks.map((task) => <TaskCard task={task} key={task.id} />)
        ) : (
          <p className="text-xl text-center">No tasks at the moment</p>
        )}
      </div>
    </Container>
  );
}

function TaskCard({ task }: any) {
  const { user } = useLoaderData<typeof loader>();
  const eq = useFetcher();
  const isD = eq.formData?.get("intent") === "delete";

  return (
    <Dialog>
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription className="h-16">
            {task.description.substring(0, 100)}...
          </CardDescription>
          <Separator />
          <div className="text-xs flex flex-col gap-2">
            <div>
              <span className="text-slate-500">Status:</span>{" "}
              <span
                className={cn(
                  "py-1 px-2 rounded-md text-xs",
                  task.status === "IN_PROGRESS"
                    ? "bg-yellow-200 text-yellow-800"
                    : task.status === "COMPLETED"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-red-200 text-red-800"
                )}
              >
                {task.status}
              </span>
            </div>
            <p>
              <span className="text-slate-500">Assigner:</span>{" "}
              {task.assigner.user.name}
            </p>
            <p>
              <span className="text-slate-500">Equipment:</span>{" "}
              {task.equipment.name}
            </p>
            <p>
              <span className="text-slate-500">Assignees:</span>{" "}
              <ol className="list-digit">
                {task.assignees.map((assignee: any) => (
                  <li key={assignee.id}>{assignee.user.name}</li>
                ))}
              </ol>
            </p>
            <p>
              <span className="text-slate-500">Comments:</span>{" "}
              {task.comments.length}
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
              <Link to={`/edit-task/${task.id}`}>Edit</Link>
            </Button>
          </div>
          <eq.Form method="post" className="w-full">
            <input type="hidden" name="taskId" value={task.id} />
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
          <p className="text-xs text-slate-500 text-center">
            Only assigners are able to `edit` and `delete` tasks.
          </p>
        </CardFooter>
        <TaskDialog task={task} />
      </Card>
    </Dialog>
  );
}

function TaskDialog({ task }: any) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{task.title}</DialogTitle>
        <DialogDescription>{task.description}</DialogDescription>
      </DialogHeader>
      <Separator />
      <DialogFooter>soem</DialogFooter>
    </DialogContent>
  );
}
