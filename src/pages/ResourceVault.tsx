import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Copy, Check, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import GlassCard from "@/components/GlassCard";
import StepLayout from "@/components/StepLayout";

interface Template {
  title: string;
  subject: string;
  body: string;
}

const TEMPLATES: Template[] = [
  {
    title: "Informational Interview Request",
    subject: "Quick Question About Your Career in [Industry]",
    body: `Dear [Name],

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
    title: "Recruiter Outreach",
    subject: "Interest in [Role/Team] Opportunities at [Company]",
    body: `Dear [Recruiter Name],

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
    title: "Networking Follow-Up",
    subject: "Great Connecting at [Event/Meeting] — Following Up",
    body: `Dear [Name],

It was a pleasure meeting you at [event/context] on [date]. I really enjoyed our conversation about [specific topic discussed] and found your insights on [specific detail] particularly valuable.

As I mentioned, I am currently pursuing opportunities in [target industry/role] and would love to stay connected. If you have any suggestions for people I should speak with or resources I should explore, I would be very grateful.

I have also been thinking about [something relevant they mentioned] and would love to continue that conversation if you are open to it.

Thank you again for your time and generosity. I hope to stay in touch.

Warm regards,
[Your Name]
[LinkedIn Profile URL]`,
  },
];

const AI_PROMPTS = [
  {
    label: "Resume Optimization",
    prompt: `Role: You are an expert career coach specializing in resume optimization for international students seeking employment in the United States.
Context: I am a Suffolk University graduate with a [degree] in [field], targeting [specific role type] positions in [industry]. My resume needs to be optimized for ATS systems and hiring managers.
Task: Review my resume and provide specific, actionable improvements. Rewrite my bullet points using the STAR method with quantified achievements. Identify missing keywords from this job description: [paste job description].
Constraints: Keep the resume to one page. Use action verbs. Every bullet point must include a measurable outcome. Do not fabricate experience.
Format: Provide the optimized resume in a clean format, followed by a summary of changes made and why each change strengthens my candidacy.`,
  },
  {
    label: "Cover Letter",
    prompt: `Role: You are a hiring manager at a top [industry] company who has reviewed thousands of cover letters.
Context: I am applying for [specific role] at [company]. My key qualifications are [2-3 strengths]. The job posting emphasizes [key requirements from posting].
Task: Write a compelling, personalized cover letter that connects my specific experiences to this role's requirements. Open with a hook that demonstrates genuine knowledge of the company.
Constraints: Maximum 350 words. No generic phrases like "I am writing to express my interest." Every paragraph must add new information. The tone should be confident but not arrogant.
Format: Provide the complete cover letter ready to send, followed by 3 alternative opening sentences I could swap in.`,
  },
  {
    label: "Interview Preparation",
    prompt: `Role: You are an interview coach who has prepared hundreds of candidates for [industry] interviews.
Context: I have an upcoming interview for [role] at [company]. The role requires [key skills from job posting]. My relevant experience includes [brief background].
Task: Generate 10 likely interview questions for this specific role and company, including 3 behavioral, 3 technical, 2 situational, and 2 company-specific questions. For each question, provide a structured answer framework using the STAR method.
Constraints: Answers should be specific to my background, not generic templates. Include follow-up questions the interviewer might ask. Flag any potential red flags in my background and how to address them.
Format: Present each question with a model answer outline, key points to emphasize, and common mistakes to avoid.`,
  },
  {
    label: "Company Research",
    prompt: `Role: You are a competitive intelligence analyst specializing in employer research for job seekers.
Context: I am preparing for an application and potential interview at [company name] for a [role type] position. I need comprehensive intelligence to demonstrate deep knowledge during my interview.
Task: Create a company research brief covering: business model, recent news and strategic direction, company culture and values, key competitors, leadership team, and the specific department I would join. Identify 3 thoughtful questions I can ask during my interview.
Constraints: Focus on information from the last 12 months. Distinguish between facts and speculation. Include specific data points I can reference in conversation.
Format: Structured brief with sections for each topic, followed by interview questions with context for why each question demonstrates strong preparation.`,
  },
  {
    label: "LinkedIn Profile",
    prompt: `Role: You are a LinkedIn optimization specialist who has helped hundreds of professionals increase their profile visibility and recruiter outreach.
Context: I am a recent Suffolk University graduate targeting [industry/role]. My current LinkedIn profile has [describe current state]. I want to attract recruiters searching for [target role] candidates.
Task: Rewrite my LinkedIn headline, About section, and Experience descriptions to maximize searchability and engagement. Include relevant keywords that recruiters in [industry] use when searching for candidates.
Constraints: The headline must be under 120 characters and include my target role. The About section should be 3-4 paragraphs maximum. Use first person. Include a clear call to action.
Format: Provide each section separately with the optimized text ready to copy and paste, followed by 5 keywords I should add to my Skills section.`,
  },
  {
    label: "Salary Negotiation",
    prompt: `Role: You are a compensation negotiation expert with deep knowledge of [industry] salary ranges and benefits packages for entry-level and early-career professionals.
Context: I have received an offer for [role] at [company] with a base salary of [amount] in [location]. The role level is [entry-level/mid-level]. I am on OPT work authorization.
Task: Evaluate whether this offer is competitive based on market data. Provide a negotiation script I can use, including specific language for requesting a higher base salary, signing bonus, or other benefits. Address how to handle the conversation professionally.
Constraints: Be realistic about leverage for entry-level candidates. Do not suggest tactics that could jeopardize the offer. Account for the fact that I am on OPT and may have limited negotiating position on certain terms.
Format: Market analysis summary, followed by a step-by-step negotiation script with alternative responses for different scenarios the employer might present.`,
  },
  {
    label: "Networking Outreach",
    prompt: `Role: You are a networking strategist who specializes in helping international students build professional relationships in the United States.
Context: I am a Suffolk University student/graduate targeting [industry]. I have identified [Name, Title, Company] as someone I want to connect with. I found them through [LinkedIn/alumni network/event].
Task: Write 3 versions of an outreach message: one for LinkedIn connection request (300 characters), one for a cold email, and one for a follow-up if they do not respond within a week. Each message should establish credibility, show genuine interest, and include a specific ask.
Constraints: No generic templates. Each message must reference something specific about the person's work or background. The ask should be small and easy to say yes to. Keep messages concise and professional.
Format: Three separate messages labeled by type, each with a brief note explaining the strategy behind the approach.`,
  },
  {
    label: "Informational Interview Prep",
    prompt: `Role: You are a career development expert who coaches students on conducting effective informational interviews.
Context: I have an informational interview scheduled with [Name], who is a [Title] at [Company] in [industry]. My goal is to learn about [specific topic] and potentially identify referral opportunities.
Task: Generate 12 thoughtful questions organized into three categories: career path questions, industry insight questions, and advice questions. Also prepare a 30-second introduction I can use to open the conversation and a closing statement that leaves the door open for future contact.
Constraints: No questions that could be easily answered by Google. Each question should demonstrate that I have done preliminary research. Include at least 2 questions that naturally create an opportunity for them to offer help or referrals.
Format: Introduction script, followed by categorized questions with brief notes on why each question is strategically valuable, followed by closing statement.`,
  },
  {
    label: "Job Search Strategy",
    prompt: `Role: You are a strategic career advisor who specializes in job search planning for international students with OPT work authorization.
Context: I am a Suffolk University graduate with [degree] in [field]. My OPT start date is [date] and I have [X] days remaining before my 90-day unemployment limit. I am targeting [industry/role type] in [preferred locations].
Task: Create a 4-week job search action plan with specific daily and weekly targets. Include a mix of direct applications, networking activities, and skill-building tasks. Prioritize activities by likely return on investment.
Constraints: Account for my OPT timeline constraints. Include both online and offline strategies. Set realistic daily targets that are sustainable. Include contingency planning if my primary target industry is not responding.
Format: Week-by-week plan with daily action items, weekly goals, and success metrics. Include a decision framework for when to broaden my search.`,
  },
  {
    label: "OPT Employer Conversation",
    prompt: `Role: You are an immigration-aware career coach who helps OPT holders navigate employer conversations about work authorization.
Context: I am on [Initial OPT/STEM OPT] with an EAD valid through [date]. I am interviewing with [company] for [role]. The employer has asked about my work authorization status.
Task: Prepare clear, confident responses for common employer questions about OPT, including: "Are you authorized to work in the US?", "Will you need sponsorship?", and "How does OPT work?" Provide language that is honest, professional, and positions my authorization as straightforward.
Constraints: All information must be legally accurate. Do not suggest misleading the employer. Frame responses positively while being transparent. Include the distinction between OPT authorization and future sponsorship needs if applicable.
Format: Q&A format with the employer's likely question followed by 2-3 response options ranging from brief to detailed, with notes on when to use each version.`,
  },
  {
    label: "Skills Gap Analysis",
    prompt: `Role: You are a career development analyst who specializes in identifying and closing skills gaps for career transitions.
Context: I have a [degree] from Suffolk University with coursework in [relevant courses]. My experience includes [brief experience summary]. I am targeting [specific role type] in [industry]. Here is a job description for my ideal role: [paste job description].
Task: Compare my current qualifications against the job requirements and identify specific gaps. For each gap, recommend the fastest path to close it — whether through online courses, certifications, projects, or volunteer work. Prioritize gaps by impact on hiring decisions.
Constraints: Only recommend free or low-cost resources. Focus on gaps that can be closed within 30-60 days. Distinguish between must-have skills and nice-to-have skills. Be honest about gaps that cannot be quickly closed.
Format: Gap analysis table with columns for Required Skill, My Current Level, Gap Severity, and Recommended Action, followed by a prioritized 30-day learning plan.`,
  },
  {
    label: "Offer Evaluation",
    prompt: `Role: You are a career decision advisor who helps early-career professionals evaluate job offers holistically.
Context: I have received [one/multiple] offer(s) and need to make a decision. Offer details: [Company, Role, Salary, Location, Benefits, Start Date]. My priorities are [list 3-5 priorities such as growth potential, location, compensation, visa sponsorship, industry alignment].
Task: Create a comprehensive evaluation framework for this offer. Score each dimension on a 1-10 scale based on the information provided. Identify questions I should ask the employer before accepting. If I have multiple offers, provide a side-by-side comparison.
Constraints: Consider both short-term satisfaction and long-term career trajectory. Factor in OPT/visa implications for each option. Be objective — do not default to recommending acceptance. Include financial considerations beyond base salary.
Format: Evaluation scorecard with weighted categories, followed by specific questions to ask before deciding, followed by a final recommendation with reasoning.`,
  },
];

const SUFFOLK_RESOURCES = [
  {
    label: "Suffolk University Career Center",
    url: "https://careers.suffolk.edu/",
    description: "Access career advising, job postings, workshops, and employer events.",
  },
  {
    label: "International Students & Scholars Office (ISSO)",
    url: "https://www.suffolk.edu/student-life/international-students-scholars",
    description: "OPT/CPT guidance, immigration advising, and compliance support.",
  },
  {
    label: "Labor Market Insights",
    url: "https://careers.suffolk.edu/labor-market-insights/",
    description: "Explore salary data, job trends, and industry outlooks for your target field.",
  },
];

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const ResourceVault = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    templates: true,
    prompts: false,
    suffolk: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <StepLayout>
      <h1 className="text-xl font-bold text-foreground">Resource Vault</h1>
      <p className="text-sm text-muted-foreground">Templates, AI prompts, and resources to power your job search.</p>

      {/* Outreach Templates */}
      <Collapsible open={openSections.templates} onOpenChange={() => toggleSection("templates")}>
        <GlassCard className="p-0">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-5 text-left">
            <span className="text-sm font-semibold text-foreground">Outreach Templates</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.templates ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-4">
              {TEMPLATES.map((t) => (
                <div key={t.title} className="rounded-lg border bg-card p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">{t.title}</h3>
                  <p className="text-[10px] text-muted-foreground italic">Subject: {t.subject}</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{t.body}</p>
                  <CopyButton text={`Subject: ${t.subject}\n\n${t.body}`} />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </GlassCard>
      </Collapsible>

      {/* AI Prompts */}
      <Collapsible open={openSections.prompts} onOpenChange={() => toggleSection("prompts")}>
        <GlassCard className="p-0">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-5 text-left">
            <span className="text-sm font-semibold text-foreground">AI Prompts</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.prompts ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-3">
              <p className="text-xs text-muted-foreground">Each prompt follows the Role + Context + Task + Constraints + Format structure. Copy and customize with your details.</p>
              {AI_PROMPTS.map((p) => (
                <div key={p.label} className="rounded-lg border bg-card p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">{p.label}</h3>
                  <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{p.prompt}</p>
                  <CopyButton text={p.prompt} />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </GlassCard>
      </Collapsible>

      {/* Suffolk Resources */}
      <Collapsible open={openSections.suffolk} onOpenChange={() => toggleSection("suffolk")}>
        <GlassCard className="p-0">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-5 text-left">
            <span className="text-sm font-semibold text-foreground">Suffolk Resources</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.suffolk ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-3">
              {SUFFOLK_RESOURCES.map((r) => (
                <a
                  key={r.label}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1">
                      {r.label} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1">{r.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </CollapsibleContent>
        </GlassCard>
      </Collapsible>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/my-plan")} className="flex-1">
          Back to My Plan
        </Button>
        <Button onClick={() => navigate("/dashboard")} className="flex-1">
          Continue to Dashboard
        </Button>
      </div>
    </StepLayout>
  );
};

export default ResourceVault;
