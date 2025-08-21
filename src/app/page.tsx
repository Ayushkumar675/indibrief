import { auth, signIn, signOut } from "@/lib/auth"
import prisma from "@/lib/db"
import Dashboard from "@/app/components/Dashboard"
import { LogIn } from "lucide-react"

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    return <SignInScreen />
  }

  // Fetch the user and their preference in one go.
  // This is more efficient than fetching the session and then the user.
  const userWithPreference = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      preference: true,
    },
  });

  if (!userWithPreference) {
    // This case should ideally not happen if a session exists,
    // but it's good practice to handle it.
    return <SignInScreen message="Could not find user data. Please sign in again." />
  }

  const headlineCount = await prisma.headline.count();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <Dashboard user={userWithPreference} hasHeadlines={headlineCount > 0} />
      <SignOutButton />
    </main>
  )
}

function SignInScreen({ message }: { message?: string }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mx-auto text-center bg-gray-800 rounded-lg p-8">
        <h1 className="text-4xl font-bold tracking-tight">IndiBrief</h1>
        <p className="text-gray-400 mt-2 mb-8">
          Sign in to get your daily dose of headlines.
        </p>
        {message && <p className="text-red-400 mb-4">{message}</p>}

        {/* For this PoC, we'll use a hardcoded email for the passwordless sign-in.
            A real app would have a text input for the user's email. */}
        <form
          action={async () => {
            "use server"
            await signIn("email", { email: "test@example.com", redirect: false })
          }}
        >
          <p className="text-sm text-gray-500 mb-4">
            Clicking below will sign you in with the email &quot;test@example.com&quot; and send a magic link to your console.
          </p>
          <button type="submit" className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            <LogIn size={20} />
            <span>Sign In with Email</span>
          </button>
        </form>
      </div>
    </main>
  );
}

function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
      className="absolute top-4 right-4"
    >
      <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
        Sign Out
      </button>
    </form>
  )
}
