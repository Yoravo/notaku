import { pathToFileURL } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(1)), '../..');

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    return nextResolve(pathToFileURL(path.join(projectRoot, 'src', `${specifier.slice(2)}.ts`)).href, context);
  }
  if (specifier === 'next/server') {
    return nextResolve(pathToFileURL(path.join(projectRoot, 'tests/payment-backend/next-server-test-shim.mjs')).href, context);
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.')) {
      return nextResolve(`${specifier}.ts`, context);
    }
    throw error;
  }
}
