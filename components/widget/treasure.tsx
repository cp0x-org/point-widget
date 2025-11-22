'use client';

import { useGetPortfolio } from '@/services/octav/loader';
import Image from 'next/image';
import { Asset, ChainSummary } from '@/types/portfolio';
import AssetsPie from './assets-pie';
import { useState, useEffect, useMemo } from 'react';
import { useUserPoints } from '@/hooks/useUserPoints';

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

interface Project {
  id: number;
  name: string;
  fdv: number;
  percent: number;
}

interface Project {
  id: number;
  name: string;
  fdv: number;
  percent: number;
  totalPoints: number;
  pointPrice: number;
}

export default function Treasure() {
  const { data, isLoading, error } = useGetPortfolio({
    address: '0x4c82cfF7398f3D43b36e41B10fF6F42b14DD9385',
    includeImages: true,
    includeExplorerUrls: true,
    waitForSync: true,
  });

  const { data: userPoints, loading: isLoadingPoints } = useUserPoints();

  const [customAssets, setCustomAssets] = useState<{ id: number; name: string; quantity: number; price: number }[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [projectName, setProjectName] = useState('');
  const [projectFDV, setProjectFDV] = useState('');
  const [tokenPercent, setTokenPercent] = useState('');
  const [totalPoints, setTotalPoints] = useState('');

  useEffect(() => {
    try {
      const savedCustomAssets = localStorage.getItem('customAssets');
      if (savedCustomAssets) {
        setCustomAssets(JSON.parse(savedCustomAssets));
      }
      const projects = localStorage.getItem('projects');
      if (projects) {
        setProjects(JSON.parse(projects));
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

  // Sync userPoints with customAssets when data is loaded
  useEffect(() => {
    console.log(111111111);
    if (userPoints && !isLoadingPoints && Object.values(projects).length > 0) {
      console.log(222222);
      const newCustomAssets = [...customAssets];

      Object.values(projects).forEach((project) => {
        // Find matching userPoint by name
        const matchingUserPoint = userPoints.find((point: any) => point.name === project.name);
        console.log(matchingUserPoint);
        console.log(project.name);
        if (matchingUserPoint) {
          // Check if this asset is not already in customAssets
          const existingAsset = newCustomAssets.find((asset) => asset.name === project.name);

          if (!existingAsset) {
            // Add to customAssets
            const newAsset = {
              id: Date.now() + Math.random(), // Ensure unique ID
              name: project.name,
              quantity: matchingUserPoint.quantity || 0,
              price: project.pointPrice || 0,
            };
            newCustomAssets.push(newAsset);
          }
        }
      });

      // Update customAssets if we found new matches
      if (newCustomAssets.length > customAssets.length) {
        setCustomAssets(newCustomAssets);
      }
    }
  }, [userPoints, isLoadingPoints, projects, customAssets]);

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

  const handleAddProjectData = () => {
    if (projectName && projectFDV && tokenPercent && totalPoints) {
      const fdv = parseFloat(projectFDV);
      const percent = parseFloat(tokenPercent);
      const points = parseFloat(totalPoints);
      if (!isNaN(fdv) && !isNaN(percent) && !isNaN(points)) {
        // const price = fdv / (1 + percent / 100);
        const price = fdv / points;
        const newProject: Project = {
          id: Date.now(),
          name: projectName,
          fdv: fdv,
          percent: percent,
          totalPoints: points,
          pointPrice: price,
        };
        setProjects((prev) => ({
          ...prev,
          [newProject.name]: newProject,
        }));
        setProjectName('');
        setProjectFDV('');
        setTokenPercent('');
      }
    }
  };

  const handleDeleteAsset = (id: number) => {
    setCustomAssets((prev) => prev.filter((asset) => asset.id !== id));
  };

  const handleDeleteProject = (id: number) => {
    setProjects((prev) => {
      const updated = { ...prev };
      for (const key in updated) {
        if (updated[key].id === id) {
          delete updated[key];
        }
      }
      return updated;
    });
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

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Assets by Protocol</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
          <AssetsPie data={assetsPieData} />
        </div>
      </div>
      <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800">Project Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="projectName" className="text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. Backpack"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="projectFDV" className="text-sm font-medium text-gray-700">
              Project Apr. FDV ($)
            </label>
            <input
              type="number"
              id="projectFDV"
              value={projectFDV}
              onChange={(e) => setProjectFDV(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 10"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="tokenPercent" className="text-sm font-medium text-gray-700">
              Project Token Percent
            </label>
            <input
              type="number"
              id="tokenPercent"
              value={tokenPercent}
              onChange={(e) => setTokenPercent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 50.25"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="totalPoints" className="text-sm font-medium text-gray-700">
              Total Points
            </label>
            <input
              type="number"
              id="totalPoints"
              value={totalPoints}
              onChange={(e) => setTotalPoints(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 50.25"
            />
          </div>
          <button
            onClick={handleAddProjectData}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors md:mt-6"
          >
            Add Project Data
          </button>
        </div>
      </div>

      {Object.values(projects).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">My Project Configuration</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2 font-semibold text-gray-600">Name</th>
                  <th className="p-2 font-semibold text-gray-600">FDV</th>
                  <th className="p-2 font-semibold text-gray-600">%, tokens</th>
                  <th className="p-2 font-semibold text-gray-600">Total Points</th>
                  <th className="p-2 font-semibold text-gray-600">Point Price</th>
                  <th className="p-2 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(projects).map((pr) => (
                  <tr key={pr.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-800">{pr.name}</td>
                    <td className="p-2 text-gray-600">{pr.fdv} $</td>
                    <td className="p-2 text-gray-600">{pr.percent} %</td>
                    <td className="p-2 text-gray-600">{pr.totalPoints}</td>
                    <td className="p-2 text-gray-600">{pr.pointPrice} $</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => handleDeleteProject(pr.id)}
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
                </tr>
              </thead>
              <tbody>
                {customAssets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-800">{asset.name}</td>
                    <td className="p-2 text-gray-600">{asset.quantity}</td>
                    <td className="p-2 text-gray-600">${asset.price.toFixed(2)}</td>
                    <td className="p-2 text-gray-600">${(asset.quantity * asset.price).toFixed(2)}</td>
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
