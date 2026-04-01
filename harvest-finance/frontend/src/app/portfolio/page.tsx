"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Wallet } from "lucide-react";
import { Button, Container, Section } from "@/components/ui";
import { PortfolioOverview } from "@/components/portfolio/PortfolioOverview";
import { TransactionTable } from "@/components/portfolio/TransactionTable";
import { MOCK_STATS, MOCK_TRANSACTIONS } from "@/lib/mock-data";

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <nav className="sticky top-0 z-10 mb-8 border-b border-gray-100 bg-white/80 py-4 backdrop-blur-md">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              </Link>
              <h1 className="border-l border-gray-200 pl-4 text-xl font-bold text-gray-900">
                My Portfolio
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-4 h-4" />}
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Wallet className="w-4 h-4" />}
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      <Container>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Section paddingY="none" className="mb-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Portfolio Overview
              </h2>
              <p className="text-gray-500">
                Track your assets, earnings, and performance across all Harvest
                vaults.
              </p>
            </div>
            <PortfolioOverview stats={MOCK_STATS} />
          </Section>

          <Section paddingY="none">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Transaction History
              </h2>
              <p className="text-gray-500">
                A detailed log of your deposits, withdrawals, and reward claims.
              </p>
            </div>
            <TransactionTable transactions={MOCK_TRANSACTIONS} />
          </Section>
        </motion.div>
      </Container>
    </main>
  );
}
