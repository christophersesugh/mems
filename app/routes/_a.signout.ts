import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getUserSession } from "./sessions";

export async function action({ request }: ActionFunctionArgs) {
  try {
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(await getUserSession(request), {
          maxAge: 0,
        }),
      },
    });
  } catch (error) {
    throw new Error(
      "An error occured while signing out, please try refreshing the page."
    );
  }
}
