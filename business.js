function BusinessOverview({ appointments, currentMonthName }) {
    // Matematika: Filtriramo termine za izabrani mesec i sabiramo cene
    const monthlyApps = appointments.filter(a => a.date.includes(currentMonthName));
    const revenue = monthlyApps.reduce((acc, curr) => acc + (parseInt(curr.price) || 0), 0);
    const clientCount = monthlyApps.length;
    
    // Progres bar (Cilj npr. 2000€)
    const goal = 2000;
    const progress = Math.min((revenue / goal) * 100, 100);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="card-bg p-8 text-center shadow-xl border border-slate-800">
                <p className="text-5xl font-black gold-text italic">{revenue}€</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-[0.2em]">Total Monthly Revenue</p>
                
                {/* Visual Indicator / Bar Chart */}
                <div className="mt-8 space-y-2 text-left">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-slate-400">Monthly Goal: {goal}€</span>
                        <span className="gold-text">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                        <div 
                            className="h-full gold-bg transition-all duration-1000" 
                            style={{ width: `${progress}%`, boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)' }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="card-bg p-6 text-center">
                    <p className="text-2xl font-black text-white">{clientCount}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sessions</p>
                </div>
                <div className="card-bg p-6 text-center">
                    <p className="text-2xl font-black text-white">{clientCount > 0 ? Math.round(revenue/clientCount) : 0}€</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg / Job</p>
                </div>
            </div>
        </div>
    );
}
