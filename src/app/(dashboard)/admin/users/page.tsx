"use client";

import * as React from "react";
import { Users, Shield, UserCircle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { Profile, UserRole } from "@/lib/types";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data as Profile[]);
    } catch (err) {
      console.error("Error loading profiles:", err);
      toast.error("Failed to load user list.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("User role updated successfully!");
    } catch (err: any) {
      console.error("Role update error:", err);
      toast.error(err.message || "Failed to change role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "inspector":
        return "secondary";
      default:
        return "primary";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Admin tool to review profiles and assign dashboard access roles
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No registered user profiles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-muted-foreground font-semibold">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Active Role</th>
                    <th className="px-6 py-4">Action Role Settings</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                          {u.full_name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">{u.full_name}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          className="max-w-[150px] h-9"
                          value={u.role}
                          disabled={updatingUserId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        >
                          <option value="customer">CUSTOMER</option>
                          <option value="inspector">INSPECTOR</option>
                          <option value="admin">ADMIN</option>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
