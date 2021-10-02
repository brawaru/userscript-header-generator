const invalidLocaleRegExp = /^[a-zA-Z-]/i;

const canHaveExtendedLocaleChecks = (() => {
  try {
    return (
      typeof Intl === "object" &&
      (() => {
        const january = new Date(9e8);
        const russian = new Intl.DateTimeFormat("ru", { month: "long" });
        return russian.format(january) === "январь";
      })()
    );
  } catch (err) {
    return false;
  }
})();

const { supportedLocalesOf } = Intl.DateTimeFormat;

let printWarning = (...args: unknown[]) => {
  console.warn("userscript-meta-generator: ", ...args);
};

export function resolveLocaleTag(
  localeTag: string,
  useBestFit: boolean = true,
): string {
  if (canHaveExtendedLocaleChecks) {
    const supportedLocales = supportedLocalesOf(localeTag, {
      localeMatcher: "best fit",
    });

    if (supportedLocales.length === 0) {
      throw new Error(`Locale "${localeTag}" is not a valid locale.`);
    }

    const bestFit = supportedLocales[0];

    if (bestFit !== localeTag && useBestFit) {
      printWarning(`Locale "${localeTag}" has been resolved to "${bestFit}".`);

      return bestFit;
    }

    return localeTag;
  } else {
    if (invalidLocaleRegExp.test(localeTag)) {
      throw new Error(`Locale "${localeTag}" contains invalid characters.`);
    }
  }

  return localeTag;
}
