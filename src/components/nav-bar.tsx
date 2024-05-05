import React from "react";
import Link from "next/link";

const NavBar: React.FC = () => {
  return (
    <nav className="p-4 text-2xl font-medium">
      <Link href={"/"} className="flex gap-2 hover:opacity-80 transition-all">
        <div>Dechert Innovation</div>
        <div className="opacity-50">Gen AI Expo</div>
      </Link>
    </nav>
  );
};

export default NavBar;
