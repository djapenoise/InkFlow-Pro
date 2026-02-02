const { useState, useEffect } = React;

function App() {
    const [activeTab, setActiveTab] = useState('dash');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const [appointments, setAppointments] = useState(() => {
        const saved = localStorage.getItem('inkflow_appointments');
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState(() => {
        const saved = localStorage.getItem('inkflow_clients');
        return saved ? JSON.parse(saved) : [];
    });

    const [newEntry, setNewEntry] = useState({ 
        client: '', time: '', date: '', price: '', 
        phone: '', social: '', email: '', style: '' 
    });
    
    const [newClient, setNewClient] = useState({ name: '', phone: '', social: '', email: '' });

    useEffect(() => {
        localStorage.setItem('inkflow_appointments', JSON.stringify(appointments));
    }, [appointments]);

    useEffect(() => {
        localStorage.setItem('inkflow_clients', JSON.stringify(clients));
    }, [clients]);

    const months = [
        { name: "JANUAR", days: 31 }, { name: "FEBRUAR", days: 28 }, { name: "MART", days: 31 },
        { name: "APRIL", days: 30 }, { name: "MAJ", days: 31 }, { name: "JUN", days: 30 },
        { name: "JUL", days: 31 }, { name: "AVGUST", days: 31 }, { name: "SEPTEMBAR", days: 30 },
        { name: "OKTOBAR", days: 31 }, { name: "NOVEMBAR", days: 30 }, { name: "DECEMBAR", days: 31 }
    ];

    const currentMonthName = months[currentMonthIdx].name;
    // Format za proveru današnjeg datuma
    const todayStr = `${new Date().getDate()}. ${months[new Date().getMonth()].name} ${new Date().getFullYear()}`;

    const handleMonthChange = (dir) => {
        if (dir === 'next') {
            if (currentMonthIdx === 11) {
                setCurrentMonthIdx(0);
                setCurrentYear(prev => prev + 1);
            } else setCurrentMonthIdx(prev => prev + 1);
        } else {
            if (currentMonthIdx === 0) {
                setCurrentMonthIdx(11);
                setCurrentYear(prev => prev - 1);
            } else setCurrentMonthIdx(prev => prev - 1);
        }
    };

    const handleSave = () => {
        if (!newEntry.client) return;
        const appId = Date.now();
        // Spajamo dan, mesec i godinu u jedan string za preciznu pretragu
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { 
                name: newEntry.client, phone: newEntry.phone, 
                social: newEntry.social, email: newEntry.email, id: appId 
            }]);
        }
        
        setAppointments([...appointments, { ...newEntry, date: fullDate, id: appId + 1 }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', time: '', date: '', price: '', phone: '', social: '', email: '', style: '' });
    };

    const deleteApp = (id) => {
        if (window.confirm("Obrisati termin?")) setAppointments(appointments.filter(a => a.id !== id));
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6">
                <h1 className="text-2xl font-black gold-text italic uppercase">INKFLOW PRO</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Tattoo Management</p>
            </header>

            <main className="p-4">
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black gold-text">
                                    {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).reduce((a, b) => a + (parseInt(b.price) || 0), 0)}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Rev ({currentMonthName})</p>
                            </div>
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Today's Jobs</p>
                            </div>
                        </div>
                        <div className="card-bg p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic text-center">Today's Schedule</h3>
                            {appointments.filter(a => a.date === todayStr).length === 0 ? <p className="text-center opacity-20 py-10 italic">No jobs today</p> :
                                appointments.filter(a => a.date === todayStr).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl mb-3 flex justify-between items-center border-l-4 border-yellow-500">
                                        <div>
                                            <p className="font-bold text-sm">{app.client}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">{app.time} | {app.style}</p>
                                        </div>
                                        <p className="gold-text font-black text-sm">{app.price}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'cal' && (
                    <div className="space-y-6">
                        <div className="card-bg p-6">
                            <div className="flex justify-between items-center mb-6 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800 shadow-inner">
                                <button onClick={() => handleMonthChange('prev')} className="text-yellow-500 text-2xl font-black px-2"> &lt; </button>
                                <div className="text-center">
                                    <p className="font-black gold-text italic text-lg uppercase leading-none tracking-tighter">{currentMonthName}</p>
                                    <div className="flex items-center justify-center gap-3 mt-1">
                                        <button onClick={() => setCurrentYear(prev => prev - 1)} className="text-slate-700 text-xs font-black">«</button>
                                        <p className="text-[10px] text-slate-500 font-black tracking-widest">{currentYear}</p>
                                        <button onClick={() => setCurrentYear(prev => prev + 1)} className="text-slate-700 text-xs font-black">»</button>
                                    </div>
                                </div>
                                <button onClick={() => handleMonthChange('next')} className="text-yellow-500 text-2xl font-black px-2"> &gt; </button>
                            </div>

                            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                    <button 
                                        key={day}
                                        onClick={() => setSelectedDate(day)}
                                        className={`flex-shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center transition-all shadow-md ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-slate-800'}`}
                                    >
                                        <span className="text-[16px]">{day}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card-bg p-6 min-h-[300px] shadow-2xl">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                                <h3 className="text-xs font-black gold-text uppercase italic tracking-tighter">{selectedDate}. {currentMonthName} {currentYear}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1 rounded-full font-black text-[10px] uppercase shadow-lg">Add Session</button>
                            </div>
                            <div className="space-y-3">
                                {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).length === 0 ? 
                                    <p className="text-center opacity-20 py-10 italic text-sm">No appointments for this date</p> :
                                    appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`)
                                    .sort((a,b) => a.time.localeCompare(b.time))
                                    .map(app => (
                                        <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center border border-slate-800 shadow-inner">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-500 border-r border-slate-800 pr-3">{app.time}</span>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{app.client}</p>
                                                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">{app.style}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="gold-text font-black text-xs">{app.price}</span>
                                                <button onClick={() => deleteApp(app.id)} className="text-red-900/50 text-xl px-1">×</button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'biz' && (
                    typeof BusinessOverview !== 'undefined' ? 
                    <BusinessOverview appointments={appointments} currentMonthName={currentMonthName} /> :
                    <div className="text-center p-10 gold-text uppercase font-black italic">Loading...</div>
                )}

                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-5 flex justify-between items-center border border-slate-800/50 shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-black">{c.name[0]}</div>
                                    <div>
                                        <p className="font-bold text-white">{c.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{c.social || '@no_tag'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={`tel:${c.phone}`} className="text-yellow-500 p-2 bg-[#0a0f1d] rounded-full font-black text-[10px] px-4 border border-slate-800 shadow-inner tracking-widest">TEL</a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL ZA ZAKAZIVANJE - POPRAVLJEN LAYOUT */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end" onClick={() => setIsModalOpen(false)}>
                    <div className="card-bg w-full p-8 rounded-t-[40px] border-t border-slate-800 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1 bg-slate-800 mx-auto mb-8 rounded-full"></div>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">{selectedDate}. {currentMonthName} {currentYear}</h2>
                        
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none font-bold text-white text-center shadow-inner" 
                                onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            
                            <input type="text" placeholder="Tattoo Style (e.g. Realism)" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center text-sm shadow-inner" 
                                onChange={e => setNewEntry({...newEntry, style: e.target.value})} />

                            <div className="grid grid-cols-2 gap-4">
                                <input type="tel" placeholder="Phone" className="bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-sm text-white shadow-inner text-center" 
                                    onChange={e => setNewEntry({...newEntry, phone: e.target.value})} />
                                <input type="email" placeholder="Email" className="bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-sm text-white shadow-inner text-center" 
                                    onChange={e => setNewEntry({...newEntry, email: e.target.value})} />
                            </div>

                            {/* POPRAVLJEN GRID ZA TIME I PRICE */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl shadow-inner text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Time</p>
                                    <input type="time" className="w-full bg-transparent font-bold text-yellow-500 text-center outline-none" 
                                        onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                </div>
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl shadow-inner text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Price</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <input type="number" placeholder="0" className="w-12 bg-transparent font-bold text-white text-center outline-none" 
                                            onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                                        <span className="text-white font-bold text-sm">€</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSave} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-6 shadow-2xl active:scale-95 transition-all">Confirm Session</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 shadow-2xl z-50 rounded-3xl">
                {['dash', 'cal', 'biz', 'crm'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab ? 'gold-text' : 'text-slate-600'}`}>
                        {tab === 'dash' ? 'Home' : tab === 'cal' ? 'Calendar' : tab === 'biz' ? 'Business' : 'Clients'}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
