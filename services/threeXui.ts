import { randomUUID } from "crypto";

import { env } from "@/lib/env";

type ThreeXuiLoginResponse = {
  success: boolean;
  msg?: string;
  obj?: unknown;
};

type ThreeXuiApiResponse<T = unknown> = {
  success: boolean;
  msg?: string;
  obj?: T;
};

type ThreeXuiClient = {
  id?: string | number;
  email: string;
  enable: boolean;
  expiryTime: number;
  flow?: string;
  limitIp?: number;
  totalGB?: number;
  tgId?: string;
  subId?: string;
  reset?: number;
  comment?: string;
  uuid?: string;
};

const MAX_RETRIES = 3;

function getThreeXuiConfig() {
  // Некоторые инсталляции используют переменные с префиксом 3XUI_*.
  return {
    baseUrl: process.env["3XUI_BASE_URL"] ?? env.THREEXUI_BASE_URL,
    username: process.env["3XUI_USERNAME"] ?? env.THREEXUI_USERNAME,
    password: process.env["3XUI_PASSWORD"] ?? env.THREEXUI_PASSWORD,
    inboundId: process.env["3XUI_INBOUND_ID"] ?? env.THREEXUI_INBOUND_ID,
  };
}

export class ThreeXuiService {
  private cookieHeader: string | null = null;

  private buildUrl(path: string, baseUrl: string) {
    const sanitizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const sanitizedPath = path.replace(/^\/+/, "");
    return new URL(sanitizedPath, sanitizedBase).toString();
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const cfg = getThreeXuiConfig();
    if (!cfg.baseUrl) {
      throw new Error("3x-ui base URL не задан");
    }

    const url = this.buildUrl(path, cfg.baseUrl);
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    if (this.cookieHeader) {
      headers.set("Cookie", this.cookieHeader);
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const response = await fetch(url, {
          ...init,
          headers,
          cache: "no-store",
        });

        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
          this.cookieHeader = setCookie;
        }

        if (!response.ok) {
          if (response.status >= 500 && attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 400 * attempt));
            continue;
          }
          throw new Error(`3x-ui вернул статус ${response.status}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error;
        }
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }

    throw new Error("3x-ui request failed");
  }

  async login() {
    const cfg = getThreeXuiConfig();
    if (!cfg.username || !cfg.password) {
      throw new Error("3x-ui логин/пароль не заданы");
    }

    const body = JSON.stringify({
      username: cfg.username,
      password: cfg.password,
    });

    // Для других версий 3x-ui endpoint может отличаться: login или panel/api/inbounds/login.
    const response = await this.request<ThreeXuiLoginResponse>("login", {
      method: "POST",
      body,
    });

    if (!response.success) {
      throw new Error(response.msg ?? "Не удалось авторизоваться в 3x-ui");
    }
  }

  async getInbounds() {
    await this.login();
    // В некоторых версиях endpoint: panel/api/inbounds/list.
    const response = await this.request<ThreeXuiApiResponse>("panel/api/inbounds/list");
    if (!response.success) {
      throw new Error(response.msg ?? "Не удалось получить список inbound");
    }
    return response.obj;
  }

  async getClientByEmail(email: string) {
    await this.login();
    const inboundId = getThreeXuiConfig().inboundId;
    if (!inboundId) {
      throw new Error("THREEXUI_INBOUND_ID не задан");
    }

    // В разных версиях API поиск клиента может быть отдельным endpoint.
    const response = await this.request<ThreeXuiApiResponse<{ settings: string }>>(
      `panel/api/inbounds/get/${inboundId}`,
    );
    if (!response.success || !response.obj) {
      return null;
    }

    const settings = JSON.parse(response.obj.settings || "{}");
    const client = (settings.clients as ThreeXuiClient[] | undefined)?.find(
      (item) => item.email === email,
    );
    return client ?? null;
  }

  async createClient(input: {
    email: string;
    expiryTime: number;
    inboundId?: string;
    uuid?: string;
  }) {
    await this.login();
    const cfg = getThreeXuiConfig();
    const inboundId = input.inboundId ?? cfg.inboundId;
    if (!inboundId) {
      throw new Error("THREEXUI_INBOUND_ID не задан");
    }

    const clientUuid = input.uuid ?? randomUUID();
    const client: ThreeXuiClient = {
      // Для VLESS/Trojan панели часто ожидают "id", а не "uuid".
      id: clientUuid,
      email: input.email,
      enable: true,
      expiryTime: input.expiryTime,
      uuid: clientUuid,
      flow: "xtls-rprx-vision",
      limitIp: 0,
      totalGB: 0,
      reset: 0,
      comment: "RootVPN paid subscription",
    };

    // Этот payload зависит от конкретного inbound-протокола (vless/vmess/trojan).
    const response = await this.request<ThreeXuiApiResponse>(
      "panel/api/inbounds/addClient",
      {
        method: "POST",
        body: JSON.stringify({
          id: Number(inboundId),
          settings: JSON.stringify({
            clients: [client],
          }),
        }),
      },
    );

    if (!response.success) {
      throw new Error(response.msg ?? "Не удалось создать клиента 3x-ui");
    }

    const subscriptionUrl = `${cfg.baseUrl}/sub/${clientUuid}`;

    return {
      externalId: String(client.id ?? clientUuid),
      uuid: clientUuid,
      email: client.email,
      inboundId,
      subscriptionUrl,
      vpnKey: `${client.email}:${clientUuid}`,
      accessUrl: subscriptionUrl,
    };
  }

  async updateClientExpiry(input: {
    email: string;
    inboundId?: string;
    expiresAt: Date;
  }) {
    const existing = await this.getClientByEmail(input.email);
    if (!existing) {
      throw new Error("Клиент 3x-ui не найден для продления");
    }

    const response = await this.request<ThreeXuiApiResponse>(
      `panel/api/inbounds/updateClient/${existing.id}`,
      {
        method: "POST",
        body: JSON.stringify({
          id: Number(input.inboundId ?? getThreeXuiConfig().inboundId),
          settings: JSON.stringify({
            clients: [
              {
                ...existing,
                expiryTime: input.expiresAt.getTime(),
                enable: true,
              },
            ],
          }),
        }),
      },
    );

    if (!response.success) {
      throw new Error(response.msg ?? "Не удалось обновить срок клиента");
    }
  }

  async disableClient(input: { email: string; inboundId?: string }) {
    const existing = await this.getClientByEmail(input.email);
    if (!existing) {
      return;
    }

    const response = await this.request<ThreeXuiApiResponse>(
      `panel/api/inbounds/updateClient/${existing.id}`,
      {
        method: "POST",
        body: JSON.stringify({
          id: Number(input.inboundId ?? getThreeXuiConfig().inboundId),
          settings: JSON.stringify({
            clients: [
              {
                ...existing,
                enable: false,
              },
            ],
          }),
        }),
      },
    );

    if (!response.success) {
      throw new Error(response.msg ?? "Не удалось деактивировать клиента");
    }
  }
}

export const threeXuiService = new ThreeXuiService();
