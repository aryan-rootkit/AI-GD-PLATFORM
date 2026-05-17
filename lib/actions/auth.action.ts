"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import {
  createLocalUser,
  DEMO_USER_ID,
  ensureDemoUser,
  localAuth,
  verifyLocalUser,
} from "@/lib/local-admin";
import { isLocalDev, shouldSkipAuth } from "@/lib/local-dev";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUpLocal(params: {
  name: string;
  email: string;
  password: string;
}) {
  const result = createLocalUser(params);
  if (!result.success) {
    return { success: false, message: result.message };
  }

  const { uid, name, email } = params;
  try {
    await db.collection("users").doc(uid).set({ name, email });
    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error) {
    console.error("Error creating local user profile:", error);
    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signInLocal(params: SignInParams) {
  const { email, password } = params;

  if (!password) {
    return {
      success: false,
      message: "Password is required.",
    };
  }

  const verified = verifyLocalUser(email, password);
  if (!verified) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  try {
    const token = localAuth.createSessionToken(verified.uid);
    await setSessionCookie(token);
    return { success: true };
  } catch {
    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    const firebaseError = error as { code?: string };
    if (firebaseError.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    if (isLocalDev()) {
      await setSessionCookie(idToken);
      return { success: true };
    }

    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
    return { success: true };
  } catch (error: unknown) {
    console.log(error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/** Auto sign-in demo user when SKIP_AUTH / local dev (no Firebase). */
export async function ensureAuthSession() {
  if (!shouldSkipAuth()) return;

  const cookieStore = await cookies();
  if (cookieStore.get("session")?.value) return;

  ensureDemoUser();
  const token = localAuth.createSessionToken(DEMO_USER_ID);
  await setSessionCookie(token);
}

export async function getCurrentUser(): Promise<User | null> {
  if (shouldSkipAuth()) {
    await ensureAuthSession();
  }

  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
