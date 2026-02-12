const FIRESTORE_BASE_URL =
  'https://firestore.googleapis.com/v1/projects/wahl-chat/databases/(default)/documents';

type FirestoreValue = {
  stringValue?: string;
};

type FirestoreDocument = {
  fields?: Record<string, FirestoreValue | undefined>;
};

type FirestoreResponse = {
  documents?: FirestoreDocument[];
};

export type ContextOption = {
  contextId: string;
  name: string;
  date?: string;
};

export type PartyOption = {
  partyId: string;
  name: string;
};

function getStringField(
  fields: Record<string, FirestoreValue | undefined> | undefined,
  key: string
): string | undefined {
  return fields?.[key]?.stringValue;
}

function toContextOption(doc: FirestoreDocument): ContextOption | null {
  const contextId = getStringField(doc.fields, 'context_id');
  const name = getStringField(doc.fields, 'name');

  if (!contextId || !name) {
    return null;
  }

  return {
    contextId,
    name,
    date: getStringField(doc.fields, 'date'),
  };
}

function toPartyOption(doc: FirestoreDocument): PartyOption | null {
  const partyId = getStringField(doc.fields, 'party_id');
  const name = getStringField(doc.fields, 'name');

  if (!partyId || !name) {
    return null;
  }

  return {
    partyId,
    name,
  };
}

export async function fetchContexts(
  signal?: AbortSignal
): Promise<ContextOption[]> {
  const response = await fetch(`${FIRESTORE_BASE_URL}/contexts?pageSize=100`, {
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch contexts');
  }

  const data = (await response.json()) as FirestoreResponse;

  return (data.documents ?? [])
    .map(toContextOption)
    .filter((value): value is ContextOption => value !== null)
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    .reverse();
}

export async function fetchPartiesForContext(
  contextId: string,
  signal?: AbortSignal
): Promise<PartyOption[]> {
  const response = await fetch(
    `${FIRESTORE_BASE_URL}/contexts/${encodeURIComponent(
      contextId
    )}/parties?pageSize=100`,
    {
      signal,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch parties for context');
  }

  const data = (await response.json()) as FirestoreResponse;

  return (data.documents ?? [])
    .map(toPartyOption)
    .filter((value): value is PartyOption => value !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
