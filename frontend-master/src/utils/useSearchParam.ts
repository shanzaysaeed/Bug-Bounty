import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useSearchParam(paramName: string, defaultValue: string = '') {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(() => {
    return searchParams.get(paramName) || defaultValue;
  });

  useEffect(() => {
    if (value) {
      setSearchParams(params => {
        params.set(paramName, value);
        return params;
      });
    } else {
      setSearchParams(params => {
        params.delete(paramName);
        return params;
      });
    }
  }, [value, paramName, setSearchParams]);

  return [value, setValue] as const;
}