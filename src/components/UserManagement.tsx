
import { motion } from "framer-motion";
import type { UserAccount } from "@/utils/types";
import { Badge } from "@/components/ui/badge";

const users: UserAccount[] = [
  {
    username: "user1",
    created: new Date("2024-01-01"),
    expires: new Date("2024-02-01"),
    status: "active",
  },
  {
    username: "user2",
    created: new Date("2024-01-15"),
    expires: new Date("2024-02-15"),
    status: "active",
  },
];

export const UserManagement = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Username</th>
              <th className="text-left py-2">Created</th>
              <th className="text-left py-2">Expires</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.username} className="border-b">
                <td className="py-2 font-mono">{user.username}</td>
                <td className="py-2">
                  {user.created.toLocaleDateString()}
                </td>
                <td className="py-2">
                  {user.expires.toLocaleDateString()}
                </td>
                <td className="py-2">
                  <Badge
                    variant={user.status === "active" ? "default" : "destructive"}
                  >
                    {user.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
