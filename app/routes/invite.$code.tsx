import { redirect } from "react-router";
import type { Route } from "./+types/invite.$code";
import { getInviteByCode } from "~/lib/auth.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    return redirect("/login?error=invalid_invite");
  }

  const invite = await getInviteByCode(code);

  if (!invite || !invite.isActive) {
    return redirect("/login?error=invalid_invite");
  }

  if (invite.maxUses !== null && (invite.useCount ?? 0) >= invite.maxUses) {
    return redirect("/login?error=invite_exhausted");
  }

  return redirect(`/register?code=${code}`);
}

export default function InviteRedirect() {
  return null;
}
