/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ranks, units } from "~/constants/units";
import { prisma } from "~/utils/prisma.server";
import bcrypt from "bcryptjs";

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const rank = String(formData.get("rank"));
  const unit = String(formData.get("unit"));
  const password = String(formData.get("password"));
  const confirmPassword = String(formData.get("confirm-password"));

  const fData = {
    name,
    email,
    rank,
    unit,
    password,
    confirmPassword,
  };

  const signupSchema = z
    .object({
      name: z.string().min(4, {
        message: "Name must be atleast 4 characters.",
      }),
      email: z
        .string({
          required_error: "Email is required",
        })
        .email(),
      rank: z.string({
        required_error: "Rank is required",
      }),
      unit: z.string({
        required_error: "Unit is required",
      }),
      password: z.string().min(6, {
        message: "Password must be atleast 6 characters.",
      }),
      confirmPassword: z.string().min(6, {
        message: "Password must be atleast 6 characters.",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });

  const formError: { error: string | null } = {
    error: null,
  };

  const result = signupSchema.safeParse(fData);

  if (!result.success) {
    return { formError: null, fieldErrors: result.error.format() };
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    formError.error = "User with given password already exist.";
  }

  const data = { name, email, unit, rank, passwordHash };

  try {
    if (formError.error) {
      return { formError, fieldErrors: null };
    }
    await prisma.user.create({ data });
    return redirect(`/role?email=${email}`);
  } catch (error) {
    console.error(error);
    throw new Error("An error occured while creating user, please try again.");
  }
}

export default function Signin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formData?.get("intent") === "signup";

  return (
    <Container>
      <Form method="post">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              {/* Easily assign tasks to maintainers. */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Name" />
                {actionData?.fieldErrors?.name ? (
                  <p className="text-red-500">
                    {actionData.fieldErrors?.name?._errors[0]}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email: </Label>
                <Input id="email" name="email" placeholder="Eamil" />
                {actionData?.fieldErrors?.email ? (
                  <p className="text-red-500">
                    {actionData.fieldErrors?.email?._errors[0]}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="rank">Unit</Label>
                <Select name="unit">
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {actionData?.fieldErrors?.unit ? (
                  <p className="text-red-500">
                    {actionData.fieldErrors?.unit?._errors[0]}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="rank">Rank</Label>
                <Select name="rank">
                  <SelectTrigger id="rank">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {ranks.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {actionData?.fieldErrors?.rank ? (
                  <p className="text-red-500">
                    {actionData.fieldErrors?.rank?._errors[0]}
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

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="consfirm-password">Confirm password: </Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  placeholder="Confirm password"
                />
                {actionData?.fieldErrors?.confirmPassword ? (
                  <p className="text-red-500">
                    {actionData.fieldErrors?.confirmPassword?._errors[0]}
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
              value="signup"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Continue"}
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </Container>
  );
}
