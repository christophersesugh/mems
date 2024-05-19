import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
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

  if (password !== confirmPassword) {
    throw new Error("Password does not match");
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    throw new Error("User already exiat.");
  }

  const data = { name, email, unit, rank, passwordHash };

  try {
    await prisma.user.create({ data });
    return redirect(`/role?email=${email}`);
  } catch (error) {
    console.error(error);
    throw new Error("An error occured while creating user, please try again.");
  }
}

export default function Signin() {
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
                <Input id="name" name="name" placeholder="Name" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" placeholder="Eamil" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="rank">Unit</Label>
                <Select name="unit" required>
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
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="rank">Rank</Label>
                <Select name="rank" required>
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
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="consfirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
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
