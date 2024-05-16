import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
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
import { prisma } from "~/utils/prisma.server";

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const rank = String(formData.get("rank"));
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        rank,
      },
    });
    return redirect(`/role?email=${email}`);
  } catch (error) {
    console.error(error);

    throw new Error("An error occured while creating user, please try again.");
  }
}

export default function Signin() {
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
            <div className="grid w-full items-center gap-8">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" placeholder="Eamil" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="rank">Rank</Label>
                <Select name="rank">
                  <SelectTrigger id="rank">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="colonel">Colonel</SelectItem>
                    <SelectItem value="l-colonel">L. Colonel</SelectItem>
                    <SelectItem value="sergent">Sergent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit">Continue</Button>
          </CardFooter>
        </Card>
      </Form>
    </Container>
  );
}
