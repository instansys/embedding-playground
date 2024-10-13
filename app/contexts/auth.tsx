import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { getAuth } from "@/lib/firebase";
import {
  AuthErrorCodes,
  type User as FirebaseUser,
  sendEmailVerification as _sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "@firebase/auth";
import { type ReactNode, createContext, useEffect, useState } from "react";

const EmailVerifyingScreen = ({ email }: { email: string }) => (
  <div className="flex min-h-screen flex-col items-stretch justify-center bg-neutral-10">
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-lg bg-white p-8 shadow">
        <h1 className="text-xl font-bold">Verifying Email Address</h1>
        <div className="mt-4">
          An email has been sent to {email}. Please click the link in the email
          to verify that you are the owner of this email address.
        </div>
        <div className="mt-8 text-right">
          <Button variant="outline" onClick={() => signOut(getAuth())}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export const AuthContext = createContext<{
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  // Used to determine if it's immediately after login when fetching the session
  isDoingLogin: boolean;
  setIsDoingLogin: (value: boolean) => void;
}>({
  firebaseUser: null,
  isLoading: false,
  isDoingLogin: false,
  setIsDoingLogin: () => {},
});

const sendEmailVerification = async (
  user: FirebaseUser,
  completed: () => void
) => {
  // onAuthStateChanged cannot detect changes in email_verified, so we have to manually reload the user
  const id = setInterval(async () => {
    await user.reload();
    if (user.emailVerified) {
      clearInterval(id);
      // The current idToken has email_verified:false, so we need to update it
      await user.getIdToken(true);
      completed();
    }
  }, 1000);
  try {
    await _sendEmailVerification(user);
    // biome-ignore lint/suspicious/noExplicitAny: migrate from eslint
  } catch (error: any) {
    if (error?.code === AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER) {
      // Error when trying to send a verification email when one has already been sent. We'll do nothing for now.
      return;
    }
    throw error;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [initializing, setInitializing] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isDoingLogin, setIsDoingLogin] = useState(false);

  const isLoading = initializing;

  useEffect(
    () => {
      onAuthStateChanged(getAuth(), (user) => {
        setInitializing(false);
        setFirebaseUser(user);
      });
    },
    // onAuthStateChanged(getAuth(), (user) => {
    //   // setInitializing(false);
    //   // setFirebaseUser(user);
    // }),
    []
  );

  useEffect(() => {
    if (isLoading) return;
    // Authenticated but email address is unverified
    // In this case, display the verification screen unconditionally
    if (
      firebaseUser &&
      !firebaseUser.emailVerified &&
      !isEmailVerifying &&
      location.pathname !== "/auth-action"
    ) {
      setIsEmailVerifying(true);
      sendEmailVerification(firebaseUser, () => {
        setIsEmailVerifying(false);
      });
      return;
    }
    // Authenticated
  }, [firebaseUser, isEmailVerifying, isLoading]);

  if (isEmailVerifying && firebaseUser?.email) {
    return <EmailVerifyingScreen email={firebaseUser.email} />;
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        isLoading,
        isDoingLogin,
        setIsDoingLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
