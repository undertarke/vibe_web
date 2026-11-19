import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

const fetchHome = (setState) =>
  api('/home')
    .then((data) => setState({ data, error: null, loading: false }))
    .catch((error) => setState({ data: null, error, loading: false }));

export function useHomeData() {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => { fetchHome(setState); }, []);

  const reload = useCallback(() => {
    setState({ data: null, error: null, loading: true });
    fetchHome(setState);
  }, []);

  return { ...state, reload };
}
