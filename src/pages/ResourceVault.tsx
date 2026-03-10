import { useNavigate } from "react-router-dom";
import { useState, useRef, useCallback } from "react";
import { Copy, Check, ChevronDown, ExternalLink, Search, Sparkles, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";
import content from "@/data/content.json";

interface ResourceCard {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  tag?: string;
}

/* ── All Templates (outreach + networking + interview) ── */
const TEMPLATES: ResourceCard[] = [
  {
    id: "tpl-info-interview",
    title: "Informational Interview Request",
    category: "Outreach",
    tag: "networking",
    description: "Request a brief conversation with a professional in your target industry.",
    content: `Subject: Quick Question About Your Career in [Industry]

Dear [Name],

My name is [Your Name] and I am a [program] student at Suffolk University. I came across your profile on LinkedIn and was impressed by your career trajectory in [industry/field].

I am currently exploring opportunities in [target area] and would greatly appreciate the chance to learn from your experience. Would you be open to a brief 20-minute conversation at your convenience?

I am particularly interested in hearing about how you transitioned into your current role and any advice you might have for someone entering the field.

Thank you for considering my request. I understand you are busy and truly appreciate any time you can share.

Best regards,
[Your Name]
[LinkedIn Profile URL]
[Phone Number]`,
  },
  {
    id: "tpl-recruiter",
    title: "Recruiter Outreach",
    category: "Outreach",
    tag: "job search",
    description: "Introduce yourself to a recruiter at your target company.",
    content: `Subject: Interest in [Role/Team] Opportunities at [Company]

Dear [Recruiter Name],

I am writing to express my strong interest in [specific role or team] at [Company]. I am currently completing my [degree program] at Suffolk University with a focus on [relevant specialization], and I will be available to begin full-time employment starting [date].

My background includes [1-2 specific relevant experiences or skills]. I am authorized to work in the United States under OPT and am prepared to discuss any additional details about my work authorization.

I have attached my resume for your review. I would welcome the opportunity to discuss how my skills align with your team's needs.

Thank you for your time and consideration.

Best regards,
[Your Name]
[LinkedIn Profile URL]
[Phone Number]`,
  },
  {
    id: "tpl-follow-up",
    title: "Networking Follow-Up",
    category: "Outreach",
    tag: "networking",
    description: "Follow up after meeting someone at an event or meeting.",
    content: `Subject: Great Connecting at [Event/Meeting] — Following Up

Dear [Name],

It was a pleasure meeting you at [event/context] on [date]. I really enjoyed our conversation about [specific topic discussed] and found your insights on [specific detail] particularly valuable.

As I mentioned, I am currently pursuing opportunities in [target industry/role] and would love to stay connected. If you have any suggestions for people I should speak with or resources I should explore, I would be very grateful.

Thank you again for your time and generosity. I hope to stay in touch.

Warm regards,
[Your Name]
[LinkedIn Profile URL]`,
  },
  {
    id: "net-elevator",
    title: "Problem-Solver Elevator Pitch",
    category: "Networking",
    tag: "networking",
    description: "A concise pitch positioning you as a solution to employer needs.",
    content: `I am a [Major] student at Suffolk University specializing in [Skill A] and [Skill B]. I recently achieved [Result] by implementing [Method]. I am currently focusing on the [Industry] sector to solve [Specific Problem] through data-driven strategies. My goal is to bring my international perspective and technical background to a team like yours to help drive [Specific Outcome]. I have been following [Company's] work on [Project], and I would love to learn more about how your team handles [Related Challenge].`,
  },
  {
    id: "net-referral",
    title: "Referral Request Template",
    category: "Networking",
    tag: "networking",
    description: "Ask a contact for a referral to an open position.",
    content: `Subject: Quick question about the [Job Title] role at [Company]

Hi [Name],

I am applying for the [Job Title] role at [Company]. Would you be open to sharing advice on team priorities and whether a referral might be appropriate? I want to make sure my application highlights the right strengths.

Thank you,
[Your Name]`,
  },
  {
    id: "net-thank-you",
    title: "Post-Interview Thank You",
    category: "Networking",
    tag: "interview",
    description: "Send a professional thank you after an interview.",
    content: `Subject: Thank you for the conversation about [Role]

Thank you for the opportunity to interview for [Role]. I appreciated our discussion about [Topic] and am excited about the possibility of contributing to [Company's] work in [Area]. Please do not hesitate to reach out if you need any additional information.

Best regards,
[Your Name]`,
  },
  {
    id: "net-cold",
    title: "Cold Outreach to Hiring Manager",
    category: "Networking",
    tag: "job search",
    description: "Reach out directly to a hiring manager with a value proposition.",
    content: `Subject: Interest in [Position] - [Your Name], Suffolk University

Hi [Name],

I am a graduate student at Suffolk University with a background in [Skill]. I noticed your team is working on [Challenge or Project], and I believe my experience with [Relevant Experience] could contribute meaningfully to your efforts. I would welcome the chance to learn more about your team's priorities. Would you be open to a brief conversation?

Best regards,
[Your Name]`,
  },
  {
    id: "net-icebreaker",
    title: "Networking Icebreaker Questions",
    category: "Networking",
    tag: "networking",
    description: "Natural conversation starters for professional mixers and events.",
    content: `Role: Act as a Networking Expert.
Context: I am attending a professional mixer for [Industry]. I want to approach a Senior Manager at [Company]. Based on their recent company news about [Insert News Item], draft 3 different natural-sounding opening questions that show I have done my research and am interested in their perspective.
Format: 3 distinct options with brief explanations of why each works.`,
  },
  {
    id: "int-star",
    title: "STAR Story Generator",
    category: "Interview",
    tag: "interview",
    description: "Build structured behavioral interview answers using STAR method.",
    content: `Role: Act as an Interview Coach.
Context: I am preparing for a behavioral interview for a [Job Title] role.
Task: Using the STAR method (Situation, Task, Action, Result), help me draft a story that demonstrates my ability to solve complex problems under pressure. Use the following context: [Insert Brief Scenario].
Constraints: Ensure the 'Action' section highlights my specific contributions and the 'Result' is quantified with data or metrics.
Format: A structured 4-paragraph response.`,
  },
  {
    id: "int-case",
    title: "Case Interview Framework",
    category: "Interview",
    tag: "interview",
    description: "Structure your thinking for consulting-style case interviews.",
    content: `Role: Act as a Management Consultant.
Context: I am preparing for a case interview regarding [Topic, e.g., Market Entry].
Task: Provide a 5-step framework I can use to structure my thoughts during the interview. For each step, provide 2 probing questions I should ask the interviewer.
Format: A numbered list with 'Rationale' for each step.`,
  },
  {
    id: "int-technical",
    title: "Technical Interview Prep",
    category: "Interview",
    tag: "interview",
    description: "Prepare for technical assessments in your field.",
    content: `Role: You are a senior technical interviewer at a [industry] company.
Context: I am interviewing for a [role] position that requires [technical skills]. My background includes [relevant experience].
Task: Create a practice technical assessment with 5 questions that mirror what I would encounter in a real interview. Include questions of varying difficulty. For each question, provide the ideal answer approach and common mistakes.
Constraints: Questions should be relevant to entry-level/early-career candidates. Include time estimates for each question.
Format: Questions with difficulty ratings, ideal answer frameworks, and evaluation criteria.`,
  },
  {
    id: "int-questions",
    title: "Smart Questions to Ask",
    category: "Interview",
    tag: "interview",
    description: "Thoughtful questions that demonstrate research and genuine interest.",
    content: `Role: You are a career strategist who specializes in interview preparation.
Context: I am interviewing at [company] for [role]. I want to ask questions that show I have done my research and am genuinely evaluating the opportunity.
Task: Generate 10 strategic questions organized by category: role clarity, team dynamics, growth trajectory, and company direction. Each question should demonstrate specific knowledge about the company.
Constraints: No questions that can be answered from the company website. Each question should serve a dual purpose — gathering information while demonstrating competence.
Format: Categorized questions with notes on what each question signals to the interviewer.`,
  },
];

/* ── AI Prompts ── */
const AI_PROMPTS: ResourceCard[] = [
  {
    id: "ai-resume",
    title: "Resume Optimization",
    category: "AI Prompt",
    tag: "resume",
    description: "Optimize your resume for ATS systems and hiring managers.",
    content: `Role: You are an expert career coach specializing in resume optimization for international students seeking employment in the United States.
Context: I am a Suffolk University graduate with a [degree] in [field], targeting [specific role type] positions in [industry]. My resume needs to be optimized for ATS systems and hiring managers.
Task: Review my resume and provide specific, actionable improvements. Rewrite my bullet points using the STAR method with quantified achievements. Identify missing keywords from this job description: [paste job description].
Constraints: Keep the resume to one page. Use action verbs. Every bullet point must include a measurable outcome. Do not fabricate experience.
Format: Provide the optimized resume in a clean format, followed by a summary of changes made and why each change strengthens my candidacy.`,
  },
  {
    id: "ai-cover",
    title: "Cover Letter Generator",
    category: "AI Prompt",
    tag: "job search",
    description: "Create a tailored cover letter for a specific role.",
    content: `Role: You are a hiring manager at a top [industry] company who has reviewed thousands of cover letters.
Context: I am applying for [specific role] at [company]. My key qualifications are [2-3 strengths]. The job posting emphasizes [key requirements from posting].
Task: Write a compelling, personalized cover letter that connects my specific experiences to this role's requirements. Open with a hook that demonstrates genuine knowledge of the company.
Constraints: Maximum 350 words. No generic phrases like "I am writing to express my interest." Every paragraph must add new information. The tone should be confident but not arrogant.
Format: Provide the complete cover letter ready to send, followed by 3 alternative opening sentences I could swap in.`,
  },
  {
    id: "ai-interview",
    title: "Interview Preparation",
    category: "AI Prompt",
    tag: "interview",
    description: "Generate role-specific interview questions with STAR answers.",
    content: `Role: You are an interview coach who has prepared hundreds of candidates for [industry] interviews.
Context: I have an upcoming interview for [role] at [company]. The role requires [key skills from job posting]. My relevant experience includes [brief background].
Task: Generate 10 likely interview questions for this specific role and company, including 3 behavioral, 3 technical, 2 situational, and 2 company-specific questions. For each question, provide a structured answer framework using the STAR method.
Constraints: Answers should be specific to my background, not generic templates. Include follow-up questions the interviewer might ask. Flag any potential red flags in my background and how to address them.
Format: Present each question with a model answer outline, key points to emphasize, and common mistakes to avoid.`,
  },
  {
    id: "ai-company",
    title: "Company Research Brief",
    category: "AI Prompt",
    tag: "career strategy",
    description: "Build comprehensive intelligence on a target employer.",
    content: `Role: You are a competitive intelligence analyst specializing in employer research for job seekers.
Context: I am preparing for an application and potential interview at [company name] for a [role type] position.
Task: Create a company research brief covering: business model, recent news and strategic direction, company culture and values, key competitors, leadership team, and the specific department I would join. Identify 3 thoughtful questions I can ask during my interview.
Constraints: Focus on information from the last 12 months. Distinguish between facts and speculation. Include specific data points I can reference in conversation.
Format: Structured brief with sections for each topic, followed by interview questions with context for why each question demonstrates strong preparation.`,
  },
  {
    id: "ai-linkedin",
    title: "LinkedIn Profile Optimizer",
    category: "AI Prompt",
    tag: "linkedin",
    description: "Maximize your LinkedIn visibility for recruiter searches.",
    content: `Role: You are a LinkedIn optimization specialist who has helped hundreds of professionals increase their profile visibility and recruiter outreach.
Context: I am a recent Suffolk University graduate targeting [industry/role]. My current LinkedIn profile has [describe current state]. I want to attract recruiters searching for [target role] candidates.
Task: Rewrite my LinkedIn headline, About section, and Experience descriptions to maximize searchability and engagement. Include relevant keywords that recruiters in [industry] use when searching for candidates.
Constraints: The headline must be under 120 characters and include my target role. The About section should be 3-4 paragraphs maximum. Use first person. Include a clear call to action.
Format: Provide each section separately with the optimized text ready to copy and paste, followed by 5 keywords I should add to my Skills section.`,
  },
  {
    id: "ai-salary",
    title: "Salary Negotiation Script",
    category: "AI Prompt",
    tag: "job search",
    description: "Evaluate an offer and prepare a negotiation strategy.",
    content: `Role: You are a compensation negotiation expert with deep knowledge of [industry] salary ranges and benefits packages.
Context: I have received an offer for [role] at [company] with a base salary of [amount] in [location]. I am on OPT work authorization.
Task: Evaluate whether this offer is competitive based on market data. Provide a negotiation script I can use, including specific language for requesting a higher base salary, signing bonus, or other benefits.
Constraints: Be realistic about leverage for entry-level candidates. Do not suggest tactics that could jeopardize the offer. Account for the fact that I am on OPT.
Format: Market analysis summary, followed by a step-by-step negotiation script with alternative responses for different scenarios.`,
  },
  {
    id: "ai-networking",
    title: "Networking Outreach Messages",
    category: "AI Prompt",
    tag: "networking",
    description: "Craft personalized outreach for LinkedIn, email, and follow-ups.",
    content: `Role: You are a networking strategist who specializes in helping international students build professional relationships in the United States.
Context: I am a Suffolk University student/graduate targeting [industry]. I have identified [Name, Title, Company] as someone I want to connect with.
Task: Write 3 versions of an outreach message: one for LinkedIn connection request (300 characters), one for a cold email, and one for a follow-up if they do not respond within a week.
Constraints: No generic templates. Each message must reference something specific about the person's work. The ask should be small and easy to say yes to.
Format: Three separate messages labeled by type, each with a brief note explaining the strategy behind the approach.`,
  },
  {
    id: "ai-info-interview",
    title: "Informational Interview Prep",
    category: "AI Prompt",
    tag: "networking",
    description: "Prepare strategic questions for an informational interview.",
    content: `Role: You are a career development expert who coaches students on conducting effective informational interviews.
Context: I have an informational interview scheduled with [Name], who is a [Title] at [Company] in [industry]. My goal is to learn about [specific topic] and identify referral opportunities.
Task: Generate 12 thoughtful questions organized into three categories: career path, industry insight, and advice. Also prepare a 30-second introduction and a closing statement.
Constraints: No questions that could be easily answered by Google. Each question should demonstrate preliminary research. Include at least 2 questions that naturally create an opportunity for them to offer help.
Format: Introduction script, categorized questions with strategy notes, and closing statement.`,
  },
  {
    id: "ai-strategy",
    title: "Job Search Strategy Plan",
    category: "AI Prompt",
    tag: "career strategy",
    description: "Create a 4-week action plan tailored to your OPT timeline.",
    content: `Role: You are a strategic career advisor who specializes in job search planning for international students with OPT work authorization.
Context: I am a Suffolk University graduate with [degree] in [field]. My OPT start date is [date] and I have [X] days remaining before my 90-day unemployment limit. I am targeting [industry/role type] in [preferred locations].
Task: Create a 4-week job search action plan with specific daily and weekly targets. Include a mix of direct applications, networking activities, and skill-building tasks.
Constraints: Account for my OPT timeline constraints. Include both online and offline strategies. Set realistic daily targets that are sustainable.
Format: Week-by-week plan with daily action items, weekly goals, and success metrics.`,
  },
  {
    id: "ai-opt-convo",
    title: "OPT Employer Conversation",
    category: "AI Prompt",
    tag: "job search",
    description: "Prepare confident responses about your work authorization status.",
    content: `Role: You are an immigration-aware career coach who helps OPT holders navigate employer conversations about work authorization.
Context: I am on [Initial OPT/STEM OPT] with an EAD valid through [date]. I am interviewing with [company] for [role]. The employer has asked about my work authorization status.
Task: Prepare clear, confident responses for common employer questions about OPT, including: "Are you authorized to work in the US?", "Will you need sponsorship?", and "How does OPT work?"
Constraints: All information must be legally accurate. Do not suggest misleading the employer. Frame responses positively while being transparent.
Format: Q&A format with the employer's likely question followed by 2-3 response options ranging from brief to detailed.`,
  },
  {
    id: "ai-skills-gap",
    title: "Skills Gap Analysis",
    category: "AI Prompt",
    tag: "career strategy",
    description: "Identify and close skills gaps for your target role.",
    content: `Role: You are a career development analyst who specializes in identifying and closing skills gaps for career transitions.
Context: I have a [degree] from Suffolk University with coursework in [relevant courses]. My experience includes [brief summary]. I am targeting [specific role type] in [industry]. Here is a job description for my ideal role: [paste job description].
Task: Compare my current qualifications against the job requirements and identify specific gaps. For each gap, recommend the fastest path to close it.
Constraints: Only recommend free or low-cost resources. Focus on gaps that can be closed within 30-60 days. Distinguish between must-have and nice-to-have skills.
Format: Gap analysis table with columns for Required Skill, My Current Level, Gap Severity, and Recommended Action, followed by a 30-day learning plan.`,
  },
  {
    id: "ai-offer-eval",
    title: "Offer Evaluation Framework",
    category: "AI Prompt",
    tag: "job search",
    description: "Evaluate job offers holistically including visa implications.",
    content: `Role: You are a career decision advisor who helps early-career professionals evaluate job offers holistically.
Context: I have received [one/multiple] offer(s). Offer details: [Company, Role, Salary, Location, Benefits, Start Date]. My priorities are [list 3-5 priorities such as growth potential, location, compensation, visa sponsorship].
Task: Create a comprehensive evaluation framework for this offer. Score each dimension on a 1-10 scale. Identify questions I should ask the employer before accepting.
Constraints: Consider both short-term satisfaction and long-term career trajectory. Factor in OPT/visa implications. Be objective — do not default to recommending acceptance.
Format: Evaluation scorecard with weighted categories, followed by specific questions to ask, followed by a final recommendation with reasoning.`,
  },
];

/* ── Suffolk Resources ── */
const SUFFOLK_RESOURCES: ResourceCard[] = [
  {
    id: "suf-careers",
    title: "Suffolk Career Center",
    category: "Suffolk",
    tag: "career strategy",
    description: "Access career advising, job postings, workshops, and employer events.",
    content: "https://careers.suffolk.edu/",
  },
  {
    id: "suf-isso",
    title: "International Student Services Office",
    category: "Suffolk",
    tag: "career strategy",
    description: "OPT/CPT guidance, immigration advising, and compliance support.",
    content: "https://www.suffolk.edu/global/international-students/isso",
  },
  {
    id: "suf-labor",
    title: "Labor Market Insights",
    category: "Suffolk",
    tag: "job search",
    description: "Explore salary data, job trends, and industry outlooks for your target field.",
    content: "https://careers.suffolk.edu/labor-market-insights/",
  },
  {
    id: "suf-handshake",
    title: "Handshake",
    category: "Suffolk",
    tag: "job search",
    description: "Suffolk's platform for job listings, scheduling Career Development advisor appointments, and booking LinkedIn headshot sessions.",
    content: "https://suffolk.joinhandshake.com/",
  },
];

/* ── Key Links ── */
const KEY_LINKS = [
  { id: "kl-uscis", title: "USCIS", url: "https://www.uscis.gov/", description: "Official source for OPT, CPT, and work authorization rules." },
  { id: "kl-myvisajobs", title: "MyVisaJobs", url: "https://www.myvisajobs.com/", description: "Search employers who have historically sponsored H-1B visas." },
  { id: "kl-froghire", title: "FrogHire", url: "https://chromewebstore.google.com/detail/froghireai-ai-resume-job/jabnaledogdghdbckajlnbipcdicinom", description: "AI Chrome extension with sponsorship information about companies on different job search platforms." },
  { id: "kl-goingglobal", title: "GoinGlobal", url: "https://online.goinglobal.com/", description: "Suffolk has institutional access. Find H-1B and OPT-friendly employers, US city career guides, and international job market guides." },
];

/* ── Tag color map ── */
const TAG_COLORS: Record<string, string> = {
  networking: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  resume: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  interview: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  linkedin: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "job search": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "career strategy": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};

/* ── Shared action buttons ── */
const SelectAllButton = ({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) => {
  const handleSelectAll = () => {
    if (!targetRef.current) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(targetRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };
  return (
    <button onClick={handleSelectAll} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
      Select All
    </button>
  );
};

const CopyButton = ({ text, label = "Copy" }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
};

/* ── Expandable Resource Card ── */
const ExpandableCard = ({ card, isExpanded, onToggle }: { card: ResourceCard; isExpanded: boolean; onToggle: () => void }) => {
  const contentRef = useRef<HTMLParagraphElement>(null);

  const tagClass = card.tag ? TAG_COLORS[card.tag] || "bg-muted text-muted-foreground" : "";

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
          {card.tag && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${tagClass}`}>
              {card.tag}
            </span>
          )}
        </div>
        <div className="ml-2 text-muted-foreground shrink-0">
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 border-t border-border pt-3 space-y-3">
          <p ref={contentRef} className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{card.content}</p>
          <div className="flex items-center gap-3">
            <SelectAllButton targetRef={contentRef} />
            <CopyButton text={card.content} />
          </div>
        </div>
      )}
    </GlassCard>
  );
};

/* ── Prompt Builder ── */
const PromptBuilder = () => {
  const [fields, setFields] = useState({ role: "", context: "", task: "", constraints: "", format: "" });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  const updateField = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const generatePrompt = () => {
    const parts: string[] = [];
    if (fields.role) parts.push(`You are a ${fields.role}.`);
    if (fields.context) parts.push(`Based on the following context: ${fields.context},`);
    if (fields.task) parts.push(`complete the following task: ${fields.task}.`);
    if (fields.constraints) parts.push(`Follow these constraints: ${fields.constraints}.`);
    if (fields.format) parts.push(`Provide the response in the following format: ${fields.format}.`);
    setGeneratedPrompt(parts.join(" "));
  };

  const inputFields = [
    { key: "role" as const, label: "Assign the AI assistant a role", placeholder: "Career advisor, recruiter, resume reviewer, etc." },
    { key: "context" as const, label: "Provide context", placeholder: "Describe your situation, background, or goal" },
    { key: "task" as const, label: "Define the task", placeholder: "What do you want the AI to help you do?" },
    { key: "constraints" as const, label: "Add constraints or guidance", placeholder: "Focus on measurable results, use PAR format, etc." },
    { key: "format" as const, label: "Specify output format", placeholder: "Bullet points, table, paragraph, etc." },
  ];

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50 dark:border-purple-800/30 dark:bg-purple-950/10 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-bold text-foreground">Build Your Own AI Prompt</h3>
      </div>
      <div className="space-y-3">
        {inputFields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
            <Input
              placeholder={f.placeholder}
              value={fields[f.key]}
              onChange={(e) => updateField(f.key, e.target.value)}
              className="text-sm"
            />
          </div>
        ))}
      </div>
      <Button onClick={generatePrompt} className="bg-purple-600 hover:bg-purple-700 text-white">
        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
        Generate Prompt
      </Button>
      {generatedPrompt && (
        <div className="space-y-2">
          <div ref={outputRef} className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
            {generatedPrompt}
          </div>
          <div className="flex items-center gap-3">
            <SelectAllButton targetRef={outputRef} />
            <CopyButton text={generatedPrompt} />
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main Component ── */
const ResourceVault = () => {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCard = useCallback((id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  }, []);

  const matchesSearch = (card: ResourceCard) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      card.title?.toLowerCase().includes(query) ||
      card.category?.toLowerCase().includes(query) ||
      card.content?.toLowerCase().includes(query) ||
      card.description?.toLowerCase().includes(query) ||
      card.tag?.toLowerCase().includes(query)
    );
  };

  const filteredTemplates = TEMPLATES.filter(matchesSearch);
  const filteredPrompts = AI_PROMPTS.filter(matchesSearch);

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Step 5: Resources</h1>
      <p className="text-sm text-muted-foreground">
        This step provides templates and AI prompts that can help you create resumes, networking messages, and other job search materials. Expand each resource to copy and adapt it for your own strategy.
      </p>

      {/* Instruction Card */}
      <GlassCard className="border-l-4 border-l-purple-500">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-purple-500" />
          <h2 className="text-sm font-bold text-foreground">Build Your Career Resource Library</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This section contains templates and AI prompts that can help you create resumes, networking messages, and other career materials more efficiently.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          Expand any resource to copy and adapt it for your own job search.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          You can also add resources you discover over time so this page becomes your personal career toolkit.
        </p>
      </GlassCard>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources, prompts, or templates"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Two Tabs */}
      <Tabs defaultValue="templates">
        <TabsList className="w-full h-auto gap-1 p-1 bg-muted">
          <TabsTrigger
            value="templates"
            className="flex-1 text-sm font-medium data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="prompts"
            className="flex-1 text-sm font-medium data-[state=active]:bg-purple-700 data-[state=active]:text-white dark:data-[state=active]:bg-purple-800 dark:data-[state=active]:text-purple-100"
          >
            AI Prompts
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4 space-y-3">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((card) => (
              <ExpandableCard
                key={card.id}
                card={card}
                isExpanded={expandedCard === card.id}
                onToggle={() => toggleCard(card.id)}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No templates match your search.</p>
          )}
        </TabsContent>

        {/* AI Prompts Tab */}
        <TabsContent value="prompts" className="mt-4 space-y-4">
          {/* Prompt Builder */}
          <PromptBuilder />

          {/* Prompt Engineering Formula */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 dark:border-purple-800/30 dark:bg-purple-950/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-foreground">Prompt Engineering Formula</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {content.promptGuide}
            </p>
          </div>

          {/* AI Prompt Cards */}
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((card) => (
              <ExpandableCard
                key={card.id}
                card={card}
                isExpanded={expandedCard === card.id}
                onToggle={() => toggleCard(card.id)}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No prompts match your search.</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Suffolk Career Resources — outside tabs */}
      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Suffolk Career Resources</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUFFOLK_RESOURCES.map((res) => (
            <a key={res.id} href={res.content} target="_blank" rel="noopener noreferrer" className="block">
              <GlassCard className="p-4 hover:border-primary/50 transition-colors h-full">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {res.title}
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{res.description}</p>
              </GlassCard>
            </a>
          ))}
        </div>
      </div>

      {/* Key Links */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Key Links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {KEY_LINKS.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block">
              <GlassCard className="p-4 hover:border-primary/50 transition-colors h-full">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {link.title}
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
              </GlassCard>
            </a>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/my-plan")} className="flex-1">
          Back to Step 4: Strategy
        </Button>
        <Button onClick={() => navigate("/dashboard")} className="flex-1">
          Continue to Dashboard
        </Button>
      </div>
    </StepLayout>
  );
};

export default ResourceVault;
