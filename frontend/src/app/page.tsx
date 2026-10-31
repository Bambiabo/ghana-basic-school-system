import Link from "next/link";
export default function Home() { return ( <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center p-4"> <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"> {/* Header */} <div className="text-center mb-8"> <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"> <span className="text-3xl">🏫</span> </div> <h1 className="text-2xl font-bold text-gray-800">Ghana Basic School</h1> <p className="text-gray-500 mt-1">School Management System</p> </div>
    {/* Login Form */}
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email or Phone
        </label>
        <input
          type="text"
          placeholder="Enter your email or phone"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
      </div>

      <Link
        href="/dashboard"
        className="block w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition duration-200 text-center"
      >
        Login
      </Link>
    </div>

    <p className="text-center text-sm text-gray-500 mt-6">
      For teachers, headteachers & administrators
    </p>
  </div>
</div>
); }