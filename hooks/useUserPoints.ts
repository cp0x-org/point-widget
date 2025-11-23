import { useEffect, useState } from 'react';
import axios from 'axios';

export function useUserPoints() {
  const [data, setData] = useState<{ name: string; quantity: number }[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const response = await axios.get('/api/user-points');

        if (response.data.status === 'OK') {
          const totalPoints = parseInt(response.data.data.totalPoints);
          setData([
            { name: 'backpack points', quantity: 32000 },
            { name: 'extended points', quantity: totalPoints },
          ]);
        }
      } catch (error) {
        console.error('Error fetching user points:', error);
        // Fallback to mock data on error
        setData([
          { name: 'backpack points', quantity: 32000 },
          { name: 'extended points', quantity: 8000 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPoints();
  }, []);

  return { data, loading };
}
