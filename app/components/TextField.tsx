import ErrorText from "@/components/ErrorText";
import TextInput from "@/components/TextInput";
import { Label } from "@radix-ui/react-label";
import { type ComponentProps, forwardRef } from "react";

type TextFieldProps = {
	label?: string;
	errorMessage?: string;
} & Omit<ComponentProps<typeof TextInput>, "error">;

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
	({ id, label, errorMessage, ...otherProps }: TextFieldProps, ref) => (
		<div>
			{label && <Label htmlFor={id}>{label}</Label>}
			<div className="mt-1">
				<TextInput ref={ref} {...otherProps} id={id} error={!!errorMessage} />
			</div>
			{errorMessage && (
				<div className="mt-1 font-normal">
					<ErrorText>{errorMessage}</ErrorText>
				</div>
			)}
		</div>
	),
);

export default TextField;
