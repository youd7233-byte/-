import ArtisanRegisterForm from "@/components/ArtisanRegisterForm";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "سجّل حِرفتك | حِرَفي",
  description: "انضم لمنصة حِرَفي وابدأ بتلقي طلبات العملاء في منطقتك.",
};

export default function RegisterArtisanPage() {
  return (
    <div dir="rtl">
      <Navbar />
      <main>
        <ArtisanRegisterForm />
      </main>
    </div>
  );
}
