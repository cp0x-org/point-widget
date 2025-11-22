'use client';

import { useGetPortfolio } from '@/services/octav/loader';
import Image from 'next/image';
import { Asset, ChainSummary } from '@/types/portfolio';
import AssetsPie from './assets-pie';
import { useState, useEffect, useMemo } from 'react';

interface ProtocolPosition {
  balance: string;
  chainContract: string;
  chainKey: string;
  contract: string;
  decimal: string;
  explorerUrl: string;
  imgSmall: string;
  imgLarge: string;
  name: string;
  openPnl: string;
  price: string;
  priceSource: string;
  symbol: string;
  totalCostBasis: string;
  value: string;
}

interface AssetByProtocol {
  name: string;
  key: string;
  value: string;
  imgSmall: string;
  imgLarge: string;
  totalCostBasis: string;
  totalClosedPnl: string;
  totalOpenPnl: string;
}

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

  console.log();

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="font-semibold text-red-800">Error</p>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const chains = data?.chains ? (Object.values(data.chains) as ChainSummary[]) : [];

  const apiAssets = useMemo(() => {
    if (!data?.assetByProtocols) {
      return [];
    }
    const assets = Object.values(data.assetByProtocols) as AssetByProtocol[];
    return assets.map((asset) => ({
      name: asset.name,
      value: parseFloat(asset.value),
    }));
  }, [data]);

  const [customAssets, setCustomAssets] = useState<{ id: number; name: string; value: number }[]>([]);
  const [customAssetName, setCustomAssetName] = useState('');
  const [customAssetValue, setCustomAssetValue] = useState('');
  const [customAssetPrice, setCustomAssetPrice] = useState('');

  useEffect(() => {
    try {
      const savedCustomAssets = localStorage.getItem('customAssets');
      if (savedCustomAssets) {
        setCustomAssets(JSON.parse(savedCustomAssets));
      }
    } catch (error) {
      console.error('Failed to load custom assets from localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('customAssets', JSON.stringify(customAssets));
    } catch (error) {
      console.error('Failed to save custom assets to localStorage', error);
    }
  }, [customAssets]);

  const assetsPieData = useMemo(() => {
    const customAssetsForPie = customAssets.map(({ name, value }) => ({ name, value }));
    return [...apiAssets, ...customAssetsForPie];
  }, [apiAssets, customAssets]);

  const handleAddAsset = () => {
    if (customAssetName && customAssetValue) {
      const newValue = parseFloat(customAssetValue) * parseFloat(customAssetPrice);
      if (!isNaN(newValue)) {
        const newAsset = { id: Date.now(), name: customAssetName, value: newValue };
        setCustomAssets((prev) => [...prev, newAsset]);
        setCustomAssetName('');
        setCustomAssetValue('');
        setCustomAssetPrice('');
      }
    }
  };

  const handleDeleteAsset = (id: number) => {
    setCustomAssets((prev) => prev.filter((asset) => asset.id !== id));
  };

  return (
    <div className="h-screen overflow-y-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md">
        <p className="text-sm text-gray-600 mb-1">Net Worth</p>
        <p className="text-3xl font-bold text-gray-900">${data?.networth}</p>
        <p className="text-xs text-gray-500 mt-1">{data?.address}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Assets by Protocol</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
          <AssetsPie data={assetsPieData} />
        </div>
      </div>
      <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800">Add Custom Asset</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="assetName" className="text-sm font-medium text-gray-700">
              Custom Asset Name
            </label>
            <input
              type="text"
              id="assetName"
              value={customAssetName}
              onChange={(e) => setCustomAssetName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. My Savings"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="assetValue" className="text-sm font-medium text-gray-700">
              Custom Asset Value
            </label>
            <input
              type="number"
              id="assetValue"
              value={customAssetValue}
              onChange={(e) => setCustomAssetValue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 1000"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="assetPrice" className="text-sm font-medium text-gray-700">
              Custom Asset Price
            </label>
            <input
              type="number"
              id="assetPrice"
              value={customAssetPrice}
              onChange={(e) => setCustomAssetPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 50"
            />
          </div>
          <button
            onClick={handleAddAsset}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors md:mt-6"
          >
            Add to Pie Chart
          </button>
        </div>
      </div>
      {customAssets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">My Custom Assets</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
            {customAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                <div>
                  <span className="font-medium text-gray-800">{asset.name}</span>:
                  <span className="ml-2 text-gray-600">${asset.value.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Chains</h3>
        {chains.map((chain) => (
          <div
            key={chain.chainId}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image src={chain.imgLarge} alt={chain.name} width={48} height={48} className="rounded-full" />
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{chain.name}</h4>
                  <span className="text-lg font-bold text-blue-600">${parseFloat(chain.value).toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Chain ID:</span>
                    <span className="ml-2 text-gray-700">{chain.chainId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Percentile:</span>
                    <span className="ml-2 text-gray-700">{parseFloat(chain.valuePercentile).toFixed(2)}%</span>
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
