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

  const [customAssets, setCustomAssets] = useState<{ id: number; name: string; quantity: number; price: number }[]>([]);
  const [customAssetName, setCustomAssetName] = useState('');
  const [customAssetQuantity, setCustomAssetQuantity] = useState('');
  const [customAssetPrice, setCustomAssetPrice] = useState('');

  useEffect(() => {
    try {
      const savedCustomAssets = localStorage.getItem('customAssets');
      if (savedCustomAssets) {
        setCustomAssets(JSON.parse(savedCustomAssets));
      }
    } catch (e) {
      console.error('Failed to load custom assets from localStorage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('customAssets', JSON.stringify(customAssets));
    } catch (e) {
      console.error('Failed to save custom assets to localStorage', e);
    }
  }, [customAssets]);

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

  const assetsPieData = useMemo(() => {
    const customAssetsForPie = customAssets.map(({ name, quantity, price }) => ({ name, value: quantity * price }));
    return [...apiAssets, ...customAssetsForPie];
  }, [apiAssets, customAssets]);

  const handleAddAsset = () => {
    if (customAssetName && customAssetQuantity && customAssetPrice) {
      const quantity = parseFloat(customAssetQuantity);
      const price = parseFloat(customAssetPrice);
      if (!isNaN(quantity) && !isNaN(price)) {
        const newAsset = { id: Date.now(), name: customAssetName, quantity, price };
        setCustomAssets((prev) => [...prev, newAsset]);
        setCustomAssetName('');
        setCustomAssetQuantity('');
        setCustomAssetPrice('');
      }
    }
  };

  const handleDeleteAsset = (id: number) => {
    setCustomAssets((prev) => prev.filter((asset) => asset.id !== id));
  };

  if (isLoading) return <p>Loading...</p>;

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="font-semibold text-red-800">Error</p>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md">
        <p className="text-sm text-gray-600 mb-1">Net Worth</p>
        <p className="text-3xl font-bold text-gray-900">${data?.networth}</p>
        <p className="text-xs text-gray-500 mt-1">{data?.address}</p>
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
            <label htmlFor="assetQuantity" className="text-sm font-medium text-gray-700">
              Custom Asset Quantity
            </label>
            <input
              type="number"
              id="assetQuantity"
              value={customAssetQuantity}
              onChange={(e) => setCustomAssetQuantity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 10"
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
              placeholder="e.g. 50.25"
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

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Assets by Protocol</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
          <AssetsPie data={assetsPieData} />
        </div>
      </div>

      {customAssets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">My Custom Assets</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2 font-semibold text-gray-600">Name</th>
                  <th className="p-2 font-semibold text-gray-600">Quantity</th>
                  <th className="p-2 font-semibold text-gray-600">Price</th>
                  <th className="p-2 font-semibold text-gray-600">Total Value</th>
                  <th className="p-2 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customAssets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-800">{asset.name}</td>
                    <td className="p-2 text-gray-600">{asset.quantity}</td>
                    <td className="p-2 text-gray-600">${asset.price.toFixed(2)}</td>
                    <td className="p-2 text-gray-600">${(asset.quantity * asset.price).toFixed(2)}</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
