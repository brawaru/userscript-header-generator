/**
 * Represents localizeable element of the header.
 */
export type Localizeable = {
  /**
   * Source string in English.
   */
  "@": string;

  /**
   * Localizeable variant where key is locale and value is translation.
   */
  [key: string]: string | undefined;
};

/**
 * Represents a user.
 */
export interface UserDescriptor {
  /**
   * Username.
   */
  name: string;

  /**
   * URL to this user's webpage.
   */
  url?: string;

  /**
   * This user's email.
   */
  email?: string;
}

/**
 * Represents an icon.
 */
export interface IconDescriptor {
  /**
   * Icon in low resolution.
   */
  small?: string;

  /**
   * 64x64 icon.
   */
  larger?: string;
}

/**
 * Represents a hash type.
 */
export enum HashType {
  MD5 = "md5",
  SHA256 = "sha256",
}

/**
 * Represents a hash.
 */
export type HashDescriptor = [hash: string | "auto", hashType: HashType];

/**
 * Represents a resource.
 */
export interface ResourceDescriptor {
  /**
   * Identificator of the resource.
   */
  id: string;

  /**
   * Source file for the script.
   *
   * When provided, {@link ResourceDescriptor#hash} can be set to "auto", then
   * the hash will be generated from the source file.
   */
  src?: string;

  /**
   * URL where this resource can be found.
   */
  url?: string;

  /**
   * Validation of the script
   */
  hash?: HashDescriptor;
}

/**
 * Represents a state at which injection of the UserScript occurs.
 */
export enum RunAt {
  /**
   * Injection shall happen as soon as possible.
   */
  DocumentStart = "document-start",

  /**
   * Injection shall happen after the body element is created.
   */
  DocumentBody = "document-body",

  /**
   * Injection shall happen when or after DOMContentLoaded is dispatched.
   */
  DocumentEnd = "document-end",

  /**
   * Injection shall happen after document is fully loaded.
   */
  DocumentIdle = "document-idle",

  /**
   * Injection shall happen only by request from the user through context menu.
   */
  ContextMenu = "context-menu",
}

/**
 * Represents an anti-feature.
 *
 * @see https://greasyfork.org/en/help/antifeatures For comprehensive list of
 * anti-features.
 */
export enum AntiFeature {
  /**
   * The script inserts ads on the page.
   */
  Ads = "ads",

  /**
   * The script requires to certain membership (obtained, for example, via
   * following a user) in order to work.
   */
  Membership = "membership",

  /**
   * The script performs mining in background.
   */
  Miner = "miner",

  /**
   * The script requires a payment in order to work.
   */
  Payment = "payment",

  /**
   * The script suggests referral links that earn author comission on purchase.
   */
  ReferralLink = "referral-link",

  /**
   * The script tracks user's actions.
   */
  Tracking = "tracking",
}

/**
 * Represents an injection place.
 *
 * @default InjectInto.Page
 */
export enum InjectionContext {
  /**
   * The script must be injected into a page.
   */
  Page = "page",

  /**
   * The script must be injected into the content script.
   */
  Content = "content",

  /**
   * The script shall be injected into a page, but if it fails, fall back to
   * injection into the content script.
   */
  Auto = "auto",
}

/**
 * Represents an object with information about the UserScript.
 */
export interface UserScriptMeta {
  /**
   * Name of the script.
   *
   * @example "My userscript"
   */
  name: string | Localizeable;

  /**
   * Namespace of the script.
   *
   * Namespace helps avoiding name collisions, you can set it to whatever you
   * prefer, for example an URL you own, like a GitHub repository or your site.
   *
   * @example "https://github.com/brawaru/my-userscript"
   */
  namespace?: string;

  /**
   * Version of the script.
   *
   * Can be whatever you prefer, but it recommended to follow semantic
   * versioning.
   *
   * @example "1.0"
   */
  version: string;

  /**
   * Author of the script.
   *
   * @example
   * {
   *  "name": "Brawaru",
   *  "url": "https://brawaru.github.io/"
   * }
   * @example "Brawaru"
   */
  author: string | UserDescriptor;

  /**
   * Contributors to the script code.
   *
   * @example ["AltWarU <https://github.com/altwaru>"]
   */
  contributors?: (string | UserDescriptor)[];

  /**
   * Description for the script.
   *
   * Briefly describes what this script does.
   *
   * @example "Smashes an alert right into your face whenever you open a page!"
   */
  description?: string | Localizeable;

  /**
   * Homepage for the script.
   *
   * It is often displayed on the settings page in UserScript manager.
   * @example "https://github.com/brawaru/my-userscript#readme"
   */
  homepage?: string;

  /**
   * License for the code of the script.
   *
   * Can be whatever you prefer, generally you'd like to put license name,
   * maybe a link to it.
   *
   * @example "MIT <https://github.com/Brawaru/my-userscript/blob/master/LICENSE>"
   * @example "Brawaru 2021. All rights reserved."
   */
  license?: string;

  /**
   * Icon for the script.
   */
  icon?: IconDescriptor;

  /**
   * URL to script itself or file containing a header with `version` tag.
   *
   * Some UserScript managers will be checking it from time to time and check
   * if either {@link UserScriptMeta#version} or the file hash itself is
   * updated. If it is, the user will be prompted to update.
   */
  updateUrl?: string;

  /**
   * URL where script is downloaded from on update.
   */
  downloadUrl?: string;

  /**
   * Support / issues URL.
   *
   * URL to a page where users could report the issue with the script or ask
   * for assistance.
   */
  supportUrl?: string;

  /**
   * Pages on which this UserScript runs.
   *
   * Can contain asterisk. Some UserScript managers allow regexes to be used
   * when framed with slashes.
   * @example "https://brawaru.github.io/*"
   * @example /^https?\:\/\/brawaru\.github\.io\/.*$/
   */
  include?: (string | RegExp)[];

  /**
   * Match patterns on which script runs.
   *
   * @see https://developer.chrome.com/docs/extensions/mv2/match_patterns/
   */
  match?: string | string[];

  /**
   * Pages on which this UserScript never runs.
   */
  exclude?: (string | RegExp)[];

  /**
   * Scripts to download and append before the contents of the script.
   */
  require?: (string | ResourceDescriptor)[];

  /**
   * Resources to download, which then can be accessed by the script via API.
   */
  resources?: (string | ResourceDescriptor)[];

  /**
   * All domains and subdomains this script sends requests to.
   *
   * @see https://www.tampermonkey.net/documentation.php#_connect
   */
  connect?: string | string[];

  /**
   * Defines when script must be injected.
   *
   * @see https://www.tampermonkey.net/documentation.php#_run_at
   * @example RutAt.DocumentStart
   * @default RunAt.DocumentIdle
   */
  runAt?: RunAt | string;

  /**
   * List of features are granted to script.
   *
   * @see https://www.tampermonkey.net/documentation.php#_grant
   * @see https://violentmonkey.github.io/api/metadata-block/#grant
   */
  grant?: string | string[];

  /**
   * List of all anti-features provided by the script.
   *
   * Required by sites like GreasyFork. All requirement must contain a
   * description of why certain anti-feature is in place.
   */
  antiFeatures?: [
    antiFeature: string | AntiFeature,
    reason: string | Localizeable,
  ][];

  /**
   * Whether this script does not run in the frames.
   */
  noFrames?: boolean;

  /**
   * Disables certain browser compatibilities features.
   * @example ["Chrome"]
   */
  noCompat?: string | string[];

  /**
   * The context where this script injects into.
   */
  injectInto?: InjectionContext | string;

  /**
   * Custom tags if one is not present.
   *
   * Must be of string type.
   */
  customTags?: {
    [tagName: string]: string;
  };
}
