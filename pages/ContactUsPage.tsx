import React, { useState } from 'react';
import PublicChat from '../components/PublicChat';
import { submitContactForm } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';

const ContactUsPage: React.FC = () => {
    const { appSettings } = useAppContext();
    const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'chat'>('faq');
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

    const faqs = [
        {
            question: "How do I download movies?",
            answer: "To download a movie, click on the movie poster to view details, then click the 'Download' button. Select your preferred quality and the download will start."
        },
        {
            question: "Is this service free?",
            answer: "Yes, our basic streaming service is free with ads. We also offer a premium subscription for an ad-free experience and higher quality downloads."
        },
        {
            question: "Why is the video buffering?",
            answer: "Buffering usually happens due to a slow internet connection. Please check your network speed. You can also try lowering the video quality from the player settings."
        },
        {
            question: "How can I request a movie or series?",
            answer: "You can request content by navigating to the 'Request' page from the main menu. Fill in the details of the content you want to watch, and we'll do our best to add it."
        },
        {
            question: "My account is locked/banned?",
            answer: "If you believe your account was locked by mistake, please contact our support team using the 'Contact Support' form or join our Telegram channel for assistance."
        }
    ];

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        try {
            await submitContactForm(formData.name, formData.email, formData.message);
            setFormStatus('success');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setFormStatus('idle'), 3000);
        } catch (error) {
            console.error("Contact form error:", error);
            setFormStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[var(--primary-color)] to-purple-900 py-12 px-6 text-center text-white mb-8">
                <h1 className="text-4xl font-bold mb-2">Help Center</h1>
                <p className="text-white/80 max-w-lg mx-auto">
                    Have questions? We're here to help. browse FAQs, chat with the community, or send us a message.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('faq')}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'faq'
                                ? 'bg-[var(--primary-color)] text-white shadow-lg scale-105'
                                : 'bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] hover:bg-[var(--border-color)]'
                        }`}
                    >
                        <i className="fas fa-question-circle"></i> FAQs
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'chat'
                                ? 'bg-[var(--primary-color)] text-white shadow-lg scale-105'
                                : 'bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] hover:bg-[var(--border-color)]'
                        }`}
                    >
                        <i className="fas fa-comments"></i> Community Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'contact'
                                ? 'bg-[var(--primary-color)] text-white shadow-lg scale-105'
                                : 'bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] hover:bg-[var(--border-color)]'
                        }`}
                    >
                        <i className="fas fa-envelope"></i> Contact Support
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-fade-in">
                    {activeTab === 'faq' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
                            {faqs.map((faq, index) => (
                                <div 
                                    key={index}
                                    className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden transition-all duration-300"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                        className="w-full p-4 flex justify-between items-center text-left hover:bg-white/5"
                                    >
                                        <span className="font-semibold text-lg">{faq.question}</span>
                                        <i className={`fas fa-chevron-down transition-transform duration-300 ${expandedFaq === index ? 'rotate-180 text-[var(--primary-color)]' : ''}`}></i>
                                    </button>
                                    <div 
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            expandedFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="p-4 pt-0 text-[var(--secondary-text-color)] border-t border-[var(--border-color)]/50 mt-2">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div>
                            <div className="bg-[var(--card-bg)] p-1 rounded-xl shadow-2xl border border-[var(--border-color)]">
                                <PublicChat />
                            </div>
                            <p className="text-center mt-4 text-sm text-[var(--secondary-text-color)]">
                                <i className="fas fa-info-circle mr-1"></i> 
                                Join our community discussion. Please be respectful to others.
                            </p>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 shadow-xl">
                                <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
                                <p className="text-[var(--secondary-text-color)] mb-6">
                                    We typically respond within 24 hours.
                                </p>

                                {formStatus === 'success' ? (
                                    <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-6 rounded-xl text-center">
                                        <i className="fas fa-check-circle text-4xl mb-3"></i>
                                        <h3 className="text-xl font-bold">Message Sent!</h3>
                                        <p>Thank you for contacting us. We will get back to you shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFormSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 pl-1">Name</label>
                                            <div className="relative">
                                                <i className="fas fa-user absolute left-3 top-3.5 text-[var(--secondary-text-color)]"></i>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 pl-1">Email</label>
                                            <div className="relative">
                                                <i className="fas fa-envelope absolute left-3 top-3.5 text-[var(--secondary-text-color)]"></i>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 pl-1">Message</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={e => setFormData({...formData, message: e.target.value})}
                                                className="w-full p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all resize-none"
                                                placeholder="How can we help you?"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={formStatus === 'submitting'}
                                            className="w-full bg-[var(--primary-color)] hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {formStatus === 'submitting' ? (
                                                <span><i className="fas fa-spinner fa-spin mr-2"></i> Sending...</span>
                                            ) : (
                                                <span><i className="fas fa-paper-plane mr-2"></i> Send Message</span>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Social Links */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                {appSettings?.socials?.telegram && (
                                    <a 
                                        href={appSettings.socials.telegram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 p-4 rounded-xl flex items-center justify-center gap-3 text-[#0088cc] transition-all"
                                    >
                                        <i className="fab fa-telegram text-2xl"></i>
                                        <span className="font-bold">Telegram</span>
                                    </a>
                                )}
                                {appSettings?.socials?.whatsapp && (
                                    <a 
                                        href={appSettings.socials.whatsapp}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 p-4 rounded-xl flex items-center justify-center gap-3 text-[#25D366] transition-all"
                                    >
                                        <i className="fab fa-whatsapp text-2xl"></i>
                                        <span className="font-bold">WhatsApp</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;
