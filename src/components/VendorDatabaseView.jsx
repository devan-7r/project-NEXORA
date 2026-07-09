import React, { useState } from "react";
import { 
  Database, Search, Filter, ShieldCheck, ShieldAlert, Check, Ban, 
  AlertTriangle, ArrowUpRight, TrendingUp, Info
} from "lucide-react";

export default function VendorDatabaseView({ vendors, setVendors, invoices }) {
  const [vendorSearch, setVendorSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleBlacklist = (vendorId) => {
    setVendors(prev => 
      prev.map(v => v.id === vendorId ? { ...v, status: "Suspicious", trustScore: Math.max(10, v.trustScore - 40) } : v)
    );
  };

  const handleWhitelist = (vendorId) => {
    setVendors(prev => 
      prev.map(v => v.id === vendorId ? { ...v, status: "Verified", trustScore: Math.min(100, v.trustScore + 30) } : v)
    );
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = 
      v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.id.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.gst.toLowerCase().includes(vendorSearch.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Overview stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Vendors */}
        <div className="glass-card p-4 flex justify-between items-center">
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Registries</span>
            <span className="text-2xl font-black text-white font-mono">{vendors.length}</span>
          </div>
          <Database className="w-8 h-8 text-blue-500/20" />
        </div>

        {/* Verified Vendors */}
        <div className="glass-card p-4 border-l-2 border-l-emerald-500 flex justify-between items-center">
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Verified Partners</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {vendors.filter(v => v.status === "Verified").length}
            </span>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-500/20" />
        </div>

        {/* Suspicious/Blacklisted */}
        <div className="glass-card p-4 border-l-2 border-l-red-500 flex justify-between items-center">
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Threat Blocklist</span>
            <span className="text-2xl font-black text-red-500 font-mono">
              {vendors.filter(v => v.status === "Suspicious").length}
            </span>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-500/20" />
        </div>

      </div>

      {/* Main Vendor Table and Filter Panel */}
      <div className="glass-panel p-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Central Vendor Register</h3>
          </div>

          <div className="flex flex-wrap gap-2 hide-presentation">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text" 
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Search vendor or GST..."
                className="input-premium pl-9 py-1 text-xs bg-slate-900 border-white/5 w-48 text-gray-200"
              />
            </div>

            {/* Status Selector */}
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-premium text-xs py-1 bg-slate-900 border-white/5"
            >
              <option value="ALL">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Suspicious">Suspicious</option>
            </select>
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-400">
                <th className="p-3 font-semibold">Vendor ID</th>
                <th className="p-3 font-semibold">Vendor Name</th>
                <th className="p-3 font-semibold">GSTIN Registration</th>
                <th className="p-3 font-semibold">Activity Registry</th>
                <th className="p-3 font-semibold">Trust Index</th>
                <th className="p-3 font-semibold">Compliance Status</th>
                <th className="p-3 font-semibold text-center">Trust Controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No registry matches found.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vend) => (
                  <tr key={vend.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-gray-400 font-bold">{vend.id}</td>
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-white block">{vend.name}</span>
                        <span className="text-[9px] text-gray-500 block">Registered: {vend.registrationDate}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-gray-300">{vend.gst}</td>
                    
                    {/* Activity log summary */}
                    <td className="p-3">
                      <div className="text-gray-300">
                        <span className="font-semibold">{vend.invoicesProcessed}</span> Invoices
                        <span className="block text-[9px] text-gray-500 font-medium">Avg Amount: ₹{vend.averageAmount.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Trust progress bar */}
                    <td className="p-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              vend.trustScore >= 90 ? "bg-emerald-500" : vend.trustScore >= 60 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${vend.trustScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-white">{vend.trustScore}</span>
                      </div>
                    </td>

                    {/* Compliance status badge */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                        vend.status === "Verified" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {vend.status === "Verified" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {vend.status === "Verified" ? "Verified Active" : "Blacklisted Threat"}
                      </span>
                      {vend.activeStatus === "Inactive" && (
                        <span className="text-[8px] bg-slate-900 border border-white/5 text-gray-500 px-1 rounded block mt-1 w-max">
                          Inactive 18m
                        </span>
                      )}
                    </td>

                    {/* Trust action switches */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 hide-presentation">
                        {vend.status === "Verified" ? (
                          <button
                            onClick={() => handleBlacklist(vend.id)}
                            className="btn-premium border-red-500/20 bg-red-950/5 hover:bg-red-900/15 text-red-400 p-1.5 rounded"
                            title="Blacklist Vendor Registry"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleWhitelist(vend.id)}
                            className="btn-premium border-emerald-500/20 bg-emerald-950/5 hover:bg-emerald-900/15 text-emerald-400 p-1.5 rounded"
                            title="Restore Vendor Trust"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
