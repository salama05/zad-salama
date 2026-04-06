import React from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const navigate = useNavigate();

  const handleContinue = (e) => {
    e.preventDefault();
    localStorage.setItem('zadUserName', 'ضيف');
    navigate('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] page-enter-active">
      <div className="bg-zad-bg text-zad-text border-2 border-zad-border p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 islamic-bg opacity-30 pointer-events-none"></div>

        <h1 className="text-4xl font-amiri font-bold mb-4 text-[#D4B595] drop-shadow-sm">زاد السلامة</h1>
        <p className="mb-8 text-lg font-cairo">تطبيق إسلامي شامل بروح المصحف الشريف</p>
        
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <p className="text-xl font-cairo font-semibold text-[#8B6B4A]">
            نسأل الله أن يرزقنا و إياكم العلم النافع والعمل الصالح
          </p>
          
          <button 
            onClick={handleContinue}
            className="w-full bg-[#D4B595] hover:bg-[#C5A028] text-white font-bold py-3 px-6 rounded-lg transition-colors font-cairo text-xl shadow-md"
          >
            الدخول للتطبيق
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
