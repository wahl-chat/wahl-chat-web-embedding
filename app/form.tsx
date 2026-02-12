import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchContexts,
  fetchPartiesForContext,
  type ContextOption,
  type PartyOption,
} from '@/lib/firestore';

const BASE_URL = 'https://wahl.chat';
const MAX_SELECTED_PARTIES = 7;

export default function Form() {
  const params = useSearchParams();
  const router = useRouter();

  const partyIds = params.getAll('party_id');
  const tenantId = params.get('tenant_id');
  const contextId = params.get('context_id');
  const [contexts, setContexts] = useState<ContextOption[]>([]);
  const [parties, setParties] = useState<PartyOption[]>([]);
  const [isLoadingContexts, setIsLoadingContexts] = useState(false);
  const [isLoadingParties, setIsLoadingParties] = useState(false);

  const link = useMemo(() => {
    const url = new URL(`${BASE_URL}/api/embed`);

    if (partyIds.length > 0) {
      partyIds.slice(0, MAX_SELECTED_PARTIES).forEach((id) => {
        if (!id) return;
        url.searchParams.append('party_id', id);
      });
    }

    if (tenantId) {
      url.searchParams.append('tenant_id', tenantId);
    }

    if (contextId) {
      url.searchParams.append('context_id', contextId);
    }

    return url.toString();
  }, [partyIds, tenantId, contextId]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadContexts() {
      setIsLoadingContexts(true);

      try {
        const contextOptions = await fetchContexts(controller.signal);
        setContexts(contextOptions);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setContexts([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingContexts(false);
        }
      }
    }

    loadContexts();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!contextId) {
      setParties([]);
      return;
    }

    const controller = new AbortController();

    async function loadParties() {
      setIsLoadingParties(true);

      try {
        const partyOptions = await fetchPartiesForContext(
          contextId,
          controller.signal
        );
        setParties(partyOptions);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setParties([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingParties(false);
        }
      }
    }

    loadParties();

    return () => {
      controller.abort();
    };
  }, [contextId]);

  useEffect(() => {
    if (contexts.length === 0 || contextId) return;

    const nextParams = new URLSearchParams();

    if (tenantId) {
      nextParams.append('tenant_id', tenantId);
    }

    nextParams.append('context_id', contexts[0].contextId);

    router.replace(`?${nextParams.toString()}`);
  }, [contexts, contextId, router, tenantId]);

  const handlePartyIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPartyIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    ).slice(0, MAX_SELECTED_PARTIES);

    updateQueryParams({ newPartyIds: selectedPartyIds });
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextContextId = e.target.value;
    updateQueryParams({
      newContextId: nextContextId,
      newPartyIds: [],
    });
  };

  const handleTenantIdSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const tenantId = formData.get('tenantId') as string;
    updateQueryParams({ newTenantId: tenantId });
  };

  const updateQueryParams = ({
    newPartyIds,
    newTenantId,
    newContextId,
  }: {
    newPartyIds?: string[];
    newTenantId?: string;
    newContextId?: string;
  }) => {
    const params = new URLSearchParams();

    const normalizedPartyIds = (newPartyIds ?? partyIds).slice(
      0,
      MAX_SELECTED_PARTIES
    );
    const normalizedTenantId = newTenantId ?? tenantId;
    const normalizedContextId = newContextId ?? contextId;

    if (normalizedPartyIds) {
      normalizedPartyIds.forEach((id) => {
        params.append('party_id', id);
      });
    }

    if (normalizedTenantId) {
      params.append('tenant_id', normalizedTenantId);
    }

    if (normalizedContextId) {
      params.append('context_id', normalizedContextId);
    }

    router.replace(`?${params.toString()}`);
  };

  return (
    <>
      <div className="flex flex-row gap-4 flex-wrap">
        <div className="flex flex-col gap-2 mt-6">
          <label htmlFor="contextId" className="text-sm font-bold">
            Context - Wähle zuerst den Wahlkontext
          </label>
          <select
            id="contextId"
            className="border border-border rounded-lg p-2 min-w-72"
            value={contextId ?? ''}
            onChange={handleContextChange}
            disabled={isLoadingContexts || contexts.length === 0}
          >
            {!contextId && (
              <option value="" disabled>
                {isLoadingContexts
                  ? 'Kontexte werden geladen...'
                  : 'Wähle einen Kontext'}
              </option>
            )}
            {contexts.map((context) => (
              <option key={context.contextId} value={context.contextId}>
                {context.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <label htmlFor="partyId" className="text-sm font-bold">
            Party IDs - Wähle bis zu {MAX_SELECTED_PARTIES} Parteien aus
          </label>
          <select
            id="partyId"
            className="border border-border rounded-lg p-2 w-fit"
            value={partyIds}
            onChange={handlePartyIdChange}
            multiple
            disabled={!contextId || isLoadingParties || parties.length === 0}
          >
            {parties.map((party) => (
              <option key={party.partyId} value={party.partyId}>
                {party.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {!contextId
              ? 'Wähle zuerst einen Kontext.'
              : isLoadingParties
                ? 'Parteien werden geladen...'
                : `${partyIds.length}/${MAX_SELECTED_PARTIES} ausgewählt`}
          </p>
        </div>

        <form
          onSubmit={handleTenantIdSubmit}
          className="flex flex-col gap-2 mt-6"
        >
          <label htmlFor="tenantId" className="text-sm font-bold">
            Tenant ID - Wähle eine Partei aus
          </label>
          <div className="flex gap-2">
            <input
              id="tenantId"
              className="border-2 border-gray-300 rounded-lg p-2 w-fit"
              placeholder="Tenant ID"
              name="tenantId"
              defaultValue={tenantId ?? ''}
            />

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              type="submit"
            >
              Set Tenant ID
            </button>
          </div>
        </form>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        iFrame URL: <code className="text-sm text-gray-700">{link}</code>
      </p>

      <div className="flex gap-2 py-4 grow flex-wrap md:flex-nowrap">
        <div className="hidden md:block grow border-2 border-gray-300 rounded-lg overflow-hidden mx-auto mt-6">
          <iframe src={link} style={{ border: 'none' }} className="size-full" />
        </div>
        <div className="aspect-[9/19.5] border-2 border-gray-300 rounded-lg overflow-hidden mx-auto mt-6">
          <iframe src={link} style={{ border: 'none' }} className="size-full" />
        </div>
      </div>
    </>
  );
}
