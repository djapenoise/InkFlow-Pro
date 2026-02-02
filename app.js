const { useState, useEffect } = React;

// --- AUTH KOMPONENTA ---
function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (!email || !password) return alert("Popunite sva polja");
        const users = JSON.parse(localStorage.getItem('inkflow_users') || '[]');
        if (isLogin) {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) onLogin(user);
            else alert("Pogrešan email ili lozinka");
        } else {
            if (users.find(u => u.email === email)) return alert("Korisnik već postoji");
            const newUser = { email, password };
            users.push(newUser);
            localStorage.setItem('inkflow_users', JSON.stringify(users));
            onLogin(newUser);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <div className="card-bg w-full max-w-md p-8 border border-slate-800 rounded-[40px] text-center shadow-2xl">
                <h1 className="text-3xl font-black gold-text italic tracking-tighter mb-2">INKFLOW PRO</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-8">by Djape Noise</p>
                <h2 className="text-white font-black uppercase tracking-widest mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <div className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" onChange={e => setPassword(e.target.value)} />
                    <button onClick={handleSubmit} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4 shadow-xl active:scale-95"> {isLogin ? 'Log In' : 'Sign Up'} </button>
                    <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4 italic underline"> {isLogin ? 'New here? Create Account' : 'Already have account? Log In'} </button>
                </div>
            </div>
        </div>
    );
}

// --- GLAVNA APLIKACIJA ---
function App() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('inkflow_logged_user')));
    const [activeTab, setActiveTab] = useState('dash');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedClientData, setSelectedClientData] = useState(null);
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const storageKeyApps = user ? `inkflow_apps_${user.email}` : null;
    const storageKeyClients = user ? `inkflow_clients_${user.email}` : null;

    const [appointments, setAppointments] = useState(() => {
        const saved = localStorage.getItem(storageKeyApps);
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState(() => {
        const saved = localStorage.getItem(storageKeyClients);
        return saved ? JSON.parse(saved) : [];
    });

    const [newEntry, setNewEntry] = useState({ client: '', time: '', date: '', price: '', phone: '', email: '', style: '' });
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', social: '' });

    useEffect(() => {
        if (user) {
            localStorage.setItem(storageKeyApps, JSON.stringify(appointments));
            localStorage.setItem(storageKeyClients, JSON.stringify(clients));
            localStorage.setItem('inkflow_logged_user', JSON.stringify(user));
        }
    }, [appointments, clients, user]);

    if (!user) return <AuthScreen onLogin={setUser} />;

    const months = [
        { name: "JANUAR", days: 31 }, { name: "FEBRUAR", days: 28 }, { name: "MART", days: 31 },
        { name: "APRIL", days: 30 }, { name: "MAJ", days: 31 }, { name: "JUN", days: 30 },
        { name: "JUL", days: 31 }, { name: "AVGUST", days: 31 }, { name: "SEPTEMBAR", days: 30 },
        { name: "OKTOBAR", days: 31 }, { name: "NOVEMBAR", days: 30 }, { name: "DECEMBAR", days: 31 }
    ];

    const currentMonthName = months[currentMonthIdx].name;
    const todayStr = `${new Date().getDate()}. ${months[new Date().getMonth()].name} ${new Date().getFullYear()}`;

    const handleMonthChange = (dir) => {
        if (dir === 'next') {
            if (currentMonthIdx === 11) { setCurrentMonthIdx(0); setCurrentYear(prev => prev + 1); }
            else setCurrentMonthIdx(prev => prev + 1);
        } else {
            if (currentMonthIdx === 0) { setCurrentMonthIdx(11); setCurrentYear(prev => prev - 1); }
            else setCurrentMonthIdx(prev => prev - 1);
        }
    };

    const hasAppointment = (day) => {
        const dateToCheck = `${day}. ${currentMonthName} ${currentYear}`;
        return appointments.some(a => a.date === dateToCheck);
    };

    const handleSaveAppointment = () => {
        if (!newEntry.client) return;
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        const appId = Date.now();
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { name: newEntry.client, phone: newEntry.phone, email: newEntry.email, id: appId }]);
        }
        setAppointments([...appointments, { ...newEntry, date: fullDate, id: appId + 1 }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', time: '', date: '', price: '', phone: '', email: '', style: '' });
    };

    const handleAddClient = () => {
        if (!newClient.name) return;
        setClients([...clients, { ...newClient, id: Date.now() }]);
        setIsClientModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', social: '' });
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6 flex justify-between items-start">
                <div>
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-2xl font-black gold-text italic uppercase leading-none tracking-tighter">INKFLOW PRO</h1>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-80">by Djape Noise</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-1">Tattoo Management</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'crm' && (
                        <button onClick={() => setIsClientModalOpen(true)} className="gold-bg text-black px-4 py-2 rounded-full font-black text-[10px] uppercase">Add</button>
                    )}
                    <button onClick={() => {localStorage.removeItem('inkflow_logged_user'); setUser(null);}} className="bg-slate-800 text-slate-400 px-3 py-2 rounded-full font-black text-[8px] uppercase">Logout</button>
                </div>
            </header>

            <main className="p-4">
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black gold-text">{appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).reduce((s, b) => s + (parseInt(b.price) || 0), 0)}€</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Month Rev</p>
                            </div>
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black text-white">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Today</p>
                            </div>
                        </div>
                        <div className="card-bg p-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 text-center italic border-b border-white/5 pb-4">Today's Schedule</h3>
                            {appointments.filter(a => a.date === todayStr).length === 0 ? <p className="text-center opacity-20 py-10 italic">No jobs today</p> :
                                appointments.filter(a => a.date === todayStr).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl mb-3 flex justify-between items-center border-l-4 border-yellow-500">
                                        <div><p className="font-bold text-sm text-white">{app.client}</p><p className="text-[10px] text-slate-500 uppercase font-black">{app.time} | {app.style}</p></div>
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
                            <div className="flex justify-between items-center mb-6 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
                                <button onClick={() => handleMonthChange('prev')} className="text-yellow-500 text-2xl font-black px-2"> &lt; </button>
                                <div className="text-center">
                                    <p className="font-black gold-text italic text-lg uppercase tracking-tighter">{currentMonthName}</p>
                                    <p className="text-[10px] text-slate-700 font-bold tracking-widest">{currentYear}</p>
                                </div>
                                <button onClick={() => handleMonthChange('next')} className="text-yellow-500 text-2xl font-black px-2"> &gt; </button>
                            </div>
                            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                    <button key={day} onClick={() => setSelectedDate(day)}
                                        className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center relative transition-all ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-slate-800'}`}>
                                        <span className="text-sm">{day}</span>
                                        {hasAppointment(day) && <div className={`w-1.5 h-1.5 rounded-full absolute bottom-2 ${selectedDate === day ? 'bg-black' : 'bg-yellow-500 animate-pulse'}`}></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="card-bg p-6 min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-black gold-text uppercase italic tracking-tighter">{selectedDate}. {currentMonthName} {currentYear}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1 rounded-full font-black text-[10px] uppercase">Add Session</button>
                            </div>
                            <div className="space-y-3">
                                {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center border border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-slate-500 border-r border-slate-800 pr-3">{app.time}</span>
                                            <div><p className="font-bold text-white text-sm">{app.client}</p><p className="text-[9px] text-slate-500 uppercase">{app.style}</p></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="gold-text font-black text-xs">{app.price}</span>
                                            <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="text-red-900/40 text-xl px-1">×</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'biz' && (
                    <div className="space-y-6">
                        <div className="card-bg p-8 text-center border border-white/5 shadow-2xl">
                             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Monthly Revenue</h3>
                             <p className="text-5xl font-black gold-text italic tracking-tighter">{appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).reduce((s, b) => s + (parseInt(b.price) || 0), 0)}€</p>
                             <p className="text-[10px] text-slate-600 font-bold mt-4 uppercase tracking-widest">{currentMonthName} {currentYear}</p>
                        </div>
                        <div className="card-bg p-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 italic border-b border-white/5 pb-3 text-center">Yearly Performance ({currentYear})</h3>
                            {months.map(m => {
                                const rev = appointments.filter(a => a.date.includes(m.name) && a.date.includes(currentYear)).reduce((s, a) => s + (parseInt(a.price) || 0), 0);
                                return (
                                    <div key={m.name} className={`flex justify-between items-center p-3 mb-2 rounded-xl ${m.name === currentMonthName ? 'bg-yellow-500/10' : 'bg-[#0a0f1d]'}`}>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">{m.name}</span>
                                        <span className="font-black text-white text-xs">{rev}€</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-5 flex justify-between items-center border border-slate-800 shadow-md">
                                <div className="flex items-center gap-4" onClick={() => setSelectedClientData(c)}>
                                    <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-black">{c.name[0]}</div>
                                    <div><p className="font-bold text-white">{c.name}</p><p className="text-[9px] text-slate-500 font-black uppercase">{c.social || '@ink_client'}</p></div>
                                </div>
                                <button onClick={() => setClients(clients.filter(cl => cl.id !== c.id))} className="p-3 opacity-30">🗑️</button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL ZA NOVOG KLIJENTA */}
            {isClientModalOpen && (
                <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center p-6" onClick={() => setIsClientModalOpen(false)}>
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">New Client</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center" onChange={e => setNewClient({...newClient, name: e.target.value})} />
                            <input type="text" placeholder="Instagram @tag" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center text-sm" onChange={e => setNewClient({...newClient, social: e.target.value})} />
                            <button onClick={handleAddClient} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-6">Save Profile</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ZA ZAKAZIVANJE */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end" onClick={() => setIsModalOpen(false)}>
                    <div className="card-bg w-full p-8 rounded-t-[40px] border-t border-slate-800 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">{selectedDate}. {currentMonthName}</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none font-bold text-white text-center" onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl relative h-20 flex flex-col justify-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase absolute top-2 left-0 right-0">Time</p>
                                    <input type="time" className="bg-transparent font-black text-yellow-500 text-center outline-none text-lg mt-2" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                </div>
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl relative h-20 flex flex-col justify-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase absolute top-2 left-0 right-0">Price</p>
                                    <input type="number" placeholder="0€" className="bg-transparent font-black text-white text-center outline-none text-lg mt-2" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                                </div>
                            </div>
                            <button onClick={handleSaveAppointment} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-6">Confirm Session</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 shadow-2xl z-50 rounded-3xl backdrop-blur-md">
                {['dash', 'cal', 'biz', 'crm'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'gold-text scale-110' : 'text-slate-600 opacity-50'}`}>
                        {tab === 'dash' ? 'Home' : tab === 'cal' ? 'Calendar' : tab === 'biz' ? 'Business' : 'Clients'}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
