import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "notscared" }, { name: "description", content: "notscared - coming soon" }];
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-semibold tracking-tight mb-2">notscared</h1>
      <p className="text-lg text-gray-600 mb-8">coming soon</p>
      <Link to="/login" className="text-sm underline hover:no-underline">
        login
      </Link>
    </main>
  );
}
