'use client';

import { useQueryStates, type UseQueryStatesKeysMap } from 'nuqs';

const PAGE_KEY = 'page';

/**
 * Keeps table filters in the URL.
 * Changing any key other than `page` resets `page` to 1 when that parser exists.
 */
export function useTableUrlState<KeyMap extends UseQueryStatesKeysMap>(keyMap: KeyMap) {
  const [state, setState] = useQueryStates(keyMap);

  function setQuery(next: Parameters<typeof setState>[0]) {
    const patch = typeof next === 'function' ? next(state) : next;
    const keys = patch ? Object.keys(patch) : [];
    const resetsPage = keys.some((key) => key !== PAGE_KEY);
    if (resetsPage && PAGE_KEY in keyMap && patch) {
      return setState({ ...patch, page: 1 });
    }
    return setState(next);
  }

  return { state, setQuery };
}
