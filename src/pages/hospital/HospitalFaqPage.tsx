import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Mail,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'account' | 'stock' | 'requests' | 'records' | 'general';
  categoryLabel: string;
  question: string;
  answer: string;
  keyPoints?: string[];
}

const HOSPITAL_FAQS_EN: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'account',
    categoryLabel: 'Registration & Verification',
    question: 'How does hospital registration and institutional verification work?',
    answer:
      'When your medical facility registers on Legash, you provide institutional credentials including official hospital name, medical license or registration number, department head contact, and facility coordinates. Legash places newly registered accounts into a verified review queue where credentials are checked by Regional Blood Bank Administrators or Super Admins before full blood distribution permissions are unlocked.',
    keyPoints: [
      'Official license and hospital credentials are submitted during registration',
      'Requires institutional review before high-volume request fulfillment',
      'Protects clinical safety and authenticates healthcare provider identities',
    ],
  },
  {
    id: 'faq-2',
    category: 'account',
    categoryLabel: 'Registration & Verification',
    question: 'What happens while hospital approval status is pending?',
    answer:
      'While your hospital account status is "Pending", you can log in, access your profile, inspect the dashboard, and view regional directory information. However, creating outgoing emergency blood requests and adjusting active blood bank inventory remain guarded until an administrator confirms your institutional validity. If approval takes longer than expected, verify that your provided email and contact numbers are accurate.',
    keyPoints: [
      'Read-only access to profile and facility guidelines during review',
      'Outbound emergency matching activates immediately upon administrator approval',
      'Contact Regional Admin or support if documentation updates are required',
    ],
  },
  {
    id: 'faq-3',
    category: 'account',
    categoryLabel: 'Profile & Settings',
    question: 'How can I update hospital contact and representative information?',
    answer:
      'From the dashboard sidebar, select "Profile" and click "Edit Profile". You can modify your facility name, primary and secondary telephone lines, and designated contact person. To maintain audit integrity and regulatory compliance, the primary institutional email and geographic location coordinates cannot be changed self-serve; please reach out to your regional administrator if your medical campus has moved.',
    keyPoints: [
      'Update phone numbers, representative names, and facility details via Edit Profile',
      'Primary email and coordinates remain locked to preserve institutional audit trails',
      'Changes are reflected immediately across the Legash network',
    ],
  },
  {
    id: 'faq-4',
    category: 'stock',
    categoryLabel: 'Blood Stock Management',
    question: 'How do I manage blood stock levels and update unit counts?',
    answer:
      'Navigate to "Blood Stock" in the left sidebar. The inventory grid displays real-time unit counts for all eight ABO/Rh types (A+, A-, B+, B-, AB+, AB-, O+, O-). You can increment stock when new supplies arrive from blood centers or internal drives, or decrement stock when units are cross-matched and transfused to patients.',
    keyPoints: [
      'Covers all 8 blood types: A+, A-, B+, B-, AB+, AB-, O+, O-',
      'Immediate manual updates or automatic increments upon donation confirmation',
      'Keeps regional blood banks aware of emergency surpluses and critical deficits',
    ],
  },
  {
    id: 'faq-5',
    category: 'stock',
    categoryLabel: 'Blood Stock Management',
    question: 'What do Adequate, Limited, and Low stock statuses mean?',
    answer:
      'Legash automatically evaluates your recorded inventory against clinical safety thresholds:\n\n• Adequate: Your facility holds a comfortable reserve of blood units meeting expected surgical and emergency demand.\n• Limited: Inventory is approaching minimum buffer levels. Routine conservation and active donor engagement are recommended.\n• Low: The blood type has reached critically low or zero units. The system highlights these groups with amber/red alerts so you can immediately request replenishment from blood centers or broadcast emergency donor requests.',
    keyPoints: [
      'Adequate: Healthy operating buffer above safety threshold',
      'Limited: Reserves tightening; consider proactive restocking',
      'Low: Critical shortage; immediate replenishment recommended',
    ],
  },
  {
    id: 'faq-6',
    category: 'stock',
    categoryLabel: 'Search & Compatibility',
    question: 'How do I search for nearby hospitals and compatible blood availability?',
    answer:
      'Open the "Hospital Search" tool from the sidebar. You can filter by blood type and proximity to see verified hospitals and regional blood repositories in your territory. The search result displays available units, distance, and direct institutional contacts so clinical staff can arrange emergency unit transfers directly.',
    keyPoints: [
      'Locate neighboring hospitals and blood centers within your vicinity',
      'Filter by required blood group to find compatible reserves in real time',
      'Access direct facility phone numbers for inter-hospital transfers',
    ],
  },
  {
    id: 'faq-7',
    category: 'requests',
    categoryLabel: 'Blood Requests',
    question: 'How do I create and manage hospital blood requests?',
    answer:
      'Go to "Request Blood" or "All Requests". Specify the required blood type, unit count, clinical urgency (Emergency, Urgent, or Routine), and hospital ward. Once submitted, your request is active. You can track incoming donor acceptances, monitor blood center responses, and close or fulfill requests once your target units have been secured.',
    keyPoints: [
      'Select urgency level, target blood type, units needed, and patient department',
      'Monitored in real time under All Requests',
      'Close or complete requests once adequate blood units are secured',
    ],
  },
  {
    id: 'faq-8',
    category: 'requests',
    categoryLabel: 'Blood Requests',
    question: 'How do donor requests reach registered donors and regional blood centers?',
    answer:
      'When an emergency request is published, Legash matches eligible donors based on geographic radius, ABO/Rh compatibility, and their mandatory 90-day cooldown interval. Eligible donors receive push notifications and in-app alerts on their mobile app. Simultaneously, regional blood centers receive incoming request alerts to dispatch stocked units if needed.',
    keyPoints: [
      'Smart matching incorporates donor location, blood compatibility, and 90-day cooldowns',
      'Direct push notifications dispatched to compatible Mobile app donors',
      'Blood centers see incoming hospital requests on their dedicated portal',
    ],
  },
  {
    id: 'faq-9',
    category: 'requests',
    categoryLabel: 'Requests & Donors',
    question: 'Where can I review donors who have accepted our request?',
    answer:
      'In "All Requests", click on your active request. The response panel displays all donors who have tapped "Accept" on their mobile app. You will see their donor ID/name, phone number, and accepted timestamp so your phlebotomy team can prepare reception and triage.',
    keyPoints: [
      'Real-time list of donors who have committed to donate',
      'Contact details provided to confirm arrival ETA',
      'Seamless transition into Medical Records upon donor arrival',
    ],
  },
  {
    id: 'faq-10',
    category: 'records',
    categoryLabel: 'Medical Records & Outcomes',
    question: 'How do I record successful donations or handle cases where a donor "Didn\'t Donate"?',
    answer:
      'Under "Medical Records" in the "Waiting" tab, find the donor who arrived. If the medical screening is passed and phlebotomy succeeds, click "Confirm Donation" — this records the units collected, auto-increments your blood stock, and resets the donor\'s 90-day cooldown timer. If the donor is found ineligible, felt unwell, or did not show up, click "Didn\'t Donate" to close the item responsibly without falsely incrementing inventory.',
    keyPoints: [
      'Confirm Donation: Records collection, increments stock, starts donor cooldown',
      'Didn\'t Donate: Closes the record responsibly without altering blood inventory',
      'Prevents inventory discrepancies and maintains accurate medical audit logs',
    ],
  },
  {
    id: 'faq-11',
    category: 'records',
    categoryLabel: 'Medical Records & Outcomes',
    question: 'Where can I view past donation records and pending triage confirmations?',
    answer:
      'The "Medical Records" page is split into two views:\n• "Waiting" Tab: Displays donors who accepted requests and are currently expected or undergoing phlebotomy.\n• "Filled" Tab: Displays the permanent clinical archive of completed donations, including donor details, units collected, completion timestamp, and staff notes.',
    keyPoints: [
      'Waiting tab tracks pending arrivals awaiting confirmation',
      'Filled tab archives verified donations with complete audit histories',
      'Export or inspect past clinical contributions at any time',
    ],
  },
  {
    id: 'faq-12',
    category: 'general',
    categoryLabel: 'Blood Drives & Events',
    question: 'How are blood donation drives and events managed on Legash?',
    answer:
      'Regional Blood Centers and Admins host mobile blood collection drives and public donation campaigns that appear in the Mobile donor app. Hospitals can coordinate with regional centers through "Center Requests" or direct communication to partner on community blood drives, mobile phlebotomy buses, and emergency replenishment initiatives.',
    keyPoints: [
      'Community donation events are published by Regional Blood Centers',
      'Donors view active and upcoming drives directly on their mobile devices',
      'Hospitals can collaborate with blood centers for mobile unit support',
    ],
  },
  {
    id: 'faq-13',
    category: 'account',
    categoryLabel: 'Security & Notifications',
    question: 'How do I manage hospital account security and password changes?',
    answer:
      'Navigate to "Profile" and scroll down to the "Security" section. You can update your hospital account password by entering your current password followed by your new password. If you misplace your login credentials, click "Forgot Password" to receive an authenticated reset link via your institution\'s registered email address.',
    keyPoints: [
      'Change password self-service via the Hospital Profile page',
      'Secure password reset via registered email address',
      'Protected session tokens expire automatically on logout for security',
    ],
  },
  {
    id: 'faq-14',
    category: 'general',
    categoryLabel: 'Troubleshooting & Support',
    question: 'What should I do if a blood request receives slow donor responses or data looks out of sync?',
    answer:
      'If donor responses are slow for a rare blood type (such as AB- or O-), immediately check "Center Requests" to dispatch a requisition to regional blood banks, or use "Hospital Search" to contact facilities with surplus units. If UI counters appear out of sync, use the browser reload or navigation tabs — all stock and record adjustments are backed by real-time server consistency.',
    keyPoints: [
      'Escalate critical shortages to Regional Blood Centers via Center Requests',
      'Use Hospital Search to locate nearby facilities with compatible blood units',
      'Contact Legash administrative support for urgent institutional issues',
    ],
  },
];

const HOSPITAL_FAQS_AM: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'account',
    categoryLabel: 'ምዝገባ እና ማረጋገጫ',
    question: 'የሆስፒታል ምዝገባ እና የተቋም ማረጋገጫ እንዴት ይሰራል?',
    answer:
      'የህክምና ተቋምዎ በለጋሽ ላይ ሲመዘገብ ይፋዊ የሆስፒታል ስም፣ የህክምና ፈቃድ ወይም የምዝገባ ቁጥር፣ የክፍል ኃላፊ አድራሻ እና የተቋሙን ጂኦግራፊያዊ መጋጠሚያዎች ያቀርባሉ። ለጋሽ አዲስ የተመዘገቡ መለያዎችን ወደ ማረጋገጫ ቅደም ተከተል ያስቀምጣቸዋል፤ ሙሉ የደም ማከፋፈያ ፈቃዶች ከመከፈታቸው በፊት መረጃዎቹ በክልል የደም ባንክ አስተዳዳሪዎች ወይም በከፍተኛ አስተዳዳሪዎች ይመረመራሉ።',
    keyPoints: [
      'ይፋዊ ፈቃድ እና የሆስፒታል ምስክር ወረቀቶች በምዝገባ ወቅት ይገባሉ',
      'ከፍተኛ መጠን ያለው የደም ጥያቄ ከማስተናገድ በፊት የተቋም ግምገማ ይጠይቃል',
      'ክሊኒካዊ ደህንነትን ያረጋግጣል፤ የጤና ተቋማት ማንነትን ያረጋግጣል',
    ],
  },
  {
    id: 'faq-2',
    category: 'account',
    categoryLabel: 'ምዝገባ እና ማረጋገጫ',
    question: 'የሆስፒታል ይሁንታ በመጠባበቅ ላይ እያለ ምን ይከሰታል?',
    answer:
      'የሆስፒታልዎ መለያ ሁኔታ "በመጠባበቅ ላይ" እያለ፣ መግባት፣ መገለጫዎን መመልከት፣ ዳሽቦርዱን መቃኘት እና የክልል ማውጫ መረጃዎችን ማየት ይችላሉ። ነገር ግን፣ አስተዳዳሪ የተቋምዎን ትክክለኛነት እስኪያረጋግጥ ድረስ ወጪ የአደጋ ጊዜ የደም ጥያቄዎችን መፍጠር እና የደም ክምችትን ማስተካከል የተገደበ ነው። ማረጋገጫው ከሚጠበቀው በላይ ከዘገየ፣ ያቀረቡት ኢሜይል እና ስልክ ቁጥሮች ትክክል መሆናቸውን ያረጋግጡ።',
    keyPoints: [
      'በግምገማ ወቅት ለመገለጫ እና መመሪያዎች የማንበብ ፈቃድ ብቻ አለ',
      'አስተዳዳሪው ሲያረጋግጥ የአደጋ ጊዜ የደም ማዛመድ ወዲያውኑ ይጀምራል',
      'የሰነድ ማሻሻያ የሚያስፈልግ ከሆነ የክልል አስተዳዳሪን ያነጋግሩ',
    ],
  },
  {
    id: 'faq-3',
    category: 'account',
    categoryLabel: 'መገለጫ እና ቅንብሮች',
    question: 'የሆስፒታል አድራሻ እና የተወካይ መረጃን እንዴት ማዘመን እችላለሁ?',
    answer:
      'ከዳሽቦርድ የጎን ምናሌ "መገለጫ" የሚለውን ይምረጡና "መገለጫ አርትዕ" የሚለውን ይጫኑ። የተቋምዎን ስም፣ ዋና እና ሁለተኛ የስልክ ቁጥሮችን እንዲሁም የተመደበውን ተወካይ ማስተካከል ይችላሉ። የኦዲት እና የህግ ደንብ ታማኝነትን ለመጠበቅ፣ ዋናው የተቋም ኢሜይል እና የጂኦግራፊያዊ መጋጠሚያዎች በራስ-ሰር ሊቀየሩ አይችሉም፤ ካምፓስዎ የተዛወረ ከሆነ እባክዎን የክልል አስተዳዳሪዎን ያነጋግሩ።',
    keyPoints: [
      'ስልክ ቁጥሮችን፣ የተወካይ ስሞችን እና ዝርዝሮችን በመገለጫ አርትዕ በኩል ያዘምኑ',
      'የተቋም የኦዲት ታሪክን ለመጠበቅ ዋናው ኢሜይል እና መጋጠሚያዎች እንደተቆለፉ ይቆያሉ',
      'የተደረጉ ለውጦች በመላው የለጋሽ መረብ ላይ ወዲያውኑ ይንጸባረቃሉ',
    ],
  },
  {
    id: 'faq-4',
    category: 'stock',
    categoryLabel: 'የደም ክምችት አስተዳደር',
    question: 'የደም ክምችት ደረጃዎችን እንዴት ማስተዳደር እና የዩኒት ቆጠራዎችን ማዘመን እችላለሁ?',
    answer:
      'በግራ በኩል ባለው የጎን ምናሌ ውስጥ "የደም ክምችት" ወደሚለው ይሂዱ። የክምችት ሰንጠረዡ ለሁሉም ስምንት የ ABO/Rh ዓይነቶች (A+, A-, B+, B-, AB+, AB-, O+, O-) ቅጽበታዊ የዩኒት ቆጠራዎችን ያሳያል። አዲስ አቅርቦት ከደም ማዕከላት ወይም ከውስጣዊ ልገሳዎች ሲደርስ ክምችት መጨመር፣ ወይም ደም ለታካሚዎች ሲሰጥ መቀነስ ይችላሉ።',
    keyPoints: [
      'ሁሉንም 8 የደም ዓይነቶች ይሸፍናል፦ A+, A-, B+, B-, AB+, AB-, O+, O-',
      'በእጅ ፈጣን ማሻሻያ ወይም ልገሳ ሲረጋገጥ በራስ-ሰር መጨመር',
      'የክልል የደም ባንኮች ስለ ትርፍ እና እጥረት ሁልጊዜ ግንዛቤ እንዲኖራቸው ያደርጋል',
    ],
  },
  {
    id: 'faq-5',
    category: 'stock',
    categoryLabel: 'የደም ክምችት አስተዳደር',
    question: 'በቂ፣ የተገደበ እና ዝቅተኛ የክምችት ሁኔታዎች ምን ማለት ናቸው?',
    answer:
      'ለጋሽ የተመዘገበውን ክምችት ከክሊኒካዊ ደህንነት ገደቦች አንጻር በራስ-ሰር ይገመግማል፦\n\n• በቂ፦ ተቋምዎ የቀዶ ጥገና እና የአደጋ ጊዜ ፍላጎቶችን የሚያሟላ አስተማማኝ መጠባበቂያ አለው።\n• የተገደበ፦ ክምችቱ ወደ ዝቅተኛው ደህንነት ወሰን እየተቃረበ ነው። መደበኛ ጥንቃቄ እና ንቁ የለጋሾች ተሳትፎ ይመከራል።\n• ዝቅተኛ፦ የደም ዓይነቱ ወደ አሳሳቢ ዝቅተኛ ወይም ዜሮ ደርሷል። ከደም ማዕከላት ማሟያ ወዲያውኑ እንዲጠይቁ ወይም የአደጋ ጊዜ የለጋሽ ጥሪ እንዲያስተላልፉ ስርዓቱ በማስጠንቀቂያ ያደምቃቸዋል።',
    keyPoints: [
      'በቂ፦ ከደህንነት ወሰን በላይ ያለ ጤናማ የስራ ክምችት',
      'የተገደበ፦ ክምችት እየቀነሰ ነው፤ አስቀድሞ ማሟላት ይመረጣል',
      'ዝቅተኛ፦ ከባድ እጥረት፤ አፋጣኝ ማሟያ ያስፈልጋል',
    ],
  },
  {
    id: 'faq-6',
    category: 'stock',
    categoryLabel: 'ፍለጋ እና ተኳሃኝነት',
    question: 'የአቅራቢያ ሆስፒታሎችን እና ተኳሃኝ የደም አቅርቦትን እንዴት መፈለግ እችላለሁ?',
    answer:
      'ከጎን ምናሌው "የሆስፒታል ፍለጋ" የሚለውን ይክፈቱ። በአካባቢዎ ያሉ የተረጋገጡ ሆስፒታሎችን እና የክልል የደም ክምችቶችን ለማየት በደም ዓይነት እና በርቀት ማጣራት ይችላሉ። የፍለጋ ውጤቱ ያሉትን ክፍሎች፣ ርቀትን እና የተቋሙን የቀጥታ ስልክ ያሳያል፤ በዚህም የህክምና ሰራተኞች የአደጋ ጊዜ ዝውውር በቀጥታ ማመቻቸት ይችላሉ።',
    keyPoints: [
      'በአካባቢዎ ያሉ ጎረቤት ሆስፒታሎችን እና የደም ማዕከላትን ያግኙ',
      'ተኳሃኝ ክምችቶችን በቅጽበት ለማግኘት በሚፈለገው የደም ቡድን ያጣሩ',
      'ለሆስፒታል-ለሆስፒታል ዝውውር የቀጥታ ስልክ ቁጥሮችን ያግኙ',
    ],
  },
  {
    id: 'faq-7',
    category: 'requests',
    categoryLabel: 'የደም ጥያቄዎች',
    question: 'የሆስፒታል የደም ጥያቄዎችን እንዴት መፍጠር እና ማስተዳደር እችላለሁ?',
    answer:
      'ወደ "ደም ጠይቅ" ወይም "ሁሉም ጥያቄዎች" ይሂዱ። የሚፈለገውን የደም ዓይነት፣ የክፍሎች ብዛት፣ የክሊኒካዊ አጣዳፊነት (አደጋ ጊዜ፣ አስቸኳይ፣ ወይም መደበኛ) እና የሆስፒታሉን ክፍል ይጥቀሱ። አንዴ ከቀረበ በኋላ ጥያቄዎ ንቁ ይሆናል። የለጋሾችን ተቀባይነት መከታተል፣ የደም ማዕከል ምላሾችን መቆጣጠር እና የሚፈለገው ደም ሲገኝ ጥያቄዎችን ማጠናቀቅ ይችላሉ።',
    keyPoints: [
      'የአጣዳፊነት ደረጃን፣ የደም ዓይነትን፣ የሚያስፈልጉ ክፍሎችን እና ክፍልን ይምረጡ',
      'በ"ሁሉም ጥያቄዎች" ስር በቅጽበት ይከታተሉ',
      'በቂ የደም ክፍሎች ሲገኙ ጥያቄዎችን ይዝጉ ወይም ያጠናቁ',
    ],
  },
  {
    id: 'faq-8',
    category: 'requests',
    categoryLabel: 'የደም ጥያቄዎች',
    question: 'የለጋሽ ጥሪዎች ወደ ተመዘገቡ ለጋሾች እና የክልል የደም ማዕከላት እንዴት ይደርሳሉ?',
    answer:
      'የአደጋ ጊዜ ጥያቄ በሚወጣበት ጊዜ፣ ለጋሽ ብቁ ለጋሾችን በጂኦግራፊያዊ ራዲየስ፣ በ ABO/Rh ተኳሃኝነት እና በግዴታ የ90 ቀናት የእረፍት ጊዜያቸው መሰረት ያዛምዳል። ብቁ ለጋሾች በሞባይል መተግበሪያቸው ላይ ፈጣን ማሳወቂያ ይደርሳቸዋል። በተመሳሳይ ጊዜ፣ የክልል የደም ማዕከላት አስፈላጊ ሆኖ ሲገኝ የተከማቸውን ደም ለመላክ የጥያቄ ማሳወቂያዎችን ይቀበላሉ።',
    keyPoints: [
      'ዘመናዊ ማዛመድ የለጋሽ አካባቢን፣ የደም ተኳሃኝነትን እና የ90 ቀናት እረፍትን ያካትታል',
      'ለተኳሃኝ የሞባይል መተግበሪያ ለጋሾች የቀጥታ ማሳወቂያዎች ይላካሉ',
      'የደም ማዕከላት የሚመጡ የሆስፒታል ጥያቄዎችን በራሳቸው ፖርታል ይመለከታሉ',
    ],
  },
  {
    id: 'faq-9',
    category: 'requests',
    categoryLabel: 'ጥያቄዎች እና ለጋሾች',
    question: 'ጥያቄያችንን የተቀበሉ ለጋሾችን የት መገምገም እችላለሁ?',
    answer:
      'በ"ሁሉም ጥያቄዎች" ውስጥ ንቁ ጥያቄዎ ላይ ጠቅ ያድርጉ። የምላሽ ፓነሉ በሞባይል መተግበሪያቸው ላይ "ተቀበል" ያሉትን ሁሉንም ለጋሾች ያሳያል። የደም መውሰጃ ቡድንዎ አቀባበል እና ምርመራ እንዲያዘጋጅ የለጋሹን መታወቂያ/ስም፣ ስልክ ቁጥር እና የተቀበሉበትን ሰዓት ያያሉ።',
    keyPoints: [
      'ደም ለመለገስ ቃል የገቡ ለጋሾች የቀጥታ ዝርዝር',
      'የመድረሻ ጊዜያቸውን ለማረጋገጥ የእውቂያ ዝርዝሮች ቀርበዋል',
      'ለጋሹ ሲደርስ ወደ ህክምና መዝገቦች በቀላሉ የሚደረግ ሽግግር',
    ],
  },
  {
    id: 'faq-10',
    category: 'records',
    categoryLabel: 'የህክምና መዝገቦች እና ውጤቶች',
    question: 'ስኬታማ ልገሳዎችን እንዴት መመዝገብ ወይም ለጋሽ "አልለገሰም" የሚሉ ሁኔታዎችን እንዴት ማስተናገድ እችላለሁ?',
    answer:
      'በ"የሕክምና መዝገቦች" ስር በ"በመጠባበቅ ላይ" ትር ውስጥ የደረሰውን ለጋሽ ያግኙ። የህክምና ምርመራው ካለፈ እና ደም በተሳካ ሁኔታ ከተወሰደ "ልገሳውን አረጋግጥ" የሚለውን ይጫኑ — ይህ የተሰበሰቡትን ክፍሎች ይመዘግባል፣ የደም ክምችትዎን በራስ-ሰር ይጨምራል፣ እና የለጋሹን የ90 ቀናት የእረፍት ቆጣሪ ዳግም ያስጀምራል። ለጋሹ ብቁ ካልሆነ፣ ህመም ከተሰማው ወይም ካልመጣ ያለ አግባብ ክምችት ሳይጨምር ጉዳዩን በኃላፊነት ለመዝጋት "አልለገሰም" የሚለውን ይጫኑ።',
    keyPoints: [
      'ልገሳውን አረጋግጥ፦ ስብስብን ይመዘግባል፣ ክምችት ይጨምራል፣ የእረፍት ጊዜ ያስጀምራል',
      'አልለገሰም፦ የደም ክምችት ሳይቀየር መዝገቡን በኃላፊነት ይዘጋል',
      'የክምችት ልዩነቶችን ይከላከላል እና ትክክለኛ የህክምና ኦዲት መዝገቦችን ይጠብቃል',
    ],
  },
  {
    id: 'faq-11',
    category: 'records',
    categoryLabel: 'የህክምና መዝገቦች እና ውጤቶች',
    question: 'ያለፉትን የልገሳ መዝገቦች እና በመጠባበቅ ላይ ያሉ ማረጋገጫዎችን የት ማየት እችላለሁ?',
    answer:
      'የ"የሕክምና መዝገቦች" ገጽ በሁለት እይታዎች ተከፍሏል፦\n• "በመጠባበቅ ላይ" ትር፦ ጥያቄዎችን ተቀብለው በአሁኑ ጊዜ የሚጠበቁ ወይም ደም በመስጠት ላይ ያሉ ለጋሾችን ያሳያል።\n• "የተጠናቀቁ" ትር፦ የለጋሽ ዝርዝሮችን፣ የተሰበሰቡ ክፍሎችን፣ የተጠናቀቀበትን ሰዓት እና የሰራተኞች ማስታወሻዎችን ጨምሮ የተጠናቀቁ ልገሳዎች ቋሚ ክሊኒካዊ መዝገብ ቤት ነው።',
    keyPoints: [
      'የመጠባበቂያ ትር ማረጋገጫ የሚጠብቁ መጤዎችን ይከታተላል',
      'የተጠናቀቁ ትር የተረጋገጡ ልገሳዎችን ከሙሉ ታሪክ ጋር ያስቀምጣል',
      'ያለፉ ክሊኒካዊ አስተዋጽኦዎችን በማንኛውም ጊዜ መመርመር ወይም መላክ ይቻላል',
    ],
  },
  {
    id: 'faq-12',
    category: 'general',
    categoryLabel: 'የደም ልገሳ ዘመቻዎች እና ክስተቶች',
    question: 'የደም ልገሳ ዘመቻዎች እና ክስተቶች በለጋሽ ላይ እንዴት ይተዳደራሉ?',
    answer:
      'የክልል የደም ማዕከላት እና አስተዳዳሪዎች በሞባይል ለጋሽ መተግበሪያ ላይ የሚታዩ የሞባይል ደም መሰብሰቢያ ዘመቻዎችን እና ህዝባዊ ዝግጅቶችን ያስተናግዳሉ። ሆስፒታሎች በማህበረሰብ የደም ዘመቻዎች፣ በተንቀሳቃሽ አውቶቡሶች እና በአደጋ ጊዜ ማሟያ ተነሳሽነቶች ላይ አብረው ለመስራት በ"የማዕከል ጥያቄዎች" ወይም በቀጥታ ግንኙነት ከክልል ማዕከላት ጋር መተባበር ይችላሉ።',
    keyPoints: [
      'የማህበረሰብ ልገሳ ክስተቶች በክልል የደም ማዕከላት ይታተማሉ',
      'ለጋሾች ንቁ እና መጪ ዘመቻዎችን በቀጥታ በሞባይል ስልካቸው ይመለከታሉ',
      'ሆስፒታሎች ለተንቀሳቃሽ ክፍል ድጋፍ ከደም ማዕከላት ጋር መተባበር ይችላሉ',
    ],
  },
  {
    id: 'faq-13',
    category: 'account',
    categoryLabel: 'ደህንነት እና ማሳወቂያዎች',
    question: 'የሆስፒታል መለያ ደህንነትን እና የይለፍ ቃል ለውጦችን እንዴት ማስተዳደር እችላለሁ?',
    answer:
      'ወደ "መገለጫ" ይሂዱ እና ወደ "ደህንነት" ክፍል ይሸብልሉ። አሁን ያለዎትን የይለፍ ቃል እና አዲሱን የይለፍ ቃል በማስገባት የሆስፒታልዎን መለያ የይለፍ ቃል ማዘመን ይችላሉ። የመግቢያ መረጃዎን ከረሱ፣ በተቋምዎ የተመዘገበ የኢሜይል አድራሻ በኩል የተረጋገጠ የማስተካከያ አገናኝ ለማግኘት "የይለፍ ቃል ረሳሁ" የሚለውን ይጫኑ።',
    keyPoints: [
      'በሆስፒታል መገለጫ ገጽ በኩል የይለፍ ቃልን በቀላሉ ይቀይሩ',
      'በተመዘገበ የኢሜይል አድራሻ በኩል ደህንነቱ የተጠበቀ የይለፍ ቃል ዳግም ማስተካከል',
      'ለደህንነት ሲባል ሲወጡ የተጠበቁ ክፍለ-ጊዜዎች በራስ-ሰር ያበቃሉ',
    ],
  },
  {
    id: 'faq-14',
    category: 'general',
    categoryLabel: 'ችግሮችን መፍታት እና ድጋፍ',
    question: 'የደም ጥያቄ አዝጋሚ የለጋሽ ምላሽ ካገኘ ወይም መረጃ ካልተመሳሰለ ምን ማድረግ አለብኝ?',
    answer:
      'ለአልፎ አልፎ ለሚገኝ የደም ዓይነት (እንደ AB- ወይም O-) የለጋሾች ምላሽ አዝጋሚ ከሆነ፣ ጥያቄውን ለክልል የደም ባንኮች ለመላክ ወዲያውኑ "የማዕከል ጥያቄዎች"ን ይፈትሹ፣ ወይም ትርፍ ክፍሎች ያላቸውን ተቋማት ለማነጋገር "የሆስፒታል ፍለጋ"ን ይጠቀሙ። በይነገጹ ያልተመሳሰለ ከመሰለ የአሳሽ ገጽ ማደሻ ይጠቀሙ — ሁሉም የክምችት እና የመዝገብ ማስተካከያዎች በቅጽበታዊ የአገልጋይ ወጥነት የተደገፉ ናቸው።',
    keyPoints: [
      'አሳሳቢ እጥረቶችን በማዕከል ጥያቄዎች በኩል ወደ ክልል የደም ማዕከላት ያሳድጉ',
      'ተኳሃኝ የደም ክፍሎች ያሏቸውን አቅራቢያ ተቋማት ለማግኘት የሆስፒታል ፍለጋን ይጠቀሙ',
      'ለአስቸኳይ የተቋም ጉዳዮች የለጋሽ አስተዳደር ድጋፍን ያነጋግሩ',
    ],
  },
];

const HOSPITAL_FAQS_OM: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'account',
    categoryLabel: 'Galmee & Mirkaneessa',
    question: 'Galmeen hospitaalaa fi mirkaneessi dhaabbataa akkamitti hojjeta?',
    answer:
      'Dhaabbanni fayyaa keessan Legaash irratti yeroo galmaa\'u, maqaa hospitaalaa seera qabeessa, heeyyama yaalaa yookiin lakkoofsa galmee, qunnamtii hooggana kutaa, fi koodineetii dhaabbatichaa dhiyeessitu. Legaashiin herregawwan haaraa galmaa\'an tarree mirkaneessa keessa kaa\'a; heeyyamni dhiiga raabsuu guutuun banamuun dura ragaan Bulchitoota Baankii Dhiigaa Naannoo yookiin Bulchitoota Ol\'aanoon qoratama.',
    keyPoints: [
      'Heeyyama seera qabeessaa fi ragaaleen hospitaalaa yeroo galmee dhiyaatu',
      'Gaaffilee dhiigaa baay\'ee dhiyeessuun dura gamaaggama dhaabbataa barbaada',
      'Nageenya yaalaa eega; eenyummaa dhiyeessitoota yaalaa mirkaneessa',
    ],
  },
  {
    id: 'faq-2',
    category: 'account',
    categoryLabel: 'Galmee & Mirkaneessa',
    question: 'Hospitaalli haala mirkaneessa eegaa jiru keessatti maaltu ta\'a?',
    answer:
      'Haalli herrega hospitaala keessanii "Eegaa Jira" yeroo ta\'utti, seenuu, piroofayilii keessan ilaaluu, daashboordii sakatta\'uu fi odeeffannoo galmee naannoo ilaaluu dandeessu. Haa ta\'u malee, bulchaan tokko seera qabeessummaa dhaabbata keessanii mirkaneessutti gaaffii dhiigaa ariifachiisaa baasuu fi qabeenya baankii dhiigaa sirreessuun eegamaadha. Yoo mirkaneessi yeroo eegamu caalaa ture, e-meelii fi lakkoofsa bilbilaa dhiyeessitan sirrii ta\'uu isaanii mirkaneeffadhaa.',
    keyPoints: [
      'Yeroo gamaaggamaatti piroofayilii fi qajeelfamoota dubbisuu qofa dandeessu',
      'Bulchaan mirkaneesseen gaaffii dhiigaa ariifachiisaa walitti-fiduun battalumatti hojjeta',
      'Ragaaleen dabalataa yoo barbaadame Bulchiinsa Naannoo yookiin deeggarsa qunnamaa',
    ],
  },
  {
    id: 'faq-3',
    category: 'account',
    categoryLabel: 'Piroofayilii & Qindaa\'inoota',
    question: 'Odeeffannoo qunnamtii hospitaalaa fi bakka bu\'aa akkamitti haaromsuu danda\'a?',
    answer:
      'Sarara cinaa daashboordii irraa "Piroofayilii" filadhaatii "Piroofayilii Gulaali" kan jedhu tuqaa. Maqaa dhaabbataa, lakkoofsa bilbilaa duraa fi lammaffaa, fi nama qunnamtiif ramadame jijjiiruu dandeessu. Seera qabeessummaa fi amanamummaa qorannoo eeguuf, e-meeliin dhaabbataa duraa fi koodineetiin bakkaa ofiin jijjiiramuu hin danda\'an; kaampasiin keessan yoo jijjiirame bulchaa naannoo keessanii qunnamaa.',
    keyPoints: [
      'Piroofayilii Gulaali jedhuun lakkoofsa bilbilaa, maqaa bakka bu\'aa fi ibsa dhaabbataa haaromsaa',
      'Qorannoo dhaabbataa eeguuf e-meelii fi koodineetiin duraa cufamanii turu',
      'Jijjiiramoonni godhaman battaluma sanatti shabaka Legaash hunda irratti mul\'atu',
    ],
  },
  {
    id: 'faq-4',
    category: 'stock',
    categoryLabel: 'Bulchiinsa Qabeenya Dhiigaa',
    question: 'Sadarkaa qabeenya dhiigaa akkamitti to\'adhee lakkoofsa yuunitii haaromsa?',
    answer:
      'Sarara cinaa bitaa irraa gara "Qabeenya Dhiigaa" jedhuutti dabraa. Gabateen qabeenyaa gosa dhiigaa ABO/Rh saddeettan (A+, A-, B+, B-, AB+, AB-, O+, O-) hundaaf lakkoofsa yuunitii battalaa agarsiisa. Yeroo dhiyeessiin haaraan wiirtuu dhiigaa irraa dhufu qabeenya dabaluu, yookiin dhiigni dhimma bahee dhukkubsattootaaf yeroo kennamu hir\'isuu dandeessu.',
    keyPoints: [
      'Gosa dhiigaa 8n hunda hammata: A+, A-, B+, B-, AB+, AB-, O+, O-',
      'Harkaan battalumatti haaromsuu yookiin arjoomni yoo mirkanaa\'e ofiin dabaluu',
      'Baankonni dhiigaa naannoo dhiiga dabalataa fi hir\'ina jiru akka beekan godha',
    ],
  },
  {
    id: 'faq-5',
    category: 'stock',
    categoryLabel: 'Bulchiinsa Qabeenya Dhiigaa',
    question: 'Haalli qabeenyaa Ga\'aa, Murtaa\'aa, fi Gadi-aanaa maaltu jedhama?',
    answer:
      'Legaashiin qabeenya galmeeffame daangaa nageenya yaalaa wajjin ofumaan madaala:\n\n• Ga\'aa: Dhaabbanni keessan fedhii baqaqsanii hodhuu fi tasaa kan kuffisu kuusaa qabeenyaa quubsaa qaba.\n• Murtaa\'aa: Qabeenyi gara daangaa gadi-aanaatti dhiyaachaa jira. Qusannoo gochuu fi arjoomtoota kakaasuun ni gorfama.\n• Gadi-aanaa: Gosi dhiigaa kun gara sadarkaa dhibbeentaa baay\'ee gadi-aanaa yookiin zeerootti gahuu agarsiisa. Wiirtuuwwan dhiigaa irraa ariitiin akka gaafattaniif sirnichi akeekkachiisa keelloo/diimaan adda baasa.',
    keyPoints: [
      'Ga\'aa: Daangaa nageenyaa olitti kuusaa nagaa qabaachuu',
      'Murtaa\'aa: Kuusaan hir\'achaa jira; dursee guutuun gaariidha',
      'Gadi-aanaa: Hanqina cimaa; dhiyeessii ariifachiisaan barbaachisaadha',
    ],
  },
  {
    id: 'faq-6',
    category: 'stock',
    categoryLabel: 'Barbaaduu & Walsimsiisa',
    question: 'Hospitaalota naannoo fi dhiiga walsimu akkamitti barbaada?',
    answer:
      'Sarara cinaa irraa meeshaa "Barbaaduu Hospitaalaa" banaa. Hospitaalota mirkanaa\'an fi kuusaa dhiigaa naannoo keessanii argachuuf gosa dhiigaa fi dhiheenyaan calaluu dandeessu. Bu\'aan barbaachaa yuunitii jiru, fageenya, fi bilbila dhaabbataa kallattiin agarsiisa; kanaanis ogeeyyiin yaalaa dabarsa dhiigaa tasaa qindeessuu danda\'u.',
    keyPoints: [
      'Hospitaalota ollaa fi wiirtuuwwan dhiigaa dhihoo jiran argadhaa',
      'Kuusaa walsimu yeroo qabatamaatti argachuuf gosa dhiigaan calalaa',
      'Dabarsa hospitaalaa-gara-hospitaalaaf bilbila kallattii argadhaa',
    ],
  },
  {
    id: 'faq-7',
    category: 'requests',
    categoryLabel: 'Gaaffilee Dhiigaa',
    question: 'Gaaffii dhiigaa hospitaalaa akkamitti uumee to\'adha?',
    answer:
      'Gara "Dhiiga Gaafadhu" yookiin "Gaaffii Hunduu" jedhuutti dabraa. Gosa dhiigaa barbaadamu, baay\'ina yuunitii, ariifachiisummaa yaalaa (Tasaa, Ariifachiisaa, yookiin Idilee), fi kutaa hospitaalaa ibsaa. Erga ergamee booda gaaffiin keessan hojiirra oola. Fudhatama arjoomtootaa hordofuu, deebii wiirtuu dhiigaa hordofuu, fi yuunitiin barbaaddan yeroo guutamu gaaffii cufuu dandeessu.',
    keyPoints: [
      'Sadarkaa ariifachiisummaa, gosa dhiigaa, yuunitii barbaadamu, fi kutaa dhukkubsataa filadhaa',
      'Gaaffilee Hunduu jalatti battalumatti hordofama',
      'Yuunitiin dhiigaa ga\'aan yoo argame gaaffii cufaa yookiin xumuraa',
    ],
  },
  {
    id: 'faq-8',
    category: 'requests',
    categoryLabel: 'Gaaffilee Dhiigaa',
    question: 'Gaaffiin arjoomaa arjoomtoota galmaa\'an fi wiirtuuwwan dhiigaa akkamitti qaqqaba?',
    answer:
      'Yeroo gaaffiin tasaa maxxanfamu, Legaashiin fageenya lafaa, walsimsiisa ABO/Rh, fi yeroo boqonnaa guyyoota 90 irratti hundaa\'uun arjoomtoota ga\'umsa qaban walitti fida. Arjoomtoonni ga\'umsa qaban mobaayila isaanii irratti beeksisa battalaa argatu. Yeroo walfakkaatutti, wiirtuuwwan dhiigaa naannoo dhiiga jiru erguuf beeksisa gaaffii argatu.',
    keyPoints: [
      'Walitti-fiduun bakka arjoomaa, walsimsiisa dhiigaa, fi boqonnaa guyyaa 90 hammata',
      'Beeksisni kallattii arjoomtoota mobaayila walsimaniif ni ergama',
      'Wiirtuuwwan dhiigaa gaaffilee hospitaalaa dhiyaatan daashboordii isaanii irratti argu',
    ],
  },
  {
    id: 'faq-9',
    category: 'requests',
    categoryLabel: 'Gaaffilee & Arjoomtoota',
    question: 'Arjoomtoota gaaffii keenya fudhatan eessatti gamaaggamuu danda\'a?',
    answer:
      '"Gaaffilee Hunduu" keessatti gaaffii keessan kan hojiirra jiru cuqaasaa. Gabateen deebii arjoomtoota mobaayila isaanii irratti "Fudhadhu" jedhan hunda agarsiisa. Gareen qorannoo dhiigaa keessan simannaa akka qopheessuuf ID arjoomaa/maqaa, lakkoofsa bilbilaa, fi yeroo fudhatame ni argitu.',
    keyPoints: [
      'Tarree arjoomtoota dhiiga arjoomuuf waadaa galan battalatti mul\'atu',
      'Yeroo isaan dhufan mirkaneeffachuuf odeeffannoon qunnamtii ni dhiyaata',
      'Arjoomaan yoo gahu gara Galmee Yaalaatti salphaatti dabra',
    ],
  },
  {
    id: 'faq-10',
    category: 'records',
    categoryLabel: 'Galmee Yaalaa & Bu\'aawwan',
    question: 'Arjooma milkaa\'e akkamitti galmeessa yookiin arjoomaan "Hin Arjoomne" akkamitti qabama?',
    answer:
      '"Galmee Yaalaa" jalatti kutaa "Eegaa Jira" jedhu keessatti arjoomaa dhufe barbaadaa. Yoo qorannoon yaalaa darbee fi dhiigni milkaa\'inaan fudhatame "Arjooma Mirkaneessi" tuqaa — kun yuunitii sassaabame galmeessa, qabeenya dhiigaa keessan ofumaan dabala, fi koodii boqonnaa guyyaa 90 arjoomaa deebisee eegala. Yoo arjoomaan ga\'umsa hin qabaanne, dhukkubsate, yookiin hin dhufne qabeenya dhiigaa sobaan osoo hin dabalin herrega cufuuf "Hin Arjoomne" filadhaa.',
    keyPoints: [
      'Arjooma Mirkaneessi: Fudhannaa galmeessa, qabeenya dabala, boqonnaa eegala',
      'Hin Arjoomne: Qabeenya dhiigaa osoo hin jijjiirin galmee amanamummaadhaan cufa',
      'Garaagarummaa qabeenyaa ittisa; galmee qorannoo yaalaa sirrii ta\'e eega',
    ],
  },
  {
    id: 'faq-11',
    category: 'records',
    categoryLabel: 'Galmee Yaalaa & Bu\'aawwan',
    question: 'Galmeewwan arjoomaa darban fi mirkaneessa eegaa jiran eessatti ilaala?',
    answer:
      'Fuulli "Galmee Yaalaa" bakka lamatti qoodama:\n• Kutaa "Eegaa Jira": Arjoomtoota gaaffii fudhatanii amma eegamaa jiran yookiin dhiiga kennutti jiran agarsiisa.\n• Kutaa "Xumurame": Galmee yaalaa arjooma xumuramee dhaabbataa, maqaa arjoomaa, yuunitii fudhatame, yeroo xumurame, fi yaadannoo ogeeyyii dabalatee kuusa.',
    keyPoints: [
      'Kutaan eegaa jiru namoota dhufanii mirkaneessa eegan hordofa',
      'Kutaan xumurame arjoomawwan mirkanaa\'an seenaa guutuu wajjin kuusa',
      'Gumaacha yaalaa darbe yeroo kamiyyuu qorachuun yookiin erguun ni danda\'ama',
    ],
  },
  {
    id: 'faq-12',
    category: 'general',
    categoryLabel: 'Duula Arjooma Dhiigaa & Sagantaalee',
    question: 'Duulli arjooma dhiigaa fi sagantaaleen Legaash irratti akkamitti to\'atamu?',
    answer:
      'Wiirtuuwwan Dhiigaa Naannoo fi Bulchitoonni duula dhiiga sassaabuu mobaayilaa fi duula arjooma uummataa appilikeeshinii arjoomtootaa irratti mul\'atu qopheessu. Hospitaalonni duula arjooma hawaasaa, baabura arjooma dhiigaa fi tattaaffii dhiyeessii tasaa irratti wiirtuuwwan naannoo wajjin "Gaaffilee Wiirtuu" yookiin qunnamtii kallattiin walta\'iinsa uumuu danda\'u.',
    keyPoints: [
      'Sagantaaleen arjooma hawaasaa Wiirtuuwwan Dhiigaa Naannootiin maxxanfamu',
      'Arjoomtoonni duulawwan hojiirra jiran kallattiin bilbila isaanii irratti argu',
      'Hospitaalonni deeggarsa mobaayilaatiif wiirtuuwwan dhiigaa wajjin walta\'uu danda\'u',
    ],
  },
  {
    id: 'faq-13',
    category: 'account',
    categoryLabel: 'Nageenya & Beeksisa',
    question: 'Nageenya herrega hospitaalaa fi jijjiirama jecha icciitii akkamitti to\'adha?',
    answer:
      'Gara "Piroofayilii" deemaatii gara kutaa "Nageenya" jedhutti gadi bu\'aa. Jecha icciitii ammaa fi jecha icciitii haaraa galchuun jecha icciitii herrega hospitaala keessanii haaromsuu dandeessu. Yoo ragaa seeninsaa irraanfattan, e-meelii galmaa\'e irratti hidhaa mirkaneeffame argachuuf "Jecha Icciitii Irraanfadhe" kan jedhu tuqaa.',
    keyPoints: [
      'Fuula Piroofayilii Hospitaalaa irratti jecha icciitii ofiin jijjiiraa',
      'E-meelii galmaa\'een jecha icciitii nageenyaan deebisanii dhaabuu',
      'Nageenyaaf jecha yeroo baatan heeyyamni baname ofumaan ni cufama',
    ],
  },
  {
    id: 'faq-14',
    category: 'general',
    categoryLabel: 'Furmaata Rakkoolee & Deeggarsa',
    question: 'Yoo deebiin arjoomtootaa suuta ta\'e yookiin ragaan wal hin simne maalan godha?',
    answer:
      'Gosa dhiigaa qaalii ta\'eef (kan akka AB- yookiin O-) deebiin arjoomtootaa yoo suuta ta\'e, baankii dhiigaa naannootti erguuf battalumatti "Gaaffilee Wiirtuu" ilaalaa, yookiin dhaabbilee dhiiga dabalataa qaban qunnamuuf "Barbaaduu Hospitaalaa" fayyadamaa. Yoo lakkoofsi fuula irraa wal hin simne fuula haaromsaa — sirreeffamni qabeenyaa fi galmee hundi walsimsiisa sarvarii battalaatiin kan deeggarameedha.',
    keyPoints: [
      'Hanqina cimaa Gaaffilee Wiirtuutiin gara Wiirtuuwwan Dhiigaa Naannootti ol gurguraa',
      'Dhaabbilee ollaa dhiiga walsimu qaban argachuuf Barbaaduu Hospitaalaa fayyadamaa',
      'Dhimma dhaabbataa ariifachiisaadhaaf deeggarsa bulchiinsa Legaash qunnamaa',
    ],
  },
];

export const HospitalFaqPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['faq-1', 'faq-4', 'faq-10'])
  );

  const currentLang = i18n.language === 'am' ? 'am' : i18n.language === 'om' ? 'om' : 'en';

  const faqs = useMemo(() => {
    if (currentLang === 'am') return HOSPITAL_FAQS_AM;
    if (currentLang === 'om') return HOSPITAL_FAQS_OM;
    return HOSPITAL_FAQS_EN;
  }, [currentLang]);

  const categoryOptions = useMemo(() => {
    if (currentLang === 'am') {
      return [
        { id: 'all', label: 'ሁሉም ጥያቄዎች' },
        { id: 'account', label: 'መለያ እና ማረጋገጫ' },
        { id: 'stock', label: 'ክምችት እና ተኳሃኝነት' },
        { id: 'requests', label: 'ጥያቄዎች እና ማዛመድ' },
        { id: 'records', label: 'ምርመራ እና የህክምና መዝገቦች' },
        { id: 'general', label: 'ክስተቶች እና ድጋፍ' },
      ];
    }
    if (currentLang === 'om') {
      return [
        { id: 'all', label: 'Gaaffilee Hundumaa' },
        { id: 'account', label: 'Herrega & Mirkaneessa' },
        { id: 'stock', label: 'Qabeenya & Walsimsiisa' },
        { id: 'requests', label: 'Gaaffilee & Walitti-fiduu' },
        { id: 'records', label: 'Qorannoo & Galmee Yaalaa' },
        { id: 'general', label: 'Sagantaalee & Deeggarsa' },
      ];
    }
    return [
      { id: 'all', label: 'All Questions' },
      { id: 'account', label: 'Account & Verification' },
      { id: 'stock', label: 'Stock & Compatibility' },
      { id: 'requests', label: 'Requests & Matching' },
      { id: 'records', label: 'Triage & Medical Records' },
      { id: 'general', label: 'Events & Support' },
    ];
  }, [currentLang]);

  const uiText = useMemo(() => {
    if (currentLang === 'am') {
      return {
        badge: 'የሆስፒታል እርዳታ እና እውቀት ማዕከል',
        title: 'የሆስፒታል ተደጋጋሚ ጥያቄዎች',
        subtitle:
          'የጤና ባለሙያዎች የደም ክምችትን፣ የአደጋ ጊዜ የለጋሾች ጥያቄዎችን፣ የልገሳ ማረጋገጫዎችን እና የሆስፒታል ደህንነትን በለጋሽ ላይ እንዲያስተዳድሩ የሚያግዝ መመሪያ።',
        backToDashboard: 'ወደ ዳሽቦርድ ተመለስ',
        searchPlaceholder: 'የሆስፒታል አሰራሮችን፣ የክምችት ደንቦችን፣ የለጋሾች ምርመራን ፈልግ...',
        expandAll: 'ሁሉንም ዘርጋ',
        collapseAll: 'ሁሉንም አጠቃልል',
        noMatching: 'ምንም ተዛማጅ ጥያቄዎች አልተገኙም',
        noMatchingDesc: (q: string) => `ከ "${q}" ጋር የሚዛመድ ምንም ጥያቄ ማግኘት አልቻልንም። የተለየ ቃል ይሞክሩ ወይም ማጣሪያዎችን ያጽዱ።`,
        clearFilters: 'ማጣሪያዎችን አጽዳ',
        guidelinesHeader: 'ዋና ዋና የሆስፒታል መመሪያዎች፦',
        stillQuestions: 'ተጨማሪ ጥያቄዎች አሉዎት?',
        stillQuestionsDesc:
          'ሌላ ማንኛውም ጥያቄ ካለዎት admin@legash.com ላይ ይጠይቁ። ቡድናችን የህክምና ተቋምዎን ለመርዳት ዝግጁ ነው።',
      };
    }
    if (currentLang === 'om') {
      return {
        badge: 'Gargaarsa Hospitaalaa & Wiirtuu Beekumsaa',
        title: 'Gaaffilee Yeroo Baay\'ee Gaafataman',
        subtitle:
          'Qajeelfama ogeeyyii fayyaa qabeenya dhiigaa, gaaffilee arjoomtoota ariifachiisaa, mirkaneessa arjoomaa fi nageenya hospitaalaa Legaash irratti to\'achuuf gargaaru.',
        backToDashboard: 'Gara Dashboordiitti Deebi\'i',
        searchPlaceholder: 'Hojimaata hospitaalaa, seerota qabeenya dhiigaa, qorannoo arjoomtootaa barbaadi...',
        expandAll: 'Hunda Diriirsi',
        collapseAll: 'Hunda Konyi',
        noMatching: 'Gaaffiin walsimu hin argamne',
        noMatchingDesc: (q: string) => `Gaaffii "${q}" wajjin walsimu argachuu hin dandeenye. Jecha biraa yaalaa yookiin calaltuuwwan qulqulleessaa.`,
        clearFilters: 'Calaltuuwwan Haqii',
        guidelinesHeader: 'Qajeelfamoota Ijoo Hospitaalaa:',
        stillQuestions: 'Ammas gaaffii qabduu?',
        stillQuestionsDesc:
          'Gaaffii biraa yoo qabaattan admin@legash.com irratti gaafadhaa. Gareen keenya dhaabbata yaalaa keessan gargaaruuf qophiidha.',
      };
    }
    return {
      badge: 'Hospital Help & Knowledge Base',
      title: 'Hospital Frequently Asked Questions',
      subtitle:
        'Guidance for healthcare staff on managing blood inventory, emergency donor requests, phlebotomy confirmations, and hospital security on Legash.',
      backToDashboard: 'Back to Dashboard',
      searchPlaceholder: 'Search hospital workflows, stock rules, donor triage...',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
      noMatching: 'No matching questions found',
      noMatchingDesc: (q: string) => `We couldn't find any questions matching "${q}". Try a different keyword or reset category filters.`,
      clearFilters: 'Clear Filters',
      guidelinesHeader: 'Key Hospital Guidelines:',
      stillQuestions: 'Still have questions?',
      stillQuestionsDesc:
        'If you have any other questions, ask here at admin@legash.com. Our team is available to assist your healthcare facility.',
    };
  }, [currentLang]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(faqs.map((f) => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.categoryLabel.toLowerCase().includes(query) ||
        (faq.keyPoints &&
          faq.keyPoints.some((pt) => pt.toLowerCase().includes(query)));
      return matchesCategory && matchesSearch;
    });
  }, [faqs, searchQuery, selectedCategory]);

  return (
    <DashboardLayout icon={<HelpCircle size={16} className="stroke-[1.75]" />}>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-line-soft gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-crimson/10 text-crimson">
                {uiText.badge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">
              {uiText.title}
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1 max-w-2xl">
              {uiText.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <Link
              to="/hospital/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl text-xs font-sans font-semibold transition-colors"
            >
              <span>{uiText.backToDashboard}</span>
            </Link>
          </div>
        </div>

        {/* Quick Search & Filter Controls */}
        <div className="bg-white border border-line-soft rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={uiText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-paper border border-line-soft rounded-xl text-sm font-sans text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-sans">
              <button
                type="button"
                onClick={expandAll}
                className="px-3 py-2 text-ink-soft hover:text-ink hover:bg-paper rounded-lg transition-colors border border-transparent hover:border-line-soft"
              >
                {uiText.expandAll}
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-3 py-2 text-ink-soft hover:text-ink hover:bg-paper rounded-lg transition-colors border border-transparent hover:border-line-soft"
              >
                {uiText.collapseAll}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-line-soft/60">
            {categoryOptions.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-crimson text-white shadow-xs'
                    : 'bg-paper text-ink-soft hover:bg-paper-dim border border-line-soft'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-line-soft rounded-2xl p-8 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="font-serif font-bold text-ink">{uiText.noMatching}</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                {uiText.noMatchingDesc(searchQuery)}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-crimson text-white text-xs font-semibold rounded-xl hover:bg-crimson-dark transition-colors"
              >
                {uiText.clearFilters}
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedIds.has(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`bg-white border transition-all duration-200 rounded-2xl overflow-hidden ${
                    isExpanded
                      ? 'border-crimson/30 shadow-sm'
                      : 'border-line-soft hover:border-line-soft/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 focus:outline-none transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-crimson bg-crimson/10 px-2 py-0.5 rounded">
                          {faq.categoryLabel}
                        </span>
                        <span className="text-xs font-mono text-ink-soft/60">
                          #{index + 1}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-serif font-bold text-ink leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <div
                      className={`p-1.5 rounded-lg border transition-colors shrink-0 mt-0.5 ${
                        isExpanded
                          ? 'bg-crimson/10 border-crimson/20 text-crimson'
                          : 'bg-paper border-line-soft text-ink-soft'
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 stroke-[2]" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-line-soft/60 space-y-3.5">
                      <div className="text-xs sm:text-sm text-ink-soft leading-relaxed whitespace-pre-line font-sans">
                        {faq.answer}
                      </div>

                      {faq.keyPoints && faq.keyPoints.length > 0 && (
                        <div className="bg-paper border border-line-soft rounded-xl p-3 sm:p-4 space-y-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                            {uiText.guidelinesHeader}
                          </span>
                          <ul className="space-y-1.5">
                            {faq.keyPoints.map((pt, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs font-sans text-ink"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-crimson shrink-0 mt-1.5" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Hospital Contact Support Footer */}
        <div className="bg-gradient-to-br from-paper to-paper-dim border border-line-soft rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif font-bold text-ink text-base sm:text-lg">
              {uiText.stillQuestions}
            </h3>
            <p className="text-xs sm:text-sm text-ink-soft max-w-xl">
              {currentLang === 'am' ? (
                <>
                  ሌላ ማንኛውም ጥያቄ ካለዎት{' '}
                  <a
                    href="mailto:admin@legash.com"
                    className="font-semibold text-crimson hover:underline"
                  >
                    admin@legash.com
                  </a>{' '}
                  ላይ ይጠይቁ። ቡድናችን የህክምና ተቋምዎን ለመርዳት ዝግጁ ነው።
                </>
              ) : currentLang === 'om' ? (
                <>
                  Gaaffii biraa yoo qabaattan{' '}
                  <a
                    href="mailto:admin@legash.com"
                    className="font-semibold text-crimson hover:underline"
                  >
                    admin@legash.com
                  </a>{' '}
                  irratti gaafadhaa. Gareen keenya dhaabbata yaalaa keessan gargaaruuf qophiidha.
                </>
              ) : (
                <>
                  If you have any other questions, ask here at{' '}
                  <a
                    href="mailto:admin@legash.com"
                    className="font-semibold text-crimson hover:underline"
                  >
                    admin@legash.com
                  </a>
                  . Our team is available to assist your healthcare facility.
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="mailto:admin@legash.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-xs"
            >
              <Mail className="w-4 h-4" />
              <span>admin@legash.com</span>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HospitalFaqPage;
