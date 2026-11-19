AIM.registerUnit({
  n: 10, hue: 315, short: 'Search',
  title: 'Finding the path',
  weeks: 'Week 10',
  promise: 'Expand the frontier in the right order, add a rumour about distance, and prove when the shortcut is safe.',
  minutes: 38,
  lectures: ['9.5 Breadth-first search', '9.6 Uniform cost search', '9.7 A star', 'Tutorial 10'],
  concepts: [
    {
      id: 'bfs',
      title: 'Breadth-first search',
      prereqs: ['framework'],
      usecase: 'A social network wants the shortest chain of introductions between two people, counting each introduction as one step. The number of hops matters more than the strength of each connection.',
      metaphor: {
        name: 'The ripple in a pond',
        claim: 'Drop a stone. The ripple reaches everything one ring away, then two rings, then three. It never skips a ring.',
        mapping: [
          ['the stone', 'start state', 'drop it'],
          ['a ring', 'depth level', 'expand a layer'],
          ['the ripple front', 'frontier', 'add neighbours'],
          ['a leaf in the water', 'goal', 'check when reached']
        ],
        widget: 'bfs-wave',
        lab: {
          title: 'Watch the wave',
          tryText: 'Step the search. The wave visits every node at distance one before any node at distance two.',
          notice: 'The first time the wave touches the goal, it has found the fewest-hop path.'
        }
      },
      idea: `<p><strong>Breadth-first search</strong> expands the frontier in first-in first-out order. It visits all states at depth one, then depth two, and so on. The frontier is a queue, and the visited set prevents a state from being expanded twice.</p>
<p>BFS is complete on finite graphs and optimal when every step costs the same. The first goal it reaches has the fewest steps, because shallower states are always expanded first.</p>
<p>The cost is memory. The frontier holds every node at the current depth, which grows exponentially with branching factor. On a grid with four moves, depth 15 can mean millions of frontier nodes.</p>`,
      lecture: {
        ref: '9.5',
        source: 'Transcript, Breadth first search',
        text: 'The lecturer expands the start state, then all of its successors, then all of theirs. "We go level by level. That is why the first goal we find is the shortest in number of steps."'
      },
      mechanics: {
        formula: 'frontier = FIFO queue, expand in insertion order',
        symbols: [
          ['frontier', 'the queue of nodes waiting to expand'],
          ['FIFO', 'first in, first out'],
          ['depth', 'the number of steps from the start']
        ],
        worked: 'A start node has two children. BFS expands both before any grandchild. If the goal is a child, it is found after one expansion of the start. If the goal is a grandchild, every child is expanded first. The found path has the fewest edges.'
      },
      mechanism: {
        widget: 'bfs-wave',
        lab: {
          title: 'Weighted edges break the guarantee',
          tryText: 'Turn on edge costs. The layer order does not change, but the note now compares the BFS path cost with the cheapest path.',
          notice: 'BFS counts steps. When costs differ, the fewest-step path can be expensive.'
        }
      },
      breaks: 'BFS ignores cost, so it is not optimal on weighted graphs. Its memory grows exponentially with depth. On an infinite graph it may never reach a goal that lies down one deep branch.',
      check: [
        {
          q: 'What data structure does BFS use for the frontier?',
          options: ['A stack', 'A FIFO queue', 'A priority queue', 'A hash table'],
          answer: 1,
          explain: 'First in, first out produces level-by-level expansion.'
        },
        {
          q: 'When is BFS optimal?',
          options: ['When all edge costs are equal', 'When the graph is a tree', 'When costs are negative', 'Always'],
          answer: 0,
          explain: 'With equal costs, fewer steps means lower cost. With unequal costs, it can miss a cheaper path.'
        }
      ],
      connection: {
        prompt: 'BFS is the generic framework with which frontier policy?',
        a: 'BFS', b: 'Policy',
        options: [
          { label: 'First in, first out', ok: true },
          { label: 'Last in, first out', ok: false },
          { label: 'Lowest cost first', ok: false },
          { label: 'Highest heuristic first', ok: false }
        ],
        explain: 'The only change from the framework is the queue order.'
      },
      recap: [
        'BFS expands level by level with a FIFO frontier.',
        'It is complete and optimal when all steps cost the same.',
        'Its memory grows exponentially with depth.'
      ],
      now: 'You can now trace BFS and say when its shortest path is also the cheapest.'
    },
    {
      id: 'ucs',
      title: 'Uniform cost search',
      prereqs: ['bfs'],
      usecase: 'A delivery van chooses between routes with different tolls and fuel costs. The shortest route in kilometres may be the most expensive. The dispatcher wants the cheapest route.',
      metaphor: {
        name: 'The toll roads',
        claim: 'Every road has a price. You keep a list of trips sorted by what you have spent so far, and always continue the cheapest unfinished trip.',
        mapping: [
          ['a trip so far', 'partial path', 'pick the cheapest'],
          ['tolls paid', 'path cost g', 'add the edge cost'],
          ['the list of trips', 'priority queue', 'insert by cost'],
          ['arriving', 'goal test', 'stop when popped']
        ],
        widget: 'ucs-queue',
        lab: {
          title: 'Always continue the cheapest trip',
          tryText: 'Step the search. The queue reorders itself every time a cheaper path appears.',
          notice: 'A node can be reached twice. The cheaper path replaces the dearer one.'
        }
      },
      idea: `<p><strong>Uniform cost search</strong> expands the frontier node with the lowest path cost g. The frontier is a priority queue keyed by g. It is Dijkstra's algorithm in the language of search.</p>
<p>The guarantee is optimality for non-negative edge costs. When a goal is popped from the queue, no cheaper path to it can exist, because every unfinished path already costs at least as much.</p>
<p>UCS is slower than BFS on unweighted graphs, because it does the same work plus a priority queue. Its memory is still large, since it stores every generated path.</p>`,
      lecture: {
        ref: '9.6',
        source: 'Transcript, Uniform cost search',
        text: 'The lecturer orders the frontier by accumulated cost. "We always expand the node with the smallest cost so far. That is why the first goal we remove must be the cheapest."'
      },
      mechanics: {
        formula: 'pop the node with the smallest g, expand, push with g + cost',
        symbols: [
          ['g', 'the cost of the path from the start'],
          ['cost', 'the cost of one edge'],
          ['pop', 'remove the minimum from the priority queue']
        ],
        worked: 'Start S with edges to A cost 1 and B cost 4. Pop S, push A at 1 and B at 4. Pop A, push goal at 6. Queue holds B at 4 and goal at 6. Pop B, push goal at 5. Pop goal at 5. The route through B is cheaper than the direct one.'
      },
      mechanism: {
        widget: 'ucs-queue',
        lab: {
          title: 'Insert and reorder',
          tryText: 'Add a cheaper edge and watch the queue order change. Step until the goal is popped.',
          notice: 'The goal is not finished when it is generated. It is finished when it is popped.'
        }
      },
      breaks: 'Negative edge costs break the guarantee, because a later path can undercut one already settled. The frontier can hold many paths to the same state, which wastes memory unless a better-path check is used. On a large map, UCS explores in every direction, including away from the goal.',
      check: [
        {
          q: 'What does UCS use to order the frontier?',
          options: ['Depth', 'Path cost so far', 'The number of edges', 'A random key'],
          answer: 1,
          explain: 'The priority is g, the cost accumulated from the start.'
        },
        {
          q: 'When is a goal guaranteed optimal in UCS?',
          options: ['When it is generated', 'When it is popped from the frontier', 'When the queue is empty', 'When the heuristic is zero'],
          answer: 1,
          explain: 'A cheaper path could still be in the queue, so the goal is settled only when it is popped.'
        }
      ],
      connection: {
        prompt: 'UCS differs from BFS in one respect. What is it?',
        a: 'BFS', b: 'UCS',
        options: [
          { label: 'The frontier is ordered by cost instead of insertion', ok: true },
          { label: 'The successor function', ok: false },
          { label: 'The goal test', ok: false },
          { label: 'The state definition', ok: false }
        ],
        explain: 'The loop is the same. Only the priority changes, which makes UCS optimal on weighted graphs.'
      },
      recap: [
        'UCS expands the cheapest partial path first.',
        'It is optimal for non-negative costs.',
        'It explores in all directions, which costs memory and time.'
      ],
      now: 'You can now trace UCS and explain why a goal is settled only when popped.'
    },
    {
      id: 'astar',
      title: 'A star: add a rumour',
      prereqs: ['ucs'],
      usecase: 'A robot courier must reach a charging bay on a large floor plan. Searching outward in every direction is wasteful. A map gives a straight-line distance to the bay, which is a guess at the remaining cost.',
      metaphor: {
        name: 'The hike with a pub rumour',
        claim: 'At each village you know how far you have walked and someone tells you how far the pub is. You pick the village with the smallest total, walk on, and ask again.',
        mapping: [
          ['distance walked', 'cost so far g', 'read the total'],
          ['the rumour', 'heuristic h', 'read the estimate'],
          ['walked plus rumour', 'f = g + h', 'pick the smallest'],
          ['a lying rumour', 'inadmissible heuristic', 'break the guarantee']
        ],
        widget: 'astar-map',
        lab: {
          title: 'Pick the next village',
          tryText: 'Choose the village with the smallest walked-plus-rumour total. No letters, just numbers.',
          notice: 'The rumour pulls the search toward the pub without ignoring the distance already walked.'
        }
      },
      idea: `<p><strong>A star</strong> orders the frontier by f = g + h. The cost so far g keeps the search honest. The <strong>heuristic</strong> h estimates the remaining cost and pulls the search toward the goal.</p>
<p>When h is zero, A star becomes UCS. When h is exact, A star walks straight to the goal without expanding anything else. Real heuristics sit between those extremes.</p>
<p>The efficiency gain depends on the heuristic. A weak heuristic explores almost as much as UCS. A strong one cuts the search area to a narrow band. The next concept explains when the shortcut is safe.</p>`,
      lecture: {
        ref: '9.7',
        source: 'Transcript, A star',
        text: 'The lecturer combines the cost so far with an estimate of the remaining distance. "We order by f equal to g plus h. A star is uniform cost search plus a guess about the future."'
      },
      mechanics: {
        formula: 'f(n) = g(n) + h(n)',
        symbols: [
          ['f', 'the priority of the node'],
          ['n', 'the node being scored'],
          ['g', 'the cost from the start to n'],
          ['h', 'the estimated cost from n to the goal']
        ],
        worked: 'A node has cost so far 4 and a heuristic of 7, so f = 11. Another has cost 6 and a heuristic of 3, so f = 9. A star expands the second node first, even though it is dearer so far, because its total looks cheaper.'
      },
      mechanism: {
        widget: 'astar-map',
        lab: {
          title: 'Name the parts',
          tryText: 'Turn on the panel labels, then adjust the rumour honesty. Watch which node is expanded next.',
          notice: 'The priority is a sum. Changing either part changes the order.'
        }
      },
      sandbox: {
        widget: 'astar-map',
        lab: {
          title: 'Design a heuristic',
          tryText: 'Set the rumour above and below the true distance. Compare expansions with UCS and find where the cheapest path breaks.',
          notice: 'A heuristic that lies can still find a path, but the path may not be cheapest.'
        }
      },
      breaks: 'A star is only optimal when the heuristic never overestimates the true remaining cost. It also stores every generated node, so memory can still be a problem. A very strong heuristic can make the search fast and the path slightly worse if it is not admissible.',
      check: [
        {
          q: 'What does f equal?',
          options: ['g times h', 'g plus h', 'h minus g', 'g divided by h'],
          answer: 1,
          explain: 'A star orders by the sum of cost so far and estimated remaining cost.'
        },
        {
          q: 'What happens when h is zero everywhere?',
          options: ['A star becomes BFS', 'A star becomes UCS', 'A star becomes greedy search', 'A star fails'],
          answer: 1,
          explain: 'With no heuristic, the priority is g alone, which is uniform cost search.'
        }
      ],
      connection: {
        prompt: 'A star relates to UCS how?',
        a: 'UCS', b: 'A star',
        options: [
          { label: 'UCS is A star with h equal to zero', ok: true },
          { label: 'A star is UCS with negative costs', ok: false },
          { label: 'They order the frontier identically', ok: false },
          { label: 'A star ignores g', ok: false }
        ],
        explain: 'The heuristic term is the only addition. Setting it to zero recovers UCS exactly.'
      },
      recap: [
        'A star orders the frontier by g plus h.',
        'The heuristic estimates the remaining cost.',
        'Optimality needs a heuristic that does not overestimate.'
      ],
      now: 'You can now trace A star and explain the role of each term.'
    },
    {
      id: 'heuristics',
      title: 'Admissible heuristics',
      prereqs: ['astar'],
      usecase: 'A navigation app uses straight-line distance to the destination. That distance can never be longer than the road route, so the app can trust it. A heuristic based on yesterday\'s traffic cannot give the same guarantee.',
      metaphor: {
        name: 'The optimistic rumour',
        claim: 'A rumour that says the pub is closer than it is makes you walk with confidence. A rumour that says it is farther makes you detour, and you may end up paying more.',
        mapping: [
          ['an optimistic rumour', 'admissible heuristic', 'check h ≤ true cost'],
          ['a pessimistic rumour', 'overestimate', 'watch the path worsen'],
          ['the true road', 'actual remaining cost', 'compare']
        ],
        widget: 'astar-map',
        lab: {
          title: 'Check the rumour against the truth',
          tryText: 'Set a rumour below the true distance, then above it. Compare the path with the true cheapest.',
          notice: 'Above the true distance, the search can commit to an expensive route.'
        }
      },
      idea: `<p>A heuristic is <strong>admissible</strong> when it never overestimates the true cost to the goal. Straight-line distance is admissible for road travel, because no road is shorter than the straight line. The number of misplaced tiles is admissible for the sliding puzzle, because each move fixes at most one tile.</p>
<p>A star with an admissible heuristic is optimal. The proof works by contradiction: if the search returned a path dearer than the true optimum, the cheaper path would still have a node in the frontier with f no greater than the optimum, and that node would have been expanded first.</p>
<p>Consistency is a stronger condition: h must not drop by more than the edge cost between neighbours. Consistent heuristics are admissible and allow the search to skip re-expansion of nodes.</p>`,
      lecture: {
        ref: '9.7',
        source: 'Transcript, A star',
        text: 'The lecturer states the condition for optimality. "The heuristic must never be larger than the real cost to the goal. If it overestimates, A star can return a path that is not the cheapest."'
      },
      mechanics: {
        formula: 'admissible when h(n) ≤ true cost from n to the goal',
        symbols: [
          ['h(n)', 'the heuristic estimate at node n'],
          ['true cost', 'the cheapest actual cost from n to the goal']
        ],
        worked: 'A node is 5 steps from the goal by the true route. A heuristic of 4 is admissible. A heuristic of 6 is not. With the 6, the search may expand another node first and settle on a dearer path before the cheaper one is discovered.'
      },
      mechanism: {
        widget: 'astar-map',
        lab: {
          title: 'Break admissibility',
          tryText: 'Raise one node\'s estimate above its true cost. Run the search and compare the returned path.',
          notice: 'One overestimate is enough to lose the guarantee, though the result may still be good on most maps.'
        }
      },
      breaks: 'Admissibility is a guarantee about the true cost, which is often unknown. In practice heuristics are designed from relaxed problems and checked by argument. A consistent heuristic is easier to use but harder to find. Weighted A star deliberately overestimates to trade optimality for speed.',
      check: [
        {
          q: 'What makes a heuristic admissible?',
          options: ['It is fast to compute', 'It never overestimates the true remaining cost', 'It is learned from data', 'It is zero'],
          answer: 1,
          explain: 'The estimate must be a lower bound on the real cost.'
        },
        {
          q: 'What happens to A star optimality when h overestimates?',
          options: ['It is preserved', 'It can be lost', 'The search fails', 'The heuristic becomes consistent'],
          answer: 1,
          explain: 'An overestimate can make a dear path look cheap and cause the search to settle it early.'
        }
      ],
      connection: {
        prompt: 'Straight-line distance is admissible for road maps. Why?',
        a: 'Straight line', b: 'Road route',
        options: [
          { label: 'No road can be shorter than the straight line', ok: true },
          { label: 'Roads are always straight', ok: false },
          { label: 'The distance is measured in time', ok: false },
          { label: 'It ignores the goal', ok: false }
        ],
        explain: 'The straight line is a lower bound on any path through the road network, so it never overestimates.'
      },
      recap: [
        'An admissible heuristic never overestimates the remaining cost.',
        'A star is optimal with an admissible heuristic.',
        'Consistency is stronger and allows fewer re-expansions.'
      ],
      now: 'You can now test a heuristic for admissibility and explain what the guarantee buys.'
    },
    {
      id: 'race',
      title: 'Comparing the searches',
      prereqs: ['heuristics'],
      usecase: 'A team must choose a search for a route planner with millions of nodes. BFS is simple, UCS is optimal, A star is faster with a good heuristic. The choice depends on the map and the memory budget.',
      metaphor: {
        name: 'Three couriers',
        claim: 'One courier takes every street in rings. One always finishes the cheapest trip. One listens to rumours. They reach the same address with different effort.',
        mapping: [
          ['courier', 'search algorithm', 'switch the policy'],
          ['streets walked', 'nodes expanded', 'count expansions'],
          ['fare paid', 'path cost', 'compare the result']
        ],
        widget: 'race',
        lab: {
          title: 'Race them on one graph',
          tryText: 'Run all three and compare expansions, path cost and frontier size.',
          notice: 'The cheapest path is the same for UCS and A star. The work is not.'
        }
      },
      idea: `<p>The three searches differ in what they guarantee and what they cost. BFS is complete and optimal only for equal costs, with memory exponential in depth. UCS is optimal for non-negative costs and explores in every direction. A star is optimal with an admissible heuristic and focuses the search toward the goal.</p>
<p>Expansions are the practical measure of work. On a uniform grid, UCS expands a circle around the start. A star with a good heuristic expands an ellipse that stretches toward the goal. The difference grows with the size of the map.</p>
<p>No algorithm wins everywhere. A bad heuristic makes A star slower than UCS because of the extra computation. A graph with equal costs makes BFS the simplest correct choice.</p>`,
      lecture: {
        ref: '9.7',
        source: 'Transcript, A star',
        text: 'The lecturer compares the number of nodes each method expands on the same map and notes that the cheapest path is the same while the work differs.'
      },
      mechanics: {
        formula: 'cost(BFS) = steps, cost(UCS) = cheapest, cost(A star) = cheapest if h is admissible',
        symbols: [
          ['steps', 'the number of edges in the path'],
          ['cheapest', 'the minimum total edge cost'],
          ['h', 'the heuristic estimate'],
          ['admissible', 'the heuristic never overestimates']
        ],
        worked: 'On a 20 by 20 grid, BFS expands about 400 nodes. UCS with varied costs expands more, because it follows cheap detours. A star with a straight-line heuristic expands about 120. All three reach the goal. Only UCS and A star return the cheapest path.'
      },
      mechanism: {
        widget: 'race',
        lab: {
          title: 'Change the heuristic strength',
          tryText: 'Weaken the heuristic from exact to zero. Watch A star degrade toward UCS.',
          notice: 'The heuristic strength controls the gap between A star and UCS. At zero, the gap closes.'
        }
      },
      breaks: 'The comparison assumes the heuristic costs nothing to compute. An expensive heuristic can erase the gain. Memory is often the binding constraint, and none of these methods is designed for huge graphs. Real systems use bidirectional or hierarchical search.',
      check: [
        {
          q: 'Which method returns the cheapest path on a weighted graph with an admissible heuristic?',
          options: ['BFS', 'UCS and A star', 'Only BFS', 'None'],
          answer: 1,
          explain: 'Both are optimal under their conditions. BFS is not, because it counts steps.'
        },
        {
          q: 'What happens to A star as the heuristic approaches zero?',
          options: ['It becomes BFS', 'It becomes UCS', 'It becomes greedy', 'It stops working'],
          answer: 1,
          explain: 'With no heuristic, the priority is g, which is UCS.'
        }
      ],
      connection: {
        prompt: 'Which earlier idea explains why A star can expand fewer nodes?',
        a: 'A star', b: 'Reason',
        options: [
          { label: 'The heuristic focuses the frontier toward the goal', ok: true },
          { label: 'It skips the goal test', ok: false },
          { label: 'It uses a smaller state space', ok: false },
          { label: 'It ignores costs', ok: false }
        ],
        explain: 'A good estimate deprioritises nodes far from the goal, so fewer of them are expanded.'
      },
      recap: [
        'BFS counts steps, UCS minimises cost, A star uses both.',
        'A star saves expansions when the heuristic is informative.',
        'The cheapest path can be the same while the work differs by an order of magnitude.'
      ],
      now: 'You can now choose a search from the graph, the costs and the heuristic you have.'
    }
  ],
  test: [
    {
      q: 'Which frontier policy does BFS use?',
      options: ['LIFO', 'FIFO', 'Lowest cost', 'Highest heuristic'],
      answer: 1,
      explain: 'First in, first out expands level by level.'
    },
    {
      q: 'BFS is optimal under which condition?',
      options: ['All edge costs are equal', 'Costs are negative', 'The graph is infinite', 'A heuristic is available'],
      answer: 0,
      explain: 'Equal costs make fewer steps equivalent to lower cost.'
    },
    {
      q: 'What does UCS order by?',
      options: ['Depth', 'g', 'h', 'g plus h'],
      answer: 1,
      explain: 'Uniform cost search expands the smallest accumulated cost.'
    },
    {
      q: 'When is a goal optimal in UCS?',
      options: ['When generated', 'When popped', 'When inserted', 'When the queue is empty'],
      answer: 1,
      explain: 'A cheaper path may still be waiting, so the goal is settled when it leaves the frontier.'
    },
    {
      q: 'What is f in A star?',
      options: ['g minus h', 'g plus h', 'g times h', 'h only'],
      answer: 1,
      explain: 'The priority combines cost so far and estimated remaining cost.'
    },
    {
      q: 'A star with h equal to zero is which algorithm?',
      options: ['BFS', 'UCS', 'Greedy search', 'Depth-first search'],
      answer: 1,
      explain: 'The priority becomes g alone, which is UCS.'
    },
    {
      q: 'An admissible heuristic does what?',
      options: ['Never overestimates the remaining cost', 'Always underestimates the path length', 'Is always zero', 'Guarantees a unique path'],
      answer: 0,
      explain: 'It is a lower bound on the true cost to the goal.'
    },
    {
      q: 'Which cost does BFS ignore?',
      options: ['The number of steps', 'The edge weights', 'The goal test', 'The start state'],
      answer: 1,
      explain: 'BFS counts edges and ignores weights, which is why it can return an expensive path.'
    }
,
    {
      type: 'numeric',
      q: 'A node has path cost g = 7 and heuristic estimate h = 4. What is its A star priority f?',
      answer: 11,
      tolerance: 0.001,
      explain: 'A star orders by f = g + h, so f = 7 + 4 = 11.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of uniform cost search.',
      items: [
        'Push the start state with cost zero',
        'Pop the state with the lowest path cost',
        'Test whether it is a goal when it is popped',
        'Push each successor with its updated cost',
        'Stop when the goal is popped'
      ],
      explain: 'The goal test happens on pop, not on push, because a cheaper path may still be found.'
    },
    {
      type: 'error',
      q: 'A team describes A star. One step is wrong. Which one?',
      steps: [
        'Order the frontier by g plus h.',
        'Use a heuristic that never overestimates the remaining cost.',
        'Stop as soon as the goal is added to the frontier.',
        'Reopen a node when a cheaper path to it is found.'
      ],
      answer: 2,
      explain: 'A star stops when the goal is popped. A goal on the frontier may still be reached more cheaply by another path.'
    },
    {
      type: 'short',
      q: 'Why is BFS optimal only when all edge costs are equal?',
      rubric: [
        'Says BFS expands by depth, not by cost',
        'Notes that a shallow path can be more expensive',
        'Names UCS as the cost-aware alternative'
      ],
      model: 'BFS finds the path with the fewest edges. That is the cheapest path only when every edge costs the same. With unequal costs a longer path can cost less, so a cost-ordered search such as UCS is needed.',
      explain: 'BFS optimises depth. Optimality in cost requires ordering by cost.'
    }
  ],
  connections: [
    {
      prompt: 'Match the algorithm to its guarantee.',
      a: 'Algorithm', b: 'Guarantee',
      options: [
        { label: 'UCS: cheapest path with non-negative costs', ok: true },
        { label: 'BFS: cheapest path with any costs', ok: false },
        { label: 'A star: cheapest path with any heuristic', ok: false },
        { label: 'UCS: fewest steps', ok: false }
      ],
      explain: 'UCS is optimal for non-negative costs. A star needs an admissible heuristic. BFS needs equal costs.'
    }
  ],
  pairs: [
    {
      a: 'BFS', b: 'UCS',
      claim: 'Both are optimal when every edge cost is positive.',
      same: false,
      explain: 'UCS is optimal with positive costs. BFS is optimal only when all costs are equal.'
    },
    {
      a: 'A star', b: 'UCS',
      claim: 'Both order the frontier by g plus h.',
      same: false,
      explain: 'UCS orders by g. A star adds the heuristic estimate h.'
    },
    {
      a: 'An admissible heuristic', b: 'A consistent heuristic',
      claim: 'Both guarantee an optimal goal with tree search.',
      same: true,
      explain: 'Consistency implies admissibility. With tree search, an admissible heuristic is enough for optimality.'
    }
  ],
  map: {
    nodes: [
      { id: 'framework', label: 'Framework', x: 10, y: 24 },
      { id: 'bfs', label: 'BFS', x: 30, y: 16 },
      { id: 'ucs', label: 'UCS', x: 50, y: 26 },
      { id: 'astar', label: 'A star', x: 72, y: 18 },
      { id: 'h', label: 'Heuristic', x: 86, y: 46 },
      { id: 'cost', label: 'Cost', x: 56, y: 64 }
    ],
    edges: [
      ['framework', 'bfs', 'FIFO frontier'],
      ['framework', 'ucs', 'cost frontier'],
      ['ucs', 'astar', 'adds h'],
      ['astar', 'h', 'needs admissible'],
      ['cost', 'ucs', 'orders by g']
    ]
  }
});
