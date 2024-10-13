import { useEffect, useRef, useState } from "react";
import { MdMenuOpen } from "react-icons/md";

export type SideMenuSide = "left" | "right";

type SideMenuProps = {
  children: React.ReactNode;
  side: SideMenuSide;
  bgColor?: string;
  width?: number | string;
  openAreaWidth?: number;
};

export const SideMenu = ({
  children,
  side,
  bgColor = "white",
  width = "20rem",
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
      <MdMenuOpen
        size="3rem"
        className={`fixed top-1/2 -translate-y-1/2 cursor-pointer 
          transition-all duration-300
          ${isOpen ? "opacity-0" : "opacity-100"}
          ${side === "left" ? "left-4" : "right-4"}`}
      />
      <div className="p-4" style={{ width }}>
        {children}
      </div>
    </div>
  );
};
