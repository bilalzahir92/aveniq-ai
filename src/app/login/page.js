import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign in - AVENIQ AI",
};

export default async function LoginPage({
  searchParams,
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <LoginForm
      next={
        typeof params?.next === "string"
          ? params.next
          : "/"
      }
    />
  );
}
