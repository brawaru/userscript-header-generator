import { isAbsolute, resolve } from "path";
import { createHash } from "crypto";
import { assert } from "./utils/assertions";
import { isNotNull } from "./utils/checks";
import type { PopulatedGeneratorOptions } from "./generatorFactory";
import type {
  UserDescriptor,
  HashType,
  ResourceDescriptor,
} from "./userScriptMeta";
import { openSync, readSync } from "fs";

export function toSignature(user: UserDescriptor) {
  let signature = user.name;

  if (user.email != null) {
    signature += ` [${user.email}]`;
  }

  if (user.url != null) {
    signature += ` <${user.url}>`;
  }

  return signature;
}

function resolvePath(fileName: string): string {
  if (isAbsolute(fileName)) {
    return fileName;
  }

  return resolve(process.cwd(), fileName);
}

const bytesPerRead = 8192;

function toHash(fileName: string, hashType: HashType) {
  const hash = createHash(hashType);

  const fd = openSync(fileName, "r");

  const buf = Buffer.alloc(bytesPerRead, 0);

  let bytesRead = 0;

  while ((bytesRead = readSync(fd, buf)) !== 0) {
    hash.write(buf.slice(0, bytesRead));
  }

  hash.end();

  return hash.digest("hex");
}

function toHashFragment(hash: string, hashType: HashType) {
  return `${hashType}=${hash}`;
}

export function descriptorToUrl(
  descriptor: ResourceDescriptor,
  opts?: PopulatedGeneratorOptions,
): string {
  let hashFragment: string | null = null;

  const source = descriptor.src ?? opts?.resolveResourceSrc?.(descriptor);

  // NOTE(Braw): might be bad because then we might lose some properties
  // but also might be just a quirk of this library that you need to accept
  descriptor = Object.assign({}, descriptor, { src: source });

  if (isNotNull(descriptor.hash)) {
    const [hash, hashType] = descriptor.hash;

    if (hash === "auto") {
      assert(
        isNotNull(source),
        'Resource "%s" has "hash" set to "auto", but its "src" is null and cannot be resolved.',
        descriptor.id,
      );

      const newHash = toHash(resolvePath(source), hashType);

      hashFragment = toHashFragment(newHash, hashType);
    } else {
      hashFragment = toHashFragment(hash, hashType);
    }
  }

  const url = descriptor.url ?? opts?.resolveResourceUrl?.(descriptor);

  assert(
    isNotNull(url),
    'Resource "%s" has no "url" set and it cannot be resolved.',
    descriptor.id,
  );

  const [actualUrl, fragmentPart] = url.split("#");

  if (fragmentPart != null) {
    hashFragment = hashFragment
      ? `${hashFragment};${fragmentPart}`
      : fragmentPart;
  }

  hashFragment = hashFragment ? `#${hashFragment}` : "";

  return `${actualUrl}${hashFragment}`;
}
