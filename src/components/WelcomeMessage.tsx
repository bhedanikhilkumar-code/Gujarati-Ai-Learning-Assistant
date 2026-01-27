import { Sparkles, BookOpen, GraduationCap, MessageCircle } from "lucide-react";

const WelcomeMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center animate-fade-in">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl gradient-header shadow-glow">
        <GraduationCap className="h-10 w-10 text-primary-foreground" />
      </div>
      
      <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
        નમસ્તે! 🙏
      </h2>
      
      <p className="mb-8 max-w-md text-muted-foreground">
        હું તમારો AI શિક્ષણ સહાયક છું। ગણિત, વિજ્ઞાન, ઇતિહાસ, ગુજરાતી - કોઈપણ વિષય વિશે પૂછો!
      </p>

      <div className="grid w-full max-w-lg gap-4 md:grid-cols-2">
        <FeatureCard
          icon={<BookOpen className="h-5 w-5" />}
          title="વિષય મદદ"
          description="ગણિત, વિજ્ઞાન, ઇતિહાસ વગેરે"
        />
        <FeatureCard
          icon={<Sparkles className="h-5 w-5" />}
          title="સરળ સમજૂતી"
          description="મુશ્કેલ વિષયો સરળ શબ્દોમાં"
        />
        <FeatureCard
          icon={<MessageCircle className="h-5 w-5" />}
          title="ગુજરાતીમાં જવાબ"
          description="તમારી ભાષામાં શિક્ષણ"
        />
        <FeatureCard
          icon={<GraduationCap className="h-5 w-5" />}
          title="24/7 ઉપલબ્ધ"
          description="ગમે ત્યારે, ગમે ત્યાં"
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="glass rounded-xl p-4 text-left transition-all hover:shadow-lg">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default WelcomeMessage;
