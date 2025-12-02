import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold text-foreground">FlashyCardy</h1>
        <p className="text-xl text-muted-foreground">
          Your personal flashcard platform
        </p>
        <div className="mt-4">
          <AuthModal />
        </div>
      </div>
    </div>
  );
}
