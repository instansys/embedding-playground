import { ImSpinner8 } from "react-icons/im";

export const Spinner = ({ size = 18 }: { size?: number }) => (
  <ImSpinner8 size={size} className="animate-spin" />
);
