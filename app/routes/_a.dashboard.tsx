import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { FaEdit } from "react-icons/fa";
import { ImSpinner6 } from "react-icons/im";
import { BiCommentAdd } from "react-icons/bi";
import { FaRegEye, FaRegTrashCan, FaSpinner } from "react-icons/fa6";
import { Container } from "~/components/container";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { getUser } from "./sessions";
import { prisma } from "~/utils/prisma.server";
import { format } from "date-fns";
import React from "react";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/shadcn";

export async function loader({ request }: LoaderFunctionArgs) {
  const currentUser = await getUser(request);
  const { userId, unit, role } = currentUser;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(role === "ADMIN"
          ? { assigner: { some: { userId: userId } } }
          : { assignees: { some: { userId: userId } } }),
        unit,
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
      },
    });

    return json({ tasks, currentUser });
  } catch (error) {
    throw new Error("Error fetching tasks.");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const taskId = String(formData.get("taskId"));
  const intent = String(formData.get("intent"));
  const userId = String(formData.get("userId"));
  const comment = String(formData.get("comment"));
  const status = String(formData.get("status"));

  try {
    if (intent === "delete") {
      await prisma.task.delete({
        where: {
          id: taskId,
          assigner: {
            some: {
              userId: userId,
            },
          },
        },
      });
    }

    if (intent === "comment") {
      await prisma.comment.create({
        data: {
          comment,
          user: {
            connect: {
              id: userId,
            },
          },
          task: {
            connect: {
              id: taskId,
            },
          },
        },
      });
    }

    if (intent === "status") {
      await prisma.task.update({
        where: {
          id: taskId,
          assigner: {
            some: {
              userId: userId,
            },
          },
        },
        data: {
          status,
        },
      });
    }
    return null;
  } catch (error) {
    console.error(error);
    throw new Error("Server error occured. Please try again.");
  }
}

export default function Dashboard() {
  const { tasks, currentUser } = useLoaderData<typeof loader>();
  const [addComment, setAddCommend] = React.useState(false);
  const [status, setState] = React.useState("");

  const fetcher = useFetcher();

  const userRole = currentUser.role === "USER";
  const navigation = useNavigation();

  const isDeleting = navigation.formData?.get("intent") === "delete";
  const isCommenting = fetcher.formData?.get("intent") === "comment";
  const isUpdating = fetcher.formData?.get("intent") === "status";

  return (
    <Container>
      <PageTitle title="Dashboard" />
      <h2 className="mt-8 mb-4 text-lg">
        {tasks.length} {tasks.length > 1 ? "Tasks" : "Task"}
      </h2>
      <ul className="space-y-4">
        {tasks?.length ? (
          tasks.map((task) => (
            <Dialog key={task.id}>
              <li
                key={task.id}
                className="drop-shadow-md rounded-md bg-zinc-200 px-4 py-2 flex flex-wrap justify-between items-center"
              >
                <span className="text-xl">{task.title}</span>
                <div className="flex flex-wrap gap-6 items-center">
                  <DialogTrigger>
                    <FaRegEye size={20} className="text-blue-600" />
                  </DialogTrigger>
                  <Button variant="link" disabled={userRole}>
                    <Link to={`/edit-task/${task.id}`}>
                      <FaEdit size={20} className="text-sky-600" />
                    </Link>
                  </Button>
                  <Form method="post">
                    <input type="hidden" name="taskId" value={task.id} />
                    <input
                      type="hidden"
                      name="userId"
                      value={currentUser.userId}
                    />
                    <Button
                      variant="link"
                      name="intent"
                      value="delete"
                      disabled={userRole || isDeleting}
                    >
                      {isDeleting ? (
                        <ImSpinner6 size={20} className="animate-spin" />
                      ) : (
                        <FaRegTrashCan size={20} className="text-red-600" />
                      )}
                    </Button>
                  </Form>
                </div>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{task.title}</DialogTitle>
                    <DialogDescription className="text-lg text-left">
                      {task.description}
                    </DialogDescription>
                  </DialogHeader>
                  <Separator />
                  <div className="flex justify-around flex-wrap">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h2 className="text-slate-500 text-xs">Assigner:</h2>
                        <ul>
                          {task.assigner.map((assigner) => (
                            <li key={assigner.id} className="text-xs">
                              {assigner.user.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h2 className="text-slate-500 text-xs">
                          Date created:
                        </h2>
                        <p className="text-xs">
                          {format(task.createdAt, "do MMMM, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <h2 className="text-slate-500 text-xs">Asignees:</h2>
                        <ul>
                          {task.assignees.map((assignee) => (
                            <li key={assignee.id} className="text-xs">
                              {assignee.user.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h2 className="text-slate-500 text-xs">
                          Recurring date:
                        </h2>
                        <p className="text-xs">
                          {format(task.date, "do")} of every month.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <fetcher.Form method="post">
                    <div className="flex justify-between items-start flex-wrap">
                      <Button
                        type="button"
                        onClick={() => {
                          setAddCommend(!addComment);
                        }}
                      >
                        <BiCommentAdd className="mr-2" size={15} /> Add comment
                      </Button>

                      <div className="flex flex-col w-[150px]">
                        <Select
                          name="status"
                          value={status}
                          onValueChange={(status) => {
                            setState(status);
                            if (task && currentUser) {
                              fetcher.submit(
                                {
                                  intent: "status",
                                  taskId: task.id,
                                  userId: currentUser.userId,
                                  status,
                                },
                                {
                                  method: "post",
                                }
                              );
                            }
                          }}
                        >
                          <SelectTrigger
                            id="status"
                            className="max-w-[150px]"
                            name="status"
                            value={status}
                            type="submit"
                          >
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {["TODO", "INPROGRESS", "DONE"].map(
                              (status: string) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs mt-2">
                          Status:{" "}
                          <span
                            className={cn(
                              "rounded-md p-1",
                              task.status === "TODO"
                                ? "bg-red-200"
                                : task.status === "INPROGRESS"
                                ? "bg-yellow-200"
                                : "bg-blue-200"
                            )}
                          >
                            {isUpdating ? "Updating..." : task.status}
                          </span>
                        </p>
                      </div>
                      {/* <Select /> */}
                    </div>
                    {addComment ? (
                      <>
                        <input
                          type="hidden"
                          name="userId"
                          value={currentUser.userId}
                        />
                        <input type="hidden" name="taskId" value={task.id} />
                        <Textarea
                          name="comment"
                          id="comment"
                          placeholder="Add comment"
                          rows={5}
                          className="mt-4"
                        />
                        <Button
                          name="intent"
                          size="sm"
                          value="comment"
                          // type="submit"
                          className="mt-2"
                          disabled={isCommenting}
                        >
                          {isCommenting ? (
                            <FaSpinner size={15} className="animate-spin" />
                          ) : (
                            "comment"
                          )}
                        </Button>
                      </>
                    ) : null}
                  </fetcher.Form>

                  <ul className="space-y-1.5">
                    {task.comments?.length
                      ? task?.comments.map((comment, i) => (
                          <>
                            <li key={comment.id}>
                              <div>
                                <h2 className="text-slate-500 text-xs">
                                  {comment.user.name}
                                </h2>
                                <p className="text-xs">{comment.comment}</p>
                              </div>
                            </li>
                            {i < task.comments.length - 1 ? (
                              <Separator />
                            ) : null}
                          </>
                        ))
                      : null}
                  </ul>
                </DialogContent>
              </li>
            </Dialog>
          ))
        ) : (
          <p className="text-center text-xl mt-12">
            {userRole
              ? "You have no assigned task(s) at the moment"
              : "You have not assigned any task(s) to any maintainer."}
          </p>
        )}
      </ul>
    </Container>
  );
}
