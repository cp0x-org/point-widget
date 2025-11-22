'use client';

import { useGetPortfolio } from '@/services/octav/loader';
import Image from 'next/image';

interface Chain {
  name: string;
  key: string;
  chainId: string;
  imgSmall: string;
  imgLarge: string;
  value: string;
  valuePercentile: string;
  totalCostBasis: string;
  totalClosedPnl: string;
  totalOpenPnl: string;
}

export default function Treasure() {
  const { data, isLoading, error } = useGetPortfolio({
    address: '0x4c82cfF7398f3D43b36e41B10fF6F42b14DD9385',
    includeImages: true,
    includeExplorerUrls: true,
    waitForSync: true,
  });



  if (isLoading) return <p>Loading...</p>;

    console.log(data);

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="font-semibold text-red-800">Error</p>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const chains = data?.chains ? Object.values(data.chains) as Chain[] : [];

  return (
    <div className="h-screen overflow-y-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md">
        <p className="text-sm text-gray-600 mb-1">Net Worth</p>
        <p className="text-3xl font-bold text-gray-900">${data?.networth}</p>
        <p className="text-xs text-gray-500 mt-1">{data?.address}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Chains</h3>
        {chains.map((chain) => (
          <div
            key={chain.chainId}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={chain.imgLarge}
                  alt={chain.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{chain.name}</h4>
                  <span className="text-lg font-bold text-blue-600">
                    ${parseFloat(chain.value).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Chain ID:</span>
                    <span className="ml-2 text-gray-700">{chain.chainId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Percentile:</span>
                    <span className="ml-2 text-gray-700">
                      {parseFloat(chain.valuePercentile).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cost Basis:</span>
                    <span className="ml-2 text-gray-700">{chain.totalCostBasis}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Value:</span>
                    <span className="ml-2 text-gray-700">{chain.value}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
