import { Mail, FileText, PlayCircle, Settings } from 'lucide-react';

export default function Home() {
  const digestStatus = "On";
  const nextSendEta = "in 28 minutes";

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-md mx-auto">

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">IndiBrief</h1>
          <p className="text-gray-400 mt-2">
            Top 10 India Today headlines—plus key takeaways—delivered to your inbox every 30 minutes.
          </p>
        </header>

        {/* Status Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${digestStatus === 'On' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-lg">
              Digests are <strong>{digestStatus}</strong>
            </p>
          </div>
          <p className="text-gray-400">
            Next digest will be sent {nextSendEta}.
          </p>
        </div>

        {/* Alert Placeholder */}
        {/* Example Success Alert */}
        {/* <div className="bg-green-500/20 border border-green-500 text-green-300 rounded-lg p-4 mb-8 text-center" role="alert">
          <strong>Success!</strong> A test email has been sent to your address.
        </div> */}
        {/* Example Error Alert */}
        {/* <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-lg p-4 mb-8 text-center" role="alert">
          <strong>Error!</strong> Failed to send the test email.
        </div> */}

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            <PlayCircle size={20} />
            <span>Start 30-min Digests</span>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
              <Mail size={20} />
              <span>Send Test Email</span>
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
              <FileText size={20} />
              <span>Preview Latest</span>
            </button>
          </div>
        </div>

        {/* Footer with Settings Link */}
        <footer className="text-center mt-12">
           <button className="text-gray-400 hover:text-white hover:underline flex items-center justify-center gap-2 transition-colors">
             <Settings size={16} />
             <span>Settings</span>
           </button>
        </footer>

      </div>
    </div>
  );
}
