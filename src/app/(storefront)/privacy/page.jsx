export const metadata = {
  title: "Privacy Policy - Shivam General Store",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-green max-w-none text-gray-600 space-y-6">
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            At <strong>Shivam General Store</strong>, we value your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>We may collect personal information such as your name, email address, phone number, shipping address, and business details (for wholesale accounts) when you register or place an order.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process and fulfill your orders.</li>
            <li>To manage your account (retail or wholesale).</li>
            <li>To communicate with you regarding your orders or support queries.</li>
            <li>To improve our store&apos;s functionality and customer experience.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information. Your data is stored securely and we do not sell or share it with third-party marketers.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="font-medium text-gray-900">Email: support@shivamgeneralstore.com</p>
        </div>
      </div>
    </div>
  );
}
