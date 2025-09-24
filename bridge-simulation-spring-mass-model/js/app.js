"use strict"; // Enforce strict mode

document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");

  // Wait for all external dependencies to load
  waitForDependencies().then(() => {
    initializeSimulation();
  }).catch((error) => {
    console.error("Failed to initialize simulation:", error);
    // Retry after a short delay
    setTimeout(() => {
      initializeSimulation();
    }, 1000);
  });
});

function waitForDependencies() {
  return new Promise((resolve, reject) => {
    const checkDependencies = () => {
      if (typeof Isomer !== 'undefined' && 
          typeof katex !== 'undefined' && 
          document.getElementById('art')) {
        resolve();
      } else {
        setTimeout(checkDependencies, 100);
      }
    };
    
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error("Dependencies not loaded")), 10000);
    checkDependencies();
  });
}

function initializeSimulation() {
  resizeCanvas();
  
  // Update canvas size whenever the window is resized
  window.addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    const canvas = document.getElementById('art');
    if (canvas) {
      // Use inner dimensions and ensure reasonable size
      canvas.width = Math.max(window.innerWidth * 0.9, 800);
      canvas.height = Math.max(window.innerHeight * 0.6, 600);
    }
  }

  function initializeMatrix(m, n) {
    return Array.from({ length: m }, () => Array(n).fill(0));
  }

  function multiplyMatrixByScalar(matrix, number) {
    return matrix.map(row => row.map(value => value * number));
  }

  function addMatrices(matrix1, matrix2) {
    // Check if the matrices have the same dimensions
    if (matrix1.length !== matrix2.length || matrix1[0].length !== matrix2[0].length) {
      throw new Error('Matrices have different dimensions and cannot be added');
    }

    // Add the matrices element-wise
    return matrix1.map((row, i) =>
      row.map((value, j) => value + matrix2[i][j])
    );
  }

  function adjustMatrix(matrix, decimalIndex) {
    const adjustmentValues = [1, 10, 100, 1000, 10000];
    const factor = adjustmentValues[decimalIndex];

    if (factor === undefined) {
      throw new Error("Invalid decimal index");
    }

    return matrix.map(row =>
      row.map(value => Math.round(value * factor) / factor)
    );
  }

  function printMatrix(matrix, name = "Matrix") {
    let output = `${name}:\n`;
    for (let i = 0; i < matrix.length; i++) {
      let row = "";
      for (let j = 0; j < matrix[i].length; j++) {
        row += matrix[i][j].toFixed(2) + "\t"; // Format to two decimal places
      }
      output += row + "\n"; // Add a newline after each row
    }
    console.log(output);
  }

  function f(t, x) {
    //console.log('t = ' + t);
    //printMatrix(x, 'x');

    let m = x.length;
    let n = x[0].length / 2;

    let y = initializeMatrix(x.length, x[0].length);
    //printMatrix(y, 'y');

    // Process for dz/dt
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (i === 0 || i === m - 1) {
          /*
          This is a boundary condition, meaning the boundary values do not change over time.
          The velocity is defined as the rate of change of displacement.
          This condition ensures that the velocity at the edges of the bridge is zero: The end plates don't vibrate.
           */
          y[i][j] = 0;
        } else {
          y[i][j] = x[i][j + n];
        }
      }
    }

    //printMatrix(y, 'dz/dt');

    let d = 0;           // Damping factor (could represent damping in the system, if needed)
    let k = 40;          // Spring constant
    let dx = 25;         // Plate separation in the x-direction
    let dy = 25;         // Plate separation in the y-direction
    let Lo = 0.7;        // Rest length of the spring
    let beta = 80.0;     // Air friction coefficient
    let plateMass = 5.0; // Mass of the plates
    let g = 9.8;         // Gravitational acceleration

    // Process for d2z/dt2
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        d = 0;

        if (i > 0) {
          d = d + k * (Math.sqrt(Math.pow(dy, 2) + Math.pow(x[i][j] - x[i - 1][j], 2)) - Lo) * Math.sign(x[i - 1][j] - x[i][j]); // top
        }
        if (i < (m - 1)) {
          d = d + k * (Math.sqrt(Math.pow(dy, 2) + Math.pow(x[i][j] - x[i + 1][j], 2)) - Lo) * Math.sign(x[i + 1][j] - x[i][j]); // bottom
        }
        if (j > 0) {
          d = d + k * (Math.sqrt(Math.pow(dx, 2) + Math.pow(x[i][j] - x[i][j - 1], 2)) - Lo) * Math.sign(x[i][j - 1] - x[i][j]); // left
        }
        if (j < (n - 1)) {
          d = d + k * (Math.sqrt(Math.pow(dx, 2) + Math.pow(x[i][j] - x[i][j + 1], 2)) - Lo) * Math.sign(x[i][j + 1] - x[i][j]); // right
        }

        d = d - beta * x[i][j + n];
        d = d - plateMass * g;
        d = d / plateMass;

        if (i === 0 || i === m - 1) {
          /*
          This is a boundary condition, meaning the boundary values do not change over time.
          The velocity is defined as the rate of change of displacement.
          This condition ensures that the velocity at the edges of the bridge is zero: The end plates don't vibrate.
           */
          y[i][j + n] = 0;
        } else {
          y[i][j + n] = d;
        }
      }
    }

    //printMatrix(y, 'd2z/dt2');

    return y;
  }

  function drawPlates(m, n, matrix) {
    try {
      const canvas = document.getElementById("art");
      if (!canvas) {
        console.error("Canvas element not found");
        return;
      }

      let iso = new Isomer(canvas);
      if (!iso || !iso.canvas) {
        console.error("Failed to initialize Isomer");
        return;
      }

      iso.canvas.clear();

      let Point = Isomer.Point;
      let Shape = Isomer.Shape;

      let plateWidth = 1;
      let plateHeight = 1;
      let plateThickness = 0.2;

      for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
          let x = i * (plateWidth);
          let y = j * (plateHeight);
          iso.add(Shape.Prism(Point(x, y, matrix[i][j]), plateWidth, plateHeight, plateThickness));
        }
      }
    } catch (error) {
      console.error("Error drawing plates:", error);
    }
  }

  /**
   * Allows running the simulation
   *
   * @param f The function
   * @param t The initial time
   * @param tMax The max time
   * @param m The number of rows
   * @param n The number of columns
   * @param h The step size
   * @param interval The interval between each iteration
   */
  function runSimulation(f, t, tMax, m, n, h = 0.05, interval = 50) {
    let timeoutId;
    /*
    The first half of the matrix will keep the plates positions, the second half will keep their speed.
     */
    let x = initializeMatrix(m, 2 * n);

    function step() {
      if (t < tMax) {
        let k1 = f(t, x);
        let k2 = f(t + h / 2, addMatrices(x, multiplyMatrixByScalar(k1, h * 0.5)));
        let k3 = f(t + h / 2, addMatrices(x, multiplyMatrixByScalar(k2, h * 0.5)));
        let k4 = f(t + h, addMatrices(x, multiplyMatrixByScalar(k3, h)));

        //printMatrix(k1, 'k1');
        //printMatrix(k2, 'k2');
        //printMatrix(k3, 'k3');
        //printMatrix(k4, 'k4');

        x = addMatrices(x, multiplyMatrixByScalar(k1, h / 6));
        x = addMatrices(x, multiplyMatrixByScalar(k2, 2 * h / 6));
        x = addMatrices(x, multiplyMatrixByScalar(k3, 2 * h / 6));
        x = addMatrices(x, multiplyMatrixByScalar(k4, h / 6));

        const adjustedMatrix = adjustMatrix(x, 2);
        printMatrix(adjustedMatrix, 'adjustedMatrix');

        drawPlates(m, n, x);

        t += h; // Increment t by h

        timeoutId = setTimeout(step, interval); // Schedule the next step
      } else {
        clearTimeout(timeoutId); // Ensure timeout is cleared (optional but safe)
      }
    }

    step(); // Start the simulation
  }

  function renderEquations() {
    const equationHooke = "F = -k \\cdot x";
    const equationLength = "x = L - L_0";

    katex.render(equationHooke, document.getElementById("equation_hooke"));
    katex.render(equationLength, document.getElementById("equation_length"));

    const equation1 = "L^2 = L_0^2 + \\Delta z^2";
    katex.render(equation1, document.getElementById("equation1"));

    const equation2 = "L = \\sqrt{L_0^2 + \\Delta z^2}";
    katex.render(equation2, document.getElementById("equation2"));

    const equation3 = "L = \\sqrt{\\Delta x^2 + \\Delta z^2}";
    katex.render(equation3, document.getElementById("equation3"));

    const equation4 = "L = \\sqrt{\\Delta x^2 + \\left( z_{i \\pm 1, j \\pm 1} - z_{i, j} \\right)^2}\n";
    katex.render(equation4, document.getElementById("equation4"));

    const equation5 = "F = -k \\cdot x\n";
    katex.render(equation5, document.getElementById("equation5"));

    const equation6 = "F = m \\cdot a\n" + ", \\quad a = \\frac{d^2x}{dt^2}\n" + ", \\quad F = m \\cdot \\frac{d^2x}{dt^2}\n";
    katex.render(equation6, document.getElementById("equation6"));

    const equation7 = "- k \\cdot x = m \\cdot \\frac{d^2x}{dt^2}\n";
    katex.render(equation7, document.getElementById("equation7"));

    katex.render("L", document.getElementById("stretchedLength"));
    katex.render("L_0", document.getElementById("restingLength"));

    const equation8 = "F = -k \\cdot x, \\quad F = -k \\cdot (L - L_0)";
    katex.render(equation8, document.getElementById("equation8"));

    const equation9 = "\\sum F = k \\cdot (L - L_0) \\cdot \\operatorname{sign} \\left( (x_i + \\Delta x, y, z_i \\pm \\Delta z) - (x_i, y, z_i) \\right) - K_f \\cdot \\frac{d z}{dt} = m \\cdot \\frac{d^2 z}{dt^2}\n";
    katex.render(equation9, document.getElementById("equation9"));

    const equation10 = "\\sum F = k \\cdot (\\sqrt{\\Delta x^2 + \\left( z_{i \\pm 1, j \\pm 1} - z_{i, j} \\right)^2}\n - L_0) \\cdot \\operatorname{sign} \\left( (x_i + \\Delta x, y, z_i \\pm \\Delta z) - (x_i, y, z_i) \\right) - K_f \\cdot \\frac{d z}{dt} = m \\cdot \\frac{d^2 z}{dt^2}\n";
    katex.render(equation10, document.getElementById("equation10"));

    const equation11 = "\\sum F = \\newline k \\cdot (\\sqrt{\\Delta x^2 + \\left( z_{i - 1, j} - z_{i, j} \\right)^2}\n - L_0) \\cdot \\operatorname{sign} \\left( z_{i - 1, j} - z_{i, j} \\right) + \\newline k \\cdot (\\sqrt{\\Delta x^2 + \\left( z_{i + 1, j} - z_{i, j} \\right)^2}\n - L_0) \\cdot \\operatorname{sign} \\left( z_{i + 1, j} - z_{i, j} \\right) + \\newline k \\cdot (\\sqrt{\\Delta x^2 + \\left( z_{i, j - 1} - z_{i, j} \\right)^2}\n - L_0) \\cdot \\operatorname{sign} \\left( z_{i, j - 1} - z_{i, j} \\right) + \\newline k \\cdot (\\sqrt{\\Delta x^2 + \\left( z_{i, j + 1} - z_{i, j} \\right)^2}\n - L_0) \\cdot \\operatorname{sign} \\left( z_{i, j + 1} - z_{i, j} \\right) - \\newline K_f \\cdot \\frac{d z}{dt} = m \\cdot \\frac{d^2 z}{dt^2}\n";
    katex.render(equation11, document.getElementById("equation11"));

    const equation12 = `\\begin{aligned}y_{n+1} &= y_n + \\frac{h}{6} \\left( k_1 + 2k_2 + 2k_3 + k_4 \\right) \\\\k_1 &= f(x_n, y_n) \\\\k_2 &= f\\left( x_n + \\frac{1}{2} h, y_n + \\frac{1}{2} h k_1 \\right) \\\\k_3 &= f\\left( x_n + \\frac{1}{2} h, y_n + \\frac{1}{2} h k_2 \\right) \\\\k_4 &= f\\left( x_n + h, y_n + h k_3 \\right)\\end{aligned}`;
    katex.render(equation12, document.getElementById("equation12"));
  }

  // Start simulation only after all dependencies are loaded
  runSimulation(
    f,
    0,
    1000,
    15,
    5,
    0.05,
    50
  );

  renderEquations();
}
