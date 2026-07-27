export const metadata = {
  title: "Terms and Conditions - Shivam General Store",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
        
        <div className="prose prose-green max-w-none text-gray-600 space-y-6">
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            Welcome to <strong>Shivam General Store</strong>. By accessing this website, we assume you accept these terms and conditions. 
            Do not continue to use our store if you do not agree to all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Accounts and Registration</h2>
          <p>
            To purchase from our store, you must register an account. You agree to provide accurate and complete information. 
            Wholesale accounts ("Shopkeeper" accounts) require admin approval before accessing wholesale pricing. 
            We reserve the right to suspend or terminate accounts that provide false information.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Pricing and Availability</h2>
          <p>
            All prices are subject to change without notice. While we strive to provide accurate product and pricing information, 
            errors may occur. We reserve the right to correct any errors and to cancel any orders placed for a product listed at an incorrect price.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Orders and Delivery</h2>
          <p>
            Orders are processed and delivered based on stock availability. We aim to deliver within the specified timeframes, 
            but delays may occasionally happen due to unforeseen circumstances.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Returns and Refunds</h2>
          <p>
            If you are not satisfied with your purchase, please contact our support team within 24 hours of delivery. 
            Returns are accepted for damaged or incorrect items. 
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Contact Information</h2>
          <p>For any queries regarding these terms, please contact:</p>
          <p className="font-medium text-gray-900">Email: support@shivamgeneralstore.com</p>
        </div>
      </div>
    </div>
  );
}
