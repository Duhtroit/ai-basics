AIM.registerTeach({
  n: 5,
  opening: `<p>A neural network is a stack of small decision units. Each unit computes a weighted sum, adds a bias and passes the result through an activation. One unit can draw one boundary. A stack can compose boundaries into shapes that no single line can express.</p>
<p>This unit builds the network from the bottom. The first concept is the unit. The second stacks units into layers and runs the forward pass. The third derives backpropagation, which computes the gradient for every weight in roughly the cost of one forward pass. The fourth turns the gradient into a training loop. The fifth explains why depth helps and what it costs.</p>
<p>The mathematics is the chain rule from the toolkit, applied repeatedly. If that rule is shaky, review it before starting. The rest is bookkeeping about which activation feeds which weight.</p>`,
  concepts: {
    'neurons': {
      teach: `<p>A neuron computes a weighted sum of its inputs, adds a bias, and applies an activation function: <code>a = g(w · x + b)</code>. The weights say how much each input matters. A negative weight means the input votes against the unit firing. The bias shifts the threshold.</p>
<p>The activation <code>g</code> decides the shape of the output. A <strong>sigmoid</strong> squashes the sum into the interval between 0 and 1, which makes the unit a probability model. A <strong>hyperbolic tangent</strong> squashes it into the interval between -1 and 1. A <strong>rectified linear unit</strong> (ReLU) returns the sum when it is positive and zero otherwise. A <strong>linear</strong> activation returns the sum unchanged.</p>
<h4>One neuron is a familiar model</h4>
<p>With a sigmoid activation, one neuron is exactly logistic regression. With a linear activation, it is linear regression. The vocabulary changes, not the mathematics. The value of the neuron abstraction is that it can be stacked. A layer is a row of neurons reading the same input, and a network is a stack of layers.</p>
<h4>The limits of one unit</h4>
<p>One neuron draws one boundary: the set of inputs where <code>w · x + b = 0</code>. It cannot represent exclusive-or, where the positive cases are in two opposite corners and the negative cases are in the other two. No single straight line separates them. Adding a second layer lets the network build a boundary from several pieces, which is why depth matters.</p>
<div class="callout"><b>The bias is not optional</b><p>Without a bias, every boundary passes through the origin. The bias shifts the boundary so the model can fit data that is not centred.</p></div>
<p>Activations also differ in how they train. Sigmoid and tanh saturate: for large positive or negative sums, their derivative is near zero, so the gradient almost disappears. ReLU does not saturate on the positive side, which made deep networks easier to train. It can produce dead units that never activate again if the bias pushes them permanently negative.</p>`,
      work: `<ol class="steps"><li>Inputs 2 and 3, weights 0.5 and -1, bias 1.</li><li>The weighted sum is <code>0.5 × 2 + (-1) × 3 + 1 = 1 + (-3) + 1 = -1</code>.</li><li>With a sigmoid, <code>σ(-1) = 0.269</code>.</li><li>With ReLU, the output is 0, because the sum is negative.</li><li>With a linear activation, the output is -1. The same weights produce different behaviour because the activation differs.</li></ol>`,
      practice: {
        q: 'A single neuron with a sigmoid activation is trained on a dataset where the positive class surrounds the negative class in a ring. Can it separate the classes? Why or why not?',
        hint: 'A single neuron draws one linear boundary. A ring needs more than one line.',
        answer: `<p>No. The boundary is a single line (or hyperplane), and a ring-shaped positive class cannot be separated from a central negative class by one line. The neuron can only put all points on one side of a line into one class. A hidden layer with several neurons can approximate the ring by combining multiple boundaries.</p>`
      },
      bridge: 'One unit draws one boundary. A layer of units produces several, and the next layer combines them.'
    },
    'forward-pass': {
      teach: `<p>A layer is a set of neurons that read the same input. If the input has <code>n</code> values and the layer has <code>m</code> neurons, the weights form an <code>m × n</code> matrix. The layer computes <code>a = g(W x + b)</code>, where <code>W x</code> is a matrix-vector product, <code>b</code> is a vector of biases, and <code>g</code> applies element by element.</p>
<p>A network stacks layers. The forward pass computes each layer in order, feeding the output of one into the next: <code>a⁽¹⁾ = g(W⁽¹⁾ x + b⁽¹⁾)</code>, <code>a⁽²⁾ = g(W⁽²⁾ a⁽¹⁾ + b⁽²⁾)</code>, and so on. The final layer produces the prediction. The same computation runs at training time and at inference.</p>
<h4>Why the activation between layers matters</h4>
<p>If every layer is linear, the composition is linear. Two linear maps compose into one linear map, so a hundred linear layers are no more expressive than one. A non-linear activation between layers breaks that collapse. The network can then represent curved boundaries and interactions between features.</p>
<p>The final layer matches the task. A binary classifier uses one sigmoid output. A multiclass classifier uses a softmax over <code>k</code> outputs, which turns a vector of scores into probabilities that sum to 1. A regression uses a linear output, or a positive activation when the target cannot be negative.</p>
<h4>Shapes and bookkeeping</h4>
<p>Track the shapes. An input of length 3 into a layer of 4 neurons produces a weight matrix of shape 4 by 3, a bias of length 4, and an output of length 4. The next layer reads length 4 and might produce length 2. Most shape errors in network code come from a mismatch at one of these boundaries. Writing the shapes beside each layer catches them before training starts.</p>
<div class="callout"><b>Forward pass is inference</b><p>The forward pass is not a training-only step. It is the computation the deployed model runs. Training adds a backward pass on top of it.</p></div>`,
      work: `<ol class="steps"><li>Input <code>(1, 2)</code>. Hidden layer weights <code>(1, -1)</code> and <code>(0.5, 0.5)</code>, biases zero, ReLU.</li><li>First hidden unit: <code>1 - 2 = -1</code>, ReLU gives 0.</li><li>Second hidden unit: <code>0.5 + 1 = 1.5</code>, ReLU gives 1.5.</li><li>The hidden output is <code>(0, 1.5)</code>.</li><li>An output layer with weights <code>(2, -1)</code> and bias 0 gives <code>2 × 0 + (-1) × 1.5 = -1.5</code>. The network has transformed the input into a new representation before predicting.</li></ol>`,
      practice: {
        q: 'A network has three hidden layers, all with linear activations. How many effective parameters does the depth add compared with a single linear layer?',
        hint: 'A composition of linear functions is linear.',
        answer: `<p>It adds no expressive power beyond a single linear map. The composition of linear functions is another linear function, so the three layers can be collapsed into one matrix. The depth changes the parameterisation and the optimisation landscape, but not the set of functions the network can represent. Non-linear activations are what make depth useful.</p>`
      },
      bridge: 'The forward pass produces a prediction. Backpropagation compares it with the label and computes how every weight contributed to the error.'
    },
    'backprop': {
      teach: `<p>Backpropagation computes the gradient of the loss with respect to every weight. It applies the chain rule from the output layer backward. The cost is roughly the same as one forward pass, which is why a network with millions of weights can be trained at all.</p>
<p>Start at the output. For a sigmoid output with log loss, the derivative of the loss with respect to the score <code>z</code> is <code>a - y</code>, where <code>a</code> is the predicted probability and <code>y</code> is the label. That simple term is the error signal. It flows backward through each layer.</p>
<h4>The chain rule in one layer</h4>
<p>For a weight <code>w</code> feeding an output with activation <code>a = g(z)</code> and <code>z = w h + b</code>, the gradient is <code>∂L/∂w = (∂L/∂z) (∂z/∂w) = (a - y) h</code>. The weight's gradient is the error signal times the input that fed it. For a hidden layer, the error signal is the sum of the signals from all the units it feeds, each multiplied by the weight on the connection. Then it is multiplied by the derivative of the hidden activation.</p>
<div class="derive"><p>Output delta: <code>δ = a - y</code>.</p><p>Hidden delta: <code>δ_h = (Σ w δ) g'(z_h)</code>.</p><p>Weight gradient: <code>∂L/∂w = δ × input</code>.</p></div>
<p>In matrix form, the backward pass multiplies by the transpose of each weight matrix. That is why the shapes mirror the forward pass. The activations from the forward pass are stored and reused, which is why training needs more memory than inference.</p>
<h4>What backprop does not do</h4>
<p>It computes the direction of steepest increase for each weight. It does not choose the step size, the batch size or the number of epochs. Those belong to the optimiser and the training loop. It also requires differentiable operations. A hard threshold or an argmax blocks the gradient, which is why discrete choices are often replaced by soft approximations during training.</p>
<div class="callout"><b>Vanishing and exploding gradients</b><p>Each layer multiplies the signal by a derivative. If the derivatives are consistently below 1, the signal shrinks to zero; if they are above 1, it grows. Careful initialisation, ReLU and residual connections keep the signal in a workable range.</p></div>`,
      work: `<ol class="steps"><li>Output <code>a = 0.2</code>, target <code>y = 1</code>. The output delta is <code>a - y = -0.8</code>.</li><li>The hidden activation feeding the output weight is <code>h = 0.5</code>.</li><li>The gradient for that weight is <code>-0.8 × 0.5 = -0.4</code>.</li><li>Gradient descent updates the weight by <code>-η × (-0.4) = +0.4η</code>, so the weight increases.</li><li>The increase raises the output score, which raises the predicted probability toward the target.</li></ol>`,
      practice: {
        q: 'Why does backpropagation cost about the same as a forward pass, rather than one pass per weight?',
        hint: 'Each layer reuses the error signal from the layers after it.',
        answer: `<p>The backward pass computes each layer's error signal once and reuses it for every weight in that layer. The work per layer is proportional to the number of weights, just like the forward pass, so the total is the same order. Computing each weight's gradient independently would repeat the same chain of derivatives for every weight.</p>`
      },
      bridge: 'The gradient is one ingredient. The training loop adds batching, updates, schedules and a way to read the curves.'
    },
    'training-network': {
      teach: `<p>Training repeats a loop. Take a batch of cases, run the forward pass, compute the loss, run backpropagation, and update every weight. One <strong>epoch</strong> is one pass over the training set. The loop continues for a chosen number of epochs or until validation loss stops improving.</p>
<p>The batch size trades noise for cost. A small batch gives a noisy gradient that is cheap to compute and can help escape shallow regions. A large batch gives a stable gradient that uses more memory. The learning rate controls the step. A schedule lowers it over time: larger steps early to move quickly, smaller steps late to settle.</p>
<h4>Momentum and adaptive methods</h4>
<p>Momentum accumulates past gradients into a velocity. In a long narrow valley, the gradients across the valley cancel while the gradients along it add up, so momentum moves faster in the useful direction. Adaptive methods such as Adam scale the step per parameter based on recent gradients. They reduce the need to tune one global rate, but they add their own settings and can generalise differently.</p>
<h4>Reading the curves</h4>
<p>Watch training loss and validation loss together. Both falling means the model is learning. Training falling while validation rises means overfitting. Both flat and high means the model or the features are too weak. A loss that jumps or becomes NaN usually points to a learning rate that is too high or a numerical instability.</p>
<div class="callout"><b>One epoch is not one update</b><p>With batches, an epoch contains many updates. A dataset of 1,000 cases with batches of 32 has about 32 updates per epoch.</p></div>
<p>Initialisation matters. All-zero weights make every hidden unit identical, so the network cannot break symmetry. Random initialisation with a scale suited to the activation keeps the signal from vanishing or exploding. The training loop is where all the earlier ideas meet: the loss, the gradient, the learning rate and the validation split.</p>`,
      work: `<ol class="steps"><li>1,000 training cases, batch size 32.</li><li>One epoch has about <code>1,000 / 32 = 31.25</code>, so 32 updates if the last partial batch is kept.</li><li>Train for 10 epochs: about 320 updates.</li><li>Suppose training loss falls from 2.3 to 0.4 while validation stays at 1.1. The model is fitting the training set and not generalising.</li><li>Try regularisation, early stopping or more data before adding capacity.</li></ol>`,
      practice: {
        q: 'A network trains for 200 epochs. Training loss keeps falling, validation loss rises after epoch 40. What is happening, and what would you do?',
        hint: 'The gap between the two curves is the signal.',
        answer: `<p>The network is overfitting. It continues to fit the training sample while getting worse on unseen cases. Stop around the epoch where validation loss was lowest, add regularisation, or get more data. Training longer will only widen the gap.</p>`
      },
      bridge: 'A shallow network can approximate a curve, but it may need an impractical number of units. Depth composes features and often does more with fewer parameters.'
    },
    'depth': {
      teach: `<p>Depth lets a network build features from features. The first layer detects simple patterns, the second combines them into parts, and later layers combine parts into objects. This composition is why a deep network can represent a complex function with fewer units than a shallow network needs.</p>
<p>The theoretical statement is that a shallow network with enough hidden units can approximate any continuous function on a bounded region. The practical statement is that the number of units may be enormous, and the data needed to fit them even larger. Depth is a way to share structure. A ring boundary, for example, can be built from a few half-plane tests and a combination, while a shallow network may need many units to approximate the curve directly.</p>
<h4>Why depth is hard to train</h4>
<p>Gradients must travel through every layer. If each layer multiplies the signal by a derivative below 1, the gradient shrinks toward zero; if above 1, it explodes. Residual connections add the input of a block to its output, which gives the gradient a short path back. Careful initialisation and normalisation keep the activations in a stable range. Without these, extra layers can hurt.</p>
<p>Depth also costs time and memory. Inference is slower, and training stores activations for the backward pass. A deeper model is not automatically better. On small tabular datasets, a tree or a linear model often wins. Depth helps when the data has compositional structure and enough examples to learn it.</p>
<div class="callout"><b>Depth is a prior</b><p>Choosing a deep network is a claim that the pattern is compositional. If that claim is false, the depth adds parameters without adding useful structure.</p></div>
<p>The next unit leaves neural networks and builds a different kind of model: a tree that asks a sequence of questions. The contrast is useful. A tree is shallow, interpretable and unstable; a network is deep, flexible and opaque. Both are reflex models in the Unit 1 sense.</p>`,
      work: `<ol class="steps"><li>A ring boundary can be described by four half-plane tests, one for each side of the ring.</li><li>A shallow network can approximate the ring directly, but it may need many units to fit the curve.</li><li>A two-layer network can compute the four tests in the first layer and combine them in the second.</li><li>The second layer uses fewer parameters because it reuses the simple tests.</li><li>The gain comes from composition, not from the number of layers alone.</li></ol>`,
      practice: {
        q: 'A team has 400 rows of tabular data and replaces logistic regression with a 20-layer network. Validation performance gets worse. Give two plausible reasons.',
        hint: 'Think about data size and the inductive bias of depth.',
        answer: `<p>The dataset is small for a deep network, so the model has too many parameters relative to the evidence and overfits. The pattern may also not be compositional, so depth adds flexibility without matching the structure. A shallower model or a tree is likely to be a better prior for 400 rows.</p>`
      },
      bridge: 'Unit 6 builds trees, a model family that is shallow by design and readable by a person.'
    }
  },
  closing: {
    teach: `<p>A network is a composition of weighted sums and non-linear activations. The forward pass computes the prediction. Backpropagation applies the chain rule to compute every weight's gradient at about the cost of the forward pass. The training loop batches the data, updates the weights and watches the validation curve. Depth helps when the pattern is compositional and the data can support it.</p>
<p>The pieces are the same as in Units 3 and 4, only repeated. A loss matches the output, a gradient points downhill, a learning rate chooses the step, and a validation set decides when to stop. The network adds representational power and takes away easy interpretation. Unit 6 explores the opposite trade.</p>`,
    problem: {
      q: 'A network has a sigmoid output, log loss and a hidden layer. The output is 0.2 for a positive case. The hidden activation feeding the output weight is 0.5. Compute the output delta, the gradient for that weight, and the direction of the update with learning rate 0.1.',
      hint: 'For sigmoid plus log loss, the output delta is a minus y.',
      answer: `<p>The delta is <code>0.2 - 1 = -0.8</code>. The gradient for the weight is <code>-0.8 × 0.5 = -0.4</code>. The update is <code>w ← w - 0.1 × (-0.4) = w + 0.04</code>, so the weight increases by 0.04. That raises the score and the predicted probability toward the target.</p>`
    }
  }
});
