import { Label } from "@radix-ui/react-label";
import {
	type DetailedHTMLProps,
	type InputHTMLAttributes,
	forwardRef,
} from "react";
import ErrorText from "./ErrorText";
import TextInput from "./TextInput";

export const PasswordField = forwardRef<
	HTMLInputElement,
	{
		id: string;
		label?: string;
		errorMessage?: string;
		showResetPassword?: boolean;
		onClickResetPassword?: () => void;
	} & Omit<
		DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
		"id" | "autoComplete" | "type"
	>
>(
	(
		{
			id = "password",
			label = "パスワード",
			errorMessage,
			showResetPassword,
			onClickResetPassword,
			...otherProps
		},
		ref,
	) => (
		<div>
			{showResetPassword ? (
				<div className="flex justify-between">
					<Label htmlFor={id}>{label}</Label>
					<button
						className="text-xs text-support-indigo-5 hover:underline dark:text-support-indigo-6 dark:hover:text-support-indigo-7"
						type="button"
						onClick={onClickResetPassword}
					>
						Forgot password?
					</button>
				</div>
			) : (
				<Label htmlFor={id}>{label}</Label>
			)}
			<div className="mt-1">
				<TextInput
					ref={ref}
					{...otherProps}
					id={id}
					type="password"
					autoComplete="password"
					error={!!errorMessage}
					hasDefaultBorder
				/>
			</div>
			{errorMessage && (
				<div className="mt-1">
					<ErrorText>{errorMessage}</ErrorText>
				</div>
			)}
		</div>
	),
);
