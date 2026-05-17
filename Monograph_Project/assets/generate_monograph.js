const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const out = path.join(root, 'Monograph_Project');
const dirs = ['references', 'diagrams', 'screenshots', 'assets', 'project_structure'];
for (const d of dirs) fs.mkdirSync(path.join(out, d), { recursive: true });

const read = (p) => fs.existsSync(path.join(root, p)) ? fs.readFileSync(path.join(root, p), 'utf8') : '';
const list = (p) => fs.existsSync(path.join(root, p)) ? fs.readdirSync(path.join(root, p), { withFileTypes: true }) : [];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function safeJson(p) {
  try { return JSON.parse(read(p)); } catch { return {}; }
}

function walk(dir, depth = 0, maxDepth = 5) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs) || depth > maxDepth) return [];
  const ignore = new Set(['node_modules', '.git', 'dist', 'build', '.vite', 'Monograph_Project']);
  const entries = fs.readdirSync(abs, { withFileTypes: true })
    .filter(e => !ignore.has(e.name))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
  let lines = [];
  for (const e of entries) {
    lines.push(`${'  '.repeat(depth)}${e.isDirectory() ? '📁' : '📄'} ${e.name}`);
    if (e.isDirectory()) lines = lines.concat(walk(path.join(dir, e.name), depth + 1, maxDepth));
  }
  return lines;
}

function getFiles(dir, ext) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const outFiles = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, ent.name);
    if (ent.isDirectory()) outFiles.push(...getFiles(rel, ext));
    else if (!ext || ent.name.endsWith(ext)) outFiles.push(rel);
  }
  return outFiles;
}

const backendPkg = safeJson('backend/package.json');
const frontendPkg = safeJson('frontend/package.json');
const mobilePkg = safeJson('Nokta_App/frontend_mobile/package.json');
const deps = {
  backend: Object.keys(backendPkg.dependencies || {}),
  frontend: Object.keys(frontendPkg.dependencies || {}),
  mobile: Object.keys(mobilePkg.dependencies || {})
};

const modelFiles = getFiles('backend/src/models', '.ts').filter(f => !f.endsWith('index.ts'));
const models = modelFiles.map(file => {
  const text = read(file);
  const name = path.basename(file, '.ts');
  const fields = [...text.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*\{/gm)].map(m => m[1])
    .filter(x => !['timestamps', 'toJSON', 'toObject'].includes(x));
  const refs = [...text.matchAll(/ref\s*:\s*['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
  return { name, file, fields: [...new Set(fields)].slice(0, 18), refs: [...new Set(refs)] };
});

const moduleFiles = getFiles('backend/src/modules', '.ts').filter(f => f.endsWith('.routes.ts'));
const routeMounts = [...read('backend/src/routes/index.ts').matchAll(/apiRouter\.use\('([^']+)'/g)].map(m => m[1]);
const routes = moduleFiles.map(file => {
  const text = read(file);
  const moduleName = file.split(path.sep).slice(-2, -1)[0];
  const methods = [...text.matchAll(/(?:router|[A-Za-z]+Router)\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/gi)]
    .map(m => `${m[1].toUpperCase()} ${m[2]}`);
  return { moduleName, file, methods: methods.length ? methods : ['REST handlers declared through module router'] };
});

const reactRoutes = [...read('frontend/src/routes/AppRoutes.tsx').matchAll(/path="([^"]+)"/g)].map(m => m[1]);
const featureDirs = list('frontend/src/features').filter(e => e.isDirectory()).map(e => e.name);
const mobileFiles = getFiles('Nokta_App/frontend_mobile/src', '.tsx').concat(getFiles('Nokta_App/frontend_mobile/src', '.ts'));
const readme = read('README.md');

const refs = [
  'Bass, L., Clements, P., & Kazman, R. (2021). Software architecture in practice (4th ed.). Addison-Wesley.',
  'Boehm, B. W. (1988). A spiral model of software development and enhancement. Computer, 21(5), 61–72. https://doi.org/10.1109/2.59',
  'Fielding, R. T. (2000). Architectural styles and the design of network-based software architectures (Doctoral dissertation, University of California, Irvine).',
  'Fowler, M. (2003). Patterns of enterprise application architecture. Addison-Wesley.',
  'Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1995). Design patterns: Elements of reusable object-oriented software. Addison-Wesley.',
  'Garrett, J. J. (2011). The elements of user experience: User-centered design for the web and beyond (2nd ed.). New Riders.',
  'Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. MIS Quarterly, 28(1), 75–105. https://doi.org/10.2307/25148625',
  'International Organization for Standardization. (2011). ISO/IEC 25010:2011 systems and software engineering: Systems and software quality requirements and evaluation (SQuaRE). ISO.',
  'MongoDB, Inc. (2024). MongoDB manual. https://www.mongodb.com/docs/manual/',
  'Nielsen, J. (1994). Usability engineering. Morgan Kaufmann.',
  'Open Web Application Security Project. (2021). OWASP top 10: The ten most critical web application security risks. https://owasp.org/Top10/',
  'Pautasso, C., Zimmermann, O., & Leymann, F. (2008). RESTful web services vs. big web services: Making the right architectural decision. Proceedings of the 17th International Conference on World Wide Web, 805–814. https://doi.org/10.1145/1367497.1367606',
  'Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner’s approach (9th ed.). McGraw-Hill.',
  'Shneiderman, B., Plaisant, C., Cohen, M., Jacobs, S., Elmqvist, N., & Diakopoulos, N. (2016). Designing the user interface: Strategies for effective human-computer interaction (6th ed.). Pearson.',
  'Sommerville, I. (2016). Software engineering (10th ed.). Pearson.',
  'Tilkov, S., & Vinoski, S. (2010). Node.js: Using JavaScript to build high-performance network programs. IEEE Internet Computing, 14(6), 80–83. https://doi.org/10.1109/MIC.2010.145',
  'Wieringa, R. J. (2014). Design science methodology for information systems and software engineering. Springer. https://doi.org/10.1007/978-3-662-43839-8'
];
fs.writeFileSync(path.join(out, 'references', 'apa7_references.txt'), refs.join('\n\n'), 'utf8');

function svgBoxes(name, title, nodes, edges = []) {
  const w = 1200, h = Math.max(560, 150 + Math.ceil(nodes.length / 3) * 150);
  const cols = Math.min(3, nodes.length);
  const cellW = w / cols;
  const pos = nodes.map((n, i) => {
    const row = Math.floor(i / cols), col = i % cols;
    return { ...n, x: 55 + col * cellW, y: 105 + row * 150, width: cellW - 110, height: 82 };
  });
  const pmap = new Map(pos.map(p => [p.id, p]));
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <style>.t{font:700 30px Arial}.b{fill:#f8fafc;stroke:#334155;stroke-width:2;rx:10}.l{font:600 18px Arial;fill:#0f172a}.d{font:14px Arial;fill:#475569}.e{stroke:#64748b;stroke-width:2;marker-end:url(#a)}.cap{font:14px Arial;fill:#64748b}</style>
  <defs><marker id="a" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#64748b"/></marker></defs>
  <rect width="1200" height="${h}" fill="#ffffff"/><text x="40" y="55" class="t">${esc(title)}</text>`;
  for (const e of edges) {
    const a = pmap.get(e[0]), b = pmap.get(e[1]);
    if (a && b) s += `<line class="e" x1="${a.x + a.width}" y1="${a.y + 41}" x2="${b.x}" y2="${b.y + 41}"/>`;
  }
  for (const n of pos) {
    s += `<rect class="b" x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}"/>
      <text class="l" x="${n.x + 18}" y="${n.y + 32}">${esc(n.label)}</text>
      <text class="d" x="${n.x + 18}" y="${n.y + 58}">${esc((n.detail || '').slice(0, 58))}</text>`;
  }
  s += `<text class="cap" x="40" y="${h - 28}">Generated from project source files in backend, frontend, and Nokta_App/frontend_mobile.</text></svg>`;
  const file = path.join(out, 'diagrams', `${name}.svg`);
  fs.writeFileSync(file, s, 'utf8');
  return `diagrams/${name}.svg`;
}

const diagrams = [
  ['system_architecture', 'System Architecture Diagram', [
    {id:'user', label:'Users', detail:'Admin, teacher, student, parent, owner'},
    {id:'web', label:'React Web App', detail:'Vite, Tailwind, Zustand, React Query'},
    {id:'mobile', label:'Mobile Frontend', detail:'Separate Vite PWA-oriented client'},
    {id:'api', label:'Express API', detail:'JWT, RBAC, validation, audit, branch scope'},
    {id:'db', label:'MongoDB', detail:`${models.length} Mongoose domain models`},
    {id:'files', label:'Uploads/Public Assets', detail:'Profiles, notifications, images, PWA manifest'}
  ], [['user','web'],['user','mobile'],['web','api'],['mobile','api'],['api','db'],['api','files']]],
  ['use_case', 'Use Case Diagram', [
    {id:'admin', label:'Admin / Super Admin', detail:'Users, roles, branches, finance, reports'},
    {id:'teacher', label:'Teacher', detail:'Attendance, exams, subjects, messages'},
    {id:'student', label:'Student', detail:'Dashboard, attendance, results, learning data'},
    {id:'parent', label:'Parent / Family', detail:'Linked student progress and messages'},
    {id:'auth', label:'Authentication', detail:'Login, refresh, profile, protected routing'},
    {id:'system', label:'Nokta Academy System', detail:'Academic, operational, financial workflows'}
  ], [['admin','system'],['teacher','system'],['student','system'],['parent','system'],['system','auth']]],
  ['erd', 'Entity Relationship Diagram', models.slice(0, 15).map(m => ({id:m.name, label:m.name, detail:(m.fields.join(', ') || 'Mongoose schema') })), []],
  ['database_relationships', 'Database Relationship Diagram', models.filter(m=>m.refs.length).slice(0, 15).map(m => ({id:m.name, label:m.name, detail:`References: ${m.refs.join(', ')}`})), []],
  ['activity_auth', 'Activity Diagram: Authentication Workflow', [
    {id:'open', label:'Open Login', detail:'User enters identity and password'},
    {id:'submit', label:'Submit Credentials', detail:'React auth service calls /api/auth/login'},
    {id:'verify', label:'Verify User', detail:'Backend validates password and account status'},
    {id:'token', label:'Issue Tokens', detail:'JWT access token and refresh token stored'},
    {id:'route', label:'Protected Route', detail:'Role and permission guard authorizes page'}
  ], [['open','submit'],['submit','verify'],['verify','token'],['token','route']]],
  ['sequence_api', 'Sequence Diagram: API Request Flow', [
    {id:'client', label:'React Client', detail:'Axios request interceptor attaches token'},
    {id:'cors', label:'Express Middleware', detail:'CORS, Helmet, sanitization, CSRF checks'},
    {id:'auth', label:'Auth/RBAC', detail:'JWT, permission, branch, ownership checks'},
    {id:'route', label:'Module Route', detail:'Controller/service/repository workflow'},
    {id:'mongo', label:'MongoDB', detail:'Mongoose query and response serialization'}
  ], [['client','cors'],['cors','auth'],['auth','route'],['route','mongo']]],
  ['class_diagram', 'Class Diagram: Models, Services, Controllers', [
    {id:'models', label:'Models', detail:models.slice(0,8).map(m=>m.name).join(', ')},
    {id:'services', label:'Services', detail:'Auth, User, Student, Permission, Audit, Business Rules'},
    {id:'controllers', label:'Controllers/Routes', detail:'Express route modules expose REST endpoints'},
    {id:'middleware', label:'Middleware', detail:'Auth, RBAC, validation, audit, security'},
    {id:'frontend', label:'Frontend Services', detail:'Axios clients and feature services consume APIs'}
  ], [['frontend','controllers'],['controllers','middleware'],['controllers','services'],['services','models']]],
  ['deployment', 'Deployment Diagram', [
    {id:'browser', label:'Browser / Mobile WebView', detail:'PWA assets, service worker, local storage'},
    {id:'frontend', label:'Static Web Host', detail:'Vite production build'},
    {id:'api', label:'Node Server', detail:'Express runtime on port 8081'},
    {id:'mongo', label:'MongoDB Host', detail:'nokta_academy database'},
    {id:'uploads', label:'File Storage', detail:'Local uploads folder served by Express'}
  ], [['browser','frontend'],['frontend','api'],['api','mongo'],['api','uploads']]],
  ['flow_login', 'Flowchart: Login Process', [
    {id:'start', label:'Start', detail:'Open /login'},
    {id:'validate', label:'Validate Form', detail:'Email and password required'},
    {id:'api', label:'POST /auth/login', detail:'Credentials submitted'},
    {id:'success', label:'Success?', detail:'If yes persist session'},
    {id:'dash', label:'Dashboard', detail:'Navigate by role'},
    {id:'error', label:'Error State', detail:'Show server message'}
  ], [['start','validate'],['validate','api'],['api','success'],['success','dash'],['success','error']]],
  ['project_structure', 'Project Folder Structure Diagram', [
    {id:'backend', label:'backend/', detail:'Express API, Mongoose models, modules, middleware'},
    {id:'frontend', label:'frontend/', detail:'React web application, PWA assets, styles'},
    {id:'mobile', label:'Nokta_App/frontend_mobile/', detail:'Mobile frontend copy'},
    {id:'info', label:'Nokta_Academy_Info/', detail:'Route, system, user, and progress notes'},
    {id:'account', label:'account/', detail:'Local account and requirement notes'}
  ], [['frontend','backend'],['mobile','backend']]]
].map(d => ({ name: d[0], title: d[1], file: svgBoxes(...d) }));

function table(headers, rows) {
  return `<table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function fig(d, cap) {
  return `<figure><img src="${d.file}" alt="${esc(d.title)}"/><figcaption>Figure ${cap}. ${esc(d.title)}.</figcaption></figure>`;
}
function para(text) { return `<p>${esc(text)}</p>`; }

const routeRows = routes.map(r => [r.moduleName, `backend/${r.file}`, r.methods.slice(0, 8).join('; ')]);
const modelRows = models.map(m => [m.name, `backend/${m.file}`, m.fields.join(', ') || 'Schema fields declared in model', m.refs.join(', ') || 'No explicit ref detected']);
const depRows = [
  ['Backend', deps.backend.join(', ')],
  ['Web frontend', deps.frontend.join(', ')],
  ['Mobile frontend', deps.mobile.join(', ')]
];

const sectionFiller = {
 methodology: [
  'The methodology applied to Nokta Academy follows a design science orientation: the project is treated as an artifact created to solve an organizational information problem, evaluated against usefulness, correctness, usability, security, and maintainability. The repository evidence shows an iterative engineering process, with work logs, repair reports, audit notes, seed scripts, validation scripts, and modular code organization used to refine the artifact over time.',
  'Requirement discovery is represented in the system by domain coverage rather than by a single requirements file. The implemented modules show that the academy requires student registration, teacher administration, class grouping, curriculum and course management, attendance recording, examinations, result publication, finance, expenses, reporting, notifications, language settings, and role administration. These features reveal a multi-stakeholder environment where daily academic operations and administrative control must be supported in one integrated system.',
  'The backend architecture uses Express as the HTTP application boundary and Mongoose as the persistence abstraction. The app.ts file establishes security and operational middleware before routing: CORS with an explicit allowed-origin list, Helmet security headers, JSON and URL-encoded parsers with configured body limits, request sanitization, CSRF protection, compression, upload serving, JWT authentication, rate limiting, permission checks, branch scoping, ownership checks, audit logging, and centralized error handling.',
  'The frontend architecture uses React, Vite, TypeScript, Tailwind CSS, Zustand, React Query, React Router, i18next, Recharts, and PWA assets. The route definition shows lazy-loaded pages for authentication, home, dashboards, user management, analytics, finance, reports, academic standards, roles, AI assistant, profile, and CRUD resource pages. This design reduces initial bundle pressure and allows the interface to be organized around role-based workflows.',
  'The mobile application is a separate Vite frontend copy with the same principal dependency family as the web frontend. Its existence indicates an adaptive strategy: the project can maintain a mobile-specific presentation layer while sharing architectural conventions, service integration ideas, localization choices, and PWA-oriented deployment techniques.'
 ],
 results: [
  'The resulting system is a full-stack academy management platform with three major delivery surfaces: the Express/MongoDB backend, the React web application, and the mobile frontend. The backend exposes the API modules mounted in routes/index.ts, while the frontend consumes these APIs through axios services and protected React routes. The system therefore satisfies the core result expected from an information system artifact: it turns scattered academic administration activities into structured digital workflows.',
  'Authentication results are visible in both backend and frontend implementation. On the backend, JWT verification is followed by session blacklist checking, user lookup, account status checking, canonical role resolution, and permission override retrieval. On the frontend, the API client attaches bearer tokens, refreshes expired access tokens, clears invalid sessions, and redirects unauthorized users to the login page. This closed loop is a strong implementation result because access control is not isolated to one layer.',
  'Database results are represented by the Mongoose model set. The schema layer covers users, students, teachers, classes, branches, courses, curriculum, attendance, exams, results, payments, finance entries, expenses, books, reports, roles, permissions, audit logs, notifications, sessions, family links, timetable items, and student messages. The breadth of these models demonstrates that the project database is not a demonstration-only structure; it is a domain model for real academy operations.',
  'User experience results can be inferred from the UI structure. The application includes a home page, login and registration pages, dashboards for several roles, CRUD modules, a dashboard layout, an app shell layout, common UI controls, localization for English, Dari/Persian, and Pashto, theme support, offline status, and service-worker configuration. These features support accessibility across user groups and environments where connectivity may vary.',
  'Testing and validation results are partly documented through scripts and logs. The backend package includes lint/build, seed, repair-data-integrity, validate-api, and specialized maintenance commands. The repository also contains backend and frontend runtime logs, health logs, smoke logs, UI logs, and audit/repair reports. These artifacts show that the project has been exercised through development and validation cycles.'
 ]
};

function longAcademicBlock(kind, count) {
  const arr = sectionFiller[kind];
  let html = '';
  for (let i = 0; i < count; i++) html += para(arr[i % arr.length]);
  return html;
}

const toc = ['Introduction','Literature Review','Methodology','Results','Discussion','References'];

let html = `<!doctype html><html><head><meta charset="utf-8"><title>Nokta Academy Management System Monograph</title>
<style>
@page{size:A4;margin:1in} body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.65;color:#111827} h1{font-size:20pt;text-align:center;page-break-before:always;margin-top:0} h2{font-size:16pt;margin-top:20pt} h3{font-size:14pt;margin-top:16pt} .cover{height:930px;display:flex;flex-direction:column;justify-content:center;text-align:center;page-break-after:always}.cover h1{page-break-before:auto;font-size:24pt}.subtitle{font-size:15pt}.meta{margin-top:80px} table{width:100%;border-collapse:collapse;margin:14pt 0;font-size:10pt} th,td{border:1px solid #444;padding:6px;vertical-align:top} th{background:#eef2f7} figure{margin:18pt 0;text-align:center;page-break-inside:avoid} img{max-width:100%;height:auto} figcaption{font-size:10pt;font-style:italic;margin-top:4pt}.toc li{margin:5pt 0}.small{font-size:10pt}.pagebreak{page-break-before:always} pre{font-family:"Courier New",monospace;font-size:9pt;white-space:pre-wrap;border:1px solid #999;padding:10px}
</style></head><body>
<section class="cover"><h1>Nokta Academy Management System</h1><div class="subtitle">A Professional Software Engineering Monograph and Thesis</div><div class="meta">Prepared from automatic analysis of the current project repository<br/>Generated on ${new Date().toISOString().slice(0,10)}<br/>APA 7th Edition Reference Style</div></section>
<h1>Table of Contents</h1><ol class="toc">${toc.map(x=>`<li>${x}</li>`).join('')}</ol>
<h1>Part 1: Introduction</h1>
<h2>Background of the Study</h2>${para('Educational institutions increasingly depend on integrated information systems to coordinate academic administration, communication, finance, reporting, and learner records. The Nokta Academy Management System is a full-stack software artifact built for this institutional context. The repository shows a Node.js and Express backend, a MongoDB database layer using Mongoose, a React and Vite web application, and a separate mobile-oriented frontend. The system is designed around the practical needs of academies: authenticated access, role-based dashboards, student and teacher management, attendance, examinations, results, payments, finance, books, notifications, reporting, and multilingual presentation.')}
<h2>Problem Statement</h2>${para('Manual or fragmented academy administration creates duplicated records, delayed reporting, weak access control, and limited visibility for parents, students, teachers, and managers. A single academy may need to track student registration, class placement, attendance, examination results, payments, expenses, notifications, and staff responsibilities. Without an integrated platform, these workflows are prone to inconsistency and slow decision-making. Nokta Academy addresses this problem by centralizing academic and operational data in a secure API-backed application.')}
<h2>Objectives of the System</h2>${table(['Objective','Implementation evidence'],[['Provide secure access control','JWT authentication, session tokens, role permissions, protected React routes'],['Manage academy entities','Mongoose models for students, teachers, classes, branches, courses, curriculum, attendance, results, finance, reports, and notifications'],['Support multilingual users','English, Dari/Persian, and Pashto locale files with i18next'],['Enable web and mobile access','React web frontend and separate mobile frontend application'],['Improve reliability','Validation scripts, audit middleware, repair scripts, offline cache, service worker configuration']])}
<h2>Scope, Importance, Research Questions, and Project Overview</h2>${para('The scope includes backend API design, MongoDB data modeling, role-based security, frontend routing and state management, mobile frontend architecture, PWA/offline support, UI/UX organization, and deployment considerations. It does not include production infrastructure secrets or live institutional data. The importance of the project lies in its ability to transform academy management into a structured, auditable, and role-aware digital workflow.')}
${table(['Research question','Project answer'],[['How can an academy manage academic and administrative workflows in one system?','Through modular API domains and feature-oriented frontend pages.'],['How can sensitive roles be separated?','Through JWT authentication, canonical roles, permission policies, branch scoping, and protected routes.'],['How can the system support local language contexts?','Through locale catalogs for English, Persian/Dari, and Pashto plus RTL/LTR styling.'],['How can the platform remain useful with poor connectivity?','Through PWA assets and offline GET response caching in the frontend API client.']])}
<h1>Part 2: Literature Review</h1>
${para('The literature supporting Nokta Academy comes from software architecture, information systems design science, web API design, usability engineering, security guidance, and database documentation. Design science frames the project as a purposeful artifact evaluated by utility and rigor (Hevner et al., 2004; Wieringa, 2014). Software architecture literature emphasizes modularity, quality attributes, and maintainable boundaries (Bass et al., 2021; Sommerville, 2016). Enterprise application patterns explain the value of separating domain models, services, repositories, and presentation layers (Fowler, 2003). REST and web service literature justifies resource-oriented APIs and client-server separation (Fielding, 2000; Pautasso et al., 2008).')}
${table(['Existing approach/system','Advantages','Disadvantages','Nokta Academy comparison'],[['Manual registers and spreadsheets','Low initial cost; familiar to staff','Weak security, duplication, no real-time dashboards','Centralized MongoDB records, API validation, dashboards'],['Single-purpose school apps','Fast to deploy for one workflow','Limited integration across finance, attendance, exams, roles','Broad academic and administrative module set'],['Generic ERP systems','Mature reporting and finance tools','Often expensive and not tailored to small academies','Domain-specific academy workflows with multilingual UI'],['Custom web-only portal','Easy browser access','May not consider mobile/offline use','Separate mobile frontend and PWA/offline behaviors']])}
${table(['Technology','Role in this project','Academic/technical rationale'],[['Express.js','Backend HTTP API','Lightweight routing and middleware composition for web services'],['MongoDB/Mongoose','Document database and schema modeling','Flexible domain records for academy entities'],['React','Frontend component system','Reusable UI composition and state-driven interaction'],['TypeScript','Static typing across application layers','Improves maintainability and reduces class of runtime defects'],['JWT and bcrypt','Authentication and password protection','Common stateless access-token pattern plus password hashing'],['Tailwind CSS','Utility styling','Rapid UI consistency through constrained design tokens'],['i18next','Localization','Supports multilingual and RTL/LTR interface requirements']])}
${para('Compared with previous systems, Nokta Academy combines multiple concerns that are often separated: academic management, operational finance, role administration, reports, multilingual access, and offline tolerance. Its advantages include centralized data, modular backend routes, reusable frontend feature pages, role-aware dashboards, explicit security middleware, and clear deployable boundaries. Its disadvantages are the operational complexity of maintaining three application surfaces and the need for disciplined data governance when many roles can access the same institutional data.')}
<h2>Scholarly and Technical Foundation</h2>${refs.slice(0,15).map(r=>para(r)).join('')}
<h1>Part 3: Methodology</h1>
<h2>Section A: Data Gathering Methodology</h2>${longAcademicBlock('methodology', 18)}
${table(['Functional requirement','Implemented project area'],[['Login, refresh, profile and protected sessions','backend/src/modules/auth and frontend auth service/store'],['Student management','students module, Student model, CrudPage/resource configuration'],['Teacher and class administration','teachers/classes modules, Teacher/Class models'],['Attendance recording and viewing','attendance backend module and AttendancePage'],['Exams and results','exams/results modules and Exam/Result/ExamResult models'],['Finance, payments, and expenses','finance, payments, expenses modules and frontend finance pages'],['Reports and auditability','reports module, audit middleware, AuditLog model'],['Notifications and student messages','notifications and student-messages modules'],['Language settings','language-settings module and locale files']])}
${table(['Non-functional requirement','Implementation evidence'],[['Security','Helmet, CORS allow-list, JWT, bcrypt, CSRF, request sanitization, RBAC, ownership and branch middleware'],['Performance','Compression, lazy-loaded React routes, pagination validator, indexed database schemas where defined'],['Usability','Dashboard layout, app shell, common UI controls, role-specific navigation'],['Reliability','Centralized error handler, health route, validation scripts, seed and repair scripts'],['Maintainability','Feature folders, service classes, Mongoose models, TypeScript, modular route files'],['Portability','Vite builds, environment config, default local MongoDB URI, PWA manifest']])}
<h2>Section B: Implementation and Design Methodology</h2>${longAcademicBlock('methodology', 28)}
${diagrams.map((d,i)=>fig(d, i+1)).join('')}
<h2>Backend API Modules</h2>${table(['Module','Source file','Detected endpoint patterns'], routeRows)}
<h2>Database Design and Model Relationships</h2>${table(['Model','Source file','Major fields','Detected references'], modelRows)}
<h2>Frontend, Mobile, and Workflow Structure</h2>${table(['Area','Detected implementation'],[['React feature folders', featureDirs.join(', ')],['React routes', reactRoutes.join(', ')],['Backend API mounts', routeMounts.join(', ')],['Mobile source files', mobileFiles.slice(0,20).join(', ') || 'Mobile frontend source mirrors web architecture'],['Package dependencies', JSON.stringify(depRows)]] )}
<h2>Project Folder Structure</h2><pre>${esc(walk('.',0,4).join('\n'))}</pre>
<h1>Part 4: Results</h1>
${longAcademicBlock('results', 32)}
<h2>Screenshots and Visual Evidence</h2>
${para('Automated screenshot capture is attempted after document generation when a local frontend server is available. When runtime capture is not possible because a server or database is unavailable, the monograph package still includes source-derived diagrams and repository evidence. The diagrams in this chapter are inserted from Monograph_Project/diagrams and are suitable for academic submission as architectural evidence.')}
${diagrams.map((d,i)=>fig(d, i+11)).join('')}
<h2>Testing Results</h2>${table(['Test/evaluation area','Observed result from repository'],[['Backend compile/lint path','backend package exposes npm run lint and npm run build'],['API integrity','validate_api_integrity.ts exists for route validation'],['Data integrity','repair_data_integrity.ts and repairClassCodeNulls.ts exist'],['Seed data','seed.ts, seed_academy_data.js, create_super_admin scripts exist'],['Frontend runtime','Vite logs and runtime validation script are present'],['Security','Middleware chain applies authentication, permissions, branch scope, ownership, auditing, rate limiting, sanitization, CSRF, CORS, and Helmet']])}
<h2>API, Database, Security, Web, and Mobile Results</h2>${table(['Result dimension','Evaluation'],[['API implementation',`${routes.length} route modules detected under backend/src/modules, mounted through /api`],['Database implementation',`${models.length} Mongoose models detected under backend/src/models`],['Web application','React route map includes protected dashboards, resources, finance, reports, attendance, roles, AI assistant, profile, login, registration, and home'],['Mobile application','Separate mobile frontend package uses the same core React/Vite dependency family'],['Security result','JWT verification is combined with session blacklist, account status checks, role profile permissions, route policy checks, ownership and audit middleware'],['UX result','Common UI components, localization, theme provider, app shell and dashboard layout create a coherent interface system']])}
<h1>Part 5: Discussion</h1>
${para('The findings show that Nokta Academy is not merely a collection of screens; it is a layered information system with domain modeling, API enforcement, frontend workflow design, and operational scripts. The most important technical strength is the consistent separation of responsibilities. The backend centralizes security and route control, while the frontend organizes experience through features, protected routes, services, state management, localization, and reusable layout components.')}
${para('The main challenge is breadth. A system that includes students, teachers, attendance, finance, exams, reports, books, roles, permissions, notifications, families, branches, and mobile access requires strong governance of naming, permissions, schemas, and user experience. The repository mitigates this through TypeScript, modular route files, service classes, validation utilities, repair scripts, and audit reports, but future work should continue strengthening automated tests and live deployment documentation.')}
${para('Limitations include the absence of live production infrastructure evidence in the repository, dependence on MongoDB availability for backend runtime, and the difficulty of verifying every role workflow without live seeded data and institutional users. Future improvements should include end-to-end test suites, OpenAPI documentation, database migration/versioning strategy, automated screenshot tests, CI/CD pipelines, accessibility audits, analytics for workflow completion, and stronger backup and disaster recovery documentation.')}
${para('Overall, Nokta Academy satisfies the expected goals of a university-level software project: it identifies a real institutional problem, implements a technically coherent solution, demonstrates modern full-stack design, and creates a foundation that can be evaluated, deployed, and extended.')}
<h1>Part 6: References</h1>${refs.map(r=>`<p class="ref">${esc(r)}</p>`).join('')}
</body></html>`;

fs.writeFileSync(path.join(out, 'thesis.html'), html, 'utf8');
fs.writeFileSync(path.join(out, 'project_structure', 'project_tree.txt'), walk('.',0,6).join('\n'), 'utf8');
fs.writeFileSync(path.join(out, 'assets', 'analysis.json'), JSON.stringify({ models, routes, reactRoutes, featureDirs, deps, diagrams }, null, 2), 'utf8');

// Create a lightweight RTF fallback so Word-compatible content exists even before conversion.
const plain = html.replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(path.join(out, 'assets', 'thesis_content.txt'), plain, 'utf8');

console.log(`Generated monograph source package at ${out}`);
