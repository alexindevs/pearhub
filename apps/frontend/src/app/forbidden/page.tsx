export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">🚫 Access Denied</h1>
        <p className="text-muted-foreground">You {"don't"} have permission to view this page.</p>
      </div>
    </div>
  );
}
