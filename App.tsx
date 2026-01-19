import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  User, 
  Trophy, 
  Menu, 
  X, 
  Trash2, 
  CheckCircle,
  Dumbbell,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Users
} from 'lucide-react';
import MapContainer from './components/MapContainer';
import Rating from './components/Rating';
import { getSquashCoachAdvice } from './services/geminiService';
import { Player, Court, Booking, GeoLocation, Review } from './types';

// --- MOCK DATA ---
const MOCK_COURTS: Court[] = [
  { id: 'c1', name: 'Kallang Squash Centre', address: '8 Stadium Blvd, Singapore', location: { lat: 1.3069, lng: 103.8760 } },
  { id: 'c2', name: 'Burghley Squash Centre', address: '43 Burghley Dr, Singapore', location: { lat: 1.3605, lng: 103.8643 } },
  { id: 'c3', name: 'Yio Chu Kang Squash Centre', address: '200 Ang Mo Kio Ave 9, Singapore', location: { lat: 1.3820, lng: 103.8450 } },
];

const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Alex Johnson', skillLevel: 'Advanced', rating: 4.5, avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 'p2', name: 'Sam Smith', skillLevel: 'Intermediate', rating: 3.2, avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 'p3', name: 'Jordan Lee', skillLevel: 'Pro', rating: 4.9, avatar: 'https://picsum.photos/100/100?random=3' },
];

// Initial mock bookings representing open matches from other players
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    courtId: 'c1',
    playerId: 'p1', // Alex is the host
    date: '2024-11-15',
    time: '18:00',
    registeredAt: new Date().toISOString(),
    status: 'OPEN',
    targetSkillLevel: 'Advanced',
    opponentName: 'Open Match'
  },
  {
    id: 'b2',
    courtId: 'c3',
    playerId: 'p2', // Sam is the host
    date: '2024-11-16',
    time: '10:00',
    registeredAt: new Date().toISOString(),
    status: 'OPEN',
    targetSkillLevel: 'Intermediate',
    opponentName: 'Open Match'
  }
];

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<'dashboard' | 'book' | 'find-match' | 'players' | 'profile'>('dashboard');
  // Default to Singapore coordinates
  const [userLocation, setUserLocation] = useState<GeoLocation | null>({ lat: 1.3521, lng: 103.8198 });
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiTip, setAiTip] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Form State
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [matchType, setMatchType] = useState<'specific' | 'open'>('specific');
  const [formOpponent, setFormOpponent] = useState('');
  const [formTargetSkill, setFormTargetSkill] = useState<string>('Any');
  
  // Find Match Filter State
  const [skillFilter, setSkillFilter] = useState<string>('All');

  // Confirmation Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);

  // --- EFFECTS ---

  useEffect(() => {
    // Get real geolocation on mount (overrides default Singapore location if successful)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Log a friendly message instead of an error object
          console.log(`Using default location (Singapore). Reason: ${error.message}`);
        },
        // Add options for better reliability
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  // --- HANDLERS ---

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourt || !formDate || !formTime) {
      alert("Please fill in all required fields and select a court.");
      return;
    }
    // Open confirmation modal
    setShowBookingModal(true);
  };

  const finalizeBooking = () => {
    if (!selectedCourt) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      courtId: selectedCourt,
      playerId: 'currentUser', // Mock user ID
      date: formDate,
      time: formTime,
      registeredAt: new Date().toISOString(),
      userLocationAtRegistration: userLocation || undefined,
      opponentName: matchType === 'open' ? 'Open Match' : (formOpponent || 'Open Match'),
      status: matchType === 'open' ? 'OPEN' : 'CONFIRMED',
      targetSkillLevel: matchType === 'open' ? (formTargetSkill as any) : undefined
    };

    setBookings((prev) => [...prev, newBooking]);
    setView('dashboard');
    // Reset form and modal
    setFormDate('');
    setFormTime('');
    setFormOpponent('');
    setMatchType('specific');
    setSelectedCourt(null);
    setShowBookingModal(false);
  };

  const handleCancelBooking = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setBookings((prev) => prev.map((b) => {
        if (b.id === id) {
          return { ...b, status: 'CANCELLED' as const };
        }
        return b;
      }).filter(b => b.status !== 'CANCELLED')); // Physically remove for now, or keep as cancelled history
    }
  };

  const handleJoinMatch = (bookingId: string) => {
    if (window.confirm("Do you want to join this match?")) {
      setBookings((prev) => prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'CONFIRMED' as const,
            joinedPlayerId: 'currentUser',
            opponentName: 'You (Joined)'
          };
        }
        return b;
      }));
      alert("Match joined successfully! Check your dashboard.");
      setView('dashboard');
    }
  };

  const handleAiAdvice = async () => {
    setIsAiLoading(true);
    const advice = await getSquashCoachAdvice('Intermediate', 'Advanced', `I have a match at ${formTime} against ${formOpponent || 'an unknown opponent'}. How should I prepare?`);
    setAiTip(advice);
    setIsAiLoading(false);
  };

  // --- RENDER HELPERS ---

  const renderDashboard = () => {
    // Filter bookings where the current user is either the host or the guest
    const myBookings = bookings.filter(b => 
      (b.playerId === 'currentUser' || b.joinedPlayerId === 'currentUser') && 
      b.status !== 'CANCELLED'
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Your Upcoming Matches</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('find-match')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2"
            >
              <Search size={18} />
              Find Match
            </button>
            <button 
              onClick={() => setView('book')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2"
            >
              <Calendar size={18} />
              Book Court
            </button>
          </div>
        </div>

        {myBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Dumbbell className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 text-lg">No matches scheduled yet.</p>
            <p className="text-slate-400 text-sm">Find a match to join or book a court!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myBookings.map((booking) => {
              const court = MOCK_COURTS.find(c => c.id === booking.courtId);
              // Determine if I am the host
              const isHost = booking.playerId === 'currentUser';
              
              return (
                <div key={booking.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{court?.name || 'Unknown Court'}</h3>
                      <p className="text-slate-500 text-sm">{court?.address}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${booking.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {booking.status === 'OPEN' ? 'Looking for Player' : 'Confirmed'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-slate-700">
                      <Calendar size={16} className="mr-2 text-slate-400" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <MapPin size={16} className="mr-2 text-slate-400" />
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <User size={16} className="mr-2 text-slate-400" />
                      {booking.status === 'OPEN' ? (
                        <span className="italic text-slate-500">Waiting for opponent...</span>
                      ) : (
                        <span>
                           {isHost 
                              ? (booking.opponentName === 'Open Match' && booking.joinedPlayerId ? 'Opponent Joined' : `vs. ${booking.opponentName}`) 
                              : `Host: ${MOCK_PLAYERS.find(p => p.id === booking.playerId)?.name || 'Unknown'}`
                           }
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <span className="shrink-0">Booked from:</span>
                      {booking.userLocationAtRegistration 
                        ? (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${booking.userLocationAtRegistration.lat},${booking.userLocationAtRegistration.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline truncate"
                            title="View booking location in Google Maps"
                          >
                            {booking.userLocationAtRegistration.lat.toFixed(4)}, {booking.userLocationAtRegistration.lng.toFixed(4)}
                          </a>
                        ) 
                        : 'Unknown Location'}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleCancelBooking(booking.id)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    {isHost ? 'Cancel Booking' : 'Leave Match'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderFindMatch = () => {
    // Filter for open matches that are NOT created by the current user
    const openMatches = bookings.filter(b => 
      b.status === 'OPEN' && 
      b.playerId !== 'currentUser' &&
      (skillFilter === 'All' || b.targetSkillLevel === skillFilter || b.targetSkillLevel === 'Any')
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Find a Match</h2>
            <p className="text-slate-500 text-sm">Join open games with players at your level</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <Filter size={18} className="text-slate-400 ml-2" />
            <span className="text-sm font-medium text-slate-700">Skill Level:</span>
            <select 
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-800 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Pro">Pro</option>
            </select>
          </div>
        </div>

        {openMatches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 text-lg">No open matches found.</p>
            <p className="text-slate-400 text-sm">Try changing filters or book your own court!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openMatches.map((booking) => {
              const court = MOCK_COURTS.find(c => c.id === booking.courtId);
              const hostPlayer = MOCK_PLAYERS.find(p => p.id === booking.playerId);

              return (
                <div key={booking.id} className="bg-white p-0 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition overflow-hidden flex flex-col">
                   <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={hostPlayer?.avatar || 'https://via.placeholder.com/40'} 
                          alt="Host" 
                          className="w-10 h-10 rounded-full border border-white shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{hostPlayer?.name || 'Unknown Player'}</p>
                          <div className="flex items-center">
                            <Rating value={Math.round(hostPlayer?.rating || 0)} readonly size={10} />
                            <span className="text-[10px] text-slate-500 ml-1 uppercase font-bold tracking-wider">{hostPlayer?.skillLevel}</span>
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="p-5 flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                           <h4 className="font-bold text-slate-700">{court?.name}</h4>
                           <p className="text-xs text-slate-500">{court?.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                          <Calendar size={14} className="text-emerald-600" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                          <MapPin size={14} className="text-emerald-600" />
                          {booking.time}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-xs text-slate-500 mb-1">Looking for:</div>
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded border border-indigo-100 font-medium">
                          {booking.targetSkillLevel === 'Any' ? 'Any Level' : `${booking.targetSkillLevel} Player`}
                        </span>
                      </div>
                   </div>

                   <div className="p-4 pt-0 mt-auto">
                     <button 
                       onClick={() => handleJoinMatch(booking.id)}
                       className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition active:scale-[0.98]"
                     >
                       Join Match
                     </button>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderBooking = () => (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Map Section */}
      <div className="lg:col-span-2 bg-slate-200 rounded-xl overflow-hidden shadow-inner relative h-96 lg:h-auto">
         <MapContainer 
            courts={MOCK_COURTS} 
            userLocation={userLocation}
            selectedCourtId={selectedCourt}
            onSelectCourt={setSelectedCourt}
         />
         {!userLocation && (
           <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow text-xs z-[400] flex items-center gap-2">
             <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
             Locating you...
           </div>
         )}
      </div>

      {/* Booking Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="text-emerald-600" />
          Book a Court
        </h2>

        <form onSubmit={handleBookingSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Court</label>
            <div className={`p-3 border rounded-lg text-slate-600 ${selectedCourt ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200'}`}>
              {selectedCourt 
                ? MOCK_COURTS.find(c => c.id === selectedCourt)?.name 
                : "Select a court on the map"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input 
                type="time" 
                required
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Match Type Selection */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
             <span className="block text-sm font-medium text-slate-700 mb-2">Match Type</span>
             <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMatchType('specific')}
                  className={`flex-1 py-2 text-sm rounded-md border font-medium transition ${matchType === 'specific' ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500' : 'border-transparent text-slate-500 hover:bg-slate-200'}`}
                >
                  Specific Opponent
                </button>
                <button
                  type="button"
                  onClick={() => setMatchType('open')}
                  className={`flex-1 py-2 text-sm rounded-md border font-medium transition ${matchType === 'open' ? 'bg-white border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500' : 'border-transparent text-slate-500 hover:bg-slate-200'}`}
                >
                  Open Match
                </button>
             </div>
          </div>

          {matchType === 'specific' ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-slate-700 mb-1">Opponent Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe"
                value={formOpponent}
                onChange={(e) => setFormOpponent(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Skill Level</label>
              <select
                value={formTargetSkill}
                onChange={(e) => setFormTargetSkill(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="Any">Any Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Pro">Pro</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Other players will see this match in 'Find Match' and can join you.</p>
            </div>
          )}

          {/* AI Coach Integration */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-indigo-800 font-semibold flex items-center gap-2 text-sm">
                 <Sparkles size={14} /> AI Coach Tips
               </h3>
               <button 
                type="button"
                onClick={handleAiAdvice}
                disabled={isAiLoading}
                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
               >
                 {isAiLoading ? 'Thinking...' : 'Get Tips'}
               </button>
            </div>
            <p className="text-xs text-indigo-700 italic min-h-[40px]">
              {aiTip || "Tap 'Get Tips' for pre-match advice based on your booking details."}
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            Review Booking
          </button>
        </form>
      </div>
    </div>
  );

  const renderPlayers = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Trophy className="text-yellow-500" />
        Top Players
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_PLAYERS.map((player) => (
          <div key={player.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <img src={player.avatar} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{player.name}</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{player.skillLevel}</p>
              <div className="flex items-center mt-1">
                <Rating value={Math.round(player.rating)} readonly size={16} />
                <span className="text-xs text-slate-400 ml-2">({player.rating})</span>
              </div>
            </div>
            <button className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-full transition">
              <MessageSquare size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // --- MAIN RENDER ---

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-emerald-600 text-white p-2 rounded-lg mr-3">
                 <Dumbbell size={24} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800">Squash<span className="text-emerald-600">Pro</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8 items-center">
              <button 
                onClick={() => setView('dashboard')}
                className={`${view === 'dashboard' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView('find-match')}
                className={`${view === 'find-match' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
              >
                Find Match
              </button>
              <button 
                onClick={() => setView('book')}
                className={`${view === 'book' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
              >
                Book Court
              </button>
              <button 
                onClick={() => setView('players')}
                className={`${view === 'players' ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent hover:text-slate-700'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
              >
                Players
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500 hover:text-slate-700 p-2">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 pb-2">
            <div className="space-y-1 px-2 pt-2">
              <button onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600">Dashboard</button>
              <button onClick={() => { setView('find-match'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600">Find Match</button>
              <button onClick={() => { setView('book'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600">Book Court</button>
              <button onClick={() => { setView('players'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600">Players</button>
            </div>
          </div>
        )}
      </nav>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && renderDashboard()}
        {view === 'find-match' && renderFindMatch()}
        {view === 'book' && renderBooking()}
        {view === 'players' && renderPlayers()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2024 SquashPro. Find your match.</p>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-emerald-600 mb-4">
              <CheckCircle size={28} />
              <h3 className="text-xl font-bold text-slate-800">Confirm Booking</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Court</p>
                    <p className="text-slate-800 font-medium">
                      {MOCK_COURTS.find(c => c.id === selectedCourt)?.name}
                    </p>
                    <p className="text-xs text-slate-500">{MOCK_COURTS.find(c => c.id === selectedCourt)?.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Date</p>
                        <p className="text-slate-800 font-medium">{formDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Time</p>
                        <p className="text-slate-800 font-medium">{formTime}</p>
                      </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Match Type</p>
                    <p className="text-slate-800 font-medium flex items-center gap-2">
                       {matchType === 'open' ? 'Open Match (Others can join)' : 'Specific Opponent'}
                    </p>
                  </div>

                  {matchType === 'specific' ? (
                     <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Opponent</p>
                        <p className="text-slate-800 font-medium">{formOpponent || 'Open Match'}</p>
                     </div>
                  ) : (
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Target Skill</p>
                        <p className="text-slate-800 font-medium">{formTargetSkill}</p>
                     </div>
                  )}
              </div>
              
              <p className="text-sm text-slate-500">
                Please review the details above. Once confirmed, your slot will be reserved.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-2.5 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Back to Edit
              </button>
              <button
                onClick={finalizeBooking}
                className="flex-1 py-2.5 px-4 bg-emerald-600 rounded-lg text-white font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;