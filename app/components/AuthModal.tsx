import ErrorText from "@/components/ErrorText";
import { PasswordField } from "@/components/PasswordField";
import TextInput from "@/components/TextInput";
import { useAuthContext } from "@/hooks/auth";
import { getAuth } from "@/lib/firebase";
import {
  type AuthErrorCodes,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "@firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TextField from "./TextField";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

// const Divider = ({ isSignIn }: { isSignIn: boolean }) => (
//   <div className="relative">
//     <div className="absolute inset-0 flex items-center">
//       <div className="w-full border-t border-gray-300" />
//     </div>
//     <div className="relative flex justify-center text-sm">
//       <span className="bg-white px-2 text-gray-500">
//         Or sign {isSignIn ? "in" : "up"} with
//       </span>
//     </div>
//   </div>
// );

const SocialButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex w-full justify-center rounded-md border border-neutral-9 bg-white px-4 py-2 text-sm text-neutral-4 shadow-sm hover:bg-neutral-10"
  >
    {children}
  </button>
);

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type AuthForm = z.infer<typeof schema>;

export const AuthModal = ({
  open,
  onClose,
  onClickResetPassword,
}: {
  open: boolean;
  onClose: () => void;
  onClickResetPassword: () => void;
}) => {
  const [isSignIn, setIsSignIn] = useState(false);
  const { setIsDoingLogin } = useAuthContext();

  const onSubmitLogin = useCallback(
    async (
      email: string,
      password: string,
      handleFirebaseError: (error: {
        code: (typeof AuthErrorCodes)[keyof typeof AuthErrorCodes];
      }) => void
    ) => {
      try {
        setIsDoingLogin(true);
        return await signInWithEmailAndPassword(getAuth(), email, password);
        // biome-ignore lint/suspicious/noExplicitAny: migrate from eslint
      } catch (err: any) {
        setIsDoingLogin(false);
        handleFirebaseError(err);
        return null;
      }
    },
    [setIsDoingLogin]
  );

  const onSubmitSignup = useCallback(
    async (
      email: string,
      password: string,
      handleFirebaseError: (error: {
        code: (typeof AuthErrorCodes)[keyof typeof AuthErrorCodes];
      }) => void
    ) => {
      try {
        return await createUserWithEmailAndPassword(getAuth(), email, password);
        // biome-ignore lint/suspicious/noExplicitAny: migrate from eslint
      } catch (error: any) {
        handleFirebaseError(error);
        return null;
      }
    },
    []
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AuthForm>({ resolver: zodResolver(schema) });

  const handleFirebaseError = useCallback(
    (error: { code: (typeof AuthErrorCodes)[keyof typeof AuthErrorCodes] }) => {
      switch (error?.code) {
        case "auth/email-already-in-use": {
          setError("email", {
            message: "This email address already exists",
          });
          break;
        }
        case "auth/user-not-found": {
          // Ignore to set error for non-field
          // @ts-ignore
          setError("firebase", {
            message: "Incorrect email address or password.",
          });
          setError("email", { message: "" });
          setError("password", { message: "" });
          break;
        }
        case "auth/wrong-password": {
          // Ignore to set error for non-field
          // @ts-ignore
          setError("firebase", {
            type: "custom",
            message:
              "The email address or password is incorrect, or the password is not registered.",
          });
          setError("email", { message: "" });
          setError("password", { message: "" });
          break;
        }
        case "auth/too-many-requests": {
          // @ts-ignore
          setError("firebase", {
            type: "custom",
            message:
              "Login failed for the specified number of times. Please reset your password or try again after some time.",
          });
          setError("email", { message: "" });
          setError("password", { message: "" });
          break;
        }
        default: {
          console.error(error);
          break;
        }
      }
    },
    [setError]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
        <DialogTitle className="text-center font-bold tracking-tight text-gray-900">
          <div className="flex justify-center">
            <div className="flex space-x-2 rounded-full border-2 border-neutral-10 bg-neutral-10">
              <button
                type="button"
                className={`${
                  isSignIn
                    ? "text-neutral-1/50 hover:bg-neutral-9"
                    : "bg-primary-5 font-bold text-black"
                } rounded-full px-3 py-0.5`}
                onClick={() => setIsSignIn(false)}
                disabled={!isSignIn}
              >
                Sign up
              </button>
              <button
                type="button"
                className={`${
                  isSignIn
                    ? "bg-primary-5 font-bold"
                    : "text-neutral-1/50 hover:bg-neutral-9"
                } rounded-full px-3 py-0.5`}
                onClick={() => setIsSignIn(true)}
                disabled={isSignIn}
              >
                Login
              </button>
            </div>
          </div>
        </DialogTitle>

        <form
          className="mt-6 space-y-6"
          onSubmit={handleSubmit(async ({ email, password }) => {
            if (isSignIn) {
              await onSubmitLogin(email, password, handleFirebaseError);
            } else {
              await onSubmitSignup(email, password, handleFirebaseError);
            }
          })}
          noValidate
        >
          <div>
            <ErrorText>
              {
                (errors as { firebase?: { message?: string } })?.firebase
                  ?.message
              }
            </ErrorText>
          </div>
          <TextField
            id="email"
            label="Email"
            {...register("email", { required: true })}
            type="email"
            autoComplete="email"
            errorMessage={errors.email?.message}
            hasDefaultBorder
          />
          <PasswordField
            id="password"
            {...register("password", { required: true })}
            errorMessage={errors.password?.message}
            showResetPassword={isSignIn}
            onClickResetPassword={onClickResetPassword}
          />

          <div className="flex justify-center">
            <Button type="submit" className="px-4">
              {isSignIn ? "Login" : "Sign up"}
            </Button>
          </div>
        </form>

        {/* TODO: Add social login */}
      </DialogContent>
    </Dialog>
  );
};
