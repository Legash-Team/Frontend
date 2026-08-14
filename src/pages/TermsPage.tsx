import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'am'>('en');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-red-100/30 p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 space-y-8">
        
        {/* Header and Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">LEGASH PLATFORM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {lang === 'en' ? 'Terms & Privacy Policy' : 'የአጠቃቀም ደንቦች እና የግላዊነት ፖሊሲ'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'en' ? 'Last updated: October 24, 2023' : 'ለመጨረሻ ጊዜ የዘመነው፡ ኦክቶበር 24፣ 2023'}
            </p>
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('am')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                lang === 'am'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              አማርኛ
            </button>
          </div>
        </div>

        {/* English Content */}
        {lang === 'en' ? (
          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium text-gray-800">
              Last updated: October 24, 2023. Please review these terms carefully as they govern your use of the LEGASH platform.
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
                Your data and privacy
              </h2>
              <p>
                We are committed to protecting your privacy. This section explains how we collect, use, and safeguard your personal information when you use our services. We only collect data necessary to provide and improve the LEGASH experience.
              </p>
              <p>
                Your health information, including blood type and donation history, is encrypted and stored securely. We adhere strictly to national health data regulations to ensure your sensitive information remains confidential.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
                How your Information is used
              </h2>
              <p>
                LEGASH does not sell your personal data to third parties. Your information is only shared when necessary to facilitate a blood donation request or to comply with legal obligations.
              </p>
              <p>
                When you respond to a donation request, your contact details may be shared with the requesting party or the partner hospital, only with your explicit consent for that specific transaction.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
                Account verification
              </h2>
              <p>
                To ensure the safety and integrity of the LEGASH community, all accounts must undergo a verification process. This may involve confirming your phone number, email address, or identity via government-issued ID.
              </p>
              <p>
                Unverified accounts may face restrictions in interacting with active requests or making direct contact with other users.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
                User responsibilities
              </h2>
              <p>
                By using this app, you agree to provide accurate and up-to-date health information. You acknowledge that providing false information regarding your donation eligibility can have serious medical consequences.
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2 text-gray-700">
                <li>Maintain the confidentiality of your account credentials.</li>
                <li>Respect the privacy and circumstances of other users.</li>
                <li>Report any suspicious activity or violations of these terms immediately.</li>
              </ul>
            </section>
          </div>
        ) : (
          /* Amharic Content */
          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <p className="font-medium text-gray-800">
              ለመጨረሻ ጊዜ የዘመነው፡ ኦክቶበር 24፣ 2023። የLEGASH (ለጋሽ) መድረክ አጠቃቀምዎን ስለሚመሩ እባክዎ እነዚህን ደንቦች በጥንቃቄ ይመልከቱ።
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
                የእርስዎ መረጃ እና ግላዊነት
              </h2>
              <p>
                የእርስዎን ግላዊነት ለመጠበቅ ቆርጠን ተነስተናል። ይህ ክፍል አገልግሎታችንን ሲጠቀሙ የእርስዎን ግላዊ መረጃ እንዴት እንደምንሰበስብ፣ እንደምንጠቀም እና እንደምንጠብቅ ያብራራል። የምንሰበስበው የLEGASH (ለጋሽ) አገልግሎትን ለመስጠት እና ለማሻሻል አስፈላጊ የሆኑ መረጃዎችን ብቻ ነው።
              </p>
              <p>
                የደም ዓይነትዎን እና የልገሳ ታሪክዎን ጨምሮ የጤና መረጃዎ የተመሰጠረ እና ደህንነቱ በተጠበቀ ሁኔታ የተከማቸ ነው። የእርስዎ ሚስጥራዊ መረጃ በሚስጥር እንዲቆይ ለማድረግ ሀገራዊ የጤና መረጃ ደንቦችን በጥብቅ እንከተላለን።
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
                መረጃዎ እንዴት ጥቅም ላይ እንደሚውል
              </h2>
              <p>
                LEGASH (ለጋሽ) የእርስዎን ግላዊ መረጃ ለሶስተኛ ወገኖች አይሸጥም። መረጃዎ የሚጋራው የደም ልገሳ ጥያቄን ለማመቻቸት ወይም ህጋዊ ግዴታዎችን ለማክበር አስፈላጊ ሲሆን ብቻ ነው።
              </p>
              <p>
                ለልገሳ ጥያቄ ምላሽ ሲሰጡ፣ የመገናኛ መረጃዎ ለጠያቂው አካል ወይም አጋር ሆስፒታል ሊጋራ የሚችለው ለዚያ የተወሰነ ግብይት በእርስዎ ግልጽ ፈቃድ ሲኖር ብቻ ነው።
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
                የመለያ ማረጋገጫ
              </h2>
              <p>
                የLEGASH (ለጋሽ) ማህበረሰብን ደህንነት እና ታማኝነት ለማረጋገጥ ሁሉም መለያዎች የማረጋገጫ ሂደት ማለፍ አለባቸው። ይህ የስልክ ቁጥርዎን፣ የኢሜይል አድራሻዎን ወይም ማንነትዎን በመንግስት በተሰጠ መታወቂያ ማረጋገጥን ሊያካትት ይችላል።
              </p>
              <p>
                ያልተረጋገጡ መለያዎች ወቅታዊ ከሆኑ ጥያቄዎች ጋር መስተጋብር ለመፍጠር ወይም ከሌሎች ተጠቃሚዎች ጋር ቀጥታ ግንኙነት ለማድረግ ገደቦች ሊያጋጥሟቸው ይችላሉ።
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
                የተጠቃሚ ኃላፊነቶች
              </h2>
              <p>
                ይህንን መተግበሪያ በመጠቀም፣ ትክክለኛ እና ወቅታዊ የጤና መረጃ ለማቅረብ ተስማምተዋል። ስለ ልገሳ ብቁነትዎ የሐሰት መረጃ መስጠት ከባድ የህክምና መዘዞች ሊያስከትል እንደሚችል አምነው ይቀበላሉ።
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2 text-gray-700">
                <li>የመለያዎን የመግቢያ መረጃዎች በሚስጥር ይጠብቁ።</li>
                <li>የሌሎች ተጠቃሚዎችን ግላዊነት እና ሁኔታ ያክብሩ።</li>
                <li>ማንኛውንም አጠራጣሪ እንቅስቃሴ ወይም የእነዚህን ደንቦች ጥሰቶች ወዲያውኑ ሪፖርት ያድርጉ።</li>
              </ul>
            </section>
          </div>
        )}

        {/* Footer Navigation Link */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
          >
            ← {lang === 'en' ? 'Back to Registration' : 'ወደ ምዝገባ ይመለሱ'}
          </Link>
          <span className="text-xs text-gray-400">LEGASH Healthcare System</span>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;
