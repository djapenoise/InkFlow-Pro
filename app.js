const { useState, useEffect } = React;

// --- AUTH SCREEN (Bez promena u dizajnu) ---
function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (!email || !password) return alert("Popunite polja!");
        const users = JSON.parse(localStorage.getItem('inkflow_users') || '[]');
        const cleanEmail = email.toLowerCase().trim();
        
        if (isLogin) {
            const user = users.find(u => u.email === cleanEmail && u.password === password);
            if (user) {
                localStorage.setItem('inkflow_logged_user', JSON.stringify(user));
                window.location.reload();
            } else alert("Pogrešan email ili lozinka!");
        } else {
            if (users.find(u => u.email === cleanEmail)) return alert("Email već postoji!");
            const newUser = { email: cleanEmail, password };
            users.push(newUser);
            localStorage.setItem('inkflow_users', JSON.stringify(users));
            localStorage.setItem('inkflow_logged_user', JSON.stringify(newUser));
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
            <div className="card-bg w-full max-w-md p-10 rounded-[50px] border border-white/5 text-center shadow-2xl">
                <h1 className="text-4xl font-black gold-text italic tracking-tighter mb-2 uppercase">INKFLOW</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mb-12">Private Studio Access</p>
                <div className="space-y-4">
                    <input type="email" placeholder="Artist Email" className="w-full bg-[#0a0f1d] border border-white/5 p-5 rounded-3xl outline-none text-center font-bold" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full bg-[#0a0f1d] border border-white/5 p-5 rounded-3xl outline-none text-center font-bold" onChange={e => setPassword(e.target.value)} />
                    <button onClick={handleSubmit} className="w-full gold-bg text-black font-black p-5 rounded-3xl uppercase tracking-widest mt-4"> {isLogin ? 'Login' : 'Sign Up'} </button>
                    <button onClick={() => setIsLogin(!isLogin)} className="text-[9px] text-slate-600 font-bold uppercase mt-6 block mx-auto tracking-widest"> {isLogin ? 'Switch to Sign Up' : 'Switch to Login'} </button>
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
    const [isEditClientOpen, setIsEditClientOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    // Inicijalizacija podataka SPECIFIČNO za ulogovanog korisnika
    const [appointments, setAppointments] = useState(() => {
        if (!user) return [];
        return JSON.parse(localStorage.getItem(`inkflow_apps_${user.email}`) || '[]');
    });

    const [clients, setClients] = useState(() => {
        if (!user) return [];
        return JSON.parse(localStorage.getItem(`inkflow_clients_${user.email}`) || '[]');
    });

    const [newEntry, setNewEntry] = useState({ client: '', time: '', style: '', price: '' });
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', social: '' });

    // Sinhronizacija sa localStorage
    useEffect(() => { 
        if(user) localStorage.setItem(`inkflow_apps_${user.email}`, JSON.stringify(appointments));
    }, [appointments, user]);

    useEffect(() => { 
        if(user) localStorage.setItem(`inkflow_clients_${user.email}`, JSON.stringify(clients));
    }, [clients, user]);

    if (!user) return <AuthScreen onLogin={setUser} />;

    const months = [
        { name: "JANUAR", days: 31 }, { name: "FEBRUAR", days: 28 }, { name: "MART", days: 31 },
        { name: "APRIL", days: 30 }, { name: "MAJ", days: 31 }, { name: "JUN", days: 30 },
        { name: "JUL", days: 31 }, { name: "AVGUST", days: 31 }, { name: "SEPTEMBAR", days: 30 },
        { name: "OKTOBAR", days: 31 }, { name: "NOVEMBAR", days: 30 }, { name: "DECEMBAR", days: 31 }
    ];

    const currentMonthName = months[currentMonthIdx].name;
    const todayStr = `${new Date().getDate()}. ${months[new Date().getMonth()].name} ${new Date().getFullYear()}`;

    // FIX: Provera da li dan ima zakazivanje (za tačkicu ispod broja)
    const hasApp = (day) => {
        const checkDate = `${day}. ${currentMonthName} ${currentYear}`;
        return appointments.some(a => a.date === checkDate);
    };

    const handleSaveAppointment = () => {
        if (!newEntry.client) return;
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        const newApp = { ...newEntry, date: fullDate, id: Date.now() };
        
        setAppointments([...appointments, newApp]);
        
        // Automatsko dodavanje u klijente ako ne postoji
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { name: newEntry.client, id: Date.now() + 1, phone: '-', email: '-', social: '@ink_client' }]);
        }
        
        setIsModalOpen(false);
        setNewEntry({ client: '', time: '', style: '', price: '' });
    };

    // FIX: Ispravljen Add Client
    const handleAddClient = () => {
        if (!newClient.name) return;
        setClients([...clients, { ...newClient, id: Date.now() }]);
        setIsClientModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', social: '' });
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6 flex justify-between items-center">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black gold-text italic uppercase tracking-tighter">INKFLOW <span className="text-[8px] not-italic text-slate-500 ml-1">BY DJAPE NOISE</span></h1>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">Tattoo Management</p>
                </div>
                <button onClick={() => { localStorage.removeItem('inkflow_logged_user'); window.location.reload(); }} className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[8px] uppercase font-black">Out</button>
            </header>

            <main className="p-4">
                {activeTab === 'cal' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="card-bg p-6 rounded-[40px]">
                            <div className="flex justify-between items-center mb-6 bg-[#0a0f1d] p-4 rounded-3xl border border-white/5">
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 0 ? 11 : prev - 1)} className="gold-text font-black text-xl px-2"> &lt; </button>
                                <div className="text-center">
                                    <p className="font-black gold-text italic text-lg uppercase">{currentMonthName}</p>
                                    <p className="text-[10px] text-slate-600 font-bold">{currentYear}</p>
                                </div>
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 11 ? 0 : prev + 1)} className="gold-text font-black text-xl px-2"> &gt; </button>
                            </div>
                            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                    <button key={day} onClick={() => setSelectedDate(day)}
                                        className={`flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-white/5'}`}>
                                        <span className="text-sm">{day}</span>
                                        {hasApp(day) && <span className={`w-1 h-1 rounded-full mt-1 ${selectedDate === day ? 'bg-black' : 'bg-yellow-500'}`}></span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card-bg p-6 rounded-[40px] min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-black gold-text uppercase italic">{selectedDate}. {currentMonthName} {currentYear}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase">Add Session</button>
                            </div>
                            {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).map(app => (
                                <div key={app.id} className="bg-[#0f172a] p-5 rounded-3xl flex justify-between items-center border border-white/5 mb-3">
                                    <div>
                                        <p className="font-black text-white text-base">{app.client}</p>
                                        <p className="text-[9px] text-slate-500 uppercase font-bold">{app.time} | {app.style}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="gold-text font-black text-sm">{app.price}</span>
                                        <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="text-red-900/40 text-xl">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'crm' && (
                    <div className="space-y-4 animate-in fade-in">
                        <button onClick={() => setIsClientModalOpen(true)} className="w-full gold-bg text-black font-black p-5 rounded-3xl uppercase text-[11px] tracking-widest shadow-lg">Add New Client</button>
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-5 flex justify-between items-center border border-white/5 rounded-[30px]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 gold-bg rounded-full flex items-center justify-center text-black font-black text-lg shadow-inner">{c.name[0]}</div>
                                    <div>
                                        <p className="font-black text-white uppercase italic text-sm">{c.name}</p>
                                        <p className="text-[9px] gold-text font-bold tracking-widest">{c.social || '@ink_client'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingClient(c); setIsEditClientOpen(true); }} className="p-2 opacity-20">✏️</button>
                                    <button onClick={() => setClients(clients.filter(cli => cli.id !== c.id))} className="p-2 opacity-20 text-red-500">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Ovde idu ostali tabovi (Home, Business) koje već imaš... */}
            </main>

            {/* MODAL: ADD SESSION (Vraćena Cancel opcija) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center p-6">
                    <div className="card-bg w-full p-8 rounded-[45px] border border-white/10 shadow-2xl">
                        <h2 className="text-lg font-black gold-text uppercase italic mb-8 text-center">{selectedDate}. {currentMonthName} {currentYear}</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0a0f1d] border border-white/5 p-5 rounded-2xl text-white text-center font-bold" onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <input type="text" placeholder="Tattoo Style" className="w-full bg-[#0a0f1d] border border-white/5 p-5 rounded-2xl text-white text-center font-bold" onChange={e => setNewEntry({...newEntry, style: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0a0f1d] p-4 rounded-2xl text-center border border-white/5">
                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Time</p>
                                    <input type="time" className="bg-transparent font-black text-yellow-500 text-center outline-none w-full" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                </div>
                                <div className="bg-[#0a0f1d] p-4 rounded-2xl text-center border border-white/5">
                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Price</p>
                                    <input type="text" placeholder="0 €" className="w-full bg-transparent font-black text-white text-center outline-none" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                                </div>
                            </div>
                            <button onClick={handleSaveAppointment} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase mt-4 tracking-widest">Confirm Session</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 font-black p-2 uppercase text-[9px] mt-2 tracking-widest">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ADD CLIENT (Fix za dugme) */}
            {isClientModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center p-6">
                    <div className="card-bg w-full p-8 rounded-[45px] border border-white/10">
                        <h2 className="text-lg font-black gold-text uppercase italic mb-8 text-center">New Client</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#0a0f1d] border border-white/5 p-5 rounded-2xl text-white text-center font-bold" onChange={e => setNewClient({...newClient, name: e.target.value})} />
                            <input type="text" placeholder="Instagram / Social" className="w-full bg-[#0a0f1d] border border-white/5 p-5 rounded-2xl text-white text-center font-bold" onChange={e => setNewClient({...newClient, social: e.target.value})} />
                            <button onClick={handleAddClient} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase mt-4">Save Client</button>
                            <button onClick={() => setIsClientModalOpen(false)} className="w-full text-slate-500 font-black p-2 uppercase text-[9px] mt-2 tracking-widest">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 rounded-3xl backdrop-blur-md shadow-2xl">
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
