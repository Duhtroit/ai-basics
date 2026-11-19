AIM.registerUnit({
  n: 5, hue: 155, short: 'Neural nets',
  title: 'Networks of small decisions',
  weeks: 'Week 5',
  promise: 'Build a network from single neurons, send a signal through it, then send the blame back.',
  minutes: 42,
  lectures: ['5.0 Overview', '5.1 Warm up', '5.2 Backpropagation part 1', '5.3 Backpropagation part 2', '5.4 Optimization'],
  concepts: [
    {
      id: 'neurons',
      title: 'A neuron is a weighted vote',
      prereqs: ['logistic-model'],
      usecase: 'A bank decides whether to approve a loan from income, existing debt and repayment history. No single number settles it. A loan officer weighs the three, adds them up, and decides.',
      metaphor: {
        name: 'The committee vote',
        claim: 'Three advisers each have a different opinion and a different amount of trust. The chair adds the trusted opinions and decides when the total passes a bar.',
        mapping: [
          ['an adviser', 'input feature', 'set the input'],
          ['trust in the adviser', 'weight', 'change the weight'],
          ['the bar for approval', 'bias', 'shift the threshold'],
          ['the decision', 'activation', 'read the output']
        ],
        widget: 'forward-pass',
        lab: {
          title: 'Weigh three votes',
          tryText: 'Change each weight and the bias. Watch the neuron fire or stay quiet.',
          notice: 'The weight decides how much an input matters. The bias decides how hard it is to fire at all.'
        }
      },
      idea: `<p>A <strong>neuron</strong> computes a weighted sum of its inputs, adds a bias, and passes the result through an <strong>activation function</strong>. With a sigmoid activation it is exactly logistic regression. With a rectified linear unit it outputs the positive part of the sum.</p>
<p>The <strong>weight</strong> says how much an input matters. A negative weight means the input votes against firing. The bias shifts the bar. The activation decides the shape of the output: a probability, a bounded value, or a value that can be any positive number.</p>
<p>One neuron can only draw one boundary. The power of a network comes from combining many neurons, which is the next concept.</p>`,
      lecture: {
        ref: '5.1',
        source: 'Transcript, Neural network warm up',
        text: 'The lecturer builds a single unit from the logistic model. "A neuron takes inputs, multiplies each by a weight, adds them, and applies a non-linearity. That is the whole unit."'
      },
      mechanics: {
        formula: 'a = g(w·x + b)',
        symbols: [
          ['a', 'the activation, or output of the neuron'],
          ['g', 'the activation function'],
          ['w', 'the weight vector'],
          ['x', 'the input vector'],
          ['b', 'the bias']
        ],
        worked: 'Inputs 2 and 3, weights 0.5 and -1, bias 1. The sum is 1 + 3 - 3 = 1. With a sigmoid, the output is 0.73. With ReLU, the output is 1. The same weighted sum gives different behaviour depending on g.'
      },
      mechanism: {
        widget: 'forward-pass',
        lab: {
          title: 'Switch the activation',
          tryText: 'Compare sigmoid, ReLU and tanh on the same weighted sum. Then set a weight to zero.',
          notice: 'A zero weight removes the input from the decision. Negative weights invert it.'
        }
      },
      breaks: 'A single neuron cannot represent exclusive-or, because one linear boundary cannot separate the classes. A saturating activation such as sigmoid also suffers from vanishing gradients in deep stacks. ReLU avoids saturation on the positive side but can produce dead units that never activate again.',
      check: [
        {
          q: 'What does a negative weight do?',
          options: ['Ignores the input', 'Pushes the neuron away from firing', 'Doubles the input', 'Changes the activation function'],
          answer: 1,
          explain: 'A negative weight subtracts from the weighted sum, so that input votes against the positive class.'
        },
        {
          q: 'Which part shifts the firing threshold?',
          options: ['The weight', 'The bias', 'The input', 'The activation'],
          answer: 1,
          explain: 'The bias is added to the sum, so it moves the point where the activation crosses its decision value.'
        }
      ],
      connection: {
        prompt: 'A neuron with a sigmoid is which earlier model?',
        a: 'Sigmoid neuron', b: 'Earlier model',
        options: [
          { label: 'Logistic regression', ok: true },
          { label: 'Linear regression', ok: false },
          { label: 'A decision tree', ok: false },
          { label: 'A constraint solver', ok: false }
        ],
        explain: 'The weighted sum plus sigmoid is exactly the logistic model. A network stacks many of them.'
      },
      recap: [
        'A neuron is a weighted sum, a bias and an activation.',
        'Weights set the importance and direction of each input.',
        'One neuron draws one boundary, which limits what it can solve.'
      ],
      now: 'You can now compute a neuron by hand and explain the role of each part.'
    },
    {
      id: 'forward-pass',
      title: 'Layers and the forward pass',
      prereqs: ['neurons'],
      usecase: 'A digit recogniser reads 784 pixel values. The label depends on combinations of pixels: loops, strokes, intersections. One weighted sum cannot capture those combinations, but a stack of them can.',
      metaphor: {
        name: 'The factory line',
        claim: 'Raw material enters at one end. Each station transforms it and passes it on. The last station stamps the product with a label.',
        mapping: [
          ['raw material', 'input features', 'set the image'],
          ['a station', 'layer', 'inspect the values'],
          ['the stamp', 'output', 'read the prediction']
        ],
        widget: 'forward-pass',
        lab: {
          title: 'Send a signal through three layers',
          tryText: 'Click a neuron to see its weighted sum. Follow the numbers from left to right.',
          notice: 'Each layer rebuilds the signal. Later layers see combinations, not raw pixels.'
        }
      },
      idea: `<p>A <strong>layer</strong> is a row of neurons that all read the same input and produce their own activations. A network stacks layers. The <strong>forward pass</strong> computes each layer in order, feeding the output of one into the next.</p>
<p>With a non-linear activation between layers, the network can represent curved boundaries and interactions. Without it, stacked linear layers collapse into one linear map, no matter how deep the stack.</p>
<p>The final layer matches the task: one sigmoid for binary classification, a softmax over classes for multiclass, or a linear output for regression. The forward pass is the same computation used at training time and at inference.</p>`,
      lecture: {
        ref: '4.2',
        source: 'Transcript, The forward process of neural networks',
        text: 'The lecturer traces values from the input layer through the hidden layer to the output. "At each layer we compute the weighted sum, apply the activation, and pass the result forward."'
      },
      mechanics: {
        formula: 'a⁽ˡ⁾ = g(W⁽ˡ⁾ a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)',
        symbols: [
          ['a⁽ˡ⁾', 'the activations of layer l'],
          ['W⁽ˡ⁾', 'the weight matrix from layer l-1 to layer l'],
          ['b⁽ˡ⁾', 'the bias vector of layer l'],
          ['g', 'the activation function']
        ],
        worked: 'Two inputs (1, 2), a hidden layer with weights (1, -1) and (0.5, 0.5), biases zero, ReLU. Hidden unit one gets 1 - 2 = -1, which ReLU turns into 0. Hidden unit two gets 0.5 + 1 = 1.5. The output layer reads (0, 1.5) instead of the raw inputs.'
      },
      mechanism: {
        widget: 'forward-pass',
        lab: {
          title: 'Remove the non-linearity',
          tryText: 'Set every activation to linear. Compare the boundary with the non-linear version.',
          notice: 'A deep linear stack is still one linear map. Depth only helps with a bend between layers.'
        }
      },
      sandbox: {
        widget: 'tiny-trainer',
        lab: {
          title: 'Train a small network on two circles',
          tryText: 'Set the number of hidden units and train. Watch the boundary bend around the inner class.',
          notice: 'More hidden units can express a tighter boundary, and more of them can also overfit.'
        }
      },
      breaks: 'Depth multiplies the effect of poor initialisation: signals shrink or explode as they pass through layers. The forward pass is also expensive at inference for large models. And a network can fit the training set while learning a boundary that fails on a small shift in the input distribution.',
      check: [
        {
          q: 'What happens if every activation is linear?',
          options: ['The network becomes deeper', 'The whole stack collapses to one linear map', 'The network cannot train', 'The output becomes a probability'],
          answer: 1,
          explain: 'A composition of linear functions is linear. Non-linearity between layers is what adds capacity.'
        },
        {
          q: 'What does a hidden layer receive?',
          options: ['Raw inputs only', 'The activations of the previous layer', 'The labels', 'The loss'],
          answer: 1,
          explain: 'Each layer reads the previous layer output, which is why the computation is a chain.'
        }
      ],
      connection: {
        prompt: 'A deep network is still which family of model?',
        a: 'Deep network', b: 'Paradigm',
        options: [
          { label: 'Reflex: one input, one output, no search', ok: true },
          { label: 'State: it plans a path', ok: false },
          { label: 'Variable: it assigns values', ok: false },
          { label: 'Logic: it derives facts', ok: false }
        ],
        explain: 'Depth adds capacity but not memory or planning. The forward pass is still a fixed computation.'
      },
      recap: [
        'Layers stack neurons, and each layer reads the previous one.',
        'Non-linear activations stop the stack collapsing into one linear map.',
        'The forward pass is the same at training and inference.'
      ],
      now: 'You can now trace a forward pass through two layers and explain why non-linearity matters.'
    },
    {
      id: 'backprop',
      title: 'Backpropagation: send the blame back',
      prereqs: ['forward-pass'],
      usecase: 'A network predicts 0.2 when the label is 1. Thousands of weights contributed to that error. Each one needs to know how much to change, and computing that separately for every weight would be impossibly slow.',
      metaphor: {
        name: 'The kitchen brigade',
        claim: 'A dish comes back cold. The head chef works backward through the line: the pass, the sauce station, the grill. Each station learns how much of the fault was its own.',
        mapping: [
          ['the cold dish', 'output error', 'measure the loss'],
          ['the head chef', 'output layer gradient', 'start at the end'],
          ['each station', 'layer', 'pass blame backward'],
          ['the correction', 'weight update', 'change the weight']
        ],
        widget: 'blame-flow',
        lab: {
          title: 'Trace one error backward',
          tryText: 'Press step. The error signal moves from the output layer back to the input, and each weight receives a share.',
          notice: 'One forward pass plus one backward pass gives every gradient. Nothing is computed twice.'
        }
      },
      idea: `<p><strong>Backpropagation</strong> computes the gradient of the loss with respect to every weight. It applies the <strong>chain rule</strong> from the output layer backward. Each layer multiplies the incoming error signal by its local derivative and passes the result to the layer before it.</p>
<p>The cost is roughly the same as one forward pass. That efficiency is why deep networks became practical: a model with millions of weights can be trained with one backward sweep per batch.</p>
<p>The result is a gradient per weight. An optimiser such as gradient descent then updates each weight in the direction that reduces the loss. Backpropagation computes the direction; it does not choose the step size.</p>`,
      lecture: {
        ref: '5.2',
        source: 'Transcript, Backpropagation part 1',
        text: 'The lecturer derives the chain rule layer by layer. "We already know the error at the output. We propagate it backward, and at each layer we multiply by the derivative of that layer."'
      },
      mechanics: {
        formula: '∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w',
        symbols: [
          ['L', 'the loss'],
          ['w', 'a weight'],
          ['a', 'the activation'],
          ['z', 'the weighted sum before activation'],
          ['∂', 'a partial derivative']
        ],
        worked: 'A sigmoid output a = 0.2 with target 1 gives log-loss derivative a - y = -0.8 with respect to z. If the hidden activation feeding it is 0.5, the gradient for that weight is -0.8 times 0.5 = -0.4. The update moves the weight up by η times 0.4.'
      },
      mechanism: {
        widget: 'blame-flow',
        lab: {
          title: 'Change one weight and watch the blame',
          tryText: 'Increase a hidden weight and see how the error signal at the output changes.',
          notice: 'A weight that contributes more to the output receives a larger gradient, not a fixed share.'
        }
      },
      breaks: 'Backpropagation needs the activation to be differentiable. A hard step or a non-differentiable argmax blocks the gradient. Very deep stacks suffer vanishing or exploding gradients, because the product of many derivatives shrinks or grows. Memory also grows with depth, since activations must be stored for the backward pass.',
      check: [
        {
          q: 'What does backpropagation compute?',
          options: ['The loss value', 'The gradient of the loss for every weight', 'The learning rate', 'The number of layers'],
          answer: 1,
          explain: 'It applies the chain rule backward to obtain one gradient per weight.'
        },
        {
          q: 'Why is backpropagation efficient?',
          options: ['It skips the forward pass', 'Its cost is about the same as one forward pass', 'It uses fewer weights', 'It avoids derivatives'],
          answer: 1,
          explain: 'One backward sweep reuses intermediate values from the forward pass to get every gradient at once.'
        }
      ],
      connection: {
        prompt: 'Backpropagation supplies something to which earlier algorithm?',
        a: 'Backpropagation', b: 'Optimiser',
        options: [
          { label: 'The gradient used by gradient descent', ok: true },
          { label: 'The learning rate', ok: false },
          { label: 'The normal equation', ok: false },
          { label: 'The threshold', ok: false }
        ],
        explain: 'Backpropagation computes the gradient. Gradient descent or a variant uses it to update the weights.'
      },
      recap: [
        'Backpropagation applies the chain rule from output to input.',
        'One backward pass yields every weight gradient at roughly forward-pass cost.',
        'It computes direction; the optimiser chooses the step.'
      ],
      now: 'You can now explain how an error at the output reaches a weight in the first layer.'
    },
    {
      id: 'training-network',
      title: 'The training loop',
      prereqs: ['backprop'],
      usecase: 'A network starts with random weights and predicts nonsense. After a few hundred passes over the data it separates two spirals that no straight line could split. Nothing changed except the weights.',
      metaphor: {
        name: 'Tuning a hundred knobs',
        claim: 'A sound engineer turns many knobs, listens, and turns them again. Each pass through the song gives a little more information about which way to turn.',
        mapping: [
          ['one pass through the song', 'epoch', 'run an epoch'],
          ['the listening', 'loss on a batch', 'read the loss'],
          ['the turn', 'weight update', 'apply the gradient']
        ],
        widget: 'tiny-trainer',
        lab: {
          title: 'Train until the loss flattens',
          tryText: 'Set the learning rate and press train. Watch the loss curve and the boundary move together.',
          notice: 'The boundary changes because the weights change. The loss is the only signal telling them where to go.'
        }
      },
      idea: `<p>Training repeats a loop. Take a batch of cases, run the forward pass, compute the loss, run backpropagation, and update every weight. One <strong>epoch</strong> is one pass over the training set. Small batches give noisy gradients that are cheap to compute; large batches give stable gradients that cost more memory.</p>
<p>The learning rate controls the step. A schedule lowers it over time: large steps early to move quickly, small steps late to settle. Momentum accumulates past gradients to push through flat regions.</p>
<p>Watch two curves, training loss and validation loss. Both falling means the model is learning. Training falling while validation rises means overfitting. Both flat and high means the model or the features are too weak.</p>`,
      lecture: {
        ref: '5.4',
        source: 'Transcript, Optimization',
        text: 'The lecturer describes the loop and its settings. "We compute the gradient, update the weights, and repeat. The learning rate and the batch size decide how stable that process is."'
      },
      mechanics: {
        formula: 'w ← w - η ∂L/∂w, repeated over epochs',
        symbols: [
          ['w', 'a weight'],
          ['η', 'the learning rate'],
          ['∂L/∂w', 'the gradient from backpropagation'],
          ['epoch', 'one pass over the training set']
        ],
        worked: 'A network with 1,000 weights, batches of 32 and 10 epochs sees the data 10 times and performs 10 × (n/32) updates. If the training loss falls from 2.3 to 0.4 while validation stays at 1.1, the model is fitting the training set and not generalising.'
      },
      mechanism: {
        widget: 'tiny-trainer',
        lab: {
          title: 'Three failure modes',
          tryText: 'Try a tiny learning rate, a huge one, and a long run with too many hidden units. Compare the loss curves.',
          notice: 'Slow, divergent and overfit look different on the curve. The curve tells you which fix to try.'
        }
      },
      breaks: 'Averaging over batches adds noise, so the loss trace jumps. A single bad batch can dominate an update. Schedules and adaptive optimisers reduce the sensitivity, but they add settings of their own. Training longer always lowers training loss eventually, even when it stops helping.',
      check: [
        {
          q: 'What is an epoch?',
          options: ['One weight update', 'One pass over the training set', 'One hidden layer', 'One validation run'],
          answer: 1,
          explain: 'An epoch covers the training data once, in one or more batches.'
        },
        {
          q: 'Training loss falls, validation loss rises. What is happening?',
          options: ['Underfitting', 'Overfitting', 'The learning rate is zero', 'The data is scaled'],
          answer: 1,
          explain: 'The model is fitting training-specific detail. The validation curve is the honest signal.'
        }
      ],
      connection: {
        prompt: 'Which earlier pair of ideas does the training loop combine?',
        a: 'Backpropagation and descent', b: 'Result',
        options: [
          { label: 'Gradients turned into weight updates', ok: true },
          { label: 'A threshold and a metric', ok: false },
          { label: 'A split and a fold', ok: false },
          { label: 'A boundary and a label', ok: false }
        ],
        explain: 'Backpropagation gives the gradient, descent applies it. The loop is the same idea as unit 3, with more parameters.'
      },
      recap: [
        'Training loops over batches, computing loss, gradient and update.',
        'An epoch is one pass over the training data.',
        'Training and validation curves together diagnose underfit, overfit and divergence.'
      ],
      now: 'You can now read a loss curve and name the likely fix.'
    },
    {
      id: 'depth',
      title: 'Why depth helps',
      prereqs: ['training-network'],
      usecase: 'A network must decide whether a point lies inside a ring. One hidden layer can approximate the ring, but it needs many units. Two layers can build the ring from simpler pieces with fewer units.',
      metaphor: {
        name: 'Committees of committees',
        claim: 'A first committee settles simple questions. A second committee reads their answers and settles questions about the answers. Each level composes the level below.',
        mapping: [
          ['a simple question', 'first-layer feature', 'inspect a unit'],
          ['a question about answers', 'second-layer feature', 'inspect the next layer'],
          ['the final decision', 'output', 'read the label']
        ],
        widget: 'tiny-trainer',
        lab: {
          title: 'One layer against two',
          tryText: 'Set one hidden layer, then two. Compare the smallest number of units that separates the ring.',
          notice: 'Depth buys composition. The same job with one layer needs many more units.'
        }
      },
      idea: `<p>Depth lets a network build features from features. The first layer detects simple patterns, the second combines them into parts, and later layers combine parts into objects. This composition is why deep networks need fewer units than a shallow network for the same function.</p>
<p>The theoretical statement is that a shallow network can approximate any continuous function given enough units. The practical statement is that the number of units may be enormous, and the data needed to fit them larger still. Depth is a way to share structure.</p>
<p>Depth also makes training harder. Gradients must travel further, so residual connections, careful initialisation and normalisation are standard. Without them, the extra layers hurt rather than help.</p>`,
      lecture: {
        ref: '5.4',
        source: 'Transcript, Optimization',
        text: 'The lecturer connects depth to composition. "Each layer can build on the features from the layer before. That is why deep networks can represent complex functions with fewer units."'
      },
      mechanics: {
        formula: 'f(x) = g₃(W₃ g₂(W₂ g₁(W₁x)))',
        symbols: [
          ['g', 'the activation at each layer'],
          ['W', 'the weight matrix of each layer'],
          ['x', 'the input'],
          ['f(x)', 'the composed function']
        ],
        worked: 'A ring boundary can be written as a combination of four half-plane tests. A shallow network needs many units to approximate the curve directly. A two-layer network can compute the four tests and combine them, which uses fewer parameters and generalises from fewer examples.'
      },
      mechanism: {
        widget: 'tiny-trainer',
        lab: {
          title: 'Depth against width',
          tryText: 'Match the parameter count with one wide layer and with two narrow layers. Compare the boundaries.',
          notice: 'Same number of weights, different composition. Depth can express the pattern with less data.'
        }
      },
      breaks: 'Depth is not free. Deeper networks are slower, harder to train and easier to overfit on small datasets. For tabular data with a few hundred rows, a tree or a linear model often beats a deep network. Depth helps when the data has compositional structure and enough examples to learn it.',
      check: [
        {
          q: 'What does depth let a network do that width alone does not?',
          options: ['Use fewer parameters to compose features', 'Avoid backpropagation', 'Guarantee generalisation', 'Remove the need for data'],
          answer: 0,
          explain: 'Depth composes features across layers, which can represent some functions with far fewer parameters.'
        },
        {
          q: 'Why do deep networks need residual connections?',
          options: ['To add non-linearity', 'To let gradients travel through many layers', 'To reduce the number of classes', 'To remove the loss'],
          answer: 1,
          explain: 'Residual paths give the gradient a short route back, which limits vanishing in deep stacks.'
        }
      ],
      connection: {
        prompt: 'Depth and kernel methods both build complex boundaries. What is the difference in how they do it?',
        a: 'Depth', b: 'Fixed kernel',
        options: [
          { label: 'Depth learns the features; a kernel fixes them in advance', ok: true },
          { label: 'A kernel learns the features', ok: false },
          { label: 'Both fix the features', ok: false },
          { label: 'Depth cannot learn features', ok: false }
        ],
        explain: 'A kernel measures similarity in a fixed space. A deep network learns the representation used for the final decision.'
      },
      recap: [
        'Depth composes simple features into complex ones.',
        'Shallow networks can approximate, but may need impractically many units.',
        'Deep training needs residual paths and careful initialisation.'
      ],
      now: 'You can now say when depth helps and when a simpler model is the better choice.'
    }
  ],
  test: [
    {
      q: 'What is the output of a neuron with a sigmoid activation?',
      options: ['Any real number', 'A probability between 0 and 1', 'A class label', 'A gradient'],
      answer: 1,
      explain: 'The sigmoid bounds the output in the interval from 0 to 1.'
    },
    {
      q: 'What does a hidden layer read?',
      options: ['The raw input each time', 'The previous layer activations', 'The labels', 'The test set'],
      answer: 1,
      explain: 'Layers form a chain, so each layer reads the output of the one before.'
    },
    {
      q: 'Without non-linear activations, a deep stack is equivalent to what?',
      options: ['A single linear map', 'A decision tree', 'A constraint solver', 'A probability table'],
      answer: 0,
      explain: 'Composing linear functions gives a linear function.'
    },
    {
      q: 'What does backpropagation compute?',
      options: ['The loss', 'The gradient for every weight', 'The learning rate', 'The validation score'],
      answer: 1,
      explain: 'It applies the chain rule backward to obtain all weight gradients.'
    },
    {
      q: 'What is one pass over the training set called?',
      options: ['A batch', 'An epoch', 'A fold', 'A layer'],
      answer: 1,
      explain: 'An epoch is one full pass over the training data.'
    },
    {
      q: 'Training loss falls while validation loss rises. What should you try?',
      options: ['More capacity', 'Regularisation or more data', 'A larger learning rate', 'More epochs'],
      answer: 1,
      explain: 'The gap is overfitting. Regularisation and data reduce variance.'
    },
    {
      q: 'Why does depth help on compositional data?',
      options: ['It avoids gradients', 'It reuses simple features to build complex ones', 'It needs no labels', 'It removes overfitting'],
      answer: 1,
      explain: 'Each layer can compose the features from the layer before, which shares structure.'
    },
    {
      q: 'A network with a huge learning rate shows a loss that grows. What is the cause?',
      options: ['Overfitting', 'Divergence from overshooting', 'Too little data', 'Too many classes'],
      answer: 1,
      explain: 'Steps larger than the stability limit move away from the minimum.'
    }
,
    {
      type: 'numeric',
      q: 'A network has 3 inputs, one hidden layer of 4 neurons and 1 output. Counting weights only, with no biases, how many weights does it have?',
      answer: 16,
      tolerance: 0.001,
      explain: 'The input to hidden layer needs 3 x 4 = 12 weights. The hidden to output layer needs 4 x 1 = 4. The total is 16.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of a forward pass.',
      items: [
        'Read the input features',
        'Compute the weighted sum at each hidden neuron',
        'Apply the activation',
        'Pass the hidden activations to the output layer',
        'Compare the output with the target to get the loss'
      ],
      explain: 'Each layer turns the previous activations into a new set. The loss comes after the last layer.'
    },
    {
      type: 'error',
      q: 'A team writes the training loop for a network. One step is wrong. Which one?',
      steps: [
        'Run the forward pass and store each activation.',
        'Compute the loss at the output.',
        'Add the learning rate times each gradient to its weight.',
        'Send the error backwards to compute earlier gradients.'
      ],
      answer: 2,
      explain: 'The update subtracts the scaled gradient. Adding it moves uphill and increases the loss.'
    },
    {
      type: 'short',
      q: 'Why does a deep stack of linear layers collapse into a single linear map?',
      rubric: [
        'States that a composition of linear functions is linear',
        'Mentions the role of a non-linear activation',
        'Explains that depth adds capacity only with non-linearity'
      ],
      model: 'Multiplying by one weight matrix and then another is still multiplication by a single matrix. Without a non-linear activation between layers, depth adds no new functions. The activation is what lets a deep stack represent curved, compositional patterns.',
      explain: 'Depth is useful because activations break the collapse.'
    }
  ],
  connections: [
    {
      prompt: 'Link the stage to its computation.',
      a: 'Stage', b: 'Computation',
      options: [
        { label: 'Forward pass computes activations', ok: true },
        { label: 'Backward pass computes activations', ok: false },
        { label: 'Forward pass computes weight gradients', ok: false },
        { label: 'Backward pass computes the input image', ok: false }
      ],
      explain: 'Forward computes activations, backward computes gradients from the stored activations.'
    }
  ],
  pairs: [
    {
      a: 'The forward pass', b: 'Backpropagation',
      claim: 'Both move through the network one layer at a time.',
      same: true,
      explain: 'One carries activations forward, the other carries gradients backward.'
    },
    {
      a: 'An epoch', b: 'A step',
      claim: 'Both process the whole training set once.',
      same: false,
      explain: 'An epoch is one full pass. A step is one update, which may use a batch or a single case.'
    },
    {
      a: 'A hidden layer', b: 'The output layer',
      claim: 'Both apply weights and an activation.',
      same: true,
      explain: 'The output layer is a layer too. Its activation is chosen for the task, such as sigmoid for a probability.'
    }
  ],
  map: {
    nodes: [
      { id: 'neuron', label: 'Neuron', x: 12, y: 26 },
      { id: 'layer', label: 'Layer', x: 34, y: 18 },
      { id: 'forward', label: 'Forward pass', x: 54, y: 28 },
      { id: 'loss', label: 'Loss', x: 76, y: 18 },
      { id: 'back', label: 'Backprop', x: 66, y: 62 },
      { id: 'update', label: 'Update', x: 38, y: 70 }
    ],
    edges: [
      ['neuron', 'layer', 'stacked into'],
      ['layer', 'forward', 'evaluated by'],
      ['forward', 'loss', 'produces'],
      ['loss', 'back', 'differentiated by'],
      ['back', 'update', 'feeds the optimiser']
    ]
  }
});
