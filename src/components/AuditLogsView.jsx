import React, { useState } from "react";
import { History, Search, Filter, Download, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { exportToCSV, exportToJSON } from "../utils/exportHelper";

export default function AuditLogsView({ auditLogs, onOpenInvoice }) {
  const [logSearch, setLogSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.invoiceNumber.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.location.toLowerCase().includes(logSearch.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const triggerCSVDownload = () => {
    // Generate CSV data from logs
    const headers = ["Timestamp", "User", "Action", "Status", "IP Address", "Device", "Location", "Invoice Number", "Verification Result"];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      `"${log.user}"`,
      `"${log.action}"`,
      log.status,
      log.ipAddress,
      `"${log.device}"`,
      `"${log.location}"`,
      log.invoiceNumber,
      `"${log.result}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fraudshield_compliance_audit_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Logs Table Card */}
      <div className="glass-panel p-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Institutional Compliance Log</h3>
          </div>

          <div className="flex flex-wrap gap-2 hide-presentation">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text" 
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="input-premium pl-9 py-1 text-xs bg-slate-900 border-white/5 w-48 text-gray-200"
              />
            </div>

            {/* Status */}
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-premium text-xs py-1 bg-slate-900 border-white/5"
            >
              <option value="ALL">All Status</option>
              <option value="Success">Success</option>
              <option value="Warning">Warning</option>
            </select>

            {/* CSV export */}
            <button 
              onClick={triggerCSVDownload}
              className="btn-premium px-3 py-1 text-xs border-blue-500/20 bg-blue-950/5 text-blue-400"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-400">
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Operator / node</th>
                <th className="p-3 font-semibold">Action Description</th>
                <th className="p-3 font-semibold">Diagnostic Result</th>
                <th className="p-3 font-semibold">Audit status</th>
                <th className="p-3 font-semibold text-center">References</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No compliance history matching parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {/* Timestamp */}
                    <td className="p-3 font-mono text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    
                    {/* User */}
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-white block">{log.user}</span>
                        <span className="text-[9px] text-gray-500 block font-mono">IP: {log.ipAddress} ({log.location})</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-3 font-medium text-gray-200">
                      {log.action}
                      <span className="text-[8px] text-gray-500 block">{log.device}</span>
                    </td>

                    {/* Result */}
                    <td className="p-3 text-gray-300 font-medium">
                      {log.result}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                        log.status === "Success" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {log.status === "Success" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>

                    {/* Actions links */}
                    <td className="p-3 text-center">
                      {log.invoiceNumber !== "N/A" ? (
                        <button 
                          onClick={() => onOpenInvoice(log.invoiceNumber)}
                          className="text-[10px] text-blue-400 hover:underline font-bold"
                        >
                          View {log.invoiceNumber}
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-600 font-mono">-</span>
                      )}
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
