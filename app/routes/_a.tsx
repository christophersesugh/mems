import { LoaderFunctionArgs } from "@remix-run/node";
import { AuthAppLayout } from "~/components/layouts";
import { getUser } from "./sessions";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getUser(request);
    return user;
  } catch (error) {
    throw new Error("Unauthorized.");
  }
}

export default function AuthApp() {
  const user = useLoaderData();
  return <AuthAppLayout user={user} />;
}
