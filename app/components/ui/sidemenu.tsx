import { useEffect, useRef, useState } from "react";
import { RiMenuUnfoldLine } from "react-icons/ri";

type SideMenuProps = {
  children: React.ReactNode;
  side: "left" | "right";
  bgColor?: string;
  openAreaWidth?: number;
};

export const SideMenu = ({
  children,
  side,
  bgColor = "white",
  openAreaWidth = 100,
}: SideMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // マウスの位置によって開閉する
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      const isMouseOnMenu =
        (isOpen && ref.current === e.target) ||
        ref.current?.contains(e.target as Node);
      if (isMouseOnMenu) {
        return;
      }
      if (side === "left") {
        setIsOpen(e.clientX < openAreaWidth);
      } else {
        setIsOpen(window.innerWidth - e.clientX < openAreaWidth);
      }
    };
    document.addEventListener("mousemove", listener);
    return () => document.removeEventListener("mousemove", listener);
  }, []);

  return (
    <div
      ref={ref}
      className={`fixed z-10 top-0 h-screen bg-${bgColor} shadow-lg transition-all duration-300 ${
        side === "left"
          ? isOpen
            ? "left-0"
            : "-left-full"
          : isOpen
          ? "right-0"
          : "-right-full"
      }`}
    >
      <div className="w-64 p-4">{children}</div>
    </div>
  );
};
