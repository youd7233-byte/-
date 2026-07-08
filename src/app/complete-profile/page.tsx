import CompleteProfileForm from "@/components/CompleteProfileForm";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "أكمل ملفك الشخصي | حِرَفي",
  description: "أكمل بياناتك لتصبح حرفياً معتمداً في منصتنا.",
};

export default function CompleteProfilePage() {
  return (
    <div dir="rtl">
      <Navbar />
      <main>
        <CompleteProfileForm />
      </main>
    </div>
  );
}
