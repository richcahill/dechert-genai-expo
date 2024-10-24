import React from "react";
import Link from "next/link";

interface NavBarProps {
  number?: number;
}

const NavBar = ({ number }: NavBarProps) => {
  return (
    <nav className="pt-8 p-4 pb-0 text-2xl font-medium text-white">
      <Link href={"/"} className="flex gap-2 hover:opacity-80 transition-all">
        <div>Dechert AI Expo</div>
        <div className="opacity-50">Experiential Station #{number}</div>
      </Link>
    </nav>
  );
};

export default NavBar;
