const isNamingProhibited = (node: Node) => {
  // TODO: これをやるためには HTML-AAM を実装せねばならない？
  return false;
}

const isHidden = (node: Node) => {
  if (node instanceof Element) {
    const computedStyle = getComputedStyle(node);

    return (
      node.getAttribute("aria-hidden") == "true" ||
      node.getAttribute("inert") ||
      computedStyle.display == "none" ||
      computedStyle.visibility == "hidden" ||
      computedStyle.visibility == "collapse" ||
      computedStyle.contentVisibility == "hidden"
    );
  } else {
    return false;
  }
}

const isTextAlternativeElement = (node: Node) => {
  if (node instanceof Element) {
    return node.tagName.toLowerCase() === "label";
  } else {
    return false;
  }
}

export function computeTextEquivalent(node: Node): string {
  //------------------------------------------------------------------------
  // 1. Initialization
  //------------------------------------------------------------------------
  let rootNode = node;
  let currentNode = rootNode;
  let totalAccumulatedText = "";
  if (isNamingProhibited(rootNode)) {
    return "";
  }

  let isPartOfAriaLabelledByOrAriaDescribedByTraversal = false;
  let isDueToNameFromContentDescendantNodeRecursion = false;

  //------------------------------------------------------------------------
  // 2. Computation
  //------------------------------------------------------------------------
  function compute() {
    // 2.1 hidden not referenced
    if (
      isHidden(currentNode) &&
      !isPartOfAriaLabelledByOrAriaDescribedByTraversal &&
      !isTextAlternativeElement(currentNode)
    ) {
      return "";
    }

    // 2.2  labelled by
    const ariaLabelledBy = currentNode instanceof Element
      ? currentNode.getAttribute("aria-labelledby")
      : null;
    const idRefs = ariaLabelledBy?.split(" ");
    if (
      idRefs &&
      idRefs.some((id) => document.getElementById(id)) &&
      !isPartOfAriaLabelledByOrAriaDescribedByTraversal
    ) {
      // 2.2.1
      let accumulatedText = "";

      // 2.2.2
      for (const idRef of idRefs) {
        // 2.2.2.1
        currentNode = document.getElementById(idRef)!;
        // 2.2.2.2 
        isPartOfAriaLabelledByOrAriaDescribedByTraversal = true;
        let result = compute();
        isPartOfAriaLabelledByOrAriaDescribedByTraversal = false;
        // 2.2.2.3
        accumulatedText += " ";
        accumulatedText += result;
      }

      // 2.2.3
      if (accumulatedText !== "") {
        return accumulatedText;
      }
    }

    // 2.3 embedded control
    // これマジでどうやったらいいんだ？今のノードが embed されてるかって何？
    // - 祖先に label がいるか再帰的に遡る
    // - 自分が aria-labelledby で参照されているかを逆引きする
    // この辺をやるしかない？

    // 2.4 AriaLabel
    const ariaLabel = node instanceof Element ? node.getAttribute("aria-label") : null;
    if (
      (node instanceof Element && node.tagName.toLowerCase() !== "slot") &&
      ariaLabel != null &&
      ariaLabel !== "" &&
      ariaLabel.trim() !== ""
    ) {
      if (
        isDueToNameFromContentDescendantNodeRecursion
        // and the current node is an embedded control
      ) {
        // どういう意味？
      }

      return ariaLabel;
    }

    // 2.5 Host Language Label
    if (
      // 本当は getRole を実装すべき
      !(
        currentNode instanceof Element &&
        (
          currentNode.getAttribute("role") === "none" ||
          currentNode.getAttribute("role") === "presentational"
        )
      )
    ) {
      // const alt = currentNode.tagName.toLowerCase() === "img" && currentNode.getAttribute("alt");
      // if (alt) return alt;
      // TODO: alt属性
      // TODO: label 要素
      // TODO: title 要素
    }

    // 2.6 Name From Content

    // 2.7 Text Node
    if (node instanceof Text) {
      return node.textContent;
    }

    // 2.8 Recursive Name From Content
    if (isPartOfAriaLabelledByOrAriaDescribedByTraversal) {
      // TODO
    }

    // 2.9
    // TODO

    // 2.10
    totalAccumulatedText += " ";
    // totalAccumulatedText += result;
  }

  compute();

  //------------------------------------------------------------------------
  // 3
  //------------------------------------------------------------------------
  return totalAccumulatedText;
}
