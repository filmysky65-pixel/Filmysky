
import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../../types';
import { getSubscriptionPlans, addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '../../services/firebaseService';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminSubscriptionsPage: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan>>({
        type: 'time-based',
        adsDisabled: true, // Always disable ads for subscribers
        liveTvAccess: true, // Always give live TV access
        maxQuality: '4K',   // Always give max quality
        benefits: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = getSubscriptionPlans(data => {
            setPlans(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const resetForm = () => {
        setCurrentPlan({
            type: 'time-based',
            adsDisabled: true,
            liveTvAccess: true,
            maxQuality: '4K',
            benefits: [],
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        const { name, price, validity } = currentPlan;
        if (!name || !price || !validity) {
            alert("Name, Price, and Validity are required.");
            return;
        }

        const planToSave = { 
            ...currentPlan,
            type: 'time-based' as const,
            adsDisabled: true,
            liveTvAccess: true,
            maxQuality: '4K',
            viewsToAdd: 0
        };

        if (currentPlan.id) { // Update
            await updateSubscriptionPlan(currentPlan.id, planToSave as SubscriptionPlan);
        } else { // Add
            await addSubscriptionPlan(planToSave as Omit<SubscriptionPlan, 'id'>);
        }
        resetForm();
    };
    
    const handleDeleteClick = (id: string) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedId) {
            await deleteSubscriptionPlan(selectedId);
            setSelectedId(null);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (plan: SubscriptionPlan) => {
        setCurrentPlan(plan);
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Subscription Plans</h1>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="bg-[var(--primary-color)] text-white font-bold py-2 px-4 rounded-lg">Add New Plan</button>}
            </div>

            {isEditing && (
                 <div className="bg-[var(--card-bg)] p-6 rounded-lg mb-6 space-y-4 max-w-2xl">
                    <h2 className="font-bold text-xl">{currentPlan.id ? 'Edit Plan' : 'Add New Plan'}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold block mb-1 text-sm">Plan Name</label>
                            <input placeholder="e.g., Monthly VIP" value={currentPlan.name || ''} onChange={(e) => setCurrentPlan(p => ({...p, name: e.target.value}))} className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                        </div>
                        <div>
                            <label className="font-semibold block mb-1 text-sm">Price (INR)</label>
                            <input type="number" placeholder="e.g., 99" value={currentPlan.price || ''} onChange={(e) => setCurrentPlan(p => ({...p, price: Number(e.target.value)}))} className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                        </div>
                        <div>
                            <label className="font-semibold block mb-1 text-sm">Validity (Days)</label>
                            <input type="number" placeholder="e.g., 30" value={currentPlan.validity || ''} onChange={(e) => setCurrentPlan(p => ({...p, validity: Number(e.target.value)}))} className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                        </div>
                    </div>
                    
                    <p className="text-sm text-[var(--secondary-text-color)] mt-2">
                        * All plans automatically include: Ad-Free Experience, 4K Quality Support, and Live TV Access.
                    </p>

                    <div className="flex gap-2 pt-4">
                        <button onClick={handleSave} className="bg-green-500 text-white py-2 px-4 rounded">Save Plan</button>
                        <button onClick={resetForm} className="bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <i className="fas fa-crown text-6xl"></i>
                        </div>
                        <div className="flex-grow z-10">
                            <h2 className="text-xl font-bold text-[var(--primary-color)]">{plan.name}</h2>
                            <p className="text-3xl font-bold mt-2">₹{plan.price}</p>
                            <div className="text-sm text-[var(--secondary-text-color)] mt-1 font-mono">
                                Validity: {plan.validity} Days
                            </div>
                        </div>
                        <div className="mt-4 flex gap-4 border-t border-[var(--border-color)] pt-4 z-10">
                            <button onClick={() => handleEdit(plan)} className="text-blue-400 hover:text-blue-600 transition-colors text-lg" title="Edit"><i className="fas fa-pen"></i></button>
                            <button onClick={() => handleDeleteClick(plan.id)} className="text-red-400 hover:text-red-600 transition-colors text-lg" title="Delete"><i className="fas fa-trash"></i></button>
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Plan"
                message="Are you sure? This will not cancel existing user subscriptions but will remove the plan from being purchasable."
            />
        </div>
    );
};

export default AdminSubscriptionsPage;
