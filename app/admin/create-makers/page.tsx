import CreateMakersForm from "@/components/auth/create-makers-form";
import React from "react";

function AdminCreateMakersPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Create and Manage Team Accounts</p>
      </div>

      <div className="max-w-md bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Makers</h2>
        <CreateMakersForm />
      </div>
    </div>
  );
}

export default AdminCreateMakersPage;
