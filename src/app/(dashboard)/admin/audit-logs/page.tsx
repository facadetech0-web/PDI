"use client";

import * as React from "react";
import { ClipboardList, ShieldAlert, Filter, Calendar, Terminal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuditService } from "@/lib/services/audit.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";

export default function AdminAuditLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = React.useState<any[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionFilter, setActionFilter] = React.useState("");
  const [entityFilter, setEntityFilter] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const limit = 15;

  const auditService = React.useMemo(
    () => new AuditService(supabase),
    [supabase]
  );

  const loadLogs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const { logs: logsList, total } = await auditService.listAuditLogs({
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
        limit,
        offset,
      });
      setLogs(logsList);
      setTotalCount(total);
    } catch (err: any) {
      console.error("Error loading audit logs:", err);
      toast.error("Failed to load audit logs trail.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, actionFilter, entityFilter, auditService]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-gradient flex items-center gap-2">
          Security Audit Trail
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review administrator logins, inspector modifications, templates revisions, and invoice payments compliance logs.
        </p>
      </div>

      {/* Filters Row */}
      <Card className="p-4 border-white/5 bg-card/45 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Select
              label="Filter by Action"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
            </Select>
          </div>

          <div className="flex-1 w-full">
            <Select
              label="Filter by Entity"
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Entities</option>
              <option value="bookings">Bookings</option>
              <option value="inspections">Inspections</option>
              <option value="templates">Templates</option>
              <option value="profiles">Profiles</option>
              <option value="coupons">Coupons</option>
              <option value="invoices">Invoices</option>
            </Select>
          </div>
          
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5 cursor-pointer h-10 w-full sm:w-auto"
            onClick={() => {
              setActionFilter("");
              setEntityFilter("");
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Logs and Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Logs Table column */}
        <Card className="lg:col-span-2 border-white/5 bg-card/45 backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Audit Log Records</h3>
            <span className="text-xs text-muted-foreground">{totalCount} logs tracked</span>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-20">
                <ShieldAlert className="h-10 w-10 text-muted-foreground/45 mb-3 mx-auto" />
                <p className="text-sm text-muted-foreground">No audit log entries matching filters found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground font-medium bg-black/10">
                      <th className="px-6 py-4">Operator</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Entity</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`cursor-pointer hover:bg-white/[0.03] transition-colors ${
                          selectedLog?.id === log.id ? "bg-white/[0.04]" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-foreground">
                              {log.profile?.full_name || "System Automated"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {log.profile?.email || ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            log.action === "delete"
                              ? "bg-destructive/15 text-destructive border border-destructive/20"
                              : log.action === "create"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : log.action === "update"
                              ? "bg-primary/15 text-primary border border-primary/20"
                              : "bg-white/5 text-muted-foreground border border-white/10"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-foreground font-medium">
                          {log.entity_type}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="border-white/10 cursor-pointer text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || isLoading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="border-white/10 cursor-pointer text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Selected Log Inspector Payload column */}
        <Card className="border-white/5 bg-card/45 backdrop-blur-xl h-[80vh] flex flex-col">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Change Payload Inspector</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedLog ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Log ID</span>
                  <p className="text-foreground font-mono truncate mt-0.5">{selectedLog.id}</p>
                </div>
                
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target Entity UUID</span>
                  <p className="text-foreground font-mono truncate mt-0.5">{selectedLog.entity_id || "None"}</p>
                </div>

                {selectedLog.old_data && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Old State Data</span>
                    <pre className="p-3 bg-black/30 rounded-lg border border-white/5 text-muted-foreground font-mono overflow-x-auto text-[10px] leading-relaxed">
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_data && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">New State Data</span>
                    <pre className="p-3 bg-black/30 rounded-lg border border-white/5 text-emerald-400 font-mono overflow-x-auto text-[10px] leading-relaxed">
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </pre>
                  </div>
                )}

                {!selectedLog.old_data && !selectedLog.new_data && (
                  <div className="text-center text-muted-foreground py-10">
                    No difference payloads stored.
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/60 text-xs">
                <ClipboardList className="h-10 w-10 mb-2 text-muted-foreground/35" />
                Select a log row from the table list to inspect the raw state difference payload.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
