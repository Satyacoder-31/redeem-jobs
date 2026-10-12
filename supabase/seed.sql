-- ==============================================================================
-- HIREKARO REALISTIC SEED DATA
-- Run after supabase/schema.sql in Supabase SQL Editor
-- ==============================================================================

-- 1. Skills Master
INSERT INTO public.skills (name, slug, category) VALUES
('React.js', 'react-js', 'Frontend'),
('Next.js', 'next-js', 'Frontend'),
('TypeScript', 'typescript', 'Programming'),
('Node.js', 'node-js', 'Backend'),
('Python', 'python', 'Programming'),
('Java', 'java', 'Programming'),
('Spring Boot', 'spring-boot', 'Backend'),
('PostgreSQL', 'postgresql', 'Database'),
('MongoDB', 'mongodb', 'Database'),
('AWS', 'aws', 'Cloud & DevOps'),
('Docker', 'docker', 'Cloud & DevOps'),
('Kubernetes', 'kubernetes', 'Cloud & DevOps'),
('GraphQL', 'graphql', 'Backend'),
('Tailwind CSS', 'tailwind-css', 'Frontend'),
('Figma', 'figma', 'Design'),
('UI/UX Design', 'ui-ux-design', 'Design'),
('Product Management', 'product-management', 'Product'),
('Agile / Scrum', 'agile-scrum', 'Management'),
('Data Analytics', 'data-analytics', 'Data'),
('Machine Learning', 'machine-learning', 'AI/ML'),
('Digital Marketing', 'digital-marketing', 'Marketing'),
('SEO / SEM', 'seo-sem', 'Marketing'),
('Financial Modeling', 'financial-modeling', 'Finance'),
('B2B Sales', 'b2b-sales', 'Sales')
ON CONFLICT (name) DO NOTHING;

-- 2. Hero Slides CMS
INSERT INTO public.hero_slides (title, subtitle, desc_text, image_url, cta_text, cta_url, display_order, is_active) VALUES
('Find Your Dream Job', 'Your Next Opportunity Starts Here.', 'Discover thousands of jobs, connect with leading employers and build the career you''ve always wanted.', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=900&fit=crop', 'Search Jobs', '/jobs', 1, TRUE),
('Connect With India''s Best Employers', 'Trusted by 100K+ Companies', 'From startups to Fortune 500 — leading employers are hiring on HireKaro every day.', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&h=900&fit=crop', 'Explore Companies', '/companies', 2, TRUE),
('Build a Career That Grows With You', 'Career Intelligence, Powered by AI', 'Get resume scores, salary insights, skill gaps and personalized job matches.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop', 'Build Resume', '/candidate/dashboard', 3, TRUE),
('Get Discovered by Recruiters', 'Let Opportunities Find You', 'Create a standout profile and let 50K+ recruiters discover you.', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1600&h=900&fit=crop', 'Create Profile', '/login?mode=register', 4, TRUE),
('Build Your Team With HireKaro', 'Hire Better. Hire Faster.', 'Post jobs, search resumes, and manage your hiring pipeline in one premium ATS.', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&h=900&fit=crop', 'Post a Job', '/employers', 5, TRUE)
ON CONFLICT DO NOTHING;

-- 3. Verified Companies
INSERT INTO public.companies (id, name, slug, logo_url, cover_image_url, description, industry, company_size, founded_year, website, email, city, state, is_verified, verification_status, rating, review_count, follower_count) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tata Consultancy Services', 'tcs', 'TCS', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200', 'Global leader in IT services, consulting, and business solutions across 50+ countries.', 'IT Services', '600K+ employees', 1968, 'https://www.tcs.com', 'careers@tcs.com', 'Mumbai', 'Maharashtra', TRUE, 'verified', 4.2, 4120, 2100000),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Infosys', 'infosys', 'INFY', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', 'Next-generation digital services and consulting navigating client digital transformation.', 'Technology', '340K+ employees', 1981, 'https://www.infosys.com', 'careers@infosys.com', 'Bangalore', 'Karnataka', TRUE, 'verified', 4.1, 3210, 1400000),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Reliance Industries', 'reliance', 'RIL', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200', 'India''s largest private sector company spanning energy, telecom (Jio), retail, and tech.', 'Conglomerate', '380K+ employees', 1973, 'https://www.ril.com', 'hr@ril.com', 'Mumbai', 'Maharashtra', TRUE, 'verified', 4.3, 5400, 3100000),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Wipro Technologies', 'wipro', 'WIP', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200', 'Global information technology, consulting and business process services company.', 'IT Services', '250K+ employees', 1945, 'https://www.wipro.com', 'careers@wipro.com', 'Bangalore', 'Karnataka', TRUE, 'verified', 3.9, 2100, 920000),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Flipkart', 'flipkart', 'FK', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200', 'India''s homegrown e-commerce marketplace empowering millions of consumers and sellers.', 'E-commerce', '50K+ employees', 2007, 'https://www.flipkart.com', 'careers@flipkart.com', 'Bangalore', 'Karnataka', TRUE, 'verified', 4.4, 1890, 850000),
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Zomato', 'zomato', 'ZOM', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200', 'Leading food tech and quick commerce ecosystem transforming urban dining and delivery.', 'Food Tech', '10K+ employees', 2008, 'https://www.zomato.com', 'careers@zomato.com', 'Gurgaon', 'Haryana', TRUE, 'verified', 4.0, 980, 640000),
('06eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Razorpay', 'razorpay', 'RZP', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200', 'Full-stack financial services and digital payment powerhouse powering modern businesses.', 'Fintech', '3K+ employees', 2014, 'https://www.razorpay.com', 'careers@razorpay.com', 'Bangalore', 'Karnataka', TRUE, 'verified', 4.5, 750, 480000),
('17eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Swiggy', 'swiggy', 'SWG', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200', 'On-demand convenience platform offering food delivery, Instamart grocery, and dining.', 'Food Tech', '8K+ employees', 2014, 'https://www.swiggy.com', 'careers@swiggy.com', 'Bangalore', 'Karnataka', TRUE, 'verified', 4.2, 1120, 720000)
ON CONFLICT (slug) DO UPDATE
SET rating = EXCLUDED.rating,
    is_verified = EXCLUDED.is_verified;

-- 4. Active Jobs
INSERT INTO public.jobs (
  id, company_id, title, slug, description, responsibilities, requirements, benefits, skills,
  department, industry, job_type, work_mode, experience_min, experience_max, experience_text,
  salary_min, salary_max, salary_text, location, city, state, status, is_featured, is_urgent, views_count, applications_count
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'Senior Full Stack Developer (React & Node)',
  'senior-full-stack-developer-react-node-infosys',
  'Join Infosys digital engineering unit building high-throughput cloud platforms for international banking clients.',
  ARRAY['Architect resilient web architectures with React 19 and Node.js microservices', 'Lead technical code reviews and mentor junior engineers', 'Collaborate with cross-functional product and UX teams to define sprint deliverables'],
  ARRAY['4+ years production experience with React, TypeScript, and Node.js', 'Proven expertise with PostgreSQL and distributed caching (Redis)', 'Solid understanding of CI/CD, Docker, and AWS infrastructure'],
  ARRAY['Comprehensive Health Insurance for family', 'Annual Performance Bonus up to 20%', 'Flexible Remote Work and Home Office Allowance'],
  ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
  'Engineering', 'Technology', 'Full Time', 'Hybrid', 4, 8, '4–8 yrs',
  1800000, 2800000, '₹18–28 LPA', 'Bangalore, India', 'Bangalore', 'Karnataka', 'published', TRUE, TRUE, 420, 38
),
(
  '22222222-2222-2222-2222-222222222222',
  '06eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
  'Staff Product Manager — Payments Core',
  'staff-product-manager-payments-razorpay',
  'Own the core checkout and reconciliation engine processing millions of transactions every single day.',
  ARRAY['Drive product vision, strategy, and roadmap for razor-sharp payments reliability', 'Define granular PRDs and partner closely with engineering leadership', 'Analyze payment success rates, latency, and bank downtime metrics'],
  ARRAY['5+ years in high-scale B2B SaaS or fintech product management', 'Strong technical depth with REST APIs, webhook architectures, and data queries', 'Exceptional communication and stakeholder alignment skills'],
  ARRAY['Competitive ESOPs Grant', 'Generous Wellness & Learning Stipend', 'Health Insurance with 0 copay'],
  ARRAY['Product Management', 'Fintech', 'Data Analytics', 'API Design', 'Agile'],
  'Product', 'Fintech', 'Full Time', 'Hybrid', 5, 10, '5–10 yrs',
  3500000, 5000000, '₹35–50 LPA', 'Bangalore, India', 'Bangalore', 'Karnataka', 'published', TRUE, FALSE, 650, 42
),
(
  '33333333-3333-3333-3333-333333333333',
  'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'Lead UI/UX Designer — Consumer App',
  'lead-ui-ux-designer-consumer-app-flipkart',
  'Reimagine the next generation shopping experience for 200 million+ active Indian mobile consumers.',
  ARRAY['Design intuitive, delightfully fast user journeys across mobile and web', 'Lead design system components in Figma and conduct usability testing', 'Collaborate with PMs and front-end devs to ensure pixel perfection'],
  ARRAY['5+ years designing mobile consumer applications at scale', 'Mastery of Figma, design systems, wireframing, and interactive prototyping', 'Deep empathy for tier-2/3 Indian language and visual patterns'],
  ARRAY['Quarterly performance bonuses', 'Medical coverage including parents', 'Child care support and wellness leave'],
  ARRAY['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Mobile Prototyping'],
  'Design', 'E-commerce', 'Full Time', 'On-site', 5, 9, '5–9 yrs',
  2400000, 3600000, '₹24–36 LPA', 'Bangalore, India', 'Bangalore', 'Karnataka', 'published', FALSE, TRUE, 380, 27
),
(
  '44444444-4444-4444-4444-444444444444',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'DevOps & Cloud Infrastructure Engineer',
  'devops-cloud-infrastructure-engineer-tcs',
  'Scale high-availability cloud foundations on AWS and Kubernetes for enterprise clients globally.',
  ARRAY['Manage multi-cluster Kubernetes deployments with Terraform and Helm', 'Optimize CI/CD pipelines to achieve zero-downtime blue/green releases', 'Maintain monitoring, alerting, and log aggregation with Prometheus & Grafana'],
  ARRAY['3+ years in DevOps / SRE role managing production Linux environments', 'Hands-on experience with AWS, Kubernetes, Terraform, and Docker', 'Strong scripting skills in Bash or Python'],
  ARRAY['Relocation assistance', 'Certification reimbursement (AWS/CKA)', 'Retirement benefits and gratuity'],
  ARRAY['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux'],
  'Infrastructure', 'IT Services', 'Full Time', 'Remote', 3, 6, '3–6 yrs',
  1400000, 2200000, '₹14–22 LPA', 'Mumbai, India', 'Mumbai', 'Maharashtra', 'published', FALSE, FALSE, 290, 19
),
(
  '55555555-5555-5555-5555-555555555555',
  'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'Associate Software Engineer — Backend',
  'associate-software-engineer-backend-zomato',
  'Build ultra-low-latency order processing and live GPS tracking microservices.',
  ARRAY['Write clean, efficient Golang and Python services serving 50K+ requests/sec', 'Implement Redis caching and Kafka event streams', 'Participate in on-call triage and automated testing'],
  ARRAY['0–2 years software engineering experience or stellar internship record', 'Solid understanding of Data Structures, Algorithms, and DBMS fundamentals', 'Eagerness to learn in a fast-paced hyper-growth environment'],
  ARRAY['Daily catered gourmet meals at office', 'Unlimited PTO and fitness reimbursement', 'Comprehensive health coverage'],
  ARRAY['Python', 'Go', 'PostgreSQL', 'Redis', 'Kafka', 'Data Structures'],
  'Engineering', 'Food Tech', 'Full Time', 'On-site', 0, 2, 'Fresher / 0–2 yrs',
  1200000, 1800000, '₹12–18 LPA', 'Gurgaon, India', 'Gurgaon', 'Haryana', 'published', TRUE, FALSE, 890, 142
),
(
  '66666666-6666-6666-6666-666666666666',
  '17eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
  'Growth Marketing & Performance Lead',
  'growth-marketing-performance-lead-swiggy',
  'Scale user acquisition and re-engagement campaigns across digital channels and quick-commerce categories.',
  ARRAY['Manage multi-crore digital ad spend across Google, Meta, and programmatic DSPs', 'Optimize CAC, LTV, conversion funnels, and retention cohort performance', 'Run A/B creative experiments and landing page conversion rate tests'],
  ARRAY['3+ years in performance marketing / growth hacking at a fast-growing consumer brand', 'Deep analytics expertise (Google Analytics 4, Mixpanel, SQL)', 'Data-driven mindset with strong creative storytelling instincts'],
  ARRAY['Swiggy One Black membership with team benefits', 'Generous performance incentives', 'Comprehensive medical cover'],
  ARRAY['Digital Marketing', 'Performance Marketing', 'SEO / SEM', 'Data Analytics', 'Growth'],
  'Marketing', 'Food Tech', 'Full Time', 'Hybrid', 3, 7, '3–7 yrs',
  1600000, 2600000, '₹16–26 LPA', 'Bangalore, India', 'Bangalore', 'Karnataka', 'published', FALSE, FALSE, 310, 24
)
ON CONFLICT (slug) DO UPDATE
SET salary_text = EXCLUDED.salary_text,
    status = 'published';

-- 5. Screening Questions Sample
INSERT INTO public.job_screening_questions (job_id, question, question_type, options, is_required, sort_order)
VALUES
('11111111-1111-1111-1111-111111111111', 'How many years of commercial experience do you have with React & TypeScript?', 'experience', '["1-2 years", "3-5 years", "5+ years"]'::jsonb, TRUE, 1),
('11111111-1111-1111-1111-111111111111', 'What is your current official notice period?', 'notice_period', '["Immediate / Serving", "15 Days", "30 Days", "60+ Days"]'::jsonb, TRUE, 2),
('22222222-2222-2222-2222-222222222222', 'Have you previously managed payment gateway integrations or core financial pipelines?', 'yes_no', '["Yes", "No"]'::jsonb, TRUE, 1)
ON CONFLICT DO NOTHING;
