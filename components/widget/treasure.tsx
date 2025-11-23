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

  const [customAssets, setCustomAssets] = useState<{ id: number; name: string; quantity: number; price: number; hasProject: boolean }[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [projectName, setProjectName] = useState('');
  const [projectFDV, setProjectFDV] = useState('');
  const [tokenPercent, setTokenPercent] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    name: string;
    fdv: string;
    percent: string;
    totalPoints: string;
  }>({
    name: '',
    fdv: '',
    percent: '',
    totalPoints: '',
  });

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

  useEffect(() => {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  }, [projects]);

  // Sync userPoints with customAssets when data is loaded
  useEffect(() => {
    if (userPoints && !isLoadingPoints) {
      const newCustomAssets = [...customAssets];

      userPoints.forEach((userPoint: any) => {
        // Check if this asset is not already in customAssets
        const existingAsset = newCustomAssets.find((asset) => asset.name === userPoint.name);

        if (!existingAsset) {
          // Find matching project by name
          const matchingProject = Object.values(projects).find((project) => project.name.trim() === userPoint.name.trim());

          // Add to customAssets
          const newAsset = {
            id: Date.now() + Math.random(), // Ensure unique ID
            name: userPoint.name,
            quantity: userPoint.quantity || 0,
            price: matchingProject ? matchingProject.pointPrice : 0,
            hasProject: !!matchingProject,
          };
          newCustomAssets.push(newAsset);
        } else {
          // Update existing asset with project info if project was added
          const matchingProject = Object.values(projects).find((project) => project.name.trim() === userPoint.name.trim());
          const existingAssetIndex = newCustomAssets.findIndex((asset) => asset.name === userPoint.name);

          if (existingAssetIndex !== -1) {
            newCustomAssets[existingAssetIndex] = {
              ...newCustomAssets[existingAssetIndex],
              price: matchingProject ? matchingProject.pointPrice : 0,
              hasProject: !!matchingProject,
            };
          }
        }
      });

      // Update customAssets if we found new matches or updates
      if (newCustomAssets.length !== customAssets.length || 
          newCustomAssets.some((asset, index) => 
            !customAssets[index] || 
            asset.hasProject !== customAssets[index]?.hasProject ||
            asset.price !== customAssets[index]?.price
          )) {
        setCustomAssets(newCustomAssets);
      }
    }
  }, [userPoints, isLoadingPoints, projects]);

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
        const price = (fdv * (percent / 100)) / points;
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

        // Update existing custom assets that match this project name
        setCustomAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.name === projectName
              ? { ...asset, price: price, hasProject: true }
              : asset
          )
        );

        setProjectName('');
        setProjectFDV('');
        setTokenPercent('');
        setTotalPoints('');
      }
    }
  };

  const handleDeleteProject = (id: number) => {
    setProjects((prev) => {
      const updated = { ...prev };
      let projectName = '';

      // Find project name before deleting
      for (const key in updated) {
        if (updated[key].id === id) {
          projectName = updated[key].name;
          delete updated[key];
          break;
        }
      }

      // Update related custom assets to not have project
      if (projectName) {
        setCustomAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.name === projectName
              ? { ...asset, price: 0, hasProject: false }
              : asset
          )
        );
      }

      return updated;
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project.id);
    setEditValues({
      name: project.name,
      fdv: project.fdv.toString(),
      percent: project.percent.toString(),
      totalPoints: project.totalPoints.toString(),
    });
  };

  const handleSaveProject = (id: number) => {
    const fdv = parseFloat(editValues.fdv);
    const percent = parseFloat(editValues.percent);
    const totalPoints = parseFloat(editValues.totalPoints);

    if (!editValues.name.trim() || isNaN(fdv) || isNaN(percent) || isNaN(totalPoints)) {
      return;
    }

    const pointPrice = fdv / totalPoints;

    setProjects((prev) => {
      const updated = { ...prev };

      // Find the current project to update
      for (const key in updated) {
        if (updated[key].id === id) {
          const oldName = updated[key].name;

          // Delete the old key if name changed
          if (oldName !== editValues.name) {
            delete updated[key];
          }

          // Add the updated project
          updated[editValues.name] = {
            id,
            name: editValues.name,
            fdv,
            percent,
            totalPoints,
            pointPrice,
          };

          // Update custom assets if name changed
          if (oldName !== editValues.name) {
            setCustomAssets((prevAssets) =>
              prevAssets.map((asset) =>
                asset.name === oldName ? { ...asset, name: editValues.name, price: pointPrice, hasProject: true } : asset
              )
            );
          } else {
            // Update price if other values changed
            setCustomAssets((prevAssets) =>
              prevAssets.map((asset) => (asset.name === editValues.name ? { ...asset, price: pointPrice, hasProject: true } : asset))
            );
          }

          break;
        }
      }

      return updated;
    });

    setEditingProject(null);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditValues({
      name: '',
      fdv: '',
      percent: '',
      totalPoints: '',
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
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Assets by Protocol</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
          <AssetsPie data={assetsPieData} />
        </div>
      </div>
      <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800">Project Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                    <td className="p-2">
                      {editingProject === pr.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{pr.name}</span>
                      )}
                    </td>
                    <td className="p-2">
                      {editingProject === pr.id ? (
                        <input
                          type="number"
                          value={editValues.fdv}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, fdv: e.target.value }))}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-600">{pr.fdv} $</span>
                      )}
                    </td>
                    <td className="p-2">
                      {editingProject === pr.id ? (
                        <input
                          type="number"
                          value={editValues.percent}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, percent: e.target.value }))}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-600">{pr.percent} %</span>
                      )}
                    </td>
                    <td className="p-2">
                      {editingProject === pr.id ? (
                        <input
                          type="number"
                          value={editValues.totalPoints}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, totalPoints: e.target.value }))}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-600">{pr.totalPoints}</span>
                      )}
                    </td>
                    <td className="p-2 text-gray-600">{pr.pointPrice.toFixed(6)} $</td>
                    <td className="p-2 text-right">
                      {editingProject === pr.id ? (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleSaveProject(pr.id)}
                            className="text-green-600 hover:text-green-800 font-semibold text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-500 hover:text-gray-700 font-semibold text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEditProject(pr)}
                            className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(pr.id)}
                            className="text-red-500 hover:text-red-700 font-semibold text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
              {customAssets.length > 0 ? (
                customAssets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-800">{asset.name}</td>
                    <td className="p-2 text-gray-600">{asset.quantity}</td>
                    <td className="p-2 text-gray-600">
                      {asset.hasProject ? `$${asset.price.toFixed(6)}` : '-'}
                    </td>
                    <td className="p-2 text-gray-600">
                      {asset.hasProject ? `$${(asset.quantity * asset.price).toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No custom assets yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
