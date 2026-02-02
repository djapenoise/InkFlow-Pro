const { useState, useEffect } = React;

// --- AUTH KOMPONENTA ---
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
            else alert("Pogrešan email ili lozinka!");
        } else {
            if (users.find(u => u.email === email)) return alert("Email već postoji!");
            const newUser = { email, password };
            users.push(newUser);
            localStorage.setItem('inkflow_users', JSON.stringify(users));
            onLogin(newUser);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <div className="bg-[#0a0f1d] w-full max-w-md p-8 border border-slate-800 rounded-[40px] text-center shadow-2xl">
                <h1 className="text-3xl font-black text-yellow-500 italic mb-2 uppercase">INKFLOW PRO</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8">by Djape Noise</p>
                <div className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full bg-[#020617] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full bg-[#020617] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" onChange={e => setPassword(e.target.value)} />
                    <button onClick={handleSubmit} className="w-full bg-yellow-500 text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4 shadow-xl active:scale-95"> {isLogin ? 'Log In' : 'Sign Up'} </button>
                    <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-slate-500 font-black uppercase mt-4 block mx-auto underline italic"> {isLogin ? 'New here? Create Account' : 'Already have account? Log In'} </button>
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

    const storageKeyApps = user ? `inkflow_apps_${user.email}` : 'guest_apps';
    const storageKeyClients = user ? `inkflow_clients_${user.email}` : 'guest_clients';

    const [appointments, setAppointments] = useState(() => JSON.parse(localStorage.getItem(storageKeyApps) || '[]'));
    const [clients, setClients] = useState(() => JSON.parse(localStorage.getItem(storageKeyClients) || '[]'));

    const [newEntry, setNewEntry] = useState({ client: '', style: '', time: '', price: '', phone: '', email: '' });
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', social: '' });

    const months = ["JANUAR", "FEBRUAR", "MART", "APRIL", "MAJ", "JUN", "JUL", "AVGUST", "SEPTEMBAR", "OKTOBAR", "NOVEMBAR", "DECEMBAR"];
    const currentMonthName = months[currentMonthIdx];

    useEffect(() => {
        if (user) {
            localStorage.setItem(storageKeyApps, JSON.stringify(appointments));
            localStorage.setItem(storageKeyClients, JSON.stringify(clients));
            localStorage.setItem('inkflow_logged_user', JSON.stringify(user));
        }
    }, [appointments, clients, user]);

    if (!user) return <AuthScreen onLogin={setUser} />;

    const handleSaveAppointment = () => {
        if (!newEntry.client) return alert("Ime klijenta!");
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        setAppointments([...appointments, { ...newEntry, date: fullDate, id: Date.now() }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', style: '', time: '', price: '', phone: '', email: '' });
    };

    const handleAddClient = () => {
        if (!newClient.name) return alert("Ime klijenta!");
        setClients([...clients, { ...newClient, id: Date.now() }]);
        setIsClientModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', social: '' });
    };

    return (
        <div className="min-h-screen pb-32 bg-[#020617] text-white font-sans">
            <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
                <div>
                    <h1 className="text-xl font-black text-yellow-500 italic tracking-tighter">INKFLOW PRO</h1>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Artist Profile: {user.email}</p>
                </div>
                <button onClick={() => {localStorage.removeItem('inkflow_logged_user'); setUser(null);}} className="text-[8px] bg-slate-800 p-2 px-4 rounded-full font-black uppercase">Logout</button>
            </header>

            <main className="p-4">
                {/* DASHBOARD */}
                {activeTab === 'dash' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5 text-center shadow-lg">
                            <p className="text-2xl font-black text-yellow-500">
                                {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).reduce((s, a) => s + (parseInt(a.price) || 0), 0)}€
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase font-black">Month Revenue</p>
                        </div>
                        <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5 text-center shadow-lg">
                            <p className="text-2xl font-black text-white">{appointments.length}</p>
                            <p className="text-[9px] text-slate-500 uppercase font-black">Total Jobs</p>
                        </div>
                    </div>
                )}

                {/* CALENDAR */}
                {activeTab === 'cal' && (
                    <div className="space-y-4">
                        <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5 text-center">
                             <div className="flex justify-between items-center mb-6">
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 0 ? 11 : prev - 1)} className="text-yellow-500 font-black text-xl px-4"> &lt; </button>
                                <span className="font-black text-yellow-500 italic">{currentMonthName} {currentYear}</span>
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 11 ? 0 : prev + 1)} className="text-yellow-500 font-black text-xl px-4"> &gt; </button>
                             </div>
                             <button onClick={() => setIsModalOpen(true)} className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl uppercase text-xs mb-4 shadow-xl">Add Session</button>
                             <div className="space-y-2">
                                {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).map(app => (
                                    <div key={app.id} className="bg-[#020617] p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                                        <div className="text-left"><p className="font-black text-sm">{app.client}</p><p className="text-[9px] text-slate-500 uppercase font-bold">{app.date} | {app.time}</p></div>
                                        <div className="flex items-center gap-2"><span className="text-yellow-500 font-black">{app.price}</span><button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="text-red-900/50 text-xl ml-2 font-black">×</button></div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}

                {/* BUSINESS (ORIGINAL STIL) */}
                {activeTab === 'biz' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5 text-center shadow-lg">
                                <p className="text-2xl font-black text-yellow-500 italic">
                                    {appointments.reduce((s, a) => s + (parseInt(a.price) || 0), 0)}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total Revenue</p>
                            </div>
                            <div className="bg-[#0a0f1d] p-6 rounded-[30px] border border-white/5 text-center shadow-lg">
                                <p className="text-2xl font-black text-white italic">
                                    {appointments.length > 0 ? Math.round(appointments.reduce((s, a) => s + (parseInt(a.price) || 0), 0) / appointments.length) : 0}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Avg per Session</p>
                            </div>
                        </div>
                        <div className="bg-[#0a0f1d] p-6 rounded-[40px] border border-white/5 shadow-2xl">
                            <h3 className="text-[11px] font-black text-yellow-500 uppercase italic tracking-[0.2em] mb-6 text-center border-b border-white/5 pb-4">Monthly Breakdown {currentYear}</h3>
                            <div className="space-y-1">
                                {months.map((m, idx) => {
                                    const monthApps = appointments.filter(a => a.date.includes(m) && a.date.includes(currentYear));
                                    const monthRev = monthApps.reduce((s, a) => s + (parseInt(a.price) || 0), 0);
                                    return (
                                        <div key={m} className={`flex justify-between items-center p-4 rounded-2xl ${monthRev > 0 ? 'bg-white/5' : 'opacity-20'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-500 w-6">{idx + 1}.</span>
                                                <span className="text-[11px] font-black uppercase tracking-tighter">{m}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-yellow-500">{monthRev}€</p>
                                                <p className="text-[8px] text-slate-600 font-bold uppercase">{monthApps.length} sessions</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* CLIENTS */}
                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        <button onClick={() => setIsClientModalOpen(true)} className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl uppercase text-xs mb-4 shadow-xl">Add New Client</button>
                        {clients.map(c => (
                            <div key={c.id} className="bg-[#0a0f1d] p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                                <div className="text-left"><p className="font-black text-white text-sm">{c.name}</p><p className="text-[9px] text-slate-500 uppercase font-bold">{c.social || '@no_tag'}</p></div>
                                <div className="text-right text-[10px] font-bold text-slate-600"> {c.phone} </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODALI (Session & Client) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center p-6">
                    <div className="bg-[#0a0f1d] w-full p-8 rounded-[40px] border border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-black text-yellow-500 italic mb-6 text-center uppercase">New Session</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center font-bold" onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <input type="text" placeholder="Tattoo Style" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-sm" onChange={e => setNewEntry({...newEntry, style: e.target.value})} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="time" className="bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-yellow-500 font-black text-center" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                <input type="number" placeholder="Price (€)" className="bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center font-black" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                            </div>
                            <input type="tel" placeholder="Phone" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-xs" onChange={e => setNewEntry({...newEntry, phone: e.target.value})} />
                            <input type="email" placeholder="Email" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-xs" onChange={e => setNewEntry({...newEntry, email: e.target.value})} />
                            <button onClick={handleSaveAppointment} className="w-full bg-yellow-500 text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4">Confirm</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 font-black p-2 uppercase text-[9px] mt-2 underline">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {isClientModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center p-6">
                    <div className="bg-[#0a0f1d] w-full p-8 rounded-[40px] border border-slate-800 shadow-2xl">
                        <h2 className="text-xl font-black text-yellow-500 italic mb-6 text-center uppercase">New Client</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center font-bold" onChange={e => setNewClient({...newClient, name: e.target.value})} />
                            <input type="tel" placeholder="Phone" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-sm" onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                            <input type="email" placeholder="Email" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-sm" onChange={e => setNewClient({...newClient, email: e.target.value})} />
                            <input type="text" placeholder="Instagram @tag" className="w-full bg-[#020617] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-sm" onChange={e => setNewClient({...newClient, social: e.target.value})} />
                            <button onClick={handleAddClient} className="w-full bg-yellow-500 text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4">Save</button>
                            <button onClick={() => setIsClientModalOpen(false)} className="w-full text-slate-500 font-black p-2 uppercase text-[9px] mt-2 underline">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 bg-[#0a0f1d]/90 backdrop-blur-md border border-white/5 flex justify-around p-4 rounded-3xl shadow-2xl z-50">
                {['dash', 'cal', 'biz', 'crm'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-yellow-500 scale-110' : 'text-slate-600'}`}>
                        {tab === 'dash' ? 'Home' : tab === 'cal' ? 'Calendar' : tab === 'biz' ? 'Business' : 'Clients'}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
