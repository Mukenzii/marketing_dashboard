import { redirect } from "next/navigation";

// Root sends people into the app. Unauthenticated users get bounced to /login
// by the dashboard guard; authenticated users land on their dashboard.
export default function Page() {
  redirect("/dashboard");
}
