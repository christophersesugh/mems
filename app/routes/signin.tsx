import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/utils/prisma.server";
import { commitSession, getUserSession } from "./sessions";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const fData = {
    email,
    password,
  };

  const signinSchema = z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email(),

    password: z.string().min(6, {
      message: "Password must be atleast 6 characters.",
    }),
  });

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      rank: true,
      unit: true,
      role: true,
      passwordHash: true,
    },
  });

  const formError: { error: string | null } = {
    error: null,
  };

  const result = signinSchema.safeParse(fData);

  if (!result.success) {
    return { formError: null, fieldErrors: result.error.format() };
  }

  if (!user) {
    formError.error = "Invalid credentials.";
  }

  const correctPassword = bcrypt.compareSync(password, user!.passwordHash);
  if (!correctPassword) {
    formError.error = "Invalid credentials.";
  }

  if (formError.error) {
    return { formError, fieldErrors: null };
  }

  const session = await getUserSession(request);
  session.set("currentUser", { userId: user.id, ...user });

  const commitSessionOptions = {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      }),
    },
  };

  return redirect("/equipments", commitSessionOptions);
}

export default function Signin() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const isSubmitting = navigation.formData?.get("intent") === "signin";
  return (
    <Container>
      <Form method="post">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            {/* <CardDescription>Generate magic link</CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-8">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" placeholder="Eamil" />
                {actionData?.fieldErrors?.email ? (
                  <p className="text-red-500">
                    {actionData.fieldErrors?.email?._errors[0]}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" placeholder="Password" />
                {actionData?.fieldErrors?.password ? (
                  <p className="text-red-500">
                    {actionData.fieldErrors?.password?._errors[0]}
                  </p>
                ) : null}
              </div>
            </div>
            {actionData?.formError?.error ? (
              <p className="text-red-500 mt-4">
                {actionData?.formError?.error}
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="submit"
              name="intent"
              value="signin"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </Container>
  );
}
