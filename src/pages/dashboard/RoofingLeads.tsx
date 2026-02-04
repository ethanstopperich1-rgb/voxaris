import { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Headphones,
  Home,
  Shield,
  Flame,
  Snowflake
} from "lucide-react";
import { supabase } from "../../integrations/supabase/client";
import { GlowingEffect } from "../../components/ui/glowing-effect";
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "../../components/ui/chat-input";
import { MessageSquare, Bot, User, TrendingUp, Sparkles } from "lucide-react";

// Types
interface RoofingLead {
  id: string;
  call_id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  property_address: string | null;
  roof_issue: string | null;
  storm_damage: boolean;
  insurance_claim_filed: boolean;
  wants_insurance_help: boolean;
  is_homeowner: boolean | null;
  urgency_level: string | null;
  appointment_scheduled: boolean;
  appointment_date: string | null;
  office_location: string | null;
  call_outcome: string | null;
  call_summary: string | null;
  lead_quality: string | null;
  recording_url: string | null;
  email_sent: boolean;
  direction?: string;
  duration_ms?: number;
}

// Components with GlowingEffect - 21st.dev style
const GlowingCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <li className={`min-h-[8rem] list-none ${className}`}>
    <div
      onClick={onClick}
      className={`relative h-full rounded-[1.25rem] border-[0.75px] border-zinc-700/50 p-2 md:rounded-[1.5rem] md:p-3 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
        variant="roofing"
      />
      <div className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border-[0.75px] border-zinc-800 bg-zinc-900/90 p-6 shadow-sm">
        {children}
      </div>
    </div>
  </li>
);

// Lead card with GlowingEffect - the actual leads shown in the list
const GlowingLeadCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div className={`relative mb-4 ${className}`}>
    <div
      onClick={onClick}
      className={`relative rounded-[1.25rem] border-[0.75px] border-zinc-700/50 p-2 md:rounded-[1.5rem] md:p-3 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <GlowingEffect
        spread={60}
        glow={true}
        disabled={false}
        proximity={100}
        inactiveZone={0.01}
        borderWidth={2}
        variant="roofing"
      />
      <div className="relative overflow-hidden rounded-xl border-[0.75px] border-zinc-800 bg-zinc-900/90 p-6 shadow-sm transition-all duration-300 hover:border-amber-500/30">
        {children}
      </div>
    </div>
  </div>
);

const CyberCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={`relative bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-6 transition-all duration-300 hover:border-amber-600/30 hover:shadow-lg hover:shadow-amber-500/5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, color, description }: { label: string; value: string | number; icon: any; color: string; description?: string }) => (
  <GlowingCard>
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="text-3xl font-bold text-white font-mono tracking-tight">{value}</div>
        <div className="text-sm font-medium text-zinc-400">{label}</div>
        {description && <div className="text-xs text-zinc-500 mt-1">{description}</div>}
      </div>
    </div>
  </GlowingCard>
);

const LeadQualityBadge = ({ quality }: { quality: string | null }) => {
  if (!quality) return null;

  const q = quality.toLowerCase();
  let bgColor = 'bg-zinc-800';
  let textColor = 'text-zinc-400';
  let icon = null;

  if (q === 'hot' || q === 'high') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-400';
    icon = <Flame className="w-3 h-3" />;
  } else if (q === 'warm' || q === 'medium') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-400';
  } else if (q === 'cold' || q === 'low') {
    bgColor = 'bg-blue-500/20';
    textColor = 'text-blue-400';
    icon = <Snowflake className="w-3 h-3" />;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {quality}
    </span>
  );
};

const LeadCard = ({ lead, expanded, onToggle }: { lead: RoofingLead; expanded: boolean; onToggle: () => void }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (ms: number | undefined) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlowingLeadCard onClick={onToggle}>
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Appointment Status Icon */}
          <div className={`p-3 rounded-xl border ${lead.appointment_scheduled ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-800 border-zinc-700'}`}>
            {lead.appointment_scheduled ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <Phone className="w-6 h-6 text-zinc-400" />
            )}
          </div>

          {/* Customer Info */}
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white">
                {lead.customer_name || 'Unknown Caller'}
              </h3>
              <LeadQualityBadge quality={lead.lead_quality} />
              {lead.storm_damage && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                  <AlertTriangle className="w-3 h-3" />
                  Storm Damage
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400">
              {lead.customer_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {lead.customer_phone}
                </span>
              )}
              {lead.property_address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lead.property_address.substring(0, 40)}...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-zinc-400">{formatDate(lead.created_at)}</div>
            <div className="text-xs text-zinc-500 font-mono">{formatDuration(lead.duration_ms)}</div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-6 pt-6 border-t border-zinc-800" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Customer Details
              </h4>
              <div className="space-y-2 text-sm">
                {lead.customer_email && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${lead.customer_email}`} className="text-blue-400 hover:underline">
                      {lead.customer_email}
                    </a>
                  </div>
                )}
                {lead.property_address && (
                  <div className="flex items-start gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{lead.property_address}</span>
                  </div>
                )}
                {lead.is_homeowner !== null && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Home className="w-4 h-4" />
                    <span>Homeowner: {lead.is_homeowner ? 'Yes' : 'No'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Roof Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Roof Details
              </h4>
              <div className="space-y-2 text-sm">
                {lead.roof_issue && (
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Issue:</span> {lead.roof_issue}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {lead.storm_damage ? (
                    <span className="text-orange-400">⚠️ Storm Damage Reported</span>
                  ) : (
                    <span className="text-zinc-500">No Storm Damage</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Shield className="w-4 h-4" />
                  <span>Insurance Claim: {lead.insurance_claim_filed ? 'Filed' : 'Not Filed'}</span>
                </div>
                {lead.wants_insurance_help && (
                  <div className="text-emerald-400">✓ Wants Insurance Help</div>
                )}
              </div>
            </div>

            {/* Appointment */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointment
              </h4>
              <div className="space-y-2 text-sm">
                {lead.appointment_scheduled ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Scheduled</span>
                    </div>
                    {lead.appointment_date && (
                      <div className="text-zinc-400">
                        <span className="text-zinc-500">Date/Time:</span>{' '}
                        {new Date(lead.appointment_date).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <XCircle className="w-4 h-4" />
                    <span>Not Scheduled</span>
                  </div>
                )}
                {lead.office_location && (
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Office:</span> {lead.office_location}
                  </div>
                )}
                {lead.urgency_level && (
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Urgency:</span> {lead.urgency_level}
                  </div>
                )}
                {lead.call_outcome && (
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Outcome:</span>{' '}
                    <span className={
                      lead.call_outcome === 'appointment_booked' ? 'text-emerald-400 font-medium' :
                      lead.call_outcome === 'callback_needed' ? 'text-yellow-400' :
                      lead.call_outcome === 'voicemail' ? 'text-orange-400' :
                      'text-zinc-400'
                    }>
                      {lead.call_outcome.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Call Summary */}
          {lead.call_summary && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-zinc-300 mb-2">Call Summary</h4>
              <p className="text-sm text-zinc-400 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                {lead.call_summary}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            {lead.recording_url && (
              <a
                href={lead.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
              >
                <Headphones className="w-4 h-4" />
                Listen to Recording
              </a>
            )}
            {lead.customer_phone && (
              <a
                href={`tel:${lead.customer_phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Back
              </a>
            )}
          </div>

          {/* Status Indicators */}
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-6 text-xs">
            {lead.email_sent !== undefined && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span className={lead.email_sent ? 'text-emerald-400' : 'text-zinc-500'}>
                  Email {lead.email_sent ? 'Sent ✓' : 'Not Sent'}
                </span>
              </div>
            )}
            {lead.direction && (
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Phone className="w-3.5 h-3.5" />
                <span className="capitalize">{lead.direction} Call</span>
              </div>
            )}
            {lead.duration_ms && (
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.floor(lead.duration_ms / 60000)}:{String(Math.floor((lead.duration_ms % 60000) / 1000)).padStart(2, '0')} duration</span>
              </div>
            )}
          </div>
        </div>
      )}
    </GlowingLeadCard>
  );
};

// Main Page Component
const RoofingLeads = () => {
  const [leads, setLeads] = useState<RoofingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // AI Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      // Query directly from Supabase to bypass backend schema cache issues
      const { data, error } = await supabase
        .from('roofing_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase error:', error);
        // Fallback to API if direct query fails
        const response = await fetch('/api/roofing/leads');
        const apiData = await response.json();
        if (apiData.success) {
          setLeads(apiData.leads || []);
        }
      } else {
        setLeads(data || []);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const totalLeads = leads.length;
  const appointmentsBooked = leads.filter(l => l.appointment_scheduled).length;
  const hotLeads = leads.filter(l => l.lead_quality?.toLowerCase() === 'hot').length;
  const stormDamageLeads = leads.filter(l => l.storm_damage).length;

  // AI Chat - Analyze leads data
  const analyzeLeads = (question: string): string => {
    const q = question.toLowerCase();

    // Calculate detailed stats
    const conversionRate = totalLeads > 0 ? Math.round((appointmentsBooked / totalLeads) * 100) : 0;
    const stormDamageRate = totalLeads > 0 ? Math.round((stormDamageLeads / totalLeads) * 100) : 0;
    const hotLeadRate = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0;
    const wantsInsuranceHelp = leads.filter(l => l.wants_insurance_help).length;
    const insuranceFiledCount = leads.filter(l => l.insurance_claim_filed).length;
    const homeowners = leads.filter(l => l.is_homeowner).length;

    // Group by office
    const officeBreakdown: Record<string, number> = {};
    leads.forEach(l => {
      if (l.office_location) {
        officeBreakdown[l.office_location] = (officeBreakdown[l.office_location] || 0) + 1;
      }
    });

    // Group by roof issue
    const issueBreakdown: Record<string, number> = {};
    leads.forEach(l => {
      if (l.roof_issue) {
        const issue = l.roof_issue.toLowerCase();
        if (issue.includes('leak')) issueBreakdown['Leaks'] = (issueBreakdown['Leaks'] || 0) + 1;
        else if (issue.includes('storm') || issue.includes('damage')) issueBreakdown['Storm Damage'] = (issueBreakdown['Storm Damage'] || 0) + 1;
        else if (issue.includes('shingle')) issueBreakdown['Shingle Issues'] = (issueBreakdown['Shingle Issues'] || 0) + 1;
        else if (issue.includes('age') || issue.includes('old')) issueBreakdown['Age/Wear'] = (issueBreakdown['Age/Wear'] || 0) + 1;
        else issueBreakdown['Other'] = (issueBreakdown['Other'] || 0) + 1;
      }
    });

    // Urgency breakdown
    const highUrgency = leads.filter(l => l.urgency_level?.toLowerCase() === 'high' || l.urgency_level?.toLowerCase() === 'emergency').length;
    const mediumUrgency = leads.filter(l => l.urgency_level?.toLowerCase() === 'medium').length;

    // Respond based on question
    if (q.includes('trend') || q.includes('pattern') || q.includes('insight')) {
      const insights = [];
      if (stormDamageRate > 40) insights.push(`Storm damage is high (${stormDamageRate}%) - great time for insurance claim assistance.`);
      if (conversionRate > 50) insights.push(`Strong conversion rate at ${conversionRate}% - AI agent is performing well.`);
      if (conversionRate < 30) insights.push(`Conversion rate is ${conversionRate}% - consider refining the scheduling script.`);
      if (wantsInsuranceHelp > totalLeads / 2) insights.push(`${Math.round((wantsInsuranceHelp / totalLeads) * 100)}% want insurance help - big opportunity.`);
      if (highUrgency > totalLeads / 3) insights.push(`${highUrgency} leads are high urgency - prioritize these for fast follow-up.`);

      return insights.length > 0
        ? `Here are the key trends I see:\n\n${insights.map(i => `• ${i}`).join('\n')}`
        : `With ${totalLeads} leads, I'm seeing a ${conversionRate}% conversion rate. ${stormDamageLeads} involve storm damage.`;
    }

    if (q.includes('storm') || q.includes('insurance')) {
      return `Storm Damage Analysis:\n\n• ${stormDamageLeads} leads (${stormDamageRate}%) reported storm damage\n• ${insuranceFiledCount} have already filed insurance claims\n• ${wantsInsuranceHelp} want help with insurance claims\n\nThis is a great opportunity for insurance-related roof replacements.`;
    }

    if (q.includes('conversion') || q.includes('appointment') || q.includes('book')) {
      return `Conversion Analysis:\n\n• ${appointmentsBooked} of ${totalLeads} leads booked appointments\n• That's a ${conversionRate}% conversion rate\n• ${totalLeads - appointmentsBooked} leads didn't book - consider follow-up outbound calls`;
    }

    if (q.includes('hot') || q.includes('quality') || q.includes('best')) {
      return `Lead Quality Breakdown:\n\n• ${hotLeads} hot leads (${hotLeadRate}%) - ready to close\n• ${highUrgency} high urgency leads need immediate attention\n• ${homeowners} confirmed homeowners (decision makers)`;
    }

    if (q.includes('office') || q.includes('location') || q.includes('area')) {
      const officeList = Object.entries(officeBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([office, count]) => `• ${office}: ${count} leads`)
        .join('\n');
      return `Leads by Office Location:\n\n${officeList || '• No location data yet'}`;
    }

    if (q.includes('issue') || q.includes('problem') || q.includes('roof')) {
      const issueList = Object.entries(issueBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([issue, count]) => `• ${issue}: ${count} leads`)
        .join('\n');
      return `Top Roof Issues:\n\n${issueList || '• No issue data yet'}`;
    }

    if (q.includes('summary') || q.includes('overview') || q.includes('report')) {
      return `Lead Dashboard Summary:\n\n📊 Total Leads: ${totalLeads}\n📅 Appointments: ${appointmentsBooked} (${conversionRate}%)\n🔥 Hot Leads: ${hotLeads}\n⛈️ Storm Damage: ${stormDamageLeads}\n🤝 Want Insurance Help: ${wantsInsuranceHelp}\n🏠 Confirmed Homeowners: ${homeowners}`;
    }

    // Default response
    return `I can help you analyze your roofing leads! Try asking:\n\n• "What trends do you see?"\n• "Tell me about storm damage leads"\n• "What's our conversion rate?"\n• "Show me hot leads"\n• "Break down by office location"\n• "What are the top roof issues?"\n• "Give me a summary"`;
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput("");
    setChatLoading(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = analyzeLeads(userMessage);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setChatLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 lg:p-10 font-sans">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Roofing <span className="text-blue-400">Leads</span>
            </h1>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-full flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE
            </span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">
            Real-time leads from Roofing Pros USA voice agent • Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {/* Stats Grid - Roofing Pros Themed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Leads"
          value={totalLeads}
          icon={Phone}
          color="text-amber-400"
          description="All incoming calls"
        />
        <StatCard
          label="Appointments Booked"
          value={appointmentsBooked}
          icon={Calendar}
          color="text-emerald-400"
          description="Inspections scheduled"
        />
        <StatCard
          label="Hot Leads"
          value={hotLeads}
          icon={Flame}
          color="text-red-400"
          description="Ready to close"
        />
        <StatCard
          label="Storm Damage"
          value={stormDamageLeads}
          icon={AlertTriangle}
          color="text-orange-400"
          description="Insurance eligible"
        />
      </div>

      {/* Post-Call Data Extraction Preview - Glowing Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <GlowingCard>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Home className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Property Info</h3>
              <p className="text-sm text-zinc-400">AI extracts address, property type, and homeowner status from every call</p>
            </div>
          </div>
        </GlowingCard>

        <GlowingCard>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Roof Assessment</h3>
              <p className="text-sm text-zinc-400">Storm damage detection, insurance claim status, and urgency scoring</p>
            </div>
          </div>
        </GlowingCard>

        <GlowingCard>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Smart Scheduling</h3>
              <p className="text-sm text-zinc-400">Automatic appointment booking with office routing by zip code</p>
            </div>
          </div>
        </GlowingCard>
      </div>

      {/* 16 Post-Call Extraction Fields - Feature Showcase */}
      {leads.length === 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <span className="text-amber-400">16</span> Data Points Extracted Per Call
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: "Name", icon: "👤" },
              { label: "Phone", icon: "📱" },
              { label: "Email", icon: "📧" },
              { label: "Address", icon: "🏠" },
              { label: "Roof Issue", icon: "🔧" },
              { label: "Storm Damage", icon: "⛈️" },
              { label: "Insurance Filed", icon: "📋" },
              { label: "Insurance Help", icon: "🤝" },
              { label: "Homeowner", icon: "🔑" },
              { label: "Urgency", icon: "⚡" },
              { label: "Appt Scheduled", icon: "📅" },
              { label: "Appt Date", icon: "🗓️" },
              { label: "Office", icon: "📍" },
              { label: "Call Outcome", icon: "✅" },
              { label: "Lead Quality", icon: "🔥" },
              { label: "Summary", icon: "📝" },
            ].map((field, i) => (
              <div key={i} className="bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-3 text-center hover:border-amber-500/30 transition-colors">
                <div className="text-lg mb-1">{field.icon}</div>
                <div className="text-xs text-zinc-400">{field.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leads List */}
      <div>
        <h2 className="text-xl font-bold text-zinc-200 mb-4">Recent Leads</h2>

        {loading && leads.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <CyberCard className="text-center py-12">
            <Phone className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-400 mb-2">No leads yet</h3>
            <p className="text-sm text-zinc-500">
              Leads will appear here when calls come through the Roofing Pros USA voice agent.
            </p>
          </CyberCard>
        ) : (
          <div>
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                expanded={expandedId === lead.id}
                onToggle={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Insights Chatbot - Floating Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-full shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105"
      >
        {chatOpen ? (
          <span className="text-white font-bold text-lg">&times;</span>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}
      </button>

      {/* AI Chatbot Panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[500px] bg-zinc-900/95 backdrop-blur-lg border border-zinc-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-700 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Lead Insights AI</h3>
                <p className="text-xs text-zinc-400">Ask about trends, conversions & more</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 mb-4">Ask me about your roofing leads!</p>
                <div className="space-y-2">
                  {["What trends do you see?", "Show conversion rate", "Storm damage analysis"].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setChatInput(suggestion);
                        setTimeout(() => {
                          setChatMessages([{ role: 'user', content: suggestion }]);
                          setChatLoading(true);
                          setTimeout(() => {
                            setChatMessages(prev => [...prev, { role: 'assistant', content: analyzeLeads(suggestion) }]);
                            setChatLoading(false);
                          }, 500);
                        }, 100);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="p-1.5 rounded-lg bg-amber-500/20 h-fit">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}
                <div className={`max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-amber-500/20 text-amber-100'
                    : 'bg-zinc-800 text-zinc-200'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="p-1.5 rounded-lg bg-zinc-700 h-fit">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/20 h-fit">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
                <div className="bg-zinc-800 px-4 py-3 rounded-xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-700">
            <ChatInput
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onSubmit={handleChatSubmit}
              loading={chatLoading}
              variant="default"
              className="bg-zinc-800/50 border-zinc-700"
            >
              <ChatInputTextArea
                placeholder="Ask about trends, conversions..."
                className="text-white placeholder:text-zinc-500 bg-transparent"
              />
              <ChatInputSubmit className="bg-amber-500 hover:bg-amber-600 border-none" />
            </ChatInput>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoofingLeads;
