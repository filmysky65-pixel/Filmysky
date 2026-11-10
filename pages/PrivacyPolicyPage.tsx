
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <div className="space-y-4 text-[var(--secondary-text-color)] leading-relaxed">
                <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                <p>
                    Welcome to FilmySky. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                </p>
                <h2 className="text-xl font-semibold text-[var(--text-color)] pt-4">1. INFORMATION WE COLLECT</h2>
                <p>
                    We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, when you participate in activities on the app or otherwise when you contact us.
                </p>
                <p>
                    The personal information that we collect depends on the context of your interactions with us and the app, the choices you make and the products and features you use. The personal information we collect may include the following: Name and Contact Data. We collect your first and last name, email address, and other similar contact data.
                </p>
                <h2 className="text-xl font-semibold text-[var(--text-color)] pt-4">2. HOW WE USE YOUR INFORMATION</h2>
                <p>
                    We use personal information collected via our app for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We may use your IP address to help diagnose any problem with our service and to provide better services for our visitors.
                </p>
                <h2 className="text-xl font-semibold text-[var(--text-color)] pt-4">3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?</h2>
                <p>
                    We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                </p>
                 <h2 className="text-xl font-semibold text-[var(--text-color)] pt-4">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
                <p>
                    We may use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
                </p>
                 <h2 className="text-xl font-semibold text-[var(--text-color)] pt-4">5. THIRD-PARTY ADVERTISING</h2>
                <p>
                    We use third-party advertising companies to serve ads when you visit our website. The ads may contain cookies which may be used by the advertising companies to better understand a visitor’s preferences and help them to display related ads. However, the cookies received with the advertisements are collected by the advertising company and we do not have access to that information. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
                </p>
                <h2 className="text-xl font-semibold text-[var(--text-color)] pt-4">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
                 <p>
                    If you choose to register or log in to our services using a social media account, we may have access to certain information about you.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
