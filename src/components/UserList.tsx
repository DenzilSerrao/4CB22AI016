import { User } from '../types';
import { Users } from 'lucide-react';

interface UserListProps {
  users: User[];
  loading: boolean;
}

export function UserList({ users, loading }: UserListProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">
                {user.commentCount} comments on posts
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}