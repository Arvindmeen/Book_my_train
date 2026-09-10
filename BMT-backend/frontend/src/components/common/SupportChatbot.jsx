import { useState } from 'react';

const FAQS = [
  {
    question: 'How do I search for a train?',
    answer: 'Open Search Trains, choose your boarding station, destination, journey date, and quota, then select Search Trains.',
  },
  {
    question: 'How can I check my PNR status?',
    answer: 'Open Check PNR from the navigation menu and enter your 10-digit PNR number to view the latest status.',
  },
  {
    question: 'How do I install the app?',
    answer: 'Select Download App on the home page, then follow the install prompt from your browser. The app works on Android, iOS, Windows, and macOS.',
  },
  {
    question: 'How can I cancel a ticket?',
    answer: 'Open My Bookings, select the booking, and choose Cancel Ticket. Review the refund details before confirming.',
  },
  {
    question: 'When will I receive my refund?',
    answer: 'Eligible refunds are sent to the original payment method. UPI reversals are usually processed quickly, while bank processing times can vary.',
  },
  {
    question: 'Do you charge a convenience fee?',
    answer: 'There is zero convenience fee on UPI payments. Any applicable fare or service charges are shown before payment.',
  },
];

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFaq(null);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end gap-3">
      <section
        className={`w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-2xl shadow-slate-900/20 origin-bottom transition-all duration-300 ease-out ${
          isOpen
            ? 'max-h-[620px] translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none max-h-0 translate-y-3 scale-95 opacity-0'
        }`}
        aria-label="BooK my Train support"
        aria-hidden={!isOpen}
      >
          <header className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white p-1 shadow-sm">
                <img src="/navbar-logo.jpg" alt="" className="h-full w-full rounded-lg object-contain" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold leading-tight">BooK my Train Support</h2>
                <p className="text-[10px] font-medium text-emerald-50">Quick answers for common questions</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white"
              aria-label="Close support chat"
            >
              &times;
            </button>
          </header>

          <div className="p-4">
            {selectedFaq ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Your question</p>
                  <p className="mt-1 text-sm font-bold leading-relaxed text-slate-900">{selectedFaq.question}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
                  <p className="text-xs font-semibold leading-relaxed text-slate-700">{selectedFaq.answer}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFaq(null)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                >
                  Ask another question
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-600">Choose a question to get a quick answer:</p>
                <div className="max-h-[min(52vh,340px)] space-y-2 overflow-y-auto pr-1">
                  {FAQS.map((faq) => (
                    <button
                      key={faq.question}
                      type="button"
                      onClick={() => setSelectedFaq(faq)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-bold leading-relaxed text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
      </section>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="group flex items-center gap-2 rounded-full bg-emerald-600 p-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:px-4 hover:shadow-xl hover:shadow-emerald-600/35"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white p-1.5">
          <img src="/navbar-logo.jpg" alt="" className="h-full w-full rounded object-contain" />
        </span>
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${
            isOpen
              ? 'max-w-[100px] opacity-100'
              : 'max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100'
          }`}
        >
          {isOpen ? 'Close support' : 'Need help?'}
        </span>
      </button>
    </div>
  );
}
