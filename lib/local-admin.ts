import { randomUUID } from "crypto";

import { dummyInterviews } from "@/constants";

type CollectionName = "users" | "interviews" | "feedback";

type Store = Record<CollectionName, Record<string, Record<string, unknown>>>;

export const DEMO_USER_ID = "demo-user";

const globalStore = globalThis as typeof globalThis & {
  __athenaMemoryStore?: Store;
};

const emptyStore = (): Store => ({
  users: {},
  interviews: {},
  feedback: {},
});

function seedStore(): Store {
  const store = emptyStore();

  dummyInterviews.forEach((interview) => {
    const id = interview.id || randomUUID();
    store.interviews[id] = {
      ...interview,
      id,
      finalized: true,
      coverImage: "/covers/amazon.png",
    };
  });

  store.interviews["seed-3"] = {
    id: "seed-3",
    userId: "demo-peer",
    role: "Backend Developer",
    type: "Technical",
    techstack: ["Node.js", "PostgreSQL", "Redis"],
    level: "Mid",
    questions: ["Explain REST vs GraphQL."],
    finalized: true,
    createdAt: new Date().toISOString(),
    coverImage: "/covers/spotify.png",
  };

  store.users[DEMO_USER_ID] = {
    name: "Demo Student",
    email: "demo@athena.local",
    password: "demo",
  };

  return store;
}

/** In-memory store — safe for Vercel serverless (no filesystem writes). */
function getStore(): Store {
  if (!globalStore.__athenaMemoryStore) {
    globalStore.__athenaMemoryStore = seedStore();
  }
  return globalStore.__athenaMemoryStore;
}

function commitStore(store: Store) {
  globalStore.__athenaMemoryStore = store;
}

type Filter = { field: string; op: "==" | "!="; value: unknown };

function matchesFilters(
  doc: Record<string, unknown>,
  filters: Filter[]
): boolean {
  return filters.every(({ field, op, value }) => {
    const docValue = doc[field];
    if (op === "==") return docValue === value;
    if (op === "!=") return docValue !== value;
    return false;
  });
}

function queryDocs(
  collection: CollectionName,
  filters: Filter[] = [],
  orderByField?: string,
  orderDirection: "asc" | "desc" = "desc",
  limitCount?: number
) {
  const store = getStore();
  let docs = Object.entries(store[collection]).map(([id, data]) => ({
    id,
    data: () => data,
    exists: true,
  }));

  if (filters.length) {
    docs = docs.filter(({ data }) =>
      matchesFilters(data() as Record<string, unknown>, filters)
    );
  }

  if (orderByField) {
    docs.sort((a, b) => {
      const aVal = a.data()[orderByField] as string;
      const bVal = b.data()[orderByField] as string;
      const cmp = String(aVal).localeCompare(String(bVal));
      return orderDirection === "desc" ? -cmp : cmp;
    });
  }

  if (limitCount !== undefined) {
    docs = docs.slice(0, limitCount);
  }

  return {
    empty: docs.length === 0,
    docs,
  };
}

class LocalDocumentReference {
  constructor(
    private collection: CollectionName,
    private docId: string
  ) {}

  get id() {
    return this.docId;
  }

  async get() {
    const store = getStore();
    const data = store[this.collection][this.docId];
    return {
      id: this.docId,
      exists: Boolean(data),
      data: () => data,
    };
  }

  async set(data: Record<string, unknown>) {
    const store = getStore();
    store[this.collection][this.docId] = { ...data };
    commitStore(store);
  }
}

class LocalCollectionReference {
  constructor(private collection: CollectionName) {}

  doc(docId?: string) {
    return new LocalDocumentReference(
      this.collection,
      docId ?? randomUUID()
    );
  }

  async add(data: Record<string, unknown>) {
    const id = randomUUID();
    const store = getStore();
    store[this.collection][id] = { ...data };
    commitStore(store);
    return { id };
  }

  where(field: string, op: "==" | "!=", value: unknown) {
    return new LocalQuery(this.collection, [{ field, op, value }]);
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new LocalQuery(this.collection, [], { field, direction });
  }
}

class LocalQuery {
  private orderByConfig?: { field: string; direction: "asc" | "desc" };
  private limitCount?: number;

  constructor(
    private collection: CollectionName,
    private filters: Filter[],
    orderByConfig?: { field: string; direction: "asc" | "desc" }
  ) {
    this.orderByConfig = orderByConfig;
  }

  where(field: string, op: "==" | "!=", value: unknown) {
    return new LocalQuery(
      this.collection,
      [...this.filters, { field, op, value }],
      this.orderByConfig
    );
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new LocalQuery(this.collection, this.filters, {
      field,
      direction,
    });
  }

  limit(count: number) {
    const q = new LocalQuery(
      this.collection,
      this.filters,
      this.orderByConfig
    );
    q.limitCount = count;
    return q;
  }

  async get() {
    return queryDocs(
      this.collection,
      this.filters,
      this.orderByConfig?.field,
      this.orderByConfig?.direction ?? "desc",
      this.limitCount
    );
  }
}

export const localDb = {
  collection(name: string) {
    return new LocalCollectionReference(name as CollectionName);
  },
};

function createSessionToken(uid: string) {
  const payload = {
    uid,
    exp: Date.now() + 60 * 60 * 24 * 7 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function parseSessionToken(token: string) {
  const payload = JSON.parse(
    Buffer.from(token, "base64url").toString("utf-8")
  ) as { uid: string; exp: number };

  if (payload.exp < Date.now()) {
    throw new Error("Session expired");
  }

  return payload;
}

export const localAuth = {
  async createSessionCookie(idToken: string) {
    return idToken;
  },

  async verifySessionCookie(sessionCookie: string) {
    return parseSessionToken(sessionCookie);
  },

  async getUserByEmail(email: string) {
    const store = getStore();
    const entry = Object.entries(store.users).find(
      ([, user]) => user.email === email
    );

    if (!entry) {
      const error = new Error("User not found") as Error & { code?: string };
      error.code = "auth/user-not-found";
      throw error;
    }

    return { uid: entry[0] };
  },

  createSessionToken,
};

export function findUserByEmail(email: string) {
  const store = getStore();
  const entry = Object.entries(store.users).find(
    ([, user]) => user.email === email
  );
  if (!entry) return null;
  return { id: entry[0], ...entry[1] };
}

export function createLocalUser(params: {
  name: string;
  email: string;
  password: string;
}) {
  const store = getStore();
  const existing = Object.values(store.users).some(
    (u) => u.email === params.email
  );
  if (existing) {
    return {
      success: false as const,
      message: "User already exists. Please sign in.",
    };
  }

  const uid = randomUUID();
  store.users[uid] = {
    name: params.name,
    email: params.email,
    password: params.password,
  };
  commitStore(store);
  return { success: true as const, uid };
}

export function verifyLocalUser(email: string, password: string) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return null;
  }
  return { uid: user.id };
}

export function ensureDemoUser() {
  const store = getStore();
  if (!store.users[DEMO_USER_ID]) {
    store.users[DEMO_USER_ID] = {
      name: "Demo Student",
      email: "demo@athena.local",
      password: "demo",
    };
    commitStore(store);
  }
}
