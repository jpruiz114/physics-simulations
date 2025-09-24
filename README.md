# Physics Simulations

An interactive physics simulation built from scratch to demonstrate fundamental concepts in physics, numerical methods, and computational modeling.

**By Jean Paul Ruiz - March 3, 2025**

**[View Live Project →](https://jeanpaulruizvallejo.com/physics-simulations/)**

## Purpose

Why build your own simulations in the age of AI and advanced tools?

- **Deep Understanding**: Custom code increases your knowledge of physics, numerical methods, and computational modeling beyond what abstracted software provides
- **Freedom to Experiment**: Unlike commercial software with predefined models, custom simulations allow unlimited experimentation with parameters, algorithms, and optimizations
- **AI Integration**: Provides controlled environments for testing AI-driven optimizations and generating training data
- **Performance**: Well-optimized custom simulations can be faster and more adaptable than heavy, expensive solutions
- **Personal Growth**: The rewarding challenge of building something yourself and seeing if you can make it happen

## Current Simulation

### Bridge Simulation Using a Spring-Mass Model

An interactive simulation that models a bridge as a series of interconnected plates linked by springs, following Hooke's Law principles.

**Features:**
- **Physics Implementation**: Spring-mass system with damping and gravitational forces
- **Numerical Methods**: Runge-Kutta 4th order method for solving differential equations
- **3D Visualization**: Real-time isometric rendering using Isomer.js
- **Mathematical Documentation**: Comprehensive equations rendered with KaTeX
- **Interactive Canvas**: Live simulation showing bridge behavior under various conditions

**Key Concepts Demonstrated:**
- Hooke's Law: `F = -k·x`
- Spring force calculations with variable displacement
- Newton's second law of motion
- Boundary conditions for structural stability
- Air friction and damping effects
- Matrix operations for multi-plate systems

**Technical Implementation:**
- Each plate has up to 4 neighbors (corner plates: 2, border plates: 3, middle plates: 4)
- Real-time force calculation between connected plates
- Boundary conditions ensure edge plates don't vibrate
- Adjustable parameters: spring constant, damping, mass, gravity

[**View Live Demo →**](https://jeanpaulruizvallejo.com/physics-simulations/bridge-simulation-spring-mass-model/)

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build System**: Webpack with development and production configurations
- **3D Graphics**: [Isomer.js](https://github.com/jdan/isomer) for isometric projections
- **Mathematics**: [KaTeX](https://github.com/KaTeX/KaTeX) for equation rendering
- **Code Examples**: GitHub Gists integration for educational content

## Getting Started

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jpruiz114/physics-simulations.git
cd physics-simulations
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to `http://localhost:8080`

### Build for Production

```bash
npm run build
```

## Mathematical Background

The bridge simulation implements several key mathematical concepts:

### Spring Force Calculation
The force between connected plates uses the extended Hooke's Law:
```
F = k × (L - L₀) × sign(displacement)
```
Where:
- `L = √(Δx² + (z_{i±1,j±1} - z_{i,j})²)` (current spring length)
- `L₀` is the natural spring length
- `k` is the spring constant

### Differential Equation System
For each plate with 4 neighbors, the equation becomes:
```
ΣF = k×(√(Δx² + (z_{i-1,j} - z_{i,j})²) - L₀)×sign(z_{i-1,j} - z_{i,j}) + 
     k×(√(Δx² + (z_{i+1,j} - z_{i,j})²) - L₀)×sign(z_{i+1,j} - z_{i,j}) + 
     k×(√(Δx² + (z_{i,j-1} - z_{i,j})²) - L₀)×sign(z_{i,j-1} - z_{i,j}) + 
     k×(√(Δx² + (z_{i,j+1} - z_{i,j})²) - L₀)×sign(z_{i,j+1} - z_{i,j}) - 
     K_f×(dz/dt) = m×(d²z/dt²)
```

### Numerical Solution
The system is solved using the Runge-Kutta 4th order method:
```
y_{n+1} = y_n + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)
```

## Simulation Controls

### Bridge Simulation Parameters
- **Spring Constant (k)**: `40` - Controls stiffness of connections
- **Damping (β)**: `80.0` - Air friction coefficient
- **Plate Mass**: `5.0` - Mass of each bridge plate
- **Grid Size**: `15×5` plates
- **Time Step**: `0.05` seconds
- **Animation Interval**: `50ms`

## Learning Resources

### Hand-Worked Solutions
The project includes hand-written mathematical derivations:
- [Page 1](https://jeanpaulruizvallejo.com/physics-simulations/bridge-simulation-spring-mass-model/img/page-1.jpg) - Basic force analysis
- [Page 2](https://jeanpaulruizvallejo.com/physics-simulations/bridge-simulation-spring-mass-model/img/page-2.jpg) - Equation development  
- [Page 3](https://jeanpaulruizvallejo.com/physics-simulations/bridge-simulation-spring-mass-model/img/page-3.jpg) - Complete solution

### Code Examples
Embedded GitHub Gists demonstrate:
- Matrix initialization and operations
- Spring force calculations
- Runge-Kutta implementation
- 3D rendering with Isomer.js

## Project Structure

```
physics-simulations/
├── index.html                    # Main landing page
├── bridge-simulation-spring-mass-model/
│   ├── index.html               # Bridge simulation page
│   ├── js/app.js               # Main simulation logic
│   ├── css/                    # Styling
│   └── img/                    # Documentation images
├── js/                         # Shared JavaScript
├── css/                        # Global styles
└── webpack.*.js               # Build configurations
```

## Acknowledgments

Special thanks to the creators of:
- [**Isomer.js**](https://github.com/jdan/isomer) - Making isometric projections accessible
- [**KaTeX**](https://github.com/KaTeX/KaTeX) - Beautiful mathematical rendering in HTML
- [**GitHub Gists Dark Theme**](https://codersblock.com/blog/customizing-github-gists/) - Enhanced code presentation

## Comparison with Professional Tools

While professional solutions like [SOFiSTiK Rhinoceros Interface](https://docs.sofistik.com/2023/en/rhino_interface/grasshopper/tutorials/plate-girder-bridge/plate-girder-bridge.html) offer comprehensive bridge analysis, this project focuses on:

- **Educational Value**: Understanding the underlying mathematics and implementation
- **Customization**: Complete control over parameters and algorithms  
- **Performance**: Lightweight, fast execution for specific use cases
- **Accessibility**: Open source and freely available

## Future Simulations

Planned additions to the project:
- Pendulum systems with chaotic behavior
- Fluid dynamics with particle systems
- Wave propagation and interference
- Gravitational N-body problems
- Heat transfer and diffusion

## License

This project is open source. Feel free to use, modify, and distribute according to your needs.

---

*Building simulations from scratch develops analytical skills and deepens understanding of the physical world around us.*
