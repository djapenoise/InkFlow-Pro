const { useState, useEffect } = React;

// --- LOGIN KOJI NE MENJA IZGLED ---
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
            const newUser = { email, password };
            users.push(newUser);
            localStorage.setItem('inkflow_users', JSON.stringify(users));
            onLogin(newUser);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
            <div className="bg-[#0a0f1d] w-full max-w-md p-10 rounded-[50px] border border-white/5 text-center shadow-2xl">
                <h1 className="text-4xl font-black gold-text italic tracking-tighter mb-2">INKFLOW</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mb-12">Pro Digital Office</p>
                <div className="space-y-4">
                    <input type="email" placeholder="Artist Email" className="w-full bg-[#020617] border border-white/5 p-5 rounded-3xl outline-none text-center font-bold" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Secret Key" className="w-full bg-[#020617] border border-white/5 p-5 rounded-3xl outline-none text-center font-bold" onChange={e => setPassword(e.target.value)} />
                    <button onClick={handleSubmit} className="w-full gold-bg text-black font-black p-5 rounded-3xl uppercase tracking-widest mt-4 shadow-2xl"> {isLogin ? 'Enter Studio' : 'Create Profile'} </button>
                    <button onClick={() => setIsLogin(!isLogin)} className="text-[9px] text-slate-600 font-bold uppercase mt-6 block mx-auto tracking-widest"> {isLogin ? 'No account? Sign Up' : 'Back to Login'} </button>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('inkflow_logged_user')));
    const [activeTab, setActiveTab] = useState('dash');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const storageKeyApps = user ? `inkflow_apps_${user.email}` : 'apps';
    const storageKeyClients = user ? `inkflow_clients_${user.email}` : 'clients';

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
        if (!newEntry.client) return alert("Unesite ime!");
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        setAppointments([...appointments, { ...newEntry, date: fullDate, id: Date.now() }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', style: '', time: '', price: '', phone: '', email: '' });
    };

    const handleAddClient = () => {
        if (!newClient.name) return alert("Unesite ime!");
        setClients([...clients, { ...newClient, id: Date.now() }]);
        setIsClientModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', social: '' });
    };

    return (
        <div className="min-h-screen pb-32 bg-[#020617] text-white font-sans">
            {/* ORIGINAL HEADER */}
            <header className="p-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black gold-text italic tracking-tighter">INKFLOW</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Digital Studio</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-[#0a0f1d] shadow-xl" onClick={() => {localStorage.removeItem('inkflow_logged_user'); setUser(null);}}>
                    <span className="text-[10px] font-black gold-text">DJ</span>
                </div>
            </header>

            <main className="px-6">
                {/* DASHBOARD - STARO KAO PRE */}
                {activeTab === 'dash' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="card-bg p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Month Revenue</p>
                                <h2 className="text-5xl font-black gold-text italic tracking-tighter">
                                    {appointments.filter(a => a.date.includes(currentMonthName)).reduce((s, a) => s + (parseInt(a.price) || 0), 0)}€
                                </h2>
                            </div>
                            <div className="absolute -right-4 -bottom-4 text-8xl font-black text-white/5 italic">PRO</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-bg p-6 rounded-[35px] border border-white/5 text-center shadow-xl">
                                <p className="text-2xl font-black text-white italic">{appointments.length}</p>
                                <p className="text-[8px] text-slate-500 font-black uppercase mt-1">Sessions</p>
                            </div>
                            <div className="card-bg p-6 rounded-[35px] border border-white/5 text-center shadow-xl">
                                <p className="text-2xl font-black gold-text italic">{clients.length}</p>
                                <p className="text-[8px] text-slate-500 font-black uppercase mt-1">Clients</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CALENDAR - STARO KAO PRE */}
                {activeTab === 'cal' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="card-bg p-6 rounded-[40px] border border-white/5 shadow-2xl">
                            <div className="flex justify-between items-center mb-8 bg-[#020617] p-4 rounded-3xl border border-white/5">
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 0 ? 11 : prev - 1)} className="gold-text font-black text-xl px-4"> &lt; </button>
                                <div className="text-center">
                                    <p className="text-[12px] font-black gold-text italic uppercase tracking-widest">{currentMonthName}</p>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase">{currentYear}</p>
                                </div>
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 11 ? 0 : prev + 1)} className="gold-text font-black text-xl px-4"> &gt; </button>
                            </div>
                            <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
                                {[...Array(31)].map((_, i) => (
                                    <button key={i} onClick={() => setSelectedDate(i + 1)} className={`flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${selectedDate === (i + 1) ? 'gold-bg text-black font-black scale-110 shadow-xl' : 'bg-[#020617] text-slate-500 border border-white/5'}`}>
                                        <span className="text-xs">{i + 1}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-2">
                            <h3 className="font-black gold-text italic uppercase text-sm tracking-tighter">Agenda: {selectedDate}. {currentMonthName}</h3>
                            <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black p-3 rounded-full shadow-xl"> <span className="text-lg font-black">+</span> </button>
                        </div>
                        <div className="space-y-3">
                            {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).map(app => (
                                <div key={app.id} className="card-bg p-5 rounded-[30px] border border-white/5 flex justify-between items-center shadow-lg">
                                    <div><p className="font-black text-white text-sm tracking-tight">{app.client}</p><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{app.time} • {app.style}</p></div>
                                    <div className="flex items-center gap-4"><span className="gold-text font-black text-sm">{app.price}</span><button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="text-red-900 opacity-30 font-black text-xl">×</button></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BUSINESS - NOVI KOJI SI TRAŽIO */}
                {activeTab === 'biz' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-bg p-6 rounded-[35px] border border-white/5 text-center shadow-lg">
                                <p className="text-2xl font-black gold-text italic">{appointments.reduce((s, a) => s + (parseInt(a.price) || 0), 0)}€</p>
                                <p className="text-[8px] text-slate-500 font-black uppercase mt-1">Total Rev</p>
                            </div>
                            <div className="card-bg p-6 rounded-[35px] border border-white/5 text-center shadow-lg">
                                <p className="text-2xl font-black text-white italic">{appointments.length > 0 ? Math.round(appointments.reduce((s, a) => s + (parseInt(a.price) || 0), 0) / appointments.length) : 0}€</p>
                                <p className="text-[8px] text-slate-500 font-black uppercase mt-1">Avg Session</p>
                            </div>
                        </div>
                        <div className="card-bg p-6 rounded-[40px] border border-white/5 shadow-2xl">
                             <h3 className="text-[11px] font-black gold-text uppercase italic text-center mb-6 tracking-widest border-b border-white/5 pb-4">Yearly Breakdown {currentYear}</h3>
                             {months.map((m, idx) => {
                                 const mApps = appointments.filter(a => a.date.includes(m) && a.date.includes(currentYear));
                                 const mRev = mApps.reduce((s, a) => s + (parseInt(a.price) || 0), 0);
                                 return (
                                     <div key={m} className={`flex justify-between p-4 border-b border-white/5 last:border-0 ${mRev > 0 ? 'opacity-100' : 'opacity-20'}`}>
                                         <span className="text-[10px] font-black text-slate-500 uppercase">{idx + 1}. {m}</span>
                                         <span className="text-sm font-black gold-text">{mRev}€</span>
                                     </div>
                                 );
                             })}
                        </div>
                    </div>
                )}

                {/* CRM - STARO KAO PRE */}
                {activeTab === 'crm' && (
                    <div className="space-y-4 animate-fadeIn">
                        <button onClick={() => setIsClientModalOpen(true)} className="w-full gold-bg text-black p-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl">Add New Profile</button>
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-6 rounded-[35px] border border-white/5 flex justify-between items-center shadow-xl">
                                <div><p className="font-black text-white italic">{c.name}</p><p className="text-[9px] text-slate-600 font-bold uppercase mt-1">{c.social || '@no_tag'}</p></div>
                                <div className="text-right"><p className="text-[10px] text-slate-500 font-black">{c.phone}</p></div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODALI SA CANCEL OPCIJOM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center p-6">
                    <div className="bg-[#0a0f1d] w-full p-8 rounded-[50px] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center tracking-tighter text-shadow-glow">New Session</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#020617] border border-white/5 p-4 rounded-3xl outline-none text-white text-center font-bold" onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="time" className="bg-[#020617] border border-white/5 p-4 rounded-3xl outline-none text-yellow-500 font-black text-center" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                <input type="number" placeholder="Price €" className="bg-[#020617] border border-white/5 p-4 rounded-3xl outline-none text-white text-center font-black" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                            </div>
                            <input type="text" placeholder="Tattoo Style" className="w-full bg-[#020617] border border-white/5 p-4 rounded-3xl outline-none text-white text-center text-xs" onChange={e => setNewEntry({...newEntry, style: e.target.value})} />
                            <button onClick={handleSaveAppointment} className="w-full gold-bg text-black font-black p-5 rounded-3xl uppercase tracking-widest mt-6 shadow-xl">Confirm Job</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-600 font-bold p-3 uppercase text-[9px] mt-2 underline">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {isClientModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center p-6">
                    <div className="bg-[#0a0f1d] w-full p-8 rounded-[50px] border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center tracking-tighter">Client Profile</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#020617] border border-white/5 p-4 rounded-3xl outline-none text-white text-center font-bold" onChange={e => setNewClient({...newClient, name: e.target.value})} />
                            <input type="tel" placeholder="Phone Number" className="w-full bg-[#020617] border border-white/5 p-4 rounded-3xl outline-none text-white text-center text-sm" onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                            <input type="text" placeholder="Instagram @tag" className="w-full bg-[#020617] border border-white/5 p-4 rounded-3xl outline-none text-white text-center text-sm" onChange={e => setNewClient({...newClient, social: e.target.value})} />
                            <button onClick={handleAddClient} className="w-full gold-bg text-black font-black p-5 rounded-3xl uppercase tracking-widest mt-6 shadow-xl">Save to Base</button>
                            <button onClick={() => setIsClientModalOpen(false)} className="w-full text-slate-600 font-bold p-3 uppercase text-[9px] mt-2 underline">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVIGATION - STARO KAO PRE */}
            <nav className="fixed bottom-10 left-8 right-8 bg-[#0a0f1d]/80 backdrop-blur-2xl border border-white/5 flex justify-around p-5 rounded-[40px] shadow-2xl z-50">
                {['dash', 'cal', 'biz', 'crm'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'gold-text scale-125' : 'text-slate-600'}`}>
                        {tab === 'dash' ? 'Home' : tab === 'cal' ? 'Agenda' : tab === 'biz' ? 'Business' : 'Clients'}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
