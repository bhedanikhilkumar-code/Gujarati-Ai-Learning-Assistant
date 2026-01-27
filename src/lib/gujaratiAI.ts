// Gujarati AI Response Simulator
// This simulates AI responses for educational topics in Gujarati

interface TopicResponse {
  topic: string;
  responses: string[];
}

const mathResponses: TopicResponse = {
  topic: "ગણિત",
  responses: [
    "ગણિત એ વિજ્ઞાનની ભાષા છે! 🧮 ચાલો હું તમને સમજાવું...",
    "આ એક રસપ્રદ ગણિત પ્રશ્ન છે। જુઓ, જ્યારે આપણે સંખ્યાઓ સાથે કામ કરીએ છીએ...",
    "ગણિતમાં સૂત્રો ખૂબ મહત્વપૂર્ણ છે। ઉદાહરણ તરીકે, a² + b² = c² એ પાયથાગોરસનું પ્રમેય છે।",
  ]
};

const scienceResponses: TopicResponse = {
  topic: "વિજ્ઞાન",
  responses: [
    "વિજ્ઞાન આપણી આસપાસની દુનિયાને સમજવામાં મદદ કરે છે! 🔬",
    "પ્રકૃતિમાં દરેક વસ્તુ વૈજ્ઞાનિક સિદ્ધાંતો પર આધારિત છે।",
    "ન્યૂટનના ગતિના નિયમો: પ્રથમ નિયમ - જડત્વનો નિયમ, દ્વિતીય નિયમ - F = ma, તૃતીય નિયમ - ક્રિયા અને પ્રતિક્રિયા।",
  ]
};

const historyResponses: TopicResponse = {
  topic: "ઇતિહાસ",
  responses: [
    "ભારતનો ઇતિહાસ ખૂબ સમૃદ્ધ છે! 📜 સિંધુ ખીણ સંસ્કૃતિથી લઈને આધુનિક યુગ સુધી...",
    "મહાત્મા ગાંધીજીએ અહિંસાના માર્ગે ભારતને આઝાદી અપાવી।",
    "ગુજરાતનો ઇતિહાસ: સોમનાથ મંદિર, લોથલ, અને મોઢેરાનું સૂર્યમંદિર - આ બધા ગુજરાતની સમૃદ્ધ વારસાના પ્રતીક છે।",
  ]
};

const gujaratiResponses: TopicResponse = {
  topic: "ગુજરાતી ભાષા",
  responses: [
    "ગુજરાતી ભાષા ખૂબ સુંદર અને સમૃદ્ધ છે! 📚 તેમાં ૪૭ અક્ષરો છે।",
    "ગુજરાતી સાહિત્યમાં નરસિંહ મહેતા, મીરાંબાઈ, અને ગાંધીજી જેવા મહાન લેખકો છે।",
    "વ્યાકરણ: સંજ્ઞા, સર્વનામ, ક્રિયાપદ, વિશેષણ - આ ગુજરાતી વ્યાકરણના મુખ્ય ભાગો છે।",
  ]
};

const generalResponses: string[] = [
  "નમસ્તે! 🙏 હું તમારો AI શિક્ષણ સહાયક છું। તમે મને કોઈપણ વિષય વિશે પૂછી શકો છો।",
  "ખૂબ સરસ પ્રશ્ન! ચાલો આપણે આ વિષય પર વધુ ઊંડાણમાં જઈએ...",
  "શિક્ષણ એ જીવનભરની યાત્રા છે। દરેક પ્રશ્ન તમને નવું જ્ઞાન આપે છે! ✨",
];

const simplifyPhrases: string[] = [
  "🎯 સરળ શબ્દોમાં: ",
  "📝 મુખ્ય મુદ્દાઓ: ",
  "💡 સરળ સમજૂતી: ",
];

const translatePhrases: string[] = [
  "🌐 અંગ્રેજીમાં: ",
  "📖 Translation: ",
];

export const getAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for math-related keywords
  if (lowerMessage.includes('ગણિત') || lowerMessage.includes('સંખ્યા') || 
      lowerMessage.includes('math') || lowerMessage.includes('બેરાક') ||
      lowerMessage.includes('ગુણાકાર') || lowerMessage.includes('ભાગાકાર')) {
    return mathResponses.responses[Math.floor(Math.random() * mathResponses.responses.length)];
  }
  
  // Check for science-related keywords
  if (lowerMessage.includes('વિજ્ઞાન') || lowerMessage.includes('science') ||
      lowerMessage.includes('ભૌતિક') || lowerMessage.includes('રસાયણ') ||
      lowerMessage.includes('જીવવિજ્ઞાન')) {
    return scienceResponses.responses[Math.floor(Math.random() * scienceResponses.responses.length)];
  }
  
  // Check for history-related keywords
  if (lowerMessage.includes('ઇતિહાસ') || lowerMessage.includes('history') ||
      lowerMessage.includes('ભારત') || lowerMessage.includes('ગુજરાત')) {
    return historyResponses.responses[Math.floor(Math.random() * historyResponses.responses.length)];
  }
  
  // Check for Gujarati language-related keywords
  if (lowerMessage.includes('ભાષા') || lowerMessage.includes('વ્યાકરણ') ||
      lowerMessage.includes('સાહિત્ય') || lowerMessage.includes('અક્ષર')) {
    return gujaratiResponses.responses[Math.floor(Math.random() * gujaratiResponses.responses.length)];
  }
  
  // Default response
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

export const getSimplifiedResponse = (text: string): string => {
  const prefix = simplifyPhrases[Math.floor(Math.random() * simplifyPhrases.length)];
  
  // Simulate simplification
  const simplifications: Record<string, string> = {
    "ગણિત": "ગણિત એટલે સંખ્યાઓ અને આકારો સાથે રમત! 1+1=2 જેવું સરળ!",
    "વિજ્ઞાન": "વિજ્ઞાન એટલે 'કેમ?' અને 'શું?' ના જવાબો શોધવા!",
    "ઇતિહાસ": "ઇતિહાસ એટલે જૂના સમયની વાર્તાઓ!",
    "default": "આ મુદ્દાને સરળ શબ્દોમાં સમજીએ: દરેક મોટી વાત નાની-નાની વાતોથી બને છે।"
  };
  
  for (const [key, value] of Object.entries(simplifications)) {
    if (text.includes(key)) {
      return prefix + value;
    }
  }
  
  return prefix + simplifications.default;
};

export const getTranslatedResponse = (text: string): string => {
  const prefix = translatePhrases[Math.floor(Math.random() * translatePhrases.length)];
  
  // Simulate translation (mock)
  const translations: Record<string, string> = {
    "નમસ્તે": "Hello / Greetings",
    "ગણિત": "Mathematics - The study of numbers, shapes, and patterns",
    "વિજ્ઞાન": "Science - The systematic study of the natural world",
    "ઇતિહાસ": "History - The study of past events",
    "ગુજરાતી": "Gujarati - An Indo-Aryan language native to Gujarat, India",
    "default": "This is an educational response about the topic you asked about."
  };
  
  for (const [key, value] of Object.entries(translations)) {
    if (text.includes(key)) {
      return prefix + value;
    }
  }
  
  return prefix + translations.default;
};

export const topics = [
  { id: 'math', label: 'ગણિત', icon: '🧮', description: 'સંખ્યાઓ અને ગણતરી' },
  { id: 'science', label: 'વિજ્ઞાન', icon: '🔬', description: 'પ્રકૃતિનો અભ્યાસ' },
  { id: 'history', label: 'ઇતિહાસ', icon: '📜', description: 'ભૂતકાળની વાતો' },
  { id: 'gujarati', label: 'ગુજરાતી ભાષા', icon: '📚', description: 'વ્યાકરણ અને સાહિત્ય' },
  { id: 'geography', label: 'ભૂગોળ', icon: '🌍', description: 'પૃથ્વીનો અભ્યાસ' },
  { id: 'english', label: 'અંગ્રેજી', icon: '🔤', description: 'English Language' },
];

export const quickQuestions = [
  "ગણિતમાં પાયથાગોરસનું પ્રમેય શું છે?",
  "પ્રકાશસંશ્લેષણ એટલે શું?",
  "મહાત્મા ગાંધીજી વિશે જણાવો",
  "ગુજરાતી વ્યાકરણના મુખ્ય નિયમો",
  "સૂર્યમંડળમાં કેટલા ગ્રહો છે?",
];
