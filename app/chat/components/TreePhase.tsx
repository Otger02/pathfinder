import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { DecisionNode } from "@/lib/types/decision-tree";
import PathChips from "./PathChips";

export default function TreePhase({
  currentNode,
  lang,
  path,
  transitioning,
  onOptionClick,
  onStartChat,
  onReset,
}: {
  currentNode: DecisionNode;
  lang: Lang;
  path: string[];
  transitioning: boolean;
  onOptionClick: (option: DecisionNode["opts"][number], parentNode: DecisionNode) => void;
  onStartChat: () => void;
  onReset: () => void;
}) {
  const isQuestion = currentNode.type === "q";
  const isResult =
    currentNode.type === "result" ||
    currentNode.type === "block" ||
    currentNode.type === "sos1" ||
    currentNode.type === "sos2" ||
    currentNode.type === "sos3";

  return (
    <div
      className={`transition-all duration-300 ${
        transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      {path.length > 0 && (
        <div className="mb-4">
          <PathChips path={path} lang={lang} />
        </div>
      )}

      {isQuestion && (
        <>
          <h2 className="text-lg font-semibold mb-4">{currentNode.text}</h2>
          <div className="flex flex-col gap-2">
            {currentNode.opts.map((opt, i) => {
              const isSos = opt.s === "s";
              return (
                <button
                  key={`${currentNode.id}-${i}`}
                  onClick={() => onOptionClick(opt, currentNode)}
                  className={`w-full px-4 py-3.5 text-left text-[15px] rounded-xl cursor-pointer transition-all ${
                    isSos
                      ? "bg-danger-light border-2 border-danger hover:bg-red-100 shadow-sm"
                      : "bg-white border border-border-light hover:border-primary hover:shadow-sm"
                  }`}
                >
                  {isSos && "🆘 "}
                  {opt.text}
                </button>
              );
            })}
          </div>
        </>
      )}

      {isResult && (
        <>
          <p className="text-base leading-relaxed mb-4">{currentNode.text}</p>

          {currentNode.note && (
            <p className="text-sm text-text-muted italic mb-3 whitespace-pre-wrap">
              {currentNode.note}
            </p>
          )}

          {/* TODO: slugs — resoldre autoritzacions i recursos urgents des de data/catalogs.json */}

          <button
            onClick={onStartChat}
            className="px-6 py-3.5 text-base font-semibold bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors mt-2 shadow-sm"
          >
            {t(labels.talkToAssistant, lang)}
          </button>
        </>
      )}

      {path.length > 0 && isQuestion && (
        <button
          onClick={onReset}
          className="mt-4 px-3 py-1.5 text-sm text-text-muted bg-transparent border border-border rounded hover:bg-surface transition-colors"
        >
          {"← "}
          {t(labels.backToStart, lang)}
        </button>
      )}
    </div>
  );
}
