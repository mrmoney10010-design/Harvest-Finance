"use client";

import React from "react";
import { Database, Coins, TrendingUp } from "lucide-react";
import { VaultCard, VaultProps } from "./VaultCard";

const mockVaults: VaultProps[] = [
  {
    id: "1",
    name: "USDC Stable Yield",
    asset: "USDC",
    apy: "12.5%",
    tvl: "$1.2M",
    balance: "2,450",
    walletBalance: "5,300",
    icon: <Database className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
  },
  {
    id: "2",
    name: "ETH Staking Vault",
    asset: "ETH",
    apy: "4.8%",
    tvl: "$4.5M",
    balance: "0.85",
    walletBalance: "1.42",
    icon: <Coins className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
  },
  {
    id: "3",
    name: "Harvest Liquidity",
    asset: "HARV",
    apy: "24.2%",
    tvl: "$820K",
    balance: "184",
    walletBalance: "420",
    icon: <TrendingUp className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
  },
];

export function VaultOverview() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Active Vaults
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Explore opportunities, deposit assets, and watch your yields grow.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mockVaults.map((vault) => (
          <VaultCard key={vault.id} {...vault} />
        ))}
      </div>
    </section>
  );
}
