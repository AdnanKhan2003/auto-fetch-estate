import UsersList from "@/components/auth/users-list";

function ViewUsersPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">All Users</h1>
        <p className="text-muted-foreground">
          Manange and View All Registered Accounts
        </p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <UsersList />
      </div>
    </div>
  );
}

export default ViewUsersPage;
