"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveShopkeeperAction, rejectShopkeeperAction, changeUserRoleAction } from "@/backend/actions/admin-customers";

export default function CustomersClient({ users }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingId, setIsLoadingId] = useState(null);

  const retailCustomers = users.filter(u => u.role === "retail" || u.role === "shopkeeper_rejected");
  const shopkeepers = users.filter(u => u.role === "shopkeeper_approved");
  const pendingApprovals = users.filter(u => u.role === "shopkeeper_pending");

  const filterData = (data) => {
    return data.filter(u => 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleApprove = async (id, name) => {
    setIsLoadingId(id);
    const formData = new FormData();
    formData.append("id", id);
    const res = await approveShopkeeperAction(formData);
    if (res.error) toast.error(res.error);
    else toast.success(`Approved ${name} as Shopkeeper!`);
    setIsLoadingId(null);
  };

  const handleReject = async (id, name) => {
    if (!confirm(`Are you sure you want to reject ${name}? They will become a normal retail customer.`)) return;
    setIsLoadingId(id);
    const formData = new FormData();
    formData.append("id", id);
    const res = await rejectShopkeeperAction(formData);
    if (res.error) toast.error(res.error);
    else toast.info(`Rejected ${name}'s request.`);
    setIsLoadingId(null);
  };

  const handleChangeRole = async (id, name, newRole) => {
    const roleText = newRole === "retail" ? "Retailer" : "Shopkeeper";
    if (!confirm(`Change ${name}'s role to ${roleText}?`)) return;
    setIsLoadingId(id);
    const formData = new FormData();
    formData.append("id", id);
    formData.append("role", newRole);
    const res = await changeUserRoleAction(formData);
    if (res.error) toast.error(res.error);
    else toast.success(`${name} is now a ${roleText}!`);
    setIsLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers & Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Manage retail customers and approve wholesale shopkeeper accounts.</p>
      </div>

      {/* Search Bar Line (Moved outside Tabs for strict vertical layout) */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Search by name, email, phone or business..." 
          className="pl-9 bg-white border-gray-200 w-full shadow-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full flex flex-col space-y-4">
        {/* Tabs Line */}
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="bg-gray-100 p-1 flex flex-row w-max min-w-full sm:min-w-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 data-[state=active]:font-bold px-4">
              All ({users.length})
            </TabsTrigger>
            <TabsTrigger value="retail" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 data-[state=active]:font-bold px-4">
              Retail Customers ({retailCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="shopkeepers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 data-[state=active]:font-bold px-4">
              Shopkeepers ({shopkeepers.length})
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-yellow-700 data-[state=active]:font-bold px-4">
              Approvals
              {pendingApprovals.length > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-[10px] text-yellow-800 font-bold">
                  {pendingApprovals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Tab */}
        <TabsContent value="all" className="mt-0">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50 border-b">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">User Details</TableHead>
                  <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(users).map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{user.full_name}</span>
                        {user.business_name && (
                          <span className="text-xs text-gray-500 font-medium mt-0.5">Business: {user.business_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{user.email}</span>
                        {user.phone && <span className="text-xs text-gray-500">{user.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === 'retail' && <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Retail</Badge>}
                      {user.role === 'shopkeeper_approved' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Shopkeeper</Badge>}
                      {user.role === 'shopkeeper_pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Approval</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChangeRole(user.id, user.full_name, user.role === 'shopkeeper_approved' ? 'retail' : 'shopkeeper_approved')}
                          disabled={isLoadingId === user.id}
                          className="text-xs h-7"
                        >
                          {user.role === 'shopkeeper_approved' ? "Make Retailer" : "Make Shopkeeper"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filterData(users).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Retail Tab */}
        <TabsContent value="retail" className="mt-0">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50 border-b">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Customer Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-700">Joined On</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(retailCustomers).map((cust) => (
                  <TableRow key={cust.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{cust.full_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{cust.email}</span>
                        {cust.phone && <span className="text-xs text-gray-500">{cust.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(cust.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeRole(cust.id, cust.full_name, 'shopkeeper_approved')}
                        disabled={isLoadingId === cust.id}
                        className="text-xs h-7 text-green-700 border-green-200 hover:bg-green-50"
                      >
                        Make Shopkeeper
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filterData(retailCustomers).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">No retail customers found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Shopkeepers Tab */}
        <TabsContent value="shopkeepers" className="mt-0">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50 border-b">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Business Details</TableHead>
                  <TableHead className="font-semibold text-gray-700">Owner Contact</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(shopkeepers).map((sk) => (
                  <TableRow key={sk.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{sk.business_name || "N/A"}</span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">GST: {sk.gst_number || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 font-medium">{sk.full_name}</span>
                        <span className="text-xs text-gray-500">{sk.email}</span>
                        {sk.phone && <span className="text-xs text-gray-500">{sk.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-semibold">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeRole(sk.id, sk.full_name, 'retail')}
                        disabled={isLoadingId === sk.id}
                        className="text-xs h-7 text-gray-700 hover:text-red-700 hover:bg-red-50"
                      >
                        Make Retailer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filterData(shopkeepers).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">No approved shopkeepers found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="mt-0">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50 border-b">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Business Details</TableHead>
                  <TableHead className="font-semibold text-gray-700">Applicant</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(pendingApprovals).map((sk) => (
                  <TableRow key={sk.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{sk.business_name || "N/A"}</span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">GST: {sk.gst_number || "N/A"}</span>
                        {sk.business_address && <span className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{sk.business_address}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 font-medium">{sk.full_name}</span>
                        <span className="text-xs text-gray-500">{sk.email}</span>
                        {sk.phone && <span className="text-xs text-gray-500">{sk.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(sk.id, sk.full_name)} 
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                          disabled={isLoadingId === sk.id}
                        >
                          <CheckCircle className="mr-1.5 h-4 w-4" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleReject(sk.id, sk.full_name)} 
                          className="text-red-600 border-red-200 hover:bg-red-50 font-semibold"
                          disabled={isLoadingId === sk.id}
                        >
                          <XCircle className="mr-1.5 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filterData(pendingApprovals).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="font-medium text-gray-900">All caught up!</p>
                        <p className="text-sm">No pending shopkeeper approvals at the moment.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
