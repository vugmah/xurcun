/* ─── cPanel UAPI Service ───
   All cPanel credentials live only in backend .env (CPANEL_* vars).
   This module is called exclusively from admin-protected tRPC routers.
*/

const CPANEL_BASE_URL = process.env.CPANEL_BASE_URL;
const CPANEL_USERNAME = process.env.CPANEL_USERNAME;
const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;
const CPANEL_DOMAIN = process.env.CPANEL_DOMAIN;

export function isCpanelConfigured(): boolean {
  return !!(
    CPANEL_BASE_URL &&
    CPANEL_USERNAME &&
    CPANEL_API_TOKEN &&
    CPANEL_DOMAIN
  );
}

export function getCpanelDomain(): string | undefined {
  return CPANEL_DOMAIN;
}

/** Generic cPanel UAPI call */
async function uapiCall(module: string, func: string, params: Record<string, string | number> = {}): Promise<Record<string, unknown>> {
  if (!isCpanelConfigured()) {
    throw new Error("cPanel not configured");
  }

  const url = new URL(`${CPANEL_BASE_URL}/execute/${module}/${func}`);
  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.append(k, String(v));
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`cPanel API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

/** List all POP3 email accounts */
export async function listMailAccounts() {
  const data = await uapiCall("Email", "list_pops", { skip_main: 0 });
  if (!data.data) return [];

  return (data.data as Array<{
    email: string;
    user: string;
    domain: string;
    _diskquota: string;
    _diskused: string;
    hold_outgoing: number;
    suspended_incoming: number;
    suspended_outgoing: number;
  }>).map((acc) => ({
    email: acc.email,
    username: acc.user,
    domain: acc.domain,
    quotaMb: acc._diskquota === "unlimited" || acc._diskquota === "0"
      ? 0
      : Math.round(parseInt(acc._diskquota || "0") / (1024 * 1024)),
    usedMb: Math.round(parseInt(acc._diskused || "0") / (1024 * 1024)),
    status: acc.suspended_incoming === 1 || acc.suspended_outgoing === 1 || acc.hold_outgoing === 1
      ? "suspended"
      : "active",
  }));
}

/** Create a new email account */
export async function createMailAccount(username: string, password: string, quotaMb: number) {
  const domain = CPANEL_DOMAIN!;
  const params: Record<string, string | number> = {
    email: username,
    domain,
    password,
  };
  if (quotaMb > 0) {
    params.quota = quotaMb;
  } else {
    params.quota = 0; // unlimited
  }

  const data = await uapiCall("Email", "add_pop", params);
  const status = data.status as number | undefined;
  const errors = data.errors as unknown[] | undefined;
  return { success: status === 1 || errors === undefined, data };
}

/** Delete an email account */
export async function deleteMailAccount(email: string) {
  const [user, domain] = email.split("@");
  const data = await uapiCall("Email", "delete_pop", { email: user, domain });
  const status = data.status as number | undefined;
  const errors = data.errors as unknown[] | undefined;
  return { success: status === 1 || errors === undefined, data };
}

/** Change password */
export async function changeMailPassword(email: string, password: string) {
  const [user, domain] = email.split("@");
  const data = await uapiCall("Email", "passwd_pop", {
    email: user,
    domain,
    password,
  });
  const status = data.status as number | undefined;
  const errors = data.errors as unknown[] | undefined;
  return { success: status === 1 || errors === undefined, data };
}

/** Change quota */
export async function changeMailQuota(email: string, quotaMb: number) {
  const [user, domain] = email.split("@");
  const data = await uapiCall("Email", "edit_pop_quota", {
    email: user,
    domain,
    quota: quotaMb > 0 ? quotaMb : 0,
  });
  const status = data.status as number | undefined;
  const errors = data.errors as unknown[] | undefined;
  return { success: status === 1 || errors === undefined, data };
}
