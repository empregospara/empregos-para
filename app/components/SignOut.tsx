'use client'

import { AvatarFallback, Avatar } from "@radix-ui/react-avatar";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

type Props = {
  user?: Session['user'];  // Permite que user seja undefined
}

export function SignOut({ user }: Props) {
  if (!user) {
    return <div>Usuário não autenticado</div>;  // Renderiza algo quando o usuário não está logado
  }

  return (
    <main>
      <div>
        <Avatar>
          <AvatarFallback>{user.image}</AvatarFallback>
        </Avatar>
        <span>{user.image}</span>

        <Button variant="outline" className="text-white" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    </main>
  );
}