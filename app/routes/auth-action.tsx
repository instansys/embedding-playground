import { PasswordField } from "@/components/PasswordField";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useAuthContext, useLogout } from "@/hooks/auth";
import {
  AuthErrorCodes,
  applyActionCode,
  confirmPasswordReset,
  getAuth,
  verifyPasswordResetCode,
} from "@firebase/auth";
import { FirebaseError } from "@firebase/util";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@remix-run/react";
import { memo, useEffect, useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LogoImg from "../../public/image/logo.svg";

const schema = z.object({
  password: z.string().min(8),
});
type ChangePasswordForm = z.infer<typeof schema>;

// https://firebase.google.com/docs/auth/custom-email-handler?hl=en
const actionModes = ["resetPassword", "recoverEmail", "verifyEmail"] as const;
type ActionMode = (typeof actionModes)[number];

const HandleVerifyEmail = memo(({ actionCode }: { actionCode: string }) => {
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { firebaseUser, isLoading } = useAuthContext();
  useEffect(() => {
    // When verifying email in the same browser as new registration, applyActionCode is called before user information is retrieved, resulting in a 400 error. Therefore, isLoading check is necessary.
    if (completed || isLoading) return;
    setCompleted(true);
    (async () => {
      const auth = getAuth();
      try {
        await applyActionCode(auth, actionCode);
        // biome-ignore lint/suspicious/noExplicitAny: migrate from eslint
      } catch (error: any) {
        if (completed) return;
        setFailed(true);
        if (error instanceof FirebaseError) {
          if (error.code === AuthErrorCodes.INVALID_OOB_CODE) {
            alert("Invalid link");
            return;
          }
          if (error.code === AuthErrorCodes.EXPIRED_OOB_CODE) {
            alert("The link has expired");
            return;
          }
        }

        alert("An error occurred. Please try again later.");
        // For other errors, send to Sentry for now
        console.error(error);
      }
    })();
  }, [actionCode, completed, isLoading]);

  // onAuthStateChanged cannot detect changes in email_verified, so when completed becomes true, reload periodically and redirect when email_verified becomes true
  useEffect(() => {
    if (!completed) return () => {};
    const id = setInterval(async () => {
      await firebaseUser?.reload();
      if (firebaseUser?.emailVerified) {
        clearInterval(id);
        if (firebaseUser) {
          window.location.href = "/";
        }
      }
    }, 3000);
    return () => clearInterval(id);
  }, [completed, firebaseUser]);

  if (failed) {
    return (
      <div>
        <h1 className="text-lg font-bold">An error occurred</h1>
        <div className="mt-8">
          <Link to="/editor-introduction">Return to top page</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {completed ? (
        <>
          <h1 className="text-lg font-bold">Email verification completed</h1>
          {firebaseUser ? (
            <div className="mt-8">
              You will be automatically redirected to the user registration page
              shortly.
            </div>
          ) : (
            <div className="mt-8">
              You can now log in with your registered email address.
              <br />
              Please return to the{" "}
              <Link to="/editor-introduction">top page</Link>
              and log in.
            </div>
          )}
        </>
      ) : (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
});

const HandleRecoverEmail = () => (
  <div>
    <h1 className="text-lg font-bold">Not supported</h1>
    <div className="mt-8">
      <Link to="/editor-introduction">Return to top page</Link>
    </div>
  </div>
);

const HandleResetPassword = ({ actionCode }: { actionCode: string }) => {
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(schema) });

  const [completed, setCompleted] = useState(false);
  const { logout } = useLogout();

  // Check the validity of actionCode on display
  useLayoutEffect(() => {
    (async () => {
      if (completed) return;

      // Log out first as there's a pattern of changing password while logged in
      await logout();

      const auth = getAuth();
      try {
        await verifyPasswordResetCode(auth, actionCode);
      } catch (error) {
        setFailed(true);
        if (error instanceof FirebaseError) {
          if (error.code === AuthErrorCodes.EXPIRED_OOB_CODE) {
            alert("The link has expired");
            return;
          }
          if (error.code === AuthErrorCodes.INVALID_OOB_CODE) {
            alert("Invalid link");
            return;
          }
        }

        alert("An error occurred. Please try again later.");
        console.error(error);
      }
    })();
  }, [actionCode, completed, logout]);

  if (failed) {
    return (
      <div>
        <h1 className="text-lg font-bold">An error occurred</h1>
        <div className="mt-8">
          <Link to="/editor-introduction">Return to top page</Link>
        </div>
      </div>
    );
  }

  return completed ? (
    <div>
      <h1 className="text-lg font-bold">Password change completed</h1>
      <div className="mt-8">
        Please return to the <Link to="/editor-introduction">top page</Link>
        and log in.
      </div>
    </div>
  ) : (
    <form
      onSubmit={handleSubmit(async ({ password }) => {
        const auth = getAuth();
        try {
          await confirmPasswordReset(auth, actionCode, password);
        } catch (error) {
          if (error instanceof FirebaseError) {
            if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
              setError("password", { message: "Password is too weak" });
              return;
            }
          }

          alert("An error occurred. Please try again later.");
          console.error(error);
          return;
        }
        setCompleted(true);
      })}
    >
      <h1 className="text-lg font-bold">Change Password</h1>
      <div className="mt-8">
        <PasswordField
          id="new-password"
          label="New Password"
          {...register("password")}
          errorMessage={errors.password?.message}
        />
      </div>
      <div className="mt-8 flex justify-end">
        <Button type="submit">Change Password</Button>
      </div>
    </form>
  );
};

const NewPasswordPage = () => {
  const [actionCode, setActionCode] = useState("");

  const [actionMode, setActionMode] = useState<ActionMode | null>(null);

  // Only on initial rendering
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const oobCodeQueryValue = queryParams.get("oobCode") || "";
    const modeQueryValue = queryParams.get("mode") || "";

    if (actionModes.every((m) => modeQueryValue !== m) || !oobCodeQueryValue) {
      alert("Invalid link");
      return;
    }
    setActionCode(oobCodeQueryValue);
    setActionMode(modeQueryValue as ActionMode);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-stretch justify-center bg-neutral-10">
      <div className="absolute left-4 top-4">
        <img src={LogoImg} alt="NoveLand" width={143} height={28} />
      </div>
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg bg-white p-8 shadow">
          {/* Email ownership verification */}
          {actionMode === "verifyEmail" && (
            <HandleVerifyEmail actionCode={actionCode} />
          )}
          {/* Cancel email change */}
          {actionMode === "recoverEmail" && <HandleRecoverEmail />}
          {/* Password change */}
          {actionMode === "resetPassword" && (
            <HandleResetPassword actionCode={actionCode} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPasswordPage;
