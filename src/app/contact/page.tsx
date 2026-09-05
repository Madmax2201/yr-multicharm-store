"use client";

import { MessageCircle, Phone, Mail, Sparkles, CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-600 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white md:text-5xl">
            تواصلي معنا 🤍
          </h1>
          <p className="text-lg text-white/80">
            نحن هنا لمساعدتك في اختيار الجهاز المناسب لكِ
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        {/* Welcome Card */}
        <div className="mb-12 rounded-3xl border border-purple-100 bg-white p-8 shadow-xl md:p-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="text-purple-500" size={24} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-800">
              مرحباً بكِ في عالمنا 🤍
            </h2>
          </div>
          
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              إذا كنتِ ترغبين في شراء جهاز ليزر منزلي لإزالة الشعر، وتشعرين بالحيرة حول النوع الأنسب لكِ، يمكنكِ التواصل معنا.
            </p>
            
            <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-purple-700">
                <CheckCircle size={20} className="text-purple-500" />
                استشارة مجانية قبل الشراء
              </h3>
              <p>
                نقدّم لكِ استشارة مجانية قبل الشراء، نساعدكِ من خلالها على اختيار الجهاز المناسب حسب نوع بشرتكِ، نوع الشعر، والمناطق التي ترغبين في استخدامها عليها.
              </p>
            </div>
            
            <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-violet-700">
                <Calendar size={20} className="text-violet-500" />
                متابعة مجانية شهرية
              </h3>
              <p>
                بعد استلام المنتج، لا نترككِ وحدكِ. نوفر لكِ متابعة مجانية شهرية حسب نتائجكِ، مع برنامج استعمال خاص بكِ يتم تعديله حسب تطور النتائج، لضمان استخدام صحيح وتجربة أفضل.
              </p>
            </div>
            
            <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-indigo-700">
                <Sparkles size={20} className="text-indigo-500" />
                خدمة البيع بالتقسيط
              </h3>
              <p>
                كما نوفر خدمة البيع بالتقسيط لتسهيل الشراء عليكِ..
              </p>
            </div>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* WhatsApp Button */}
          <a
            href="https://wa.me/XXXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 rounded-2xl bg-green-500 px-8 py-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-green-600 hover:shadow-xl"
          >
            <MessageCircle size={28} className="transition-transform group-hover:scale-110" />
            <div className="text-right">
              <div className="text-lg font-bold">تواصل معنا عبر واتساب</div>
              <div className="text-sm text-green-100">رد سريع على استفساراتكِ</div>
            </div>
          </a>

          {/* Phone Button */}
          <a
            href="tel:+XXXXXXXXXXX"
            className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 px-8 py-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Phone size={28} className="transition-transform group-hover:scale-110" />
            <div className="text-right">
              <div className="text-lg font-bold">اتصلي بنا مباشرة</div>
              <div className="text-sm text-purple-100">للحصول على استشارة فورية</div>
            </div>
          </a>
        </div>

        {/* Email Contact */}
        <div className="mt-8 text-center">
          <a
            href="mailto:info@yrmulticharm.com"
            className="inline-flex items-center gap-2 rounded-full border-2 border-purple-200 bg-white px-8 py-3 text-purple-600 transition-all hover:border-purple-400 hover:bg-purple-50"
          >
            <Mail size={18} />
            <span className="font-medium">أو تواصلي عبر البريد الإلكتروني</span>
          </a>
        </div>
      </section>
    </div>
  );
}
