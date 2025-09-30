import AuthButton from "@/components/AuthButton";
import OrderForm from "@/components/OrderForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full p-4">
      <nav className="w-full flex justify-end border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-end items-center p-3 text-sm">
          <AuthButton />
        </div>
      </nav>

      <div className="animate-in flex-1 flex flex-col gap-10 opacity-0 max-w-4xl px-3 py-12 lg:py-16 text-foreground">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold">Formulaire de Commande</h1>
          <p className="text-lg text-foreground/80 mt-2">
            Remplissez les informations ci-dessous pour passer votre commande.
          </p>
        </div>

        <OrderForm />

      </div>
    </div>
  );
}