/* ═══════════════════════════════════════════════════════════
   AXIOM · data layer
   Curriculum graph · simulations · adaptive question bank · archive
   ═══════════════════════════════════════════════════════════ */

const SUBJECTS = {
  Physics:          { color: '#9a6b3f', short: 'PHY' },
  Mathematics:      { color: '#b8860b', short: 'MTH' },
  'Computer Science':{ color: '#3f7a52', short: 'CS'  }
};

/* id, label, subject, tier, deps[], mastery 0-1, days since study, half-life (days) */
const NODES = [
  { id:'kinematics', label:'Kinematics', subject:'Physics', tier:1, deps:[], mastery:.82, days:6, hl:18,
    blurb:'Motion described without asking why: position, velocity, acceleration, and the geometry of trajectories.',
    analogy:'A film strip with no plot. Each frame is a position; velocity is how fast the frames advance, acceleration is how the frame rate itself changes.',
    sim:{ type:'projectile', params:{ v0:20, angle:60, h:45 }, insight:'The horizontal and vertical stories never talk to each other — each runs on its own clock.' } },

  { id:'vectors', label:'Vectors & Resolution', subject:'Physics', tier:1, deps:[], mastery:.38, days:21, hl:9,
    blurb:'Every physical quantity with direction. Resolution into components is the single most reused move in mechanics.',
    analogy:'A delivery route. The destination is fixed, but you may walk it as one diagonal or as two orthogonal legs — the total displacement is identical, the effort is not.',
    sim:{ type:'vector', params:{ A:3.2, theta:38 }, insight:'Components are not approximations. They are the same vector wearing a coordinate costume.' } },

  { id:'newton', label:"Newton's Laws", subject:'Physics', tier:2, deps:['kinematics','vectors'], mastery:.71, days:9, hl:16,
    blurb:'Force as the cause of acceleration. Free-body diagrams are the grammar of mechanics.',
    analogy:'A ledger of pushes. The mass is the exchange rate between force deposited and acceleration withdrawn.',
    sim:{ type:'vector', params:{ A:2.6, theta:22 }, insight:'Net force, not any single force, writes the acceleration.' } },

  { id:'workenergy', label:'Work & Energy', subject:'Physics', tier:3, deps:['newton'], mastery:.64, days:12, hl:14,
    blurb:'A scalar accounting of motion that bypasses time entirely. Potential wells, conservation, and power.',
    analogy:'A bank account for motion. Work is a deposit, kinetic energy is the balance, and friction is a silent recurring fee.',
    sim:{ type:'area', params:{ k:1.4, x0:0, x1:2.2 }, insight:'The area under a force–displacement curve is literally the work done.' } },

  { id:'rotation', label:'Rotational Dynamics', subject:'Physics', tier:4, deps:['newton','workenergy'], mastery:.41, days:17, hl:12,
    blurb:'Torque, moment of inertia, angular momentum. The same mechanics, rotated into a new coordinate frame.',
    analogy:'A revolving door: pushing near the hinge is wasted effort. The same force, armed with a longer lever, buys more rotation.',
    sim:{ type:'oscillator', params:{ A:1.3, w:1.6, d:.06 }, insight:'Moment of inertia is mass that refuses to be moved linearly — it only answers to torque.' } },

  { id:'gravitation', label:'Gravitation', subject:'Physics', tier:4, deps:['newton'], mastery:.58, days:25, hl:11,
    blurb:'Inverse-square attraction, orbital energetics, and escape conditions.',
    analogy:'A marble on a rubber sheet. The well depth sets the speed needed to climb out; orbits are the paths that never finish climbing.',
    sim:{ type:'orbit', params:{ r:2.4, e:.38, speed:1 }, insight:'An orbit is free-fall with enough sideways speed to keep missing the ground.' } },

  { id:'shm', label:'Oscillations', subject:'Physics', tier:5, deps:['rotation','workenergy'], mastery:.35, days:28, hl:10,
    blurb:'Restoring forces produce sinusoidal motion. Phase, resonance, damping, and energy exchange.',
    analogy:'A pendulum is a clock made of geometry. The period does not care how far you pull it — only how long the string is.',
    sim:{ type:'oscillator', params:{ A:1, w:2.4, d:.04 }, insight:'Energy sloshes between kinetic and potential twice per cycle — the total never leaks in an ideal system.' } },

  { id:'waves', label:'Waves & Superposition', subject:'Physics', tier:5, deps:['shm'], mastery:.50, days:15, hl:12,
    blurb:'Propagating oscillations, interference, standing modes, and the Doppler shift.',
    analogy:'Two people shaking the same rope from opposite ends. Where crests meet crests you get a wall; where crest meets trough, silence.',
    sim:{ type:'wave', params:{ A:1, f:1.1, k:2.4 }, insight:'Interference is not a collision — the waves pass through each other and the pattern is pure addition.' } },

  { id:'thermo', label:'Thermodynamics', subject:'Physics', tier:2, deps:['kinematics'], mastery:.66, days:8, hl:15,
    blurb:'Heat, work, entropy, and the laws that forbid certain energy trades.',
    analogy:'A casino with a strict house edge: energy can be moved around freely, but usable order always leaks toward disorder.',
    sim:{ type:'gas', params:{ T:320, n:70 }, insight:'Temperature is nothing but the mean kinetic energy of microscopic chaos.' } },

  { id:'electrostatics', label:'Electrostatics', subject:'Physics', tier:3, deps:['vectors','newton'], mastery:.47, days:19, hl:13,
    blurb:'Coulomb fields, potential, conductors, and capacitance.',
    analogy:'Invisible terrain. Charges roll downhill along field lines; equipotential surfaces are the contour lines of that terrain.',
    sim:{ type:'field', params:{ q1:1.6, q2:-1.1 }, insight:'Field lines never cross — a crossing would mean two different forces at one point.' } },

  { id:'circuits', label:'Current & Circuits', subject:'Physics', tier:4, deps:['electrostatics'], mastery:.55, days:11, hl:14,
    blurb:'Drift, resistance, Kirchhoff rules, and transient RC behaviour.',
    analogy:'Plumbing under pressure. Voltage is the head, current is the flow, resistance is the pipe narrowing, capacitance is a tank that fills.',
    sim:{ type:'circuit', params:{ V:9, R:220, C:47 }, insight:'The capacitor voltage approaches the battery asymptotically — it never technically arrives.' } },

  { id:'magnetism', label:'Magnetism & Induction', subject:'Physics', tier:5, deps:['circuits','vectors'], mastery:.31, days:30, hl:9,
    blurb:'Lorentz force, Biot–Savart, and Faraday’s law — electricity seen from a moving frame.',
    analogy:'A magnetic field is a charge’s opinion about your velocity. Change your frame and part of the electric field becomes magnetic.',
    sim:{ type:'field', params:{ q1:1.2, q2:1.2 }, insight:'A stationary charge ignores magnetism entirely. Induction is what happens when you refuse to stay still.' } },

  { id:'optics', label:'Ray & Wave Optics', subject:'Physics', tier:4, deps:['waves'], mastery:.60, days:7, hl:16,
    blurb:'Refraction, lenses, interference, diffraction, and optical instruments.',
    analogy:'A lens is a carefully choreographed delay: glass slows light, and a curved delay surface bends the wavefront into a focus.',
    sim:{ type:'rays', params:{ f:1.4, h:.75 }, insight:'A ray is a bookkeeping line, not a particle. The wave is the physical object.' } },

  { id:'modern', label:'Modern Physics', subject:'Physics', tier:5, deps:['electrostatics','optics'], mastery:.44, days:23, hl:12,
    blurb:'Photons, Bohr levels, radioactive decay, and the quantum accounting of energy.',
    analogy:'A staircase, not a ramp. Energy may only be exchanged one whole step at a time; the “height” of the step is Planck’s constant.',
    sim:{ type:'decay', params:{ hl:5, n0:1000 }, insight:'Half-life is a statistical promise about populations, never a deadline for one atom.' } },

  /* ── Mathematics ── */
  { id:'functions', label:'Functions & Graphs', subject:'Mathematics', tier:1, deps:[], mastery:.74, days:5, hl:20,
    blurb:'Domain, range, composition, inverses, and the visual grammar of curves.',
    analogy:'A vending machine: you put in an input, it returns exactly one output. If it can return two, it is a relation, not a function.',
    sim:{ type:'graphfn', params:{ a:1, b:-1, c:1 }, insight:'Every transformation is a story about moving the coordinate frame, not the curve.' } },

  { id:'limits', label:'Limits & Continuity', subject:'Mathematics', tier:2, deps:['functions'], mastery:.62, days:13, hl:15,
    blurb:'What a function intends near a point, regardless of what it does at that point.',
    analogy:'A train approaching a station. The limit is the platform; whether the train actually stops there is a separate question.',
    sim:{ type:'graphfn', params:{ a:1, b:2, c:1 }, insight:'A removable hole is not a broken curve — it is a curve with one missing pixel.' } },

  { id:'differentiation', label:'Differentiation', subject:'Mathematics', tier:3, deps:['limits'], mastery:.68, days:10, hl:16,
    blurb:'Instantaneous rate, tangents, chain rule, and optimisation.',
    analogy:'The speedometer of a curve. It reports the slope of the road exactly where you are standing, not the average slope of the trip.',
    sim:{ type:'graphfn', params:{ a:.6, b:2.2, c:2 }, insight:'The derivative is a limit of secants — every tangent is a chord that got shy.' } },

  { id:'integration', label:'Integration', subject:'Mathematics', tier:4, deps:['differentiation'], mastery:.39, days:24, hl:11,
    blurb:'Accumulation, antiderivatives, substitution, and integration by parts.',
    analogy:'Filling a bathtub while the drain is open. The integral is the total water, not the instantaneous flow.',
    sim:{ type:'area', params:{ k:1.1, x0:0, x1:2.6 }, insight:'Area under the curve is accumulation; the +C is the freedom to choose your starting water level.' } },

  { id:'diffeq', label:'Differential Equations', subject:'Mathematics', tier:5, deps:['integration'], mastery:.28, days:32, hl:9,
    blurb:'Equations that describe their own evolution: growth, decay, oscillation, and coupling.',
    analogy:'A recipe that references its own output. The current state is an instruction for the next instant.',
    sim:{ type:'decay', params:{ hl:6, n0:800 }, insight:'Most solvable ODEs are disguised versions of “the rate is proportional to the amount”.' } },

  { id:'vectors3d', label:'Vectors & 3D Geometry', subject:'Mathematics', tier:3, deps:['vectors'], mastery:.52, days:16, hl:13,
    blurb:'Dot and cross products, planes, lines, and distance geometry.',
    analogy:'A room with three independent directions. Any point is a receipt listing how much of each direction you spent.',
    sim:{ type:'vector', params:{ A:2.8, theta:52 }, insight:'The cross product measures area and points along the normal — geometry as a vector.' } },

  { id:'probability', label:'Probability', subject:'Mathematics', tier:3, deps:['functions'], mastery:.57, days:9, hl:14,
    blurb:'Sample spaces, conditionals, distributions, and expectation.',
    analogy:'A weighted coin that refuses to remember. Every toss is a fresh negotiation with the same odds.',
    sim:{ type:'distribution', params:{ mu:0, sigma:1 }, insight:'The normal curve is not magic — it is what addition does to almost anything, repeatedly.' } },

  { id:'matrices', label:'Matrices & Determinants', subject:'Mathematics', tier:2, deps:[], mastery:.70, days:6, hl:17,
    blurb:'Linear maps as arrays, invertibility, rank, and eigenvalues.',
    analogy:'A machine that stretches, squashes and rotates the whole plane. The determinant is the area-tax it charges.',
    sim:{ type:'grid', params:{ sx:1.35, sy:.75, sh:.35 }, insight:'A determinant of zero means the machine flattened the plane onto a line — no return trip exists.' } },

  { id:'complex', label:'Complex Numbers', subject:'Mathematics', tier:3, deps:['functions','matrices'], mastery:.48, days:20, hl:13,
    blurb:'The plane that makes rotation into multiplication. Modulus, argument, roots of unity.',
    analogy:'A 2D number that can turn. Multiplying by i is exactly a quarter turn — algebra that happens to rotate.',
    sim:{ type:'grid', params:{ sx:1, sy:1, sh:0 }, insight:'Euler’s formula says exponential growth, viewed sideways, is rotation.' } },

  /* ── Computer Science ── */
  { id:'complexity', label:'Complexity Analysis', subject:'Computer Science', tier:1, deps:[], mastery:.81, days:4, hl:20,
    blurb:'Asymptotic growth, amortisation, and the cost of abstraction.',
    analogy:'Vehicle fuel economy. A motorcycle and a truck both reach the city; the question is how the fuel bill grows with distance.',
    sim:{ type:'bars', params:{ n:16, mode:'grow' }, insight:'Constants matter at small n. At large n, only the exponent has an opinion.' } },

  { id:'arrays', label:'Arrays & Sliding Windows', subject:'Computer Science', tier:1, deps:[], mastery:.76, days:7, hl:18,
    blurb:'Contiguous memory, prefix sums, two pointers, and window invariants.',
    analogy:'A row of lockers. Indexing is instant because the building knows exactly how far locker 47 is from locker 1.',
    sim:{ type:'bars', params:{ n:18, mode:'window' }, insight:'A window is a promise: everything inside is valid, and the boundary only ever moves forward.' } },

  { id:'recursion', label:'Recursion', subject:'Computer Science', tier:2, deps:['arrays','functions'], mastery:.61, days:12, hl:15,
    blurb:'Self-reference with a base case, call stacks, and divide-and-conquer.',
    analogy:'Russian dolls. To open the biggest you must first open a smaller one — and someone must guarantee the innermost doll exists.',
    sim:{ type:'graphnet', params:{ n:7, seed:3 }, insight:'Every recursion is a tree; memoisation is refusing to solve the same subtree twice.' } },

  { id:'sorting', label:'Sorting & Searching', subject:'Computer Science', tier:3, deps:['arrays','complexity'], mastery:.58, days:14, hl:14,
    blurb:'Ordering under comparison bounds; binary search invariants.',
    analogy:'A librarian inserting books one at a time versus splitting the shelf in half repeatedly. Same destination, different cost curves.',
    sim:{ type:'bars', params:{ n:16, mode:'sort' }, insight:'Comparison sorting cannot beat n log n — the information budget forbids it.' } },

  { id:'dp', label:'Dynamic Programming', subject:'Computer Science', tier:4, deps:['recursion','complexity'], mastery:.33, days:26, hl:10,
    blurb:'Optimal substructure, overlapping subproblems, and state design.',
    analogy:'A hiker marking altitudes on a map. Each new point is computed once, then read forever — never climbed twice.',
    sim:{ type:'grid', params:{ rows:7, cols:7 }, insight:'DP is recursion with a memory. The state is the contract; the transition is the rent.' } },

  { id:'graphs', label:'Graph Traversal', subject:'Computer Science', tier:3, deps:['arrays','recursion'], mastery:.49, days:18, hl:13,
    blurb:'BFS, DFS, connected components, topological order.',
    analogy:'Exploring a cave system with rope. A queue explores every tunnel at the same depth; a stack dives until it hits water.',
    sim:{ type:'graphnet', params:{ n:8, seed:5 }, insight:'BFS discovers shortest paths in unweighted graphs precisely because it refuses to go deep.' } },

  { id:'shortest', label:'Shortest Paths', subject:'Computer Science', tier:4, deps:['graphs','dp'], mastery:.26, days:34, hl:8,
    blurb:'Dijkstra, relaxations, priority queues, and negative-weight limits.',
    analogy:'A courier who never guesses. Every time a cheaper route is found, the ledger is corrected and the queue is re-sorted.',
    sim:{ type:'graphnet', params:{ n:9, seed:8 }, insight:'Dijkstra is greedy only because non-negative edges guarantee that the cheapest unvisited node can never improve.' } },
  /* ── CS: AI / ML / Security / Blockchain ── */
  { id:'ml', label:'Machine Learning', subject:'Computer Science', tier:3, deps:['complexity','probability'], mastery:.55, days:14, hl:13,
    blurb:'Learn patterns from data: regression, classification, clustering, and model evaluation.',
    analogy:'A student who studies past exam papers to predict future questions — the more representative the practice, the better the prediction.',
    sim:{ type:'graphnet', params:{ n:7, seed:3 }, insight:'A model is just a function with tunable parameters; training is search in parameter space.' } },
  { id:'dl', label:'Deep Learning', subject:'Computer Science', tier:4, deps:['ml'], mastery:.42, days:20, hl:11,
    blurb:'Neural networks with many layers: backpropagation, CNNs, RNNs, and transformers.',
    analogy:'A factory assembly line where each station refines the product a little more; the final output is a high-level understanding.',
    sim:{ type:'graphnet', params:{ n:8, seed:5 }, insight:'Depth lets the network learn hierarchical features — edges, then shapes, then objects.' } },
  { id:'ai', label:'Artificial Intelligence', subject:'Computer Science', tier:5, deps:['ml','dl'], mastery:.48, days:18, hl:12,
    blurb:'The broader field: search, reasoning, planning, and learning agents.',
    analogy:'A chess player who combines tactics (search), strategy (planning) and experience (learning) to win.',
    sim:{ type:'graphnet', params:{ n:9, seed:7 }, insight:'AI is the umbrella; ML is the engine; DL is the most powerful tool in the box.' } },
  { id:'cyber', label:'Cybersecurity', subject:'Computer Science', tier:3, deps:['complexity'], mastery:.60, days:10, hl:14,
    blurb:'Protecting systems: cryptography, network security, vulnerabilities, and defence.',
    analogy:'A castle with walls (firewalls), guards (IDS), locks (encryption) and a moat (network segmentation).',
    sim:{ type:'graphnet', params:{ n:6, seed:2 }, insight:'Security is a process, not a product — defence in depth, assume breach.' } },
  { id:'blockchain', label:'Blockchain', subject:'Computer Science', tier:4, deps:['cyber','complexity'], mastery:.38, days:22, hl:10,
    blurb:'Distributed, tamper-evident ledgers: hashing, consensus, smart contracts.',
    analogy:'A shared notebook where every page is chained to the previous one; to change a page you must rewrite every page after it.',
    sim:{ type:'graphnet', params:{ n:7, seed:9 }, insight:'Trust is replaced by cryptography and consensus — no central authority needed.' } },
  { id:'it', label:'Information Technology', subject:'Computer Science', tier:2, deps:['complexity'], mastery:.65, days:8, hl:16,
    blurb:'IT infrastructure: hardware, networks, operating systems, and system administration.',
    analogy:'The plumbing and wiring of the digital world — invisible when working, catastrophic when not.',
    sim:{ type:'graphnet', params:{ n:5, seed:1 }, insight:'IT keeps the lights on; CS invents new lights.' } }
];

/* ── simulation metadata ───────────────────────────────────── */
const SIM_META = {
  oscillator:{ label:'Harmonic lab', params:{ A:{label:'Amplitude',min:.2,max:2,step:.05,unit:'m'}, w:{label:'Angular frequency',min:.4,max:4,step:.05,unit:'rad/s'}, d:{label:'Damping ratio',min:0,max:.5,step:.01,unit:'ζ'} } },
  projectile:{ label:'Trajectory lab', params:{ v0:{label:'Launch speed',min:5,max:45,step:1,unit:'m/s'}, angle:{label:'Launch angle',min:5,max:85,step:1,unit:'°'}, h:{label:'Cliff height',min:0,max:100,step:1,unit:'m'} } },
  wave:{ label:'Interference lab', params:{ A:{label:'Amplitude',min:.2,max:1.6,step:.05,unit:'a.u.'}, f:{label:'Frequency',min:.4,max:2.4,step:.05,unit:'Hz'}, k:{label:'Wave number',min:1,max:4,step:.1,unit:'rad/m'} } },
  gas:{ label:'Kinetic lab', params:{ T:{label:'Temperature',min:120,max:900,step:10,unit:'K'}, n:{label:'Particles',min:20,max:140,step:2,unit:'n'} } },
  field:{ label:'Field lab', params:{ q1:{label:'Charge A',min:-2,max:2,step:.1,unit:'q'}, q2:{label:'Charge B',min:-2,max:2,step:.1,unit:'q'} } },
  circuit:{ label:'RC transient lab', params:{ V:{label:'Battery',min:1,max:24,step:.5,unit:'V'}, R:{label:'Resistance',min:47,max:1000,step:10,unit:'Ω'}, C:{label:'Capacitance',min:4.7,max:220,step:1,unit:'µF'} } },
  rays:{ label:'Lens lab', params:{ f:{label:'Focal length',min:.5,max:3,step:.05,unit:'m'}, h:{label:'Object height',min:.2,max:1.4,step:.05,unit:'m'} } },
  decay:{ label:'Decay lab', params:{ hl:{label:'Half-life',min:1,max:20,step:.5,unit:'days'}, n0:{label:'Initial amount',min:200,max:2000,step:50,unit:'N₀'} } },
  graphfn:{ label:'Function lab', params:{ a:{label:'Quadratic a',min:-2,max:2,step:.1,unit:''}, b:{label:'Linear b',min:-4,max:4,step:.1,unit:''}, c:{label:'Constant c',min:-3,max:3,step:.1,unit:''} } },
  area:{ label:'Accumulation lab', params:{ k:{label:'Curve scale',min:.2,max:3,step:.05,unit:'k'}, x0:{label:'Lower bound',min:0,max:2,step:.1,unit:'a'}, x1:{label:'Upper bound',min:.4,max:4,step:.1,unit:'b'} } },
  vector:{ label:'Vector lab', params:{ A:{label:'Magnitude',min:.5,max:5,step:.1,unit:'|v|'}, theta:{label:'Angle',min:0,max:360,step:1,unit:'°'} } },
  distribution:{ label:'Distribution lab', params:{ mu:{label:'Mean μ',min:-3,max:3,step:.1,unit:''}, sigma:{label:'Std dev σ',min:.3,max:2.5,step:.1,unit:''} } },
  grid:{ label:'Transform lab', params:{ sx:{label:'Scale x',min:.2,max:2,step:.05,unit:''}, sy:{label:'Scale y',min:.2,max:2,step:.05,unit:''}, sh:{label:'Shear',min:-1,max:1,step:.05,unit:''} } },
  bars:{ label:'Algorithm lab', params:{ n:{label:'Input size',min:6,max:40,step:1,unit:'n'}, mode:{label:'Mode',min:0,max:0,step:1,unit:'',hidden:true} } },
  graphnet:{ label:'Network lab', params:{ n:{label:'Nodes',min:5,max:12,step:1,unit:'n'}, seed:{label:'Seed',min:1,max:12,step:1,unit:'',hidden:true} } }
};

/* ── question bank ─────────────────────────────────────────── */
/* step kinds: num | expr | code
   num  → answer number, tol
   expr → expected expression + sample vars
   code → reference impl + tests                                      */
const QUESTIONS = [
  {
    id:'q-projectile', node:'kinematics', title:'Projectile over a cliff',
    tag:'Physics · kinematics', difficulty:.55, minutes:6,
    prompt:'A ball is launched at 20 m/s, 60° above the horizontal, from the edge of a 45 m cliff. Take g = 9.8 m/s² and ignore air resistance.',
    given:['v₀ = 20 m/s','θ = 60°','h = 45 m','g = 9.8'],
    steps:[
      { kind:'num', prompt:'Resolve the launch velocity horizontally.', unit:'m/s', answer:10, tol:.06,
        hints:['Two independent axes: horizontal never accelerates.','vₓ = v₀ cos θ = 20 × cos 60°.','cos 60° = 0.5, so vₓ = 10 m/s.','Horizontal velocity stays 10 m/s for the whole flight.','vₓ = 10.00 m/s'] },
      { kind:'num', prompt:'Resolve the launch velocity vertically.', unit:'m/s', answer:17.3205, tol:.08,
        hints:['Vertical motion is the only axis gravity touches.','v_y = v₀ sin θ = 20 × sin 60°.','sin 60° = √3/2 ≈ 0.866.','v_y = 17.32 m/s upward.','v_y = 17.32 m/s'] },
      { kind:'num', prompt:'Time until impact with the valley floor (y = −45 m).', unit:'s', answer:5.2756, tol:.06,
        hints:['Set y(t) = −45 and solve the quadratic.','y = v_y t − ½ g t² → 4.9t² − 17.32t − 45 = 0.','Use the quadratic formula; discard the negative root.','t = (17.32 + √(17.32² + 4·4.9·45)) / 9.8.','t ≈ 5.28 s'] },
      { kind:'num', prompt:'Horizontal range covered before impact.', unit:'m', answer:52.76, tol:.3,
        hints:['Range is purely horizontal motion.','x = vₓ · t.','vₓ = 10 m/s and t = 5.28 s.','x = 10 × 5.2756.','Range ≈ 52.8 m'] }
    ],
    chain:['vectors','kinematics','differentiation']
  },
  {
    id:'q-shm', node:'shm', title:'Energy in a spring oscillator',
    tag:'Physics · oscillations', difficulty:.68, minutes:7,
    prompt:'A 0.5 kg block on a frictionless surface is attached to a spring of stiffness 200 N/m and released from rest at x = 0.10 m.',
    given:['m = 0.5 kg','k = 200 N/m','A = 0.10 m'],
    steps:[
      { kind:'num', prompt:'Angular frequency ω of the oscillation.', unit:'rad/s', answer:20, tol:.05,
        hints:['The mass–spring frequency depends on both k and m.','ω = √(k/m).','k/m = 400.','ω = 20 rad/s.','ω = √(200/0.5) = 20 rad/s'] },
      { kind:'num', prompt:'Maximum speed of the block.', unit:'m/s', answer:2, tol:.03,
        hints:['Speed peaks as the block crosses equilibrium.','v_max = ωA.','ω = 20, A = 0.1.','v_max = 2 m/s.','v_max = ωA = 2.00 m/s'] },
      { kind:'num', prompt:'Total mechanical energy in the oscillation.', unit:'J', answer:1, tol:.02,
        hints:['At the turning point all energy is potential.','E = ½ k A².','A² = 0.01.','E = 0.5 × 200 × 0.01.','E = 1.00 J'] },
      { kind:'num', prompt:'Speed when the block is at x = 0.05 m.', unit:'m/s', answer:1.732, tol:.04,
        hints:['Use conservation, or the velocity–position relation.','v = ω√(A² − x²).','A² − x² = 0.01 − 0.0025 = 0.0075.','√0.0075 ≈ 0.0866; times ω = 20.','v ≈ 1.73 m/s'] }
    ],
    chain:['rotation','workenergy','shm']
  },
  {
    id:'q-dp', node:'dp', title:'Maximum subarray, step by step',
    tag:'CS · dynamic programming', difficulty:.62, minutes:9,
    prompt:'Given an integer array, return the largest sum of any contiguous non-empty subarray. Design the recurrence, then implement it. Complexity matters.',
    given:['arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]','expected = 6'],
    steps:[
      { kind:'expr', prompt:'Kadane recurrence: given prev (best sum ending at i−1) and ai (= arr[i]), write the best sum ending at i.',
        vars:{ prev:[-2, 3, -1, 4], ai:[1, -5, 2, 3] }, answer:'Math.max(ai, prev + ai)',
        hints:['You either extend the previous run or restart at the current element.','Extending: prev + ai. Restarting: ai. Take the better.','Math.max(prev + ai, ai).','Both orders are equivalent — the maximum is symmetric.','bestEndingHere = Math.max(prev + ai, ai)'] },
      { kind:'code', prompt:'Implement maxSubarray(arr) returning the maximum contiguous sum. Your function is executed against hidden tests.',
        answer:'(arr)=>{let best=-Infinity,cur=0;for(const x of arr){cur=Math.max(x,cur+x);best=Math.max(best,cur);}return best;}',
        tests:[[[-2,1,-3,4,-1,2,1,-5,4],6],[[1],1],[[-5,-2,-9],-2],[[2,3,-1,4],8]],
        hints:['Track both the current run and the global best.','cur = max(x, cur + x) at each element.','best = max(best, cur).','Start best at -Infinity so all-negative arrays work.','Return best after a single pass.'] },
      { kind:'num', prompt:'Kadane runs in O(n^k). What is k?', unit:'', answer:1, tol:.001,
        hints:['Count the nested loops.','One pass over n elements.','No nested iteration over the input.','The exponent is 1 — linear time.','k = 1'] }
    ],
    chain:['recursion','complexity','dp']
  },
  {
    id:'q-cap', node:'electrostatics', title:'Dielectric inserted, battery removed',
    tag:'Physics · electrostatics', difficulty:.70, minutes:6,
    prompt:'A 2.0 µF air capacitor is charged to 12 V, then disconnected from the battery. A dielectric of κ = 3 is inserted, filling the gap completely.',
    given:['C₀ = 2.0 µF','V₀ = 12 V','κ = 3','battery disconnected'],
    steps:[
      { kind:'num', prompt:'Charge stored on the plates.', unit:'µC', answer:24, tol:.1,
        hints:['Disconnecting freezes the charge, not the voltage.','Q = C₀V₀.','2.0 µF × 12 V.','Q = 24 µC.','Q = C₀V₀ = 24 µC'] },
      { kind:'num', prompt:'New capacitance after inserting the dielectric.', unit:'µF', answer:6, tol:.05,
        hints:['A dielectric multiplies capacitance by κ.','C = κC₀.','3 × 2.0.','C = 6.0 µF.','C = 6.0 µF'] },
      { kind:'num', prompt:'New potential difference across the plates.', unit:'V', answer:4, tol:.05,
        hints:['Charge is conserved because the battery is gone.','V = Q / C.','Q = 24 µC, C = 6 µF.','V = 4 V.','V = 4.0 V'] },
      { kind:'num', prompt:'Energy stored after insertion.', unit:'µJ', answer:48, tol:.4,
        hints:['Use the new C and V, or U = Q²/2C.','U = ½ C V².','½ × 6 µF × 16 V².','48 µJ — note the energy fell; the slab was pulled in.','U = 48 µJ'] }
    ],
    chain:['vectors','newton','electrostatics','circuits']
  },
  {
    id:'q-int', node:'integration', title:'Integration by parts, verified',
    tag:'Mathematics · calculus', difficulty:.75, minutes:8,
    prompt:'Evaluate ∫ x·eˣ dx symbolically, then use it. There is no substitute for getting the antiderivative right.',
    given:['∫ x eˣ dx','bounds 0 → 1'],
    steps:[
      { kind:'expr', prompt:'Antiderivative of x·eˣ (omit + C). Write it in terms of x.',
        vars:{ x:[.37,1.21,2.02] }, answer:'(x-1)*Math.exp(x)',
        hints:['Choose u = x, dv = eˣ dx.','Then du = dx and v = eˣ.','∫u dv = uv − ∫v du = x eˣ − eˣ.','Factor: eˣ(x − 1).','F(x) = (x − 1)eˣ'] },
      { kind:'num', prompt:'Definite value of ∫₀¹ x eˣ dx.', unit:'', answer:1, tol:.01,
        hints:['Apply F(1) − F(0).','F(1) = (0)e = 0.','F(0) = (−1)(1) = −1.','0 − (−1) = 1.','The integral equals exactly 1.'] },
      { kind:'num', prompt:'Now compute ∫₀² x eˣ dx.', unit:'', answer:8.389, tol:.02,
        hints:['Same antiderivative: F(x) = (x−1)eˣ.','F(2) = (1)e² ≈ 7.389.','F(0) = −1.','F(2) − F(0) = e² + 1.','≈ 8.389'] }
    ],
    chain:['functions','limits','differentiation','integration']
  },
  {
    id:'q-dijkstra', node:'shortest', title:'Dijkstra under pressure',
    tag:'CS · graphs', difficulty:.80, minutes:12,
    prompt:'Weighted directed graph, non-negative edges. Implement Dijkstra from source 0, then reason about its cost. n = 5, edges: 0→1 (4), 0→2 (1), 2→1 (2), 1→3 (1), 2→3 (5), 3→4 (3), 2→4 (8).',
    given:['source = 0','no negative edges','priority queue allowed'],
    steps:[
      { kind:'expr', prompt:'Relaxation rule: when edge u→v has weight w, the candidate distance is… (vars: du, w)',
        vars:{ du:[0, 3, 7], w:[2, 5, 1] }, answer:'du + w',
        hints:['A candidate path goes through u.','You already know the best-known distance to u.','Add the edge weight.','candidate = dist[u] + w.','du + w'] },
      { kind:'code', prompt:'Implement dijkstra(n, adj, src) returning the shortest-distance array. adj[u] = [[v, w], …]. You may assume connected, non-negative weights.',
        answer:'(n,adj,src)=>{const d=Array(n).fill(Infinity);d[src]=0;const q=[[0,src]];while(q.length){q.sort((a,b)=>a[0]-b[0]);const [du,u]=q.shift();if(du>d[u])continue;for(const [v,w] of adj[u]){if(d[u]+w<d[v]){d[v]=d[u]+w;q.push([d[v],v]);}}}return d;}',
        tests:[[[3,[[[1,2],[2,5]],[[2,1]],[]],0],[0,2,3]],[[4,[[[1,1]],[[2,2]],[[3,3]],[]],0],[0,1,3,6]],[[2,[[[1,4]],[]],0],[0,4]]],
        hints:['dist = Infinity, dist[src] = 0.','Loop: pop the cheapest unvisited node.','Skip stale queue entries.','Relax every outgoing edge and push improvements.','Return dist.'] },
      { kind:'num', prompt:'Using the graph in the prompt, what is the shortest distance from 0 to 4?', unit:'', answer:7, tol:.001,
        hints:['List the useful routes by hand first.','0→2 costs 1.','2→1 costs 2 (total 3); 1→3 costs 1 (total 4).','3→4 costs 3 (total 7).','The 2→4 direct edge costs 8 — worse. Answer 7.'] }
    ],
    chain:['arrays','recursion','graphs','dp','shortest']
  }
];

/* ── exam archive ──────────────────────────────────────────── */
const EXAMS = [
  { id:'jeea-2025-p1', exam:'JEE Advanced', year:2025, paper:'Paper 1', stream:'Full syllabus', duration:180, questions:54, marks:180, difficulty:.84, source:'IIT Kanpur · official',
    topics:['Rotational Dynamics','Integration','Electrostatics','Oscillations'], chain:['kinematics','rotation','integration'], blueprint:[['Rotational Dynamics',22],['Electrostatics',20],['Integration',18],['Oscillations',14],['Modern Physics',12],['Probability',14]] },
  { id:'jeea-2025-p2', exam:'JEE Advanced', year:2025, paper:'Paper 2', stream:'Full syllabus', duration:180, questions:54, marks:180, difficulty:.86, source:'IIT Kanpur · official',
    topics:['Magnetism','Differential Equations','Optics'], chain:['vectors','magnetism','diffeq'], blueprint:[['Magnetism & Induction',24],['Differential Equations',20],['Ray & Wave Optics',18],['Graph Traversal',16],['Complex Numbers',12],['Thermodynamics',10]] },
  { id:'jeea-2024-p1', exam:'JEE Advanced', year:2024, paper:'Paper 1', stream:'Full syllabus', duration:180, questions:54, marks:180, difficulty:.82, source:'IIT Madras · official',
    topics:['Rotational Dynamics','Integration','Circuits'], chain:['workenergy','circuits'], blueprint:[['Rotational Dynamics',22],['Integration',20],['Current & Circuits',18],['Gravitation',14],['Matrices',14],['Thermodynamics',12]] },
  { id:'jeea-2024-p2', exam:'JEE Advanced', year:2024, paper:'Paper 2', stream:'Full syllabus', duration:180, questions:54, marks:180, difficulty:.85, source:'IIT Madras · official',
    topics:['Oscillations','Differential Equations','Shortest Paths'], chain:['shm','diffeq'], blueprint:[['Oscillations',24],['Differential Equations',18],['Shortest Paths',16],['Magnetism & Induction',16],['Ray & Wave Optics',14],['Probability',12]] },
  { id:'jeea-2023-p1', exam:'JEE Advanced', year:2023, paper:'Paper 1', stream:'Full syllabus', duration:180, questions:54, marks:180, difficulty:.80, source:'IIT Guwahati · official',
    topics:['Electrostatics','Integration','Graph Traversal'], chain:['electrostatics','integration'], blueprint:[['Electrostatics',22],['Integration',20],['Graph Traversal',16],['Work & Energy',16],['Functions & Graphs',14],['Complex Numbers',12]] },
  { id:'jeea-2022-p2', exam:'JEE Advanced', year:2022, paper:'Paper 2', stream:'Full syllabus', duration:180, questions:54, marks:180, difficulty:.83, source:'IIT Bombay · official',
    topics:['Rotational Dynamics','Magnetism','Probability'], chain:['rotation','magnetism'], blueprint:[['Rotational Dynamics',20],['Magnetism & Induction',20],['Probability',18],['Differential Equations',16],['Current & Circuits',14],['Thermodynamics',12]] },
  { id:'jeea-2021-p1', exam:'JEE Advanced', year:2021, paper:'Paper 1', stream:'Full syllabus', duration:180, questions:54, marks:180, difficulty:.79, source:'IIT Kharagpur · official',
    topics:['Gravitation','Vectors & 3D Geometry','Sorting & Searching'], chain:['gravitation','vectors3d'], blueprint:[['Gravitation',20],['Vectors & 3D Geometry',20],['Sorting & Searching',16],['Oscillations',16],['Limits & Continuity',16],['Current & Circuits',12]] },
  { id:'jeea-2019-p2', exam:'JEE Advanced', year:2019, paper:'Paper 2', stream:'Full syllabus', duration:180, questions:54, marks:180, difficulty:.81, source:'IIT Roorkee · official',
    topics:['Magnetism','Integration','Dynamic Programming'], chain:['magnetism','integration','dp'], blueprint:[['Magnetism & Induction',22],['Integration',18],['Dynamic Programming',16],['Work & Energy',16],['Differential Equations',14],['Optics',14]] },
  { id:'jeem-2025-s1', exam:'JEE Main', year:2025, paper:'Jan · Shift 1', stream:'Full syllabus', duration:180, questions:75, marks:300, difficulty:.66, source:'NTA · official',
    topics:['Kinematics','Integration','Arrays & Sliding Windows'], chain:['kinematics','integration'], blueprint:[['Kinematics',20],['Integration',18],['Arrays & Sliding Windows',16],['Electrostatics',16],['Functions & Graphs',16],['Modern Physics',14]] },
  { id:'jeem-2024-s2', exam:'JEE Main', year:2024, paper:'Apr · Shift 2', stream:'Full syllabus', duration:180, questions:75, marks:300, difficulty:.64, source:'NTA · official',
    topics:['Thermodynamics','Probability','Sorting & Searching'], chain:['thermo','probability'], blueprint:[['Thermodynamics',20],['Probability',18],['Sorting & Searching',16],['Current & Circuits',16],['Matrices',16],['Ray & Wave Optics',14]] },
  { id:'jeem-2023-s1', exam:'JEE Main', year:2023, paper:'Jan · Shift 1', stream:'Full syllabus', duration:180, questions:75, marks:300, difficulty:.61, source:'NTA · official',
    topics:['Newton\'s Laws','Complex Numbers','Complexity Analysis'], chain:['newton','complex'], blueprint:[['Newton\'s Laws',20],['Complex Numbers',18],['Complexity Analysis',16],['Gravitation',16],['Limits & Continuity',16],['Oscillations',14]] },
  { id:'jeem-2021-s1', exam:'JEE Main', year:2021, paper:'Mar · Shift 1', stream:'Full syllabus', duration:180, questions:75, marks:300, difficulty:.59, source:'NTA · official',
    topics:['Kinematics','Matrices','Arrays & Sliding Windows'], chain:['kinematics','matrices'], blueprint:[['Kinematics',20],['Matrices',18],['Arrays & Sliding Windows',16],['Work & Energy',16],['Functions & Graphs',16],['Thermodynamics',14]] },
  { id:'neet-2024', exam:'NEET UG', year:2024, paper:'Full paper', stream:'Full syllabus', duration:200, questions:200, marks:720, difficulty:.57, source:'NTA · official',
    topics:['Kinematics','Thermodynamics','Optics'], chain:['kinematics','thermo','optics'], blueprint:[['Kinematics',18],['Thermodynamics',18],['Ray & Wave Optics',16],['Electrostatics',16],['Modern Physics',16],['Oscillations',16]] },
  { id:'neet-2023', exam:'NEET UG', year:2023, paper:'Full paper', stream:'Full syllabus', duration:200, questions:200, marks:720, difficulty:.55, source:'NTA · official',
    topics:['Current & Circuits','Oscillations','Probability'], chain:['circuits','shm'], blueprint:[['Current & Circuits',18],['Oscillations',18],['Probability',16],['Work & Energy',16],['Modern Physics',16],['Thermodynamics',16]] },
  { id:'neet-2022', exam:'NEET UG', year:2022, paper:'Full paper', stream:'Full syllabus', duration:200, questions:200, marks:720, difficulty:.53, source:'NTA · official',
    topics:['Gravitation','Thermodynamics','Ray Optics'], chain:['gravitation','thermo'], blueprint:[['Gravitation',18],['Thermodynamics',18],['Ray & Wave Optics',16],['Newton\'s Laws',16],['Current & Circuits',16],['Matrices',16]] },
  { id:'inpho-2024', exam:'INPhO', year:2024, paper:'Theory', stream:'Physics', duration:180, questions:8, marks:60, difficulty:.93, source:'IAPT · olympiad',
    topics:['Rotational Dynamics','Magnetism','Oscillations'], chain:['rotation','magnetism','shm'], blueprint:[['Rotational Dynamics',30],['Magnetism & Induction',26],['Oscillations',22],['Gravitation',12],['Ray & Wave Optics',10]] },
  { id:'inpho-2022', exam:'INPhO', year:2022, paper:'Theory', stream:'Physics', duration:180, questions:8, marks:60, difficulty:.91, source:'IAPT · olympiad',
    topics:['Electrostatics','Thermodynamics','Waves'], chain:['electrostatics','thermo','waves'], blueprint:[['Electrostatics',28],['Thermodynamics',24],['Waves & Superposition',22],['Rotational Dynamics',16],['Modern Physics',10]] },
  { id:'ioqm-2025', exam:'IOQM', year:2025, paper:'Qualifier', stream:'Mathematics', duration:180, questions:30, marks:100, difficulty:.88, source:'MTA · olympiad',
    topics:['Complex Numbers','Probability','Limits & Continuity'], chain:['complex','probability','limits'], blueprint:[['Complex Numbers',24],['Probability',24],['Limits & Continuity',20],['Vectors & 3D Geometry',18],['Functions & Graphs',14]] },
  { id:'ioqm-2023', exam:'IOQM', year:2023, paper:'Qualifier', stream:'Mathematics', duration:180, questions:30, marks:100, difficulty:.85, source:'MTA · olympiad',
    topics:['Integration','Matrices','Differential Equations'], chain:['integration','matrices','diffeq'], blueprint:[['Integration',24],['Matrices',22],['Differential Equations',20],['Complex Numbers',18],['Probability',16]] },
  { id:'kvpy-2022', exam:'KVPY SX', year:2022, paper:'Aptitude + Science', stream:'Full syllabus', duration:180, questions:120, marks:160, difficulty:.74, source:'IISc · fellowship',
    topics:['Current & Circuits','Complex Numbers','Dynamic Programming'], chain:['circuits','complex','dp'], blueprint:[['Current & Circuits',22],['Complex Numbers',20],['Dynamic Programming',18],['Waves & Superposition',16],['Matrices',14],['Probability',10]] },
  { id:'ioi-2024', exam:'IOI', year:2024, paper:'Day 1 + Day 2', stream:'Computer Science', duration:300, questions:6, marks:600, difficulty:.95, source:'IOI · olympiad',
    topics:['Dynamic Programming','Graph Traversal','Shortest Paths'], chain:['dp','graphs','shortest'], blueprint:[['Dynamic Programming',30],['Graph Traversal',25],['Shortest Paths',20],['Complexity Analysis',15],['Arrays & Sliding Windows',10]] },
  { id:'ioi-2023', exam:'IOI', year:2023, paper:'Day 1 + Day 2', stream:'Computer Science', duration:300, questions:6, marks:600, difficulty:.94, source:'IOI · olympiad',
    topics:['Dynamic Programming','Recursion','Sorting & Searching'], chain:['dp','recursion','sorting'], blueprint:[['Dynamic Programming',28],['Recursion',24],['Sorting & Searching',20],['Complexity Analysis',16],['Graph Traversal',12]] },
  { id:'icpc-2024', exam:'ICPC Regional', year:2024, paper:'Asia West', stream:'Computer Science', duration:300, questions:12, marks:12, difficulty:.9, source:'ICPC · competitive',
    topics:['Dynamic Programming','Graph Traversal','Shortest Paths'], chain:['dp','graphs','shortest'], blueprint:[['Dynamic Programming',26],['Graph Traversal',22],['Shortest Paths',18],['Arrays & Sliding Windows',16],['Complexity Analysis',18]] },
  { id:'gate-cs-2025', exam:'GATE CS', year:2025, paper:'Computer Science', stream:'Computer Science', duration:180, questions:65, marks:100, difficulty:.82, source:'IIT · GATE',
    topics:['Algorithms','Data Structures','Operating Systems','Computer Networks','Databases'], chain:['sorting','arrays','graphs'], blueprint:[['Algorithms',20],['Data Structures',18],['Operating Systems',16],['Computer Networks',16],['Databases',15],['Theory of Computation',15]] },
  { id:'gate-cs-2024', exam:'GATE CS', year:2024, paper:'Computer Science', stream:'Computer Science', duration:180, questions:65, marks:100, difficulty:.8, source:'IIT · GATE',
    topics:['Algorithms','Machine Learning','Computer Architecture','Software Engineering'], chain:['sorting','complexity','dp'], blueprint:[['Algorithms',20],['Machine Learning',18],['Computer Architecture',16],['Software Engineering',16],['Databases',15],['Computer Networks',15]] },
  { id:'gate-cs-2023', exam:'GATE CS', year:2023, paper:'Computer Science', stream:'Computer Science', duration:180, questions:65, marks:100, difficulty:.78, source:'IIT · GATE',
    topics:['Data Structures','Deep Learning','Cybersecurity','Cloud Computing'], chain:['arrays','graphs','dp'], blueprint:[['Data Structures',20],['Deep Learning',18],['Cybersecurity',16],['Cloud Computing',16],['Operating Systems',15],['Databases',15]] },
  { id:'gate-cs-2022', exam:'GATE CS', year:2022, paper:'Computer Science', stream:'Computer Science', duration:180, questions:65, marks:100, difficulty:.76, source:'IIT · GATE',
    topics:['Algorithms','Artificial Intelligence','Blockchain','Information Technology'], chain:['sorting','complexity','graphs'], blueprint:[['Algorithms',20],['Artificial Intelligence',18],['Blockchain',16],['Information Technology',16],['Computer Networks',15],['Databases',15]] },
  { id:'gate-da-2025', exam:'GATE DA', year:2025, paper:'Data Science & AI', stream:'Computer Science', duration:180, questions:65, marks:100, difficulty:.85, source:'IIT · GATE',
    topics:['Machine Learning','Deep Learning','Artificial Intelligence','Statistics'], chain:['dp','complexity','probability'], blueprint:[['Machine Learning',22],['Deep Learning',20],['Artificial Intelligence',18],['Statistics',16],['Data Structures',12],['Algorithms',12]] },
  { id:'gate-da-2024', exam:'GATE DA', year:2024, paper:'Data Science & AI', stream:'Computer Science', duration:180, questions:65, marks:100, difficulty:.83, source:'IIT · GATE',
    topics:['Machine Learning','Deep Learning','Data Mining','Big Data'], chain:['dp','complexity','probability'], blueprint:[['Machine Learning',22],['Deep Learning',20],['Data Mining',18],['Big Data',16],['Statistics',12],['Algorithms',12]] },
  { id:'ugc-net-cs-2024', exam:'UGC NET CS', year:2024, paper:'Paper 2', stream:'Computer Science', duration:180, questions:100, marks:200, difficulty:.72, source:'NTA · UGC NET',
    topics:['Machine Learning','Cybersecurity','Cloud Computing','Blockchain'], chain:['complexity','graphs','dp'], blueprint:[['Machine Learning',20],['Cybersecurity',18],['Cloud Computing',16],['Blockchain',16],['Data Structures',15],['Algorithms',15]] },
  { id:'ugc-net-cs-2023', exam:'UGC NET CS', year:2023, paper:'Paper 2', stream:'Computer Science', duration:180, questions:100, marks:200, difficulty:.7, source:'NTA · UGC NET',
    topics:['Artificial Intelligence','Information Technology','Cybersecurity','Networking'], chain:['complexity','graphs','arrays'], blueprint:[['Artificial Intelligence',20],['Information Technology',18],['Cybersecurity',16],['Networking',16],['Data Structures',15],['Algorithms',15]] },
  { id:'isro-cs-2024', exam:'ISRO CS', year:2024, paper:'Scientist/Engineer', stream:'Computer Science', duration:180, questions:80, marks:80, difficulty:.75, source:'ISRO · competitive',
    topics:['Machine Learning','Cybersecurity','Computer Networks','Operating Systems'], chain:['complexity','graphs','dp'], blueprint:[['Machine Learning',20],['Cybersecurity',18],['Computer Networks',16],['Operating Systems',16],['Data Structures',15],['Algorithms',15]] },
  { id:'barc-cs-2024', exam:'BARC CS', year:2024, paper:'Scientific Officer', stream:'Computer Science', duration:180, questions:100, marks:100, difficulty:.77, source:'BARC · competitive',
    topics:['Machine Learning','Deep Learning','Cybersecurity','Blockchain'], chain:['complexity','graphs','dp'], blueprint:[['Machine Learning',20],['Deep Learning',18],['Cybersecurity',16],['Blockchain',16],['Data Structures',15],['Algorithms',15]] },
  { id:'nptel-ml-2024', exam:'NPTEL ML', year:2024, paper:'Machine Learning', stream:'Computer Science', duration:180, questions:50, marks:50, difficulty:.68, source:'NPTEL · certification',
    topics:['Machine Learning','Deep Learning','Artificial Intelligence','Statistics'], chain:['complexity','probability','dp'], blueprint:[['Machine Learning',25],['Deep Learning',22],['Artificial Intelligence',18],['Statistics',18],['Data Structures',9],['Algorithms',8]] },
  { id:'nptel-dl-2024', exam:'NPTEL DL', year:2024, paper:'Deep Learning', stream:'Computer Science', duration:180, questions:50, marks:50, difficulty:.7, source:'NPTEL · certification',
    topics:['Deep Learning','Machine Learning','Artificial Intelligence','Neural Networks'], chain:['complexity','probability','dp'], blueprint:[['Deep Learning',28],['Machine Learning',22],['Artificial Intelligence',18],['Neural Networks',16],['Data Structures',8],['Algorithms',8]] },
  { id:'nptel-cyber-2024', exam:'NPTEL Cyber', year:2024, paper:'Cybersecurity', stream:'Computer Science', duration:180, questions:50, marks:50, difficulty:.65, source:'NPTEL · certification',
    topics:['Cybersecurity','Information Technology','Computer Networks','Blockchain'], chain:['complexity','graphs','arrays'], blueprint:[['Cybersecurity',28],['Information Technology',22],['Computer Networks',20],['Blockchain',16],['Data Structures',7],['Algorithms',7]] },
  { id:'nptel-blockchain-2024', exam:'NPTEL Blockchain', year:2024, paper:'Blockchain', stream:'Computer Science', duration:180, questions:50, marks:50, difficulty:.67, source:'NPTEL · certification',
    topics:['Blockchain','Cybersecurity','Information Technology','Cloud Computing'], chain:['complexity','graphs','arrays'], blueprint:[['Blockchain',30],['Cybersecurity',22],['Information Technology',18],['Cloud Computing',16],['Data Structures',7],['Algorithms',7]] }
];

/* ── cognitive bug taxonomy ────────────────────────────────── */
const BUG_TAXONOMY = [
  { key:'sign', label:'Sign inversion', note:'A term crossed the equals sign without flipping.', color:'#ff4d6d', fix:'Re-derive the last step from scratch and mark the sign of every moved term.' },
  { key:'factor2', label:'Factor-of-two error', note:'A halving or doubling was dropped (½, 2π, 2).', color:'#ffc154', fix:'Check every prefactor: ½mv², ½at², ½CV², 2πr.' },
  { key:'precision', label:'Precision slip', note:'Method correct, arithmetic drifted.', color:'#3ce8ff', fix:'Carry two extra digits and round only at the end.' },
  { key:'offbyone', label:'Off-by-one boundary', note:'Loop or window boundary excluded the last valid element.', color:'#9b6bff', fix:'Write the invariant: is the right boundary inclusive or exclusive?' },
  { key:'precedence', label:'Operator precedence', note:'Arithmetic or boolean grouping was read in the wrong order.', color:'#ff7ae0', fix:'Bracket the intended grouping before simplifying.' },
  { key:'undefined', label:'Undefined reference', note:'An identifier was used before it existed.', color:'#37f0a5', fix:'Trace the state: which variables exist at this line?' },
  { key:'units', label:'Unit mismatch', note:'Quantities of different dimensions were combined.', color:'#ffc154', fix:'Attach units to every symbol before substituting.' },
  { key:'logic', label:'Conceptual gap', note:'The step does not follow from the concept it claims to use.', color:'#ff4d6d', fix:'Return to the parent node and rebuild the dependency.' },
  { key:'empty', label:'Incomplete reasoning', note:'No usable working was submitted.', color:'#9aa6c0', fix:'Write the first line of the method even if unsure — partial credit is real.' }
];
