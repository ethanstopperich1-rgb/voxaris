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
  Snowflake,
  Activity,
  Zap,
  BarChart3
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

// Premium Bento Card with GlowingEffect - 21st.dev inspired
const BentoCard = ({ 
  children, 
  className = "", 
  size = "default",
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string; 
  size?: "default" | "large" | "wide";
  onClick?: () => void;
}) => {
  const sizeClasses = {
    default: "col-span-1",
    large: "col-span-1 md:col-span-2 row-span-2",
    wide: "col-span-1 md:col-span-2"
  };

  return (
    <div className={`${sizeClasses[size]} list-none ${className}`}>
      <div
        onClick={onClick}
        className={`group relative h-full rounded-2xl border border-zinc-800/60 p-[1px] transition-all duration-500 ${onClick ? 'cursor-pointer' : ''}`}
      >
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={80}
          inactiveZone={0.01}
          borderWidth={2}
          variant="roofing"
        />
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-2xl shadow-black/20">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Lead card with premium styling
const GlowingLeadCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div className={`relative mb-4 ${className}`}>
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border border-zinc-800/50 p-[1px] transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <GlowingEffect
        spread={60}
        glow={true}
        disabled={false}
        proximity={120}
        inactiveZone={0.01}
        borderWidth={2}
        variant="roofing"
      />
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 transition-all duration-300">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  </div>
);

// Empty state card
const EmptyCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 ${className}`}>
    {children}
  </div>
);

// Premium Stat Card
const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  trend,
  description 
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  color: string; 
  trend?: { value: number; positive: boolean };
  description?: string;
}) => (
  <BentoCard>
    <div className="flex flex-col h-full justify-between gap-4">
      {/* Icon */}
      <div className={`inline-flex w-12 h-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      {/* Value and Label */}
      <div>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
          {trend && (
            <span className={`flex items-center gap-1 text-sm font-medium mb-1 ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.positive ? '+' : ''}{trend.value}%
              <TrendingUp className={`w-3 h-3 ${!trend.positive && 'rotate-180'}`} />
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400 font-medium mt-1">{label}</p>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
    </div>
  </BentoCard>
);

const LeadQualityBadge = ({ quality }: { quality: string | null }) => {
  if (!quality) return null;

  const q = quality.toLowerCase();
  let bgColor = 'bg-zinc-800/80';
  let textColor = 'text-zinc-400';
  let borderColor = 'border-zinc-700';
  let icon = null;

  if (q === 'hot' || q === 'high') {
    bgColor = 'bg-gradient-to-r from-red-500/20 to-orange-500/20';
    textColor = 'text-red-400';
    borderColor = 'border-red-500/30';
    icon = <Flame className="w-3 h-3" />;
  } else if (q === 'warm' || q === 'medium') {
    bgColor = 'bg-yellow-500/15';
    textColor = 'text-yellow-400';
    borderColor = 'border-yellow-500/30';
  } else if (q === 'cold' || q === 'low') {
    bgColor = 'bg-blue-500/15';
    textColor = 'text-blue-400';
    borderColor = 'border-blue-500/30';
    icon = <Snowflake className="w-3 h-3" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${bgColor} ${textColor} ${borderColor}`}>
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
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            lead.appointment_scheduled 
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30' 
              : 'bg-zinc-800/80 border border-zinc-700'
          }`}>
            {lead.appointment_scheduled ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <Phone className="w-5 h-5 text-zinc-400" />
            )}
          </div>

          {/* Customer Info */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base font-semibold text-white">
                {lead.customer_name || 'Unknown Caller'}
              </h3>
              <LeadQualityBadge quality={lead.lead_quality} />
              {lead.storm_damage && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">
                  <Zap className="w-3 h-3" />
                  Storm
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-zinc-500">
              {lead.customer_phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {lead.customer_phone}
                </span>
              )}
              {lead.property_address && (
                <span className="flex items-center gap-1.5 hidden sm:flex">
                  <MapPin className="w-3.5 h-3.5" />
                  {lead.property_address.substring(0, 35)}...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-zinc-400">{formatDate(lead.created_at)}</div>
            <div className="text-xs text-zinc-600 font-mono">{formatDuration(lead.duration_ms)}</div>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expanded ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-6 pt-6 border-t border-zinc-800/60" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Customer Details */}
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center">
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                </div>
                Customer Details
              </h4>
              <div className="space-y-3 text-sm">
                {lead.customer_email && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <a href={`mailto:${lead.customer_email}`} className="text-amber-400 hover:underline">
                      {lead.customer_email}
                    </a>
                  </div>
                )}
                {lead.property_address && (
                  <div className="flex items-start gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4 text-zinc-500 mt-0.5" />
                    <span>{lead.property_address}</span>
                  </div>
                )}
                {lead.is_homeowner !== null && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Home className="w-4 h-4 text-zinc-500" />
                    <span>Homeowner: <span className={lead.is_homeowner ? 'text-emerald-400' : 'text-zinc-500'}>{lead.is_homeowner ? 'Yes' : 'No'}</span></span>
                  </div>
                )}
              </div>
            </div>

            {/* Roof Details */}
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                </div>
                Roof Details
              </h4>
              <div className="space-y-3 text-sm">
                {lead.roof_issue && (
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Issue:</span> {lead.roof_issue}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {lead.storm_damage ? (
                    <span className="flex items-center gap-1.5 text-orange-400">
                      <Zap className="w-4 h-4" />
                      Storm Damage Reported
                    </span>
                  ) : (
                    <span className="text-zinc-500">No Storm Damage</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Shield className="w-4 h-4 text-zinc-500" />
                  <span>Insurance: <span className={lead.insurance_claim_filed ? 'text-emerald-400' : 'text-zinc-500'}>{lead.insurance_claim_filed ? 'Filed' : 'Not Filed'}</span></span>
                </div>
                {lead.wants_insurance_help && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    Wants Insurance Help
                  </div>
                )}
              </div>
            </div>

            {/* Appointment */}
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                Appointment
              </h4>
              <div className="space-y-3 text-sm">
                {lead.appointment_scheduled ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Scheduled</span>
                    </div>
                    {lead.appointment_date && (
                      <div className="text-zinc-400">
                        <span className="text-zinc-500">Date:</span>{' '}
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
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Clock className="w-4 h-4" />
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
                    <span className="text-zinc-500">Urgency:</span>{' '}
                    <span className={
                      lead.urgency_level.toLowerCase() === 'high' ? 'text-red-400' :
                      lead.urgency_level.toLowerCase() === 'medium' ? 'text-yellow-400' :
                      'text-zinc-400'
                    }>{lead.urgency_level}</span>
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
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                Call Summary
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                {lead.call_summary}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            {lead.recording_url && (
              <a
                href={lead.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm text-zinc-300 transition-all"
              >
                <Headphones className="w-4 h-4" />
                Listen to Recording
              </a>
            )}
            {lead.customer_phone && (
              <a
                href={`tel:${lead.customer_phone}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl text-sm text-white font-medium transition-all shadow-lg shadow-amber-500/20"
              >
                <Phone className="w-4 h-4" />
                Call Back
              </a>
            )}
          </div>

          {/* Status Indicators */}
          <div className="mt-5 pt-5 border-t border-zinc-800/60 flex items-center gap-4 flex-wrap text-xs">
            {lead.email_sent !== undefined && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${lead.email_sent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800/50 text-zinc-500'}`}>
                <Mail className="w-3.5 h-3.5" />
                <span>Email {lead.email_sent ? 'Sent' : 'Pending'}</span>
              </div>
            )}
            {lead.direction && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/50 rounded-lg text-zinc-500">
                <Phone className="w-3.5 h-3.5" />
                <span className="capitalize">{lead.direction}</span>
              </div>
            )}
            {lead.duration_ms && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/50 rounded-lg text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.floor(lead.duration_ms / 60000)}:{String(Math.floor((lead.duration_ms % 60000) / 1000)).padStart(2, '0')}</span>
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 p-6 lg:p-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              {/* Logo/Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Lead Dashboard
                  </h1>
                  <p className="text-xs text-zinc-500 font-medium">Roofing Pros USA</p>
                </div>
              </div>
              
              {/* Live indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-xs font-semibold tracking-wide">LIVE</span>
              </div>
            </div>
            
            <p className="text-zinc-500 text-sm">
              Real-time AI voice agent leads | Updated {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick stats pills */}
            <div className="hidden md:flex items-center gap-2 mr-4">
              <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400">
                <span className="text-white font-semibold">{totalLeads}</span> total
              </span>
              <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
                <span className="font-semibold">{appointmentsBooked}</span> booked
              </span>
            </div>
            
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 rounded-xl transition-all text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Stats Grid - Premium Bento Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Leads"
            value={totalLeads}
            icon={Phone}
            color="from-amber-500 to-orange-600"
            description="All incoming calls"
          />
          <StatCard
            label="Appointments"
            value={appointmentsBooked}
            icon={Calendar}
            color="from-emerald-500 to-teal-600"
            description="Inspections scheduled"
            trend={totalLeads > 0 ? { value: Math.round((appointmentsBooked / totalLeads) * 100), positive: true } : undefined}
          />
          <StatCard
            label="Hot Leads"
            value={hotLeads}
            icon={Flame}
            color="from-red-500 to-rose-600"
            description="Ready to close"
          />
          <StatCard
            label="Storm Damage"
            value={stormDamageLeads}
            icon={AlertTriangle}
            color="from-orange-500 to-amber-600"
            description="Insurance eligible"
          />
        </div>

        {/* Post-Call Data Extraction Preview - Premium Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <BentoCard>
            <div className="flex flex-col h-full gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                <Home className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Property Info</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">AI extracts address, property type, and homeowner status from every call</p>
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="flex flex-col h-full gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Roof Assessment</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">Storm damage detection, insurance claim status, and urgency scoring</p>
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="flex flex-col h-full gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Smart Scheduling</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">Automatic appointment booking with office routing by zip code</p>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* 16 Post-Call Extraction Fields - Feature Showcase */}
        {leads.length === 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  <span className="text-amber-400">16</span> Data Points Per Call
                </h2>
                <p className="text-xs text-zinc-500">Extracted automatically by AI</p>
              </div>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {[
                { label: "Name", icon: User },
                { label: "Phone", icon: Phone },
                { label: "Email", icon: Mail },
                { label: "Address", icon: MapPin },
                { label: "Roof Issue", icon: AlertTriangle },
                { label: "Storm Damage", icon: Zap },
                { label: "Insurance", icon: Shield },
                { label: "Urgency", icon: Activity },
                { label: "Homeowner", icon: Home },
                { label: "Scheduled", icon: Calendar },
                { label: "Date", icon: Clock },
                { label: "Office", icon: MapPin },
                { label: "Outcome", icon: CheckCircle },
                { label: "Quality", icon: Flame },
                { label: "Summary", icon: MessageSquare },
                { label: "Recording", icon: Headphones },
              ].map((field, i) => (
                <div 
                  key={i} 
                  className="group bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-3 text-center hover:border-amber-500/30 hover:bg-zinc-900 transition-all duration-200"
                >
                  <field.icon className="w-4 h-4 mx-auto mb-2 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                  <div className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">{field.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads List */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                <Activity className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
                <p className="text-xs text-zinc-500">{leads.length} total leads</p>
              </div>
            </div>
            
            {leads.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {leads.filter(l => l.appointment_scheduled).length} scheduled
              </div>
            )}
          </div>

          {loading && leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-amber-500 animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
              </div>
              <p className="text-zinc-500 text-sm mt-4">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <EmptyCard className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No leads yet</h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">
                Leads will appear here when calls come through the Roofing Pros USA voice agent.
              </p>
            </EmptyCard>
          ) : (
            <div className="space-y-4">
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
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative p-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-2xl shadow-2xl shadow-amber-500/30 transition-all duration-300 group-hover:scale-105">
            {chatOpen ? (
              <XCircle className="w-6 h-6 text-white" />
            ) : (
              <Sparkles className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
        
        {/* Tooltip */}
        {!chatOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ask AI about your leads
          </div>
        )}
      </button>

      {/* AI Chatbot Panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[520px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800/80 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Lead Insights AI</h3>
                  <p className="text-xs text-zinc-500">Analyze your roofing leads</p>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[320px]">
            {chatMessages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-7 h-7 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-400 mb-5">Ask me about your roofing leads!</p>
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
                      className="block w-full text-left px-4 py-2.5 text-sm text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
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
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-100 border border-amber-500/20'
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-800/80">
            <ChatInput
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onSubmit={handleChatSubmit}
              loading={chatLoading}
              variant="default"
              className="bg-zinc-900 border-zinc-800 rounded-xl"
            >
              <ChatInputTextArea
                placeholder="Ask about trends, conversions..."
                className="text-white placeholder:text-zinc-500 bg-transparent"
              />
              <ChatInputSubmit className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-none shadow-lg shadow-amber-500/20" />
            </ChatInput>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default RoofingLeads;
