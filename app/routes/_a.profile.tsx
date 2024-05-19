import { Form, useNavigation } from "@remix-run/react";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
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
import { ICurrentUser, getUser } from "./sessions";
import { PageTitle } from "~/components/page-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { units } from "~/constants/units";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getUser(request);
    return user as ICurrentUser;
  } catch (error) {
    throw new Error("Error fetching user.");
  }
}

export default function ProfileRoute() {
  const user = useLoaderData() as ICurrentUser;
  console.log(user);

  const navigation = useNavigation();
  const isSubmitting = navigation.formData?.get("intent") === "update";

  return (
    <Container className="max-w-lg">
      <PageTitle title="Profile" />
      <Form method="post" className="mt-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              {/* Easily assign tasks to maintainers. */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-8">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Name"
                  value={user.name}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Eamil"
                  value={user.email}
                  readOnly
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="unit">Unit</Label>
                <Select name="unit">
                  <SelectTrigger id="unit">
                    <SelectValue placeholder={user.unit} />
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
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  placeholder="Role"
                  value={user.role}
                  readOnly
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="submit"
              name="intent"
              value="update"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </Container>
  );
}
