import type { Maybe } from "./common/types";
import {
  assert,
  assertNotNull,
  assertNotArray,
  assertIsArray,
  assertRegExpNoMatch,
} from "./utils/assertions";
import { resolveLocaleTag } from "./utils/localeValidation";
import type { Localizeable } from "./userScriptMeta";

function isLocalizeable(obj: unknown): obj is Localizeable {
  return (
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    obj != null &&
    Reflect.get(obj, "@") != null
  );
}

/**
 * A regular expression for illegal characters in tag values.
 *
 * Currently only searches for line breaks.
 */
const invalidValueRegExp = /\n/;

/**
 * A regular expression for illegal characters in tag names.
 */
const invalidTagNameRegExp = /[^a-z0-9:\-_]/i;

/**
 * Represents tag options
 */
interface TagOptions {
  /**
   * Whether to assert for null value
   */
  checkNull?: boolean;
}

export function expandConditionalTag(
  tagName: string,
  condition: boolean,
  lines?: Maybe<string[]>,
) {
  assertRegExpNoMatch(invalidTagNameRegExp, tagName);

  lines ??= [];

  if (condition) lines.push(`@${tagName}`);

  return lines;
}

export function expandTag(
  tagName: string,
  value: string,
  lines?: Maybe<string[]>,
  tagOptions?: Maybe<TagOptions>,
) {
  assertRegExpNoMatch(invalidTagNameRegExp, tagName);

  if (tagOptions?.checkNull ?? true) {
    assertNotNull(value, 'Tag "%s" cannot contain a null value.', tagName);
  }

  assertNotArray(value, 'Tag "%s" cannot contain an array value.', tagName);

  lines ??= [];

  assertRegExpNoMatch(
    invalidValueRegExp,
    value,
    'Tag "%s" has illegal characters in its value - "%s".',
    tagName,
    value,
  );

  lines.push(`@${tagName} ${value}`);

  return lines;
}

export function expandMultiTag(
  tagName: string,
  value: string | string[],
  lines?: Maybe<string[]>,
) {
  lines ??= [];

  if (Array.isArray(value)) {
    for (const item of value) {
      expandTag(tagName, item, lines);
    }
  } else {
    expandTag(tagName, value, lines);
  }

  return lines;
}

type TransformFunction<T, R = T> = (value: T) => R;

interface LocalizeableTagOptions extends TagOptions {
  /**
   * Whether to allow multiple instances of this tag
   */
  allowMultiple?: boolean;

  /**
   * Transforms given translation
   *
   * @param translation Translation to transform
   */
  transformTranslation?: Maybe<TransformFunction<string>>;
}

function getTranslation<L extends Localizeable, K extends keyof L>(
  this: {
    tagName: string;
    values: L;
    transform?: Maybe<TransformFunction<string>>;
  },
  locale: K,
): string {
  let translation: Maybe<string> = this.values[locale];

  if (translation != null && this.transform != null)
    translation = this.transform(translation);

  assertNotNull(
    translation,
    'Translation of locale "%s" for tag "%s" is null.',
    locale,
    this.tagName,
  );

  return translation;
}

export function expandLocalizeableTag<
  Options extends Maybe<LocalizeableTagOptions>,
>(
  tagName: string,
  values: Options extends { allowMultiple: true }
    ? AllowArrayVariant<string | Localizeable>
    : string | Localizeable,
  lines?: string[],
  tagOptions?: Maybe<LocalizeableTagOptions>,
) {
  lines ??= [];

  if (tagOptions?.checkNull ?? true) {
    assertNotNull(values, 'Tag "%s" cannot contain a null value.', tagName);
  }

  const transform = tagOptions ? tagOptions.transformTranslation ?? null : null;

  if (Array.isArray(values)) {
    assert(
      tagOptions?.allowMultiple ?? false,
      'Tag "%s" cannot contain multiple values.',
      tagName,
    );

    for (const singleValue of values) {
      expandLocalizeableTag(tagName, singleValue, lines, {
        ...tagOptions,
        allowMultiple: false,
      });
    }
  } else {
    if (isLocalizeable(values)) {
      const includedLocales: string[] = [];

      const t = getTranslation.bind({ values, tagName, transform });

      expandTag(tagName, t("@"), lines);

      for (const locale of Object.keys(values)) {
        if (locale === "@") continue;

        const translation = t(locale);

        const resolvedLocale = resolveLocaleTag(locale);

        if (includedLocales.includes(resolvedLocale)) {
          throw new Error(
            `Locale "${resolvedLocale}" already been added to tag "${tagName}".`,
          );
        }

        expandTag(`${tagName}:${resolvedLocale}`, translation, lines);

        includedLocales.push(resolvedLocale);
      }
    } else {
      expandTag(tagName, values, lines);
    }
  }

  return lines;
}

interface ObjectPresentedTagOptions extends TagOptions {
  stringsBehavior?: "passthrough" | "transform" | "disallow";
}

type NonString<Type> = Type extends string ? never : Type;

export type NonArray<Type> = Type extends Array<any> ? never : Type;

type AllowArrayVariant<T> = T | T[];

type AcceptedValue<
  ElementType,
  Options extends Maybe<ObjectPresentedTagOptions>,
> = Options extends { stringsBehavior: "disallow" }
  ? NonString<ElementType> // if strings are disallowed, we never accept them
  : ElementType | string; // for any other behaviour we allow

type TransformerValue<
  ElementType,
  Options extends Maybe<ObjectPresentedTagOptions>,
> = Options extends { stringsBehavior: "transform" }
  ? ElementType | string // if strings are "transformed", allow in transformer
  : NonString<ElementType>; // otherwise the value is never passed through

type Transformer<ValueType> = (
  value: ValueType,
  tagName: string,
  lines: string[],
) => string[] | string | null | undefined | void;

export function expandObjectPresentedTag<
  ElementType,
  ValueType extends AcceptedValue<ElementType, Options>,
  Options extends Maybe<ObjectPresentedTagOptions>,
  TransformValue extends TransformerValue<ValueType, Options>,
>(
  tagName: string,
  value: AcceptedValue<ElementType, Options>,
  transformer: Transformer<TransformValue>,
  lines?: Maybe<string[]>,
  tagOptions?: Options,
) {
  lines ??= [];

  if (tagOptions?.checkNull ?? true) {
    assertNotNull(value, 'Tag "%s" cannot contain a null value.', tagName);
  }

  function transform(val: TransformValue) {
    let transformed = transformer(val, tagName, lines!);

    if (typeof transformed === "string") {
      transformed = [transformed];
    }

    if (transformed != null) {
      expandMultiTag(tagName, transformed, lines);
    }
  }

  if (typeof value === "string") {
    switch (tagOptions?.stringsBehavior ?? "passthrough") {
      case "passthrough":
        expandTag(
          tagName,
          value,
          lines,
          tagOptions ? { checkNull: tagOptions.checkNull } : null,
        );
        break;
      case "transform":
        transform(value as TransformValue);
        break;
      case "disallow":
        throw new Error(`Tag "${tagName}" does not allow string values.`);
    }
  } else {
    transform(value as TransformValue);
  }

  return lines;
}

export function expandMultiObjectPresentedTag<
  ElementType,
  ValueType extends AcceptedValue<ElementType, Options>,
  Options extends Maybe<ObjectPresentedTagOptions>,
  TransformValue extends TransformerValue<ValueType, Options>,
>(
  tagName: string,
  value: AcceptedValue<ElementType, Options>[],
  transformer: Transformer<TransformValue>,
  lines?: Maybe<string[]>,
  tagOptions?: Options,
) {
  lines ??= [];

  assertIsArray(value, 'Tag "%s" only accepts array values.', tagName);

  for (const item of value) {
    expandObjectPresentedTag(tagName, item, transformer, lines, tagOptions);
  }
}
