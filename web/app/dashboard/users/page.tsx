'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserProfile } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/route-guard';
import { Card, Input } from '@/components/FormElements';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  getUsersByRole,
  getUserStats,
  updateUserProfile,
  changeUserRole,
  deleteUserProfile,
} from '@/lib/user-service';

type EditForm = {
  name: string;
  department: string;
  position: string;
  role: 'hr' | 'attendee';
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [stats, setStats] = useState({ totalUsers: 0, hrCount: 0, attendeeCount: 0 });

  // Edit modal state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', department: '', position: '', role: 'attendee' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    loadData();
  }, [filterRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hrs, attendees] = await Promise.all([
        getUsersByRole('hr'),
        getUsersByRole('attendee'),
      ]);
      const all = [...hrs, ...attendees];
      setStats({ totalUsers: all.length, hrCount: hrs.length, attendeeCount: attendees.length });

      if (filterRole === 'all') setUsers(all);
      else if (filterRole === 'hr') setUsers(hrs);
      else setUsers(attendees);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (u: UserProfile) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      department: u.department || '',
      position: u.position || '',
      role: u.role as 'hr' | 'attendee',
    });
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    setEditError('');
    try {
      await updateUserProfile(editingUser.uid, {
        name: editForm.name,
        department: editForm.department,
        position: editForm.position,
      });
      if (editForm.role !== editingUser.role) {
        await changeUserRole(editingUser.uid, editForm.role);
      }
      setEditingUser(null);
      await loadData();
    } catch (err: any) {
      setEditError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: UserProfile) => {
    if (!confirm(`Remove "${u.name}" (${u.email}) from the system? This cannot be undone.`)) return;
    try {
      await deleteUserProfile(u.uid);
      await loadData();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const filtered = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const t = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(t) ||
      u.email?.toLowerCase().includes(t) ||
      u.department?.toLowerCase().includes(t)
    );
  });

  if (loading) return <LoadingSpinner />;

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">View, edit profiles, change roles, and remove users</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Search users"
                placeholder="Search by name, email or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => { setFilterRole(e.target.value); setSearchTerm(''); }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((u) => (
                      <tr key={u.uid} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{u.name}</td>
                        <td className="py-3 px-4 text-gray-900">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'hr' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {u.role === 'hr' ? 'HR Manager' : 'Attendee'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{u.department || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(u)}
                              className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                            >
                              Edit
                            </button>
                            {u.uid !== currentUser?.uid && (
                              <button
                                onClick={() => handleDelete(u)}
                                className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Edit User</h2>
            <p className="text-sm text-gray-500 mb-6">{editingUser.email}</p>

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {editError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'hr' | 'attendee' })}
                  disabled={editingUser.uid === currentUser?.uid}
                >
                  <option value="attendee">Attendee</option>
                  <option value="hr">HR Manager</option>
                </select>
                {editingUser.uid === currentUser?.uid && (
                  <p className="text-xs text-gray-500 mt-1">You cannot change your own role.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="e.g., Water Quality"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  placeholder="e.g., Technician"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}


