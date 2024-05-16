import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  //   CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { prisma } from "~/utils/prisma.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") as string;
  return json(email);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const role = String(formData.get("role"));

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        role,
      },
    });
    return redirect("/dashboard");
  } catch (error) {
    throw new Error("An error occured while creating user, please try again.");
  }
}

export default function Role() {
  const email = useLoaderData<typeof loader>();
  return (
    <Container>
      <Form method="post">
        <input type="hidden" name="email" value={email} />
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Who are you?</CardTitle>
            {/* <CardDescription>Generate magic link</CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-8">
              <div className="flex flex-col space-y-1.5">
                <Button
                  name="role"
                  value="ADMIN"
                  variant="outline"
                  className="text-lg capitalize"
                >
                  Admin
                </Button>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Button
                  name="role"
                  value="USER"
                  variant="outline"
                  className="text-lg capitalize"
                >
                  Maintainer
                </Button>
              </div>
            </div>
          </CardContent>
          {/* <CardFooter className="flex justify-between">
            <Button type="submit">Submit</Button>
          </CardFooter> */}
        </Card>
      </Form>
    </Container>
  );
}
