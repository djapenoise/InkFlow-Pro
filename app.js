const { useState, useEffect } = React;

// --- EKRAN ZA LOGOVANJE ---
function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (!email || !password) return alert("Popunite polja!");
        const users = JSON.parse(localStorage.getItem('inkflow_users') || '[]');
        if (isLogin) {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) onLogin(user);
            else alert("Greška pri prijavi!");
        } else {
            if (users.find(u => u.email === email)) return alert("Email zauzet!");
            const newUser = { email, password };
            users.push(newUser);
            localStorage.setItem('inkflow_users', JSON.stringify(users));
            onLogin(newUser);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <div className="bg-[#0a0f1d] w-full max-w-md p-8 border border-slate-800 rounded-[40px] text-center shadow-2xl">
                <h1 className="text-3xl font-black gold-text italic mb-2">INKFLOW PRO</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8">by Djape Noise</p>
                <div className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full bg-[#020617] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full bg-[#020617] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" onChange={e => setPassword(e.target.value)} />
                    <button onClick={handleSubmit} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4 shadow-xl active:scale-95"> {isLogin ? 'Log In' : 'Sign Up'} </button>
                    <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-slate-500 font-black uppercase mt-4 block mx-auto underline"> {isLogin ? 'Napravi nalog' : 'Već imam nalog'} </button>
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

    // FORME - Ovde su polja koja si tražio
    const [newEntry, setNewEntry] = useState({ client: '', style: '', time: '', price: '', phone: '', email: '' });
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', social: '' });

    useEffect(() => {
        if (user) {
            localStorage.setItem(storageKeyApps, JSON.stringify(appointments));
            localStorage.setItem(storageKeyClients, JSON.stringify(clients));
            localStorage.setItem('inkflow_logged_user', JSON.stringify(user));
        }
    }, [appointments, clients, user]);

    if (!user) return <AuthScreen onLogin={setUser} />;

    const months = ["JANUAR", "FEBRUAR", "MART", "APRIL", "MAJ", "JUN", "JUL", "AVGUST", "SEPTEMBAR", "OKTOBAR", "NOVEMBAR", "DECEMBAR"];
    const currentMonthName = months[currentMonthIdx];

    const handleSaveAppointment = () => {
        if (!newEntry.client) return alert("Unesite ime klijenta");
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        setAppointments([...appointments, { ...newEntry, date: fullDate, id: Date.now() }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', style: '', time: '', price: '', phone: '', email: '' });
    };

    const handleAddClient = () => {
        if (!newClient.name) return alert("Unesite ime");
        setClients([...clients, { ...newClient, id: Date.now() }]);
        setIsClientModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', social: '' });
    };

    return (
        <div className="min-h-screen pb-32 bg-[#020617] text-white">
            {/* HEADER */}
            <header className="p-6 flex justify-between items-center border-b border-white/5">
                <div>
                    <h1 className="text-xl font-black gold-text italic tracking-tighter">INKFLOW PRO</h1>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">by Djape Noise | {user.email}</p>
                </div>
                <button onClick={() => {localStorage.removeItem('inkflow_logged_user'); setUser(null);}} className="text-[8px] bg-slate-800 p-2 rounded-full font-black uppercase">Logout</button>
            </header>

            <main className="p-4">
                {/* DASHBOARD TAB */}
                {activeTab === 'dash' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5 text-center">
                                <p className="text-2xl font-black gold-text">{appointments.filter(a => a.date.includes(currentMonthName)).reduce((s, a) => s + (parseInt(a.price) || 0), 0)}€</p>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Month Rev</p>
                            </div>
                            <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5 text-center">
                                <p className="text-2xl font-black text-white">{appointments.length}</p>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Total Sessions</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CALENDAR TAB */}
                {activeTab === 'cal' && (
                    <div className="space-y-4">
                        <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 0 ? 11 : prev - 1)} className="gold-text font-black text-xl px-2"> &lt; </button>
                                <p className="font-black gold-text italic uppercase">{currentMonthName} {currentYear}</p>
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 11 ? 0 : prev + 1)} className="gold-text font-black text-xl px-2"> &gt; </button>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="w-full gold-bg text-black p-4 rounded-2xl font-black uppercase text-xs shadow-xl mb-4">Add New Session</button>
                            <div className="space-y-2">
                                {appointments.filter(a => a.date.includes(currentMonthName)).map(app => (
                                    <div key={app.id} className="bg-[#020617] p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                                        <div>
                                            <p className="font-black text-sm">{app.client}</p>
                                            <p className="text-[9px] text-slate-500 uppercase">{app.date} @ {app.time}</p>
                                        </div>
                                        <p className="gold-text font-black">{app.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* BUSINESS TAB */}
                {activeTab === 'biz' && (
                    <div className="space-y-4">
                        <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase text-center mb-4">Godišnji Izveštaj {currentYear}</h3>
                            {months.map(m => {
                                const rev = appointments.filter(a => a.date.includes(m)).reduce((s, a) => s + (parseInt(a.price) || 0), 0);
                                return (
                                    <div key={m} className="flex justify-between p-3 border-b border-white/5 text-[10px] font-black">
                                        <span className="text-slate-500">{m}</span>
                                        <span className="text-white">{rev}€</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* CRM TAB */}
                {activeTab === 'crm' && (
                    <div className="space-y-4">
                        <button onClick={() => setIsClientModalOpen(true)} className="w-full gold-bg text-black p-4 rounded-2xl font-black uppercase text-xs shadow-xl">Add New Client</button>
                        <div className="grid grid-cols-1 gap-2">
                            {clients.map(c => (
                                <div key={c.id} className="bg-[#0a0f1d] p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-white">{c.name}</p>
                                        <p className="text-[9px] text-slate-500 uppercase">{c.social || '@no_instagram'}</p>
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold">{c.phone}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* --- MODAL ZA ZAKAZIVANJE (OVDE SU SVA POLJA) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center p-6">
                    <div className="bg-[#0a0f1d] w-full p-8 rounded-[40px] border border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-black gold-text uppercase italic mb-6 text-center">New Session</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center font-bold" 
                                onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <input type="text" placeholder="Style (Blackwork, Realism...)" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center text-sm" 
                                onChange={e => setNewEntry({...newEntry, style: e.target.value})} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="time" className="bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center text-yellow-500 font-black" 
                                    onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                <input type="number" placeholder="Price (€)" className="bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center font-black" 
                                    onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                            </div>
                            <input type="tel" placeholder="Phone Number" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center text-sm" 
                                onChange={e => setNewEntry({...newEntry, phone: e.target.value})} />
                            <input type="email" placeholder="Email Address" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center text-sm" 
                                onChange={e => setNewEntry({...newEntry, email: e.target.value})} />
                            
                            <button onClick={handleSaveAppointment} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4">Confirm</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 font-black p-2 uppercase text-[9px] mt-2">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ZA KLIJENTA (OVDE SU SVA POLJA) --- */}
            {isClientModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center p-6">
                    <div className="bg-[#0a0f1d] w-full p-8 rounded-[40px] border border-slate-800 shadow-2xl">
                        <h2 className="text-xl font-black gold-text uppercase italic mb-6 text-center">New Client</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center font-bold" 
                                onChange={e => setNewClient({...newClient, name: e.target.value})} />
                            <input type="tel" placeholder="Phone Number" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center text-sm" 
                                onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                            <input type="email" placeholder="Email Address" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center text-sm" 
                                onChange={e => setNewClient({...newClient, email: e.target.value})} />
                            <input type="text" placeholder="Instagram @tag" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-center text-sm" 
                                onChange={e => setNewClient({...newClient, social: e.target.value})} />
                            
                            <button onClick={handleAddClient} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4">Save Profile</button>
                            <button onClick={() => setIsClientModalOpen(false)} className="w-full text-slate-500 font-black p-2 uppercase text-[9px] mt-2">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVIGACIJA */}
            <nav className="fixed bottom-8 left-6 right-6 bg-[#0a0f1d]/90 backdrop-blur-md border border-white/5 flex justify-around p-4 rounded-3xl shadow-2xl">
                {['dash', 'cal', 'biz', 'crm'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab ? 'gold-text' : 'text-slate-600'}`}>
                        {tab === 'dash' ? 'Home' : tab === 'cal' ? 'Calendar' : tab === 'biz' ? 'Biz' : 'Clients'}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
