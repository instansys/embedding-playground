import type { ReactNode } from "react";

const ErrorText = ({ children }: { children: ReactNode }) => (
	<div className="text-xs text-support-red-7">{children}</div>
);

export default ErrorText;
