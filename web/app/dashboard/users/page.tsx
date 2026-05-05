'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card, Input } from '@/components/FormElements';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getUsersByRole, searchUsers, getUserStats } from '@/lib/user-service';
import { UserProfile } from '@/lib/auth-context';

export default function UsersPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, hrCount: 0, attendeeCount: 0 });
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [filterRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userStats = await getUserStats();
      setStats(userStats);

      let fetchedUsers: UserProfile[] = [];
      if (filterRole === 'all') {
        const hrs = await getUsersByRole('hr');
        const attendees = await getUsersByRole('attendee');
        fetchedUsers = [...hrs, ...attendees];
      } else {
        fetchedUsers = await getUsersByRole(filterRole);
      }
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      try {
        const results = await searchUsers(value);
        setUsers(results);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      loadData();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">View and manage all system users</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalUsers}</div>
              <p className="text-gray-600 text-sm">Total Users</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.hrCount}</div>
              <p className="text-gray-600 text-sm">HR Managers</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.attendeeCount}</div>
              <p className="text-gray-600 text-sm">Attendees</p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Search users"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="hr">HR Managers</option>
                  <option value="attendee">Attendees</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'hr'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'hr' ? 'HR Manager' : 'Attendee'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.department || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
