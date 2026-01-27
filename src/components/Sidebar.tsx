import { topics, quickQuestions } from "@/lib/gujaratiAI";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicClick: (topic: string) => void;
  onQuestionClick: (question: string) => void;
}

const Sidebar = ({ isOpen, onClose, onTopicClick, onQuestionClick }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-72 transform bg-sidebar pt-16 shadow-xl transition-transform duration-300 ease-in-out
          md:relative md:z-0 md:translate-x-0 md:pt-0 md:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Mobile close button */}
          <div className="flex items-center justify-between border-b border-sidebar-border p-4 md:hidden">
            <span className="font-semibold text-sidebar-foreground">મેનૂ</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {/* Topics Section */}
            <div className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                સામાન્ય વિષયો
              </h2>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      onTopicClick(`${topic.label} વિશે મને જણાવો`);
                      onClose();
                    }}
                    className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-card p-3 text-left transition-all hover:border-primary/20 hover:bg-secondary hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl transition-transform group-hover:scale-110">
                      {topic.icon}
                    </span>
                    <div>
                      <span className="block font-medium text-card-foreground">
                        {topic.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {topic.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Questions Section */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                💡 ઝડપી પ્રશ્નો
              </h2>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onQuestionClick(question);
                      onClose();
                    }}
                    className="w-full rounded-lg border border-border bg-card p-3 text-left text-sm transition-all hover:border-primary/30 hover:bg-secondary hover:shadow-sm"
                  >
                    <span className="text-card-foreground">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <p className="text-center text-xs text-muted-foreground">
              🇮🇳 ગુજરાતીમાં શિક્ષણ
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
