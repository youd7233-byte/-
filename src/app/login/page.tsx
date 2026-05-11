import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-cream">
      <Navbar />
      <main className="flex items-center justify-center pt-20 px-6">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-clay/10 border border-clay/10 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-dark mb-2">مرحباً بك مجدداً</h1>
            <p className="text-muted font-medium">سجل دخولك لمتابعة أعمالك وطلباتك</p>
          </div>
          
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-dark pr-2">رقم الهاتف</label>
              <input 
                type="tel" 
                placeholder="0555 000 000" 
                dir="ltr"
                className="w-full px-6 py-4 bg-cream/30 border border-clay/20 rounded-2xl focus:border-terracotta outline-none transition-all font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-dark pr-2">كلمة المرور</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-6 py-4 bg-cream/30 border border-clay/20 rounded-2xl focus:border-terracotta outline-none transition-all font-medium"
              />
            </div>
            
            <div className="text-left">
              <a href="#" className="text-sm font-bold text-terracotta hover:underline">نسيت كلمة المرور؟</a>
            </div>
            
            <button className="w-full bg-terracotta text-white py-5 rounded-2xl font-black text-lg hover:bg-mid transition-all shadow-xl shadow-terracotta/20 hover:-translate-y-1">
              تسجيل الدخول
            </button>
          </form>
          
          <div className="mt-10 text-center text-muted font-medium">
            ليس لديك حساب بعد؟ <br />
            <Link href="/register-artisan" className="text-terracotta font-black hover:underline mt-2 inline-block">سجل كحرفي الآن</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
