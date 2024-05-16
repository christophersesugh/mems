import { createCookieSessionStorage, redirect } from "@remix-run/node";

interface ICurrentUser {
  userId: string;
  name: string;
  email: string;
  rank: string;
}

export interface SessionData {
  currentUser: ICurrentUser;
}

export interface SessionFlashData {
  error: string;
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__mems",
      secrets: [process.env.SECRET!],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

async function getUserSession(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

async function signOut(request: Request) {
  try {
    throw redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(await getUserSession(request), {
          maxAge: 0,
        }),
      },
    });
  } catch (error) {
    throw new Error("An error occur while signing out, please try again.");
  }
}

async function requireUser(request: Request) {
  try {
    const session = await getUserSession(request);
    const user = session?.get("currentUser");
    const userId = user?.userId;
    if (!user || !userId) {
      await signOut(request);
    }
    return user as ICurrentUser;
  } catch (error) {
    throw new Error("An error occured while accessing user session.");
  }
}

async function getUser(request: Request): Promise<ICurrentUser> {
  try {
    const user = (await requireUser(request)) as ICurrentUser;
    return user;
  } catch (error) {
    throw new Error("An error occured while getting user.");
  }
}

export {
  getSession,
  commitSession,
  destroySession,
  getUser,
  signOut,
  getUserSession,
};
