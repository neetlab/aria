import { computeName } from "./name.js";
import { computeTextEquivalent } from "./text_equivalent.js";

export const computeDescription = (element: Element): string => {
  //-------------------------------------------------------------------------
  // 1. aria-describedby
  //-------------------------------------------------------------------------
  const ariaDescribedBy = element.getAttribute("aria-describedby");
  if (ariaDescribedBy != null) {
    let ariaDescriptions: string[] = [];
    const ariaDescribedByIds = ariaDescribedBy.split(" ");
    for (const ariaDescribedById of ariaDescribedByIds) {
      const ariaDescribedByElement = document.getElementById(ariaDescribedById);
      if (ariaDescribedByElement == null) {
        throw new Error(`Invalid aria-describedby value: ${ariaDescribedById}`);
      }
      const ariaDescription = computeName(ariaDescribedByElement);
      ariaDescriptions.push(ariaDescription);
    }
    return ariaDescribedByIds.join(" ");
  }

  //-------------------------------------------------------------------------
  // 2. aria-description
  //-------------------------------------------------------------------------
  const ariaDescription = element.getAttribute("aria-description");
  if (ariaDescription != null) {
    return ariaDescription;
  }

  //-------------------------------------------------------------------------
  // 3. ホスト言語の機能
  //-------------------------------------------------------------------------
  let captionElement = element.querySelector("caption");
  if (element.tagName.toLowerCase() == "table" && captionElement != null) {
    // TODO
    // サブツリーってなんのこと？
    return computeTextEquivalent(captionElement);
  }
  if (element.tagName.toLowerCase() == "summary") {
    // TODO
  }
  if (
    element instanceof HTMLInputElement &&
    ["button", "submit", "reset"].includes(element.type)
  ) {
    // TODO
  }

  //-------------------------------------------------------------------------
  // 4. ホスト言語のツールチップ
  //-------------------------------------------------------------------------
  const titleAttribute = element.getAttribute("title");
  if (titleAttribute != null) {
    return titleAttribute;
  }

  return "";
}
