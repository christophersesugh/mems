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
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export async function loader({ request }: LoaderFunctionArgs) {
  const currentUser = await getUser(request);
  const { userId, unit, role } = currentUser;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(role === "ADMIN"
          ? { assigner: { userId: userId } }
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
        equipment: true,
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
            userId,
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
            userId,
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

export default function Tasks() {
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
      <PageTitle title="Tasks" />
      <h2 className="mt-8 mb-4 text-lg">
        {tasks.length} {tasks.length > 1 ? "Tasks" : "Task"}
      </h2>
      <Separator orientation="vertical" />
      <Button>
        <Link to="/add-task">Add Task</Link>
      </Button>
      {tasks?.length ? (
        tasks.map((task) => (
          <div key={task.id}>
            <h1>{task.title}</h1>
            <p>{task.description}</p>
            <Link to={`/edit-task/${task.id}`}>Edit</Link>
          </div>
        ))
      ) : (
        <p>No tasks</p>
      )}
    </Container>
  );
}
