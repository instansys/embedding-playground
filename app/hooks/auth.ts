import { AuthContext } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { getAuth, signOut } from "firebase/auth";
import { useContext, useState } from "react";

export const useAuthContext = () => useContext(AuthContext);

export const useLogout = () => {
  const [isFinishedLogout, setIsFinishedLogout] = useState(false);
  const queryClient = useQueryClient();
  const logout = async () => {
    await signOut(getAuth());
    queryClient.clear();
    setIsFinishedLogout(true);
  };
  return { isFinishedLogout, logout };
};
