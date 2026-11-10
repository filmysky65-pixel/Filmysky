
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardPage from './admin/AdminDashboardPage';
import AdminContentPage from './admin/AdminContentPage';
import AdminContentForm from './admin/AdminContentForm';
import AdminLiveTvPage from './admin/AdminLiveTvPage';
import AdminLiveTvStreamsPage from './admin/AdminLiveTvStreamsPage';
import AdminUsersPage from './admin/AdminUsersPage';
import AdminRequestsPage from './admin/AdminRequestsPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import LoadingScreen from '../components/LoadingScreen';
import AdminSubscriptionsPage from './admin/AdminSubscriptionsPage';
import AdminPaymentsPage from './admin/AdminPaymentsPage';
import AdminContactsPage from './admin/AdminContactsPage';
import AdminAdsPage from './admin/AdminAdsPage';
import AdminYouTubePage from './admin/AdminYouTubePage';


const AdminPage: React.FC = () => {
    const { isAdmin, authLoading } = useAppContext();

    if (authLoading) {
        return <LoadingScreen />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <AdminLayout>
            <Routes>
                <Route index element={<AdminDashboardPage />} />
                <Route path="content" element={<AdminContentPage />} />
                <Route path="content/new" element={<AdminContentForm />} />
                <Route path="content/edit/:id" element={<AdminContentForm />} />
                <Route path="livetv" element={<AdminLiveTvPage />} />
                <Route path="livetv/:networkId" element={<AdminLiveTvStreamsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="requests" element={<AdminRequestsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="contacts" element={<AdminContactsPage />} />
                <Route path="ads" element={<AdminAdsPage />} />
                <Route path="youtube" element={<AdminYouTubePage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </AdminLayout>
    );
};

export default AdminPage;
