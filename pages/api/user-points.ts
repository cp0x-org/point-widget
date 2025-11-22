import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await axios.get('https://api.extended.exchange/api/v1/user/rewards/leaderboard/stats', {
      headers: {
        'X-Api-Key': '9133ed57eec3dc11ad9b71b002758fa0',
        'Accept': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
