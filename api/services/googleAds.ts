/* ─── Google Ads API v16 Service ───
   https://developers.google.com/google-ads/api/docs/start
   All credentials live only in backend .env (GOOGLE_ADS_* vars).
*/

const BASE_URL = "https://googleads.googleapis.com/v16";

function getCredentials() {
  return {
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    clientId: process.env.GOOGLE_ADS_CLIENT_ID,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    mccId: process.env.GOOGLE_ADS_MCC_ID,
  };
}

export function isConfigured(): boolean {
  const c = getCredentials();
  return !!(c.developerToken && c.clientId && c.clientSecret && c.refreshToken);
}

/** Exchange refresh token for access token */
async function getAccessToken(): Promise<string | null> {
  const c = getCredentials();
  if (!c.clientId || !c.clientSecret || !c.refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.clientId,
      client_secret: c.clientSecret,
      refresh_token: c.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as Record<string, unknown>;
  return (json.access_token as string) || null;
}

/** Generic Google Ads API request */
async function apiCall(
  path: string,
  opts: { method?: string; body?: Record<string, unknown>; customerId?: string } = {}
): Promise<Record<string, unknown> | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const c = getCredentials();
  const cid = opts.customerId || c.mccId || c.loginCustomerId;
  if (!cid) return null;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "developer-token": c.developerToken!,
    "Content-Type": "application/json",
  };
  if (c.loginCustomerId) {
    headers["login-customer-id"] = c.loginCustomerId;
  }

  const url = `${BASE_URL}/customers/${cid}/${path}`;
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

/* ─── Campaigns ─── */
export async function listCampaigns() {
  return apiCall("googleAds:searchStream", {
    method: "POST",
    body: {
      query: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.start_date, campaign.end_date, campaign_budget.amount_micros, campaign.bidding_strategy_type FROM campaign ORDER BY campaign.id`,
    },
  });
}

export async function createCampaign(body: Record<string, unknown>) {
  return apiCall("campaigns:mutate", {
    method: "POST",
    body: { operations: [{ create: body }] },
  });
}

export async function updateCampaign(cid: string, body: Record<string, unknown>) {
  void cid;
  return apiCall("campaigns:mutate", {
    method: "POST",
    body: {
      operations: [{
        update: body,
        update_mask: { paths: Object.keys(body).filter((k) => k !== "resourceName") },
      }],
    },
  });
}

export async function removeCampaign(cid: string) {
  return apiCall("campaigns:mutate", {
    method: "POST",
    body: {
      operations: [{
        remove: `customers/${getCredentials().mccId}/campaigns/${cid}`,
      }],
    },
  });
}

/* ─── Ad Groups ─── */
export async function listAdGroups(campaignId?: string) {
  let query = `SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.type, ad_group.cpc_bid_micros, ad_group.campaign FROM ad_group`;
  if (campaignId) {
    query += ` WHERE ad_group.campaign = 'customers/${getCredentials().mccId}/campaigns/${campaignId}'`;
  }
  query += ` ORDER BY ad_group.id`;
  return apiCall("googleAds:searchStream", { method: "POST", body: { query } });
}

/* ─── Ads ─── */
export async function listAds(adGroupId?: string) {
  let query = `SELECT ad_group_ad.ad.id, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions, ad_group_ad.status, ad_group_ad.ad_group FROM ad_group_ad`;
  if (adGroupId) {
    query += ` WHERE ad_group_ad.ad_group = 'customers/${getCredentials().mccId}/adGroups/${adGroupId}'`;
  }
  return apiCall("googleAds:searchStream", { method: "POST", body: { query } });
}

/* ─── Metrics (performance) ─── */
export async function getMetrics(campaignIds?: string[]) {
  let query = `SELECT campaign.id, campaign.name, campaign.status, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.average_cpc, metrics.ctr FROM campaign`;
  if (campaignIds && campaignIds.length > 0) {
    query += ` WHERE campaign.id IN (${campaignIds.join(",")})`;
  }
  return apiCall("googleAds:searchStream", { method: "POST", body: { query } });
}

/* ─── Get Account Info ─── */
export async function getAccountInfo(): Promise<Record<string, unknown> | null> {
  const c = getCredentials();
  if (!c.mccId) return null;
  const token = await getAccessToken();
  if (!token) return null;

  const res = await fetch(`${BASE_URL}/customers/${c.mccId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "developer-token": c.developerToken!,
      "login-customer-id": c.loginCustomerId || c.mccId,
    },
  });

  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}
