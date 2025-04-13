'use client';

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cx } from "../lib/cx";
import Link from "next/link";
import Image from "next/image";
import { SignOut } from "./SignOut";

export const TopNavBar = () => {
  const { data: session } = useSession(); // Verifica o estado da sessão
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <header
      aria-label="Site Header"
      className={cx(
        "flex h-[var(--top-nav-bar-height)] bg-primary items-center px-3 lg:px-12",
        isHomePage
      )}
    >
      <div className="flex h-10 w-full items-center justify-between">
        <Link href="/">
          <div className="flex items-center justify-center gap-1">
            <Image
              src={"assets/logoazul.svg"}
              width={16}
              height={16}
              alt="logo"
              className="h-8 w-full"
              priority
            />
          </div>
        </Link>

        <nav
          aria-label="Site Nav Bar"
          className="flex text-primary items-center gap-2 text-sm font-medium"
        >
          {[
            ["/resume-builder", "Criar"],
          ].map(([href, text]) => (
            <Link
              key={text}
              className="rounded-md px-1.5 py-2 text-white hover:bg-primary focus-visible:bg-gray-100 lg:px-4"
              href={href}
            >
              {text}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};