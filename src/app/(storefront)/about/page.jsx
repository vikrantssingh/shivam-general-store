export const metadata = {
  title: "About Us - Shivam General Store",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">About Shivam General Store</h1>
        
        <div className="prose prose-green max-w-none text-gray-600 space-y-6">
          <p>
            Welcome to <strong>Shivam General Store</strong>, your one-stop destination for all daily household and grocery needs. 
            We have been serving our local community with dedication, ensuring that every family gets access to fresh, high-quality, and affordable products.
          </p>

          <p>
            Whether you are a retail customer buying for your home or a shopkeeper looking for wholesale supplies, 
            we cater to everyone. Our wholesale platform is designed specifically to help local businesses source products 
            efficiently at competitive rates.
          </p>

          <div className="bg-green-50 rounded-xl p-6 my-8 border border-green-100">
            <h3 className="text-lg font-bold text-green-900 mb-2">Our Store Location</h3>
            <p className="text-green-800">
              <strong>Shivam General Store</strong><br />
              Main Market, Near Clock Tower<br />
              New Delhi, 110001<br />
              India
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Quality Guaranteed:</strong> We stock only genuine and high-quality products.</li>
            <li><strong>Wholesale & Retail:</strong> Dual pricing models to benefit both consumers and businesses.</li>
            <li><strong>Fast Delivery:</strong> Get your essential groceries delivered quickly to your doorstep.</li>
            <li><strong>Customer First:</strong> Your satisfaction is our primary goal.</li>
          </ul>

          <p className="mt-8">
            Thank you for trusting Shivam General Store. We look forward to serving you!
          </p>
        </div>
      </div>
    </div>
  );
}
