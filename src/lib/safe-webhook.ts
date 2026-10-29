import { promises as dns } from "node:dns";
import https from "node:https";
import net from "node:net";
import type { LookupAddress, LookupAllOptions, LookupOneOptions } from "node:dns";
import type { ClientRequest, IncomingMessage, RequestOptions } from "node:http";

const MAX_RESPONSE_BYTES = 500;
const DEFAULT_TIMEOUT_MS = 7_000;

type Address = { address: string; family: number };
type Lookup = (hostname: string) => Promise<Address[]>;
type HttpsRequest = (options: RequestOptions, callback: (response: IncomingMessage) => void) => ClientRequest;

export type SafeWebhookDependencies = {
  lookup?: Lookup;
  request?: HttpsRequest;
};

export type SafeWebhookRequestOptions = SafeWebhookDependencies & {
  method?: "POST";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
};

function ipv4Number(address: string): number | null {
  if (net.isIP(address) !== 4) return null;
  return address.split(".").reduce((value, octet) => (value * 256) + Number(octet), 0) >>> 0;
}

function inIpv4Cidr(value: number, base: string, prefix: number): boolean {
  const baseValue = ipv4Number(base);
  if (baseValue === null) return false;
  const shift = 32 - prefix;
  return (value >>> shift) === (baseValue >>> shift);
}

function isPublicIpv4(address: string): boolean {
  const value = ipv4Number(address);
  if (value === null) return false;
  const blocked: Array<[string, number]> = [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.88.99.0", 24],
    ["192.168.0.0", 16],
    ["198.18.0.0", 15],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4],
  ];
  return !blocked.some(([base, prefix]) => inIpv4Cidr(value, base, prefix));
}

function ipv6Number(address: string): bigint | null {
  const normalized = address.replace(/^\[|\]$/g, "").split("%")[0].toLowerCase();
  if (net.isIP(normalized) !== 6) return null;

  let source = normalized;
  const ipv4Match = source.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (ipv4Match) {
    const v4 = ipv4Number(ipv4Match[1]);
    if (v4 === null) return null;
    source = `${source.slice(0, -ipv4Match[1].length)}${((v4 >>> 16) & 0xffff).toString(16)}:${(v4 & 0xffff).toString(16)}`;
  }

  const halves = source.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;
  const groups = halves.length === 2 ? [...left, ...Array(missing).fill("0"), ...right] : left;
  if (groups.length !== 8) return null;
  return groups.reduce((value, group) => (value << BigInt(16)) | BigInt(`0x${group || "0"}`), BigInt(0));
}

function inIpv6Cidr(value: bigint, base: bigint, prefix: number): boolean {
  return (value >> BigInt(128 - prefix)) === (base >> BigInt(128 - prefix));
}

function isPublicIpv6(address: string): boolean {
  const value = ipv6Number(address);
  if (value === null) return false;
  const cidrs: Array<[string, number]> = [
    ["::", 96],
    ["::ffff:0:0", 96],
    ["64:ff9b::", 96],
    ["64:ff9b:1::", 48],
    ["100::", 64],
    ["2001::", 32],
    ["2001:2::", 48],
    ["2001:10::", 28],
    ["2001:20::", 28],
    ["2001:db8::", 32],
    ["2002::", 16],
    ["fc00::", 7],
    ["fe80::", 10],
    ["fec0::", 10],
    ["ff00::", 8],
  ];
  return !cidrs.some(([base, prefix]) => {
    const baseValue = ipv6Number(base);
    return baseValue !== null && inIpv6Cidr(value, baseValue, prefix);
  });
}

export function isPublicWebhookAddress(address: string): boolean {
  const normalized = address.replace(/^\[|\]$/g, "");
  const family = net.isIP(normalized);
  return family === 4 ? isPublicIpv4(normalized) : family === 6 ? isPublicIpv6(normalized) : false;
}

function parseWebhookUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Webhook URL is invalid");
  }
  if (url.protocol !== "https:") throw new Error("Webhook URL must use HTTPS");
  if (url.username || url.password) throw new Error("Webhook URL must not contain credentials");
  if (url.port && url.port !== "443") throw new Error("Webhook URL must use the default HTTPS port");
  return url;
}

async function defaultLookup(hostname: string): Promise<Address[]> {
  return dns.lookup(hostname, { all: true, verbatim: true });
}

export async function assertSafeWebhookUrl(
  rawUrl: string,
  dependencies: SafeWebhookDependencies = {},
): Promise<{ url: URL; addresses: Address[] }> {
  const url = parseWebhookUrl(rawUrl);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const literalFamily = net.isIP(hostname);
  const addresses = literalFamily
    ? [{ address: hostname, family: literalFamily }]
    : await (dependencies.lookup ?? defaultLookup)(hostname);

  if (!addresses.length || addresses.some(({ address }) => !isPublicWebhookAddress(address))) {
    throw new Error("Webhook URL must resolve only to a public Internet address");
  }
  return { url, addresses };
}

export async function requestSafeWebhook(
  rawUrl: string,
  options: SafeWebhookRequestOptions = {},
): Promise<{ status: number; body: string }> {
  const { url, addresses } = await assertSafeWebhookUrl(rawUrl, options);
  const pinned = addresses[0];
  const request = options.request ?? https.request;

  return new Promise((resolve, reject) => {
    const req = request({
      protocol: "https:",
      hostname: url.hostname.replace(/^\[|\]$/g, ""),
      servername: url.hostname.replace(/^\[|\]$/g, ""),
      port: 443,
      path: `${url.pathname}${url.search}`,
      method: options.method ?? "POST",
      headers: options.headers,
      lookup: (
        _hostname: string,
        lookupOptions: LookupOneOptions | LookupAllOptions | number,
        callback: ((error: NodeJS.ErrnoException | null, address: string, family: number) => void) |
          ((error: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void),
      ) => {
        if (typeof lookupOptions === "object" && "all" in lookupOptions && lookupOptions.all) {
          (callback as (error: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void)(null, [pinned]);
        } else {
          (callback as (error: NodeJS.ErrnoException | null, address: string, family: number) => void)(null, pinned.address, pinned.family);
        }
      },
    }, (response) => {
      let body = "";
      response.on("data", (chunk: Buffer | string) => {
        if (body.length < MAX_RESPONSE_BYTES) body += chunk.toString().slice(0, MAX_RESPONSE_BYTES - body.length);
      });
      response.on("end", () => resolve({ status: response.statusCode ?? 0, body }));
      response.on("error", reject);
      response.resume();
    });

    req.on("error", reject);
    req.setTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, () => {
      req.destroy(new Error("Webhook request timed out"));
    });
    if (options.body) req.write(options.body);
    req.end();
  });
}
