'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card, Input } from '@/components/FormElements';
import { Button } from '@/components/Button';
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
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load stats
      const userStats = await getUserStats();
      setStats(userStats);

      // Load users
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
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">User Management</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
              <p className="text-gray-600">Total Users</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.hrCount}</div>
              <p className="text-gray-600">HR Managers</p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.attendeeCount}</div>
              <p className="text-gray-600">Attendees</p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.uid} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'hr'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'hr' ? 'HR Manager' : 'Attendee'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.department || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            user.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
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
