import {
	type DetailedHTMLProps,
	type InputHTMLAttributes,
	forwardRef,
	useMemo,
} from "react";

type FontSizeClass =
	| "text-xs"
	| "text-sm"
	| "text-base"
	| "text-lg"
	| "text-xl"
	| "text-2xl"
	| "text-3xl"
	| "text-4xl"
	| "text-5xl"
	| "text-6xl"
	| "text-7xl"
	| "text-8xl"
	| "text-9xl";

type TextInputProps = Omit<
	DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
	"className"
> & {
	error?: boolean;
	hasDefaultBorder?: boolean;
	textSizeClass?: FontSizeClass;
};

// Styled input
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
	({ hasDefaultBorder, error, textSizeClass, ...otherProps }, ref) => {
		const borerClass = useMemo(() => {
			if (error) {
				return "border border-support-red-7";
			}
			if (hasDefaultBorder) {
				return "border border-neutral-9 hover:border-neutral-8 dark:hover:border-neutral-4 dark:border-neutral-3";
			}
			return "border border-transparent hover:border-neutral-8 dark:hover:border-neutral-4";
		}, [error, hasDefaultBorder]);
		return (
			<input
				ref={ref}
				{...otherProps}
				className={`block w-full appearance-none rounded ${borerClass} ${
					textSizeClass ?? ""
				} px-2 py-1.5 placeholder:text-neutral-5/90 dark:bg-inherit dark:placeholder:text-neutral-6/90`}
			/>
		);
	},
);

export default TextInput;
