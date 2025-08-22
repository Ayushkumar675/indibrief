import { auth, signIn, signOut } from "@/lib/auth"
import prisma from "@/lib/db"
import Dashboard from "@/app/components/Dashboard"
import { LogIn } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    return <SignInScreen />
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return <SignInScreen message="Could not find user data. Please sign in again." />
  }

  const headlineCount = await prisma.headline.count();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative bg-gray-50">
      <Dashboard user={user} hasHeadlines={headlineCount > 0} />
      <SignOutButton />
    </main>
  )
}

function SignInScreen({ message }: { message?: string }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto text-center bg-white rounded-2xl p-10 shadow-lg animate-fade-in-down">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-800">IndiBrief</h1>
        <p className="text-gray-500 mt-3 text-lg mb-8">
          Sign in to get your daily dose of headlines.
        </p>
        {message && <p className="text-red-500 mb-4 font-semibold">{message}</p>}

        <form
          action={async () => {
            "use server"
            await signIn("email", { email: "test@example.com", redirect: false })
          }}
        >
          <p className="text-sm text-gray-500 mb-4">
            Clicking below will sign you in with the email &quot;test@example.com&quot; and send a magic link to your console.
          </p>
          <button
            type="submit"
            className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <LogIn size={22} />
            <span className="text-lg">Sign In with Email</span>
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
      className="absolute top-6 right-6"
    >
      <button
        type="submit"
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out transform hover:scale-105"
      >
        Sign Out
      </button>
    </form>
  )
}
