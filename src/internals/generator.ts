import { blockComment, slashesComment } from "./utils/comments";
import { forNonNullValueOf } from "./utils/checks";
import {
  expandLocalizeableTag,
  expandTag,
  expandObjectPresentedTag,
  expandMultiObjectPresentedTag,
  expandMultiTag,
  expandConditionalTag,
} from "./expanders";
import {
  PopulatedGeneratorOptions,
  populateDefaultOptions,
  generatorDefaults,
  CommentStyle,
} from "./generatorFactory";
import type { UserScriptMeta } from "./userScriptMeta";
import { toSignature, descriptorToUrl } from "./converters";

const userScriptBlock = {
  start: "==UserScript==",
  end: "==/UserScript==",
} as const;

/**
 * Generates a UserScript metadata block using provided object.
 *
 * @param meta Metadata of the script.
 * @param opts Options for the generator.
 * @returns Returns the UserScript metadata block for a script.
 */
export function generate(
  meta: UserScriptMeta,
  opts: PopulatedGeneratorOptions,
) {
  opts ??= populateDefaultOptions();

  const lines: string[] = [];

  const blockify = opts.includeBlock ?? generatorDefaults.includeBlock;

  if (blockify) lines.push(userScriptBlock.start);

  expandLocalizeableTag("name", meta.name, lines);

  forNonNullValueOf(meta.description, (value) => {
    expandLocalizeableTag("description", value, lines);
  });

  expandTag("version", meta.version, lines);

  expandObjectPresentedTag("author", meta.author, toSignature, lines);

  forNonNullValueOf(meta.contributors, (value) => {
    expandMultiObjectPresentedTag("contributor", value, toSignature, lines);
  });

  forNonNullValueOf(meta.namespace, (value) => {
    expandTag("namespace", value, lines);
  });

  forNonNullValueOf(meta.homepage, (value) => {
    expandTag("homepageURL", value, lines);
  });

  forNonNullValueOf(meta.license, (value) => {
    expandTag("license", value, lines);
  });

  forNonNullValueOf(meta.icon, (icon) => {
    expandObjectPresentedTag(
      "icon",
      icon,
      (icon, _, lines) => {
        forNonNullValueOf(icon.larger, (value) =>
          expandTag("icon64", value, lines),
        );

        forNonNullValueOf(icon.small, (value) =>
          expandTag("icon", value, lines),
        );
      },
      lines,
      { stringsBehavior: "disallow" },
    );
  });

  forNonNullValueOf(meta.updateUrl, (value) => {
    expandTag("updateURL", value, lines);
  });

  forNonNullValueOf(meta.downloadUrl, (value) => {
    expandTag("downloadURL", value, lines);
  });

  forNonNullValueOf(meta.supportUrl, (value) => {
    expandTag("supportURL", value, lines);
  });

  forNonNullValueOf(meta.include, (value) => {
    expandMultiObjectPresentedTag("include", value, String, lines);
  });

  forNonNullValueOf(meta.match, (value) => {
    expandMultiTag("match", value, lines);
  });

  forNonNullValueOf(meta.exclude, (value) => {
    expandMultiObjectPresentedTag("exclude", value, String, lines);
  });

  forNonNullValueOf(meta.connect, (value) => {
    expandMultiTag("connect", value, lines);
  });

  forNonNullValueOf(meta.runAt, (value) => {
    expandTag("run-at", value, lines);
  });

  forNonNullValueOf(meta.grant, (value) => {
    expandMultiTag("grant", value, lines);
  });

  forNonNullValueOf(meta.antiFeatures, (value) => {
    expandMultiObjectPresentedTag("antifeature", value, ([type, reason]) => {
      expandLocalizeableTag("antifeature", reason, lines, {
        transformTranslation: (translation) => `${type} ${translation}`,
      });
    });
  });

  forNonNullValueOf(meta.noFrames, (value) => {
    expandConditionalTag("noframes", value, lines);
  });

  forNonNullValueOf(meta.noCompat, (value) => {
    expandMultiTag("nocompat", value, lines);
  });

  forNonNullValueOf(meta.injectInto, (value) => {
    expandTag("inject-into", value, lines);
  });

  forNonNullValueOf(meta.require, (value) => {
    expandMultiObjectPresentedTag(
      "require",
      value,
      (descriptor) => descriptorToUrl(descriptor, opts),
      lines,
    );
  });

  forNonNullValueOf(meta.resources, (value) => {
    expandMultiObjectPresentedTag(
      "resource",
      value,
      (descriptor) => `${descriptor.id} ${descriptorToUrl(descriptor, opts)}`,
      lines,
    );
  });

  forNonNullValueOf(meta.customTags, (value) => {
    for (const tagName in value) {
      if (!Object.prototype.hasOwnProperty.call(value, tagName)) continue;

      const val = value[tagName];

      expandTag(tagName, val, lines);
    }
  });

  if (blockify) lines.push(userScriptBlock.end);

  const commentType = opts?.commentStyle ?? generatorDefaults.commentStyle;

  switch (commentType) {
    case CommentStyle.Block:
      return blockComment(lines);
    case CommentStyle.Slashes:
      return slashesComment(lines);
    default:
    case CommentStyle.None:
      return lines.join("\n");
  }
}

export type Generator = (meta: UserScriptMeta) => string;
