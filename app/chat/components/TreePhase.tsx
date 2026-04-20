import type { Lang, I18nText } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import PathChips from "./PathChips";

interface RecursUrgent {
  nom: string;
  telefon: string;
  disponibilitat: string;
}

interface Autoritzacio {
  slug: string;
  prioritat: number;
  nota: I18nText;
}

interface TreeNode {
  id: string;
  tipus: "questio" | "resultat";
  pregunta?: I18nText;
  missatge?: I18nText;
  opcions?: TreeOption[];
  autoritzacions?: Autoritzacio[];
  recursos_urgents?: RecursUrgent[];
  nota_legal?: I18nText;
}

interface TreeOption {
  id: string;
  text: I18nText;
  sos?: boolean;
  node: TreeNode;
}

interface TreeRoot {
  id: string;
  tipus: string;
  pregunta: I18nText;
  opcions: TreeOption[];
}

export type { TreeNode, TreeOption, TreeRoot, RecursUrgent, Autoritzacio };

export default function TreePhase({
  currentNode,
  lang,
  path,
  tree,
  transitioning,
  onOptionClick,
  onStartChat,
  onReset,
}: {
  currentNode: TreeNode;
  lang: Lang;
  path: string[];
  tree: TreeRoot;
  transitioning: boolean;
  onOptionClick: (option: TreeOption, parentNode: TreeNode) => void;
  onStartChat: () => void;
  onReset: () => void;
}) {
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

      {currentNode.tipus === "questio" && currentNode.pregunta && (
        <>
          <h2 className="text-lg font-semibold mb-4">
            {t(currentNode.pregunta, lang)}
          </h2>
          <div className="flex flex-col gap-2">
            {currentNode.opcions?.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onOptionClick(opt, currentNode)}
                className={`w-full px-4 py-3.5 text-left text-[15px] rounded-xl cursor-pointer transition-all ${
                  opt.sos
                    ? "bg-danger-light border-2 border-danger hover:bg-red-100 shadow-sm"
                    : "bg-white border border-border-light hover:border-primary hover:shadow-sm"
                }`}
              >
                {opt.sos && "🆘 "}
                {t(opt.text, lang)}
              </button>
            ))}
          </div>
        </>
      )}

      {currentNode.tipus === "resultat" && (
        <>
          <p className="text-base leading-relaxed mb-4">
            {t(currentNode.missatge, lang)}
          </p>

          {currentNode.recursos_urgents && currentNode.recursos_urgents.length > 0 && (
            <div className="bg-danger text-white p-4 rounded-lg mb-4">
              <strong className="block mb-2">
                {t(labels.emergencyResources, lang)}
              </strong>
              {currentNode.recursos_urgents.map((r, i) => (
                <div key={i} className="mt-2">
                  <strong>{r.nom}</strong>
                  <br />
                  {"📞 "}
                  <a
                    href={`tel:${r.telefon.replace(/\s/g, "")}`}
                    className="text-white underline"
                  >
                    {r.telefon}
                  </a>{" "}
                  ({r.disponibilitat})
                </div>
              ))}
            </div>
          )}

          {currentNode.autoritzacions && currentNode.autoritzacions.length > 0 && (
            <div className="mb-4">
              {currentNode.autoritzacions
                .sort((a, b) => a.prioritat - b.prioritat)
                .map((auth) => (
                  <div
                    key={auth.slug}
                    className="px-4 py-3 my-2 bg-white ltr:border-l-[3px] rtl:border-r-[3px] border-primary rounded-xl shadow-sm"
                  >
                    <strong>{auth.slug}</strong>
                    <br />
                    <span className="text-sm text-text-muted">{t(auth.nota, lang)}</span>
                  </div>
                ))}
            </div>
          )}

          {currentNode.nota_legal && (
            <p className="text-sm text-text-muted italic mb-3">
              {t(currentNode.nota_legal, lang)}
            </p>
          )}

          <button
            onClick={onStartChat}
            className="px-6 py-3.5 text-base font-semibold bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors mt-2 shadow-sm"
          >
            {t(labels.talkToAssistant, lang)}
          </button>
        </>
      )}

      {path.length > 0 && currentNode.tipus === "questio" && (
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
