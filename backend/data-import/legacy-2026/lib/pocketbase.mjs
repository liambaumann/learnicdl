const DEFAULT_BASE_URL = process.env.PB_URL ?? "http://127.0.0.1:8090";

/**
 * Minimal PocketBase REST client for the import script. Deliberately avoids
 * adding the browser-oriented `pocketbase` SDK as a dependency here - Node 18+
 * has native fetch/FormData/Blob, which is all multipart file upload needs.
 */
export class PocketBaseAdminClient {
  constructor({ baseUrl = DEFAULT_BASE_URL, email, password } = {}) {
    if (!email || !password) {
      throw new Error("PocketBaseAdminClient requires a superuser email + password (see README.md)");
    }
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.email = email;
    this.password = password;
    this.token = null;
  }

  async authenticate() {
    const res = await fetch(`${this.baseUrl}/api/collections/_superusers/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: this.email, password: this.password })
    });
    if (!res.ok) {
      throw new Error(`PocketBase auth failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    this.token = data.token;
    return this.token;
  }

  authHeaders() {
    if (!this.token) throw new Error("call authenticate() before making requests");
    return { Authorization: this.token };
  }

  /** Looks up a record by its legacy_id field, for idempotent upserts. */
  async findByLegacyId(collection, legacyId) {
    if (legacyId === null || legacyId === undefined) return null;
    const url = new URL(`${this.baseUrl}/api/collections/${collection}/records`);
    url.searchParams.set("filter", `legacy_id = "${legacyId}"`);
    url.searchParams.set("perPage", "1");
    const res = await fetch(url, { headers: this.authHeaders() });
    if (!res.ok) {
      throw new Error(`lookup failed for ${collection} legacy_id=${legacyId}: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return data.items[0] ?? null;
  }

  /**
   * Creates or updates a record by legacy_id. `files` maps a PocketBase file
   * field name to { buffer, mime, filename } (or null/undefined to skip it).
   */
  async upsert(collection, legacyId, fields, files = {}) {
    // The lookup key and the stored legacy_id value must be identical, or
    // findByLegacyId can never find a record this same call already created,
    // and every re-run creates a fresh duplicate instead of updating in
    // place (this exact bug shipped once already - see import.mjs history).
    if (fields.legacy_id !== undefined && String(fields.legacy_id) !== String(legacyId)) {
      throw new Error(
        `upsert(${collection}) called with legacyId=${JSON.stringify(legacyId)} but ` +
          `fields.legacy_id=${JSON.stringify(fields.legacy_id)} - these must match or re-running will duplicate records.`
      );
    }

    const existing = await this.findByLegacyId(collection, legacyId);

    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      form.append(key, value === null ? "" : String(value));
    }
    for (const [fieldName, file] of Object.entries(files)) {
      if (!file) continue;
      form.append(fieldName, new Blob([file.buffer], { type: file.mime }), file.filename);
    }

    const method = existing ? "PATCH" : "POST";
    const url = `${this.baseUrl}/api/collections/${collection}/records${existing ? "/" + existing.id : ""}`;
    const res = await fetch(url, { method, headers: this.authHeaders(), body: form });
    if (!res.ok) {
      throw new Error(`upsert failed for ${collection} legacy_id=${legacyId}: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  async getRecord(collection, id) {
    const res = await fetch(`${this.baseUrl}/api/collections/${collection}/records/${id}`, {
      headers: this.authHeaders()
    });
    if (!res.ok) throw new Error(`getRecord failed: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async downloadFile(collection, recordId, filename) {
    const res = await fetch(`${this.baseUrl}/api/files/${collection}/${recordId}/${filename}`, {
      headers: this.authHeaders()
    });
    if (!res.ok) throw new Error(`file download failed: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }

  async deleteRecord(collection, id) {
    const res = await fetch(`${this.baseUrl}/api/collections/${collection}/records/${id}`, {
      method: "DELETE",
      headers: this.authHeaders()
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`delete failed for ${collection}/${id}: ${res.status} ${await res.text()}`);
    }
  }
}
