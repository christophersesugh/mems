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
import { Textarea } from "~/components/ui/textarea";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FaSpinner, FaTrash } from "react-icons/fa6";

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

    return { tasks, user };
  } catch (error) {
    throw new Error("Unknown server error, please try again.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const taskId = String(formData.get("taskId"));
  const user = await getUser(request);

  try {
    if (intent === "delete") {
      await prisma.task.delete({
        where: {
          id: taskId,
        },
      });
    }

    if (intent === "addComment") {
      const comment = String(formData.get("comment"));
      await prisma.comment.create({
        data: {
          comment,
          taskId,
          userId: user.userId,
        },
      });
    }

    if (intent === "updateStatus") {
      const status = String(formData.get("status"));
      if (status === "COMPLETED") {
        await prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            status,
            equipment: {
              update: {
                lastMaintenance: new Date(),
                status: "AVAILABLE",
              },
            },
          },
        });
        return null;
      }
      await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          status,
        },
      });
    }

    if (intent === "deleteComment") {
      const commentId = String(formData.get("commentId"));
      await prisma.comment.delete({
        where: {
          userId: user.userId,
          id: commentId,
        },
      });
    }
    return null;
  } catch (error) {
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
  const [comment, setComment] = React.useState(false);
  const eq = useFetcher();
  const { user } = useLoaderData<typeof loader>();

  const isCommenting = eq.formData?.get("intent") === "addComment";
  const isUpdatingStatus = eq.formData?.get("intent") === "updateStatus";
  function isDeleting(taskId: string) {
    return (
      eq.formData?.get("intent") === "deleteComment" &&
      eq.formData?.get("taskId") === taskId
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{task.title}</DialogTitle>
        <DialogDescription>{task.description}</DialogDescription>
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
        <Separator />
        <eq.Form method="post" className="w-full">
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="userId" value={user.userId} />
          <div className="flex justify-between mb-2">
            <Button
              onClick={() => setComment(!comment)}
              size={"sm"}
              className=""
            >
              Add comment
            </Button>

            <div>
              <Select
                name="status"
                onValueChange={(value) => {
                  eq.submit(
                    {
                      intent: "updateStatus",
                      taskId: task.id,
                      status: value,
                    },
                    {
                      method: "post",
                    }
                  );
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">TODO</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs mt-2">
                status:{" "}
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
                  {isUpdatingStatus ? "Updating status..." : task.status}
                </span>
              </p>
            </div>
          </div>
          {comment ? (
            <div>
              <Textarea
                name="comment"
                placeholder="Add comment"
                className="w-full"
              />
              <Button
                name="intent"
                value="addComment"
                size={"sm"}
                className="mt-2"
                disabled={isCommenting}
              >
                {isCommenting ? "Adding comment..." : "comment"}
              </Button>
            </div>
          ) : null}
        </eq.Form>
        <Separator />
        <h3 className="underline">Comments</h3>
        <ul>
          {task?.comments?.length ? (
            task.comments.map((comment: any, i: number) => (
              <>
                <li
                  key={comment.id}
                  className="flex flex-wrap items-end justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-500">
                      {comment.user.name}
                    </p>
                    <p className="text-xs">{comment.comment}</p>
                  </div>
                  <eq.Form method="post">
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="commentId" value={comment.id} />
                    <input type="hidden" name="userId" value={user.userId} />
                    <Button
                      name="intent"
                      value="deleteComment"
                      size={"sm"}
                      variant={"ghost"}
                    >
                      {isDeleting(task.id) ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash className="text-red-500" />
                      )}
                    </Button>
                  </eq.Form>
                </li>
                {i < task.comments.length - 1 ? (
                  <Separator className="my-2" />
                ) : null}
              </>
            ))
          ) : (
            <p>No comments</p>
          )}
        </ul>
      </DialogHeader>
      <Separator />
      <DialogFooter>soem</DialogFooter>
    </DialogContent>
  );
}
