import { FormContext } from "@/contexts/form";
import { useAuthContext } from "@/hooks/auth";
import { useHistories } from "@/hooks/history";
import { cn } from "@/lib/utils";
import { useContext, useMemo, useState } from "react";
import { AuthModal } from "./AuthModal";
import { SideMenu, SideMenuSide } from "./ui/sidemenu";

const MenuItem = ({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <div
      className={cn("p-2 rounded-md", !disabled && "hover:bg-gray-100")}
      onClick={onClick}
      onKeyDown={onClick}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  );
};

export default function HistorySideMenu({ side }: { side: SideMenuSide }) {
  const { firebaseUser } = useAuthContext();
  const histories = useHistories();
  const formMethods = useContext(FormContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const content = useMemo(() => {
    if (!histories || !formMethods) return null;

    return (
      <>
        <AuthModal
          open={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onClickResetPassword={() => {}}
        />
        <ul>
          {firebaseUser ? (
            <MenuItem disabled>Logged in as {firebaseUser.email}</MenuItem>
          ) : (
            <MenuItem onClick={() => setIsAuthModalOpen(true)}>
              Login {JSON.stringify(firebaseUser)}
            </MenuItem>
          )}
          <MenuItem disabled>
            <b>History</b>
          </MenuItem>
          {histories.map((history) => (
            <MenuItem
              key={history.id}
              onClick={() => formMethods.reset(history)}
            >
              {history.leftText.slice(0, 10)}
              {history.rightText.slice(0, 10)}
            </MenuItem>
          ))}
        </ul>
      </>
    );
  }, [histories, formMethods, isAuthModalOpen, firebaseUser]);
  return <SideMenu side={side}>{content}</SideMenu>;
}
