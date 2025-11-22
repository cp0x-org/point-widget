import { useEffect, useState } from 'react';

export function useUserPoints() {
  const [data, setData] = useState<{ name: string; quantity: number }[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // имитируем задержку API
    const timer = setTimeout(() => {
      setData([
        { name: 'backpack', quantity: 1500 },
        { name: 'extended', quantity: 800 },
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
}
